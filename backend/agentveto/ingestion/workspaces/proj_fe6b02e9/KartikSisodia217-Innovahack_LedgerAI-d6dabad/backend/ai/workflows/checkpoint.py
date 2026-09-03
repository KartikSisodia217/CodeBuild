import os
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from psycopg_pool import AsyncConnectionPool
from backend.config.settings import settings

class CheckpointManager:
    """Manages the Postgres checkpointing for LangGraph to support HITL."""
    
    def __init__(self):
        # AsyncPostgresSaver requires a psycopg connection string or pool, not asyncpg.
        # It natively uses psycopg3.
        self.connection_string = settings.SQLALCHEMY_DATABASE_URI
        self.pool = None

    async def get_saver(self) -> AsyncPostgresSaver:
        """Returns the AsyncPostgresSaver instance."""
        if self.pool is None:
            self.pool = AsyncConnectionPool(
                conninfo=self.connection_string,
                max_size=20,
                kwargs={"autocommit": True},
                open=False
            )
            await self.pool.open()
        
        saver = AsyncPostgresSaver(self.pool)
        await saver.setup()
        return saver

checkpoint_manager = CheckpointManager()
