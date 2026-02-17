#!/bin/bash
#
# Claude Code Stop Hook - Text-to-Speech
#
# Reads Claude's last response aloud when CLAUDE_TTS=1 is set.
# Install by adding this to your Claude Code hooks configuration.
#
# Toggle:
#   export CLAUDE_TTS=1    # enable TTS
#   unset CLAUDE_TTS       # disable TTS
#
# Configuration (env vars):
#   CLAUDE_TTS_MAX_CHARS   Max characters to speak (default: 1000)
#   CLAUDE_TTS_VOICE       macOS voice name (e.g. "Samantha", "Daniel")
#   CLAUDE_TTS_RATE        macOS speech rate in WPM (e.g. "200")

set -euo pipefail

# Read stdin (hook JSON payload)
input=$(cat)

# Only run when TTS is enabled
if [[ "${CLAUDE_TTS:-0}" != "1" ]]; then
  exit 0
fi

# Prevent recursion if stop hook is re-triggered
stop_hook_active=$(echo "$input" | jq -r '.stop_hook_active // false')
if [[ "$stop_hook_active" == "true" ]]; then
  exit 0
fi

# Resolve the script directory so we can find the Python script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run the TTS script in the background so we don't block Claude
echo "$input" | python3 "$SCRIPT_DIR/tts-read-response.py" &

exit 0
