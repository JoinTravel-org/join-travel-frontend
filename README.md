# JoinTravel Frontend

## Technologies

- React
- TypeScript
- Vite
- pnpm

## How to run

### Dependencies

Install pnpm.

```bash
npm install -g pnpm
```

Install the needed dependencies.

```bash
pnpm install
```

### Execute

```bash
# Start development environment using Vite
pnpm dev

# Build app for production
pnpm build

# Preview production app with Vite
pnpm preview
```

## Docker

### Prerequisites

- Docker installed on your system.

### Using Makefile

The project includes a Makefile for easy Docker operations.

```bash
# Build the Docker image
make build

# Run the container (accessible at http://localhost:3003)
make run

# Start with Docker Compose (builds and runs)
make up

# Stop the running container
make stop

# Stop Docker Compose
make down

# Clean up the Docker image
make clean
```

### Using Docker Compose

Alternatively, you can use Docker Compose for easier management:

```bash
# Start the application (builds and runs the container)
make up

# Stop the application
make down
```

### Manual Docker Commands

If you prefer to use Docker commands directly:

```bash
# Build the image
docker build -t jointravel-front .

# Run the container
docker run -d --name jointravel-front-container -p 3003:80 jointravel-front

# Stop the container
docker stop jointravel-front-container
docker rm jointravel-front-container

# Remove the image
docker rmi jointravel-front
```
