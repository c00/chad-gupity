# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory to /app
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to the container
COPY package.json pnpm-lock.yaml ./

# Install pnpm and project dependencies
RUN npm install -g pnpm && pnpm install

# Copy the rest of the project files to the container
COPY . .

# Set the container's default command to run the application
CMD ["npm", "start"]