#!/bin/bash
# see https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build

# install nvm
if [[ ! -d ~/.nvm ]]; then
  touch ~/.bash_profile
  curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.1/install.sh | bash
  . ~/.nvm/nvm.sh
fi

if [[ ! -d ~/.pyenv ]]; then
  touch ~/.bash_profile
  git clone https://github.com/yyuu/pyenv.git ~/.pyenv
  echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bash_profile
  echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bash_profile
  echo 'export PATH="$PYENV_ROOT/shims:$PATH"' >> ~/.bash_profile
  export PYENV_ROOT="$HOME/.pyenv"
  export PATH="$PYENV_ROOT/bin:$PATH"
  export PATH="$PYENV_ROOT/shims:$PATH"
fi

nvm install 4.2.3
pyenv install 2.7.10

npm install -g gulp
npm install

