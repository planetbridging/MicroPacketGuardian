/*document.addEventListener("DOMContentLoaded", function () {
  const button = document.getElementById("myButton");

  if (button && button.tagName === "BUTTON") {
    button.addEventListener("click", function () {
      console.log("Button clicked!");
    });
  }
});*/







class stateObj {
    ostate;
    oelement;

    constructor(elementId) {
        this.oelement = document.getElementById(elementId);
        this.ostate = { count: 0 };
        this.render();
    }

    set state(value) {
        this.ostate = value;
        this.render();
    }

    get state() {
        return this.ostate;
    }

    increment() {
        this.state = { count: this.ostate.count + 1 };
    }

    render() {
        if (this.oelement) {
            this.oelement.textContent = `Count: ${this.ostate.count}`;
        }
    }
}


function parseUrl(url) {
    let parts = url.split('/');
    parts.shift(); // remove the first empty element from split

    let root = {};
    let currentLevel = root;
    for (let i = 0; i < parts.length; i++) {
        /*console.log('/' + parts[i],url);
        var count = 0;
        if(websiteFileCount.has(url)){
            count = websiteFileCount.get(url);
        }*/
        /*var websitePathCount = new Map();
var websiteFileCount = new Map();*/

        let newNode = { name: '/' + parts[i], children: [],value:10 };
        //let newNode = { name: '/' + parts[i], children: [],value:count };

        if(i === 0){
            root = newNode;
            currentLevel = root;
        } else {
            currentLevel.children.push(newNode);
            currentLevel = newNode;
        }
    }
    return root;
}

function parseUrls(urls) {
    let root = {};

    urls.forEach(url => {
        let parts = url.split('/');
        parts.shift(); // remove the first empty element from split

        let currentLevel = root;

        for (let i = 0; i < parts.length; i++) {
            let newNode = { name: '/' + parts[i], children: [], value: 10 };
            let found = currentLevel['/' + parts[i]];

            if (!found) {
                if (i === 0) {
                    root['/' + parts[i]] = newNode;
                    currentLevel = root['/' + parts[i]];
                } else {
                    currentLevel.children.push(newNode);
                    currentLevel['/' + parts[i]] = newNode;
                    currentLevel = newNode;
                }
            } else {
                currentLevel = found;
            }
        }
    });

    return Object.values(root);
}

//console.log(parseUrls(['/bob/imgs/pic1.jpg', '/bob/imgs/pic2.jpg']));


//console.log(parseUrls(['/bob/imgs/pic1.jpg', '/bob/imgs/pic2.jpg']));


//console.log(parseUrl('/bob/hello/file.js'));

function refreshChart(title,lstData,importChart,charType){
    var options = {
        title: {
        text: title
        },
        series: {
        type: charType,
        data: lstData,
        label: {
            color: '#000',
            textBorderColor: '#fff',
            textBorderWidth: 2,
          }
        }
    };

    //console.log(options);

    // Set chart options and render the chart
    importChart.setOption(options);
}

function refreshChartCategory(title,lstData,importChart,charType){
    var options = {
        angleAxis: {},
        radiusAxis: {
          type: 'category',
          data: ['Load', 'Get', 'Post',],
        },
        polar: {},
        series: [
          {
            type: 'bar',
            data: [10, 200, 300],
            coordinateSystem: 'polar',
            name: '/bewear',
            stack: 'a',
            emphasis: {
              focus: 'series'
            }
          },
          {
            type: 'bar',
            data: [2, 40, 600],
            coordinateSystem: 'polar',
            name: 'B',
            stack: 'a',
            emphasis: {
              focus: 'series'
            }
          },
          {
            type: 'bar',
            data: [100, 200, 30],
            coordinateSystem: 'polar',
            name: 'C',
            stack: 'a',
            emphasis: {
              focus: 'series'
            }
          }
        ],
        legend: {
          show: true,
          data: ['/bewear', 'B', 'C']
        }
      };

    //console.log(options);

    // Set chart options and render the chart
    importChart.setOption(options);
}

function createSimpleMapToTbl(titles,lst){

    var lstTitles = ``;
    var lstTbls = ``;

    for(var t in titles){
        lstTitles += `<th scope="col">`+titles[t]+`</th>`;
    }

    let keys = Array.from(lst.keys());

    for(var k in keys){
        lstTbls += `<tr>
        <td>`+keys[k]+`</td>
        <td>`+lst.get(keys[k])+`</td>
      </tr>`;
    }

    return `<table class="table table-sm table-hover table-striped table-dark table-bordered">
    <thead>
      <tr>
        `+lstTitles+`
      </tr>
    </thead>
    <tbody>
     `+lstTbls+`
    </tbody>
  </table>`;
}

  


document.addEventListener("DOMContentLoaded", function() {
    //socketio variables
    var pageMonitorUUID = "";


    



    //echart variables
    var uniqFilesWebMap = document.getElementById('uniqFiles');
    var chartUniqFilesWebMap = echarts.init(uniqFilesWebMap);

    var uniqPagesWebMap = document.getElementById('uniqPages');
    var chartUniqPagesWebMap = echarts.init(uniqPagesWebMap);

    refreshChartCategory("Website map unique pages","",chartUniqFilesWebMap,'sunburst');
    refreshChartCategory("Website map unique pages","lstDataUniqPages",chartUniqPagesWebMap,'sunburst');
    

    console.log("welcome to front end DOM of micro packet guardian");

    const socket = io();

  


});


function createMultipleChildren(){}

