from langchain_ollama import ChatOllama

def ask_llm(userQuery):
    model = ChatOllama(
            model='dev-persona',
            temperature=0.5
            )

    response = model.invoke(userQuery)
    print(response.content)

    return response.content

