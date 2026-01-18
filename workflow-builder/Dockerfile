# Stage 1: Build the React application
FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Set the API URL at build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve the application using a Node static server
FROM node:20-slim

WORKDIR /app

# Install 'serve' globally to handle static file serving and SPA routing
RUN npm install -g serve

# Copy only the built files from the build stage
COPY --from=build /app/dist /app/dist

# Expose the port (Docker Compose uses 5173, so we match it here)
EXPOSE 80

# Run 'serve' 
# -s flag: Single Page Application mode (redirects all 404s to index.html)
# -l 80: Listen on port 80
CMD ["serve", "-s", "dist", "-l", "80"]