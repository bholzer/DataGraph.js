var GRJS = GRJS || {};
(function(){
  var NODE_ID_COUNT = 0;

  GRJS.Node = function(name, value, attrs, graph) {
    this.id = NODE_ID_COUNT++;
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
    for (var i = 0; i < this.graph.edges.length; i++) {
      var edge = this.graph.edges[i];
      if (edge.a === this) {
        ep_array.push(edge.b);
      }
    }
    return ep_array;
  };
})();

(function(){

  GRJS.Graph = function(name) {
    this.name = (name || 'Graph');
    this.nodes = [];
    this.edges = [];
  };

  // Every node has a name and value, and is assigned an ID which it uses for lookup
  // Nodes can also have any amount of custom data
  GRJS.Graph.prototype.addNode = function(name, value, attrs) {
    var new_node = new GRJS.Node(name.toString(), value, attrs, this);
    this.nodes.push(new_node);
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

  /**
   * @param selector {String, Function, Object, GRJS.Node} selector can be any of these types
   * @return {Array} list of nodes found
  */
  GRJS.Graph.prototype.findNodes = function(selector) {
    // allow functions to be called with the node or node selector
    if (selector instanceof GRJS.Node) {
      return [selector];
    }

    var self = this; //inner functions have scope of window?
    function findByName(name) {
      var matching_nodes = [];
      for (var i = 0; i < self.nodes.length; i++) {
        if (self.nodes[i].name == name) {
          matching_nodes.push(self.nodes[i]);
        }
      }
    };
    function findByFunction(finder) {
      var matching_nodes = []
      for (var i = 0; i < self.nodes.length; i++) {
        if (finder(self.nodes[i])) {
          matching_nodes.push(self.nodes[i]);
        }
      }
      return matching_nodes;
    };
    function findByAttributes(attributes) {
      var matching_nodes = [];
      for (var i = 0; i < self.nodes.length; i++) {
        var all_attributes_matching = true;
        for (attr in attributes) {
          all_attributes_matching = self.nodes[i][attr] == attributes[attr];
          if (!all_attributes_matching) { break; }
        }
        if (all_attributes_matching) {
          matching_nodes.push(self.nodes[i]);
        }
      }
      return matching_nodes;
    };

    var nodes;
    // Delegate to finders by selector type
    switch(GRJS.Utility.type(selector)) {
      case 'string':
        nodes = findByName(selector);
        break;
      case 'function':
        nodes = findByFunction(selector);
        break;
      case 'object':
        nodes = findByAttributes(selector);
        break;
      default:
        nodes = [];
    };
    return nodes;
  };

  /**
   * @param selector {String, Function, Object, GRJS.Node} selector can be any of these types
   * @return {GRJS.Node} uses findNodes then pulls the first or only result
  */
  GRJS.Graph.prototype.findNode = function(selector) {
    var selection = this.findNodes(selector);
    return !!selection.length ? selection[0] : [];
  };

  /**
   * @param node_1 {String, Object, Function, GRJS.Node} node selectors
   * @param node_2 {String, Object, Function, GRJS.Node} ditto
   * @param value [{Number}=1] value will be the distance, weight, or difficulty of edge traversal
   * @param attrs [{Object}={}] object of custrom attributes
  */
  GRJS.Graph.prototype.addEdge = function(node_1, node_2, value, attrs) {
    value = (typeof value !== 'undefined' ? value : 1);
    attrs = (typeof attrs !== 'undefined' ? attrs : {});
    var from_node = this.findNode(node_1);
    var to_node = this.findNode(node_2);
    var edge = {
      a: from_node,
      b: to_node,
      value: value,
      attrs: attrs
    };
    this.edges.push(edge);
    return edge;
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