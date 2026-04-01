.PHONY: up down logs seed reset ps

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

seed:
	curl -X POST http://localhost:3001/api/v1/seed

reset:
	curl -X POST http://localhost:3001/api/v1/seed/reset

ps:
	docker compose ps
