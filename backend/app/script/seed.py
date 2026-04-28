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
    now = datetime.now(timezone.utc)
    users = [
        {
            "email": "client@example.com",
            "role": "client",
            "phone": "+7 999 123-45-67",
            "username": "Клиент Иванов",
            "hashed_password": hash_password("client123"),
            "created_at": now,
            "updated_at": now,
        },
        {
            "email": "worker@example.com",
            "role": "worker",
            "phone": "+7 999 765-43-21",
            "username": "Работник Петров",
            "hashed_password": hash_password("worker123"),
            "created_at": now,
            "updated_at": now,
            "worker_info": {
                "date_of_birth": datetime(1990, 1, 1, tzinfo=timezone.utc),
                "date_of_employment": datetime(2020, 1, 1, tzinfo=timezone.utc),
                "comment": "Опытный сборщик",
                "work_day_start": "09:00",
                "work_day_end": "18:00",
            },
            "worker_positions": [
                {"position": "Сборщик", "date": datetime(2020, 1, 1, tzinfo=timezone.utc)},
                {"position": "Старший сборщик", "date": datetime(2022, 1, 1, tzinfo=timezone.utc)},
            ],
        },
        {
            "email": "admin@example.com",
            "role": "admin",
            "phone": "+7 999 111-22-33",
            "username": "Администратор Сидоров",
            "hashed_password": hash_password("admin123"),
            "created_at": now,
            "updated_at": now,
        },
        {
            "email": "worker2@example.com",
            "role": "worker",
            "phone": "+7 999 222-33-44",
            "username": "Смирнов Игорь",
            "hashed_password": hash_password("worker234"),
            "created_at": now,
            "updated_at": now,
            "worker_info": {
                "date_of_birth": datetime(1992, 4, 10, tzinfo=timezone.utc),
                "date_of_employment": datetime(2019, 6, 1, tzinfo=timezone.utc),
                "comment": "Опытный сборщик",
                "work_day_start": "09:00",
                "work_day_end": "18:00",
                "start_experience": 0,
            },
            "worker_positions": [
                {"position": "Сборщик", "date": datetime(2019, 6, 1, tzinfo=timezone.utc)},
                {"position": "Старший сборщик", "date": datetime(2022, 3, 1, tzinfo=timezone.utc)},
            ],
        },
        {
            "email": "worker3@example.com",
            "role": "worker",
            "phone": "+7 999 333-44-55",
            "username": "Павлов Артём",
            "hashed_password": hash_password("worker345"),
            "created_at": now,
            "updated_at": now,
            "worker_info": {
                "date_of_birth": datetime(1995, 9, 15, tzinfo=timezone.utc),
                "date_of_employment": datetime(2023, 1, 10, tzinfo=timezone.utc),
                "comment": "Монтажник (без задач)",
                "work_day_start": "10:00",
                "work_day_end": "19:00",
                "start_experience": 0,
            },
            "worker_positions": [
                {"position": "Монтажник", "date": datetime(2023, 1, 10, tzinfo=timezone.utc)},
            ],
        },
    ]
    for user in users:
        db.users.update_one({"email": user["email"]}, {"$set": user}, upsert=True)
    print(f"Seeded {db.users.count_documents({})} users")


def seed_materials():
    now = datetime.now(timezone.utc)
    materials = [
        {
            "name": "ЛДСП 16мм",
            "remain": 100,
            "cost": 1500,
            "updated_at": now,
        },
        {"name": "МДФ 19мм", "remain": 50, "cost": 2500, "updated_at": now},
        {"name": "Кромка ПВХ", "remain": 500, "cost": 50, "updated_at": now},
    ]
    for material in materials:
        db.materials.update_one(
            {"name": material["name"]}, {"$set": material}, upsert=True
        )
    print(f"Seeded {db.materials.count_documents({})} materials")


def seed_designs():
    now = datetime.now(timezone.utc)
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
            "created_at": now,
            "updated_at": now,
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
            "created_at": now,
            "updated_at": now,
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
            "created_at": now,
            "updated_at": now,
        },
    ]
    for design in designs:
        db.designs.update_one({"name": design["name"]}, {"$set": design}, upsert=True)
    print(f"Seeded {db.designs.count_documents({})} designs")


def seed_orders():
    db.orders.delete_many({})
    print("Old orders deleted.")

    client_user = db.users.find_one({"email": "client@example.com"})
    worker1_user = db.users.find_one({"email": "worker@example.com"})
    worker2_user = db.users.find_one({"email": "worker2@example.com"})
    worker3_user = db.users.find_one({"email": "worker3@example.com"})

    if not client_user or not worker1_user or not worker2_user or not worker3_user:
        print("Client or workers not found, skipping orders seeding")
        return

    worker1_id = str(worker1_user["_id"])
    worker2_id = str(worker2_user["_id"])

    designs = {d["name"]: d for d in db.designs.find({})}
    materials = {m["name"]: m for m in db.materials.find({})}

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
            "color": {"red": 100 + i, "green": 50, "blue": 200 - i, "name": f"Цвет {i}"},
        })

    orders = []
    now = datetime.now(timezone.utc)

    def add_order(order_data, stages, created_at):
        design = designs.get(order_data["design_name"])
        material = materials.get(order_data["material_name"])
        if not design or not material:
            print(f"Skipping order '{order_data['item']}': design or material not found")
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
            "created_at": created_at,
            "updated_at": now,
        }
        orders.append(order)

    for idx, data in enumerate(orders_data):
        order_created_at = now - timedelta(days=idx * 2)
        stages = []

        # 1. Раскрой - завершён
        stages.append({
            "name_stage": TypeStage.Cutting,
            "worker_id": worker1_id,
            "status": TypeStatus.Completed,
            "task_status": TypeTask.Completed,
            "times": {
                "deadline": order_created_at + timedelta(days=3),
                "start": order_created_at,
                "end": order_created_at + timedelta(days=3),
                "est_time": 3,
                "spent": 3,
                "expired_time": 0,
            },
        })

        # 2. Производство - завершён
        stages.append({
            "name_stage": TypeStage.Production,
            "worker_id": worker1_id,
            "status": TypeStatus.Completed,
            "task_status": TypeTask.Completed,
            "times": {
                "deadline": order_created_at + timedelta(days=8),
                "start": order_created_at + timedelta(days=3),
                "end": order_created_at + timedelta(days=8),
                "est_time": 5,
                "spent": 5,
                "expired_time": 0,
            },
        })

        # 3. Доставка - В процессе (активный этап)
        # Монтаж ещё не добавляем, так как доставка ещё не завершена
        stages.append({
            "name_stage": TypeStage.Delivery,
            "worker_id": worker1_id,
            "status": TypeStatus.In_progress,
            "task_status": TypeTask.In_progress,
            "times": {
                "deadline": order_created_at + timedelta(days=11),
                "start": order_created_at + timedelta(days=8),
                "end": None,
                "est_time": 3,
                "spent": 1,
                "expired_time": 0,
            },
        })

        add_order(data, stages, order_created_at)

    completed_order_created_at = now - timedelta(days=30)
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
            "worker_id": worker1_id,
            "status": TypeStatus.Completed,
            "task_status": TypeTask.Completed,
            "times": {
                "deadline": completed_order_created_at + timedelta(days=3),
                "start": completed_order_created_at,
                "end": completed_order_created_at + timedelta(days=3),
                "est_time": 3,
                "spent": 3,
                "expired_time": 0,
            },
        },
        {
            "name_stage": TypeStage.Production,
            "worker_id": worker1_id,
            "status": TypeStatus.Completed,
            "task_status": TypeTask.Completed,
            "times": {
                "deadline": completed_order_created_at + timedelta(days=10),
                "start": completed_order_created_at + timedelta(days=3),
                "end": completed_order_created_at + timedelta(days=10),
                "est_time": 7,
                "spent": 7,
                "expired_time": 0,
            },
        },
        {
            "name_stage": TypeStage.Delivery,
            "worker_id": worker1_id,
            "status": TypeStatus.Completed,
            "task_status": TypeTask.Completed,
            "times": {
                "deadline": completed_order_created_at + timedelta(days=12),
                "start": completed_order_created_at + timedelta(days=10),
                "end": completed_order_created_at + timedelta(days=12),
                "est_time": 2,
                "spent": 2,
                "expired_time": 0,
            },
        },
        {
            "name_stage": TypeStage.Montage,
            "worker_id": worker1_id,
            "status": TypeStatus.Completed,
            "task_status": TypeTask.Completed,
            "times": {
                "deadline": completed_order_created_at + timedelta(days=17),
                "start": completed_order_created_at + timedelta(days=12),
                "end": completed_order_created_at + timedelta(days=17),
                "est_time": 5,
                "spent": 5,
                "expired_time": 0,
            },
        },
        {
            "name_stage": TypeStage.Completed,
            "worker_id": worker1_id,
            "status": TypeStatus.Completed,
            "task_status": TypeTask.Completed,
            "times": {
                "deadline": completed_order_created_at + timedelta(days=17),
                "start": completed_order_created_at + timedelta(days=17),
                "end": completed_order_created_at + timedelta(days=17),
                "est_time": 0,
                "spent": 0,
                "expired_time": 0,
            },
        },
    ]
    add_order(completed_order_data, completed_stages, completed_order_created_at)

    canceled_order_created_at = now - timedelta(days=15)
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
            "worker_id": worker1_id,
            "status": TypeStatus.Completed,
            "task_status": TypeTask.Completed,
            "times": {
                "deadline": canceled_order_created_at + timedelta(days=3),
                "start": canceled_order_created_at,
                "end": canceled_order_created_at + timedelta(days=3),
                "est_time": 3,
                "spent": 3,
                "expired_time": 0,
            },
        },
        {
            "name_stage": TypeStage.Canceled,
            "worker_id": worker1_id,
            "status": TypeStatus.Canceled,
            "task_status": TypeTask.Canceled,
            "times": {
                "deadline": canceled_order_created_at + timedelta(days=4),
                "start": canceled_order_created_at + timedelta(days=3),
                "end": canceled_order_created_at + timedelta(days=4),
                "est_time": 0,
                "spent": 0,
                "expired_time": 0,
            },
        },
    ]
    add_order(canceled_order_data, canceled_stages, canceled_order_created_at)

    worker2_order_created_at = now - timedelta(days=10)
    worker2_order_data = {
        "item": "Заказ для worker2 (просрочена доставка)",
        "design_name": "Классическая кухня",
        "material_name": "ЛДСП 16мм",
        "address": "ул. Рабочая, д. 10",
        "floor": 3,
        "has_lift": True,
        "total_price": 120000,
        "type_price": 50000,
        "material_price": 30000,
        "delivery_price": 5000,
        "comment_price": 1000,
        "comment": "Специальный заказ для worker2",
        "color": {"red": 200, "green": 100, "blue": 50, "name": "Оранжевый"},
    }
    worker2_stages = [
        {
            "name_stage": TypeStage.Cutting,
            "worker_id": worker2_id,
            "status": TypeStatus.Completed,
            "task_status": TypeTask.Completed,
            "times": {
                "deadline": worker2_order_created_at + timedelta(days=3),
                "start": worker2_order_created_at,
                "end": worker2_order_created_at + timedelta(days=3),
                "est_time": 3,
                "spent": 3,
                "expired_time": 0,
            },
        },
        {
            "name_stage": TypeStage.Production,
            "worker_id": worker2_id,
            "status": TypeStatus.Completed,
            "task_status": TypeTask.Completed,
            "times": {
                "deadline": worker2_order_created_at + timedelta(days=8),
                "start": worker2_order_created_at + timedelta(days=3),
                "end": worker2_order_created_at + timedelta(days=8),
                "est_time": 5,
                "spent": 5,
                "expired_time": 0,
            },
        },
        {
            "name_stage": TypeStage.Delivery,
            "worker_id": worker2_id,
            "status": TypeStatus.Canceled,
            "task_status": TypeTask.Overdue,
            "times": {
                "deadline": worker2_order_created_at + timedelta(days=11),
                "start": worker2_order_created_at + timedelta(days=8),
                "end": None,
                "est_time": 3,
                "spent": 0,
                "expired_time": 2,
            },
        },
    ]
    add_order(worker2_order_data, worker2_stages, worker2_order_created_at)

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