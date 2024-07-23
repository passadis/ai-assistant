# Use the official Node.js 18 image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json (if available) files
COPY package*.json ./

# Install dependencies in the container
RUN npm install

# Copy the rest of your application's code
COPY . .

# Your app binds to port 3001, expose it
EXPOSE 3001

# Define the command to run the app
CMD ["node", "server.js"]
