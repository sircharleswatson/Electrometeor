#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE=$DIR/..

export ROOT_URL=https://localhost:3000
export DIR=$BASE

cd $BASE/meteor
exec 3< <(meteor)
sed '/App running at/q' <&3 ; cat <&3 &
NODE_ENV=development $BASE/cache/electron/Electron.app/Contents/MacOS/Electron $BASE
kill $(ps ax | grep node | grep meteor | awk '{print $1}')
