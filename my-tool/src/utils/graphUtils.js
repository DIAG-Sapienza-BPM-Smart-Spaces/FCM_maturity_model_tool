// utils/graphUtils.js

// Dati di esempio per inizializzare il grafo
//import single_file from '../single_file.json';
  
  // Funzione per preparare i dati del grafo per D3
export const prepareGraphData = (nodes, transitions) => {
  const nodeData = nodes.map(n => ({
    id: n.id,
    role: n.role,
    meanings: n.meanings,
  }));

  const edgeData = transitions.map(t => ({
    source: t.from,
    target: t.to,
    weight: t.weight,
  }));

  return { nodeData, edgeData };
};

// Funzione per aggiornare il peso di un nodo
export const updateNodeWeight = (nodes, nodeId, weight) => {
  return nodes.map(node =>
    node.id === nodeId ? { ...node, weight } : node
  );
};

// Funzione per aggiornare il peso di un arco
export const updateEdgeWeight = (edges, source, target, weight) => {
  return edges.map(edge =>
    (edge.source === source && edge.target === target) ?
      { ...edge, weight } : edge
  );
};

// Funzioni per ottenere descrizioni degli elementi
export const getNodeById = (nodes, id) => {
  return nodes.find(node => node.id === id);
};

export const getEdgeDescription = (nodes, edge) => {
  const sourceNode = getNodeById(nodes, edge.source);
  const targetNode = getNodeById(nodes, edge.target);
  return `${sourceNode?.meanings?.join(', ') || 'Nodo'} → ${targetNode?.meanings?.join(', ') || 'Nodo'}`;
};
  