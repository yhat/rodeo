#!/bin/bash
# see https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build

# install nvm
if [[ ! -d ~/.nvm ]]; then
  touch ~/.bash_profile
  curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.1/install.sh | bash
fi
. ~/.nvm/nvm.sh

if [[ ! -d ~/.pyenv ]]; then
  touch ~/.bash_profile
  git clone https://github.com/yyuu/pyenv.git ~/.pyenv
  echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bash_profile
  echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bash_profile
  echo 'export PATH="$PYENV_ROOT/shims:$PATH"' >> ~/.bash_profile
fi
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
export PATH="$PYENV_ROOT/shims:$PATH"

nvm install 4.2.3
pyenv install --skip-existing 2.7.10
pyenv version
pyenv global 2.7.10
pyenv version
pyenv which python

npm install -g gulp
npm install

# so we can test the setup
pip install -q --upgrade setuptools pip
pip install -q jupyter
pip install -q numpy matplotlib plotly toyplot ipywidgets==4.1.1 pandas

