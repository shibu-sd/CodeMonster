FROM eclipse-temurin:17-jdk-alpine

RUN adduser -D -s /bin/sh coderunner
WORKDIR /workspace
RUN chown coderunner:coderunner /workspace

COPY Runner.java /Runner.java
COPY runner.sh /runner.sh
RUN chmod +x /runner.sh

RUN javac /Runner.java

USER coderunner

ENV JAVA_TOOL_OPTIONS="-Xmx256m -Xms64m -XX:+UseSerialGC -XX:MaxMetaspaceSize=128m"

CMD ["/runner.sh"]