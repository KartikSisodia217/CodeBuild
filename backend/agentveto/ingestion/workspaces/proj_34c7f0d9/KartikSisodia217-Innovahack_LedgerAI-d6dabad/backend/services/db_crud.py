import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from backend.models.transaction import Transaction
from backend.models.document import Document
from backend.models.audit_log import AuditLog
from backend.models.company import Company
from backend.models.user import User
from backend.models.conversation import Conversation
from backend.models.message import Message

class LedgerRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    # --- Users ---
    async def get_user_by_email(self, email: str) -> Optional[User]:
        result = await self.session.execute(select(User).where(User.email == email))
        return result.scalars().first()

    # --- Companies ---
    async def get_companies_by_user(self, user_id: uuid.UUID) -> List[Company]:
        result = await self.session.execute(select(Company).where(Company.owner_id == user_id))
        return list(result.scalars().all())

    # --- Conversations ---
    async def create_conversation(self, user_id: uuid.UUID, title: str = "New Conversation") -> Conversation:
        conv = Conversation(user_id=user_id, title=title)
        self.session.add(conv)
        await self.session.commit()
        await self.session.refresh(conv)
        return conv

    async def get_conversations_by_user(self, user_id: uuid.UUID) -> List[Conversation]:
        result = await self.session.execute(
            select(Conversation).where(Conversation.user_id == user_id).order_by(Conversation.updated_at.desc())
        )
        return list(result.scalars().all())

    async def get_conversation(self, conv_id: uuid.UUID) -> Optional[Conversation]:
        result = await self.session.execute(
            select(Conversation).options(selectinload(Conversation.messages)).where(Conversation.id == conv_id)
        )
        return result.scalars().first()

    # --- Messages ---
    async def create_message(self, conversation_id: uuid.UUID, role: str, content: str, glass_box_trace: dict = None) -> Message:
        msg = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            glass_box_trace=glass_box_trace
        )
        self.session.add(msg)
        
        # Also update the conversation's updated_at
        conv = await self.get_conversation(conversation_id)
        if conv:
            from datetime import datetime, timezone
            conv.updated_at = datetime.now(timezone.utc)
            
        await self.session.commit()
        await self.session.refresh(msg)
        return msg

    # --- Documents ---
    async def create_document(self, company_id: uuid.UUID, file_name: str, s3_url: str, raw_text: str = None, conversation_id: uuid.UUID = None) -> Document:
        doc = Document(
            company_id=company_id,
            conversation_id=conversation_id,
            file_name=file_name,
            s3_url=s3_url,
            raw_text=raw_text,
            status="UPLOADED"
        )
        self.session.add(doc)
        await self.session.commit()
        await self.session.refresh(doc)
        return doc

    async def get_document(self, doc_id: uuid.UUID) -> Optional[Document]:
        result = await self.session.execute(select(Document).where(Document.id == doc_id))
        return result.scalars().first()
        
    async def get_documents_by_conversation(self, conversation_id: uuid.UUID) -> List[Document]:
        result = await self.session.execute(
            select(Document).where(Document.conversation_id == conversation_id).order_by(Document.created_at.desc())
        )
        return list(result.scalars().all())

    async def update_document_status(self, doc_id: uuid.UUID, status: str, raw_text: str = None) -> Optional[Document]:
        doc = await self.get_document(doc_id)
        if doc:
            doc.status = status
            if raw_text is not None:
                doc.raw_text = raw_text
            await self.session.commit()
            await self.session.refresh(doc)
        return doc

    # --- Transactions ---
    async def create_transaction(self, company_id: uuid.UUID, document_id: uuid.UUID) -> Transaction:
        txn = Transaction(
            company_id=company_id,
            document_id=document_id,
            status="PROCESSING",
            debits=[],
            credits=[]
        )
        self.session.add(txn)
        await self.session.commit()
        await self.session.refresh(txn)
        return txn

    async def get_transaction(self, txn_id: uuid.UUID) -> Optional[Transaction]:
        result = await self.session.execute(
            select(Transaction)
            .options(selectinload(Transaction.audit_logs))
            .where(Transaction.id == txn_id)
        )
        return result.scalars().first()

    async def get_transactions_by_company(self, company_id: uuid.UUID) -> List[Transaction]:
        result = await self.session.execute(
            select(Transaction).where(Transaction.company_id == company_id).order_by(Transaction.created_at.desc())
        )
        return list(result.scalars().all())

    async def finalize_transaction(
        self, 
        txn_id: uuid.UUID, 
        status: str, 
        debits: list, 
        credits: list, 
        insights: str = None
    ) -> Optional[Transaction]:
        txn = await self.get_transaction(txn_id)
        if txn:
            txn.status = status
            txn.debits = debits
            txn.credits = credits
            txn.insights = insights
            await self.session.commit()
            await self.session.refresh(txn)
        return txn

    # --- Audit Logs ---
    async def create_audit_log(self, transaction_id: uuid.UUID, agent_name: str, action: str, reasoning_trace: dict) -> AuditLog:
        log = AuditLog(
            transaction_id=transaction_id,
            agent_name=agent_name,
            action=action,
            reasoning_trace=reasoning_trace
        )
        self.session.add(log)
        await self.session.commit()
        await self.session.refresh(log)
        return log
