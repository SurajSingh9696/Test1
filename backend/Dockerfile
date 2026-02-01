FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN mkdir -p uploads converted

ARG PORT=5000
ENV NODE_ENV=production
ENV PORT=${PORT}

EXPOSE ${PORT}

CMD ["node", "server.js"]
