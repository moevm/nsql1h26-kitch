from bson import ObjectId
from pydantic import BaseModel, Field
from pydantic_core import core_schema
from typing import Any


class PyObjectId(str):
    @classmethod
    # вызывает при обнаружении этого типа в аннотации поля модели
    def __get_pydantic_core_schema__(cls, source_type: Any, handler: Any):
        return core_schema.no_info_plain_validator_function(cls.validate)

    @classmethod
    #  вызывается автоматически Pydantic при присвоении значения полю с типом PyObjectId
    def validate(cls, v: Any) -> str:
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str) and ObjectId.is_valid(v):
            return v
        raise ValueError(f"Invalid ObjectId: {v}")


class MongoBase(BaseModel):
    id: PyObjectId = Field(default_factory=lambda: str(ObjectId()), alias="_id")

    model_config = {
        "populate_by_name": True, #можно указывать как имя поля (id), так и алиас (_id)
        "arbitrary_types_allowed": True, #разрешает использовать в полях модели произвольные типы данных
        "json_encoders": {ObjectId: str}, #Указывает, что любой объект типа ObjectId (из bson) при сериализации в JSON должен быть преобразован в строку с помощью функции str()
    }
