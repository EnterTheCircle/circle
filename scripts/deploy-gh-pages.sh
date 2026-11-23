#!/usr/bin/env bash
# Build Expo web for GitHub Pages and publish to gh-pages with SPA route fallbacks.
set -euo pipefail
cd "$(dirname "$0")/.."

EXPO_BASE_URL=/circle npx expo export -p web

# SPA deep-link fallbacks (GitHub Pages has no rewrite rules).
cp dist/index.html dist/404.html
for route in about tokenomics circle-token signup how-to stats discover introductions profile; do
  mkdir -p "dist/$route"
  cp dist/index.html "dist/$route/index.html"
done

rm -rf /tmp/circle-gh-pages
git fetch origin gh-pages
git worktree add -f /tmp/circle-gh-pages origin/gh-pages
cd /tmp/circle-gh-pages
find . -mindepth 1 -maxdepth 1 ! -name '.git' ! -name '.nojekyll' -exec rm -rf {} +
cp -R "$OLDPWD/dist/." .
touch .nojekyll
git add -A
git commit -m "${1:-Deploy Circle web to GitHub Pages.}" || true
git push origin HEAD:gh-pages
cd "$OLDPWD"
git worktree remove /tmp/circle-gh-pages --force
echo "Published → https://enterthecircle.github.io/circle/"
