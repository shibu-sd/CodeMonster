FROM python:3.11-alpine

RUN adduser -D -s /bin/sh coderunner

WORKDIR /workspace
RUN chown coderunner:coderunner /workspace

COPY runner.py /runner.py
RUN chmod +x /runner.py

USER coderunner

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

CMD ["python", "/runner.py"]
