# Use an official Node.js runtime as a parent image
FROM mcr.microsoft.com/playwright:v1.58.2-noble

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code to the container
COPY . .

# Expose port 3000 to the outside world
EXPOSE 3000

# Define environment variable
ENV NODE_ENV=production

# Command to run the application
CMD ["node", "--max-old-space-size=200", "-r", "ts-node/register", "index.ts"]