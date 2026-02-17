#!/usr/bin/env python3
"""
Read Claude Code's last assistant response aloud using text-to-speech.

Reads a Claude Code transcript JSONL file, extracts the last assistant
message text (stripping code blocks), and speaks it through the best
available TTS engine on the system.

TTS engine priority (configurable via CLAUDE_TTS_ENGINE):
  1. "openai"   - OpenAI TTS API (natural, requires OPENAI_API_KEY)
  2. "piper"    - Piper neural TTS (natural, local, no API key)
  3. "say"      - macOS built-in (decent with Premium voices)
  4. "espeak"   - espeak-ng/espeak (robotic but works everywhere)

If CLAUDE_TTS_ENGINE is not set, tries each in order until one works.

Environment variables:
  CLAUDE_TTS_ENGINE     - Force a specific engine: openai, piper, say, espeak
  CLAUDE_TTS_MAX_CHARS  - Max characters to speak (default: 1000)
  OPENAI_API_KEY        - Required for OpenAI TTS engine
  CLAUDE_TTS_VOICE      - Voice name (engine-specific, see README)
  CLAUDE_TTS_RATE       - Speech rate for macOS `say` in words per minute
"""

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile


def extract_last_assistant_text(transcript_path: str) -> str:
    """Read the transcript JSONL and return the last assistant message text."""
    last_assistant = None

    with open(transcript_path, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue

            if entry.get("type") == "assistant":
                last_assistant = entry

    if not last_assistant:
        return ""

    text_parts = []
    for block in last_assistant.get("message", {}).get("content", []):
        if isinstance(block, dict) and block.get("type") == "text":
            text_parts.append(block["text"])
        elif isinstance(block, str):
            text_parts.append(block)

    return "\n".join(text_parts)


def clean_text_for_speech(text: str) -> str:
    """Strip code blocks, URLs, markdown syntax, and other non-speech content."""
    text = re.sub(r"```[\s\S]*?```", " code block omitted ", text)
    text = re.sub(r"`[^`]+`", "", text)
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"(?<!\w)[/~][\w./\-]+(?::\d+)?", "", text)
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"\*{1,3}([^*]+)\*{1,3}", r"\1", text)
    text = re.sub(r"_{1,3}([^_]+)_{1,3}", r"\1", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"^\s*[-*+]\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"\|[^\n]+\|", "", text, flags=re.MULTILINE)
    text = re.sub(r"\n{2,}", ". ", text)
    text = re.sub(r"\n", " ", text)
    text = re.sub(r"\s{2,}", " ", text)
    return text.strip()


def find_audio_player() -> list[str] | None:
    """Find an available audio player and return its command prefix."""
    players = {
        "afplay": ["afplay"],
        "mpv": ["mpv", "--no-video", "--really-quiet"],
        "ffplay": ["ffplay", "-nodisp", "-autoexit", "-loglevel", "quiet"],
        "aplay": ["aplay", "-q"],
        "paplay": ["paplay"],
    }
    for name, cmd in players.items():
        if shutil.which(name):
            return cmd
    return None


# ---------------------------------------------------------------------------
# TTS Engines
# ---------------------------------------------------------------------------


def speak_openai(text: str) -> bool:
    """Speak using OpenAI TTS API. Requires OPENAI_API_KEY."""
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return False
    if not shutil.which("curl"):
        return False

    player = find_audio_player()
    if not player:
        return False

    voice = os.environ.get("CLAUDE_TTS_VOICE", "nova")
    payload = json.dumps({
        "model": "tts-1",
        "input": text,
        "voice": voice,
        "response_format": "mp3",
    })

    tmp = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
    tmp.close()

    try:
        result = subprocess.run(
            [
                "curl", "-s",
                "https://api.openai.com/v1/audio/speech",
                "-H", f"Authorization: Bearer {api_key}",
                "-H", "Content-Type: application/json",
                "-d", payload,
                "-o", tmp.name,
            ],
            timeout=30,
            capture_output=True,
        )
        if result.returncode != 0 or os.path.getsize(tmp.name) == 0:
            os.unlink(tmp.name)
            return False

        subprocess.Popen(
            player + [tmp.name],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return True
    except (subprocess.TimeoutExpired, OSError):
        if os.path.exists(tmp.name):
            os.unlink(tmp.name)
        return False


def speak_piper(text: str) -> bool:
    """Speak using Piper neural TTS (local, no API key)."""
    if not shutil.which("piper"):
        return False

    player = find_audio_player()
    if not player:
        return False

    voice = os.environ.get("CLAUDE_TTS_VOICE", "en_US-lessac-medium")
    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    tmp.close()

    try:
        subprocess.run(
            ["piper", "--model", voice, "--output_file", tmp.name],
            input=text.encode(),
            timeout=30,
            capture_output=True,
        )
        if os.path.getsize(tmp.name) == 0:
            os.unlink(tmp.name)
            return False

        subprocess.Popen(
            player + [tmp.name],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return True
    except (subprocess.TimeoutExpired, OSError):
        if os.path.exists(tmp.name):
            os.unlink(tmp.name)
        return False


def speak_macos(text: str) -> bool:
    """Speak using macOS `say` command."""
    if not shutil.which("say"):
        return False
    cmd = ["say"]
    voice = os.environ.get("CLAUDE_TTS_VOICE")
    rate = os.environ.get("CLAUDE_TTS_RATE")
    if voice:
        cmd += ["-v", voice]
    if rate:
        cmd += ["-r", rate]
    cmd.append(text)
    subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return True


def speak_espeak(text: str) -> bool:
    """Speak using espeak-ng or espeak."""
    for engine in ("espeak-ng", "espeak"):
        if shutil.which(engine):
            subprocess.Popen(
                [engine, text],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            return True
    return False


# ---------------------------------------------------------------------------
# Engine registry
# ---------------------------------------------------------------------------

ENGINES = {
    "openai": speak_openai,
    "piper": speak_piper,
    "say": speak_macos,
    "espeak": speak_espeak,
}

ENGINE_ORDER = ["openai", "piper", "say", "espeak"]


def main():
    try:
        hook_input = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        sys.exit(0)

    transcript_path = hook_input.get("transcript_path", "")
    if not transcript_path:
        sys.exit(0)

    transcript_path = os.path.expanduser(transcript_path)
    if not os.path.exists(transcript_path):
        sys.exit(0)

    raw_text = extract_last_assistant_text(transcript_path)
    if not raw_text:
        sys.exit(0)

    text = clean_text_for_speech(raw_text)
    if not text:
        sys.exit(0)

    max_chars = int(os.environ.get("CLAUDE_TTS_MAX_CHARS", "1000"))
    if len(text) > max_chars:
        text = text[:max_chars] + "... message truncated."

    # Use a specific engine if requested, otherwise try all in order
    forced = os.environ.get("CLAUDE_TTS_ENGINE", "").lower()
    if forced and forced in ENGINES:
        if ENGINES[forced](text):
            return
        print(f"TTS engine '{forced}' failed.", file=sys.stderr)
        sys.exit(0)

    for name in ENGINE_ORDER:
        if ENGINES[name](text):
            return

    print("No TTS engine available. See README for setup.", file=sys.stderr)
    sys.exit(0)


if __name__ == "__main__":
    main()
