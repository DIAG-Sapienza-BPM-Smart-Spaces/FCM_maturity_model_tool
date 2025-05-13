// Dati di esempio per inizializzare il grafo
export let initialNodes = [
  { id: 0, label: 'Smart Manufactoring', weight: 'NA' },
  { id: 1, label: 'CAD, CAM, PLM', weight: 'NA', enabled: true },
  { id: 2, label: 'CRM', weight: 'NA', enabled: true },
  { id: 3, label: 'ERP, SCM', weight: 'NA', enabled: true },
  { id: 4, label: 'WMS, TMS', weight: 'NA', enabled: true },
  { id: 5, label: 'MES', weight: 'NA', enabled: true },
  { id: 6, label: 'IIoT', weight: 'NA', enabled: true },
  { id: 7, label: 'Cloud Services', weight: 'NA' },
  { id: 8, label: 'AI, CV, PM, RPA', weight: 'NA' },
  { id: 9, label: 'Cyber Security', weight: 'NA' },
  { id: 10, label: 'AR, VR', weight: 'NA' },
  { id: 11, label: 'Digital Twin', weight: 'NA' },
  { id: 12, label: 'DM, BI', weight: 'NA' },
  { id: 13, label: 'IIoT', weight: 'NA' },
  { id: 14, label: 'Cloud Services', weight: 'NA' },
  { id: 15, label: 'AI, CV, PM, RPA', weight: 'NA' },
  { id: 16, label: 'Cyber Security', weight: 'NA' },
  { id: 17, label: 'AR, VR', weight: 'NA' },
  { id: 18, label: 'DM, BI', weight: 'NA' },
  { id: 19, label: 'IIoT', weight: 'NA' },
  { id: 20, label: 'Cloud Services', weight: 'NA' },
  { id: 21, label: 'AI, CV, PM, RPA', weight: 'NA' },
  { id: 22, label: 'Cyber Security', weight: 'NA' },
  { id: 23, label: 'Robotics', weight: 'NA' },
  { id: 24, label: 'AR, VR', weight: 'NA' },
  { id: 25, label: 'Digital Twin', weight: 'NA' },
  { id: 26, label: 'DM, BI', weight: 'NA' },
  { id: 27, label: 'IIoT', weight: 'NA' },
  { id: 28, label: 'Cloud Services', weight: 'NA' },
  { id: 29, label: 'AI, CV, PM, RPA', weight: 'NA' },
  { id: 30, label: 'Cyber Security', weight: 'NA' },
  { id: 31, label: 'Robotics', weight: 'NA' },
  { id: 32, label: 'AR, VR', weight: 'NA' },
  { id: 33, label: 'Digital Twin', weight: 'NA' },
  { id: 34, label: 'DM, BI', weight: 'NA' },
  { id: 35, label: 'IIoT', weight: 'NA' },
  { id: 36, label: 'Cloud Services', weight: 'NA' },
  { id: 37, label: 'AI, CV, PM, RPA', weight: 'NA' },
  { id: 38, label: 'Cyber Security', weight: 'NA' },
  { id: 39, label: 'Robotics', weight: 'NA' },
  { id: 40, label: 'AR, VR', weight: 'NA' },
  { id: 41, label: 'Digital Twin', weight: 'NA' },
  { id: 42, label: 'DM, BI', weight: 'NA' },
];

export const prepareGraphData = (nodes, transitions) => {
  const nodeData = nodes.map(n => ({
    id: n.id,
    role: n.role,
    meanings: n.meanings,
  }));

  const rootEdges = nodes
    .filter(n => n.role === 'intermediate')
    .map(n => ({
      source: 0, 
      target: n.id,
      weight: 1, 
    }));

  const intermediateEdges = nodes
    .filter(n => n.role === 'intermediate')
    .flatMap(intermediateNode =>
      nodes
        .filter(finalNode => finalNode.targets.includes(intermediateNode.id))
        .map(finalNode => ({
          source: intermediateNode.id,
          target: finalNode.id,
          weight: 1, 
        }))
    );

  const edgeData = [
    ...transitions.map(t => ({
      source: t.from,
      target: t.to,
      weight: t.weight,
    })),
    ...rootEdges,
    ...intermediateEdges,
  ];

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
  