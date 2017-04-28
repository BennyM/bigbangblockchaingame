FROM node:latest

MAINTAINER Benny Michielsen

RUN npm install -g --unsafe truffle
RUN npm install -g --unsafe ethereumjs-testrpc

ENTRYPOINT ["/bin/bash"]
