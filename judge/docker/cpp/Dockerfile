FROM alpine:latest

RUN adduser -D -s /bin/sh coderunner

WORKDIR /workspace
RUN chown coderunner:coderunner /workspace

RUN apk add --no-cache \
    g++ \
    gcc \
    musl-dev \
    bash \
    coreutils

COPY runner.cpp /runner.cpp
COPY runner.sh /runner.sh
RUN chmod +x /runner.sh

USER coderunner

ENV CXX=g++
ENV CXXFLAGS="-std=c++17 -O2 -Wall"

CMD ["/runner.sh"]
