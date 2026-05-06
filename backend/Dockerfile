FROM node:20-alpine

# Install openssl for Prisma compatibility on Alpine Linux
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy prisma schema and generate client with correct platform binaries
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source and build TypeScript
COPY . .
RUN npm run build

# Write the startup script directly inside the image (avoids CRLF issues from Windows)
RUN printf '#!/bin/sh\n\
echo "=== TaskFlow AI Starting ==="\n\
echo "Running migrations..."\n\
npx prisma migrate deploy\n\
echo "Checking if seed is needed..."\n\
USER_COUNT=$(node -e "const {PrismaClient}=require('"'"'@prisma/client'"'"');const p=new PrismaClient();p.user.count().then(c=>{console.log(c);p.\$disconnect();}).catch(()=>{console.log(0);})")\n\
if [ "$USER_COUNT" = "0" ]; then\n\
  echo "Database empty - seeding..."\n\
  npm run seed\n\
else\n\
  echo "Database has $USER_COUNT users - skipping seed"\n\
fi\n\
echo "Starting server..."\n\
exec node dist/index.js\n\
' > /app/start.sh && chmod +x /app/start.sh

CMD ["/bin/sh", "/app/start.sh"]
