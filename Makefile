# Makefile for Docker operations

IMAGE_NAME = jointravel-front
CONTAINER_NAME = jointravel-front-container
PORT = 3003

.PHONY: build run stop clean up down

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
	docker-compose up --build

down:
	docker-compose down
