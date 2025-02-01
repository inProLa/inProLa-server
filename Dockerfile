FROM node:20-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

RUN npm prune --production

EXPOSE 3000
CMD ["node", "dist/src/main.js"]
