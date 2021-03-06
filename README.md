DataGraph.js
============

A graph data structure in JavaScript

Initializing the graph
----------------------

```javascript
var graph = new DGJS.Graph();
```


The graph object
----------------

The graph object has two attributes: `nodes` and `edges`.
- `graph.nodes` will return an array of nodes the graph contains.
- `graph.edges` will return an array of edges the graph contains.


To make the graph useful, you need to add some nodes!

####graph.addNode(name, value, attributes);
- `name` is a string, it's just a custom name for the node. Multiple nodes can have the same name.
- `value` is just a value for the node, can be of any type. Can be thought of as "weight". Default is `0`.
- `attributes` is an optional object of custom attributes for the node. Could be a coordinate pair, or anything else.
- Returns the newly created node

```javascript
// Add 10 nodes with random x and y data
for (var x = 0; x < 10; x++) {
  graph.addNode("Node", 0, {
    x: Math.random(),
    y: Math.random()
  });
}
```


####graph.findNodes(selector);
`selector` can be a string, function, attribute object, or DGJS.Node object. These same selectors are used to find nodes in other methods as well.

- If `selector` is a string, nodes will be found by name.
- If `selector` is a function, the callback receives a node as its argument. All nodes that pass the condition will be returned:

    ```
    graph.findNodes(function(node){
        return node.value > 50;
    });
    ```
    
    This example will only return nodes with a value of greater than 50.
- If `selector` is a node object, only that node will be returned. I know this doesn't sound useful here, but it is helpful internally so I suppose it's worth mentioning.

####graph.findNode(selector);
Uses `findNodes()` internally and just returns the first result.

####graph.addEdge(node1, node2, value, attributes);
Adds an edge between two nodes
- Nodes 1 and 2 are the two nodes to connect. These can be either be a node selector or the node itself.
- `value` is the weight, distance, or difficulty of traversal. Default is `0`.
- `attributes` is an optional object of custom attributes for the edge.
- Returns the newly added edge.

####graph.findPath(node1, node2);
Finds the shortest path between two nodes.
- `node1` is the node to start from, `node2` is the node to travel to.
- Returns an array of nodes, ordered by which position they are in the path. If no path was found, this will be an empty array.


The node object
---------------

If you need to create a node object manually:

```javascript
var node = new DGJS.Node(name, value, attributes, graph);
```

- `name` is a string name for your node. Multiple nodes can have the same name.
- `value` is an arbritrary value for the node, can be of any type.
- `attributes` is an optional object of custom attributes for the node.
- `graph` is the optional graph object you want the node to be added to. 

####node.neighbors();
- Returns an array of nodes this node is connected to by an edge.
