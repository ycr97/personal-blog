#!/bin/sh
set -eu

repo_root=$(git rev-parse --show-toplevel)
scan_root=${PUBLIC_CONTENT_ROOT:-$repo_root}
test -d "$scan_root" || {
  echo "public content root not found" >&2
  exit 2
}

command -v rg >/dev/null 2>&1 || {
  echo "ripgrep is required" >&2
  exit 2
}
command -v exiftool >/dev/null 2>&1 || {
  echo "exiftool is required" >&2
  exit 2
}

if test "${PUBLIC_SKIP_GITLEAKS:-0}" != 1; then
  cd "$repo_root"
  ./scripts/security/scan-secrets.sh worktree
fi

private_key_pattern=$(printf '%s%s' '-----BEGIN ' '(RSA |EC |OPENSSH )?PRIVATE KEY-----')
vless_pattern=$(printf '%s%s' 'vless:' '//')
unsafe_files=$(rg -l --hidden \
  --glob '!.git/**' --glob '!node_modules/**' --glob '!dist/**' \
  --glob '!public/pagefind/**' --glob '!.DS_Store' \
  -e "$private_key_pattern" -e "$vless_pattern" "$scan_root" 2>/dev/null || true)
if test -n "$unsafe_files"; then
  echo "prohibited public content found in:" >&2
  printf '%s\n' "$unsafe_files" >&2
  exit 1
fi

ip_pattern='\b([0-9]{1,3}\.){3}[0-9]{1,3}\b'
ip_files=$(rg -l --hidden \
  --glob '!.git/**' --glob '!node_modules/**' --glob '!dist/**' \
  --glob '!public/pagefind/**' --glob '!.DS_Store' \
  -e "$ip_pattern" "$scan_root" 2>/dev/null || true)
if test -n "$ip_files"; then
  echo "unapproved IP literal found in:" >&2
  printf '%s\n' "$ip_files" >&2
  exit 1
fi

media_count=0
while IFS= read -r image; do
  test -z "$image" && continue
  media_count=$((media_count + 1))
  if test -n "$(exiftool -s3 -GPSLatitude -GPSLongitude "$image")"; then
    printf 'GPS metadata found: %s\n' "$image" >&2
    exit 1
  fi
  if test -n "$(exiftool -s3 -SerialNumber -InternalSerialNumber -LensSerialNumber -CameraSerialNumber "$image")"; then
    printf 'device serial metadata found: %s\n' "$image" >&2
    exit 1
  fi
done <<EOF
$(find "$scan_root" -type f \
  ! -path '*/.git/*' ! -path '*/node_modules/*' ! -path '*/dist/*' \
  ! -path '*/public/pagefind/*' \( \
  -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o \
  -iname '*.gif' -o -iname '*.webp' -o -iname '*.heic' \
  \) -print | LC_ALL=C sort)
EOF

printf 'Public validation passed; reviewed media files: %s\n' "$media_count"
