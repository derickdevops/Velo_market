const http = require("http");

const PORT = process.env.PORT || 3003;

const slots = [
  {
    day: "Monday",
    window: "09:00 - 12:00",
    service: "Brake and drivetrain check"
  },
  {
    day: "Wednesday",
    window: "13:00 - 16:00",
    service: "E-bike battery diagnosis"
  },
  {
    day: "Saturday",
    window: "10:00 - 14:00",
    service: "Bike fitting session"
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
    sendJson(res, 200, { service: "workshop-service", status: "ok" });
    return;
  }

  if (req.method === "GET" && req.url === "/slots") {
    sendJson(res, 200, { slots });
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Workshop service running on port ${PORT}`);
});
