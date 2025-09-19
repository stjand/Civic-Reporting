# File: backend/Dockerfile
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

# Copy all files
COPY . .

# Create logs directory
RUN mkdir -p logs && chmod 755 logs

# Create S3 bucket
# Minio requires an explicit bucket creation
# This will wait for Minio service to be healthy
RUN /usr/local/bin/mc alias set local http://s3-storage:9000 minioadmin minioadmin123 && \
    /usr/local/bin/mc mb local/civic-reports || true

# Expose port
EXPOSE 3001

# Start command
CMD ["node", "src/index.js"]
