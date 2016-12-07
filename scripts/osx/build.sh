STARTING_DIR=$(pwd)
TARGET_DIR=~/Projects/yhat/rodeo
CACHE_MIN=999999999

#guarantee nvm
echo '#guarantee nvm'
if ! brew list --versions | grep -q nvm; then
    brew install nvm
fi
source $(brew --prefix nvm)/nvm.sh

#install script dependencies
echo '#install script dependencies'
npm install -q --cache-min $CACHE_MIN -g gulp-cli electron-prebuilt

#build application (production and dev dependnencies)
cd $TARGET_DIR
echo '#build application (production and dev dependnencies)'
rm -rf app dist
npm install -q --cache-min $CACHE_MIN
npm run build
cd $STARTING_DIR

#install application including production dependencies only (no dev)
echo '#install application including production dependencies only (no dev)'
cd "$TARGET_DIR/app"
npm install -q --production --no-bin-links --cache-min $CACHE_MIN
npm -q dedupe
cd $STARTING_DIR
