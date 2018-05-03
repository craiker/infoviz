$(document).ready(function() {
    // Do stuff when the page is loaded
    stockDatasets();
})

var tweets_trump2018 = null;
var tweets_china = null;
var tweets_badsad = null;
var tweets_immigra = null;
var tweets_goodhappy = null;

var points_trump2018 = null;
var points_china = null;
var points_badsad = null;
var points_immigra = null;
var points_goodhappy = null;


var btn_china = null;
var btn_badsad = null;
var btn_immigra = null;
var btn_goodhappy = null;

var color_trump = '#f4511e';
var color_china = '#f4511e';
var color_badsad = '#f4511e';
var color_immigra = '#f4511e';
var color_goodhappy = '#f4511e';


var graph = null;
var position = {
    horizontal: -3.14*3/4,
    vertical: 0.785,
    distance: 3
};

window.onload=function(){
    btn_china = document.getElementById("btn_china");
    btn_china.addEventListener("mouseover", function() { changeColor('#1d78f7', 1); });
    btn_china.addEventListener("mouseout", function() { changeColor('#f4511e', 1); });

    btn_badsad = document.getElementById("btn_badsad");
    btn_badsad.addEventListener("mouseover", function() { changeColor('#1d78f7', 2); });
    btn_badsad.addEventListener("mouseout", function() { changeColor('#f4511e', 2); });

    btn_immigra = document.getElementById("btn_immigra");
    btn_immigra.addEventListener("mouseover", function() { changeColor('#1d78f7', 3); });
    btn_immigra.addEventListener("mouseout", function() { changeColor('#f4511e', 3); });

    btn_goodhappy = document.getElementById("btn_goodhappy");
    btn_goodhappy.addEventListener("mouseover", function() { changeColor('#1d78f7', 4); });
    btn_goodhappy.addEventListener("mouseout", function() { changeColor('#f4511e', 4); });
}


function changeColor(color, btn_index){
    switch(btn_index) {
    case 0:
        break;
    case 1:

        color_china = color;
        break;
    case 2:
        color_badsad = color;
        break;
    case 3:
        color_immigra = color;
        break;
    case 4:
        color_goodhappy = color;
        break;
    default:
    }

    position = graph.getCameraPosition();
    drawVisualization();
    console.log("color changed");
}


function onclick(point) {
    position = graph.getCameraPosition()
    console.log("Camera position horizontal " + position.horizontal);
    console.log("Camera position vertical " + position.vertical);
    console.log("Camera position distance " + position.distance);
    window.alert("Tweet:\n" + point.text + "\n _____ \nSentiment prediction: \nNegative - " + point.x.toFixed(3) + "\nNeutral - " + point.z.toFixed(3) + "\nPositive - " + point.y.toFixed(3))
}

// Called when the Visualization API is loaded.
function drawVisualization() {
    // create the data table.
    data_d = new vis.DataSet();

    for (var i = 0; i < points_trump2018.length; i++) {
        data_d.add({id: i, text: tweets_trump2018[i], x: parseFloat(points_trump2018[i][0]), y: parseFloat(points_trump2018[i][2]), z: parseFloat(points_trump2018[i][1]), style: color_trump});
        data_d.add({id: i+200, text: tweets_china[i], x: parseFloat(points_china[i][0]), y: parseFloat(points_china[i][2]), z: parseFloat(points_china[i][1]), style: color_china});
        data_d.add({id: i+400, text: tweets_badsad[i], x: parseFloat(points_badsad[i][0]), y: parseFloat(points_badsad[i][2]), z: parseFloat(points_badsad[i][1]), style: color_badsad});
        data_d.add({id: i+600, text: tweets_immigra[i], x: parseFloat(points_immigra[i][0]), y: parseFloat(points_immigra[i][2]), z: parseFloat(points_immigra[i][1]), style: color_immigra});
        data_d.add({id: i+800, text: tweets_goodhappy[i], x: parseFloat(points_goodhappy[i][0]), y: parseFloat(points_goodhappy[i][2]), z: parseFloat(points_goodhappy[i][1]), style: color_goodhappy});
    }

    // specify options
    var options = {
        width:  '100%',
        height: '100vh',
        style: 'dot-color',
        showPerspective: true,
        showGrid: true,
        keepAspectRatio: true,
        verticalRatio: 1.0,
        showLegend: false,
        onclick: onclick,
        xLabel: 'negative',
        yLabel: 'positive',
        zLabel: 'neutral',
        dotSizeRatio: 0.01,
        cameraPosition: position
    };

    // create our graph
    var container = document.getElementById('mygraph');
    graph = new vis.Graph3d(container, data_d, options);

}


function stockDatasets() {
    // Predictions
    readCSV_fromServer("https://ufity.com/uploads/points_trump_200.csv", 0);
    readCSV_fromServer("https://ufity.com/uploads/pred_china.csv", 1);
    readCSV_fromServer("https://ufity.com/uploads/pred_badsad.csv", 2);
    readCSV_fromServer("https://ufity.com/uploads/pred_immigra.csv", 3);
    readCSV_fromServer("https://ufity.com/uploads/pred_goodhappy.csv", 4);

    //Tweets
    readCSV_fromServer("https://ufity.com/uploads/tweets_trump2018.csv", 10);
    readCSV_fromServer("https://ufity.com/uploads/tweets_china.csv", 11);
    readCSV_fromServer("https://ufity.com/uploads/tweets_badsad.csv", 12);
    readCSV_fromServer("https://ufity.com/uploads/tweets_immigra.csv", 13);
    readCSV_fromServer("https://ufity.com/uploads/tweets_goodhappy.csv", 14);

    setTimeout(drawVisualization, 1200);

}

function readCSV_fromServer(url, index) {

    return $.ajax({
        type: "GET",
        url: url,
        dataType: "text",
        text: index,
        success: function(response) {
            storeCSV(response, this.text);
        }
    });
}

function storeCSV(string_csv, index) {


    switch(index) {
        case 0:
            points_trump2018 = parseCSV(string_csv)
            points_trump2018.shift();
            points_trump2018.pop();
            break;
        case 1:
            points_china = parseCSV(string_csv)
            points_china.shift();
            points_china.pop();
            break;
        case 2:
            points_badsad = parseCSV(string_csv)
            points_badsad.shift();
            points_badsad.pop();
            break;
        case 3:
            points_immigra = parseCSV(string_csv)
            points_immigra.shift();
            points_immigra.pop();
            break;
        case 4:
            points_goodhappy = parseCSV(string_csv)
            points_goodhappy.shift();
            points_goodhappy.pop();
            break;
        case 10:
            tweets_trump2018 = parseCSV(string_csv)
            tweets_trump2018.shift();
            tweets_trump2018.pop();
            break;
        case 11:
            tweets_china = parseCSV(string_csv)
            tweets_china.shift();
            tweets_china.pop();
            break;
        case 12:
            tweets_badsad = parseCSV(string_csv)
            tweets_badsad.shift();
            tweets_badsad.pop();
            break;
        case 13:
            tweets_immigra = parseCSV(string_csv)
            tweets_immigra.shift();
            tweets_immigra.pop();
            break;
        case 14:
            tweets_goodhappy = parseCSV(string_csv)
            tweets_goodhappy.shift();
            tweets_goodhappy.pop();
            break;
    default:
    }
}



function parseCSV(csv) {
    var rows = csv.split("\n");

    return rows.map(function (row) {
    	return row.split(",");
    });
};
