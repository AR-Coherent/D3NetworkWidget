import React, { useRef, useEffect, useState, createElement } from "react";
import * as d3 from "d3";

function Network(props) {


  const [mxNodesState, setMxNodesState] = useState(setNodesState(props.nodes.items));
  const svgRef = useRef();

  function setNodesState (nodesdata){
    let nodes = [];
    nodesdata.forEach(node => {
      let nodeObj = {
        "name": props.nodeName(node).value
      }
      nodes.push(nodeObj);
    })
    return nodes;
  }

  let mxNodes = []
  let mxLinks = []

  setNodes(mxNodes, props.nodes.items);
  setLinks(mxLinks, props.links.items);

  function setNodes (nodesarr, nodesdata){
    nodesdata.forEach(node => {
      let nodeObj = {
        "name": props.nodeName(node).value
      }
      nodesarr.push(nodeObj)
    })
  }
  function setLinks (linksarr, linksdata){
    linksdata.forEach(link => {
      let linkObj = {
        "source": props.linkSource(link).value,
        "target": props.linkTarget(link).value
      }
      linksarr.push(linkObj)
    })
  }

  // will be called initially and on every data change
  useEffect(() => {
    var elem = document.querySelector(".network")
    if(elem != null){
      elem.parentNode.removeChild(elem);
    }
    const svg = d3.select(svgRef.current);
    
    var width = 100
    var height = 80
    var nodes = [
        {"name": "Travis", "sex": "M"},
        {"name": "Rake", "sex": "M"},
        {"name": "Diana", "sex": "F"},
        {"name": "Rachel", "sex": "F"},
        {"name": "Shawn", "sex": "M"},
        {"name": "Emerald", "sex": "F"}
    ]
    var links = [
        {"source": "Travis", "target": "Rake"},
        {"source": "Diana", "target": "Rake"},
        {"source": "Diana", "target": "Rachel"},
        {"source": "Rachel", "target": "Rake"},
        {"source": "Rachel", "target": "Shawn"},
        {"source": "Emerald", "target": "Rachel"}
    ]
    svg.attr("viewBox", [-width * 0.5, -height * 0.5, 2* width, 2* height]);
    const g = svg.append("g")
    .attr("class", "network")
    .attr("cursor", "grab");

    svg.call(d3.zoom()
    .extent([[-width, -height], [2 * width, 2 * height]])
    .scaleExtent([0.25, 4])
    .on("zoom", zoomed));

    function zoomed({transform}) {
      g.attr("transform", transform);
    }

    var link_force =  d3.forceLink(mxLinks)
    .id(function(d) { return d.name; })

    var simulation = d3.forceSimulation(mxNodes)
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force("links",link_force)
    .on('tick', ticked)
    .alphaMin(0.01)
    ;
    var linkContainer = g
    .append("g")
    .attr("class", "links")
    .selectAll('line')
    .data(mxLinks)
    .enter()
    .append('line')
    .attr('stroke', '#aaa')
    .attr('stroke-width', 2)
    .attr('pointer-events', "none");

    var nodeContainer = g
    .append("g")
    .attr("class", "nodes")
    .selectAll('circle')
    .data(mxNodes)
    .enter()
    .append('circle')
    .attr('r', 5)
    .call(
      d3.drag()
      .on("start", dragStarted)
      .on("drag", dragged)
      .on("end", dragEnded)
      );
    function dragStarted (event, d){
      if (!event.active) {
        simulation.alphaTarget(0.1).restart();
      }
    }
    function dragged (event, d){
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragEnded (event, d){
      d.fx = null;
      d.fy = null;
    }

    function ticked() {
        nodeContainer
            .attr('cx', function(d) { return d.x })
            .attr('cy', function(d) { return d.y });

        linkContainer
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; })
    }

  }, [props.nodes, props.links]);

  return (
    <React.Fragment>
      <svg height="400" width="500" ref={svgRef}>
      </svg>
    </React.Fragment>
  );
}

export default Network;