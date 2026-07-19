#!/bin/sh
set -eu

repo_root=$(git rev-parse --show-toplevel)
validator=$repo_root/scripts/content/validate-public.sh
tmp=$(mktemp -d /private/tmp/personal-blog-public-validation.XXXXXX)

mkdir -p "$tmp/clean" "$tmp/vless" "$tmp/private-key" "$tmp/ip"
printf '%s\n' '# Safe public article' >"$tmp/clean/article.md"
vless_value=$(printf '%s%s' 'vless:' '//00000000-0000-0000-0000-000000000000@example.invalid:443')
private_key_value=$(printf '%s%s' '-----BEGIN ' 'PRIVATE KEY-----')
ip_value=$(printf '%s%s' '203.0.113.' '10')
printf '%s\n' "$vless_value" >"$tmp/vless/article.md"
printf '%s\n' "$private_key_value" >"$tmp/private-key/article.md"
printf '%s\n' "$ip_value" >"$tmp/ip/article.md"

PUBLIC_CONTENT_ROOT="$tmp/clean" PUBLIC_SKIP_GITLEAKS=1 "$validator" >"$tmp/clean.out"

for fixture in vless private-key ip; do
  if PUBLIC_CONTENT_ROOT="$tmp/$fixture" PUBLIC_SKIP_GITLEAKS=1 \
    "$validator" >"$tmp/$fixture.out" 2>&1; then
    printf 'unsafe fixture accepted: %s\n' "$fixture" >&2
    exit 1
  fi
done

if rg -F -- "$vless_value" "$tmp/vless.out"; then
  echo "validator printed a VLESS value" >&2
  exit 1
fi
if rg -F -- "$private_key_value" "$tmp/private-key.out"; then
  echo "validator printed a private-key marker" >&2
  exit 1
fi
if rg -F -- "$ip_value" "$tmp/ip.out"; then
  echo "validator printed an IP literal" >&2
  exit 1
fi

printf 'Public validation tests passed; test artifacts retained at %s\n' "$tmp"
