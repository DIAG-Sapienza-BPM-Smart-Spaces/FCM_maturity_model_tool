from flask import Flask, request, jsonify
from flask_cors import CORS
from FCM_class_tool import FCM
import FLT_class
import json
import copy

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'])  

@app.route('/inference', methods=['POST'])
def execute_python():
    try:
        data = request.get_json()
        structure = data.get('structure')
        activation_level = data.get('activation_level')

        flt = FLT_class.define_al_fuzzy()
        iterations = 100 
        threshold = 0.001

        #print("FLT:", flt)
        #print("iterations:", iterations)
        #print("threshold:", threshold)
        print("activation_level:", activation_level)

        fcm_obj = FCM(iterations, structure, activation_level, flt)
        print("FCM object created")
        fcm_obj.run_fcm(threshold)
        json_output = fcm_obj.generate_al_values()
        print("output FCM:", json_output)
                
        single_data = structure
        final_data = {node['id']: node for node in json_output}

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

@app.route('/simulation', methods=['POST'])
def execute_simulation():
    try:
        data = request.get_json()
        structure = data.get('structure')
        activation_level = data.get('activation_level')

        flt = FLT_class.define_al_fuzzy()
        iterations = 100 
        threshold = 0.001
        
        open_file = open('final_al1.json', 'r')
        json_output1 = open_file.read()
        json_output1 = json.loads(json_output1)
        open_file.close()
        print("output 1 FCM:", json_output1)

        open_file = open('final_al2.json', 'r')
        json_output2 = open_file.read()
        json_output2 = json.loads(json_output2)
        open_file.close()
        print("output 2 FCM:", json_output2)

        single_data1 = copy.deepcopy(structure)
        final_data1 = {node['id']: node for node in json_output1}
        single_data2 = copy.deepcopy(structure)
        final_data2 = {node['id']: node for node in json_output2}

        for node in single_data1['nodes']:
            if node['id'] in final_data1:
                node.update({
                'weight': final_data1[node['id']]['weight'],
                'numeric_weight': final_data1[node['id']]['numeric_weight']
                })

        for node in single_data2['nodes']:
            if node['id'] in final_data2:
                node.update({
                'weight': final_data2[node['id']]['weight'],
                'numeric_weight': final_data2[node['id']]['numeric_weight']
                })

        for single_data in [single_data1, single_data2]:
            if 'transitions' not in single_data:
                single_data['transitions'] = []

        return jsonify({'message': 'Script executed successfully', 'graphData': [single_data1, single_data2]}), 200
        
    except Exception as e:
        print("Errore durante l'esecuzione:", str(e))
        return jsonify({'error': str(e)}), 500
        
if __name__ == '__main__':
    app.run(debug=True)