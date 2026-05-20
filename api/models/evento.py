from sqlalchemy import ForeignKey, Enum, CheckConstraint, Text, DateTime, func, Index
from sqlalchemy.dialects.postgresql import UUID, NUMERIC
from decimal import Decimal
from sqlalchemy.orm import relationship, Mapped, mapped_column

from typing import List
from datetime import datetime
from .baseModel import ModelBase, Descricao
from ..enums import (
    ProblemaIluminacao, 
    ProblemaSaneamento, 
    ProblemaZeladoria, 
    ProblemaPavimentacao
)

class Obstaculo(ModelBase, Descricao):
    __tablename__ = "obstaculo"

    pavimentacao: Mapped[ProblemaPavimentacao | None] = mapped_column(
        Enum(ProblemaPavimentacao, native_enum=False), nullable=True
    )
    iluminacao: Mapped[ProblemaIluminacao | None] = mapped_column(
        Enum(ProblemaIluminacao, native_enum=False), nullable=True
    )
    saneamento: Mapped[ProblemaSaneamento | None] = mapped_column(
        Enum(ProblemaSaneamento, native_enum=False), nullable=True
    )
    zeladoria: Mapped[ProblemaZeladoria | None] = mapped_column(
        Enum(ProblemaZeladoria, native_enum=False), nullable=True
    )

    id_rua: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("rua.id"), 
        nullable=False
    )

    rua: Mapped["Rua"] = relationship(back_populates="obstaculos")
    ocorrencias:Mapped[List["Ocorrencia"]] = relationship(back_populates="obstaculo")
    __table_args__ = (
        CheckConstraint(
            "(pavimentacao IS NOT NULL)::int + "
            "(iluminacao IS NOT NULL)::int + "
            "(saneamento IS NOT NULL)::int + "
            "(zeladoria IS NOT NULL)::int = 1",
            name="ckeck_apenas_um_tipo_de_problema"
        ),
    )


class Ocorrencia(ModelBase, Descricao):
    __tablename__ = "ocorrencia"
    id_obstaculo:Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("obstaculo.id"), nullable=False) 
    id_cidadao:Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cidadao.id"), nullable=False)
    id_orgao:Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orgao.id"), nullable=False)

    orgao:Mapped["Orgao"] = relationship(back_populates="ocorrencias")
    obstaculo:Mapped["Obstaculo"] = relationship(back_populates="ocorrencia", cascade="all, delete-orphan")
    cidadao:Mapped['Cidadao'] = relationship(back_populates="ocorrencia")
    imagens:Mapped[List["Imagem"]] = relationship(back_populates="ocorrencia", cascade="all, delete-orphan")
    vistoria:Mapped["Ocorrencia"] = relationship(back_populates="ocorrencia")

    __table_args__ = (
        Index("idx_ocorrencia_obstaculo_data", "id_obstaculo", "created_at"),
    )
class Vistoria(ModelBase, Descricao):
    __tablename__ = "vistoria"

    id_ocorrencia:Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("ocorrencia.id"),nullable=False, index=True)
    id_fiscal:Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("fiscal.id"),nullable=False)
    laudo:Mapped[str] = mapped_column(Text)
    prazo_adequacao:Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    fiscal:Mapped["Fiscal"] = relationship(back_populates="vistoria")
    ocorrencia:Mapped["Ocorrencia"] = relationship(back_populates="vistoria")
    intervencao:Mapped["Intervencao"] = relationship(back_populates="vistoria")

class Intervencao(ModelBase, Descricao):
    __tablename__ = "intervencao"

    id_vistoria: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("vistoria.id"), 
        nullable=False
    )
    
    id_equipe: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("equipe_manutencao.id"), 
        nullable=False
    )

    custo_estimado: Mapped[Decimal] = mapped_column(
        NUMERIC(precision=10, scale=2), 
        nullable=False
    )

    

    data_registro: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    data_conclusao: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    vistoria: Mapped["Vistoria"] = relationship(back_populates="intervencao")
    equipe: Mapped["Equipe_manutencao"] = relationship(back_populates="intervencoes")