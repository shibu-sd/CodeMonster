FROM eclipse-temurin:17-jdk-alpine AS jdk-builder

RUN jlink \
    --add-modules java.base,java.compiler,jdk.compiler,jdk.zipfs,java.logging \
    --strip-debug \
    --no-man-pages \
    --no-header-files \
    --compress=2 \
    --output /custom-jdk

FROM alpine:latest

COPY --from=jdk-builder /custom-jdk /opt/java/openjdk

ENV JAVA_HOME=/opt/java/openjdk
ENV PATH="${JAVA_HOME}/bin:${PATH}"

RUN adduser -D -s /bin/sh coderunner
WORKDIR /workspace
RUN chown coderunner:coderunner /workspace

COPY Runner.java /Runner.java
COPY runner.sh /runner.sh
RUN chmod +x /runner.sh

RUN javac /Runner.java

USER coderunner

CMD ["/runner.sh"]