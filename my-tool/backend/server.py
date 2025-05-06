# import os

# # Percorso del file Python da eseguire
# PYTHON_SCRIPT_PATH = os.path.join(os.getcwd(), "external_script.py")  # Sostituisci con il nome del tuo file Python

# @app.route('/run-python-code', methods=['POST'])
# def run_python_code():
#     try:
#         # Esegui il file Python
#         result = subprocess.run(
#             ["python", PYTHON_SCRIPT_PATH],
#             capture_output=True,
#             text=True,
#             check=True
#         )
#         # Restituisci l'output del file Python
#         return jsonify({"message": "Codice Python eseguito con successo!", "output": result.stdout})
#     except subprocess.CalledProcessError as e:
#         # Gestisci errori durante l'esecuzione del file Python
#         return jsonify({"message": "Errore durante l'esecuzione del codice Python.", "error": e.stderr}), 500

# if __name__ == '__main__':
#     app.run(debug=True)
