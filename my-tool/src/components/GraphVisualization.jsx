import React, { useEffect } from 'react';
import * as d3 from 'd3';
import { prepareGraphData, initialNodes } from '../utils/graphUtils';

const GraphVisualization = ({ graphData }) => {
  const [selectedNode, setSelectedNode] = React.useState(null);

  useEffect(() => {
    if (!graphData) return; 

    const { nodeData, edgeData } = prepareGraphData(graphData.nodes, graphData.transitions);

    const container = d3.select('#graph');
    container.selectAll('*').remove();

    const width = container.node().clientWidth; // Larghezza dinamica del contenitore
    const height = width * 0.5; // Altezza dinamica (50% della larghezza)

    const svg = container
      .append('svg')
      .style('background-color', '#f9f9f9')
      .attr('width', '100%') // Larghezza reattiva
      .attr('height', '100%') // Altezza reattiva
      .attr('viewBox', `0 0 ${width} ${height}`) // Definisce il sistema di coordinate
      .attr('preserveAspectRatio', 'xMidYMid meet') // Mantiene le proporzioni
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
      .force("link", d3.forceLink(edgeData).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-150))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Arresta la simulazione e fissa i nodi
    simulation.on('end', () => {
      nodeData.forEach(d => {
        d.fx = d.x; // Fissa la posizione finale del nodo
        d.fy = d.y;
      });
      simulation.stop(); // Ferma la simulazione
    });

    const link = graphGroup.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(edgeData)
      .enter()
      .append('line')
      .attr('stroke-width', d => Math.sqrt(d.weight) * 5)
      .attr('stroke', '#a37f1f')
      .attr("stroke-opacity", 0.6)


    const node = graphGroup.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodeData)
      .enter()
      .append('circle')
      .attr('r', 15)
      .attr('fill', d => (selectedNode && selectedNode.id === d.id) ? '#f006f0' : '#0ff7aa')
      .style("cursor", "pointer")
      .on('click', (event, d) => {
        setSelectedNode(d); // Aggiorna il nodo selezionato
        d.fx = d.x;
        d.fy = d.y;
        event.stopPropagation(); // Ferma la propagazione dell'evento
      })
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = d.x;
          d.fy = d.y;
        }));

    const labels = graphGroup.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodeData)
      .enter()
      .append('text')
      .attr('font-size', '20px')
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
  }, [graphData, selectedNode]); // Ricalcola il grafo quando i dati cambiano

  const handleWeightChange = (event) => {
    if (selectedNode) {
      selectedNode.weight = parseFloat(event.target.value) || 0;
      setSelectedNode({ ...selectedNode });
    }
  };

  const handleUpdateWeight = () => {
    if (selectedNode) {
      const nodeIndex = initialNodes.findIndex(node => node.id === selectedNode.id);
      if (nodeIndex !== -1) {
        initialNodes[nodeIndex].weight = selectedNode.weight; // Aggiorna il peso
        console.log('Nodi aggiornati:', initialNodes); // Per verificare l'aggiornamento
      }
      alert(`Peso del nodo ${selectedNode.label} aggiornato a ${selectedNode.weight}`);
    }
  };

  return (
    <div className="box-container">
      <h2 className="box-title">Dashboard Grafo</h2>
      <div id="graph" style={{ width: '100%', height: '100%' }}></div>

      {selectedNode && (
        <div id="cambio" className="mt-4 bg-white p-4 rounded shadow-md">
          <h3 className="text-lg font-bold mb-2">Modifica Peso</h3>
          <div className="flex items-center gap-4">
            <div className="font-medium">Nodo: {selectedNode.label}</div>
            <div className="flex items-center">
              <label htmlFor="weight-input" className="mr-2">Peso:</label>
              <input
                id="weight-input"
                type="number"
                value={selectedNode.weight || ''}
                onChange={handleWeightChange}
                className="w-24 p-2 border rounded"
              />
              <button
                onClick={handleUpdateWeight}
                className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
              >
                Aggiorna
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphVisualization;