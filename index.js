require("dotenv").config();

//const proxy = httpProxy.createProxyServer();

const port = process.env.PORT || 3000;
const targetServiceUrl = process.env.externalService;

var objMonitor = require("./monitor");

(async () => {
  console.log("Welcome to Micro Packet Guardian");
  const isHttpsEnabled = process.env.PROTOCOL === "https";
  console.log("HTTPS Enabled:", isHttpsEnabled);
  console.log("Server is running on port:", port);

  var mainobjMonitor = new objMonitor(isHttpsEnabled, targetServiceUrl);
  // Add your startup code or any other logic here

  //startup(isHttpsEnabled);
})();

function isImageResource(resourceUrl) {
  const resourcePath = url.parse(resourceUrl).pathname;
  const fileExtension = extname(resourcePath);
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp"];
  return imageExtensions.includes(fileExtension.toLowerCase());
}
