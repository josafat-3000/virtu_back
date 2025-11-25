FROM node:20-alpine

RUN apk -U add --no-cache openssl dbus

# Set the working directory
WORKDIR /app

# Copy only the necessary files for installation
COPY package*.json ./ 
COPY prisma ./prisma/

# Install dependencies
RUN npm install --production

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=production

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]