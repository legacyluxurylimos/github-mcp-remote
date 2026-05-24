FROM node:20-alpine
WORKDIR /app
RUN npm install -g @supercorp-ai/supergateway @modelcontextprotocol/server-github
EXPOSE 3000
CMD ["supergateway", "--stdio", "npx @modelcontextprotocol/server-github", "--port", "3000"]
