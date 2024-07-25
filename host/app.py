import os
import torch
from flask import Flask, request, jsonify, send_file
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://218.153.32.129:38889/"]}})

# Set up the device (CPU or GPU)
os.environ["CUDA_VISIBLE_DEVICES"] = "1"
device = "cuda" if torch.cuda.is_available() else "cpu"
if device == "cuda":
    print(f"사용 가능한 GPU 개수: {torch.cuda.device_count()}")
    print(f"현재 GPU: {torch.cuda.current_device()}")
    print(f"GPU 이름: {torch.cuda.get_device_name(0)}")

# Load the tokenizer and model
tokenizer_name = "esunn/nllb-200-ko-grammarly-3.3B"
tokenizer = AutoTokenizer.from_pretrained(tokenizer_name)
model_name = "esunn/nllb-200-ko-grammarly-3.3B"
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
model = model.to(device)



@app.route('/')
def home():
    return send_file('infer.html')

@app.route('/correct', methods=['POST'])
def correct_grammar():
    data = request.get_json()
    text = data.get('text')
    
    try:
        corrected_text = translate(text)
        print(corrected_text)
        return jsonify({'corrected_text': corrected_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def translate(text):
    tokenizer.src_lang = 'kor_Hang'
    tokenizer.tgt_lang = 'cor_Hang'
    inputs = tokenizer(text, return_tensors='pt', padding=True, truncation=True, max_length=1024)
    result = model.generate(
        **inputs.to(model.device),
        forced_bos_token_id=tokenizer.convert_tokens_to_ids('kor_Hang'),
        max_new_tokens=int(16 + 1.5 * inputs.input_ids.shape[1]),
    )
    return tokenizer.batch_decode(result, skip_special_tokens=True)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8889)


