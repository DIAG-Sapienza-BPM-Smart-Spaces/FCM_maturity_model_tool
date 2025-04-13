//import single_file from '../single_file.json';
  
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

export const updateNodeWeight = (nodes, nodeId, weight) => {
  return nodes.map(node =>
    node.id === nodeId ? { ...node, weight } : node
  );
};

export const updateEdgeWeight = (edges, source, target, weight) => {
  return edges.map(edge =>
    (edge.source === source && edge.target === target) ?
      { ...edge, weight } : edge
  );
};

export const getNodeById = (nodes, id) => {
  return nodes.find(node => node.id === id);
};

export const getEdgeDescription = (nodes, edge) => {
  const sourceNode = getNodeById(nodes, edge.source);
  const targetNode = getNodeById(nodes, edge.target);
  return `${sourceNode?.meanings?.join(', ') || 'Nodo'} → ${targetNode?.meanings?.join(', ') || 'Nodo'}`;
};
  