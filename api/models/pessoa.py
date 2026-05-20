from sqlalchemy import String, ForeignKey, Text, CHAR
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, SMALLINT

from .baseModel import ModelBase, Pessoa, Nome
from typing import List

class Cidadao(ModelBase, Pessoa):
    __tablename__ = "cidadao"


    ocorrencias: Mapped[list["Ocorrencia"]] = relationship(
        back_populates="cidadao"
    )
    



class Fiscal(ModelBase, Pessoa):
    __tablename__ = "fiscal"

    matricula:Mapped[str] = mapped_column(String(16), nullable=False, unique=True)
    vistoria:Mapped["Vistoria"] = relationship(back_populates="fiscal")

class Equipe_manutencao(ModelBase, Nome):

    __tablename__ = "equipe_manutencao"

    id_orgao:Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orgao.id"),nullable=False)
    especialidade:Mapped[str] = mapped_column(Text, nullable=False)
    quantidade_membros:Mapped[SMALLINT] = mapped_column(SMALLINT, nullable=False)


    orgao:Mapped["Orgao"] = relationship(back_populates="equipes")
    intervencoes:Mapped[List["Intervencao"]] = relationship(back_populates="equipe")