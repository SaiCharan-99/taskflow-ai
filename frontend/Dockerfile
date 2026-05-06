FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Vite bakes VITE_API_URL at build time — set it in Railway env vars before deploying
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
