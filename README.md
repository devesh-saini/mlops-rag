# MLOps RAG

A Retrieval-Augmented Generation (RAG) application built using Flask, LangChain, Ollama, and ChromaDB.

## Features

* Document ingestion from PDF files
* Text chunking and preprocessing
* Vector storage using ChromaDB
* Local LLM inference with Ollama
* Retrieval-Augmented Question Answering
* Lightweight Flask web application

## Tech Stack

* Flask
* LangChain
* Ollama
* ChromaDB
* PyPDF

## Installation

1. Clone the repository:

```bash
git clone https://github.com/devesh-saini/mlops-rag.git
cd mlops-rag
```

2. Create and activate a virtual environment:

```bash
python -m venv venv
```

### Linux / macOS

```bash
source venv/bin/activate
```

### Windows

```bash
venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

## Requirements

The project uses the following packages:

```text
flask
langchain-core
langchain-ollama
langchain-chroma
chromadb
langchain-community
langchain-text-splitters
pypdf
```

## Running the Application

Make sure Ollama is installed and running on your system.

Start the Flask application:

```bash
python app.py
```

The application will be available at:

```text
http://localhost:5000
```

## Project Workflow

1. Upload or load PDF documents.
2. Extract and split text into chunks.
3. Store embeddings in ChromaDB.
4. Retrieve relevant context for user queries.
5. Generate responses using an Ollama-hosted LLM.
