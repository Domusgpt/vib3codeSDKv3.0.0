#!/bin/bash
# VIB3+ Claude Code Skills Installer
# Installs vib3-design, vib3-dev, and vib3-create skills globally
#
# Usage:
#   ./install-skills.sh           # Install to ~/.claude/skills/ (global)
#   ./install-skills.sh /path     # Install to custom location

set -e

INSTALL_DIR="${1:-$HOME/.claude/skills}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "VIB3+ Skills Installer"
echo "======================"
echo ""
echo "Installing to: $INSTALL_DIR"
echo ""

# Create skill directories
mkdir -p "$INSTALL_DIR/vib3-design"
mkdir -p "$INSTALL_DIR/vib3-dev"
mkdir -p "$INSTALL_DIR/vib3-create"

# Check if tar package exists alongside this script
if [ -f "$SCRIPT_DIR/vib3-skills.tar.gz" ]; then
    echo "Extracting from vib3-skills.tar.gz..."
    tar -xzf "$SCRIPT_DIR/vib3-skills.tar.gz" -C "$INSTALL_DIR"
else
    # Fall back to copying from project .claude/skills/
    PROJECT_SKILLS="$(cd "$SCRIPT_DIR/.." && pwd)/skills"
    if [ -d "$PROJECT_SKILLS" ]; then
        echo "Copying from project skills directory..."
        cp "$PROJECT_SKILLS/vib3-design/SKILL.md" "$INSTALL_DIR/vib3-design/SKILL.md"
        cp "$PROJECT_SKILLS/vib3-dev/SKILL.md" "$INSTALL_DIR/vib3-dev/SKILL.md"
        cp "$PROJECT_SKILLS/vib3-create/SKILL.md" "$INSTALL_DIR/vib3-create/SKILL.md"
    else
        echo "ERROR: Cannot find skills source. Run from .claude/skills-package/ or ensure .claude/skills/ exists."
        exit 1
    fi
fi

echo ""
echo "Installed skills:"
for skill in vib3-design vib3-dev vib3-create; do
    if [ -f "$INSTALL_DIR/$skill/SKILL.md" ]; then
        SIZE=$(wc -c < "$INSTALL_DIR/$skill/SKILL.md")
        echo "  /$skill  ($SIZE bytes)"
    fi
done

echo ""
echo "Skills are now available globally in Claude Code."
echo "Use them with: /vib3-design, /vib3-dev, /vib3-create"
echo ""

# Check for duplicate legacy commands that may cause double registration
if [ -f "$HOME/.claude/commands/vib3-design.md" ] || [ -f "$HOME/.claude/commands/vib3-dev.md" ]; then
    echo "WARNING: Legacy commands detected at ~/.claude/commands/"
    echo "These will cause duplicate registrations in Claude Code."
    echo "Consider removing them:"
    [ -f "$HOME/.claude/commands/vib3-design.md" ] && echo "  rm ~/.claude/commands/vib3-design.md"
    [ -f "$HOME/.claude/commands/vib3-dev.md" ] && echo "  rm ~/.claude/commands/vib3-dev.md"
    echo ""
fi
