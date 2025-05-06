import React, { useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { prepareGraphData, initialNodes } from '../utils/graphUtils';
import ElementsList from './ElementsList';

const GraphVisualization = ({ graphData }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [filteredGraphData, setFilteredGraphData] = useState(graphData);
  const [enabledSections, setEnabledSections] = useState(
    graphData.nodes.reduce((acc, node) => {
      if (node.role === 'root' || node.role === 'intermediate') {
        acc[node.id] = true; // Inizializza tutte le sezioni come abilitate
      }
      return acc;
    }, {})
  );
  
  const nodeConnections = useMemo(() => ({
    1: [6, 7, 8, 9, 10, 11, 12], 
    2: [13, 14, 15, 16, 17, 18],
    3: [19, 20, 21, 22, 23, 24, 25, 26],
    4: [27, 28, 29, 30, 31, 32, 33, 34],
    5: [35, 36, 37, 38, 39, 40, 41, 42],
  }), []);

  const getNodeAttributes = (weight) => {
    switch (weight) {
      case 'very low':
        return { radius: 7.5, color: '#a3c1ad' }; // Verde chiaro
      case 'low':
        return { radius: 10, color: '#7fbf7f' }; // Verde medio
      case 'medium':
        return { radius: 12.5, color: '#5fa55a' }; // Verde scuro
      case 'high':
        return { radius: 15, color: '#3f8f3f' }; // Verde più scuro
      case 'very high':
        return { radius: 17.5, color: '#2f6f2f' }; // Verde intenso
      default: 
        return { radius: 5, color: '#000' }; // Nero per "none"
    }
  };

  useEffect(() => {   // Aggiorna i dati filtrati quando le sezioni abilitate cambiano
    const updateFilteredGraphData = () => {
      const enabledZoneIds = Object.keys(enabledSections).filter(zoneId => enabledSections[zoneId]);
  
      // Ottieni i nodi visibili
      const visibleNodeIds = enabledZoneIds.flatMap(zoneId => nodeConnections[zoneId] || []);
      
      // Aggiungi sempre il nodo root e i nodi intermediate
      const rootAndIntermediateIds = [0, ...Object.keys(nodeConnections).map(Number)];
      const allVisibleNodeIds = [...new Set([...visibleNodeIds, ...rootAndIntermediateIds])];

      // Filtra i nodi e i collegamenti in base ai nodi visibili
      const filteredNodes = graphData.nodes.filter(node => allVisibleNodeIds.includes(node.id));
      const filteredTransitions = graphData.transitions.filter(
        link => allVisibleNodeIds.includes(link.from) && allVisibleNodeIds.includes(link.to)
      );
  
      // Aggiorna i dati del grafo
      setFilteredGraphData({
        nodes: filteredNodes,
        transitions: filteredTransitions,
      });
    };
  
    updateFilteredGraphData();
  }, [enabledSections, graphData, nodeConnections]);

  const subgraphRef = React.useRef(null);
  useEffect(() => {         //SUB-GRAPH
    if (!selectedZone || !subgraphRef.current) return;
    //const timeout=setTimeout(() => {
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
      const container = d3.select(subgraphRef.current);
      container.selectAll('*').remove(); // Rimuovi eventuali elementi precedenti
      
      const width = subgraphRef.current.clientWidth;
      const height = subgraphRef.current.clientHeight;
    
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
      
      // Aggiungi zoom e pan
      const zoom = d3.zoom()
        .scaleExtent([0.5, 2]) // Limiti di zoom (minimo 50%, massimo 200%)
        .on('zoom', (event) => {
          graphGroup.attr('transform', event.transform); 
        });

      svg.call(zoom); // Applica lo zoom all'SVG
      
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
        .attr('r', d => getNodeAttributes(d.weight).radius) // Dimensione proporzionale al peso
        .attr('fill', d => getNodeAttributes(d.weight).color) // Colore proporzionale al peso
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style("cursor", "pointer")
        .on('click', (event, d) => {
          setSelectedNode(d); // Aggiorna il nodo selezionato
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
          // Mantieni la posizione finale del nodo
          d.fx = d.x;
          d.fy = d.y;
        }));
    
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
    /*}, 0);

    return () => clearTimeout(timeout);*/ // Pulisci il timeout se il componente viene smontato
  }, [selectedZone, graphData, nodeConnections, selectedNode]); // Aggiungi selectedNode come dipendenza

  useEffect(() => {     //MAIN GRAPH  
    if (!filteredGraphData) return; 
    const timeout = setTimeout(() => {

      const { nodeData, edgeData } = prepareGraphData(filteredGraphData.nodes, filteredGraphData.transitions);

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
        .force("link", d3.forceLink(edgeData).id(d => d.id).distance(300)) // Aumenta la distanza tra i collegamenti
        .force("charge", d3.forceManyBody().strength(-1500)) // Aumenta la forza di repulsione
        .force("center", d3.forceCenter(width / 2, height / 2)) // Centra il grafo
        .force("x", d3.forceX(width / 2).strength(0.1)) // Forza verso il centro orizzontale
        .force("y", d3.forceY(height / 2).strength(0.1)); // Forza verso il centro verticale

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
        .attr('r', d => getNodeAttributes(d.weight).radius) // Dimensione proporzionale al peso
        .attr('fill', d => getNodeAttributes(d.weight).color) // Colore proporzionale al peso
        .style("cursor", "default") // Disabilita il puntatore interattivo
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
          // Mantieni la posizione finale del nodo
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
    }, 0);

    return () => clearTimeout(timeout); // Pulisci il timeout se il componente viene smontato
  }, [filteredGraphData, selectedNode, nodeConnections, selectedZone]); // Ricalcola il grafo quando i dati cambiano

  const zones = graphData.nodes.filter(
    node =>
      (node.role === 'root' || node.role === 'intermediate') &&
      !node.meanings.includes('Smart Manufacturing')
  );
    
  const handleZoneClick = (zone) => {
    if (selectedZone?.id === zone.id) {
      // Se la zona cliccata è già selezionata, deseleziona
      setSelectedZone(null);
      setSelectedNode(null); // Resetta anche il nodo selezionato
    } else {
      // Altrimenti, seleziona la nuova zona
      setSelectedZone(zone);
      setSelectedNode(null); // Resetta il nodo selezionato
  
      // Resetta le posizioni dei nodi del sotto-grafo
      const connectedNodeIds = nodeConnections[zone.id] || [];
      const connectedNodes = graphData.nodes.filter(node => connectedNodeIds.includes(node.id));
      connectedNodes.forEach(node => {
        node.fx = null;
        node.fy = null;
      });

      // Forza il rendering del sottografo
      setFilteredGraphData((prev) => ({ ...prev })); // Triggera un aggiornamento
    }
  };

  // Funzione per aggiornare il peso del nodo selezionato
  const handleUpdateWeight = (nodeId, newWeight) => {
    if (selectedNode && selectedNode.role === 'final') {
      const nodeIndex = initialNodes.findIndex(node => node.id === selectedNode.id);
      if (nodeIndex !== -1) {
        initialNodes[nodeIndex].weight = selectedNode.weight; // Aggiorna il peso
        
        const updatedNodes = graphData.nodes.map(node =>
          node.id === nodeId ? { ...node, weight: newWeight } : node
        );
        /*console.log('Nodi aggiornati:', updatedNodes);
        console.log('Nodi aggiornati:', initialNodes); */// Per verificare l'aggiornamento
        
        graphData.nodes = updatedNodes; // Aggiorna i nodi nel grafo
        setSelectedNode(prevNode => ({ ...prevNode, weight: newWeight })); // Aggiorna il nodo selezionato
      }

      alert(`Node ${selectedNode.meanings?.join(', ')} weight updated to ${newWeight}`);
    }
  };

  return (
    <div className="box-container">
      <div id="graph" style={{ width: '100%', height: '400px', border: '1px solid #ccc' }}></div>

      {/* Zona pulsanti */}
      <div className="mt-4 bg-white p-4 rounded shadow-md">
        <h3 className="text-lg font-bold mb-2">Select Area</h3>
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
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold mb-2">
              Node Connected to {selectedZone.meanings.join(', ')}
            </h3>
            <label className="flex items-center gap-2">
              <span className="text-sm font-bold">Enable Section</span>
              <input
                type="checkbox"
                checked={enabledSections[selectedZone.id]}
                onChange={() =>
                  setEnabledSections(prev => ({
                    ...prev,
                    [selectedZone.id]: !prev[selectedZone.id],
                  }))
                }
                className="toggle-checkbox"
              />
            </label>
          </div>
          {enabledSections[selectedZone.id] ? (
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
          ) : (
            <div className="text-gray-500 text-center mt-4">
              This section is disabled. Enable it to view the table and subgraph.
            </div>
          )}
        </div>
      )}

      {/* Zona modifica peso */}
      {selectedNode && (
        <div id="cambio" className="mt-4">
        <h3>Change Weight</h3>
        <div className="weight-section">
          <label htmlFor="weight-input">Node: {selectedNode.meanings?.join(', ')}</label>
          <select
            id="weight-input"
            value={selectedNode.weight || 'none'}
            onChange={(e) =>
              setSelectedNode({ ...selectedNode, weight: e.target.value })
            }
          >
            <option value="None">None</option>
            <option value="Very Low">Very Low</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Very High">Very High</option>
          </select>
          <button
            onClick={() => handleUpdateWeight(selectedNode.id, selectedNode.weight)}
          >
            Update
          </button>
        </div>
      </div>
      )}
    </div>
  );
};

export default GraphVisualization;