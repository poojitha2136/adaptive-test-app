FROM python:3.10-slim

WORKDIR /app

COPY server ./server

RUN pip install -r server/requirements.txt

CMD ["python", "server/tests/run_tests.py"]
