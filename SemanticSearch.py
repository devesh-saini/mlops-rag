from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings


####
## Loading PDF.
####

file_path = "./meData/aboutMe.pdf"
loader = PyPDFLoader(file_path)
docs = loader.load()


####
## Splitting Text.
####

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size = 1000,
    chunk_overlap = 200,
    add_start_index = True
)

all_splits = text_splitter.split_documents(docs)


####
## Making Embeddings.
####

embeddings = OllamaEmbeddings(model="mistral:instruct")

vector1 = embeddings.embed_query(all_splits[0].page_content)
vector2 = embeddings.embed_query(all_splits[1].page_content)

assert len(vector1) == len(vector2)
print(f"Generated vectors of length: {len(vector2)}")
print(vector1[:10])


####
## Chroma DB.
####

vector_store = Chroma(
    collection_name="aboutMe",
    embedding_function=embeddings,
    persist_directory="./aboutMe_vector_db"
)

vector_store.add_documents(all_splits)

while True:
    query = input("=> ")
    results = vector_store.similarity_search(query)
    print(results[0])
