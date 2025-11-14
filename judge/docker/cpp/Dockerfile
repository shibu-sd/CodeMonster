FROM alpine:latest

RUN adduser -D -s /bin/sh coderunner

WORKDIR /workspace
RUN chown coderunner:coderunner /workspace

RUN apk add --no-cache g++ && \
    rm -rf /usr/share/man \
           /usr/share/doc \
           /usr/share/info \
           /usr/lib/gcc/*/*/install-tools \
           /usr/lib/gcc/*/*/plugin \
           /var/cache/apk/* \
           /tmp/*

COPY runner.cpp /runner.cpp
COPY runner.sh /runner.sh

RUN sed -i 's|#!/bin/bash|#!/bin/sh|' /runner.sh && \
    chmod +x /runner.sh

USER coderunner

ENV CXX=g++
ENV CXXFLAGS="-std=c++17 -O2 -Wall"

CMD ["/runner.sh"]
