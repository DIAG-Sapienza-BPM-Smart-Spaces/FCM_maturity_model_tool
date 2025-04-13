#from fastapi import FastAPI, HTTPException
#from pydantic import BaseModel
#import os
#import json

#app = FastAPI()

# Modello Pydantic per validare i dati
#class GraphData(BaseModel):
#    nodes: list
#    links: list

# Percorso del file temporaneo
#TEMP_FILE = "temp_graph.json"

#@app.post("/save-graph/")
#def save_graph(data: GraphData):
#    with open(TEMP_FILE, "w") as f:
#        json.dump(data.dict(), f)
#    return {"message": "Grafo salvato temporaneamente."}

#@app.post("/reset-graph/")
#def reset_graph():
#    if os.path.exists(TEMP_FILE):
#        os.remove(TEMP_FILE)
#        return {"message": "Grafo resettato."}
#    else:
#        raise HTTPException(status_code=404, detail="Nessun grafo da resettare.")

#@app.get("/get-graph/")
#def get_graph():
#    if os.path.exists(TEMP_FILE):
#        with open(TEMP_FILE, "r") as f:
#            graph = json.load(f)
#        return graph
#    else:
#        raise HTTPException(status_code=404, detail="Nessun grafo trovato.")
