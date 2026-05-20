from sqlalchemy import String, ForeignKey, Text, CHAR
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from typing import List

from .baseModel import ModelBase, Nome, Descricao

class Bairro(Nome,Descricao,ModelBase):
    __tablename__ = 'bairro'

   
    ruas: Mapped[List["Rua"]] = relationship(back_populates="bairro", cascade="all, delete-orphan")

class Rua(Nome,Descricao,ModelBase):
    __tablename__ = "rua"
    
    id_bairro: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("bairro.id"))
    cep: Mapped[str] = mapped_column(CHAR(36))

    bairro: Mapped["Bairro"] = relationship(back_populates="ruas")