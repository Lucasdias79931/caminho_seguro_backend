from sqlalchemy import ForeignKey, Enum, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column

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

    __table_args__ = (
        CheckConstraint(
            "(pavimentacao IS NOT NULL)::int + "
            "(iluminacao IS NOT NULL)::int + "
            "(saneamento IS NOT NULL)::int + "
            "(zeladoria IS NOT NULL)::int = 1",
            name="ckeck_apenas_um_tipo_de_problema"
        ),
    )