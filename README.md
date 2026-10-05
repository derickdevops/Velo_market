# VeloMarket

VeloMarket is a dynamic bike sales website built as a Docker teaching project.

It includes:

- Responsive bike marketplace UI
- Dynamic inventory from `/api/bikes`
- Separate Compose services for reviews, offers, and workshop slots
- Search, bike type, frame material and price filters
- Saved bikes using browser local storage
- Bike request form saved in server memory
- Docker Compose deployment with multiple images

## Services

The app is split into four containers:

- `web`: main VeloMarket website and API gateway
- `reviews-service`: returns customer reviews
- `offers-service`: returns active sales offers
- `workshop-service`: returns workshop appointment slots

Each service has its own image name in `docker-compose.yml`.

## Run With Docker Compose

```bash
docker compose up --build -d
```

Open:

```text
http://localhost:8080
```

## Check The Services

```bash
docker compose ps
curl http://localhost:8080/api/health
curl http://localhost:8080/api/reviews
curl http://localhost:8080/api/offers
curl http://localhost:8080/api/workshop-slots
```

## Stop

```bash
docker compose down
```

## Push Images To Docker Hub

Replace `YOUR_DOCKERHUB_USERNAME` with your Docker Hub username.

```bash
docker login

docker tag velomarket-web:v1.0.0 YOUR_DOCKERHUB_USERNAME/velomarket-web:v1.0.0
docker tag velomarket-reviews:v1.0.0 YOUR_DOCKERHUB_USERNAME/velomarket-reviews:v1.0.0
docker tag velomarket-offers:v1.0.0 YOUR_DOCKERHUB_USERNAME/velomarket-offers:v1.0.0
docker tag velomarket-workshop:v1.0.0 YOUR_DOCKERHUB_USERNAME/velomarket-workshop:v1.0.0

docker push YOUR_DOCKERHUB_USERNAME/velomarket-web:v1.0.0
docker push YOUR_DOCKERHUB_USERNAME/velomarket-reviews:v1.0.0
docker push YOUR_DOCKERHUB_USERNAME/velomarket-offers:v1.0.0
docker push YOUR_DOCKERHUB_USERNAME/velomarket-workshop:v1.0.0
```

## Run Without Docker

```bash
node server.js
```

Open:

```text
http://localhost:3000
```

## Project Structure

```text
.
├── docker-compose.yml
├── Dockerfile
├── package.json
├── server.js
├── public
    ├── app.js
    ├── index.html
    └── styles.css
└── services
    ├── reviews-service
    ├── offers-service
    └── workshop-service
```
