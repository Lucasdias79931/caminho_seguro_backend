from datetime import datetime
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import func, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID

class ModelBase(AsyncAttrs, DeclarativeBase):
    __abstract__ = True

    id: Mapped[UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid4
)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )


class Nome:
    nome: Mapped[str] = mapped_column(Text, nullable=False)

class Descricao:
    descricao: Mapped[str] = mapped_column(Text, nullable=True)