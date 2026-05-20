from sqlalchemy import String, ForeignKey, Text, CHAR
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from typing import List

from .baseModel import ModelBase, Pessoa


class Cidadao(ModelBase, Pessoa):
    __tablename__ = "cidadao"


    ocorrencia:Mapped["Ocorrencia"] = relationship(back_populates="cidadao")
    



class Fiscal(ModelBase, Pessoa):
    __tablename__ = "fiscal"

    matricula:Mapped[str] = mapped_column(String(16), nullable=False, unique=True)
    vistoria:Mapped["Vistoria"] = relationship(back_populates="fiscal")