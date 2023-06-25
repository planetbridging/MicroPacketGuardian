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

function showMapTables() {
  var menuTabs = [
    objTmpEngine.tabMenuBtn("banner", true, "uniqpagesTbl", "Unique Pages Tbl"),
    objTmpEngine.tabMenuBtn(
      "banner",
      false,
      "uniqfilesTbl",
      "Unique Files Tbl"
    ),
  ];

  var menuTabsContents = [
    objTmpEngine.tabMenuContent(
      "banner",
      "uniqpagesTbl",
      true,
      "<div id='uniqPagesTbl' class=''>pages tbl</div>"
    ),
    objTmpEngine.tabMenuContent(
      "banner",
      "uniqfilesTbl",
      false,
      "<div id='uniqFilesTbl' class='showDiagramTemp1'>files tbl</div>"
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

module.exports = { showMapDiagramTabs, showMapTables };
