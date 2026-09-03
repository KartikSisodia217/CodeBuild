from backend.ai.providers.base import BaseProvider
from backend.ai.providers.gemini import GeminiProvider


class ProviderFactory:
    """Factory to instantiate LLM providers based on configuration."""

    @staticmethod
    def get_provider(provider_name: str = "gemini") -> BaseProvider:
        if provider_name.lower() == "gemini":
            return GeminiProvider()

        raise ValueError(f"Unknown provider: {provider_name}")