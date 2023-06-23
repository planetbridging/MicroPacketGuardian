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
        let newNode = { name: '/' + parts[i], children: [],value:10 };

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
        data: lstData
        }
    };

    //console.log(options);

    // Set chart options and render the chart
    importChart.setOption(options);
}

  


document.addEventListener("DOMContentLoaded", function() {
    const component = new stateObj("myElement");
    const button = document.getElementById("myButton");

    //socketio variables
    var websitePathsUUID = "";
    var websitePathsMap = [];

    //echart variables
    var uniqFilesWebMap = document.getElementById('uniqFiles');
    var chartUniqFilesWebMap = echarts.init(uniqFilesWebMap);

    var uniqPagesWebMap = document.getElementById('uniqPages');
    var chartUniqPagesWebMap = echarts.init(uniqPagesWebMap);

    if (button) {
        button.addEventListener("click", () => component.increment());
    }

    console.log("welcome to front end DOM of micro packet guardian");

    const socket = io();

    //startup load variabels
    socket.emit("websitePaths", "");

    socket.on('websitePaths', (msg) => {
        console.log(msg);
        websitePathsMap = msg;
        var tmp = JSON.parse(websitePathsMap);
        var lstDataUniqFiles = [];
        var lstDataUniqPages = [];
        var lstNewChildrenUniqFiles = [];

        for(var d in tmp){
            const url = new URL(tmp[d][0]);
            const rootURL = url.pathname;
            //console.log(rootURL);
            var row = {name: rootURL};
            var lstChildren = [];
            for(var r in tmp[d][1]){

                var tmpChildren = parseUrl(tmp[d][1][r]);
                //console.log(tmpChildren);

                lstChildren.push(tmpChildren);
            }
            row["children"] = lstChildren;
            lstDataUniqPages.push(row);
        }


        //this loads uniq files
        for(var d in tmp){
            lstNewChildrenUniqFiles.push(tmp[d][0]);
            for(var l in tmp[d][1]){
                lstNewChildrenUniqFiles.push(tmp[d][1][l]);
            }
        }
        //console.log(lstNewChildren);
        lstDataUniqFiles = parseUrls(lstNewChildrenUniqFiles);

        refreshChart("Website map unique pages",lstDataUniqPages,chartUniqPagesWebMap,'sunburst');
        refreshChart("Website map unique files",lstDataUniqFiles,chartUniqFilesWebMap,'sunburst');
        
        //console.log(lstData);

          // Define chart options example
        /*var options = {
            title: {
            text: 'Website map'
            },
            series: {
            type: 'sunburst',
            data: [
                {
                    name: 'Category 1',
                    children: [
                        { name: 'Subcategory 1', value: 10 },
                        { name: 'Subcategory 2', value: 20 }
                    ]
                },
                {
                    name: 'Category 2',
                    children: [
                        { name: 'Subcategory 3', value: 15 },
                        { name: 'Subcategory 4', value: 25 }
                    ]
                }
            ]
            }
        };*/

       /* [
            {
                name: '/bob',
                children: [
                    { name: '/hello',
                        children:[
                            {
                                name:"/file.js"
                            }
                        ]
                    },
                ]
            },
        ]*/

        /*
[
            {
                name: '/bob',
                children: [
                    { name: '/imgs',
                        children:[
                            {
                                name:"/pic1.jpg"
                            },
                            {
                                name:"/pic2.jpg"
                            }
                        ]
                    },
                ]
            },
        ]*/

  
    });


    socket.on('websitePathsUUID', (msg) => {
        //console.log(msg);
        if(websitePathsUUID != msg){
            websitePathsUUID = msg;
            socket.emit("websitePaths", "");
        }
    });



    


});


function createMultipleChildren(){}

