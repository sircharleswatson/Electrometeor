#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE=$DIR/..

export ROOT_URL=https://localhost:3000
export DIR=$BASE
OS_PLATFORM=`uname -s`
OS_PLATFORM=`echo $OS_PLATFORM | tr '[:upper:]' '[:lower:]'`
MACHINE_TYPE=`uname -m`
echo "OS Platform: $OS_PLATFORM"

cd $BASE/meteor
exec 3< <(meteor)
sed '/App running at/q' <&3 ; cat <&3 &
if [ $OS_PLATFORM == "darwin" ]; then
  	NODE_ENV=development $BASE/cache/electron/Electron.app/Contents/MacOS/Electron $BASE
elif [ $OS_PLATFORM == "linux" ]; then
	NODE_ENV=development $BASE/cache/electron/electron $BASE
else
	echo "Unknown platform ($OS_PLATFORM). Exiting..."
fi
kill $(ps ax | grep node | grep meteor | awk '{print $1}')