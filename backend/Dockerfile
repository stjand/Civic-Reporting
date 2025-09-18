FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
ENV NODE_ENV=development
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]
