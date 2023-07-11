/*document.addEventListener("DOMContentLoaded", function () {
  const button = document.getElementById("myButton");

  if (button && button.tagName === "BUTTON") {
    button.addEventListener("click", function () {
      console.log("Button clicked!");
    });
  }
});*/


var worldGeoJSON;
var usedPorts = new Map();




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

function refreshChartPie(title,subText,loadType,lstData,importChart,legend,showCode,acceptedCodes){

    var lstLoadData = [];

    for(var tmpCount in lstData){
        //console.log(lstData[tmpCount][1]);
        //console.log(acceptedCodes,lstData[tmpCount][1]["statusCode"].toString());
        if(acceptedCodes.includes(lstData[tmpCount][1]["statusCode"].toString())){
            if(showCode == "all"){
                lstLoadData.push({
                    value: lstData[tmpCount][1][loadType], name: lstData[tmpCount][0]
                });
            }else if(lstData[tmpCount][1][showCode] == showCode){
                lstLoadData.push({
                    value: lstData[tmpCount][1][loadType], name: lstData[tmpCount][0]
                });
            }
        }
        
        
    }
    var leg ={
        orient: 'horizontal',
        top: 'bottom',
        textStyle: {
          color: '#ccc'
        }
      };

    

    var option = {
        title: {
          text: title,
          subtext: subText,
          left: 'center',
          textStyle: {
            color: '#ccc'
          }
        },
        tooltip: {
          trigger: 'item',
        },
        
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: '30%',
            data: lstLoadData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
                color: '#ccc'
              },

            },
          }
        ],
        
      };

      if(legend == true){
        option["legend"] = leg;
    }

    //console.log(options);

    // Set chart options and render the chart
    importChart.setOption(option);
}

function createSimpleMapToTbl(titles,lst,subKeysEnabled,lstSubKeys){

    var lstTitles = ``;
    var lstTbls = ``;

    for(var t in titles){
        lstTitles += `<th scope="col">`+titles[t]+`</th>`;
    }

    let keys = Array.from(lst.keys());

    for(var k in keys){

        var tmpHtml = `<tr>`;

        if(subKeysEnabled == true){
            tmpHtml += `<td>`+keys[k]+`</td>`;
            for(var tmpSub in lstSubKeys){
                tmpHtml += "<td>" + lst.get(keys[k])[lstSubKeys[tmpSub]] + "</td>";
            }

            tmpHtml += `</tr>`;
        }else{
            tmpHtml = `<tr>
            <td>`+keys[k]+`</td>
            <td>`+lst.get(keys[k])+`</td>
          </tr>`;
        }

        lstTbls += tmpHtml;
      //console.log(lst.get(keys[k]));
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

class objPieListenerPortStats{
  id;
  socketListenChannel;
  socket;
  constructor(socket,id,channel){
    this.id = id;
    this.socketListenChannel = channel;
    this.socket = socket;
    this.socketListner();
  }

  socketListner(){
    //var self = this;

    this.socket.on(this.socketListenChannel, (msg) => {
        //console.log(msg);
        var tmp = JSON.parse(msg);
        console.log(tmp);
        /*this.socketData = tmp;
        //refreshChartPie(title,subText,loadType,lstData,importChart)
        this.refreshPie();
        const array = JSON.parse(msg);
        const map = new Map(array);
        //console.log(array);
        //createSimpleMapToTbl(titles,lst,subKeysEnabled,lstSubKeys)
        document.getElementById(this.tblData).innerHTML = createSimpleMapToTbl(["Page","loadCount","getCount","postCount","statusCode","uniqCountry"],map,this.showMoreVariables,["loadCount","getCount","postCount","statusCode","uniqCountry"]);
        */
      });
}
}

class objPieListenerPageStats{
    eChartListener;
    socket;
    socketListenChannel;
    selectedPageType;
    showLegends;
    showMoreVariables;
    tblData;
    showCode;
    socketData;
    graphTitle;
    uniqCheckBoxName;
    viewingStatusCodes;
    constructor(elementId,socket,socketListenChannel,showLegends,showMoreVariables,tblData,btnLoadId,btnGetId,btnPostId,graphTitle,uniqCheckBoxName) {
        this.eChartListener = echarts.init(document.getElementById(elementId));
        window.onresize = function() {
          this.eChartListener.resize();
        };
        this.socket = socket;
        this.socketListenChannel = socketListenChannel;
        this.selectedPageType = "loadCount";
        this.showLegends = showLegends;
        this.showMoreVariables = showMoreVariables;
        this.tblData = tblData;
        this.showCode = "all";
        this.viewingStatusCodes = ["200","304"];
        this.graphTitle = graphTitle;
        this.uniqCheckBoxName = uniqCheckBoxName;
        this.socketListner();
        this.addBtnListenerChangeGraph(btnLoadId,'loadCount');
        this.addBtnListenerChangeGraph(btnGetId,'getCount');
        this.addBtnListenerChangeGraph(btnPostId,'postCount');
        this.loadCheckedItemListener();

    }

    addBtnListenerChangeGraph(id,inputChange){
        document.getElementById(id).addEventListener('click', () => {
            this.selectedPageType = inputChange;
            this.refreshPie();
        });
    }

    socketListner(){
        //var self = this;

        this.socket.on(this.socketListenChannel, (msg) => {
            //console.log(msg);
            var tmp = JSON.parse(msg);
            this.socketData = tmp;
            //refreshChartPie(title,subText,loadType,lstData,importChart)
            this.refreshPie();
            const array = JSON.parse(msg);
            const map = new Map(array);
            //console.log(array);
            //createSimpleMapToTbl(titles,lst,subKeysEnabled,lstSubKeys)
            document.getElementById(this.tblData).innerHTML = createSimpleMapToTbl(["Page","loadCount","getCount","postCount","statusCode","uniqCountry"],map,this.showMoreVariables,["loadCount","getCount","postCount","statusCode","uniqCountry"]);
        });
    }

    refreshPie(){
        refreshChartPie(this.graphTitle,this.selectedPageType,this.selectedPageType,this.socketData,this.eChartListener,this.showLegends,this.showCode,this.viewingStatusCodes);
    }

    loadCheckedItemListener(){
        // Get all checkboxes in the dropdown
        let checkboxes = document.querySelectorAll('.form-check-input'+this.uniqCheckBoxName);

        // Add an event listener to each checkbox
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => { // Use an arrow function here
                // Log the checkbox value and checked status
                console.log(`Checkbox ${checkbox.value} is ${checkbox.checked ? 'checked' : 'unchecked'}`);
                if(checkbox.checked && !this.viewingStatusCodes.includes(checkbox.value)){
                    this.viewingStatusCodes.push(checkbox.value);
                }else if(!checkbox.checked && this.viewingStatusCodes.includes(checkbox.value)){
                    this.viewingStatusCodes = this.viewingStatusCodes.filter(item => item !== checkbox.value);
                }
                    console.log(this.viewingStatusCodes);
                    this.refreshPie();
                });
        });
    }
}

function reloadWorldMap(data,chart){
 
  /*[
                        {name: 'New Yorks', value: [-74.0059, 40.7128, 1]},
                        {name: 'Los Angeles', value: [-118.2437, 34.0522, 1]},
                        {name: 'London', value: [-0.1276, 51.5074, 1]},
                        {name: 'Beijing', value: [116.4074, 39.9042, 1]}
                    ]*/
        // Register the map with ECharts
        echarts.registerMap('world', worldGeoJSON);

        // Set the chart options
        chart.setOption({
            geo: {
                map: 'world'
            },
            series: [
                {
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: data,
                    symbolSize: function (val) {
                        return val[2] * 20;
                    },
                    itemStyle: {
                        color: 'red' // Change the color of the circles
                    },
                    encode: {
                        value: 2
                    }
                }
            ]
        });
        
}


document.addEventListener("DOMContentLoaded", async function() {
    //socketio variables
    var pageMonitorUUID = "";
    worldGeoJSON = await fetch('./countries.json').then(response => response.json());

    //console.log(worldGeoJSON);
    const socket = io();

    var oPageSummary = new objPieListenerPageStats('uniqPages',socket,'pageMonitorPage',true,true,'pageTbl',"btnLoadIdPageSummary","btnGetIdPageSummary","btnPostIdPageSummary","Page Summary","cPageSum");
    var oPageFile = new objPieListenerPageStats('uniqFiles',socket,'pageMonitorFile',false,true,'fileTbl',"btnLoadIdFileSummary","btnGetIdFileSummary","btnPostIdFileSummary","File Summary","cFileSum");

    var ototalPortCount = new objPieListenerPortStats(socket,"totalPorts","totalPortCount");

    socket.on("totalUsedPorts", (msg) => {
      //console.log(msg);
      var tmp = JSON.parse(msg);
      //console.log(tmp);
      let map = tmp.reduce((obj, item) => {
        obj[item[0]] = item[1];
        return obj;
      }, {});
      usedPorts = map;
    });

    var chart = echarts.init(document.getElementById('mainMap'));
    // Add an event listener for 'click' events
    chart.on('click', function (params) {
        if (params.componentType === 'series') {
            //alert('You clicked on ' + params.name + ' with value ' + params.value[2]);
            //console.log(params.data);
            var lstHtml = `<ul class="list-group">`;

            for(var i in params.data.pages){
              lstHtml+= `<li class="list-group-item list-group-item-dark">`+params.data.pages[i]+`</li>`;
            }
            lstHtml+= `</ul>`;
            document.getElementById("mapModalContents").innerHTML = `
            <p>`+params.data.name+`</p>
            `+lstHtml;
         
            var modal = new bootstrap.Modal(document.getElementById('mapModal'));
            modal.show();
        }
    });

    window.onresize = function() {
      chart.resize();
    };

    socket.on("uniqGeoLocation", (msg) => {
      //console.log(msg);
      var tmp = JSON.parse(msg);
      const map = new Map(tmp);
      let values = Array.from(map.values());
      reloadWorldMap(values,chart);
  });
    //reloadWorldMap(data)

    console.log("welcome to front end DOM of micro packet guardian");

    

    socket.on('pageMonitorUUID', (msg) => {
        //console.log(msg);
        if(pageMonitorUUID != msg){
            pageMonitorUUID = msg;
            socket.emit("pageMonitor", "");
        }
    });


    /*fetch('./countries.json')
    .then(response => response.json())
    .then(worldGeoJSON => {
        // Initialize the chart
        
    });*/



});


