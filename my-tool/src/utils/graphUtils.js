// Dati di esempio per inizializzare il grafo
export let initialNodes = [
  { id: 0, label: 'Smart Manufactoring', weight: 'NA' },
  { id: 1, label: 'CAD, CAM, PLM', weight: 'NA', enabled: true },
  { id: 2, label: 'CRM', weight: 'NA', enabled: true },
  { id: 3, label: 'ERP, SCM', weight: 'NA', enabled: true },
  { id: 4, label: 'WMS, TMS', weight: 'NA', enabled: true },
  { id: 5, label: 'MES', weight: 'NA', enabled: true },
  { id: 6, label: 'IIoT', weight: 'NA', enabled: true },
  { id: 7, label: 'Cloud Services', weight: 'N' },
  { id: 8, label: 'AI, CV, PM, RPA', weight: 'N' },
  { id: 9, label: 'Cyber Security', weight: 'N' },
  { id: 10, label: 'AR, VR', weight: 'N' },
  { id: 11, label: 'Digital Twin', weight: 'N' },
  { id: 12, label: 'DM, BI', weight: 'N' },
  { id: 13, label: 'IIoT', weight: 'N' },
  { id: 14, label: 'Cloud Services', weight: 'N' },
  { id: 15, label: 'AI, CV, PM, RPA', weight: 'N' },
  { id: 16, label: 'Cyber Security', weight: 'N' },
  { id: 17, label: 'AR, VR', weight: 'N' },
  { id: 18, label: 'DM, BI', weight: 'N' },
  { id: 19, label: 'IIoT', weight: 'N' },
  { id: 20, label: 'Cloud Services', weight: 'N' },
  { id: 21, label: 'AI, CV, PM, RPA', weight: 'N' },
  { id: 22, label: 'Cyber Security', weight: 'N' },
  { id: 23, label: 'Robotics', weight: 'N' },
  { id: 24, label: 'AR, VR', weight: 'N' },
  { id: 25, label: 'Digital Twin', weight: 'N' },
  { id: 26, label: 'DM, BI', weight: 'N' },
  { id: 27, label: 'IIoT', weight: 'N' },
  { id: 28, label: 'Cloud Services', weight: 'N' },
  { id: 29, label: 'AI, CV, PM, RPA', weight: 'N' },
  { id: 30, label: 'Cyber Security', weight: 'N' },
  { id: 31, label: 'Robotics', weight: 'N' },
  { id: 32, label: 'AR, VR', weight: 'N' },
  { id: 33, label: 'Digital Twin', weight: 'N' },
  { id: 34, label: 'DM, BI', weight: 'N' },
  { id: 35, label: 'IIoT', weight: 'N' },
  { id: 36, label: 'Cloud Services', weight: 'N' },
  { id: 37, label: 'AI, CV, PM, RPA', weight: 'N' },
  { id: 38, label: 'Cyber Security', weight: 'N' },
  { id: 39, label: 'Robotics', weight: 'N' },
  { id: 40, label: 'AR, VR', weight: 'N' },
  { id: 41, label: 'Digital Twin', weight: 'N' },
  { id: 42, label: 'DM, BI', weight: 'N' },
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
  return `${sourceNode?.meanings?.join(', ') || 'Node'} → ${targetNode?.meanings?.join(', ') || 'Node'}`;
};
  