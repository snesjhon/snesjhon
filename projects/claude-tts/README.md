# Claude Code Voice - Talk To and From Claude Code

Two-way voice for Claude Code: **hear responses spoken aloud** and **speak your prompts** instead of typing.

---

## Part 1: Hear Claude's Responses (Text-to-Speech)

A Claude Code **Stop hook** reads each response aloud after it finishes.

### Pick a TTS Engine

| Engine | Quality | Requires | Install |
|--------|---------|----------|---------|
| **OpenAI TTS** | Natural | `OPENAI_API_KEY` + audio player | Already have it if you use OpenAI |
| **Piper** | Natural | Nothing (runs locally) | `pip install piper-tts` |
| **macOS `say`** | Good | macOS | Built-in |
| **espeak-ng** | Robotic | Linux | `sudo apt install espeak-ng` |

### Setup

**1. Copy the scripts:**

```bash
cp projects/claude-tts/tts-hook.sh ~/.claude/tts-hook.sh
cp projects/claude-tts/tts-read-response.py ~/.claude/tts-read-response.py
chmod +x ~/.claude/tts-hook.sh ~/.claude/tts-read-response.py
```

**2. Add the Stop hook to `~/.claude/settings.json`:**

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/tts-hook.sh"
          }
        ]
      }
    ]
  }
}
```

**3. Enable and configure:**

```bash
# Turn it on
export CLAUDE_TTS=1

# Pick an engine (optional - auto-detects by default)
export CLAUDE_TTS_ENGINE=openai   # or: piper, say, espeak

# For OpenAI TTS, set your API key
export OPENAI_API_KEY=sk-...
```

Add these to `~/.bashrc` or `~/.zshrc` to persist.

### Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_TTS` | `0` | Set to `1` to enable |
| `CLAUDE_TTS_ENGINE` | auto | Force engine: `openai`, `piper`, `say`, `espeak` |
| `CLAUDE_TTS_MAX_CHARS` | `1000` | Max characters before truncation |
| `CLAUDE_TTS_VOICE` | engine default | Voice name (see below) |
| `CLAUDE_TTS_RATE` | system default | Speech rate (macOS `say` only, in WPM) |
| `OPENAI_API_KEY` | - | Required for OpenAI engine |

**Voice names by engine:**

- **OpenAI**: `alloy`, `ash`, `coral`, `echo`, `fable`, `nova` (default), `onyx`, `sage`, `shimmer`
- **Piper**: `en_US-lessac-medium` (default), `en_US-amy-medium`, `en_GB-alan-medium` — [browse voices](https://rhasspy.github.io/piper-samples/)
- **macOS say**: run `say -v '?'` to list voices
- **espeak-ng**: run `espeak-ng --voices` to list voices

---

## Part 2: Talk to Claude Code (Speech-to-Text Input)

Three options, from easiest to most integrated:

### Option A: VoiceMode MCP (Recommended - full two-way voice)

[VoiceMode](https://github.com/mbailey/voicemode) is an MCP server that adds both voice input AND output to Claude Code in one package.

```bash
# Install as an MCP server
claude mcp add --scope user voice-mode uvx voice-mode

# Set your OpenAI key for Whisper STT + TTS
export OPENAI_API_KEY=sk-...

# Start a voice conversation
claude
# Then tell Claude: "listen to me" or "let's talk"
```

This gives you full two-way voice. Claude listens through your mic, transcribes with Whisper, responds, and speaks back. No hook setup needed — it replaces Part 1 entirely.

### Option B: OS-level dictation (zero setup)

Use your operating system's built-in dictation in the terminal:

- **macOS**: Press `Fn` twice (or the mic key) in Terminal/iTerm — speaks directly into the Claude Code prompt
- **Windows**: Press `Win + H` for voice typing
- **Linux**: Install [Nerd Dictation](https://github.com/ideasman42/nerd-dictation) or use GNOME's built-in dictation

This works immediately with no code changes. Just activate dictation while the Claude Code prompt is focused.

### Option C: Whisper + SoX (DIY voice loop)

Record from your microphone, transcribe locally with Whisper, and pipe to Claude Code:

**Install:**
```bash
# macOS
brew install sox ffmpeg
pip install openai-whisper

# Linux
sudo apt install sox libsox-fmt-all ffmpeg
pip install openai-whisper
```

**Use:**
```bash
# Record until 2 seconds of silence, transcribe, send to Claude
sox -d /tmp/prompt.wav silence 1 0.1 1% 1 2.0 1%
whisper /tmp/prompt.wav --model base --output_format txt --output_dir /tmp
claude -p "$(cat /tmp/prompt.txt)"
```

For real-time streaming transcription, use [whisper.cpp](https://github.com/ggml-org/whisper.cpp) with the `--stream` mode.

---

## Quick Reference: Full Voice Setup

The fastest path to talking back and forth with Claude Code:

**If you have an OpenAI API key** (best quality):
```bash
# Voice output (TTS hook)
export CLAUDE_TTS=1
export CLAUDE_TTS_ENGINE=openai
export OPENAI_API_KEY=sk-...

# Voice input (VoiceMode MCP)
claude mcp add --scope user voice-mode uvx voice-mode
```

**If you want fully local/offline** (no API keys):
```bash
# Voice output
pip install piper-tts
export CLAUDE_TTS=1
export CLAUDE_TTS_ENGINE=piper

# Voice input
pip install openai-whisper
# Use OS dictation (Fn+Fn on macOS) or the SoX+Whisper approach
```

**If you're on macOS and want zero dependencies**:
```bash
# Voice output
export CLAUDE_TTS=1
export CLAUDE_TTS_ENGINE=say

# Voice input
# Just press Fn twice in Terminal to start dictation
```

---

## How the Stop Hook Works

```
Claude finishes responding
        ↓
Stop event fires → tts-hook.sh
        ↓
Checks CLAUDE_TTS=1?
        ↓ yes
tts-read-response.py
        ↓
Reads transcript JSONL → extracts last assistant message
        ↓
Strips code blocks, URLs, markdown
        ↓
Sends cleaned text to TTS engine (in background)
        ↓
You hear the response
```

## Troubleshooting

**No sound?**
- Verify `echo $CLAUDE_TTS` prints `1`
- Test the engine directly: `say "hello"` / `espeak-ng "hello"` / check `OPENAI_API_KEY` is set
- Ensure you have an audio player: `mpv`, `ffplay`, `afplay`, or `aplay`

**Voice sounds robotic?**
- Switch to a natural engine: `export CLAUDE_TTS_ENGINE=openai` or `piper`

**Response too long / cuts off?**
- Adjust `CLAUDE_TTS_MAX_CHARS` (default 1000 characters)

**Want to use VoiceMode instead of the hook?**
- Remove the TTS hook from settings and just use VoiceMode MCP for both input and output
