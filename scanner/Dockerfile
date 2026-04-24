FROM node:22-alpine
WORKDIR /app
COPY scanner/package*.json ./
RUN npm install --omit=dev
COPY scanner/ ./
COPY prompts/ /prompts/
EXPOSE 3001
CMD ["node", "webhook.js"]
