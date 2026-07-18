#!/bin/bash
# GUS prototype — clean push helper
# Clears stale git locks left by the Cowork sandbox, then commits and pushes.

REPO="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$REPO"

# Remove stale lock files
rm -f .git/HEAD.lock .git/index.lock .git/MERGE_HEAD.lock .git/CHERRY_PICK_HEAD.lock

# Stage everything, commit if there are changes, then push
if ! git diff --quiet || ! git diff --cached --quiet || git status --short | grep -q '^?? '; then
  git add -A
  git commit -m "${1:-"chore: sync from Cowork"}"
fi

git push
