#!/usr/bin/env bash
set -euo pipefail

# -------------------------
# Config
# -------------------------
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"  # project root
BUILD_DIR="$ROOT_DIR/AIMS-Builder"
OUT_BASE="$BUILD_DIR/releases"

BACK_ROOT="$ROOT_DIR/AIMS-Back"
FRONT_DIR="$ROOT_DIR/AIMS-Front"

RSYNC_EXCLUDES=(
  --exclude='AIMS-Builder'
  --exclude='.git'
)

# -------------------------
# Helpers
# -------------------------
get_version() {
  local repo_dir="$1"

  # get latest tag (strip leading v if present)
  local tag
  tag=$(git -C "$repo_dir" describe --tags --abbrev=0 2>/dev/null | sed 's/^v//' || true)

  if [ -n "$tag" ]; then
    # count commits since last tag
    local commits_since
    commits_since=$(git -C "$repo_dir" rev-list "v$tag"..HEAD --count 2>/dev/null || \
                    git -C "$repo_dir" rev-list "$tag"..HEAD --count 2>/dev/null || echo 0)

    if [ "$commits_since" -eq 0 ]; then
      echo "$tag"
    else
      echo "${tag}-${commits_since}"
    fi
    return
  fi

  # fallback: use package.json version if exists
  if [ -f "$repo_dir/package.json" ]; then
    local pkgver
    pkgver=$(node -e "console.log(require(process.argv[1]).version || '')" "$repo_dir/package.json" 2>/dev/null || true)
    if [ -n "$pkgver" ]; then
      local commits
      commits=$(git -C "$repo_dir" rev-list HEAD --count)
      echo "${pkgver}-${commits}"
      return
    fi
  fi

  # fallback: just use short hash
  git -C "$repo_dir" rev-parse --short HEAD
}




timestamp_iso() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

# -------------------------
# Start
# -------------------------
echo "🚀 Starting release build..."
mkdir -p "$OUT_BASE"

FRONT_TAG=$(get_version "$FRONT_DIR")
BACK_TAG=$(get_version "$BACK_ROOT")

echo "Frontend version: $FRONT_TAG"
echo "Backend  version: $BACK_TAG"

RELEASE_NAME="AIMS-back-$BACK_TAG-front-$FRONT_TAG"
RELEASE_DIR="$OUT_BASE/$RELEASE_NAME"

# Clean old
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

# --- 1) Build frontend ---
echo "📦 Building frontend..."
( cd "$FRONT_DIR"
  rm -rf dist
  if npm run | grep -q "build"; then
    npm run build -- --configuration production --output-path=dist
  else
    npx ng build --configuration production --output-path=dist
  fi
)
[ -d "$FRONT_DIR/dist" ] || { echo "❌ Frontend build failed (no dist)"; exit 1; }

# --- 2) Create version files in original backend ---
BUILD_TIME="$(timestamp_iso)"
cat > "$BACK_ROOT/version.json" <<EOF
{
  "frontend": "$FRONT_TAG",
  "backend": "$BACK_TAG",
  "builtAt": "$BUILD_TIME"
}
EOF

cat > "$BACK_ROOT/version.js" <<JS
// Auto-generated
module.exports = {
  frontend: "$FRONT_TAG",
  backend: "$BACK_TAG",
  builtAt: "$BUILD_TIME"
};
JS

# --- 3) Copy backend into release (with version files included) ---
echo "📂 Copying backend..."
BACK_DST="$RELEASE_DIR"
mkdir -p "$BACK_DST"
rsync -a "${RSYNC_EXCLUDES[@]}" "$BACK_ROOT/" "$BACK_DST/"

# --- 4) Copy frontend into backend/public ---
echo "🌐 Copying frontend into backend/public..."
mkdir -p "$BACK_DST/public"
rsync -a "$FRONT_DIR/dist/" "$BACK_DST/public/"

# --- 5) Package (.tgz always) ---
TGZ_PATH="$OUT_BASE/$RELEASE_NAME.tgz"
tar -czf "$TGZ_PATH" -C "$OUT_BASE" "$RELEASE_NAME"
echo "✅ Created package: $TGZ_PATH"

echo "🎉 Release ready: $RELEASE_NAME"
echo "   Location: $RELEASE_DIR"
