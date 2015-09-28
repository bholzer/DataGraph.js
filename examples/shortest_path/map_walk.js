var graph = new DGJS.Graph('PathFind');
// This test generates nodes in random locations and connects them
// to nodes that fall within the specified radius

var HEIGHT = window.innerHeight;
var WIDTH = window.innerWidth;
var CONNECTION_RADIUS = 200;
var DISPLAY_NODE_COORD = true;
var NODE_RADIUS = 5;
var PATH = [];

for (var x = 0; x < 50; x++) {
  var node_data = {
    x: Math.floor(Math.random()*(WIDTH-10)),
    y: Math.floor(Math.random()*(HEIGHT-10))
  }
  graph.addNode(x, 0, node_data);
}

$.each(graph.nodes, function(i, node) {
  node.within_range = graph.findNodes(function(nd){
    return (Math.abs(nd.x-node.x) < CONNECTION_RADIUS) && (Math.abs(nd.y-node.y) < CONNECTION_RADIUS);
  });

  $.each(node.within_range, function(i, other_node) {
    if (other_node.id != node.id) {
      var distance = function(x1,y1,x2,y2) {
        return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
      }
      var distance = distance(node.x, node.y, other_node.x, other_node.y);
      graph.addEdge(node, other_node, distance);
    }
  });
});

function findPath() {
  var start_node = graph.findNode({id: parseInt($('#id1').val())});
  var end_node = graph.findNode({id: parseInt($('#id2').val())});
  PATH = graph.findPath(start_node, end_node);
  var current_step = 1;
  setInterval(function() {
    draw(current_step);
    if (current_step < PATH.length) { current_step+=1 }
  }, 600);
}

function draw(step) {

  var canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    var ctx = canvas.getContext("2d");
    ctx.canvas.width = WIDTH;
    ctx.canvas.height = HEIGHT;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha=1;
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
        ctx.font = "bold 12px sans-serif";
        ctx.fillStyle = 'black';
        // ctx.fillText("X: "+centerX, centerX+10, centerY)
        // ctx.fillText("Y: "+centerY, centerX+10, centerY+18)
        ctx.fillText("ID: "+node.id, centerX+5, centerY+10)
      }
    });
    for (var i = 0; i < graph.edges.length; i++) {
      var edge = graph.edges[i];
      var node = edge.a;
      var neighbors = node.neighbors();
      ctx.lineWidth = 2;
      for (var n = 0; n < neighbors.length; n++) {
        var neighbor = neighbors[n];
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(neighbor.x, neighbor.y);
        ctx.stroke();
      }
    }
    for (var i = 0; i < step; i++) {
      var node = PATH[i];
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#ff0000';
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(node.parent.x, node.parent.y);
      ctx.stroke();
    }
    ctx.restore();
  }
}
