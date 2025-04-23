import React, { useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { prepareGraphData, initialNodes } from '../utils/graphUtils';
import ElementsList from './ElementsList';

const GraphVisualization = ({ graphData }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  
  const nodeConnections = useMemo(() => ({
    0: [0, 1, 2, 3, 4, 5],
    1: [1, 6, 7, 8, 9, 10, 11, 12], 
    2: [2, 13, 14, 15, 16, 17, 18],
    3: [3, 19, 20, 21, 22, 23, 24, 25, 26],
    4: [4, 27, 28, 29, 30, 31, 32, 33, 34],
    5: [5, 35, 36, 37, 38, 39, 40, 41, 42],
  }), []);

  useEffect(() => {
    if (!selectedZone) return;
  
    // Ottieni i nodi collegati alla zona selezionata
    const connectedNodeIds = nodeConnections[selectedZone.id] || [];
    const connectedNodes = graphData.nodes.filter(node => connectedNodeIds.includes(node.id));
  
    // Filtra i collegamenti per includere solo quelli tra i nodi collegati
    const connectedLinks = graphData.transitions
      .filter(link => connectedNodeIds.includes(link.from) && connectedNodeIds.includes(link.to))
      .map(link => ({
        ...link,
        source: connectedNodes.find(node => node.id === link.from),
        target: connectedNodes.find(node => node.id === link.to),
      }));
  
    // Seleziona il contenitore SVG
    const container = d3.select('#subgraph');
    container.selectAll('*').remove(); // Rimuovi eventuali elementi precedenti
  
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
  
    // Crea un nuovo SVG
    const svg = container
      .append('svg')
      .attr('width', width)
      .attr('height', height);
  
    const graphGroup = svg.append('g');
  
    // Configura la simulazione D3 per i nodi collegati
    const simulation = d3.forceSimulation(connectedNodes)
      .force('link', d3.forceLink(connectedLinks).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2));
  
    // Disegna i collegamenti
    const link = graphGroup.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(connectedLinks)
      .enter()
      .append('line')
      .attr('stroke-width', d => d.weight * 2) // Spessore proporzionale al peso
      .attr('stroke', '#aaa');
  
    // Disegna i nodi
    const node = graphGroup.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(connectedNodes)
      .enter()
      .append('circle')
      .attr('r', d => Math.max(5, d.weight * 2)) // Dimensione proporzionale al peso
      .attr('fill', d => (selectedNode && selectedNode.id === d.id) ? '#f006f0' : '#007bff') // Nodo selezionato in evidenza
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .call(d3.drag()
        .on('start', (event, d) => {
          if (selectedNode && selectedNode.id === d.id) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          }
        })
        .on('drag', (event, d) => {
          if (selectedNode && selectedNode.id === d.id) {
            d.fx = event.x;
            d.fy = event.y;
          }
        })
        .on('end', (event, d) => {
          if (selectedNode && selectedNode.id === d.id) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null; // Rilascia il nodo
            d.fy = null;
          }
        })
      );
  
    // Disegna le etichette
    const labels = graphGroup.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(connectedNodes)
      .enter()
      .append('text')
      .attr('font-size', d => `${Math.max(10, d.weight * 2)}px`) // Font proporzionale al peso
      .attr('fill', '#333')
      .text(d => d.meanings.join(', '));
  
    // Aggiorna le posizioni durante la simulazione
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
  }, [selectedZone, graphData, nodeConnections, selectedNode]); // Aggiungi selectedNode come dipendenza

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
        // Verifica se il nodo appartiene alla zona selezionata
        const connectedNodeIds = selectedZone ? nodeConnections[selectedZone.id] || [] : [];
        if (!connectedNodeIds.includes(d.id)) {
          // Deseleziona la zona se il nodo non appartiene
          setSelectedZone(null);
        }
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
          d.fx = null; // Rilascia il nodo
          d.fy = null;
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
  }, [graphData, selectedNode, nodeConnections, selectedZone]); // Ricalcola il grafo quando i dati cambiano
  
  const zones = graphData.nodes.filter(node => node.role === 'root' || node.role === 'intermediate'); 
    
  const handleZoneClick = (zone) => {
    if (selectedZone?.id === zone.id) {
      // Se la zona cliccata è già selezionata, deseleziona
      setSelectedZone(null);
      setSelectedNode(null); // Resetta anche il nodo selezionato
    } else {
      // Altrimenti, seleziona la nuova zona
      setSelectedZone(zone);
      setSelectedNode(null); // Resetta il nodo selezionato
    }
  };

  // Funzione per aggiornare il peso del nodo selezionato
  const handleUpdateWeight = (nodeId, newWeight) => {
    if(selectedNode) {
      const nodeIndex = initialNodes.findIndex(node => node.id === selectedNode.id);
      if (nodeIndex !== -1) {
        initialNodes[nodeIndex].weight = selectedNode.weight; // Aggiorna il peso
        
        const updatedNodes = graphData.nodes.map(node =>
          node.id === nodeId ? { ...node, weight: newWeight } : node
        );
        console.log('Nodi aggiornati:', updatedNodes);
        console.log('Nodi aggiornati:', initialNodes); // Per verificare l'aggiornamento
        
        graphData.nodes = updatedNodes; // Aggiorna i nodi nel grafo
        setSelectedNode(prevNode => ({ ...prevNode, weight: newWeight })); // Aggiorna il nodo selezionato
      }

      alert(`Peso del nodo ${selectedNode.meanings?.join(', ')} aggiornato a ${selectedNode.weight}`);
    }
  };

  return (
    <div className="box-container">
      <h2 className="box-title">Dashboard Grafo</h2>
      <div id="graph" style={{ width: '100%', height: '400px', border: '1px solid #ccc' }}></div>

      {/* Zona pulsanti */}
      <div className="mt-4 bg-white p-4 rounded shadow-md">
        <h3 className="text-lg font-bold mb-2">Seleziona Zona</h3>
        <div className=" zone-buttons flex flex-wrap gap-20">
          {zones.map(zone => (
            <button
              key={zone.id}
              onClick={() => handleZoneClick(zone)}
              className={`px-4 py-2 rounded ${
                selectedZone?.id === zone.id ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {zone.meanings.join(', ')}
            </button>
          ))}
        </div>
      </div>

      {/* Zona tabellare */}
      {selectedZone && (
        <div className="table-svg-container mt-4 bg-white p-4 rounded shadow-md">
          <h3 className="text-lg font-bold mb-2">Nodi Collegati a {selectedZone.meanings.join(', ')}</h3>
          <div className="flex">
            {/* Colonna sinistra: Tabella */}
            <div className="table-column flex-1 overflow-y-auto">
              <ElementsList
                nodes={graphData.nodes}
                connectedNodeIds={nodeConnections[selectedZone.id] || []}
                onSelectNode={setSelectedNode}
              />
            </div>

            {/* Colonna destra: SVG */}
            <div className="svg-column flex-1">
              <div id="subgraph" className="w-full h-full border rounded"></div>
            </div>
          </div>
        </div>
      )}

      {/* Zona modifica peso */}
      {selectedNode && (
        <div id="cambio" className="mt-4 bg-white p-4 rounded shadow-md">
        <h3 className="text-lg font-bold mb-2">Modifica Peso</h3>
        <div className="weight-section">
          <label htmlFor="weight-input">Nodo: {selectedNode.meanings?.join(', ')}</label>
          <input
            id="weight-input"
            type="number"
            value={selectedNode.weight || ''}
            onChange={(e) =>
              setSelectedNode({ ...selectedNode, weight: parseFloat(e.target.value) || 0 })
            }
            className="w-24 p-2 border rounded"
          />
          <button
            onClick={() => handleUpdateWeight(selectedNode.id, selectedNode.weight)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
          >
            Aggiorna
          </button>
        </div>
      </div>
      )}
    </div>
  );
};

export default GraphVisualization;