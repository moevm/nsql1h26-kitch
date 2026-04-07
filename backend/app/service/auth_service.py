import os
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from jose import jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
from app.models.user import UserCreate, UserAuth, UserInDB
from app.data.user_repository import get_user_by_email, create_user, get_user_by_id

load_dotenv()

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "secret")
ALGORITHM = "HS256"
EXPIRE_HOURS = 24


def _hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def _verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def _create_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=EXPIRE_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


async def register_user(data: UserCreate) -> str:
    existing_user = await get_user_by_email(data.email)

    if existing_user:
        raise HTTPException(status_code=409, detail="Email уже зарегистрирован")

    user_in_db = UserInDB(
        username=data.username,
        email=data.email,
        phone=data.phone,
        hashed_password=_hash_password(data.password),
    )

    return await create_user(user_in_db)


async def authenticate_user(data: UserAuth) -> str:
    user_doc = await get_user_by_email(data.email)

    if not user_doc or not _verify_password(data.password, user_doc["hashed_password"]):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")

    return _create_token(str(user_doc["_id"]), user_doc["role"])

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY, algorithms=[ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Токен просрочен")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Невалидный токен")

async def get_current_user(token: str) -> dict:
    payload = decode_token(token)
    user_id = payload.get("sub")
    role = payload.get("role")
    user = await get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")

    return {
        "user_id": user_id,
        "role": role,
        "email": user["email"],
        "username": user["username"]
    }
