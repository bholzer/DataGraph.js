var GRJS = GRJS || {};
(function(){
  var CURRENT_NODE_ID = 0;

  GRJS.Node = function(name, value, attrs, graph) {
    this.id = CURRENT_NODE_ID++;
    this.name = name || ("Node"+this.id);
    this.value = value;
    this.graph = graph;
    for (key in attrs) {
      if (GRJS.Utility.type(this[key]) == 'undefined') {
        this[key] = attrs[key];
      }
    }
  };

  GRJS.Node.prototype.neighbors = function() {
    var ep_array = [];
    for (var ep in this.graph.edges[this.id].endpoints) {
      ep_array.push(this.graph.edges[this.id].endpoints[ep].neighbor)
    }
    return ep_array;
  };
})();

(function(){

  GRJS.Graph = function(name) {
    this.name = (name || 'Graph');
    this.nodes = {};
    this.edges = {};
  };

  // Every node has a name and value, and is assigned an ID which it uses for lookup
  // Nodes can also have any amount of custom data
  GRJS.Graph.prototype.addNode = function(name, value, attrs) {
    var new_node = new GRJS.Node(name.toString(), value, attrs, this);
    this.nodes[new_node.id] = new_node;
    this.edges[new_node.id] = {origin: new_node, endpoints:{}, attrs: {}};
    return new_node;
  };

  //TODO: Allow deleting by attributes
  GRJS.Graph.prototype.deleteNode = function(node_selector) {
    var node = this.findNode(node_selector);
    if (!node) {
      return false;
    } else {
      delete this.nodes[node];
      delete this.edges[node];
      for (var edge in this.edges) {
        for (var ep in this.edges[edge].endpoints) {
          if (this.edges[edge].endpoints[ep].neighbor == node) {
            delete this.edges[edge].endpoints[ep];
            break;
          }
        }
      }
      return true;
    }
  };

  // findNode take a string or an object as an argument
  // If a the argument is a string, the node is found by name
  // If the argument is an object, return all nodes that match the attributes provided
  // Functions can be provided as comparators for attributes as well
  GRJS.Graph.prototype.findNodes = function(selector) {
    var self = this;
    var findByName = function(name) {
      var matching_nodes = [];
      for (var id in self.nodes) {
        if (self.nodes[id].name == name) {
          matching_nodes.push(self.nodes[id]);
        }
      }
    };
    var findByFunction = function(finder) {
      var matching_nodes = []
      for (var node_id in self.nodes) {
        if (finder(self.nodes[node_id])) {
          matching_nodes.push(self.nodes[node_id]);
        }
      }
      return matching_nodes;
    };
    var findByAttributes = function(attributes) {
      var matching_nodes = [];
      for (var node_id in self.nodes) {
        var all_attributes_matching = true;
        for (attr in attributes) {
          all_attributes_matching = self.nodes[node_id][attr] == attributes[attr];
          if (!all_attributes_matching) { break; }
        }
        if (all_attributes_matching) {
          matching_nodes.push(self.nodes[node_id]);
        }
      }
      return matching_nodes;
    };

    var node;
    switch(GRJS.Utility.type(selector)) {
      case 'string':
        node = findByName(selector);
        break;
      case 'function':
        node = findByFunction(selector);
        break;
      case 'object':
        node = findByAttributes(selector);
        break;
      default:
        node = false;
    };
    return node;
  };

  GRJS.Graph.prototype.findNode = function(selector) {
    return this.findNodes(selector)[0];
  };

  GRJS.Graph.prototype.addEdge = function(node_1, node_2, weight, attrs) {
    this.edges[node_1.id].endpoints[node_2.id] = {neighbor: node_2, weight: weight};
    this.edges[node_2.id].endpoints[node_1.id] = {neighbor: node_1, weight: weight};
    this.edges[node_2.id].endpoints[node_1.id].attrs = attrs;
    this.edges[node_1.id].endpoints[node_2.id].attrs = attrs;
  };

  // Implement A*
  GRJS.Graph.prototype.findPath = function(start_node, end_node) {
    var nodes = (function(context) {
      var built_nodes = {};
      for (var id in context.nodes) {
        var $id = parseInt(id);
        built_nodes[$id] = {
          f: 0,
          g: 0,
          h: 0,
          id: $id
        };
      }
      return built_nodes;
    })(this);

    var closed_list = {};    // Nodes already evaluated
    var open_list = {};      // Tentative set of nodes
    open_list[start_node.id] = nodes[start_node.id];
    while (_.length(open_list) > 0) {
      var lowest_id = 0;
      for (var id in open_list) {
        var $id = parseInt(id);
        if (_.type(open_list[lowest_id]) == 'undefined') { lowest_id = $id }
        if (open_list[$id].f < open_list[lowest_id].f) { lowest_id = $id };
      }
      var current_node = open_list[lowest_id];
      if (current_node.id == end_node.id) {
        var curr = current_node;
        var ret = [];
        while (curr.parent) {
          var node_obj = this.nodes[curr.id];
          node_obj.parent = this.nodes[curr.parent.id];
          ret.push(this.nodes[curr.id]);
          curr = curr.parent;
        }
        return ret.reverse();
      }
      delete open_list[current_node.id];
      closed_list[current_node.id] = current_node;
      var neighbors = this.nodes[current_node.id].neighbors();

      for (var i = 0; i < neighbors.length; i++) {
        var neighbor = {
          f: 0,
          g: 0,
          h: 0,
          id: neighbors[i].id
        };
        if (closed_list[neighbor.id]) {
          // Already dismissed this node, skip it
          continue;
        }
        var edge_to_traverse = this.edges[current_node.id].endpoints[neighbor.id]
        var g_score = current_node.g+edge_to_traverse.weight;
        var is_best_g = false;
        if (!open_list[neighbor.id]) {
          // First time hitting this node
          is_best_g = true;
          neighbor.h = 1;
          if (_.type(neighbor) =='undefined') {debugger}
          open_list[neighbor.id] = neighbor;
        } else if (g_score < neighbor.g) {
          is_best_g = true;
        }
        if (is_best_g) {
          // Found an optimal path, store parents and g,f,h
          neighbor.parent = current_node;
          neighbor.g = g_score;
          neighbor.f = neighbor.g + neighbor.h;
        }
      }
    }
    return [];
  };
})();

GRJS.Utility = GRJS.Utility || {};
(function(){

  GRJS.Utility.type = (function(global) {
    var cache = {};
    return function(obj) {
      var key;
      return obj === null ? 'null' // null
        : obj === global ? 'global' // window in browser or global in nodejs
        : (key = typeof obj) !== 'object' ? key // basic: string, boolean, number, undefined, function
        : obj.nodeType ? 'object' // DOM element
        : cache[key = ({}).toString.call(obj)] // cached. date, regexp, error, object, array, math
        || (cache[key] = key.slice(8, -1).toLowerCase()); // get XXXX from [object XXXX], and cache it
    };
  }(this));

  GRJS.Utility.contains = function(collection, el) {
    return collection.indexOf(el) > -1;
  };

  GRJS.Utility.each = function(collection, iterator) {
    for (var i = 0; i < collection.length; i++) {
      iterator(collection[i], i);
    }
  };
  GRJS.Utility.length = function(obj) {
    if (this.type(obj) == 'array') {
      return obj.length
    } else if (this.type(obj) == 'object') {
      var size = 0, key;
      for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
      }
      return size;
    }
  };
  window._ = GRJS.Utility;
})();