from datetime import datetime, timedelta, timezone
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from passlib.context import CryptContext
from app.models.design import TypeDesign
from app.models.order import TypeStatus, TypeTask

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
        db.users.update_one({"email": user["email"]}, {"$set": user}, upsert=True)
    print(f"Seeded {db.users.count_documents({})} users")

def seed_materials():
    materials = [
        {"name": "ЛДСП 16мм", "remain": 100, "cost": 1500, "updated_at": datetime.now()},
        {"name": "МДФ 19мм", "remain": 50, "cost": 2500, "updated_at": datetime.now()},
        {"name": "Кромка ПВХ", "remain": 500, "cost": 50, "updated_at": datetime.now()},
    ]
    for material in materials:
        db.materials.update_one({"name": material["name"]}, {"$set": material}, upsert=True)
    print(f"Seeded {db.materials.count_documents({})} materials")

def seed_designs():
    materials = list(db.materials.find({}))
    material_map = {m["name"]: str(m["_id"]) for m in materials}
    designs = [
        {
            "name": "Классическая кухня",
            "type": TypeDesign("П-образная"),
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
            "type": TypeDesign("Линейная"),
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
            "type": TypeDesign("Островная"),
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
        db.designs.update_one({"name": design["name"]}, {"$set": design}, upsert=True)
    print(f"Seeded {db.designs.count_documents({})} designs")

def seed_orders():
    client_user = db.users.find_one({"email": "client@example.com"})
    worker_user = db.users.find_one({"email": "worker@example.com"})
    if not client_user or not worker_user:
        print("Client or worker user not found, skipping orders seeding")
        return
    worker_id = str(worker_user["_id"])
    designs = {d["name"]: d for d in db.designs.find({})}
    materials = {m["name"]: m for m in db.materials.find({})}

    # Генерируем 15 заказов для тестирования пагинации
    orders_data = []
    for i in range(1, 16):
        orders_data.append({
            "item": f"Кухонный гарнитур №{i}",
            "design_name": ["Классическая кухня", "Современная кухня", "Кухня-остров"][i % 3],
            "material_name": ["ЛДСП 16мм", "МДФ 19мм", "Кромка ПВХ"][i % 3],
            "address": f"ул. Тестовая, д. {i}",
            "floor": i % 5 + 1,
            "has_lift": i % 2 == 0,
            "total_price": 100000 + i * 5000,
            "type_price": 50000 + i * 1000,
            "material_price": 30000 + i * 800,
            "delivery_price": 5000 + i * 200,
            "comment_price": 1000 + i * 100,
            "comment": f"Тестовый заказ {i}",
            "color": {"red": 100 + i, "green": 50, "blue": 200 - i, "name": f"Цвет {i}"}
        })

    orders = []
    now = datetime.now(timezone.utc)
    for idx, data in enumerate(orders_data):
        design = designs.get(data["design_name"])
        material = materials.get(data["material_name"])
        if not design or not material:
            print(f"Skipping order '{data['item']}': design or material not found")
            continue

        stages = []

        # 1) Задача "Доступна" (без рабочего) – для эндпоинта /tasks/available
        stages.append({
            "name": f"Раскрой {material['name']}",
            "worker_id": "",
            "status": TypeStatus("Раскрой"),
            "task_status": TypeTask("Доступна"),
            "times": {
                "deadline": now + timedelta(days=3 + idx),
                "start": None,
                "end": None,
                "est_time": 4,
                "spent": 0,
                "expired_time": 0
            }
        })

        # 2) Задача "В процессе" (назначена рабочему) – для /worker/tasks/in_progress
        stages.append({
            "name": "Сборка корпуса",
            "worker_id": worker_id,
            "status": TypeStatus("Производство"),
            "task_status": TypeTask("В процессе"),
            "times": {
                "deadline": now + timedelta(days=5 + idx),
                "start": now - timedelta(days=1),
                "end": None,
                "est_time": 8,
                "spent": 2,
                "expired_time": 0
            }
        })

        # 3) Задача "Выполнена" (назначена рабочему, завершена) – для /worker/tasks/completed
        if idx % 3 == 0:
            stages.append({
                "name": "Покраска",
                "worker_id": worker_id,
                "status": TypeStatus("Производство"),
                "task_status": TypeTask("Выполнена"),
                "times": {
                    "deadline": now - timedelta(days=2),
                    "start": now - timedelta(days=5),
                    "end": now - timedelta(days=3),
                    "est_time": 3,
                    "spent": 3,
                    "expired_time": 0
                }
            })

        # 4) Задача "Просрочена" (назначена рабочему, дедлайн просрочен) – для /worker/tasks/overdue
        if idx % 2 == 0:
            stages.append({
                "name": "Доставка",
                "worker_id": worker_id,
                "status": TypeStatus("Доставка"),
                "task_status": TypeTask("Просрочена"),
                "times": {
                    "deadline": now - timedelta(days=1),
                    "start": now - timedelta(days=3),
                    "end": None,
                    "est_time": 2,
                    "spent": 2,
                    "expired_time": 1
                }
            })

        # 5) Задача "Отменена" (редко, для полноты)
        if idx == 5:
            stages.append({
                "name": "Монтаж",
                "worker_id": worker_id,
                "status": TypeStatus("Монтаж"),
                "task_status": TypeTask("Отменена"),
                "times": {
                    "deadline": now + timedelta(days=10),
                    "start": None,
                    "end": None,
                    "est_time": 5,
                    "spent": 0,
                    "expired_time": 0
                }
            })

        order = {
            "material_id": str(material["_id"]),
            "design_id": str(design["_id"]),
            "client": {
                "client_id": str(client_user["_id"]),
                "username": client_user["username"],
                "phone": client_user["phone"]
            },
            "item": data["item"],
            "comment": data["comment"],
            "delivery": {
                "address": data["address"],
                "floor": data["floor"],
                "has_lift": data["has_lift"]
            },
            "pricing": {
                "total_price": data["total_price"],
                "type_price": data["type_price"],
                "material_price": data["material_price"],
                "delivery_price": data["delivery_price"],
                "comment_price": data["comment_price"]
            },
            "stages": stages,
            "name_design": design["name"],
            "type": TypeDesign(design["type"]),
            "material": material["name"],
            "size": design["size"],
            "color": data["color"],
            "need_material": design["need_material"],
            "blueprint": design.get("blueprint", 0),
            "status": TypeStatus("Принят"),
            "created_at": now,
            "updated_at": now
        }
        orders.append(order)

    for order in orders:
        db.orders.update_one(
            {"item": order["item"]},
            {"$set": order},
            upsert=True
        )
    print(f"Seeded {db.orders.count_documents({})} orders with stages")

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