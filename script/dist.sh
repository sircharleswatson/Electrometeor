#!/bin/bash
set -e # Auto-exit on error

DIR="$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE=$DIR/..
NPM="$BASE/cache/node/bin/npm"
NODE="$BASE/cache/node/bin/node"
VERSION=$($NODE -pe 'JSON.parse(process.argv[1]).version' "$(cat package.json)")

source $DIR/colors.sh

$BASE/script/setup.sh
rm -rf ./bundle

cecho "-----> Building bundle from Meteor app, this may take a few minutes..." $blue

cd $BASE/meteor
meteor build --directory ../.

cd $BASE/bundle

cecho "-----> Installing bundle npm packages." $blue
cd programs/server
$NPM install
cecho "Bundle created." $green

cd $BASE

rm -rf ./dist/osx
mkdir -p ./dist/osx

DIST_NAME=Electrometeor
DIST_APP=$DIST_NAME.app

cecho "-----> Creating $DIST_APP..." $blue
find cache/electron -name "debug\.log" -print0 | xargs -0 rm -rf
cp -R cache/electron/Electron.app dist/osx/
mv dist/osx/Electron.app dist/osx/$DIST_APP
mv dist/osx/$DIST_APP/Contents/MacOS/Electron dist/osx/$DIST_APP/Contents/MacOS/$DIST_NAME
mkdir -p dist/osx/$DIST_APP/Contents/Resources/app

cecho "-----> Copying meteor bundle into $DIST_APP..." $blue
mv bundle dist/osx/$DIST_APP/Contents/Resources/app/

cecho "-----> Copying startup files into $DIST_APP..." $blue
cp index.js dist/osx/$DIST_APP/Contents/Resources/app/
cp package.json dist/osx/$DIST_APP/Contents/Resources/app/
cp -R node_modules dist/osx/$DIST_APP/Contents/Resources/app/

cecho "-----> Copying binary files to $DIST_APP" $blue
mkdir -p dist/osx/$DIST_APP/Contents/Resources/app/resources
cp -v resources/* dist/osx/$DIST_APP/Contents/Resources/app/resources/ || :

cecho "-----> Copying icon to $DIST_APP" $blue
# cp electrometeor.icns dist/osx/$DIST_APP/Contents/Resources/electron.icns

chmod +x dist/osx/$DIST_APP/Contents/Resources/app/resources/node
chmod -R u+w dist/osx/$DIST_APP/Contents/Resources/app/bundle

cecho "-----> Updating Info.plist version to $VERSION" $blue
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $VERSION" $BASE/dist/osx/$DIST_APP/Contents/Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName $DIST_NAME" $BASE/dist/osx/$DIST_APP/Contents/Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleName $DIST_NAME" $BASE/dist/osx/$DIST_APP/Contents/Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier com.electrometeor.electrometeor" $BASE/dist/osx/$DIST_APP/Contents/Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleExecutable $DIST_NAME" $BASE/dist/osx/$DIST_APP/Contents/Info.plist

if [ -f $DIR/sign.sh ]; then
  cecho "-----> Signing app file...." $blue
  $DIR/sign.sh $BASE/dist/osx/$DIST_APP
fi

cd $BASE/dist/osx
cecho "-----> Creating distributable zip file...." $blue
ditto -c -k --sequesterRsrc --keepParent $DIST_APP $DIST_NAME-$VERSION.zip

cecho "Done." $green
cecho "$DIST_NAME app available at dist/osx/$DIST_APP" $green
cecho "$DIST_NAME zip distribution available at dist/osx/$DIST_NAME-$VERSION.zip" $green
