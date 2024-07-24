FROM python

WORKDIR /workspace 

COPY . /workspace

COPY requirements.txt .
RUN pip install -r requirements.txt 

COPY . .

EXPOSE 8888

ENV FLASK_APP=app.py

CMD ["flask", "run", "--gpus all", "--host=0.0.0.0", "--port=8888"]
