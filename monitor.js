const express = require("express");
const httpProxy = require("http-proxy");
const fs = require("fs");
const https = require("https");
const http = require("http");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");
const JavaScriptObfuscator = require("javascript-obfuscator");

var objTemplateEngine = require("./objTemplateEngine");
const loadFilesIntoMap = require("./load");

class objMonitor {
  isHttpsEnabled = "";
  hServer;
  websitePaths = new Map();
  acceptedFileTypes = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".svg",
    ".css",
    ".js",
    ".html",
  ];
  targetServiceUrl;
  appListener;
  appUI;
  objTmpEngine;
  fileMap;
  constructor(isHttpsEnabled, targetServiceUrl) {
    this.isHttpsEnabled = isHttpsEnabled;
    this.targetServiceUrl = targetServiceUrl;
    this.appListener = express();
    this.appUI = express();
    this.objTmpEngine = new objTemplateEngine();
    this.fileMap = loadFilesIntoMap("./public");
    this.listenerPaths();
    this.setupListener();
    this.setupUI();
  }
  async setupUI() {
    try {
      //this.appUI.use(express.static(path.join(__dirname, "public")));

      /*app.get("/pages/Home.js", (req, res) => {
  res.sendFile(__dirname + "/pages/Home.js");
});*/

      // Configure session middleware

      //userSessions.sessions(app);

      this.appUI.get("/js/Home.js", (req, res) => {
        fs.readFile(__dirname + "/pages/Home.ts", "utf8", function (err, data) {
          if (err) {
            res.status(500).send("Error reading file");
            return;
          }

          var obfuscatedCode = JavaScriptObfuscator.obfuscate(data);

          res.type(".js");
          res.send(obfuscatedCode._obfuscatedCode);
          // res.send(data);
        });
      });

      this.appUI.get("*", async (req, res) => {
        var filePath = req.path;
        const ext = path.extname(filePath);
        //console.log(ext);
        if (ext === ".js") {
          res.type("application/javascript");
        } else if (ext === ".css") {
          res.type("text/css");
        } else if (ext === ".html") {
          res.type("text/html");
        }

        //console.log(filePath);

        var data = this.objTmpEngine.topPage();

        data += this.objTmpEngine.mainMenu();

        if (filePath == "/") {
          //filePath = "index.html";

          //data += this.objTmpEngine.jToH(templateBanner());

          data += this.objTmpEngine.bottomPage();

          res.send(data);
          return;
        }

        /*for (let [key, value] of this.fileMap) {
          console.log(`Key: ${key}`);
        }*/

        if (this.fileMap.has(filePath)) {
          const fileData = this.fileMap.get(filePath);
          res.send(fileData);
          return;
        } else {
          try {
            let str = filePath;
            str = str.substring(1);
            if (this.fileMap.has(str)) {
              const fileData = this.fileMap.get(str);
              res.send(fileData);
              return;
            }

            console.log(this.fileMap.has(str), "ok:" + str);
          } catch {}

          res.status(404).send("File not found");
        }
      });

      this.appUI.listen(58123, function () {
        console.log("server running on 58123");
      });
    } catch (error) {
      console.error("Error during startup:", error);
    }
  }
  async setupListener() {
    try {
      var privateKey;
      var certificate;
      var credentials;

      const proxyMiddleware = createProxyMiddleware({
        target: this.targetServiceUrl,
        changeOrigin: true,
        onProxyReq: (proxyReq, req, res) => {
          //const userId = req;
          //console.log(userId);
          var tmpHeaders = proxyReq.getHeaders();
          //console.log("Raw Headers:", tmpHeaders);
          var mainPath = "";
          var keyHeaders = Object.keys(tmpHeaders);
          //console.log(tmpHeaders);
          if (keyHeaders.includes("referer")) {
            mainPath = tmpHeaders["referer"];
          }

          // Log the original URL
          //console.log("Original URL:", req.originalUrl);

          // Log the target URL
          //const targetUrl = targetServiceUrl + req.originalUrl;
          //console.log(req.originalUrl, mainPath);
          //console.log(req.originalUrl);
          var acceptedFileChecking = this.checkPathForAcceptedFileType(
            req.originalUrl
          );
          if (acceptedFileChecking) {
            if (mainPath.includes("?")) {
              const questionMarkIndex = mainPath.indexOf("?");
              const beforeQuestionMark =
                questionMarkIndex !== -1
                  ? mainPath.substring(0, questionMarkIndex)
                  : mainPath;
              mainPath = beforeQuestionMark;
            }
            if (mainPath != "") {
              if (this.websitePaths.has(mainPath)) {
                var tmpPathReq = this.websitePaths.get(mainPath);
                if (!tmpPathReq.includes(req.originalUrl)) {
                  const combinedArray = [
                    ...new Set([...tmpPathReq, ...[req.originalUrl]]),
                  ];
                  this.websitePaths.set(mainPath, combinedArray);
                }
              } else {
                this.websitePaths.set(mainPath, [req.originalUrl]);
              }
            }
          }

          console.log(this.websitePaths);

          /*for (const [key, value] of websitePaths) {
              console.log(key, value);
            }*/
        },
      });

      this.appListener.use("/", proxyMiddleware);

      if (this.isHttpsEnabled) {
        privateKey = fs.readFileSync("path/to/privatekey.pem", "utf8");
        certificate = fs.readFileSync("path/to/certificate.pem", "utf8");
        credentials = { key: privateKey, cert: certificate };

        this.hServer = https.createServer(credentials, this.appListener);
      } else {
        this.hServer = http.createServer(this.appListener);
      }

      this.hServer.listen(3000, () => {
        console.log("Proxy server listening on port 3000");
      });
    } catch (error) {
      console.error("Error during startup:", error);
    }
  }
  async listenerPaths() {
    this.appListener.get("/paths", (req, res) => {
      var lst = [];
      for (const [key, value] of this.websitePaths) {
        lst.push([key, value]);
      }

      res.send(lst);
    });
  }

  checkPathForAcceptedFileType(filePath) {
    if (filePath.includes(".")) {
      const fileType = path.extname(filePath);
      if (this.acceptedFileTypes.includes(fileType)) {
        return true;
      }
    }
    return false;
  }
}

module.exports = objMonitor;
