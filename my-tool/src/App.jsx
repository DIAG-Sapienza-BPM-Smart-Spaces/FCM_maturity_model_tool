import React, { useState, useEffect } from 'react';
import Graph from './components/GraphVisualization';
import single_file from '../src/single_file.json'; // Importa il file JSON di esempio

function App() {
  // Stato iniziale per il grafo
  const [graphData, setGraphData] = useState({
    nodes: single_file.nodes || [],
    transitions: single_file.transitions || [],
  });

  useEffect(() => {
    const fileInput = document.getElementById('fileInput');

    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            // Verifica che il file abbia il formato corretto
            if (data.nodes && data.transitions) {
              setGraphData(data);
            } else {
              alert('Il file JSON deve contenere "nodes" e "transitions".');
            }
          } catch (error) {
            alert('Errore nel parsing del file JSON.');
          }
        };
        reader.readAsText(file);
      }
    };

    fileInput.addEventListener('change', handleFileChange);

    return () => {
      fileInput.removeEventListener('change', handleFileChange);
    };
  }, []);

  const handleDeleteGraph = () => {
    setGraphData({ nodes: [], transitions: [] }); // Resetta il grafo
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.value = ''; // Resetta il valore dell'input file
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard di Manipolazione Grafo</h1>
        {graphData.nodes.length > 0 && graphData.transitions.length > 0 ? (
          <>
            <Graph graphData={graphData} /> {/* Passa i dati al componente Graph */}
          </>
        ) : (
          <div className="mt-4 text-gray-500">Carica un file JSON per visualizzare il grafo.</div>
        )}

        {/* Mini box per i pulsanti */}
        <div className="mt-6 bg-white p-4 rounded shadow-md">
          <h2 className="text-lg font-bold mb-4">Gestione Grafo</h2>
          <div className="flex justify-between items-center gap-4">
            <input type="file" id="fileInput" className="p-2 border rounded" />
            <button
              onClick={handleDeleteGraph}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Elimina Grafo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;