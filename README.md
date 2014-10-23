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

###graph.addNode(name, value, attributes);
- `name` is a string, it's just a custom name for the node. Multiple nodes can have the same name.
- `value` is just a value for the node, can be of any type. Can be thought of as "weight".
- `attributes` is an object of custom attributes for the node. Could be a coordinate pair, or anything else.


###graph.findNodes(selector);
`selector` can be a string, function, attribute object, or DGJS.Node object

- If `selector` is a string, nodes will be found by name.
- If `selector` is a function, the callback receives a node as its argument. All nodes that pass the condition will be returned:

    ```
        graph.findNodes(function(node){
            return node.value > 50
        });
    ```
    
    will only return nodes with a value of greater than 50.
- If `selector` is a node object, only that node will be returned. I know this doesn't sound useful here, but it is helpful internally so I suppose it's worth mentioning. 
