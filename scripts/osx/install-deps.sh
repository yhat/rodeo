#!/bin/bash
# see https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build

# for troubleshooting
brew doctor
brew update
brew --version

# because the standard osx python is locked down for some reason
brew install python

# so we can build windows on mac
brew install Caskroom/cask/xquartz wine mono

# so we can build linux on mac
brew install gnu-tar libicns graphicsmagick

# so we can run node
brew install nvm
if grep -Fxq "export NVM_DIR=~/.nvm" ~/.bash_profile
then
    echo 'source $(brew --prefix nvm)/nvm.sh' >> ~/.bashrc
    echo 'export NVM_DIR=~/.nvm' >> ~/.bashrc
else
    echo 'nvm already exists in bashrc'
fi

# so we can test the setup
pip install -q --upgrade setuptools pip
pip install -q jupyter
pip install -q numpy matplotlib plotly toyplot ipywidgets==4.1.1 pandas
