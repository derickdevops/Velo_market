# VeloMarket

VeloMarket is a dynamic bike sales website built as a Docker teaching project.

It includes:

- Responsive bike marketplace UI
- Dynamic inventory from `/api/bikes`
- Search, bike type, frame material and price filters
- Saved bikes using browser local storage
- Bike request form saved in server memory
- Dockerfile deployment

## Build The Docker Image

```bash
docker build -t velomarket-bike-sales:v1.0.0 .
```

## Run With Docker

```bash
docker run -d --name velomarket-bike-sales -p 8080:3000 velomarket-bike-sales:v1.0.0
```

Open:

```text
http://localhost:8080
```

## Stop

```bash
docker stop velomarket-bike-sales
docker rm velomarket-bike-sales
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
├── Dockerfile
├── package.json
├── server.js
└── public
    ├── app.js
    ├── index.html
    └── styles.css
```
