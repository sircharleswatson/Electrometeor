#!/bin/bash
set -e # Auto-exit on error

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE=$DIR/..

NODEJS_VERSION=0.12.2

OS_PLATFORM=`uname -s`
OS_PLATFORM=`echo $OS_PLATFORM | tr '[:upper:]' '[:lower:]'`
MACHINE_TYPE=`uname -m`
echo "OS Platform: $OS_PLATFORM"
echo "Machine Type: $MACHINE_TYPE"
if [ $MACHINE_TYPE == 'x86_64' ]; then
  OS_ARCH=$OS_PLATFORM-x64
  ARCH=x64
else
  OS_ARCH=$OS_PLATFORM-ia32
  ARCH=ia32
fi

echo "OS Architecture: $OS_ARCH"

ELECTRON_VERSION=0.25.1
ELECTRON_FILE=electron-v$ELECTRON_VERSION-$OS_ARCH.zip

source $DIR/colors.sh
cd $BASE

if [ ! -f resources ]; then
  mkdir -p resources
fi

if [ ! -f node_modules ]; then
  mkdir -p node_modules
fi

mkdir -p cache
cd cache

if [ ! -f $ELECTRON_FILE ]; then
  cecho "-----> Downloading Electron..." $purple
  curl -L -o $ELECTRON_FILE https://github.com/atom/electron/releases/download/v$ELECTRON_VERSION/$ELECTRON_FILE
  mkdir -p electron
  unzip -d electron $ELECTRON_FILE
fi

if [ ! -f mongodb-osx-x86_64-2.6.3.tgz ]; then
  cecho "-----> Downloading mongodb..." $purple
  curl -L -o mongodb-osx-x86_64-2.6.3.tgz http://downloads.mongodb.org/osx/mongodb-osx-x86_64-2.6.3.tgz
  tar -zxvf mongodb-osx-x86_64-2.6.3.tgz
  cp mongodb-osx-x86_64-2.6.3/bin/mongod $BASE/resources/
  cp mongodb-osx-x86_64-2.6.3/GNU-AGPL-3.0 $BASE/resources/MONGOD_LICENSE.txt
fi

if [ ! -f "node-v$NODEJS_VERSION-$OS_ARCH.tar.gz" ]; then
  cecho "-----> Downloading Nodejs distribution..." $purple
  curl -L -o node-v$NODEJS_VERSION-$OS_ARCH.tar.gz http://nodejs.org/dist/v$NODEJS_VERSION/node-v$NODEJS_VERSION-$OS_ARCH.tar.gz
  mkdir -p node
  tar -xzf node-v$NODEJS_VERSION-$OS_ARCH.tar.gz --strip-components 1 -C node
  cp node/bin/node $BASE/resources/node
  cp node/LICENSE $BASE/resources/NODE_LICENSE.txt
fi

cd $BASE

# Build NPM modules
NPM="$BASE/cache/node/bin/npm"
export npm_config_disturl=https://atom.io/download/electron
export npm_config_target=$ELECTRON_VERSION
export npm_config_arch=$ARCH
HOME=~/.electron-gyp $NPM install