FROM python:3.10-slim

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN apt-get update && apt-get install -y ffmpeg libsm6 libxext6 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

RUN mkdir -p /code/uploads /code/heatmaps
RUN chmod -R 777 /code/uploads /code/heatmaps

COPY . /code

RUN touch /code/medical_history.db && chmod 777 /code/medical_history.db

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
