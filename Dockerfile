FROM python

WORKDIR /workspace 

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY . /workspace

COPY requirements.txt .
RUN pip install -r requirements.txt 

COPY . .

EXPOSE 8889

ENV FLASK_APP=/workspace/host/app.py

# CMD ["flask", "run", "--host=0.0.0.0", "--port=8889"]
