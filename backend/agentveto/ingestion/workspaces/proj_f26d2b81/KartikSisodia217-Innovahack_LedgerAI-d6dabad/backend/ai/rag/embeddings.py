from langchain_google_genai import GoogleGenerativeAIEmbeddings
from backend.config.settings import settings

class EmbeddingsManager:
    def __init__(self, model_name: str = "models/gemini-embedding-2"):
        api_key = settings.GEMINI_API_KEY or "dummy_key_for_startup"
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model=model_name,
            google_api_key=api_key
        )

    def get_embeddings(self) -> GoogleGenerativeAIEmbeddings:
        return self.embeddings

embeddings_manager = EmbeddingsManager()
