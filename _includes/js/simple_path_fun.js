function get_node(graph, name) {
    // get first node that has a name matching the given name (case-insensitive)
    return graph.nodes.filter(function(node) { return node.name.toUpperCase() == name.toUpperCase(); })[0]
}

function isConnected(a, b, origin) {
  return (linkedByIndex[a.index + "," + b.index] && b.index != origin.index) || a.index == b.index;
}

function zoomed() {
  container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function tick() {
  link.attr("d", linkArc);
  node.attr("transform", transform);
}

function transform(d) {
  return "translate(" + d.x + "," + d.y + ")";
}

// makes the arcs
function linkArc(d) {
  var dx = d.target.x - d.source.x,
      dy = d.target.y - d.source.y,
      dr = Math.sqrt(dx * dx + dy * dy);
  return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
}

function simple_paths(node, graph, depth) {
    var paths = [];
    var stack = [];
    (function simple_paths_helper(node, graph, depth) {
        if (depth <= 0) {
            paths.push(stack.slice(0));
            return;
        }
        // record node as visited to prevent cycles
        stack.push(node);
        var unvisited_neighbors = 0;
        var neighbors = graph[node];
        for (var i = 0; i < neighbors.length; i++) {
            if (stack.indexOf(neighbors[i]) === -1) {
                unvisited_neighbors += 1;
                simple_paths_helper(neighbors[i], graph, depth-1);
            } 
        }
        if (unvisited_neighbors === 0) {
            paths.push(stack.slice(0));
        }
        stack.pop(node);
        return;
    })(node, graph, depth);
    return paths;
}

function mouseover(d) {
  // possible depth change here 
  var simple_path_array = simple_paths(d.name, sample_graph, 100);
  // curried get_node function for easy mapping
  var curried_get_node = function (node_name) { return get_node(graph, node_name); };
  for(i = 0; i < simple_path_array.length; i++) { 
    var temp_array = simple_path_array[i].map(curried_get_node);
    for (j = 0; j < temp_array.length - 1; j++){
      var _ = set_highlight(temp_array[j + 1], temp_array[j]);
    }
}
  tip.html("<strong>" + d.name + ": </strong> <span style='color:red'>"
       + d.label + "</span>"
        );
  node.classed("mouseover", tip.show);
  d3.select(this).select("circle").transition()
    .duration(750)
    .attr("r", 16);
}

function mouseout(d) {
  d3.select(this).select("circle").transition()
    .duration(750)
    .attr("r", 16);
  exit_highlight(d);
  node.classed("mouseover", tip.hide);
}

function set_highlight(d, origin) {
  var connected_nodes = [];
  node.attr("class", function(o) {
    if (isConnected(d, o, origin)) {
      connected_nodes.push(o);
      return "node-active";
    } 
    else {
      return d3.select(this).attr("class");
    }
  });
  link.attr("marker-end", function(o) {
    return isLinkForNode(d, o, origin) ? "url(#end-active)" : d3.select(this).attr("marker-end");
  });
  link.attr("class", function(o) {
    return isLinkForNode(d, o, origin) ? "link-active" : d3.select(this).attr("class");
  });
  return connected_nodes;
}

function isLinkForNode(node, link, origin){
  return link.source.index == origin.index && link.target.index == node.index;
}

function exit_highlight(d) {
  node.attr("class", "node");
  link.attr("class", "link");
  link.attr("marker-end", "url(#end)");
}
