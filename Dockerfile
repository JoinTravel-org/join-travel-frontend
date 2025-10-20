# Multi-stage Dockerfile for building and serving a React/Vite frontend application

# Stage 1: Build the application
# Use Node.js 22 Alpine as the base image for the build stage
FROM node:22-alpine AS builder

# Set the working directory inside the container to /app
WORKDIR /app

# Accept build argument for VITE_BACKEND_URL
ARG VITE_BACKEND_URL

# Set the environment variable for Vite
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Enable corepack and prepare the latest version of pnpm for package management
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package.json and pnpm-lock.yaml to install dependencies first (for better caching)
COPY package.json pnpm-lock.yaml ./

# Install project dependencies using pnpm with frozen lockfile to ensure reproducible builds
RUN pnpm install --frozen-lockfile

# Copy the entire source code into the container
COPY . .

# Build the application for production using the build script from package.json
RUN pnpm run build

# Stage 2: Serve the application with Node.js
# Use Node.js 22 Alpine as the base image for the runtime stage
FROM node:22-alpine AS runner

# Install the 'serve' package globally to serve static files
RUN npm install -g serve

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Expose port 80 for the web server
EXPOSE 80

# Start the serve command to host the static files on port 80
CMD ["serve", "dist", "-l", "80"]
