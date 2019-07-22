onInitGraph = ()=> {
  let graph = new graphlib.Graph();
  //console.log('graph=<',graph,'>');
  graph.setNode('a');
  graph.setNode('b');
  graph.setEdge('a', 'b');
  let dot = graphlibDot;
  //console.log('dot=<',dot,'>');
  let dotGraph = dot.write(graph);
  //console.log('dotGraph=<',dotGraph,'>');
  let viz = new Viz();
  viz.renderSVGElement(dotGraph)
  .then(function(element) {
    document.body.appendChild(element);
  });
}
