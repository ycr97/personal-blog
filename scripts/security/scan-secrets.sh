#!/bin/sh
set -eu

mode="${1:-worktree}"
repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"

command -v gitleaks >/dev/null 2>&1 || {
  echo "gitleaks is required: brew install gitleaks" >&2
  exit 2
}

case "$mode" in
  worktree)
    gitleaks dir . --config .gitleaks.toml --redact --no-banner
    ;;
  history)
    git rev-parse --verify HEAD >/dev/null 2>&1 || exit 0
    gitleaks git . --config .gitleaks.toml --redact --no-banner
    ;;
  *)
    echo "usage: $0 [worktree|history]" >&2
    exit 2
    ;;
esac
