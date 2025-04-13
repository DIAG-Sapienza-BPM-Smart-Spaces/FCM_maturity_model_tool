import React, { useState, useEffect } from 'react';
import Graph from './components/GraphVisualization';

function App() {
  const [graphData, setGraphData] = useState(null); // Stato per i dati del grafo

  useEffect(() => {
    // Aggiungi l'event listener per il caricamento del file
    const fileInput = document.getElementById('fileInput');
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = JSON.parse(e.target.result);
          console.log(data); // Debug: stampa il contenuto del file
          setGraphData(data); // Aggiorna lo stato con i dati del grafo
        };
        reader.readAsText(file);
      }
    };

    fileInput.addEventListener('change', handleFileChange);

    // Cleanup dell'event listener
    return () => {
      fileInput.removeEventListener('change', handleFileChange);
    };
  }, []);

  const handleDeleteGraph = () => {
    setGraphData(null); // Resetta la visualizzazione del grafo
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.value = ''; // Resetta il valore dell'input file
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard di Manipolazione Grafo</h1>
        <input type="file" id="fileInput" />
        {graphData && <Graph graphData={graphData} />} {/* Passa i dati al componente Graph */}
        {graphData && (
          <button
            onClick={handleDeleteGraph}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          >
            Elimina Grafo
          </button>
        )}
        {!graphData && (
          <div className="mt-4 text-gray-500">Carica un file JSON per visualizzare il grafo.</div>
        )}
      </div>
    </div>
  );
}

export default App;