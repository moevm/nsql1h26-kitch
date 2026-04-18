import os
from motor.motor_asyncio import AsyncIOMotorClient

uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")

# Создаем асинхронный клиент
client = AsyncIOMotorClient(uri)


# Проверку подключения сделай через отдельную функцию
async def ping():
    try:
        await client.admin.command("ping")
        print("Connected to MongoDB!")
    except Exception as e:
        print(e)


db = client[os.getenv("MONGO_INITDB_DATABASE", "database")]
