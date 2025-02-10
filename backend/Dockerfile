FROM node:23 AS build-env

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    bash \
    python3 \
    python3-pip \
    make \
    g++ \
    libc6-dev \
    libjpeg-dev \
    libpng-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libgif-dev \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

WORKDIR /usr/app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm run build

CMD ["node", "dist/server.js"]
