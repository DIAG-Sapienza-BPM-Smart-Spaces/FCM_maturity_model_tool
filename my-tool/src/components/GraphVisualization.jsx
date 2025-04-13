import React, { useEffect } from 'react';
import * as d3 from 'd3';
import { prepareGraphData } from '../utils/graphUtils';

const GraphVisualization = ({ graphData }) => {
  useEffect(() => {
    if (!graphData) return; 

    const { nodeData, edgeData } = prepareGraphData(graphData.nodes, graphData.transitions);

    const width = 1400;
    const height = 800;

    const container = d3.select('#graph');
    container.selectAll('*').remove();

    const svg = container
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('border', '1px solid #ccc'); 

    const graphGroup = svg.append('g'); 

    // Aggiungi zoom e pan
    const zoom = d3.zoom()
      .scaleExtent([0.5, 2]) // Limiti di zoom (minimo 50%, massimo 200%)
      .on('zoom', (event) => {
        graphGroup.attr('transform', event.transform); 
      });

    svg.call(zoom); // Applica lo zoom all'SVG

    const simulation = d3.forceSimulation(nodeData)
      .force('link', d3.forceLink(edgeData).id(d => d.id).distance(200)) // Aumenta la distanza tra i nodi collegati
      .force('charge', d3.forceManyBody().strength(-250)) // Riduce la forza di repulsione
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = graphGroup.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(edgeData)
      .enter()
      .append('line')
      .attr('stroke-width', d => Math.sqrt(d.weight))
      .attr('stroke', '#999');

    const node = graphGroup.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodeData)
      .enter()
      .append('circle')
      .attr('r', 10)
      .attr('fill', '#69b3a2')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    const labels = graphGroup.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodeData)
      .enter()
      .append('text')
      .attr('font-size', '10px')
      .attr('fill', '#333')
      .text(d => d.meanings.join(', '));

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      labels
        .attr('x', d => d.x + 12)
        .attr('y', d => d.y + 3);
    });

    simulation.alpha(1).restart();
  }, [graphData]); 

  return <div id="graph" style={{ width: '100%', height: '100%' }}></div>;
};

export default GraphVisualization;