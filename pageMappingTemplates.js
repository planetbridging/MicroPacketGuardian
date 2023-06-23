var objTemplateEngine = require("./objTemplateEngine");

var objTmpEngine = new objTemplateEngine();

function showMapDiagramTabs() {
  var menuTabs = [
    objTmpEngine.tabMenuBtn("banner", true, "uniqpages", "Unique Pages"),
    objTmpEngine.tabMenuBtn("banner", false, "uniqfiles", "Unique Files"),
  ];

  var menuTabsContents = [
    objTmpEngine.tabMenuContent(
      "banner",
      "uniqpages",
      true,
      "<div id='uniqPages' class='showDiagramTemp1'>pages</div>"
    ),
    objTmpEngine.tabMenuContent(
      "banner",
      "uniqfiles",
      false,
      "<div id='uniqFiles' class='showDiagramTemp1'>files</div>"
    ),
  ];

  return {
    tag: "div",
    html: [
      objTmpEngine.createTabs(
        "d-flex justify-content-center",
        "banner",
        menuTabs,
        menuTabsContents
      ),
    ],
  };
}

module.exports = { showMapDiagramTabs };
