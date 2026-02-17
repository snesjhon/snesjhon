# Claude Code Text-to-Speech

Have Claude Code read its responses aloud using a **Stop hook** that triggers after every response.

## How It Works

1. Claude Code fires a `Stop` event every time it finishes a response
2. The hook script checks if TTS is enabled (`CLAUDE_TTS=1`)
3. If enabled, it reads the session transcript, extracts the last assistant message, strips code blocks and markdown, and speaks the cleaned text through your system's TTS engine

## Quick Setup

### 1. Install a TTS engine

**macOS** - built-in `say` command, nothing to install.

**Linux (Ubuntu/Debian)**:
```bash
sudo apt install espeak-ng
```

**Cross-platform fallback** (requires internet):
```bash
pip3 install gtts
# also need an audio player: mpv, ffplay, aplay, or paplay
```

### 2. Install the hook

Copy the scripts to your Claude config directory:

```bash
cp projects/claude-tts/tts-hook.sh ~/.claude/tts-hook.sh
cp projects/claude-tts/tts-read-response.py ~/.claude/tts-read-response.py
chmod +x ~/.claude/tts-hook.sh ~/.claude/tts-read-response.py
```

Then add the hook to `~/.claude/settings.json`:

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

If you already have a Stop hook (like the git-check hook), add both entries to the array:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/stop-hook-git-check.sh"
          }
        ]
      },
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

### 3. Enable TTS

TTS is **off by default**. Toggle it with an environment variable:

```bash
# Enable - Claude reads responses aloud
export CLAUDE_TTS=1

# Disable
unset CLAUDE_TTS
```

Add to your shell profile (`~/.bashrc`, `~/.zshrc`) to persist:

```bash
export CLAUDE_TTS=1
```

## Configuration

All configuration is via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_TTS` | `0` | Set to `1` to enable TTS |
| `CLAUDE_TTS_MAX_CHARS` | `1000` | Max characters to speak (longer responses are truncated) |
| `CLAUDE_TTS_VOICE` | system default | macOS voice name (e.g. `Samantha`, `Daniel`, `Zarvox`) |
| `CLAUDE_TTS_RATE` | system default | macOS speech rate in words per minute |

## TTS Engine Priority

The script tries engines in this order:

1. **`say`** (macOS) - best quality, no internet needed
2. **`espeak-ng`** (Linux) - lightweight, no internet needed
3. **`espeak`** (Linux) - fallback for older systems
4. **`gtts-cli`** (cross-platform) - uses Google TTS, requires internet + audio player

## What Gets Read

- Only the **text** portions of Claude's response
- **Code blocks** are replaced with "code block omitted"
- **URLs**, file paths, and markdown syntax are stripped
- Long responses are **truncated** at `CLAUDE_TTS_MAX_CHARS` characters

## Troubleshooting

**No sound?**
- Check `CLAUDE_TTS=1` is set: `echo $CLAUDE_TTS`
- Verify TTS works directly: `say "hello"` (macOS) or `espeak-ng "hello"` (Linux)
- Check the script runs: `echo '{"transcript_path":"..."}' | python3 tts-read-response.py`

**Audio cuts off?**
- Increase `CLAUDE_TTS_MAX_CHARS`
- The TTS runs in the background - if Claude responds again quickly, the previous speech continues

**Want a different voice?**
- macOS: `say -v '?'` lists all available voices
- espeak-ng: `espeak-ng --voices` lists available voices
