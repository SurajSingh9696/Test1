FROM node:18-slim

# Install system dependencies: LibreOffice, poppler-utils (PDF), ffmpeg (audio/video), Java, and Python
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice \
    poppler-utils \
    ffmpeg \
    libavcodec-extra \
    fontconfig \
    fonts-dejavu-core \
    fonts-liberation \
    python3 \
    python3-pip \
    python3-venv \
    # Full JDK for tabula-java image processing
    default-jdk-headless \
    # Required for image processing
    libjpeg-dev \
    libpng-dev \
    libfreetype6 \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages (pre-built wheels available on Debian)
RUN pip3 install --no-cache-dir --break-system-packages \
    pdf2docx \
    tabula-py \
    pandas \
    openpyxl \
    python-docx \
    reportlab \
    pdf2image \
    python-pptx \
    beautifulsoup4 \
    lxml \
    pdfplumber

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
