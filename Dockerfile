# Use the official Node.js image from the Docker Hub
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Build the application
RUN npm run build

# Expose the application port (assuming app runs on port 8000)
EXPOSE 8000

# Start the application with seeding
CMD [ "sh", "-c", "npx ts-node src/database/seed.ts && npm run start:prod" ]