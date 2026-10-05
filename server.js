const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const bikes = [
  {
    id: 1,
    brand: "Canyon",
    model: "Aeroad CF SLX",
    type: "Road",
    price: 5200,
    weight: "7.4 kg",
    frame: "Carbon",
    size: "M",
    location: "Douala",
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1400&q=80",
    tags: ["Race ready", "Carbon frame", "Aero"],
    rating: 4.9
  },
  {
    id: 2,
    brand: "Trek",
    model: "Fuel EX 9.8",
    type: "Mountain",
    price: 6100,
    weight: "13.2 kg",
    frame: "Carbon",
    size: "L",
    location: "Yaounde",
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1400&q=80",
    tags: ["Trail suspension", "Tubeless", "Hydraulic brakes"],
    rating: 4.8
  },
  {
    id: 3,
    brand: "Specialized",
    model: "Turbo Vado",
    type: "Electric",
    price: 3900,
    weight: "21.0 kg",
    frame: "Aluminum",
    size: "M",
    location: "Buea",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1400&q=80",
    tags: ["E-bike", "City commute", "Long range"],
    rating: 4.7
  },
  {
    id: 4,
    brand: "Giant",
    model: "Defy Advanced",
    type: "Road",
    price: 2800,
    weight: "8.6 kg",
    frame: "Carbon",
    size: "S",
    location: "Limbe",
    image: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1400&q=80",
    tags: ["Endurance", "Comfort fit", "Disc brakes"],
    rating: 4.6
  },
  {
    id: 5,
    brand: "Cannondale",
    model: "Topstone Carbon",
    type: "Gravel",
    price: 3400,
    weight: "9.8 kg",
    frame: "Carbon",
    size: "M",
    location: "Kribi",
    image: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1400&q=80",
    tags: ["Gravel", "Adventure", "Bikepacking"],
    rating: 4.8
  },
  {
    id: 6,
    brand: "Brompton",
    model: "C Line Explore",
    type: "Folding",
    price: 1850,
    weight: "12.1 kg",
    frame: "Steel",
    size: "One size",
    location: "Douala",
    image: "https://images.unsplash.com/photo-1593764592116-bfb2a97c642a?auto=format&fit=crop&w=1400&q=80",
    tags: ["Folding", "Urban", "Compact"],
    rating: 4.5
  }
];

const inquiries = [];

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function filterBikes(requestUrl) {
  const url = new URL(requestUrl, "http://localhost");
  const type = url.searchParams.get("type") || "all";
  const frame = url.searchParams.get("frame") || "all";
  const maxPrice = Number(url.searchParams.get("maxPrice") || 1000000);
  const search = (url.searchParams.get("search") || "").toLowerCase();

  return bikes.filter(bike => {
    const matchesType = type === "all" || bike.type === type;
    const matchesFrame = frame === "all" || bike.frame === frame;
    const matchesPrice = bike.price <= maxPrice;
    const searchable = `${bike.brand} ${bike.model} ${bike.type} ${bike.location}`.toLowerCase();
    return matchesType && matchesFrame && matchesPrice && searchable.includes(search);
  });
}

function serveStatic(req, res) {
  const rawPath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const safePath = path.normalize(rawPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream"
    });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url.startsWith("/api/bikes")) {
    sendJson(res, 200, { bikes: filterBikes(req.url) });
    return;
  }

  if (req.method === "GET" && req.url === "/api/stats") {
    const averagePrice = Math.round(bikes.reduce((sum, bike) => sum + bike.price, 0) / bikes.length);
    sendJson(res, 200, {
      totalBikes: bikes.length,
      averagePrice,
      inquiries: inquiries.length,
      categories: [...new Set(bikes.map(bike => bike.type))].length
    });
    return;
  }

  if (req.method === "POST" && req.url === "/api/inquiries") {
    try {
      const body = await parseBody(req);
      const inquiry = {
        id: inquiries.length + 1,
        name: String(body.name || "").trim(),
        phone: String(body.phone || "").trim(),
        bikeId: Number(body.bikeId),
        message: String(body.message || "").trim(),
        createdAt: new Date().toISOString()
      };

      if (!inquiry.name || !inquiry.phone || !inquiry.bikeId) {
        sendJson(res, 400, { error: "Name, phone, and bike are required." });
        return;
      }

      inquiries.push(inquiry);
      sendJson(res, 201, { inquiry, message: "Request received. A bike advisor will contact you." });
    } catch (error) {
      sendJson(res, 400, { error: "Invalid request body." });
    }
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`VeloMarket running on port ${PORT}`);
});
