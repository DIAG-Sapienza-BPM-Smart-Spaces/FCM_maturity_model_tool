import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { prepareGraphData, initialNodes as initialNodesData} from '../utils/graphUtils';
import ElementsList from './ElementsList';

const GraphVisualization = ({ graphData }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [initialNodes, setInitialNodes] = useState(initialNodesData);
  const [filteredGraphData, setFilteredGraphData] = useState({
    nodes: graphData.nodes || [],
    transitions: graphData.transitions || [],
  });
  const [enabledSections, setEnabledSections] = useState(
    graphData.nodes.reduce((acc, node) => {
      if (node.role === 'root' || node.role === 'intermediate') {
        acc[node.id] = true; 
      }
      return acc;
    }, {})
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showGeneratedGraph, setShowGeneratedGraph] = useState(false);

  
  const nodeConnections = useMemo(() => ({
    1: [6, 7, 8, 9, 10, 11, 12], 
    2: [13, 14, 15, 16, 17, 18],
    3: [19, 20, 21, 22, 23, 24, 25, 26],
    4: [27, 28, 29, 30, 31, 32, 33, 34],
    5: [35, 36, 37, 38, 39, 40, 41, 42],
  }), []);

  const getNodeAttributes = (weight) => {
    switch (weight) {
      case 'VL':
        return { radius: 7.5, color: '#a3c1ad' }; // Verde chiaro
      case 'L':
        return { radius: 10, color: '#7fbf7f' }; // Verde medio
      case 'M':
        return { radius: 12.5, color: '#5fa55a' }; // Verde scuro
      case 'H':
        return { radius: 15, color: '#3f8f3f' }; // Verde più scuro
      case 'VH':
        return { radius: 17.5, color: '#2f6f2f' }; // Verde intenso
      default: 
        return { radius: 5, color: '#000' }; // Nero per "none"
    }
  };

  const getNodeAttributesPy = (weight) => {
    switch (weight) {
      case 'VL':
        return { radius: 7.5, color: '#f5b7b1' }; // Rosso chiaro
      case 'L':
        return { radius: 10, color: '#f1948a' }; // Rosso medio
      case 'M':
        return { radius: 12.5, color: '#ec7063' }; // Rosso scuro
      case 'H':
        return { radius: 15, color: '#e74c3c' }; // Rosso più scuro
      case 'VH':
        return { radius: 17.5, color: '#c0392b' }; // Rosso intenso
      default:
        return { radius: 5, color: '#000' }; // Nero per "none"
    }
  };

  const tableRef = useRef(null); 
  const svgRef = useRef(null);

  useEffect(() => {   //deseleziona nodo se click fuori tabella
    const handleClickOutside = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        setSelectedNode(null); 
      }
    };
  
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {   //modifica altezza del svg sotto-grafo
    const tableElement = tableRef.current;
    const observer = new ResizeObserver(() => {
      if (tableElement && svgRef.current) {
        const tableHeight = Math.min(tableElement.offsetHeight, 320); 
        svgRef.current.style.height = `${tableHeight}px`;
      }
    });
  
    if (tableElement) {
      observer.observe(tableElement);
    }
  
    return () => {
      if (tableElement) {
        observer.unobserve(tableElement);
      }
    };
  }, [selectedZone, filteredGraphData]);

  useEffect(() => {   // Aggiorna i dati del grafo filtrato quando le sezioni abilitate cambiano
    const updateFilteredGraphData = () => {
      const enabledZoneIds = Object.keys(enabledSections).filter(zoneId => enabledSections[zoneId]);
  
      const visibleNodeIds = enabledZoneIds.flatMap(zoneId => nodeConnections[zoneId] || []);
  
      const rootNodeIds = graphData.nodes
        .filter(node => node.role === 'root')
        .map(node => node.id);
  
      const intermediateNodeIds = graphData.nodes
        .filter(node => node.role === 'intermediate' && enabledZoneIds.includes(node.id.toString()))
        .map(node => node.id);
  
      const allVisibleNodeIds = [...new Set([...visibleNodeIds, ...rootNodeIds, ...intermediateNodeIds])];
  
      const filteredNodes = graphData.nodes
        .map(node => ({
          ...node,
          weight: initialNodes.find(n => n.id === node.id)?.weight || node.weight,
        }))
        .filter(node => allVisibleNodeIds.includes(node.id));

      const filteredTransitions = graphData.transitions.filter(
        link => allVisibleNodeIds.includes(link.from) && allVisibleNodeIds.includes(link.to)
      );
  
      setFilteredGraphData({
        nodes: filteredNodes,
        transitions: filteredTransitions,
      });
    };
  
    updateFilteredGraphData();
  }, [enabledSections, graphData, nodeConnections, initialNodes]);

  useEffect(() => {
    console.log('Stato aggiornato di initialNodes:', initialNodes);
  }, [initialNodes]);

  useEffect(() => {         //SUB-GRAPH
    if (!selectedZone || !enabledSections[selectedZone.id]) return;
  
    const connectedNodeIds = nodeConnections[selectedZone.id] || [];
    const connectedNodes = graphData.nodes.filter(node => connectedNodeIds.includes(node.id));
  
    const connectedLinks = graphData.transitions
      .filter(link => connectedNodeIds.includes(link.from) && connectedNodeIds.includes(link.to))
      .map(link => ({
        ...link,
        source: connectedNodes.find(node => node.id === link.from),
        target: connectedNodes.find(node => node.id === link.to),
      }));
  
    const container = d3.select('#subgraph');
    container.selectAll('*').remove();
    
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
  
    const svg = container
      .append('svg')
      .attr('width', width)
      .attr('height', height);
  
    const graphGroup = svg.append('g');
  
    const simulation = d3.forceSimulation(connectedNodes)
      .force('link', d3.forceLink(connectedLinks).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2));
    
    const zoom = d3.zoom()
      .scaleExtent([0.5, 2]) 
      .on('zoom', (event) => {
        graphGroup.attr('transform', event.transform); 
      });

    svg.call(zoom); 
    
    const link = graphGroup.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(connectedLinks)
      .enter()
      .append('line')
      .attr('stroke-width', d => d.weight * 2) 
      .attr('stroke', '#aaa');
  
    const node = graphGroup.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(connectedNodes)
      .enter()
      .append('circle')
      .attr('r', d => getNodeAttributes(d.weight).radius) 
      .attr('fill', d => getNodeAttributes(d.weight).color) 
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style("cursor", "pointer")
      .on('click', (event, d) => {
        setSelectedNode(d); 
        event.stopPropagation(); 
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
      .data(connectedNodes)
      .enter()
      .append('text')
      .attr('font-size', d => `${Math.max(10, d.weight * 2)}px`)
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
    
  }, [enabledSections, filteredGraphData, selectedZone, graphData, nodeConnections, selectedNode]); 

  useEffect(() => {     //MAIN GRAPH  
    if (!filteredGraphData || !filteredGraphData.nodes || !filteredGraphData.transitions) {
      console.error('Graph\'s values not valid:', filteredGraphData);
      return;
    } 

    const getNodeAttributesLocal = (weight) => {
      switch (weight) {
        case 'VL':
          return { radius: 7.5, color: '#a3c1ad' }; // Verde chiaro
        case 'L':
          return { radius: 10, color: '#7fbf7f' }; // Verde medio
        case 'M':
          return { radius: 12.5, color: '#5fa55a' }; // Verde scuro
        case 'H':
          return { radius: 15, color: '#3f8f3f' }; // Verde più scuro
        case 'VH':
          return { radius: 17.5, color: '#2f6f2f' }; // Verde intenso
        default: 
          return { radius: 5, color: '#000' }; // Nero per "none"
      }
    };

    const { nodeData, edgeData } = prepareGraphData(filteredGraphData.nodes, filteredGraphData.transitions);

    const container = d3.select('#graph');
    container.selectAll('*').remove();

    const width = container.node().clientWidth; 
    const height = width * 0.5; 

    const svg = container
      .append('svg')
      .style('background-color', '#f9f9f9')
      .attr('width', '100%') 
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`) 
      .attr('preserveAspectRatio', 'xMidYMid meet') 
      .style('border', '1px solid #ccc');

    const graphGroup = svg.append('g'); 

    const zoom = d3.zoom()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        graphGroup.attr('transform', event.transform); 
      });

    svg.call(zoom); 

    const simulation = d3.forceSimulation(nodeData)
      .force("link", d3.forceLink(edgeData).id(d => d.id).distance(300)) 
      .force("charge", d3.forceManyBody().strength(-1500))  
      .force("center", d3.forceCenter(width / 2, height / 2)) 
      .force("x", d3.forceX(width / 2).strength(0.1)) 
      .force("y", d3.forceY(height / 2).strength(0.1)); 

    simulation.on('end', () => {
      nodeData.forEach(d => {
        d.fx = d.x; 
        d.fy = d.y;
      });
      simulation.stop();
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
      .attr('r', d => getNodeAttributesLocal(d.weight).radius) 
      .attr('fill', d => getNodeAttributesLocal(d.weight).color) 
      .style("cursor", "default") 
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
    
  }, [filteredGraphData, graphData, initialNodes, selectedNode, nodeConnections, selectedZone]);

  const zones = graphData.nodes.filter(
    node =>
      (node.role === 'root' || node.role === 'intermediate') &&
      !node.meanings.includes('Smart Manufacturing')
  );
    
  const handleZoneClick = (zone) => {
    if (selectedZone?.id === zone.id) {
      setSelectedZone(null);
      setSelectedNode(null); 
    } else {
      setSelectedZone(zone);
      setSelectedNode(null); 
  
      const connectedNodeIds = nodeConnections[zone.id] || [];
      const connectedNodes = graphData.nodes.filter(node => connectedNodeIds.includes(node.id));
      connectedNodes.forEach(node => {
        node.fx = null;
        node.fy = null;
      });

      setFilteredGraphData((prev) => ({ ...prev })); 
    }
  };

  const handleUpdateWeight = (nodeId, newWeight) => {
    if (selectedNode && selectedNode.role === 'final') {
      const nodeIndex = initialNodes.findIndex(node => node.id === nodeId);
      if (nodeIndex !== -1) {        

        const updatedInitialNodes = [...initialNodes];
        updatedInitialNodes[nodeIndex] = {
          ...updatedInitialNodes[nodeIndex],
          weight: newWeight,
        };
        setInitialNodes(updatedInitialNodes);

        const updatedNodes = graphData.nodes.map(node =>
          node.id === nodeId ? { ...node, weight: newWeight } : node
        );

        const updatedFilteredNodes = filteredGraphData.nodes.map(node =>
          node.id === nodeId ? { ...node, weight: newWeight } : node
        );
        
        graphData.nodes = updatedNodes;
        setFilteredGraphData(prev => ({
          ...prev,
          nodes: updatedFilteredNodes,
        }));
        setSelectedNode(prevNode =>
          prevNode?.id === nodeId ? { ...prevNode, weight: newWeight } : prevNode
        );
      
        console.log('Aggiornamento in corso per il nodo:', nodeId, 'con peso:', newWeight);
      }

      //alert(`Node ${selectedNode.meanings?.join(', ')} weight updated to ${newWeight}`);
    }
  };

  const handleExecutePython = async () => {
    if (!filteredGraphData || !filteredGraphData.nodes) {
      console.error('Filtered graph data is not valid:', filteredGraphData);
      alert('Graph data is not properly loaded. Please try again.');
      return;
    }
  
    const enabledZoneIds = Object.keys(enabledSections).filter(zoneId => enabledSections[zoneId]);
    const visibleNodeIds = enabledZoneIds.flatMap(zoneId => nodeConnections[zoneId] || []);
    const invalidNodes = filteredGraphData.nodes.filter(
      node => visibleNodeIds.includes(node.id) && (!node.weight || node.weight === 'None' || node.weight === 'NA')
    );
  
    if (invalidNodes.length > 0) {
      const errorMessage = invalidNodes.map(node => {
        const intermediateNode = graphData.nodes.find(intermediate =>
          intermediate.role === 'intermediate' &&
          nodeConnections[intermediate.id]?.includes(node.id)
        );
      
        const sectionName = intermediateNode?.meanings?.join(', ') || 'Unknown Section';
        const nodeMeanings = node.meanings?.join(', ') || 'No Meanings';
        return `Node ID: ${node.id}, Node Name: ${nodeMeanings}, Section: ${sectionName}`;
      }).join('\n');
  
      alert(`The following nodes have invalid weights:\n\n${errorMessage}`);
      return;
    }
  
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/execute-python', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log('Dati restituiti dal backend:', result.graphData); 
        alert(result.message);
  
        setShowGeneratedGraph(true);
  
        setFilteredGraphData(result.graphData);
      } else {
        const error = await response.json();
        console.error('Errore dal backend:', error);
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Errore durante la richiesta:', error);
      alert('An error occurred while executing the Python script.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Funzione per disegnare il nuovo grafo
  const renderGeneratedGraph = useCallback((graphData) => {
    if (!graphData || !graphData.nodes || !graphData.transitions) {
      console.error('Invalid graph data:', graphData);
      alert('The graph data is invalid. Please check the backend.');
      return;
    }
  
    const validTransitions = graphData.transitions.map(link => ({
      ...link,
      source: link.from,
      target: link.to,
    }));
  
    const container = d3.select('#generated-graph');
  
    if (container.empty()) {
      console.error('Generated graph container not found');
      return;
    }
  
    container.selectAll('*').remove();
  
    const width = container.node().clientWidth;
    const height = 500;
  
    const svg = container
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('background-color', '#f9f9f9')
      .style('border', '1px solid #ccc')
      .style('border-radius', '8px');
  
    const graphGroup = svg.append('g');
  
    const zoom = d3.zoom()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        graphGroup.attr('transform', event.transform);
      });
  
    svg.call(zoom);
  
    // Tooltip per mostrare informazioni dettagliate
    const tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('box-shadow', '0px 4px 6px rgba(0, 0, 0, 0.1)')
      .style('pointer-events', 'none')
      .style('display', 'none');
  
    const simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(validTransitions).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    simulation.on('end', () => {
      graphData.nodes.forEach(d => {
        d.fx = d.x; 
        d.fy = d.y;
      });
      simulation.stop();
    });

    const link = graphGroup.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(validTransitions)
      .enter()
      .append('line')
      .attr('stroke-width', d => d.weight * 2 || 1)
      .attr('stroke', '#aaa');
      
    const labels = graphGroup.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(graphData.nodes)
      .enter()
      .append('text')
      .attr('font-size', '24px')
      .attr('fill', '#333')
      .attr('text-anchor', 'middle')
      .attr('dy', -15)
      .text(d => d.label || d.meanings.join(', '));

    const node = graphGroup.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(graphData.nodes)
      .enter()
      .append('circle')
      .attr('r', d => getNodeAttributesPy(d.weight).radius)
      .attr('fill', d => getNodeAttributesPy(d.weight).color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        tooltip
          .style('display', 'block')
          .html(`
            <strong>ID:</strong> ${d.id}<br>
            <strong>Weight:</strong> ${d.weight || 'N/A'}<br>
            <strong>Numeric Weight:</strong> ${d.numeric_weight || 'N/A'}
          `);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('top', `${event.pageY + 10}px`)
          .style('left', `${event.pageX + 10}px`);
      })
      .on('mouseout', () => {
        tooltip.style('display', 'none');
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
        .attr('x', d => d.x)
        .attr('y', d => d.y - 10);
    });
  }, []);

  useEffect(() => {
    if (showGeneratedGraph && filteredGraphData) {
      renderGeneratedGraph(filteredGraphData);
    }
  }, [showGeneratedGraph, filteredGraphData, renderGeneratedGraph]);


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
                onChange={() => {
                  setEnabledSections(prev => ({
                    ...prev,
                    [selectedZone.id]: !prev[selectedZone.id],
                  }));
                  setSelectedNode(null);
                }}
                className="toggle-checkbox"
              />
            </label>
          </div>
          {enabledSections[selectedZone.id] ? (
            <div className="flex">
              {/* Colonna sinistra: Tabella */}
              <div className="table-column flex-1" ref={tableRef}>
                <ElementsList
                  nodes={graphData.nodes}
                  connectedNodeIds={nodeConnections[selectedZone.id] || []}
                  selectedNode={selectedNode}
                  onSelectNode={setSelectedNode}
                  onUpdateWeight={handleUpdateWeight}
                />
              </div>

              {/* Colonna destra: SVG */}
              <div className="svg-column flex-1">
                <div id="subgraph" className="w-full h-full border rounded" ref={svgRef}></div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center mt-4">
              This section is disabled. Enable it to view the table and subgraph.
            </div>
          )}
        </div>
      )}

      {/* Zona per eseguire il codice Python */}
      <div id="python-execution" className="mt-4 bg-white p-4 rounded shadow-md">
        <h3 className="text-lg font-bold mb-2">Execute Python Script</h3>
        <p className="text-sm text-gray-600 mb-4">
          Click the button below to execute the Python script associated with the graph.
        </p>
        <button
          onClick={() => handleExecutePython()}
          className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              Loading...
            </span>
          ) : (
            'Run Python Script'
          )}
        </button>
      </div>
      {showGeneratedGraph && (
        <div id="generated-graph-container" className="mt-4 bg-white p-4 rounded shadow-md">
          <h3 className="text-lg font-bold mb-4 text-center">Generated Graph</h3>
          <div id="generated-graph" className="w-full h-auto"></div>
        </div>
      )}
    </div>
  );
};

export default GraphVisualization;