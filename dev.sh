#!/bin/bash

cp .env.example .env

docker-compose down -v

docker-compose -f docker-compose.dev.yml up --build -d
