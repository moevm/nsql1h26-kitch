from app.data.database import db
from app.models.user import UserInDB

users_collection = db["users"]

def get_user_by_email(email: str) -> dict | None:
    return users_collection.find_one({"email": email})

def create_user(user: UserInDB) -> str:
    result = users_collection.insert_one(user.model_dump())
    return str(result.inserted_id)
