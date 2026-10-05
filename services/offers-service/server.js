const http = require("http");

const PORT = process.env.PORT || 3002;

const offers = [
  {
    title: "Starter maintenance pack",
    value: "Free first tune-up",
    detail: "Included with every road, gravel and mountain bike this week."
  },
  {
    title: "Electric commuter bonus",
    value: "$250 accessory credit",
    detail: "Use it for lights, helmet, lock or pannier bags."
  },
  {
    title: "Trade-in inspection",
    value: "Same-day estimate",
    detail: "Bring your current bike and apply the credit to a new ride."
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
    sendJson(res, 200, { service: "offers-service", status: "ok" });
    return;
  }

  if (req.method === "GET" && req.url === "/offers") {
    sendJson(res, 200, { offers });
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Offers service running on port ${PORT}`);
});
