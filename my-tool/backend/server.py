from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import json
import os

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'])  

@app.route('/execute-python', methods=['POST'])
def execute_python():
    try:
        script_path = os.path.join(os.path.dirname(__file__), 'external_script.py')
        result = subprocess.run(['python', script_path], capture_output=True, text=True)

        print("Output dello script Python:", result.stdout)
        print("Errori dello script Python:", result.stderr)

        if result.returncode != 0:
            return jsonify({'error': result.stderr}), 400

        single_file_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'single_file.json')
        final_al_path = os.path.join(os.path.dirname(__file__), 'final_al.json')

        if not os.path.exists(single_file_path) or not os.path.exists(final_al_path):
            return jsonify({'error': 'Required JSON files not found'}), 404

        with open(single_file_path, 'r') as single_file, open(final_al_path, 'r') as final_al_file:
            single_data = json.load(single_file)
            final_data = {node['id']: node for node in json.load(final_al_file)}

        for node in single_data['nodes']:
            if node['id'] in final_data:
                node.update({
                    'weight': final_data[node['id']]['weight'],
                    'numeric_weight': final_data[node['id']]['numeric_weight']
                })

        return jsonify({'message': 'Script executed successfully', 'graphData': single_data}), 200
    except Exception as e:
        print("Errore durante l'esecuzione:", str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)