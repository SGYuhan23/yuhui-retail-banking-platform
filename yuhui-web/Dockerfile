FROM node:18-alpine
WORKDIR /app
ARG UMI_APP_API_HOST
ARG UMI_APP_WS_HOST
ENV UMI_APP_API_HOST=${UMI_APP_API_HOST}
ENV UMI_APP_WS_HOST=${UMI_APP_WS_HOST}
COPY package*.json ./
RUN npm ci
COPY src ./src
COPY public ./public
COPY config ./config
COPY tsconfig.json ./tsconfig.json
COPY jsconfig.json ./jsconfig.json
COPY README.md ./README.md
RUN npm run build
EXPOSE 8000

CMD ["npm", "start"]
