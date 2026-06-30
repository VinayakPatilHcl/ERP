# Hospital ERP - Makefile
# Requires: make (Git Bash / WSL / choco install make), JDK 21, Maven, Node 18+, npm, Docker (optional), psql (optional)

# ---- Config (override on CLI, e.g. `make run-backend DB_URL=...`) ----
BACKEND_DIR      := backend
FRONTEND_DIR     := frontend
MVN              ?= mvn
NPM              ?= npm
DOCKER           ?= docker
COMPOSE          ?= docker compose

DB_NAME          ?= hospital_erp
DB_USER          ?= hospital
DB_PASSWORD      ?= hospital
DB_HOST          ?= localhost
DB_PORT          ?= 5432

JAR              := $(BACKEND_DIR)/target/hospital-erp-backend-0.0.1-SNAPSHOT.jar
IMAGE_BACKEND    ?= hospital-erp-backend
IMAGE_FRONTEND   ?= hospital-erp-frontend
TAG              ?= latest
REGISTRY         ?=
EXPORT_DIR       ?= dist-images
DEPLOY_COMPOSE   := docker-compose.deploy.yml

.DEFAULT_GOAL := help

# ---------------------------------------------------------------------
# Help
# ---------------------------------------------------------------------
.PHONY: help
help:
	@echo "Hospital ERP - available targets:"
	@echo ""
	@echo "  Setup:"
	@echo "    make install            Install backend & frontend dependencies"
	@echo "    make install-backend    mvn dependency resolve"
	@echo "    make install-frontend   npm install"
	@echo "    make db-create          Create Postgres DB + user (needs psql, superuser)"
	@echo ""
	@echo "  Build:"
	@echo "    make build              Build both backend (jar) and frontend (dist)"
	@echo "    make build-backend      Package Spring Boot jar"
	@echo "    make build-frontend     Vite production build"
	@echo ""
	@echo "  Run (dev):"
	@echo "    make run                Run backend + frontend together"
	@echo "    make run-backend        spring-boot:run"
	@echo "    make run-frontend       vite dev server"
	@echo "    make run-jar            Run the packaged backend jar"
	@echo ""
	@echo "  Test / Quality:"
	@echo "    make test               Run backend + frontend tests"
	@echo "    make test-backend       mvn test"
	@echo "    make test-frontend      Frontend type-check"
	@echo ""
	@echo "  Docker:"
	@echo "    make docker-build       Build backend & frontend images"
	@echo "    make docker-up          docker compose up -d (db + backend + frontend)"
	@echo "    make docker-down        docker compose down"
	@echo "    make docker-logs        docker compose logs -f"
	@echo ""
	@echo "  Deploy / Export:"
	@echo "    make docker-push        Tag & push images to REGISTRY (set REGISTRY=…)"
	@echo "    make docker-save        Export images as .tar files into dist-images/"
	@echo "    make docker-load        Load images from dist-images/ .tar files"
	@echo "    make deploy-up          Start from pre-built images (docker-compose.deploy.yml)"
	@echo "    make deploy-down        Stop deployed stack"
	@echo ""
	@echo "  Clean:"
	@echo "    make clean              Remove build artifacts (target/, dist/, node_modules/)"
	@echo ""

# ---------------------------------------------------------------------
# Install
# ---------------------------------------------------------------------
.PHONY: install install-backend install-frontend
install: install-backend install-frontend

install-backend:
	cd $(BACKEND_DIR) && $(MVN) -q -DskipTests dependency:resolve

install-frontend:
	cd $(FRONTEND_DIR) && $(NPM) install

# ---------------------------------------------------------------------
# Database (local Postgres convenience target)
# ---------------------------------------------------------------------
.PHONY: db-create db-drop
db-create:
	@echo "Creating database '$(DB_NAME)' and user '$(DB_USER)'..."
	psql -U postgres -h $(DB_HOST) -p $(DB_PORT) -v ON_ERROR_STOP=1 -c "CREATE USER $(DB_USER) WITH PASSWORD '$(DB_PASSWORD)';" || true
	psql -U postgres -h $(DB_HOST) -p $(DB_PORT) -v ON_ERROR_STOP=1 -c "CREATE DATABASE $(DB_NAME) OWNER $(DB_USER);" || true
	psql -U postgres -h $(DB_HOST) -p $(DB_PORT) -v ON_ERROR_STOP=1 -c "GRANT ALL PRIVILEGES ON DATABASE $(DB_NAME) TO $(DB_USER);"

db-drop:
	psql -U postgres -h $(DB_HOST) -p $(DB_PORT) -c "DROP DATABASE IF EXISTS $(DB_NAME);"

# ---------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------
.PHONY: build build-backend build-frontend
build: build-backend build-frontend

build-backend:
	cd $(BACKEND_DIR) && $(MVN) -DskipTests clean package

build-frontend:
	cd $(FRONTEND_DIR) && $(NPM) run build

# ---------------------------------------------------------------------
# Run (development)
# ---------------------------------------------------------------------
.PHONY: run run-backend run-frontend run-jar
run:
	@echo "Starting backend (8080) and frontend (5173)..."
	@$(MAKE) -j2 run-backend run-frontend

run-backend:
	cd $(BACKEND_DIR) && $(MVN) spring-boot:run

run-frontend:
	cd $(FRONTEND_DIR) && $(NPM) run dev

run-jar: build-backend
	java -jar $(JAR)

# ---------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------
.PHONY: test test-backend test-frontend
test: test-backend test-frontend

test-backend:
	cd $(BACKEND_DIR) && $(MVN) test

test-frontend:
	cd $(FRONTEND_DIR) && npx tsc -b --noEmit

# ---------------------------------------------------------------------
# Docker
# ---------------------------------------------------------------------
.PHONY: docker-build docker-build-backend docker-build-frontend docker-up docker-down docker-logs
docker-build: docker-build-backend docker-build-frontend

docker-build-backend:
	$(DOCKER) build -t $(IMAGE_BACKEND):$(TAG) -f $(BACKEND_DIR)/Dockerfile $(BACKEND_DIR)

docker-build-frontend:
	$(DOCKER) build -t $(IMAGE_FRONTEND):$(TAG) -f $(FRONTEND_DIR)/Dockerfile $(FRONTEND_DIR)

docker-up:
	$(COMPOSE) up -d --build

docker-down:
	$(COMPOSE) down

docker-logs:
	$(COMPOSE) logs -f

# ---------------------------------------------------------------------
# Deploy / Export
# ---------------------------------------------------------------------
.PHONY: docker-push docker-save docker-load deploy-up deploy-down

# Push images to a container registry.
# Usage: make docker-push REGISTRY=myregistry.azurecr.io TAG=1.0.0
docker-push: docker-build
ifndef REGISTRY
	$(error REGISTRY is not set. Usage: make docker-push REGISTRY=myregistry.azurecr.io)
endif
	$(DOCKER) tag $(IMAGE_BACKEND):$(TAG) $(REGISTRY)/$(IMAGE_BACKEND):$(TAG)
	$(DOCKER) tag $(IMAGE_FRONTEND):$(TAG) $(REGISTRY)/$(IMAGE_FRONTEND):$(TAG)
	$(DOCKER) push $(REGISTRY)/$(IMAGE_BACKEND):$(TAG)
	$(DOCKER) push $(REGISTRY)/$(IMAGE_FRONTEND):$(TAG)
	@echo "Pushed $(REGISTRY)/$(IMAGE_BACKEND):$(TAG) and $(REGISTRY)/$(IMAGE_FRONTEND):$(TAG)"

# Export images as .tar files for offline / air-gapped deployment.
# Usage: make docker-save
docker-save: docker-build
	@mkdir -p $(EXPORT_DIR)
	$(DOCKER) save -o $(EXPORT_DIR)/hospital-erp-backend-$(TAG).tar $(IMAGE_BACKEND):$(TAG)
	$(DOCKER) save -o $(EXPORT_DIR)/hospital-erp-frontend-$(TAG).tar $(IMAGE_FRONTEND):$(TAG)
	@echo "Images saved to $(EXPORT_DIR)/"
	@echo "To deploy on the target machine:"
	@echo "  1. Copy $(EXPORT_DIR)/ and docker-compose.deploy.yml to the target"
	@echo "  2. Run: make docker-load"
	@echo "  3. Run: make deploy-up"

# Load images from .tar files (on the target machine).
docker-load:
	$(DOCKER) load -i $(EXPORT_DIR)/hospital-erp-backend-$(TAG).tar
	$(DOCKER) load -i $(EXPORT_DIR)/hospital-erp-frontend-$(TAG).tar
	@echo "Images loaded successfully."

# Start the stack from pre-built images (no source code needed).
deploy-up:
	REGISTRY=$(REGISTRY) TAG=$(TAG) $(COMPOSE) -f $(DEPLOY_COMPOSE) up -d

# Stop the deployed stack.
deploy-down:
	$(COMPOSE) -f $(DEPLOY_COMPOSE) down

# ---------------------------------------------------------------------
# Clean
# ---------------------------------------------------------------------
.PHONY: clean clean-backend clean-frontend
clean: clean-backend clean-frontend

clean-backend:
	cd $(BACKEND_DIR) && $(MVN) clean

clean-frontend:
	rm -rf $(FRONTEND_DIR)/dist $(FRONTEND_DIR)/node_modules
