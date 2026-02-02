FROM node:18-alpine

# Install LibreOffice, poppler-utils (PDF), ffmpeg (audio/video), and Python for pdf2docx
RUN apk add --no-cache \
    libreoffice \
    poppler-utils \
    ffmpeg \
    fontconfig \
    ttf-dejavu \
    ttf-liberation \
    python3 \
    py3-pip \
    && pip3 install --no-cache-dir --break-system-packages pdf2docx \
    && rm -rf /var/cache/apk/*

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
