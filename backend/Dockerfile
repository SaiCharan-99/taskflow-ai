FROM node:20-alpine

# Install openssl for Prisma compatibility
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy prisma schema and generate client (for correct platform binaries)
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source and build TypeScript
COPY . .
RUN npm run build

# Railway injects PORT dynamically — do NOT hardcode EXPOSE
# The server binds to process.env.PORT (0.0.0.0) which Railway picks up automatically

# Run migrations then start — use ; so server starts even if migrations warn
CMD ["sh", "-c", "npx prisma migrate deploy; node dist/index.js"]
