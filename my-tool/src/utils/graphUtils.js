// Dati di esempio per inizializzare il grafo
export let initialNodes = [
  { id: 0, label: 'Smart Manufactoring', weight: 0.0 },
  { id: 1, label: 'CAD, CAM, PLM', weight: 0.0 },
  { id: 2, label: 'CRM', weight: 0.0 },
  { id: 3, label: 'ERP, SCM', weight: 0.0 },
  { id: 4, label: 'WMS, TMS', weight: 0.0 },
  { id: 5, label: 'MES', weight: 0.0 },
  { id: 6, label: 'IIoT', weight: 0.0 },
  { id: 7, label: 'Cloud Services', weight: 0.0 },
  { id: 8, label: 'AI, CV, PM, RPA', weight: 0.0 },
  { id: 9, label: 'Cyber Security', weight: 0.0 },
  { id: 10, label: 'AR, VR', weight: 0.0 },
  { id: 11, label: 'Digital Twin', weight: 0.0 },
  { id: 12, label: 'DM, BI', weight: 0.0 },
  { id: 13, label: 'IIoT', weight: 0.0 },
  { id: 14, label: 'Cloud Services', weight: 0.0 },
  { id: 15, label: 'AI, CV, PM, RPA', weight: 0.0 },
  { id: 16, label: 'Cyber Security', weight: 0.0 },
  { id: 17, label: 'AR, VR', weight: 0.0 },
  { id: 18, label: 'DM, BI', weight: 0.0 },
  { id: 19, label: 'IIoT', weight: 0.0 },
  { id: 20, label: 'Cloud Services', weight: 0.0 },
  { id: 21, label: 'AI, CV, PM, RPA', weight: 0.0 },
  { id: 22, label: 'Cyber Security', weight: 0.0 },
  { id: 23, label: 'Robotics', weight: 0.0 },
  { id: 24, label: 'AR, VR', weight: 0.0 },
  { id: 25, label: 'Digital Twin', weight: 0.0 },
  { id: 26, label: 'DM, BI', weight: 0.0 },
  { id: 27, label: 'IIoT', weight: 0.0 },
  { id: 28, label: 'Cloud Services', weight: 0.0 },
  { id: 29, label: 'AI, CV, PM, RPA', weight: 0.0 },
  { id: 30, label: 'Cyber Security', weight: 0.0 },
  { id: 31, label: 'Robotics', weight: 0.0 },
  { id: 32, label: 'AR, VR', weight: 0.0 },
  { id: 33, label: 'Digital Twin', weight: 0.0 },
  { id: 34, label: 'DM, BI', weight: 0.0 },
  { id: 35, label: 'IIoT', weight: 0.0 },
  { id: 36, label: 'Cloud Services', weight: 0.0 },
  { id: 37, label: 'AI, CV, PM, RPA', weight: 0.0 },
  { id: 38, label: 'Cyber Security', weight: 0.0 },
  { id: 39, label: 'Robotics', weight: 0.0 },
  { id: 40, label: 'AR, VR', weight: 0.0 },
  { id: 41, label: 'Digital Twin', weight: 0.0 },
  { id: 42, label: 'DM, BI', weight: 0.0 },
];

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

export const getNodeById = (nodes, id) => {
  return nodes.find(node => node.id === id);
};

export const getEdgeDescription = (nodes, edge) => {
  const sourceNode = getNodeById(nodes, edge.source);
  const targetNode = getNodeById(nodes, edge.target);
  return `${sourceNode?.meanings?.join(', ') || 'Nodo'} → ${targetNode?.meanings?.join(', ') || 'Nodo'}`;
};
  