# Desktop
Use dmg/exe

# Server Setup
1) Install node.js
Ubuntu
```bash
sudo apt-get --yes update
sudo apt-get install --yes g++ curl software-properties-common
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install --yes nodejs
sudo apt-get install --yes build-essential
# create a test user to login with
sudo adduser bob
```
CentOS
```bash
sudo yum -y update
sudo yum groupinstall -y "Development Tools"
curl --silent --location https://rpm.nodesource.com/setup | bash -
sudo yum install -y nodejs
# create a test user to login with
$ sudo adduser bob
```


2) Install python
```bash
sudo su && cd
wget https://repo.continuum.io/miniconda/Miniconda-latest-Linux-x86_64.sh
bash Miniconda-latest-Linux-x86_64.sh
source ~/.bashrc
conda install --yes jupyter pandas numpy matplotlib
cd /rodeo
npm install -g --production
```

3) Configure IP Tables

```bash
$ sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to 8000
```
