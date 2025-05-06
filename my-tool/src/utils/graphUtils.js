// Dati di esempio per inizializzare il grafo
export let initialNodes = [
  { id: 0, label: 'Smart Manufactoring', weight: 'NA', targets: [] },
  { id: 1, label: 'CAD, CAM, PLM', weight: 'NA', enabled: true, targets: [0] },
  { id: 2, label: 'CRM', weight: 'NA', enabled: true, targets: [0] },
  { id: 3, label: 'ERP, SCM', weight: 'NA', enabled: true, targets: [0] },
  { id: 4, label: 'WMS, TMS', weight: 'NA', enabled: true, targets: [0] },
  { id: 5, label: 'MES', weight: 'NA', enabled: true, targets: [0] },
  { id: 6, label: 'IIoT', weight: 'NA', enabled: true, targets: [1, 7, 8, 9, 11, 12] },
  { id: 7, label: 'Cloud Services', weight: 'N', targets: [1, 8, 9, 10, 11, 12] },
  { id: 8, label: 'AI, CV, PM, RPA', weight: 'N', targets: [1, 7, 9, 10, 11, 12] },
  { id: 9, label: 'Cyber Security', weight: 'N', targets: [1, 7, 8, 10, 11, 12] },
  { id: 10, label: 'AR, VR', weight: 'N', targets: [1, 7, 8, 9, 11] },
  { id: 11, label: 'Digital Twin', weight: 'N', targets: [1, 7, 8, 9, 10, 12] },
  { id: 12, label: 'DM, BI', weight: 'N', targets: [1, 6, 7, 8, 9, 11] },
  { id: 13, label: 'IIoT', weight: 'N', targets: [2, 14, 15, 17, 18] },
  { id: 14, label: 'Cloud Services', weight: 'N', targets: [2, 13, 15, 16, 17, 18] },
  { id: 15, label: 'AI, CV, PM, RPA', weight: 'N', targets: [2, 14, 16, 17, 18] },
  { id: 16, label: 'Cyber Security', weight: 'N', targets: [2, 13, 14, 15, 17, 18] },
  { id: 17, label: 'AR, VR', weight: 'N', targets: [2, 14] },
  { id: 18, label: 'DM, BI', weight: 'N', targets: [2, 14, 15, 16, 17] },
  { id: 19, label: 'IIoT', weight: 'N', targets: [3, 20, 21, 22, 23, 25, 26] },
  { id: 20, label: 'Cloud Services', weight: 'N', targets: [3, 19, 21, 22, 23, 24, 25, 26] },
  { id: 21, label: 'AI, CV, PM, RPA', weight: 'N', targets: [3, 19, 20, 22, 23, 24, 25, 26] },
  { id: 22, label: 'Cyber Security', weight: 'N', targets: [3, 19, 20, 21, 23, 24, 25, 26] },
  { id: 23, label: 'Robotics', weight: 'N', targets: [3, 20, 24, 25] },
  { id: 24, label: 'AR, VR', weight: 'N', targets: [3, 20, 23, 25, 26] },
  { id: 25, label: 'Digital Twin', weight: 'N', targets: [3, 20, 21, 22, 24, 26] },
  { id: 26, label: 'DM, BI', weight: 'N', targets: [3, 19, 20, 21, 22, 24, 25] },
  { id: 27, label: 'IIoT', weight: 'N', targets: [4, 29, 30, 31, 32, 33, 34] },
  { id: 28, label: 'Cloud Services', weight: 'N', targets: [4, 27, 29, 31, 32, 33, 34] },
  { id: 29, label: 'AI, CV, PM, RPA', weight: 'N', targets: [4, 31, 32, 33, 34] },
  { id: 30, label: 'Cyber Security', weight: 'N', targets: [4, 27, 28, 29, 31, 33, 34] },
  { id: 31, label: 'Robotics', weight: 'N', targets: [4, 27, 29, 30, 32, 33, 34] },
  { id: 32, label: 'AR, VR', weight: 'N', targets: [4, 31, 33, 34] },
  { id: 33, label: 'Digital Twin', weight: 'N', targets: [4, 27, 29, 30, 31, 32, 34] },
  { id: 34, label: 'DM, BI', weight: 'N', targets: [4, 29, 30, 33] },
  { id: 35, label: 'IIoT', weight: 'N', targets: [5, 36, 37, 38, 39, 40, 41, 42] },
  { id: 36, label: 'Cloud Services', weight: 'N', targets: [5, 35, 37, 38, 39, 40, 41, 42] },
  { id: 37, label: 'AI, CV, PM, RPA', weight: 'N', targets: [5, 35, 36, 38, 39, 40, 41, 42] },
  { id: 38, label: 'Cyber Security', weight: 'N', targets: [5, 35, 36, 37, 39, 40, 41, 42] },
  { id: 39, label: 'Robotics', weight: 'N', targets: [5, 35, 36, 37, 38, 42] },
  { id: 40, label: 'AR, VR', weight: 'N', targets: [5, 35, 36, 37, 38, 39, 41] },
  { id: 41, label: 'Digital Twin', weight: 'N', targets: [5, 35, 38, 39, 40, 42] },
  { id: 42, label: 'DM, BI', weight: 'N', targets: [5, 35, 36, 37, 38, 41] },
];

/*export const prepareGraphData = (nodes, transitions) => {
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
};*/

export const prepareGraphData = (nodes, transitions) => {
  const nodeData = nodes.map(n => ({
    id: n.id,
    role: n.role,
    meanings: n.meanings,
  }));

  // Aggiungi collegamenti tra il nodo root e i nodi intermediate
  const rootEdges = nodes
    .filter(n => n.role === 'intermediate')
    .map(n => ({
      source: 0, // Nodo root
      target: n.id,
      weight: 1, // Peso predefinito
    }));

  // Aggiungi collegamenti tra i nodi intermediate e i nodi final
  const intermediateEdges = nodes
    .filter(n => n.role === 'intermediate')
    .flatMap(intermediateNode =>
      nodes
        .filter(finalNode => finalNode.targets.includes(intermediateNode.id))
        .map(finalNode => ({
          source: intermediateNode.id,
          target: finalNode.id,
          weight: 1, // Peso predefinito
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
  