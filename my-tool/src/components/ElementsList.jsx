import React from 'react';

const ElementsList = ({ nodes, connectedNodeIds, onSelectNode }) => {
  // Ottieni gli ID dei nodi collegati dalla mappatura
  //const connectedNodeIds = nodeConnections[selectedZone?.id] || [];
  const connectedNodes = nodes.filter(node => connectedNodeIds.includes(node.id));

  return (
    <div className="space-y-2">
      {connectedNodes.map(node => (
        <div
          key={node.id}
          className="p-2 border rounded cursor-pointer hover:bg-gray-50"
          onClick={() => onSelectNode(node)}
        >
          <div className="flex justify-between">
            <span>{node.meanings.join(', ')}</span>
            <span>Weight: {node.weight || 'None'}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ElementsList;