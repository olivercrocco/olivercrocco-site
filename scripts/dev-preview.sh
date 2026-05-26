#!/bin/bash
# Wrapper to launch `npm run dev` with Homebrew bin on PATH.
# Used by .claude/launch.json so the preview tool can find node/npm.
export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:$PATH"
cd "$(dirname "$0")/.."
exec npm run dev "$@"
