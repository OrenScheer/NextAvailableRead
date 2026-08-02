FROM mcr.microsoft.com/playwright:v1.58.2-noble

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

ENV NODE_ENV=production

ENV TINI_VERSION=v0.19.0

ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini

RUN chmod +x /tini

ENTRYPOINT ["/tini", "--"]

CMD ["xvfb-run", "node", "--max-old-space-size=200", "-r", "ts-node/register", "index.ts"]