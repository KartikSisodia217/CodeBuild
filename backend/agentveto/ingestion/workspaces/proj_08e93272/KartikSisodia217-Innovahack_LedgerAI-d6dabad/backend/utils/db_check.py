import sys
import time
from sqlalchemy import create_engine, text
from backend.config.settings import settings
from backend.observability.logger import logger

def verify_db_connection(retries: int = 15, delay: int = 2) -> bool:
    """
    Checks PostgreSQL database connectivity and ensures pgvector extension is enabled.
    """
    logger.info("Starting database pre-flight checks...")
    
    # We use a synchronous connection for bootstrap checking.
    # psycopg2-binary resolves postgresql:// automatically.
    uri = settings.SQLALCHEMY_DATABASE_URI
    
    engine = create_engine(uri, connect_args={"connect_timeout": 5})
    
    for attempt in range(1, retries + 1):
        try:
            logger.info(f"Database connection attempt {attempt}/{retries}...")
            with engine.connect() as conn:
                # 1. Test database ping
                conn.execute(text("SELECT 1"))
                logger.info("Successfully pinged PostgreSQL database.")
                
                # 2. Enable pgvector extension
                logger.info("Registering pgvector extension (if not already present)...")
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                conn.commit()
                
                # 3. Verify extension
                result = conn.execute(text("SELECT extname FROM pg_extension WHERE extname = 'vector';"))
                extension_exists = result.scalar()
                if extension_exists:
                    logger.info("Database validation successful: pgvector is registered and ready.")
                    return True
                else:
                    logger.error("Database validation failed: pgvector extension not found.")
                    return False
        except Exception as e:
            logger.warning(f"Connection attempt {attempt} failed: {e}")
            if attempt < retries:
                time.sleep(delay)
            else:
                logger.error("All database connection attempts failed.")
                raise e
    return False

if __name__ == "__main__":
    try:
        success = verify_db_connection()
        if success:
            logger.info("All pre-flight checks passed successfully.")
            sys.exit(0)
        else:
            logger.error("Pre-flight checks failed.")
            sys.exit(1)
    except Exception as err:
        logger.error(f"Pre-flight check execution error: {err}")
        sys.exit(1)
