require("dotenv").config();

//const proxy = httpProxy.createProxyServer();

const port = process.env.PORT || 3012;
const portHttps = process.env.PORThttps || 3011;
const targetServiceUrl = process.env.externalService;
const targetIpListen = process.env.ipListen;

var objMonitor = require("./monitor");

(async () => {
  console.log("Welcome to Micro Packet Guardian");
  const isHttpsEnabled = process.env.PROTOCOL === "https";
  console.log("HTTPS Enabled:", isHttpsEnabled);
  console.log(port, process.env.PORT);
  console.log("Server is running on port:", port);

  var mainobjMonitor = new objMonitor(
    isHttpsEnabled,
    targetServiceUrl,
    port,
    targetIpListen,
    portHttps
  );
  // Add your startup code or any other logic here

  //startup(isHttpsEnabled);
})();

function isImageResource(resourceUrl) {
  const resourcePath = url.parse(resourceUrl).pathname;
  const fileExtension = extname(resourcePath);
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp"];
  return imageExtensions.includes(fileExtension.toLowerCase());
}

// user needs to have this installed on linux
//sudo apt-get install libpcap-dev
