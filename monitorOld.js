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
const bodyParser = require("body-parser");

var objTemplateEngine = require("./objTemplateEngine");
const loadFilesIntoMap = require("./load");
var pageMapTemplates = require("./pageMappingTemplates");
var objPageMonitor = require("./objPageMonitor");

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
  websitePathGetCount = new Map();
  websitePathPostCount = new Map();
  websitePathsUUID = "";
  websitePathCountUUID = "";
  websiteFileCountUUID = "";
  websiteGetCountUUID = "";
  websitePostCountUUID = "";
  acceptedFileTypes = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".svg",
    ".css",
    ".js",
    ".html",
    ".php",
    ".json",
  ];
  targetServiceUrl;
  appListener;
  appUI;
  objTmpEngine;
  fileMap;
  io;
  uiServer;
  oPageMonitor;
  constructor(isHttpsEnabled, targetServiceUrl) {
    this.isHttpsEnabled = isHttpsEnabled;
    this.targetServiceUrl = targetServiceUrl;
    this.appListener = express();
    this.oPageMonitor = new objPageMonitor(this.acceptedFileTypes);

    // parse application/x-www-form-urlencoded
    this.appListener.use(bodyParser.urlencoded({ extended: false }));

    // parse application/json
    //app.use(bodyParser.json());

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

    const md5StringwebsiteGetCount = this.mapToMd5uuid(
      this.websitePathGetCount
    );
    this.websiteGetCountUUID = md5StringwebsiteGetCount;

    const md5StringwebsitePostCount = this.mapToMd5uuid(
      this.websitePathPostCount
    );
    this.websitePostCountUUID = md5StringwebsitePostCount;
  }

  async setupWebSocket() {
    this.io.on("connection", (socket) => {
      console.log("A user connected");

      const timer = setInterval(() => {
        socket.emit("websitePathsUUID", this.websitePathsUUID);
        socket.emit("websitePathCountUUID", this.websitePathCountUUID);
        socket.emit("websiteFileCountUUID", this.websiteFileCountUUID);
        socket.emit("websiteGetCountUUID", this.websiteGetCountUUID);
        socket.emit("websitePostCountUUID", this.websitePostCountUUID);
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

        if (filePath == "/template1") {
          //filePath = "index.html";

          //data += this.objTmpEngine.jToH(templateBanner());
          data += `<div class="d-flex flex-wrap">`;
          var pageMapTemp1 = pageMapTemplates.showMapDiagramTabs();
          //console.log(pageMapTemp1);
          data += this.objTmpEngine.jToH(pageMapTemp1);

          var pageMapTemp1Tbl = pageMapTemplates.showMapTables();
          //console.log(pageMapTemp1);
          data += this.objTmpEngine.jToH(pageMapTemp1Tbl);

          data += `</div>`;

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

  appendCount(lstMap, mainPath, countPass) {
    mainPath = this.getMainPath(mainPath);
    var setPath = [mainPath, 1];
    if (lstMap.has(mainPath)) {
      var count = lstMap.get(mainPath);
      count += countPass;

      setPath = [mainPath, count];
    }
    return setPath;
  }

  countPostGetReq(req) {
    var count = 0;
    if (req != null && req != undefined) {
      var keys = Object.keys(req);
      count = keys.length;
    }
    return count;
  }

  getMainPath(mainPath) {
    const questionMarkIndex = mainPath.indexOf("?");
    const beforeQuestionMark =
      questionMarkIndex !== -1
        ? mainPath.substring(0, questionMarkIndex)
        : mainPath;
    return beforeQuestionMark;
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
          //console.log("GET variables:", req.query);
          //console.log("POST variables:", req.body);

          /*if (this.websitePathCount.has(mainPath)) {
            var count = this.websitePathCount.get(mainPath);
            count += 1;
            this.websitePathCount.set(mainPath, count);
          } else {
            this.websitePathCount.set(mainPath, 1);
          }*/

          //const userId = req;
          //console.log(userId);
          var tmpHeaders = proxyReq.getHeaders();
          //console.log("Raw Headers:", tmpHeaders);
          var mainPath = "";
          var keyHeaders = Object.keys(tmpHeaders);

          if (keyHeaders.includes("referer")) {
            mainPath = tmpHeaders["referer"];
            //console.log("---", tmpHeaders["referer"]);
          }

          var mainPathClean = mainPath;
          if (mainPathClean.includes("?")) {
            mainPathClean = this.getMainPath(mainPathClean);
          }
          //console.log("Original URL:", req.originalUrl);
          if (req.method == "POST" && req.body) {
            var countPost = this.countPostGetReq(req.body);
            this.oPageMonitor.postRequestCount(mainPath, countPost, req, res);
          }

          if (req.method == "GET") {
            var getVariableCount = this.countPostGetReq(req.query);
            this.oPageMonitor.getRequestCount(
              mainPath,
              getVariableCount,
              req,
              res
            );
            //console.log("getVariableCount:" + mainPathClean, getVariableCount);
          }

          console.log(this.oPageMonitor.uniqFileSummary);
          console.log(this.oPageMonitor.uniqPageSummary);

          var countGet = this.countPostGetReq(req.query);
          //console.log("countGet" + mainPath, countGet);
          if (countGet > 0) {
            var newSetGetCount = this.appendCount(
              this.websitePathGetCount,
              mainPath,
              countGet
            );
            this.websitePathGetCount.set(newSetGetCount[0], newSetGetCount[1]);
          }

          //console.log(countGet);

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
              mainPath = this.getMainPath(mainPath);
            }

            console.log("mainPath", mainPath);

            if (mainPath != "") {
              console.log(mainPath, req.originalUrl);

              //websitePathCount = new Map();
              //websiteFileCount = new Map();

              if (this.websitePathCount.has(mainPath)) {
                var countLoad = this.websitePathCount.get(mainPath);
                countLoad += 1;
                this.websitePathCount.set(mainPath, countLoad);
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

          if (req.method == "POST" && req.body) {
            let bodyData = JSON.stringify(req.body);
            // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
            proxyReq.setHeader("Content-Type", "application/json");
            proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
            // stream the content
            proxyReq.write(bodyData);

            var countPost = this.countPostGetReq(req.body);
            //console.log("countGet" + mainPath, countGet);
            if (countPost > 0) {
              var newSetPostCount = this.appendCount(
                this.websitePathPostCount,
                mainPath,
                countPost
              );
              //console.log(newSetPostCount);
              this.websitePathPostCount.set(
                newSetPostCount[0],
                newSetPostCount[1]
              );
              //console.log(this.websitePathPostCount);
            }
          }
        },
        /*onProxyRes: (proxyRes, req, res) => {
          // Send a response to the client here if needed
          res.send("Proxy request completed");
        },*/
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
