import asyncio
from backend.ai.rag.ingestion import ingestion_pipeline

async def main():
    tax_rules = """
    Section 16 of the IGST Act:
    (1) "zero rated supply" means any of the following supplies of goods or services or both, namely:-
    (a) export of goods or services or both; or
    (b) supply of goods or services or both to a Special Economic Zone developer or a Special Economic Zone unit.
    (3) A registered person making zero rated supply shall be eligible to claim refund under either of the following options, namely:-
    (a) he may supply goods or services or both under bond or Letter of Undertaking (LUT), subject to such conditions, safeguards and procedure as may be prescribed, without payment of integrated tax and claim refund of unutilised input tax credit;
    """
    
    metadata = {
        "source": "IGST Act",
        "section": "16",
        "topic": "Zero Rated Supply, SEZ, LUT"
    }
    
    print("Starting ingestion...")
    await ingestion_pipeline.ingest_document(tax_rules, metadata)
    print("Ingestion complete.")

if __name__ == "__main__":
    asyncio.run(main())
