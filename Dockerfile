FROM yhat/sciencecluster-datascience:0.0.9

COPY . /rodeo
RUN curl -sL https://deb.nodesource.com/setup | bash - && apt-get install -y nodejs build-essential
