from datetime import datetime
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import  Mapped, mapped_column
from sqlalchemy import func, DateTime, Text, String, Enum
from sqlalchemy.dialects.postgresql import UUID

from .database import Base
from ..enums import STATUS

class ModelBase(AsyncAttrs, Base):
    __abstract__ = True

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )

    status:Mapped[STATUS] = mapped_column(
        Enum(STATUS, native_enum=False), 
        nullable=False,
        default=STATUS.ATIVO.value
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


class Pessoa(Nome):
    email:Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    senha:Mapped[str] = mapped_column(String(200), nullable=False)