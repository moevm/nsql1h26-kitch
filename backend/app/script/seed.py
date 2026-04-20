from datetime import datetime, timedelta, timezone
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from passlib.context import CryptContext
from app.models.design import TypeDesign
from app.models.order import TypeStage, TypeStatus, TypeTask

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
            "updated_at": datetime.now(),
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
                {"position": "Старший сборщик", "date": datetime(2022, 1, 1)},
            ],
        },
        {
            "email": "admin@example.com",
            "role": "admin",
            "phone": "+7 999 111-22-33",
            "username": "Администратор Сидоров",
            "hashed_password": hash_password("admin123"),
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
        },
    ]
    for user in users:
        db.users.update_one({"email": user["email"]}, {"$set": user}, upsert=True)
    print(f"Seeded {db.users.count_documents({})} users")


def seed_materials():
    materials = [
        {
            "name": "ЛДСП 16мм",
            "remain": 100,
            "cost": 1500,
            "updated_at": datetime.now(),
        },
        {"name": "МДФ 19мм", "remain": 50, "cost": 2500, "updated_at": datetime.now()},
        {"name": "Кромка ПВХ", "remain": 500, "cost": 50, "updated_at": datetime.now()},
    ]
    for material in materials:
        db.materials.update_one(
            {"name": material["name"]}, {"$set": material}, upsert=True
        )
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
            "updated_at": datetime.now(),
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
            "updated_at": datetime.now(),
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
            "updated_at": datetime.now(),
        },
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

    # Генерируем 15 базовых заказов
    orders_data = []
    for i in range(1, 16):
        orders_data.append(
            {
                "item": f"Кухонный гарнитур №{i}",
                "design_name": [
                    "Классическая кухня",
                    "Современная кухня",
                    "Кухня-остров",
                ][i % 3],
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
                "color": {
                    "red": 100 + i,
                    "green": 50,
                    "blue": 200 - i,
                    "name": f"Цвет {i}",
                },
            }
        )

    orders = []
    now = datetime.now(timezone.utc)

    # Функция для добавления заказа
    def add_order(order_data, stages):
        design = designs.get(order_data["design_name"])
        material = materials.get(order_data["material_name"])
        if not design or not material:
            print(
                f"Skipping order '{order_data['item']}': design or material not found"
            )
            return
        order = {
            "material_id": str(material["_id"]),
            "design_id": str(design["_id"]),
            "client": {
                "client_id": str(client_user["_id"]),
                "username": client_user["username"],
                "phone": client_user["phone"],
            },
            "item": order_data["item"],
            "comment": order_data["comment"],
            "delivery": {
                "address": order_data["address"],
                "floor": order_data["floor"],
                "has_lift": order_data["has_lift"],
            },
            "pricing": {
                "total_price": order_data["total_price"],
                "type_price": order_data["type_price"],
                "material_price": order_data["material_price"],
                "delivery_price": order_data["delivery_price"],
                "comment_price": order_data["comment_price"],
            },
            "stages": stages,
            "name_design": design["name"],
            "type": TypeDesign(design["type"]),
            "material": material["name"],
            "size": design["size"],
            "color": order_data["color"],
            "need_material": design["need_material"],
            "blueprint": design.get("blueprint", 0),
            "created_at": now,
            "updated_at": now,
        }
        orders.append(order)

    # 1. Базовые 15 заказов (разные статусы)
    for idx, data in enumerate(orders_data):
        stages = []

        # Раскрой (доступен)
        stages.append(
            {
                "name_stage": TypeStage.Cutting,
                "worker_id": "",
                "status": TypeStatus.Completed if idx % 2 == 0 else TypeStatus.Canceled,
                "task_status": TypeTask.Available,
                "times": {
                    "deadline": now + timedelta(days=3 + idx),
                    "start": None,
                    "end": None,
                    "est_time": 4,
                    "spent": 0,
                    "expired_time": 0,
                },
            }
        )

        # Производство (в процессе)
        stages.append(
            {
                "name_stage": TypeStage.Production,
                "worker_id": worker_id,
                "status": TypeStatus.Completed,
                "task_status": TypeTask.In_progress,
                "times": {
                    "deadline": now + timedelta(days=5 + idx),
                    "start": now - timedelta(days=1),
                    "end": None,
                    "est_time": 8,
                    "spent": 2,
                    "expired_time": 0,
                },
            }
        )

        # Доставка (просрочена) для чётных индексов
        if idx % 2 == 0:
            stages.append(
                {
                    "name_stage": TypeStage.Delivery,
                    "worker_id": worker_id,
                    "status": TypeStatus.Canceled,
                    "task_status": TypeTask.Overdue,
                    "times": {
                        "deadline": now - timedelta(days=1),
                        "start": now - timedelta(days=3),
                        "end": None,
                        "est_time": 2,
                        "spent": 2,
                        "expired_time": 1,
                    },
                }
            )

        # Монтаж (отменён) только для idx == 5
        if idx == 5:
            stages.append(
                {
                    "name_stage": TypeStage.Montage,
                    "worker_id": worker_id,
                    "status": TypeStatus.Canceled,
                    "task_status": TypeTask.Canceled,
                    "times": {
                        "deadline": now + timedelta(days=10),
                        "start": None,
                        "end": None,
                        "est_time": 5,
                        "spent": 0,
                        "expired_time": 0,
                    },
                }
            )

        add_order(data, stages)

        # 2. Полностью завершённый заказ (все этапы выполнены + финальный этап "Завершён")
    completed_order_data = {
        "item": "Кухонный гарнитур (полностью завершён)",
        "design_name": "Классическая кухня",
        "material_name": "ЛДСП 16мм",
        "address": "ул. Завершённая, д. 1",
        "floor": 1,
        "has_lift": True,
        "total_price": 200000,
        "type_price": 80000,
        "material_price": 50000,
        "delivery_price": 10000,
        "comment_price": 2000,
        "comment": "Полностью завершённый заказ",
        "color": {"red": 255, "green": 255, "blue": 255, "name": "Белый"},
    }
    completed_stages = [
        {
            "name_stage": TypeStage.Cutting,
            "worker_id": worker_id,
            "status": TypeStatus.Completed,
            "task_status": TypeTask.Completed,
            "times": {
                "deadline": now - timedelta(days=5),
                "start": now - timedelta(days=10),
                "end": now - timedelta(days=6),
                "est_time": 4,
                "spent": 4,
                "expired_time": 0,
            },
        },
        {
            "name_stage": TypeStage.Production,
            "worker_id": worker_id,
            "status": TypeStatus.Completed,
            "task_status": TypeTask.Overdue,
            "times": {
                "deadline": now - timedelta(days=3),
                "start": now - timedelta(days=6),
                "end": now - timedelta(days=4),
                "est_time": 8,
                "spent": 8,
                "expired_time": 0,
            },
        },
        {
            "name_stage": TypeStage.Delivery,
            "worker_id": worker_id,
            "status": TypeStatus.Completed,
            "task_status": TypeTask.Completed,
            "times": {
                "deadline": now - timedelta(days=1),
                "start": now - timedelta(days=4),
                "end": now - timedelta(days=2),
                "est_time": 2,
                "spent": 2,
                "expired_time": 0,
            },
        },
        {
            "name_stage": TypeStage.Montage,
            "worker_id": worker_id,
            "status": TypeStatus.Completed,
            "task_status": TypeTask.Overdue,
            "times": {
                "deadline": now + timedelta(days=1),
                "start": now - timedelta(days=2),
                "end": now,
                "est_time": 5,
                "spent": 5,
                "expired_time": 0,
            },
        },
        {
            "name_stage": TypeStage.Completed,
            "worker_id": worker_id,
            "status": TypeStatus.Completed,
            "task_status": TypeTask.Completed,
            "times": {
                "deadline": now,
                "start": now,
                "end": now,
                "est_time": 0,
                "spent": 0,
                "expired_time": 0,
            },
        },
    ]
    add_order(completed_order_data, completed_stages)

    # 3. Заказ, отменённый после раскроя
    canceled_order_data = {
        "item": "Кухонный гарнитур (отменён после раскроя)",
        "design_name": "Современная кухня",
        "material_name": "МДФ 19мм",
        "address": "ул. Отменённая, д. 2",
        "floor": 2,
        "has_lift": False,
        "total_price": 150000,
        "type_price": 60000,
        "material_price": 40000,
        "delivery_price": 8000,
        "comment_price": 1000,
        "comment": "Отменён после раскроя",
        "color": {"red": 50, "green": 50, "blue": 50, "name": "Темно-серый"},
    }
    canceled_stages = [
        {
            "name_stage": TypeStage.Cutting,
            "worker_id": worker_id,
            "status": TypeStatus.Completed,
            "task_status": TypeTask.Completed,
            "times": {
                "deadline": now - timedelta(days=2),
                "start": now - timedelta(days=5),
                "end": now - timedelta(days=3),
                "est_time": 4,
                "spent": 4,
                "expired_time": 0,
            },
        },
        {
            "name_stage": TypeStage.Canceled,  # специальный этап "Отменён"
            "worker_id": worker_id,
            "status": TypeStatus.Canceled,
            "task_status": TypeTask.Canceled,
            "times": {
                "deadline": now + timedelta(days=10),
                "start": now - timedelta(days=1),
                "end": now,
                "est_time": 0,
                "spent": 0,
                "expired_time": 0,
            },
        },
    ]
    add_order(canceled_order_data, canceled_stages)

    # Сохраняем все заказы в БД
    for order in orders:
        db.orders.update_one({"item": order["item"]}, {"$set": order}, upsert=True)
    print(f"Seeded {db.orders.count_documents({})} orders with stages")


if __name__ == "__main__":
    try:
        client.admin.command("ping")
        print("Connected to MongoDB!")
        seed_users()
        seed_materials()
        seed_designs()
        seed_orders()
        print("Database seeding completed!")
    except Exception as e:
        print(f"Error: {e}")
