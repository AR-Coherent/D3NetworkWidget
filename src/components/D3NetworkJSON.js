import React, { useRef, useEffect, useState, createElement } from "react";
import * as d3 from "d3";

function Network(props) {
  const svgRef = useRef();

  function setNodesState (nodesdata){
    let nodes = [];
    nodesdata.forEach(node => {
      let nodeObj = {
        "ID": props.nodeID(node).value,
        "name": props.nodeName(node).value
      }
      nodes.push(nodeObj);
    })
    return nodes;
  }

  function setLinksState (linksdata, nodesList){
    let links = [];
    linksdata.forEach(link => {
      if(nodesList.some(node => node.ID === props.linkSourceID(link).value) && 
      nodesList.some(node => node.ID === props.linkTargetID(link).value)){
          let linkObj = {
            "source": props.linkSourceID(link).value,
            "target": props.linkTargetID(link).value
           }
          links.push(linkObj)
      }
    })
    return links;
  }

  useEffect(() => {
    let nodesList = setNodesState(props.nodes.items);
    let linksList = setLinksState(props.links.items, nodesList);
    
    var elem = document.querySelector(`.${props.widgetName}-network`)
    if(elem != null){
      elem.parentNode.removeChild(elem);
    }
    const svg = d3.select(svgRef.current);
     
    var width = 100
    var height = 100

    svg.attr("viewBox", [-width * 0.5, -height * 0.5, 2* width, 2* height]);

    const g = svg
    .attr("class", `${props.widgetName}-networksvg`)
    .append("g")
    .attr("class", `${props.widgetName}-network`)
    .attr("cursor", "grab");

    svg.call(d3.zoom()
    .extent([[-width, -height], [2 * width, 2 * height]])
    .scaleExtent([0.25, 4])
    .on("zoom", zoomed));

    var link_force =  d3.forceLink(linksList)
    .id(function(d) { return d.ID; });

    var simulation = d3.forceSimulation(nodesList)
    .force('charge', d3.forceCollide(25).strength(0.3))
    .force('centerX', d3.forceX(width / 2))
    .force('centerY', d3.forceY(height / 2))
    .force("links",link_force)
    .on('tick', ticked)
    .alphaMin(0.1);

    var linkContainer = g
    .append("g")
    .attr("class", `${props.widgetName}-links`)
    .selectAll('line')
    .data(linksList)
    .enter()
    .append('line')
    .attr('class', `${props.widgetName}-link`)
    .attr('stroke', '#aaa')
    .attr('stroke-width', 2)
    .attr('pointer-events', "none");

    var nodeContainer = g
    .append("g")
    .attr("class", `${props.widgetName}-nodes`)
    .selectAll('circle')
    .data(nodesList)
    .enter()
    .append('circle')
    .attr("class", `${props.widgetName}-node`)
    .attr('r', 5)
    .call(
      d3.drag()
      .on("start", dragStarted)
      .on("drag", dragged)
      .on("end", dragEnded)
      );

    var nodeLabelContainer = g
    .append("g")
    .attr("class", `${props.widgetName}-nodeLabels`)
    .selectAll('text')
    .data(nodesList)
    .enter()
    .append('text')
    .attr('class', 'network-label')
    .text(d => d.name)
    .attr("text-anchor", "middle")
    .attr("dx", 0)
    .attr("dy", 12)
    .attr("font-size", 6)
    .attr('pointer-events', "none");

    function zoomed({transform}) {
      g.attr("transform", transform);
    }
    function dragStarted (event, d){
      if (!event.active) {
        simulation.alphaTarget(0.3).restart();
      }
      if(props.nodeClick){
        const clickAction = props.nodeClick(props.nodes.items[d.index]);
        if(clickAction.canExecute){
          clickAction.execute();
        }
      }
    }
    function dragged (event, d){
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragEnded (event, d){
      if (!event.active) {
        d.fx = null;
        d.fy = null;
        simulation.alphaTarget(0.095);
      }
    }
    function ticked() {
        nodeContainer
            .attr('cx', function(d) { return d.x })
            .attr('cy', function(d) { return d.y });

        nodeLabelContainer
            .attr('x', function(d) { return d.x })
            .attr('y', function(d) { return d.y });

        linkContainer
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
    }

  }, [props.nodes, props.links]);

  return (
    <React.Fragment>
      <svg height={props.networkHeight} width={props.networkWidth} ref={svgRef}>
      </svg>
    </React.Fragment>
  );
}

export default Network;