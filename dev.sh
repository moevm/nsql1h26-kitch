#!/bin/bash

cp .env.example .env

docker-compose down -v

sleep 5

docker-compose -f docker-compose.dev.yml up --build -d
