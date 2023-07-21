const express = require("express");
const useragent = require("express-useragent");
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
var geoip = require("geoip-lite");

require("dotenv").config();

var objTemplateEngine = require("./objTemplateEngine");
const loadFilesIntoMap = require("./load");
var pageMapTemplates = require("./pageMappingTemplates");
var objPageMonitor = require("./objPageMonitor");
const objPacketListener = require("./objPacketListener");

function calculateMD5Hash(data) {
  const md5Hash = crypto.createHash("md5");
  md5Hash.update(data);
  return md5Hash.digest("hex");
}

class objMonitor {
  isHttpsEnabled = "";
  hServer;
  hServerhttps;
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
  runMainOnPort;
  objOPacketListener;
  portHttps;
  constructor(
    isHttpsEnabled,
    targetServiceUrl,
    runMainOnPort,
    targetIpListen,
    portHttps
  ) {
    this.portHttps = portHttps;
    this.runMainOnPort = runMainOnPort;
    this.isHttpsEnabled = isHttpsEnabled;
    this.targetServiceUrl = targetServiceUrl;
    this.appListener = express();
    this.appListener.use(useragent.express());
    this.oPageMonitor = new objPageMonitor(this.acceptedFileTypes);

    // parse application/x-www-form-urlencoded

    this.appListener.use(bodyParser.urlencoded({ extended: true }));

    // parse application/json
    //app.use(bodyParser.json());

    this.appUI = express();
    this.uiServer = http.createServer(this.appUI);
    this.io = socketIO(this.uiServer);
    //this.tryHttps();
    this.objTmpEngine = new objTemplateEngine();
    this.fileMap = loadFilesIntoMap("./public");
    //this.listenerPaths();
    this.setupListener();

    this.setupUI();
    this.objOPacketListener = new objPacketListener(targetIpListen);
  }

  tryHttps() {
    try {
      if (this.isHttpsEnabled == "https") {
        console.log("Server is running on port:", this.portHttps);
        // Certificate
        const privateKey = fs.readFileSync(process.env.privkey, "utf8");
        const certificate = fs.readFileSync(process.env.cert, "utf8");
        const ca = fs.readFileSync(process.env.chain, "utf8");

        const credentials = {
          key: privateKey,
          cert: certificate,
          ca: ca,
        };

        const httpsServer = https.createServer(credentials, this.appUI);

        httpsServer.listen(this.portHttps, () => {
          console.log("HTTPS Server running on port ", this.portHttps);
        });
      }
    } catch (ex) {
      console.log(ex);
    }
  }

  mapToMd5uuid(lstMap) {
    const mapString = JSON.stringify(Array.from(lstMap));
    const md5String = calculateMD5Hash(mapString);
    return md5String;
  }

  jToMD5Sign(j) {
    const mapString = JSON.stringify(j);
    const md5String = calculateMD5Hash(mapString);
    return md5String;
  }

  async setupWebSocket() {
    this.io.on("connection", (socket) => {
      console.log("A user connected");

      const timer = setInterval(() => {
        socket.emit("pageMonitorUUID", this.oPageMonitor.uuid);
      }, 1000);

      const timer5Sec = setInterval(() => {
        socket.emit(
          "totalUsedPorts",
          JSON.stringify(Array.from(this.objOPacketListener.usedPorts))
        );
        socket.emit(
          "totalPortCount",
          JSON.stringify(this.objOPacketListener.lstData)
        );
        socket.emit(
          "secsPortCount",
          JSON.stringify(this.objOPacketListener.lstData5Seconds)
        );
        socket.emit(
          "minPortCount",
          JSON.stringify(this.objOPacketListener.lstData1Minute)
        );
        socket.emit(
          "HourPortCount",
          JSON.stringify(this.objOPacketListener.lstData1Hour)
        );
        socket.emit(
          "dayPortCount",
          JSON.stringify(this.objOPacketListener.lstData1Day)
        );
      }, 5000);

      //console.log(this.objOPacketListener.usedPorts);

      /*console.log(this.objOPacketListener.lstData);
lstData5Seconds;
lstData1Minute;
lstData1Hour;
lstData1Day;*/

      socket.on("pageMonitor", (message) => {
        const uniqPageSummary = JSON.stringify(
          Array.from(this.oPageMonitor.uniqPageSummary)
        );
        this.io.emit("pageMonitorPage", uniqPageSummary);

        const uniqFileSummary = JSON.stringify(
          Array.from(this.oPageMonitor.uniqFileSummary)
        );
        this.io.emit("pageMonitorFile", uniqFileSummary);

        const uniqGeo = JSON.stringify(
          Array.from(this.oPageMonitor.uniqGeoLocation)
        );
        this.io.emit("uniqGeoLocation", uniqGeo);
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
        //console.log(filePath);
        if (filePath == "/") {
          //filePath = "index.html";

          //data += this.objTmpEngine.jToH(templateBanner());

          data += `<div class="d-flex"><div class="card-group p-5">`;
          data += this.objTmpEngine.jToH(
            this.objTmpEngine.createCardTemplate1(
              `<p class="text-white">Total ports</p>`,
              `<p class="text-white">Please wait while loading</p>`,
              "totalPorts"
            )
          );
          data += `</div></div>`;

          data += `<div class="d-flex"><div class="card-group p-5">`;

          data +=
            `        
          
          <div class="card border-success mb-3 m-2 showDiagramTemp1 bg-dark">

  <div class="card-header bg-transparent border-success">
  
  
  <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModalFile">
  Data
</button>

<button id="btnLoadIdFileSummary" type="button" class="btn btn-secondary btn-sm">Load</button>
<button id="btnGetIdFileSummary" type="button" class="btn btn-secondary btn-sm">Get</button>
<button id="btnPostIdFileSummary" type="button" class="btn btn-secondary btn-sm">Post</button>

` +
            this.objTmpEngine.staticHtmlPlaceholderTestingForStatusCodes(
              "cFileSum"
            ) +
            `

<div class="modal fade" id="exampleModalFile" tabindex="-1" aria-labelledby="exampleModalLabelFile" aria-hidden="true">
  <div class="modal-dialog modal-90w">
    <div class="modal-content bg-dark text-light">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabelFile">Page Summary</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div id="fileTbl" class="modal-body">
        This is the body of the modal.
      </div>
    </div>
  </div>
</div>
  
  
  
  
  </div>






  <div id="uniqFiles" class="card-body text-success">
    <h5 class="card-title">Success card title</h5>
    <p class="card-text">Loading data</p>
  </div>
</div>


<div class="card border-success mb-3 m-2 showDiagramTemp1 bg-dark" >



  <div class="card-header bg-transparent border-success">
  
  <div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">

    <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#exampleModal">
    Data
  </button>

  <div class="btn-group" role="group" aria-label="Basic example">
    <button id="btnLoadIdPageSummary" type="button" class="btn btn-secondary btn-sm">Load</button>
    <button id="btnGetIdPageSummary" type="button" class="btn btn-secondary btn-sm">Get</button>
    <button id="btnPostIdPageSummary" type="button" class="btn btn-secondary btn-sm">Post</button>
  </div>

  ` +
            this.objTmpEngine.staticHtmlPlaceholderTestingForStatusCodes(
              "cPageSum"
            ) +
            `




</div>

<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-90w">
    <div class="modal-content bg-dark text-light">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Page Summary</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div id="pageTbl" class="modal-body">
        This is the body of the modal.
      </div>
    </div>
  </div>
</div>
  
  </div>




  <div id="uniqPages" class="card-body text-success" >
    <h5 class="card-title">Success card title</h5>
    <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
  </div>
</div>`;
          //var pageMapTemp1 = pageMapTemplates.showMapDiagramTabs();
          //console.log(pageMapTemp1);
          //data += this.objTmpEngine.jToH(pageMapTemp1);

          //var pageMapTemp1Tbl = pageMapTemplates.showMapTables();
          //console.log(pageMapTemp1);
          //data += this.objTmpEngine.jToH(pageMapTemp1Tbl);

          data += `</div>
          
          
          
          
          </div>
          
          <div class="card border-success showDiagramTemp1 bg-dark w-100">



          <div class="modal fade" id="mapModal" tabindex="-1" aria-labelledby="mapModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-90w">
            <div class="modal-content bg-dark text-light">
              <div class="modal-header">
                <h5 class="modal-title" id="mapModalLabel">Map Clicked location</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div id="mapModalContents" class="modal-body">
                This is the body of the modal.
              </div>
            </div>
          </div>
        </div>



  <h5 class="card-header text-white">MAP</h5>
  <div id="mainMap" class="card-body">

</div>
          
          
          `;

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

            //console.log(this.fileMap.has(str), "ok:" + str);
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
          var tmpHeaders = proxyReq.getHeaders();

          const userAgent = req.headers["user-agent"];
          //console.log(`User-Agent is: ${userAgent}`);
          //console.log(req.headers);

          var tmpUserAgent = req.useragent;
          if (Object.keys(tmpUserAgent).includes("geoIp")) {
            delete tmpUserAgent.geoIp;
          }
          var tmpUserAgentId = this.jToMD5Sign(tmpUserAgent);
          //console.log(tmpUserAgent);
          //console.log(tmpUserAgentId);
          //console.log("Raw Headers:", tmpHeaders);
          //console.log(req.clientIp);
          var ip = req.clientIp;
          var geo = geoip.lookup(ip);

          ///console.log(geo);
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

          req.myData = {
            mainPath: mainPath,
            reqMethod: req.method,
            reqQuery: req.query,
            tmpReq: req,
            tmpRes: res,
            reqBody: req.body,
            geo: geo,
          };

          //console.log(this.oPageMonitor.uniqFileSummary);
          //console.log(this.oPageMonitor.uniqPageSummary);

          if (req.method == "POST" && req.body) {
            let bodyData = JSON.stringify(req.body);
            // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
            proxyReq.setHeader("Content-Type", "application/json");
            proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
            // stream the content
            proxyReq.write(bodyData);
          }
        },
        onProxyRes: (proxyRes, req, res) => {
          if (req.myData.reqMethod == "POST" && req.myData.reqBody) {
            var countPost = this.countPostGetReq(req.myData.reqBody);

            this.oPageMonitor.requestCount(
              req.myData.mainPath, //
              0,
              req.myData.tmpReq,
              req.myData.tmpRes,
              proxyRes.statusCode,
              req.myData.geo,
              countPost,
              false
            );
          }

          if (req.myData.reqMethod == "GET") {
            var getVariableCount = this.countPostGetReq(req.myData.reqQuery);

            this.oPageMonitor.requestCount(
              req.myData.mainPath,
              getVariableCount,
              req.myData.tmpReq,
              req.myData.tmpRes,
              proxyRes.statusCode,
              req.myData.geo,
              0,
              true
            );
            //console.log("getVariableCount:" + mainPathClean, getVariableCount);
          }
        },
      });

      this.appListener.use((req, res, next) => {
        let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        if (ip.substr(0, 7) == "::ffff:") {
          ip = ip.substr(7);
        }
        req.clientIp = ip;
        next();
      });

      this.appListener.use("/", proxyMiddleware);

      if (this.isHttpsEnabled == "https") {
      }

      try {
        /*const privateKey = fs.readFileSync(process.env.privkey, "utf8");
        const certificate = fs.readFileSync(process.env.cert, "utf8");
        const ca = fs.readFileSync(process.env.chain, "utf8");

        const credentials = {
          key: privateKey,
          cert: certificate,
          ca: ca,
        };*/

        privateKey = fs.readFileSync(process.env.privkey, "utf8");
        certificate = fs.readFileSync(process.env.cert, "utf8");
        credentials = { key: privateKey, cert: certificate };

        this.hServerhttps = https.createServer(credentials, this.appListener);
      } catch (ex) {
        console.log(ex);
      }

      this.hServer = http.createServer(this.appListener);

      this.hServer.listen(this.runMainOnPort, () => {
        console.log("Proxy server listening on port", this.runMainOnPort);
      });
    } catch (error) {
      console.error("Error during startup:", error);
    }
  }
}

module.exports = objMonitor;
