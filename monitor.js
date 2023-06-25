const express = require("express");
const httpProxy = require("http-proxy");
const fs = require("fs");
const https = require("https");
const http = require("http");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");
const JavaScriptObfuscator = require("javascript-obfuscator");
const socketIO = require("socket.io");
const crypto = require("crypto");

var objTemplateEngine = require("./objTemplateEngine");
const loadFilesIntoMap = require("./load");
var pageMapTemplates = require("./pageMappingTemplates");

function calculateMD5Hash(data) {
  const md5Hash = crypto.createHash("md5");
  md5Hash.update(data);
  return md5Hash.digest("hex");
}

class objMonitor {
  isHttpsEnabled = "";
  hServer;
  websitePaths = new Map();
  websitePathCount = new Map();
  websiteFileCount = new Map();
  websitePathsUUID = "";
  websitePathCountUUID = "";
  websiteFileCountUUID = "";
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
  io;
  uiServer;
  constructor(isHttpsEnabled, targetServiceUrl) {
    this.isHttpsEnabled = isHttpsEnabled;
    this.targetServiceUrl = targetServiceUrl;
    this.appListener = express();
    this.appUI = express();
    this.uiServer = http.createServer(this.appUI);
    this.io = socketIO(this.uiServer);
    this.objTmpEngine = new objTemplateEngine();
    this.fileMap = loadFilesIntoMap("./public");
    this.listenerPaths();
    this.setupListener();

    this.setupUI();
  }

  mapToMd5uuid(lstMap) {
    const mapString = JSON.stringify(Array.from(lstMap));
    const md5String = calculateMD5Hash(mapString);
    return md5String;
  }

  updateUUIDForWebsiteMap() {
    const md5StringwebsitePaths = this.mapToMd5uuid(this.websitePaths);
    this.websitePathsUUID = md5StringwebsitePaths;

    const md5StringwebsitePathCount = this.mapToMd5uuid(this.websitePathCount);
    this.websitePathCountUUID = md5StringwebsitePathCount;

    const md5StringwebsiteFileCount = this.mapToMd5uuid(this.websiteFileCount);
    this.websiteFileCountUUID = md5StringwebsiteFileCount;
  }

  async setupWebSocket() {
    this.io.on("connection", (socket) => {
      console.log("A user connected");

      const timer = setInterval(() => {
        socket.emit("websitePathsUUID", this.websitePathsUUID);
        socket.emit("websitePathCountUUID", this.websitePathCountUUID);
        socket.emit("websiteFileCountUUID", this.websiteFileCountUUID);
      }, 1000);

      socket.on("websitePathCount", (message) => {
        const mapStringPathCount = JSON.stringify(
          Array.from(this.websitePathCount)
        );
        this.io.emit("websitePathCount", mapStringPathCount);
      });

      socket.on("websiteFileCount", (message) => {
        const mapStringFileCount = JSON.stringify(
          Array.from(this.websiteFileCount)
        );
        this.io.emit("websiteFileCount", mapStringFileCount);
      });

      socket.on("websitePaths", (message) => {
        const mapString = JSON.stringify(Array.from(this.websitePaths));
        const mapStringPathCount = JSON.stringify(
          Array.from(this.websitePathCount)
        );
        const mapStringFileCount = JSON.stringify(
          Array.from(this.websiteFileCount)
        );
        this.io.emit("websitePathCount", mapStringPathCount);
        this.io.emit("websiteFileCount", mapStringFileCount);
        this.io.emit("websitePaths", mapString);
      });

      socket.on("disconnect", () => {
        console.log("A user disconnected");
      });
    });
  }

  async setupUI() {
    try {
      this.appUI.use(express.static(path.join(__dirname, "publicExpress")));
      this.appUI.get("/socket.io/socket.io.js", (req, res) => {
        res.sendFile(
          path.join(
            __dirname,
            "node_modules",
            "socket.io",
            "client-dist",
            "socket.io.js"
          )
        );
      });
      this.setupWebSocket();
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

          var pageMapTemp1 = pageMapTemplates.showMapDiagramTabs();
          //console.log(pageMapTemp1);
          data += this.objTmpEngine.jToH(pageMapTemp1);

          var pageMapTemp1Tbl = pageMapTemplates.showMapTables();
          //console.log(pageMapTemp1);
          data += this.objTmpEngine.jToH(pageMapTemp1Tbl);

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

      this.uiServer.listen(58123, function () {
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
              console.log(mainPath, req.originalUrl);

              //websitePathCount = new Map();
              //websiteFileCount = new Map();

              if (this.websitePathCount.has(mainPath)) {
                var count = this.websitePathCount.get(mainPath);
                count += 1;
                this.websitePathCount.set(mainPath, count);
              } else {
                this.websitePathCount.set(mainPath, 1);
              }

              if (this.websiteFileCount.has(mainPath + req.originalUrl)) {
                var count = this.websiteFileCount.get(
                  mainPath + req.originalUrl
                );
                count += 1;
                this.websiteFileCount.set(mainPath + req.originalUrl, count);
              } else {
                this.websiteFileCount.set(mainPath + req.originalUrl, 1);
              }

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

          //console.log(this.websitePaths);

          this.updateUUIDForWebsiteMap();

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
