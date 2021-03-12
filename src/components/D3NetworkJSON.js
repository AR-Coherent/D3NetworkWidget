import React, { useRef, useEffect, useState, createElement } from "react";
import * as d3 from "d3";

function Network(props) {
  const svgRef = useRef();

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
    .id(d => d.ID )
    .distance(d => d.biggestNode + 50);

    var simulation = d3.forceSimulation(nodesList)
    .force('charge', d3.forceCollide( d => parseInt(d.repulsion) + 25).strength(0.3))
    .force('centerX', d3.forceX(width / 2).strength(0.001))
    .force('centerY', d3.forceY(height / 2).strength(0.001))
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
    .attr("style", d => d.style)
    .attr('pointer-events', "none");

    var nodeRectContainer = g
    .append("g")
    .attr("class", `${props.widgetName}-nodes`)
    .selectAll('rect')
    .data(nodesList)
    .enter()
    .append("rect")   
    .attr("width", d => d.width)
    .attr("height", d => d.height)
    .attr("style", d => d.style)
    .attr("display", d => {
      if(d.shape !== 'rect'){
        return "none"
      }
    })
    .attr("class", `${props.widgetName}-node`)
    .call(
      d3.drag()
      .on("start", dragStarted)
      .on("drag", dragged)
      .on("end", dragEnded)
      );
    
    var nodeCircleContainer = g
    .append("g")
    .attr("class", `${props.widgetName}-nodes`)
    .selectAll('ellipse')
    .data(nodesList)
    .enter()
    .append("ellipse")
    .attr("href", "https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png")
    .attr("rx", d => d.width)
    .attr("ry", d => d.height)
    .attr("style", d => d.style)
    .attr("display", d => {
      if(d.shape !== 'ellipse'){
        return "none"
      }
    })
    .attr("class", `${props.widgetName}-node`)
    .call(
      d3.drag()
      .on("start", dragStarted)
      .on("drag", dragged)
      .on("end", dragEnded)
      );
    
    var nodeImageContainer = g
    .append("g")
    .attr("class", `${props.widgetName}-nodes`)
    .selectAll('image')
    .data(nodesList)
    .enter()
    .append("image")
    .attr("href", "https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png")
    .attr("width", d => d.width)
    .attr("height", d => d.height)
    .attr("display", d => {
      if(d.shape !== 'image'){
        return "none"
      }
    })
    .attr("class", `${props.widgetName}-node`)
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
    .attr("dy", d => {
      if(d.shape == 'ellipse'){
        return parseInt(d.height) + parseInt(7)
      }else{
        return parseInt(d.height/2) + parseInt(7)
      }})
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
        nodeRectContainer
            .attr('x', function(d) { return d.x - d.width/2 })
            .attr('y', function(d) { return d.y - d.height/2 });

        nodeCircleContainer
            .attr('cx', function(d) { return d.x })
            .attr('cy', function(d) { return d.y });

        nodeImageContainer
            .attr('x', function(d) { return d.x - d.width/2 })
            .attr('y', function(d) { return d.y - d.height/2 });

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

  function setNodesState (nodesdata){
    let nodes = [];
    nodesdata.forEach(node => {
      let nodeObj = {}
      nodeObj.ID = props.nodeID(node).value;
      nodeObj.name = props.nodeName(node).value;
      nodeObj.repulsion = getNodeRepulsion(node);
      nodeObj.shape = getNodeShape(node);
      nodeObj.width = getNodeWidth(node);
      nodeObj.height = getNodeHeight(node);
      nodeObj.style = getNodeStyle(node);
      nodes.push(nodeObj);
    })
    return nodes;
  }

  function setLinksState (linksdata, nodesList){
    let links = [];
    linksdata.forEach(link => {
      if(nodesList.some(node => node.ID === props.linkSourceID(link).value) && 
      nodesList.some(node => node.ID === props.linkTargetID(link).value)){
        let repulsionSource = nodesList.filter(node => { return node.ID === props.linkSourceID(link).value})[0].repulsion;
        let repulsionTarget = nodesList.filter(node => { return node.ID === props.linkTargetID(link).value})[0].repulsion;
        let linkObj = {
            "source": props.linkSourceID(link).value,
            "target": props.linkTargetID(link).value,
            "style": getLinkStyle(link),
            "biggestNode": Math.max(repulsionSource, repulsionTarget)
           }
          links.push(linkObj)
      }
    })
    return links;
  }

  function getNodeRepulsion(node){
    if (props.nodeRepulsion && props.nodeRepulsion(node).displayValue){
      return props.nodeRepulsion(node).displayValue;
    }else{
      return 5;
    }
  }

  function getNodeShape(node){
    if (props.nodeShape && props.nodeShape(node).displayValue){
      return props.nodeShape(node).displayValue;
    }else{
      return 'rect';
    }
  }

  function getNodeWidth(node){
    if (props.nodeWidth && props.nodeWidth(node).displayValue && props.nodeWidth(node).displayValue != ''){
      return props.nodeWidth(node).displayValue;
    }else{
      return '10';
    }
  }

  function getNodeHeight(node){
    if (props.nodeHeight && props.nodeHeight(node).displayValue && props.nodeHeight(node).displayValue != ''){
      return props.nodeHeight(node).displayValue;
    }else{
      return '10';
    }
  }

  function getNodeStyle(node){
    if (props.nodeStyle && props.nodeStyle(node).displayValue ){
      return props.nodeStyle(node).displayValue;
    }else{
      return '';
    }
  }

  function getLinkStyle(link){
    if (props.linkStyle && props.linkStyle(link).value && props.linkStyle(link).value != ''){
      return props.linkStyle(link).value
    }else{
      return "stroke:gray;stroke-width:2";
    }
  }

  return (
    <React.Fragment>
      <svg height={props.networkHeight} width={props.networkWidth} ref={svgRef}>
      </svg>
    </React.Fragment>
  );
}

export default Network;