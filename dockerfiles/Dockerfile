FROM alpine:latest

COPY . .

RUN apk --no-cache add --virtual builds-deps build-base python nodejs npm

RUN npm i

RUN npm rebuild bcrypt --update-binary

CMD [ "node", "server.js" ]