#!/bin/bash
# 千岛原型预览 · 自动打开 / 刷新
# 用法: ./preview.sh [demos/{需求文件夹}/{页面}.html]
# 默认入口: demos/community-default/home-feed.html

cd "$(dirname "$0")"
PAGE="${1:-demos/community-default/home-feed.html}"
FULL_PATH="$(pwd)/$PAGE"
FILE_URL="file://$FULL_PATH"
FILENAME="$(basename "$PAGE")"

# ── 在 Chrome 里找并刷新 ─────────────────────────────────────
refresh_chrome() {
  osascript 2>/dev/null <<EOF
tell application "Google Chrome"
  if not running then return "not_running"
  repeat with w in windows
    repeat with t in tabs of w
      if URL of t contains "$FILENAME" then
        reload t
        set index of w to 1
        activate
        return "refreshed"
      end if
    end repeat
  end repeat
  return "not_found"
end tell
EOF
}

# ── 在 Safari 里找并刷新 ─────────────────────────────────────
refresh_safari() {
  osascript 2>/dev/null <<EOF
tell application "Safari"
  if not running then return "not_running"
  repeat with w in windows
    repeat with t in tabs of w
      if URL of t contains "$FILENAME" then
        do JavaScript "location.reload()" in t
        set current tab of w to t
        activate
        return "refreshed"
      end if
    end repeat
  end repeat
  return "not_found"
end tell
EOF
}

RESULT=$(refresh_chrome)
if [ "$RESULT" != "refreshed" ]; then
  RESULT=$(refresh_safari)
fi

if [ "$RESULT" = "refreshed" ]; then
  echo "🔄 已刷新: $FILENAME"
else
  open "$FILE_URL"
  echo "🚀 已打开: $FILE_URL"
fi
