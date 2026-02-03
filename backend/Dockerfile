FROM node:18-alpine

# Install LibreOffice, poppler-utils (PDF), ffmpeg (audio/video), Java, and Python for pdf2docx
# Build dependencies are installed temporarily for opencv-python-headless
RUN apk add --no-cache \
    libreoffice \
    poppler-utils \
    ffmpeg \
    fontconfig \
    ttf-dejavu \
    ttf-liberation \
    python3 \
    py3-pip \
    openjdk11-jre-headless \
    # Build dependencies for opencv-python-headless
    && apk add --no-cache --virtual .build-deps \
    gcc \
    g++ \
    cmake \
    make \
    musl-dev \
    python3-dev \
    linux-headers \
    && pip3 install --no-cache-dir --break-system-packages pdf2docx tabula-py pandas openpyxl python-docx reportlab pdf2image python-pptx beautifulsoup4 lxml \
    # Remove build dependencies to keep image smaller
    && apk del .build-deps \
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
