const express = require("express");
const httpProxy = require("http-proxy");
const fs = require("fs");
const https = require("https");
const http = require("http");
const path = require("path");

require("dotenv").config();

const app = express();
const proxy = httpProxy.createProxyServer();

const targetServicePort = 80;
const port = process.env.PORT || 3000;

(async () => {
  console.log("Welcome to Micro Packet Guardian");
  const isHttpsEnabled = process.env.PROTOCOL === "https";
  console.log("HTTPS Enabled:", isHttpsEnabled);
  console.log("Server is running on port:", port);

  // Add your startup code or any other logic here
  startup(isHttpsEnabled);
})();

async function startup(isHttpsEnabled) {
  try {
    var privateKey;
    var certificate;
    var credentials;

    app.all("*", (req, res) => {
      const targetUrl = `http://localhost:${targetServicePort}${req.originalUrl}`;
      console.log("path: ", targetUrl);

      proxy.web(req, res, { target: targetUrl });
    });

    proxy.on("proxyReq", (proxyReq, req, res, options) => {
      // Capture the path of the original request
      const originalPath = req.originalUrl;
      console.log("Captured Path:", originalPath);
    });

    var hServer;
    if (isHttpsEnabled) {
      privateKey = fs.readFileSync("path/to/privatekey.pem", "utf8");
      certificate = fs.readFileSync("path/to/certificate.pem", "utf8");
      credentials = { key: privateKey, cert: certificate };

      hServer = https.createServer(credentials, app);
    } else {
      hServer = http.createServer(app);
    }

    hServer.listen(3000, () => {
      console.log("Proxy server listening on port 3000");
    });
  } catch (error) {
    console.error("Error during startup:", error);
  }
}

function isImageResource(resourceUrl) {
  const resourcePath = url.parse(resourceUrl).pathname;
  const fileExtension = extname(resourcePath);
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp"];
  return imageExtensions.includes(fileExtension.toLowerCase());
}
