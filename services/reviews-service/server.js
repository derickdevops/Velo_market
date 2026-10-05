const http = require("http");

const PORT = process.env.PORT || 3001;

const reviews = [
  {
    name: "Mireille N.",
    city: "Douala",
    rating: 5,
    bike: "Canyon Aeroad CF SLX",
    comment: "The advisor helped me compare sizes before I paid."
  },
  {
    name: "Patrick A.",
    city: "Buea",
    rating: 5,
    bike: "Specialized Turbo Vado",
    comment: "The electric bike recommendation matched my commute."
  },
  {
    name: "Linda F.",
    city: "Kribi",
    rating: 4,
    bike: "Cannondale Topstone Carbon",
    comment: "Good fit guidance and clear delivery updates."
  }
];

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, { service: "reviews-service", status: "ok" });
    return;
  }

  if (req.method === "GET" && req.url === "/reviews") {
    sendJson(res, 200, { reviews });
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Reviews service running on port ${PORT}`);
});
