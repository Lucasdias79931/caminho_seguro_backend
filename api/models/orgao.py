from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column

from typing import List
from datetime import datetime
from .baseModel import ModelBase, Nome


class Orgao(ModelBase, Nome):
    __tablename__ = "orgao"

    telefone:Mapped[str] = mapped_column(String(10),nullable=False)

    ocorrencias:Mapped[List["Ocorrencia"]] = relationship(back_populates="orgao")