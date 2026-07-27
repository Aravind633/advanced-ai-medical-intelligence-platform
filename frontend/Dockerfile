FROM node:22-alpine

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run the Vite dev server and bind to all network interfaces
CMD ["npm", "run", "dev", "--", "--host"]
