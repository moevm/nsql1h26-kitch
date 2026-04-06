from app.data.database import db
from app.models.user import UserInDB

users_collection = db["users"]

async def get_user_by_email(email: str) -> dict | None:
    return await users_collection.find_one({"email": email}) 

async def create_user(user: UserInDB) -> str:
    result = await users_collection.insert_one(user.model_dump(by_alias=True))
    return str(result.inserted_id)
