#!/usr/bin/env python3
"""
Read Claude Code's last assistant response aloud using text-to-speech.

Reads a Claude Code transcript JSONL file, extracts the last assistant
message text (stripping code blocks), and speaks it through the best
available TTS engine on the system.

TTS engine priority:
  1. macOS `say` command
  2. `espeak-ng` (Linux)
  3. `espeak` (Linux)
  4. Google TTS via `gtts-cli` (cross-platform, requires internet)

Environment variables:
  CLAUDE_TTS_MAX_CHARS  - Max characters to speak (default: 1000)
  CLAUDE_TTS_VOICE      - Voice name for macOS `say` (default: system default)
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
    # Remove fenced code blocks (``` ... ```)
    text = re.sub(r"```[\s\S]*?```", " code block omitted ", text)

    # Remove inline code (`...`)
    text = re.sub(r"`[^`]+`", "", text)

    # Remove URLs
    text = re.sub(r"https?://\S+", "", text)

    # Remove file paths like /foo/bar/baz.ts:123
    text = re.sub(r"(?<!\w)[/~][\w./\-]+(?::\d+)?", "", text)

    # Remove markdown headers (### ...)
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)

    # Remove markdown bold/italic markers
    text = re.sub(r"\*{1,3}([^*]+)\*{1,3}", r"\1", text)
    text = re.sub(r"_{1,3}([^_]+)_{1,3}", r"\1", text)

    # Remove markdown link syntax [text](url) -> text
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)

    # Remove bullet points
    text = re.sub(r"^\s*[-*+]\s+", "", text, flags=re.MULTILINE)

    # Collapse multiple newlines / whitespace
    text = re.sub(r"\n{2,}", ". ", text)
    text = re.sub(r"\n", " ", text)
    text = re.sub(r"\s{2,}", " ", text)

    return text.strip()


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


def speak_gtts(text: str) -> bool:
    """Speak using Google TTS (gtts-cli) and a media player."""
    if not shutil.which("gtts-cli"):
        return False

    # Find an available audio player
    player = None
    for candidate in ("afplay", "mpv", "ffplay", "aplay", "paplay"):
        if shutil.which(candidate):
            player = candidate
            break

    if not player:
        return False

    tmp = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
    tmp.close()

    try:
        subprocess.run(
            ["gtts-cli", text, "-o", tmp.name],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=30,
        )
        player_cmd = [player]
        if player == "ffplay":
            player_cmd += ["-nodisp", "-autoexit"]
        elif player == "mpv":
            player_cmd += ["--no-video"]
        player_cmd.append(tmp.name)
        subprocess.Popen(player_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
        os.unlink(tmp.name)
        return False


def main():
    # Read the hook input from stdin
    try:
        hook_input = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        sys.exit(0)

    transcript_path = hook_input.get("transcript_path", "")
    if not transcript_path:
        sys.exit(0)

    # Expand ~ in path
    transcript_path = os.path.expanduser(transcript_path)

    if not os.path.exists(transcript_path):
        sys.exit(0)

    # Extract and clean the text
    raw_text = extract_last_assistant_text(transcript_path)
    if not raw_text:
        sys.exit(0)

    text = clean_text_for_speech(raw_text)
    if not text:
        sys.exit(0)

    # Truncate to max length
    max_chars = int(os.environ.get("CLAUDE_TTS_MAX_CHARS", "1000"))
    if len(text) > max_chars:
        text = text[:max_chars] + "... message truncated."

    # Try TTS engines in order of preference
    if speak_macos(text):
        return
    if speak_espeak(text):
        return
    if speak_gtts(text):
        return

    print("No TTS engine available. Install espeak-ng or gtts.", file=sys.stderr)
    sys.exit(0)


if __name__ == "__main__":
    main()
