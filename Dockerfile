FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install
RUN npm install -g @modelcontextprotocol/server-github
COPY server.js .
EXPOSE 3000
CMD ["node", "server.js"]
