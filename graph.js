$(document).ready(function() {
    // Do stuff when the page is loaded
    stockDatasets();
    stockTweets();
})

var tweets_trump2018 = null;
var tweets_china = null;
var tweets_badsad = null;

var points_trump2018 = null;
var points_china = null;
var points_badsad = null;

var bool_2018 = true;
var bool_china = true;
var bool_badsad = true;

var btn_china = null;
var btn_badsad = null;

var color_china = '#f4511e';
var color_badsad = '#f4511e';


var graph = null;


window.onload=function(){
    btn_china = document.getElementById("btn_china");
    btn_china.addEventListener("mouseover", function() { changeColor('blue', 1); });
    btn_china.addEventListener("mouseout", function() { changeColor('#f4511e', 1); });

    btn_badsad = document.getElementById("btn_badsad");
    btn_badsad.addEventListener("mouseover", function() { changeColor('blue', 2); });
    btn_badsad.addEventListener("mouseout", function() { changeColor('#f4511e', 2); });
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
    default:
    }

    drawVisualization();
    console.log("color changed");
}


function onclick(point) {
    console.log(point);
    //window.alert("The point " + point.id + " at coordinates (" + point.x.toFixed(3) + ", " + point.y.toFixed(3) + ", " + point.z.toFixed(3) + ") has text: " + point.text)
    window.alert("Tweet:\n" + point.text + "\n _____ \nSentiment prediction: \nNegative - " + point.x.toFixed(3) + "\nNeutral -" + point.z.toFixed(3) + "\nPositive - " + point.y.toFixed(3))
}

// Called when the Visualization API is loaded.
function drawVisualization() {
    // create the data table.
    data_d = new vis.DataSet();

    var id_counter = 0
    // create the animation data
    if(bool_2018){
        for (var i = 0; i < points_trump2018.length; i++) {
            var style = '#f4511e'; // Color
            id_counter = id_counter+1;
            data_d.add({id: id_counter, text: tweets_trump2018[i], x: parseFloat(points_trump2018[i][0]), y: parseFloat(points_trump2018[i][2]), z: parseFloat(points_trump2018[i][1]), style: style});
            //data_d.add({x: x, y: y, z: z, style: style});
        }
    }

    // create the animation data
    if(bool_china){
        for (var i = 0; i < points_china.length; i++) {
            var style = color_china; // Color
            id_counter = id_counter+1;
            data_d.add({id: id_counter, text: tweets_china[i], x: parseFloat(points_china[i][0]), y: parseFloat(points_china[i][2]), z: parseFloat(points_china[i][1]), style: style});
            //data_d.add({x: x, y: y, z: z, style: style});
        }
    }

    // create the animation data
    if(bool_badsad){
        for (var i = 0; i < points_badsad.length; i++) {
            var style = color_badsad; // Color
            id_counter = id_counter+1;
            data_d.add({id: id_counter, text: tweets_badsad[i], x: parseFloat(points_badsad[i][0]), y: parseFloat(points_badsad[i][2]), z: parseFloat(points_badsad[i][1]), style: style});
            //data_d.add({x: x, y: y, z: z, style: style});
        }
    }

    //data.shift();
    //data.pop();

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
        cameraPosition: {
            horizontal: -3.14*3/4,
            vertical: 0.785,
            distance: 3
        }
    };

    // create our graph
    var container = document.getElementById('mygraph');
    graph = new vis.Graph3d(container, data_d, options);

}



// Read points from csv.
function readPoints_2018(string_csv) {
    points_trump2018 = parseCSV(string_csv)

    points_trump2018.shift();
    points_trump2018.pop();
    //console.log(points_trump2018)
}

function readPoints_china(string_csv) {
    points_china = parseCSV(string_csv)

    points_china.shift();
    points_china.pop();
    //console.log(points_china)
}

function readPoints_badsad(string_csv) {
    points_badsad = parseCSV(string_csv)

    points_badsad.shift();
    points_badsad.pop();
    console.log("Points badsad");
    console.log(points_badsad);
}

function parseCSV(csv) {
    var rows = csv.split("\n");

    return rows.map(function (row) {
    	return row.split(",");
    });
};


function readCSV_points_2018(url) {
    return $.ajax({
        type: "GET",
        url: url,
        dataType: "text",
        success: function(response) {
            readPoints_2018(response);
        }
    });
}

function readCSV_points_china(url) {
    return $.ajax({
        type: "GET",
        url: url,
        dataType: "text",
        success: function(response) {
            readPoints_china(response);
        }
    });
}

function readCSV_points_badsad(url) {
    return $.ajax({
        type: "GET",
        url: url,
        dataType: "text",
        success: function(response) {
            readPoints_badsad(response);
        }
    });
}

function readCSV_tweets_2018(url) {
    return $.ajax({
        type: "GET",
        url: url,
        dataType: "text",
        success: function(response) {
            read_tweets_2018(response);
        }
    });
}

function readCSV_tweets_china(url) {
    return $.ajax({
        type: "GET",
        url: url,
        dataType: "text",
        success: function(response) {
            read_tweets_china(response);
        }
    });
}

function readCSV_tweets_badsad(url) {
    return $.ajax({
        type: "GET",
        url: url,
        dataType: "text",
        success: function(response) {
            read_tweets_badsad(response);
        }
    });
}

function read_tweets_2018(string_csv) {
    tweets_trump2018 = parseCSV(string_csv)

    tweets_trump2018.shift();
    tweets_trump2018.pop();
    //console.log(tweets_trump2018);
}

function read_tweets_china(string_csv) {
    tweets_china = parseCSV(string_csv)

    tweets_china.shift();
    tweets_china.pop();
}

function read_tweets_badsad(string_csv) {
    tweets_badsad = parseCSV(string_csv)

    tweets_badsad.shift();
    tweets_badsad.pop();
}

function stockDatasets() {
    readCSV_points_2018("https://ufity.com/uploads/points_trump_200.csv");
    readCSV_points_china("https://ufity.com/uploads/pred_china.csv");
    readCSV_points_badsad("https://ufity.com/uploads/pred_badsad.csv");

    setTimeout(drawVisualization, 600);
}

function stockTweets() {
    readCSV_tweets_2018("https://ufity.com/uploads/tweets_trump2018.csv");
    readCSV_tweets_china("https://ufity.com/uploads/tweets_china.csv");
    readCSV_tweets_badsad("https://ufity.com/uploads/tweets_badsad.csv");
}
