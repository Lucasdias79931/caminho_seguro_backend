from sqlalchemy import String, ForeignKey, Enum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from typing import List

from .baseModel import ModelBase
from ..enums import STATUS

class Imagem(ModelBase):
    __tablename__ = "imagem"
    id_ocorrencia:Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("ocorrencia.id"), nullable=False)
    status:Mapped[STATUS] = mapped_column(
        Enum(STATUS, native_enum=False), 
        nullable=False,
        default=STATUS.ATIVO.value
    )

    ocorrencia:Mapped["Ocorrencia"] = relationship(back_populates="imagens")