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

Now that you have your graph object created, you can start adding nodes by calling the `addNode` method.

```javascript
graph.addNode(name, value, attributes);
```
> `name` is a string, is just a custom name for the node
> `value` is just a value for the node, can be of any type. Can be thought of as "weight"
> `attributes` is an object of custom attributes for the node. Could be a coordinate pair, or anything else.
