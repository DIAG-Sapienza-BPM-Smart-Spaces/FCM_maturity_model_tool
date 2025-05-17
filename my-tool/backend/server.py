from flask import Flask, request, jsonify
from flask_cors import CORS
from FCM_class_tool import FCM
import FLT_class

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'])  

@app.route('/execute-python', methods=['POST'])
def execute_python():
    try:
        data = request.get_json()
        structure = data.get('structure')
        activation_level = data.get('activation_level')

        flt = FLT_class.define_al_fuzzy()
        iterations = 100 
        threshold = 0.001

        print("FLT:", flt)
        print("iterations:", iterations)
        print("threshold:", threshold)
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

if __name__ == '__main__':
    app.run(debug=True)