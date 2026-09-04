from typing import Any, List, Dict, Type
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from backend.ai.providers.base import BaseProvider
from backend.config.settings import settings
from backend.observability.logger import logger


class GeminiProvider(BaseProvider):
    def __init__(self, model_name: str | None = None, temperature: float = 0.0):
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY is not set. GeminiProvider may fail.")

        api_key = settings.GEMINI_API_KEY or "dummy_key_for_startup"

        # Use provided model_name, otherwise fallback to the environment variable setting
        actual_model_name = model_name or settings.GEMINI_MODEL_NAME

        self.llm = ChatGoogleGenerativeAI(
            model=actual_model_name,
            temperature=temperature,
            google_api_key=api_key,
            max_retries=0,
        )

    async def generate_structured(self, prompt: str, schema: Type) -> Any:
        structured_llm = self.llm.with_structured_output(schema)
        response = await structured_llm.ainvoke(prompt)
        return response

    async def generate_structured_from_messages(
        self, messages: List[Dict[str, str]], schema: Type
    ) -> Any:
        """
        Generate structured output from a list of {role, content} message dicts.
        Separates system from user messages to prevent prompt injection.
        Roles: "system" → SystemMessage, "user" → HumanMessage.
        """
        lc_messages = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                lc_messages.append(SystemMessage(content=content))
            else:
                lc_messages.append(HumanMessage(content=content))

        structured_llm = self.llm.with_structured_output(schema)
        response = await structured_llm.ainvoke(lc_messages)
        return response

    async def generate_text(self, prompt: str) -> str:
        response = await self.llm.ainvoke(prompt)

        logger.debug(
            f"Raw Gemini response content type: {type(response.content)}, "
            f"value: {response.content}"
        )

        if isinstance(response.content, list):
            text_parts = []
            for item in response.content:
                if isinstance(item, str):
                    text_parts.append(item)
                elif isinstance(item, dict) and "text" in item:
                    text_parts.append(item["text"])
            return "".join(text_parts)

        return str(response.content)

    async def generate_text_from_messages(self, messages: List[Dict[str, str]]) -> str:
        """
        Generate plain text from structured message list.
        Preserves role separation — system instructions are immutable.
        """
        lc_messages = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                lc_messages.append(SystemMessage(content=content))
            else:
                lc_messages.append(HumanMessage(content=content))

        response = await self.llm.ainvoke(lc_messages)

        if isinstance(response.content, list):
            return "".join(
                item if isinstance(item, str) else item.get("text", "")
                for item in response.content
            )
        return str(response.content)
