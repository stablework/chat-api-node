FROM node:21.7.1

LABEL Name="WWU"
LABEL Dept="DevOps"

WORKDIR /app
COPY . /app

RUN apt-get update && apt-get install lsof -y 

RUN chmod +x docker/node/entrypoint.sh
RUN cat docker/node/entrypoint.sh
ENTRYPOINT [ "bash", "docker/node/entrypoint.sh"]
