#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

rm -f claude-code-skills-vib3.zip openai-skills-vib3.zip vib3-skills-all-formats.zip

zip -r claude-code-skills-vib3.zip claude-code >/dev/null
zip -r openai-skills-vib3.zip openai >/dev/null
zip -r vib3-skills-all-formats.zip claude-code openai >/dev/null

echo "Created:"
ls -lh claude-code-skills-vib3.zip openai-skills-vib3.zip vib3-skills-all-formats.zip
