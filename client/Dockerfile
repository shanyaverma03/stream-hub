# Use the official Node.js image.
FROM node:20

# Set the working directory.
WORKDIR /home/app

# Copy package.json and package-lock.json.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application code.
COPY . .

# Build the React app.
RUN npm run build

# Install the `serve` package to serve the static files.
RUN npm install -g serve

# Command to serve the built app.
CMD ["serve", "-s", "build"]

# Expose port 3000.
EXPOSE 3000
