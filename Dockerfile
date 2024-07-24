FROM nvidia/cuda:12.5.1-base-ubuntu24.04

WORKDIR /workspace 

COPY . /workspace

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip

COPY requirements.txt .
RUN pip install -r requirements.txt 

COPY . .

EXPOSE 8888

ENV FLASK_APP=app.py

CMD ["flask", "run", "--gpus all", "--host=0.0.0.0", "--port=8888"]
