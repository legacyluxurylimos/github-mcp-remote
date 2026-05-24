FROM node:20-alpine
WORKDIR /app
EXPOSE 3000
CMD ["npx", "-y", "@supercorp-ai/supergateway", "--stdio", "npx -y @modelcontextprotocol/server-github", "--port", "3000"]
