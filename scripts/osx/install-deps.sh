#!/bin/bash
# see https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build

cat ~/.bashrc
cat ~/.bash_profile

# for troubleshooting
brew doctor
brew update
brew --version

# so we can run node
brew install nvm
if grep -Fxq "export NVM_DIR=~/.nvm" ~/.bash_profile
then
    echo 'nvm already exists in bash_profile'
    cat ~/.bash_profile
else
    touch ~/.bash_profile
    mkdir ~/.nvm
    echo 'export NVM_DIR=~/.nvm' >> ~/.bash_profile
    echo '. "$(brew --prefix nvm)/nvm.sh"' >> ~/.bash_profile

    export NVM_DIR=~/.nvm
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm

    cat ~/.bash_profile

    source ~/.nvm/nvm.sh

    nvm install 5
fi

# because the standard osx python is locked down for some reason
brew install python

# so we can build windows on mac
brew install Caskroom/cask/xquartz wine mono

# so we can build linux on mac
brew install gnu-tar libicns graphicsmagick

# so we can test the setup
pip install -q --upgrade setuptools pip
pip install -q jupyter
pip install -q numpy matplotlib plotly toyplot ipywidgets==4.1.1 pandas
