var graph = new GRJS.Graph('RandomNetwork');
// This test generates nodes in random locations and connects them
// to nodes that fall within the specified radius

var NODES_TO_GENERATE = 40;
var CONNECTION_RADIUS = 200;
var HEIGHT = window.innerHeight;
var WIDTH = window.innerWidth;
var DISPLAY_NODE_COORD = true;
var DISPLAY_CONNECTION_RADIUS = true;
var NODE_RADIUS = 5;

for (var i = 0; i < NODES_TO_GENERATE; i++) {
  var node_data = {
    x: Math.floor(Math.random()*(WIDTH-50)),
    y: Math.floor(Math.random()*(HEIGHT-50))
  }
  graph.addNode(i, 0, node_data, graph);
}

var distance - function(x1,y1,x2,y2) {
  return Math.sqrt(Math.pow(x2 - x1,2) + Math.pow(y2 - y1,2));
}

$.each(graph.nodes, function(i, node) {
  node.within_range = graph.findNodes(function(nd){
    return (Math.pow(nd.x - node.x,2) + Math.pow(nd.y - node.y,2)) < (CONNECTION_RADIUS*CONNECTION_RADIUS);
  });

  $.each(node.within_range, function(i, other_node) {
    if (other_node.id != node.id) {
      var distance = distance(node.x, node.y, other_node.x, other_node.y);
      graph.addEdge(node, other_node, distance);
    }
  });
});

function draw() {
  var canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    var ctx = canvas.getContext("2d");
    ctx.canvas.width = WIDTH;
    ctx.canvas.height = HEIGHT;

    $.each(graph.nodes, function(i, node) {
      var centerX = node.x;
      var centerY = node.y;
      // draw the node
      ctx.beginPath();
      ctx.arc(centerX, centerY, NODE_RADIUS, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'green';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#003300';
      ctx.stroke();
      if (DISPLAY_NODE_COORD) {
        ctx.font = "bold 20px sans-serif";
        ctx.fillStyle = 'black';
        ctx.fillText("X: "+centerX, centerX+10, centerY)
        ctx.fillText("Y: "+centerY, centerX+10, centerY+25)
      }
      if (DISPLAY_CONNECTION_RADIUS) {
        ctx.beginPath();
        ctx.globalAlpha = 0.04;
        ctx.arc(centerX, centerY, CONNECTION_RADIUS, 0, 2*Math.PI, false);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });
    for (var i in graph.edges) {
      var node_attrs = graph.nodes[i];
      var endpoints = graph.edges[i].endpoints;
      ctx.lineWidth = 1;
      $.each(endpoints, function(i, node) {
        ctx.beginPath();
        ctx.moveTo(node_attrs.x, node_attrs.y);
        ctx.lineTo(node.x, node.y);
        ctx.stroke();
      });
    }
  }
}