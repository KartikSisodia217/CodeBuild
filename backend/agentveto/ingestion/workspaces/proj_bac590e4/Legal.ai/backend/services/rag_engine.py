import sys
# CRITICAL FIX: Prevent conflicting global Python packages from crashing local Conda environments
sys.path = [p for p in sys.path if "AppData\\Roaming" not in p]

import os
import asyncio
import logging
from typing import TypedDict, List
from dotenv import load_dotenv

import chromadb
import chromadb.utils.embedding_functions as embedding_functions

from google import genai
from google.genai import types

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

# ==============================================================================
# HIERARCHICAL RAG ENGINE & LANGGRAPH ORCHESTRATOR
# ==============================================================================

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Load Environment Variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
VLLM_BASE_URL = os.getenv("VLLM_BASE_URL")

# Initialize Google GenAI Client (Supporting seamless vLLM GPU swapping)
if VLLM_BASE_URL:
    logger.info(f"🚀 Initializing Google GenAI Client against local vLLM server: {VLLM_BASE_URL}")
    genai_client = genai.Client(http_options={'base_url': VLLM_BASE_URL, 'api_version': 'v1beta'})
else:
    logger.info("☁️ Initializing Google GenAI Client against Google Cloud API.")
    genai_client = genai.Client(http_options={'api_version': 'v1beta'}) # Assumes GEMINI_API_KEY is in env

from functools import lru_cache

@lru_cache(maxsize=1)
def get_chroma_collections():
    logger.info("📦 Initializing ChromaDB Singleton and loading Embedding Model into memory...")
    db_path = os.path.join(os.path.dirname(__file__), '..', 'chroma_db')
    chroma_client = chromadb.PersistentClient(path=db_path)
    emb_fn = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="BAAI/bge-base-en-v1.5")
    
    acts_collection = chroma_client.get_or_create_collection("legal_acts", embedding_function=emb_fn)
    sections_collection = chroma_client.get_or_create_collection("legal_sections", embedding_function=emb_fn)
    return acts_collection, sections_collection

# ------------------------------------------------------------------------------
# 2. LangGraph State Definition
# ------------------------------------------------------------------------------

class AgentState(TypedDict, total=False):
    chat_id: str
    messages: List[dict] # Format: [{"role": "user"/"model", "parts": [{"text": "..."}]}]
    current_query: str
    optimized_query: str
    retrieved_context: str
    diagnostics: dict

# ------------------------------------------------------------------------------
# 3. Graph Nodes
# ------------------------------------------------------------------------------

async def _node_translate_query(state: AgentState) -> AgentState:
    raw_query = state["current_query"]
    logger.info(f"🧠 [Translator Node] Analyzing raw query: '{raw_query}'")
    
    system_instruction = (
        "You are an aggressive Legal Search Optimizer for Indian Law. "
        "The user will provide a query that may be in Hinglish, regional dialects, or informal text. "
        "Your ONLY job is to output a dense array of formal legal synonyms, overlapping statutory terms, "
        "and adjacent concepts to maximize semantic search recall. "
        "For example, if the query is 'bina helmet ke scooty', output: 'Motor Vehicles Act Section 129, protective headgear exemption, traffic compliance penalty, two-wheeler safety violations, two-wheeler operation without helmet fine'. "
        "Do NOT answer the question. Output ONLY the optimized search string."
    )
    
    try:
        response = await genai_client.aio.models.generate_content(
            model='gemma-4-26b-a4b-it',
            contents=raw_query,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.1
            )
        )
        optimized = response.text.strip()
        logger.info(f"✅ [Translator Node] Optimized Search String: '{optimized}'")
        state["optimized_query"] = optimized
    except Exception as e:
        logger.warning(f"⚠️ [Translator Node] Failed to translate query. Falling back to original. Error: {e}")
        state["optimized_query"] = raw_query
        
    return state

async def _node_retrieve(state: AgentState) -> AgentState:
    query = state["optimized_query"] or state["current_query"]
    logger.info(f"🔍 Executing Global Stage Retrieval for optimized query: '{query}'")
    
    acts_collection, sections_collection = get_chroma_collections()
    
    # Global Search: Retrieve the most semantically relevant sections across ALL acts
    # Offloaded to a background thread to prevent blocking the async event loop during dense vector math
    section_results = await asyncio.to_thread(
        sections_collection.query,
        query_texts=[query],
        n_results=8
    )
    
    context_str = ""
    diagnostics = {
        "total_retrieved": 0,
        "total_unique": 0,
    }
    
    if section_results['documents'] and section_results['documents'][0]:
        raw_chunks = section_results['documents'][0]
        metadatas = section_results['metadatas'][0]
        
        diagnostics["total_retrieved"] = len(raw_chunks)
        
        seen_texts = set()
        unique_chunks = []
        unique_metadatas = []
        
        for idx, chunk in enumerate(raw_chunks):
            if chunk not in seen_texts:
                seen_texts.add(chunk)
                unique_chunks.append(chunk)
                unique_metadatas.append(metadatas[idx])
                
        diagnostics["total_unique"] = len(unique_chunks)
        
        for idx, chunk in enumerate(unique_chunks):
            act_title = unique_metadatas[idx].get("act_title", "Unknown Act")
            sec_num = unique_metadatas[idx].get("section_num", "Unknown Section")
            chapter = unique_metadatas[idx].get("chapter", "Unknown Chapter")
            part = unique_metadatas[idx].get("part", "Unknown Part")
            context_str += f"\n--- [{act_title}, {chapter}, {part}, {sec_num}] ---\n{chunk}\n"
            
    if not context_str.strip():
        context_str = "No relevant legal context was found in the database."
        
    state["retrieved_context"] = context_str
    state["diagnostics"] = diagnostics
    return state

def _node_generate(state: AgentState) -> AgentState:
    # Context Compaction (Rolling Window)
    # Keep the system prompt intact, but slice older messages if we exceed 10 turns.
    # We'll assume the messages structure doesn't include the system prompt directly in the array,
    # as we pass it as a system instruction parameter.
    
    msg_history = state["messages"]
    if len(msg_history) > 10:
        logger.info("✂️ Context Compaction: Slicing conversation history to preserve token limits.")
        msg_history = msg_history[-10:] # Keep last 10 messages
        
    # We don't actually call the LLM here to get a string.
    # Because we need to STREAM the output to the client via a generator,
    # and LangGraph's streaming API works best when the LLM stream is tied to the graph execution,
    # we'll let LangGraph's `astream_events` intercept the LLM chunks.
    # However, google-genai streaming isn't natively bound to LangChain yet.
    # To fix this elegantly, we will just format the prompt here, and let the outer SSE wrapper
    # handle the actual GenAI stream. 
    # WAIT - LangGraph requires nodes to return state. 
    # If we stream inside the node, we can't yield to the ASGI framework directly.
    # We must yield chunks from the node so `astream_events` can catch them.
    # But since we're using raw google-genai, we can build a custom async generator in the main router, 
    # or we can just use the standard LCEL chat models if we had them.
    # Since the prompt specifies `google-genai` directly and intercepting `on_chat_model_stream`...
    # LangGraph's `astream_events` specifically listens for LangChain model events. 
    # If we aren't using `ChatVertexAI` or `ChatGoogleGenAI` from langchain-google-genai, 
    # `astream_events` won't automatically fire model streams!
    # Therefore, we will yield the custom stream directly in `generate_rag_stream` after retrieving context.
    
    pass
    return state

# ------------------------------------------------------------------------------
# 4. Graph Compilation
# ------------------------------------------------------------------------------
workflow = StateGraph(AgentState)
workflow.add_node("translate", _node_translate_query)
workflow.add_node("retrieve", _node_retrieve)

workflow.add_edge(START, "translate")
workflow.add_edge("translate", "retrieve")
workflow.add_edge("retrieve", END)

memory = MemorySaver()
rag_app = workflow.compile(checkpointer=memory)

# ------------------------------------------------------------------------------
# 5. The SSE Streaming Gateway
# ------------------------------------------------------------------------------

SYSTEM_PROMPT = """You are the Cognitive Core of Legal.AI, an elite constitutional scholar and senior judicial clerk. Your purpose is to provide brilliant, authoritative, and deeply analytical legal evaluations grounded strictly in the retrieved context and conversational memory.

Structure your intellect using the following core principles:

1. TONE CALIBRATION & PROFESSIONAL REALISM:
Strip out all generalized conversational empathy boilerplate (e.g., "I am very sorry to hear about your..."). Acknowledge the user's scenario constructively, then transition immediately to objective statutory evaluation. Sentences must remain highly professional, direct, and clear—accessible to a citizen but structured with the efficiency of a senior legal counsel. Do not produce an academic textbook dump. Answer in context of the memory of previous messages in this specific chat.

2. ABSOLUTE SCRIPT & LANGUAGE MIRRORING:
You must strictly mirror the EXACT language, dialect, and script used by the user. 
- If the user writes in English, reply in English.
- If the user writes in Hinglish (Romanized Hindi), reply strictly in Hinglish.
- If the user writes in a native script (e.g., Devnagari "का हम जेल जइब"), you MUST reply in that exact same native script and dialect (e.g., Bhojpuri/Hindi).
Do not translate the user's query into English or standard Hindi unless explicitly asked. Your output script and language must perfectly match the input.

3. FLUID SYNTHESIS OVER MECHANICAL COPYING:
Do not merely dump text chunks or say "According to document X". Synthesize the legal provisions into a smooth, narrative legal opinion. Connect the dots between overlapping frameworks (e.g., if a query touches both physical violence and a minor, seamlessly weave the BNS and POCSO Acts together into a unified liability evaluation).

4. MASTER THE IMPLICIT GAP (INTELLIGENT DEDUCTION):
If the retrieved context contains the correct Act but does not explicitly name the precise section or fine amount requested, DO NOT throw a generic "insufficient data" block. Instead, reason analytically like a human lawyer: Acknowledge the boundaries of the retrieved text, summarize the adjacent enforcement mechanisms present in the context, and provide a sophisticated structural analysis of how that law operates.

5. COGNITIVE RECONSTRUCTION (INVISIBLE IRAC):
Use the logical discipline of IRAC (Issue, Rule, Application, Conclusion) strictly for your internal reasoning structure. In your final output, DO NOT print explicit structural headers like **Issue**, **Statutory Framework**, **Clinical Application**, or **Final Assessment**. Instead, blend the logic into completely natural, fluid human language.

6. THE "EXPLAIN LIKE I'M A CLIENT" DIRECTIVE:
Use clear, simplified language. Avoid overly dense academic jargon or intimidating legalese where a simpler word works better (e.g., instead of saying "falls within the statutory ambit of liability," say "you can be held legally responsible under this rule"). Break down complex legal steps into short, easy-to-read sentences.

7. UNCOMPROMISING CITATION FOOTNOTES:
Even though the language is simplified, you must remain 100% grounded. Every legal claim, right, or penalty you explain must be directly followed by an explicit citation from the retrieved context. Format these clearly at the end of the sentence, such as: "Riding a two-wheeler without protective headgear is illegal [Source: Motor Vehicles Act, Section 129] and carries a specific fine [Source: Motor Vehicles Act, Section 194D]."

8. IDENTITY AWARENESS:
If a user asks a question like "who are you", "what are you", or something similar, you must respond strictly with: "I am Legal.ai, an AI assistant built for professional and personal legal assistance. I can talk in 140 languages and help you navigate the complexities of the law."

9. UNSUPPORTED MEDIA HANDLING:
If a user uploads a video file, audio file, or any file format that you cannot confidently analyze or extract text from, you must simply respond with "I cannot analyze this file format yet." and briefly explain that you currently only support text-based documents (like PDFs, TXT, etc.) for legal analysis.

10. MANDATORY DETAILED EXPLANATION:
If the user's query asks you to "explain" something (e.g., a law, a scenario, a concept, or how to do something), you must by default provide a highly detailed, comprehensive, and exhaustive explanation. Do not give a brief overview unless explicitly asked for one. Expand on nuances, exceptions, and practical implications.

11. EXPLICIT DOCUMENT PRIORITY:
If a [USER UPLOADED DOCUMENTS] section is provided in the retrieved context, you MUST prioritize answering the user's query based strictly on the contents of those attached documents. Temporarily suspend your standard legal knowledge if the document is a specific contract, privacy policy, or non-legal text. Analyze the document meticulously and do not hallucinate based on previous chat history.

12. UNSUPPORTED LANGUAGES FALLBACK:
If the user communicates in a non-Indian language (other than English), such as Q'eqchi', Spanish, French, etc., you must immediately stop your analysis and output EXACTLY this message: "I don't know this language yet. I currently support English and Indian languages (like Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Odia, Malayalam, Punjabi, etc.)."

RETRIEVED CONTEXT:
{context}
"""

MODEL_ROUTER = {
    "Gemma 4 26B MoE": "gemma-4-26b-a4b-it",
    "Gemma 4 31B Dense": "gemma-4-31b-it"
}

def estimate_tokens(text: str) -> int:
    return int(len(text.split()) * 1.3)

async def generate_rag_stream(prompt: str, chat_id: str, attached_docs: str = "", model_requested: str = None):
    """
    Asynchronous generator yielding Server-Sent Events (SSE) compatible with the frontend.
    Handles network disconnects safely to halt ghost GPU inference.
    """
    logger.info(f"🔗 Initiating RAG pipeline for Chat: {chat_id} (Requested Model: {model_requested})")
    
    # Determine the selected model and its context window limit
    model_key = model_requested or "Gemma 4 26B MoE"
    target_model = MODEL_ROUTER.get(model_key, "gemma-4-26b-a4b-it")
    
    MAX_CONTEXT_TOKENS = 256000
        
    try:
        # Send an immediate heartbeat to flush HTTP headers and prevent proxy/client timeouts
        yield ": heartbeat\n\n"

        # Step 1: Execute the Retrieval Graph
        config = {"configurable": {"thread_id": chat_id}}
        
        # We fetch the current state or initialize it
        current_state = rag_app.get_state(config)
        
        if not current_state.values:
            # Initialize state
            state_input = {
                "chat_id": chat_id,
                "messages": [],
                "current_query": prompt,
                "optimized_query": "",
                "retrieved_context": "",
                "diagnostics": {}
            }
        else:
            state_input = current_state.values
            state_input["current_query"] = prompt
            
        # Run Graph to populate retrieved_context
        # Uses a concurrent pattern: RAG pipeline runs in the background while
        # keepalive SSE comments are sent every second to prevent proxy/browser timeouts.
        rag_task = asyncio.ensure_future(rag_app.ainvoke(state_input, config))
        while not rag_task.done():
            yield ": keepalive\n\n"
            await asyncio.sleep(1)
        final_state = rag_task.result()
        
        # Inject Document Content dynamically into context block if present
        context = final_state.get("retrieved_context", "")
        if attached_docs:
             context += f"\n\n--- [USER UPLOADED DOCUMENTS] ---\n{attached_docs}"
             
        formatted_sys_prompt = SYSTEM_PROMPT.replace("{context}", context)
        
        # Append user prompt to history
        final_state["messages"].append({"role": "user", "parts": [{"text": prompt}]})
        
        # Context Compaction
        if len(final_state["messages"]) > 10:
            final_state["messages"] = final_state["messages"][-10:]
            
        def get_total_tokens(sys_prompt, msgs):
            hist_text = " ".join([m["parts"][0]["text"] for m in msgs])
            return estimate_tokens(sys_prompt + " " + hist_text)

        total_tokens = get_total_tokens(formatted_sys_prompt, final_state["messages"])
        
        while total_tokens > MAX_CONTEXT_TOKENS and len(final_state["messages"]) > 2:
            logger.warning(f"⚠️ Context limit exceeded ({total_tokens} > {MAX_CONTEXT_TOKENS}). Pruning history.")
            final_state["messages"].pop(0)
            total_tokens = get_total_tokens(formatted_sys_prompt, final_state["messages"])
            
        # Diagnostics Logging
        diag = final_state.get("diagnostics", {})
        total_retrieved = diag.get("total_retrieved", 0)
        total_unique = diag.get("total_unique", 0)
        
        print("\n" + "="*50)
        print("📊 [RAG ENGINE DIAGNOSTICS]")
        print(f"Active Model: {target_model} (Limit: {MAX_CONTEXT_TOKENS})")
        print(f"Total Chunks Retrieved: {total_retrieved}")
        print(f"Chunks After Deduplication: {total_unique}")
        print(f"Estimated Context Tokens: {total_tokens}")
        print("="*50 + "\n")

        # Step 2: Stream Generation via Google GenAI SDK
        # We manually bridge the stream to SSE
        logger.info(f"⚡ Streaming {model_key} Inference...")
        
        # Convert history for GenAI SDK
        contents = []
        for msg in final_state["messages"]:
            # mapping role to GenAI standard (user -> user, model -> model)
            contents.append(
                types.Content(role=msg["role"], parts=[types.Part.from_text(text=msg["parts"][0]["text"])])
            )
            
        stream = await genai_client.aio.models.generate_content_stream(
            model=target_model,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=formatted_sys_prompt,
                temperature=0.1
            )
        )
        
        full_response = ""
        async for chunk in stream:
            if chunk.text:
                full_response += chunk.text
                # SSE Format: Multi-line strings must have 'data: ' prefixed on EVERY line
                # to prevent naive frontend parsers from truncating at \n\n.
                lines = chunk.text.split('\n')
                sse_payload = "".join(f"data: {line}\n" for line in lines) + "\n"
                yield sse_payload
        
        # Update State with model response
        final_state["messages"].append({"role": "model", "parts": [{"text": full_response}]})
        rag_app.update_state(config, final_state)
        
        yield "data: [DONE]\n\n"
        logger.info("✅ Inference Stream Completed.")
        
    except asyncio.CancelledError:
        logger.warning(f"🛑 Frontend disconnected / Aborted! Halting inference for chat: {chat_id}")
        raise
    except Exception as e:
        logger.error(f"❌ Error in RAG Pipeline: {str(e)}")
        yield f"data: An error occurred during generation: {str(e)}\n\n"
        yield "data: [DONE]\n\n"
