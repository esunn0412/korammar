GEMINI_API_KEY = ""
import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pocketbase import PocketBase


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://218.153.32.129:38889/"]}})
pb = PocketBase(os.getenv('POCKETBASE_URL', 'https://dev-pocketbase-taeeunk.sionic.tech'))


ADMIN_EMAIL = ''
ADMIN_PASSWORD = ''

try:
    pb.admins.auth_with_password(ADMIN_EMAIL, ADMIN_PASSWORD)
except Exception as e:
    print(f"Failed to authenticate with PocketBase: {str(e)}")

# # Set up the device (CPU or GPU)
# os.environ["CUDA_VISIBLE_DEVICES"] = "1"
# device = "cuda" if torch.cuda.is_available() else "cpu"
# if device == "cuda":
#     print(f"사용 가능한 GPU 개수: {torch.cuda.device_count()}")
#     print(f"현재 GPU: {torch.cuda.current_device()}")
#     print(f"GPU 이름: {torch.cuda.get_device_name(0)}")


import os
import google.generativeai as genai

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-pro')

# Create the model
generation_config = {
  "temperature": 1,
  "top_p": 0.95,
  "top_k": 64,
  "max_output_tokens": 8192,
  "response_mime_type": "text/plain",
}
model = genai.GenerativeModel(
  model_name="gemini-1.5-pro",
  generation_config=generation_config,
  # safety_settings = Adjust safety settings
  # See https://ai.google.dev/gemini-api/docs/safety-settings
)

prompt_template = {
    "grammar": "당신은 틀린 한국어 문장을 고쳐주는 맞춤법 교정기입니다. 다음 지침을 반영해서 주어진 문장의 맞춤법을 교정하세요. \
                만약 문장의 맞춤법과 띄어쓰기가 틀리지 않았다면 문장 그대로 출력하세요. 교정된 문장 외 아무것도 출력하지 마세요. \
                --- \
                주어진 문장 : {sentence}\
                교정된 문장:", 
    "sentence": "다음 텍스트의 맞춤법을 교정하고, 원문의 의미는 유지하되 더욱 명확하고 간결하게 다듬어 주세요. 교정된 문장 외 아무것도 출력하지 마세요.\
                --- \
                주어진 문장: {sentence}\
                교정된 문장:"
}



@app.route('/')
def home():
    return send_file('infer.html')

@app.route('/correct', methods=['POST'])
def correct_grammar():
    data = request.get_json()
    text = data.get('text')
    print("hohohojfls")
    input_record = pb.collection('grammar_corrections').create({
        "original": text,
        "status": "processing"
    })
    
    
    try:
        corrected_text = edit(text, var='grammar')
        print(corrected_text)
        pb.collection('grammar_corrections').update(input_record.id, {
            "corrected":corrected_text,
            "status": "completed"
        })
        return jsonify({'corrected_text': corrected_text})
    except Exception as e:
        pb.collection('grammar_corrections').update(input_record.id, {
            "corrected":input_record,
            "status": "error"
        })
        return jsonify({'error': str(e)}), 500

@app.route('/edit', methods=['POST'])
def edit_sentence():
    data = request.get_json()
    text = data.get('text')
    input_record = pb.collection('sentence_edits').create({
        "original": text, 
        "status": "processing"
    })

    try: 
        edited_text = edit(text, var='sentence')
        print(edited_text)
        pb.collection('sentence_edits').update(input_record.id, {
            "edited":edited_text, 
            "status": "completed"
        })
        return jsonify({'edited_text':edited_text})
    except Exception as e:
        print('error')
        pb.collection('sentence_edits').update(input_record.id, {
            "edited":input_record, 
            "status": "error"
        })
        return jsonify({'error': str(e)}), 500

def edit(text, var):
    prompt = prompt_template[var].format(sentence=text)
    print(prompt)
    response = model.generate_content(prompt)
    print(response.text)
    return response.text




if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8889)