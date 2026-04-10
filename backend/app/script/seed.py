from datetime import datetime
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI", "mongodb://user:123@mongodb:27017"))
db = client[os.getenv("MONGO_INITDB_DATABASE", "database")]

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def seed_users():
    users = [
        {
            "email": "client@example.com",
            "role": "client",
            "phone": "+7 999 123-45-67",
            "username": "Клиент Иванов",
            "hashed_password": hash_password("client123"),
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "email": "worker@example.com",
            "role": "worker",
            "phone": "+7 999 765-43-21",
            "username": "Работник Петров",
            "hashed_password": hash_password("worker123"),
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "worker_info": {
                "date_of_birth": datetime(1990, 1, 1),
                "date_of_employment": datetime(2020, 1, 1),
                "comment": "Опытный сборщик",
                "work_day_start": "09:00",
                "work_day_end": "18:00",
            },
            "worker_positions": [
                {"position": "Сборщик", "date": datetime(2020, 1, 1)},
                {"position": "Старший сборщик", "date": datetime(2022, 1, 1)}
            ]
        },
        {
            "email": "admin@example.com",
            "role": "admin",
            "phone": "+7 999 111-22-33",
            "username": "Администратор Сидоров",
            "hashed_password": hash_password("admin123"),
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]

    for user in users:
        db.users.update_one(
            {"email": user["email"]},
            {"$set": user},
            upsert=True
        )
    print(f"Seeded {db.users.count_documents({})} users")


def seed_materials():
    materials = [
        {"name": "ЛДСП 16мм", "remain": 100, "cost": 1500, "updated_at": datetime.now()},
        {"name": "МДФ 19мм", "remain": 50, "cost": 2500, "updated_at": datetime.now()},
        {"name": "Кромка ПВХ", "remain": 500, "cost": 50, "updated_at": datetime.now()},
    ]

    for material in materials:
        db.materials.update_one(
            {"name": material["name"]},
            {"$set": material},
            upsert=True
        )
    print(f"Seeded {db.materials.count_documents({})} materials")


def seed_designs():
    materials = list(db.materials.find({}))
    material_map = {m["name"]: str(m["_id"]) for m in materials}

    designs = [
        {
            "name": "Классическая кухня",
            "type": "П-образная",
            "size": {"height": 85, "width": 60, "length": 300},
            "material_id": material_map.get("ЛДСП 16мм", ""),
            "material": "ЛДСП 16мм",
            "design_price": 50000,
            "material_price": 30000,
            "color": {"red": 255, "green": 255, "blue": 255, "name": "Белый"},
            "description": "Классический дизайн",
            "production_time": 14,
            "need_material": 15,
            "blueprint": 1001,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Современная кухня",
            "type": "Линейная",  # ← новый тип
            "size": {"height": 90, "width": 65, "length": 400},
            "material_id": material_map.get("МДФ 19мм", ""),
            "material": "МДФ 19мм",
            "design_price": 75000,
            "material_price": 45000,
            "color": {"red": 50, "green": 50, "blue": 50, "name": "Темно-серый"},
            "description": "Современный минимализм",
            "production_time": 21,
            "need_material": 22,
            "blueprint": 1002,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Кухня-остров",
            "type": "Островная",  # ← еще один новый тип
            "size": {"height": 85, "width": 120, "length": 350},
            "material_id": material_map.get("Кромка ПВХ", ""),
            "material": "Кромка ПВХ",
            "design_price": 95000,
            "material_price": 55000,
            "color": {"red": 255, "green": 215, "blue": 0, "name": "Золотистый"},
            "description": "Кухня с островом",
            "production_time": 28,
            "need_material": 30,
            "blueprint": 1003,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]

    for design in designs:
        db.designs.update_one(
            {"name": design["name"]},
            {"$set": design},
            upsert=True
        )
    print(f"Seeded {db.designs.count_documents({})} designs")

def seed_orders():
    client_user = db.users.find_one({"email": "client@example.com"})

    # Получаем дизайн и материал
    design = db.designs.find_one({"name": "Классическая кухня"})
    material = db.materials.find_one({"name": "ЛДСП 16мм"})

    orders = [
        {
            "material_id": str(material["_id"]) if material else None,
            "design_id": str(design["_id"]) if design else None,
            "client": {
                "client_id": str(client_user["_id"]) if client_user else None,
                "username": "Клиент Иванов",
                "phone": "+7 999 123-45-67"
            },
            "item": "Кухонный гарнитур",
            "comment": "Срочный заказ",
            "delivery": {
                "address": "ул. Ленина, д. 1",
                "floor": 5,
                "has_lift": True
            },
            "pricing": {  # ← поменял price на pricing
                "total_price": 120000,
                "type_price": 50000,
                "material_price": 30000,
                "delivery_price": 5000,
                "comment_price": 1000
            },
            "stages": [],
            "name_design": "Классическая кухня",
            "type": "П-образная",
            "material": "ЛДСП 16мм",
            "size": {"height": 85, "width": 60, "length": 300},  # ← sizes → size
            "color": {"red": 255, "green": 255, "blue": 255, "name": "Белый"},  # ← r,g,b → red,green,blue
            "need_material": 15,
            "blueprint": 1001,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]

    for order in orders:
        db.orders.update_one(
            {"item": order["item"], "client.username": order["client"]["username"]},
            {"$set": order},
            upsert=True
        )
    print(f"Seeded {db.orders.count_documents({})} orders")


if __name__ == "__main__":
    try:
        client.admin.command('ping')
        print("Connected to MongoDB!")
        seed_users()
        seed_materials()
        seed_designs()
        seed_orders()
        print("Database seeding completed!")
    except Exception as e:
        print(f"Error: {e}")
