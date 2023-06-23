//bootstrap generator
const json2html = require("node-json2html");

class objTemplateEngine {
  topPage() {
    return `<!doctype html>
        <html lang="en" data-bs-theme="auto">
          <head>
            
        
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta name="description" content="">
            <title>~MicroPacketGuardian</title>
            
        <link href="/assets/css/bootstrap.min.css" rel="stylesheet">

        <script src="./assets/js/bootstrap.bundle.min.js"></script>
            <style type="text/css">
              body {
                padding-top: 60px;
                padding-bottom: 40px;
              }
            </style>
        
          <style>
          #particles-js {
              position: fixed;
              width: 100%;
              height: 100vh;
              background-color: #000;
              z-index: -1;
          }
          body, html {
            padding: 0;
            margin: 0;
            color: white;
        }
        
        #main{
          position: absolute;
          width: 100%;
        }
        .tab-content{
            width: calc(90vw - 20px);
        }

        .showDiagramTemp1 {
          width: 600px;
          height: 400px;
          margin: 0 auto;
        }
        </style>
        <script defer src="/socket.io/socket.io.js"></script>
        <script src="/echarts.min.js
"></script>
        <script defer src="/js/Home.js"></script>
        
          </head>
            <body>
            <div id="main">`;
  }

  bottomPage() {
    return `</div>
    
    <div id="particles-js"></div>
 
    <!-- Include tsParticles library -->
    <script src="./particles.min.js"></script>

    <!-- Initialize tsParticles -->
    <script>
        particlesJS.load('particles-js', './stars.json', function() {
            console.log('particles.js loaded - callback');
        });
    </script>


 
    
    </body>
   
  </html>`;
  }

  /*        <form class="d-flex" role="search">
          <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
          <button class="btn btn-outline-success" type="submit">Search</button>
        </form>*/

  mainMenu() {
    return `<nav class="navbar navbar-expand-md navbar-dark bg-dark">
    <div class="container-fluid">
      <a class="navbar-brand" href="/"><img src="/imgs/pb_full.png" height="50px" />MPG</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarCollapse">
        <ul class="navbar-nav me-auto mb-2 mb-md-0">
          <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="/">Home</a>
          </li>
          <li class="nav-item">
              <div class="dropdown">
              <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              Lookup
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#">Placeholder</a></li>
              </ul>
              
            </div>
          </li>


        </ul>

      </div>
    </div>
  </nav>`;
  }

  generateCard(title, description, buttonText) {
    return `
        <div class="card bg-transparent text-white">
          <div class="card-body">
            <h5 class="card-title">${title}</h5>
            <p class="card-text">${description}</p>
            <a href="#" class="btn btn-primary">${buttonText}</a>
          </div>
        </div>
      `;
  }

  generateRow(cardsHTML) {
    return `
        <div class="row">
          ${cardsHTML}
        </div>
      `;
  }

  generateContent(rowsHTML, paddingClasses = "") {
    return `
        <div id="content" class="${paddingClasses}">
          ${rowsHTML}
        </div>
      `;
  }

  jToH(j) {
    const htmlOutput = json2html.transform({}, j);

    return htmlOutput;
  }

  lstCards(lst) {
    return {
      "<>": "div",
      class: "container p-5",
      html: [
        {
          "<>": "div",
          class: "row",
          html: lst,
        },
      ],
    };
  }

  cardTemplate(title, description, link) {
    var lst = {};
    return {
      "<>": "div",
      class: "col-sm-6",
      html: [
        {
          "<>": "div",
          class: "card bg-transparent text-white",
          html: [
            {
              "<>": "div",
              class: "card-body",
              html: [
                {
                  "<>": "h5",
                  class: "card-title",
                  text: title,
                },
                {
                  "<>": "p",
                  class: "card-text",
                  text: description,
                },
              ],
            },
            link,
          ],
        },
      ],
    };
  }

  createLink(href, classItems, text, target) {
    const data = [
      {
        tag: "a",
        href: href,
        class: classItems,
        html: text,
      },
    ];

    if (target != undefined && target != null) {
      data[0]["target"] = target;
    }
    return data;
  }

  createList(classItems, lst) {
    const data = [
      {
        tag: "ul",
        class: classItems,
        html: lst,
      },
    ];
    return data;
  }

  createListItem(classItems, lst) {
    const data = [
      {
        tag: "li",
        class: classItems,
        html: lst,
      },
    ];
    return data;
  }

  createImg(src, classItems, alt, style) {
    const data = [
      {
        tag: "img",
        alt: alt,
        class: classItems,
        src: src,
      },
    ];

    if (style != undefined && style != null) {
      data[0]["style"] = style;
    }

    return data;
  }
  /*lst[
    [tabName,html,tabName]
  ]*/

  tabMenuContent(id, name, active, content) {
    var onoff = "show active";
    if (!active) {
      onoff = "";
    }
    return {
      tag: "div",
      class: "tab-pane fade " + onoff,
      id: id + "-" + name,
      role: "tabpanel",
      "aria-labelledby": id + "-" + name + "-tab",
      tabindex: "0",
      html: content,
    };
  }

  tabMenuBtn(id, active, name, text) {
    var onoff = "active";
    if (!active) {
      onoff = "";
    }
    return {
      tag: "li",
      class: "nav-item",
      role: "presentation",
      html: [
        {
          tag: "button",
          class: "nav-link " + onoff,
          id: id + "-" + name + "-tab",
          "data-bs-toggle": "pill",
          "data-bs-target": "#" + id + "-" + name,
          type: "button",
          role: "tab",
          "aria-controls": id + "-" + name,
          "aria-selected": "true",
          text: text,
        },
      ],
    };
  }

  createTabs(classItem, id, menuTabs, menuContent) {
    const jsonData = [
      {
        tag: "div",
        class: classItem,
        html: [
          {
            tag: "div",
            html: [
              {
                tag: "ul",
                class: "nav nav-tabs nav-fill",
                id: id + "-tab",
                role: "tablist",
                html: menuTabs,
              },
              {
                tag: "div",
                class: "tab-content",
                id: id + "-tabContent",
                html: menuContent,
              },
            ],
          },
        ],
      },
    ];
    return jsonData;
  }

  createParagraph(classItem, text) {
    const data = [
      {
        tag: "p",
        class: classItem,
        text: text,
      },
    ];
    return data;
  }

  //<img src="..." class="card-img-top" alt="...">
  createCard(aboveBody, title, content) {
    const data = [
      {
        tag: "div",
        class: "col-sm-6 mb-3 mb-sm-0 p-5",
        html: [
          {
            tag: "div",
            class: "card",
            html: [
              aboveBody,
              {
                tag: "div",
                class: "card-body",
                html: [
                  {
                    tag: "h5",
                    class: "card-text",
                    text: title,
                  },
                  {
                    tag: "p",
                    class: "card-text",
                    text: content,
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
    return data;
  }

  createSearchCard(header, body, footer) {
    const data = [
      {
        tag: "div",
        class: "card text-center text-bg-dark text-light",
        html: [
          {
            tag: "div",
            class: "card-header",
            html: header,
          },

          {
            tag: "div",
            class: "card-body",
            html: body,
          },

          {
            tag: "div",
            class: "card-footer",
            html: footer,
          },
        ],
      },
    ];
    return data;
  }

  createSearchForm(
    action,
    method,
    searchTitle,
    name,
    placeholder,
    textArea,
    passTextAreaValue,
    txtId,
    passExtraStuff
  ) {
    var txtInputJ = {
      tag: "input",
      type: "text",
      class: "form-control",
      name: name,
      placeholder: placeholder,
    };

    if (textArea == true) {
      txtInputJ = {
        tag: "textarea",
        class: "form-control",
        name: name,
        placeholder: placeholder,
        text: passTextAreaValue,
        id: txtId,
      };
    }
    //console.log(passExtraStuff);
    const data = [
      {
        tag: "div",
        class: "container mt-5",
        html: [
          {
            tag: "form",
            action: action,
            method: method,
            html: [
              {
                tag: "div",
                class: "mb-3",
                html: [
                  {
                    tag: "label",
                    class: "form-label",
                    text: searchTitle,
                  },
                  txtInputJ,
                ],
              },
              {
                tag: "button",
                type: "submit",
                class: "btn btn-primary",
                text: "Search",
              },
              {
                tag: "div",
                html: passExtraStuff,
              },
            ],
          },
        ],
      },
    ];
    return data;
  }

  createAccordion(id, html, classItem) {
    const data = [
      {
        tag: "div",
        class: "accordion p-5 " + classItem,
        id: "accordionExample" + id,
        html: html,
      },
    ];
    return data;
  }

  createAccordionItem(id, name, item, header) {
    const data = [
      {
        tag: "div",
        class: "accordion-item",

        html: [
          {
            tag: "h2",
            class: "accordion-header",
            html: [
              {
                tag: "button",
                class: "accordion-button",
                type: "button",
                "data-bs-toggle": "collapse",
                "data-bs-target": "#collapse" + name,
                "aria-expanded": "true",
                "aria-controls": "collapse" + name,
                text: header,
              },
            ],
          },

          {
            tag: "div",
            id: "collapse" + name,
            class: "accordion-collapse collapse show",
            "data-bs-parent": "#accordionExample" + id,
            html: [{ tag: "div", class: "accordion-body", html: item }],
          },
        ],
      },
    ];
    return data;
  }

  createTable(lst) {
    var rows = [];

    for (var r in lst) {
      var tblRow = {
        tag: "tr",
        html: [],
      };
      var thOrTd = "td";
      if (r == 0) {
        thOrTd = "th";
      }
      var tblCols = [];
      for (var c in lst[r]) {
        tblCols.push({
          tag: thOrTd,
          text: lst[r][c],
        });
      }

      tblRow["html"] = tblCols;
      rows.push(tblRow);
    }

    var tbl = {
      tag: "table",
      html: rows,
      class: "table table-dark",
    };
    //console.log(tbl);
    const data = [
      {
        tag: "div",
        class: "container",

        html: [tbl],
      },
    ];
    return data;
  }
}

module.exports = objTemplateEngine;
