# Use official Node.js 18 image from Docker Hub
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port your app runs on (adjust as needed)
EXPOSE 8000

# Command to run your app (adjust for your app)
CMD ["npm", "start"]