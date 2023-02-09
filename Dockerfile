FROM denoland/deno:alpine

EXPOSE 5200

WORKDIR /app

ADD . /app

RUN deno cache main.ts

CMD ["run", "-A", "main.ts"]