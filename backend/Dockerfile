FROM node:18-alpine

WORKDIR /app

# Install curl and minio client
RUN apk add --no-cache curl postgresql-client && \
    wget https://dl.min.io/client/mc/release/linux-amd64/mc && \
    chmod +x mc && \
    mv mc /usr/local/bin/

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy wait-for-it.sh and the rest of the app source
COPY wait-for-it.sh .
COPY . .

# Expose port
EXPOSE 3001

# Start command
CMD ["npm", "run", "dev"]