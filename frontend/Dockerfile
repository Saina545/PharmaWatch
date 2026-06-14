FROM node:16-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

ENV PORT=80
ENV WDS_SOCKET_PORT=0
ENV CHOKIDAR_USEPOLLING=true

EXPOSE 80

CMD ["npm", "start"]