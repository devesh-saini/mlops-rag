import os
from flask import Flask, jsonify, request, render_template, Response
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter


app = Flask(
    __name__,
    static_folder='../static',
    template_folder='../templates'
)

SYSTEM_PROMPT = """
You are a professional AI and ML Engineer. You are a helpful assistant that can answer questions and help with tasks.
You are also a professional developer and can help with coding tasks.
You are also a professional data scientist and can help with data science tasks.
You are also a professional software engineer and can help with software engineering tasks.
You are also a professional web developer and can help with web development tasks.
Answer based only on the provided context from the PDF.
If the answer is not present in the context, say you could not find it in the PDF.
"""

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PDF_PATH = os.path.join(BASE_DIR, "devops-2-0-toolkit")
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_db")
COLLECTION_NAME = "practical_mlops"
LLM_MODEL = os.environ.get("OLLAMA_LLM_MODEL", "mistral")
EMBED_MODEL = os.environ.get("OLLAMA_EMBED_MODEL", "nomic-embed-text")

retriever = None

try:
    chat = ChatOllama(
        temperature=0.2,
        model=LLM_MODEL
    )

    embeddings = OllamaEmbeddings(model=EMBED_MODEL)

    if not os.path.exists(PDF_PATH):
        raise FileNotFoundError(f"PDF file not found at: {PDF_PATH}")

    if os.path.exists(CHROMA_DIR) and os.listdir(CHROMA_DIR):
        vectorstore = Chroma(
            collection_name=COLLECTION_NAME,
            embedding_function=embeddings,
            persist_directory=CHROMA_DIR
        )
        print("Loaded existing Chroma vector DB.")
    else:
        loader = PyPDFLoader(PDF_PATH)
        documents = loader.load()
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=150
        )
        chunks = splitter.split_documents(documents)
        vectorstore = Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            collection_name=COLLECTION_NAME,
            persist_directory=CHROMA_DIR
        )
        print("Created Chroma vector DB from PDF")

    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", "Context:\n{context}\n\nQuestion: {user_query}")
    ])

    chain = prompt | chat
    print(f"Ollama RAG chain initialized successfully (llm={LLM_MODEL}, embed={EMBED_MODEL}).")

except Exception as e:
    print(f"Error initializing Ollama RAG chain: {e}")
    print(
        "!!! MAKE SURE OLLAMA IS RUNNING, THE LLM MODEL EXISTS, THE EMBEDDING MODEL EXISTS, AND THE PDF EXISTS !!!"
    )
    chain = None


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/getResponse", methods=["POST"])
def getResponse():
    if chain is None or retriever is None:
        return jsonify({"error": "RAG chain is not initialized."}), 500

    data = request.json
    userQuery = data.get('userQuery')

    if not userQuery:
        return jsonify({"error": "No userQuery provided."}), 400

    print(f"Received query: {userQuery}")

    def stream_generator(query):
        """A generator function to stream the model's response."""
        try:
            retrieved_docs = retriever.invoke(query)
            context = "\n\n".join([doc.page_content for doc in retrieved_docs]) if retrieved_docs else ""

            for chunk in chain.stream({"user_query": query, "context": context}):
                if chunk.content:
                    yield chunk.content
        except Exception as e:
            print(f"Error during model streaming: {e}")
            yield "Sorry, an error occurred while answering from the local PDF vector database."

    return Response(stream_generator(userQuery), mimetype='text/plain')

if __name__ == "__main__":
    app.run(debug=True)
