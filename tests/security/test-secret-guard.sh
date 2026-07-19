#!/bin/sh
set -eu

repo_root=$(git rev-parse --show-toplevel)
probe="$repo_root/secret-scan-probe.txt"
trap 'rm -f "$probe"' EXIT HUP INT TERM

printf '%s%s\n' 'vless:' '//00000000-0000-0000-0000-000000000000@example.invalid:443' > "$probe"
if "$repo_root/scripts/security/scan-secrets.sh" worktree >/dev/null 2>&1; then
  echo "secret scanner accepted a VLESS URI" >&2
  exit 1
fi
rm -f "$probe"
"$repo_root/scripts/security/scan-secrets.sh" worktree
