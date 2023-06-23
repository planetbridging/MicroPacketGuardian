const fs = require("fs");
const path = require("path");
const JavaScriptObfuscator = require("javascript-obfuscator");

function loadFilesIntoMap(dirPath, fileMap = new Map(), basePath = "") {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    var relativePath = path.join(basePath, entry.name).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      loadFilesIntoMap(fullPath, fileMap, relativePath);
    } else {
      var data = fs.readFileSync(fullPath, "utf8");

      const ext = path.extname(fullPath);
      //console.log(ext);
      if (ext === ".ts") {
        var obfuscatedCode = JavaScriptObfuscator.obfuscate(data);

        //res.type(".js");
        //res.send(obfuscatedCode._obfuscatedCode);
        data = obfuscatedCode._obfuscatedCode;
        relativePath = relativePath.replace(".ts", ".js");
      }

      fileMap.set(relativePath, data);
    }
  }

  return fileMap;
}

module.exports = loadFilesIntoMap;
