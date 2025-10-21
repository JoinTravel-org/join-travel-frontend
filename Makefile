# Makefile for Docker operations

IMAGE_NAME = jointravel-front
CONTAINER_NAME = jointravel-front-container
DEV_CONTAINER_NAME = jointravel-front-dev-container
PORT = 3003

.PHONY: build run stop clean up down dev dev-down dev-logs

# Production commands
build:
	docker build -t $(IMAGE_NAME) .

run:
	make build
	docker rm -f $(CONTAINER_NAME) || true
	docker run --name $(CONTAINER_NAME) -p $(PORT):80 $(IMAGE_NAME)

stop:
	docker stop $(CONTAINER_NAME)
	docker rm $(CONTAINER_NAME)

clean:
	docker rmi $(IMAGE_NAME)

up:
	docker compose up --build

down:
	docker compose down

# Development commands
dev:
	docker compose -f docker-compose-dev.yml up --build

dev-down:
	docker compose -f docker-compose-dev.yml down --remove-orphans

dev-logs:
	docker compose -f docker-compose-dev.yml logs -f
