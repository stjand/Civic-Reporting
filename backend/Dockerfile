# Use Node 18 for backend services
FROM node:18-alpine

WORKDIR /app

# Install curl and minio client
RUN apk add --no-cache curl && \
    wget https://dl.min.io/client/mc/release/linux-amd64/mc && \
    chmod +x mc && \
    mv mc /usr/local/bin/

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Expose port
EXPOSE 3001

# Start command (consistent with docker-compose)
CMD ["npm", "run", "dev"]