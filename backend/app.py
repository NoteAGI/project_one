from flask import Flask, request, jsonify, Response
from flask_sse import sse
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import faiss
import openai
import langchain
from flask import stream_with_context
from llama_index import download_loader


from langchain.text_splitter import  RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.docstore.document import Document
from langchain.vectorstores import FAISS, VectorStore
from llama_index import download_loader
from llama_index import SimpleDirectoryReader

openai.api_key = "xxx"
docsearch = None
history = []

app = Flask(__name__)
app.register_blueprint(sse, url_prefix='/query')
CORS(app)
app.config['UPLOAD_FOLDER'] = './uploaded_files'

@app.route('/upload', methods=['POST'])
def upload_file():
    global docsearch
    file = request.files['file']
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    print('upload is done')
    if(filename.endswith(".pdf")):
        FileReader = download_loader("PDFReader")
        loader = FileReader()
        document = loader.load_data(file=file_path)
    elif(filename.endswith(".docx")):
        FileReader = download_loader("DocxReader")
        loader = FileReader()
        document = loader.load_data(file=file_path)
    elif(filename.endswith(".pptx")):
        FileReader = download_loader("PptxReader")
        loader = FileReader()
        document = loader.load_data(file=file_path)
    else:
        document = SimpleDirectoryReader(input_files=[file_path]).load_data()
    document = [d.to_langchain_format() for d in document]

    print('document is done')
    text_splitter =  RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0,separators=[" ", ",", "\n"])
    documents = text_splitter.split_documents(document)
    print('split is done')
    embeddings = OpenAIEmbeddings(openai_api_key=openai.api_key)
    docsearch = FAISS.from_documents(documents, embeddings)

    return jsonify({"message": "File uploaded and indexed successfully."})

@app.route('/query', methods=['POST'])
def query_index():
    question = request.json['question']

    relevant = docsearch.similarity_search(question, 1)
    contexts = []
    for i, doc in enumerate(relevant):
        contexts.append(f"Context {i}:\n{doc.page_content}")
    context = "\n\n".join(contexts)

    system_prompt = f"""
    Please only use the following context to answer the question.

    context : '''{context}'''
    """

    return Response(stream_with_context(query_openai_api(system_prompt, question)), content_type='text/plain')

def query_openai_api(system_prompt, prompt):
    global history
    model = "gpt-3.5-turbo"  # Change to your preferred model
    history += [{"role": "user", "content": prompt}]
    response = openai.ChatCompletion.create(
        model=model,
        messages=[{"role": "system", "content": system_prompt}] + history + [{"role": "user", "content": prompt}],
        stream=True,
        max_tokens=500,  # You can adjust this value depending on the desired length of the response
        temperature=0,
    )
    completion_text = ''
    for line in response:
        if 'content' in line['choices'][0]['delta']:
            completion_text += line['choices'][0]['delta']['content']
            yield line['choices'][0]['delta']['content']
    history += [{"role": "assistant", "content": completion_text}]

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

