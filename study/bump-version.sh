#!/bin/sh
# 更新を公開する前に実行する。index.html の ?v= と version.json を同じ新しい番号にそろえると、
# 開いているアプリに「新しいバージョンがあります」が表示される
set -e
cd "$(dirname "$0")"
v=$(date -u +%Y%m%d%H%M)
sed -i.bak -E "s/\?v=[0-9]+/?v=$v/g" index.html && rm -f index.html.bak
printf '{ "version": "%s" }\n' "$v" > version.json
echo "version: $v"
