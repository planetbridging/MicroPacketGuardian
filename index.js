const express = require("express");
const httpProxy = require("http-proxy");
const fs = require("fs");
const https = require("https");
const http = require("http");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

require("dotenv").config();

const app = express();
const proxy = httpProxy.createProxyServer();

const port = process.env.PORT || 3000;
const targetServiceUrl = process.env.externalService;

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

    const proxyMiddleware = createProxyMiddleware({
      target: targetServiceUrl,
      changeOrigin: true,
      onProxyReq: (proxyReq, req, res) => {
        // Log the original URL
        console.log("Original URL:", req.originalUrl);

        // Log the target URL
        const targetUrl = targetServiceUrl + req.originalUrl;
        console.log("Target URL:", targetUrl);
      },
    });

    app.use("/", proxyMiddleware);

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
