# Rodeo

## [Rodeo Desktop](https://www.yhat.com/products/rodeo)
![](http://blog.yhathq.com/static/img/rodeo-overview.png)

![](https://ga-beacon.appspot.com/UA-46996803-1/rodeo/README.md)

## Install

Latest Releases by OS are below:

[OS X Download](https://www.yhat.com/products/rodeo/downloads/mac/latest)

[Windows Download](https://www.yhat.com/products/rodeo/downloads/windows64/latest)

For Linux users, add the Rodeo apt / yum repo by running the commands below:

__Ubuntu/Debian__

```
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 33D40BC6
sudo add-apt-repository "deb http://rodeo-deb.yhat.com/ rodeo main"

#### install rodeo and run it
sudo apt-get update
sudo apt-get -y install rodeo
/opt/Rodeo/rodeo
```

__Fedora__

```
#### add the rodeo yum repo
sudo wget http://rodeo-rpm.yhat.com/rodeo-rpm.repo -P /etc/yum.repos.d/

##### install the package and run it
sudo yum install rodeo
/opt/Rodeo/rodeo
```

[Contributing](https://github.com/yhat/rodeo/blob/master/contributing.md)
