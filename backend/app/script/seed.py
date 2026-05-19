from datetime import datetime, timedelta, timezone
import os
import random
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
        # Клиенты
        {
            "email": "client@example.com",
            "role": "client",
            "phone": "+7 999 111-11-11",
            "username": "Клиент Иванов",
            "hashed_password": hash_password("client123"),
            "created_at": now,
            "updated_at": now,
        },
        {
            "email": "client2@example.com",
            "role": "client",
            "phone": "+7 999 222-22-22",
            "username": "Клиент Петрова",
            "hashed_password": hash_password("client123"),
            "created_at": now,
            "updated_at": now,
        },
        {
            "email": "client3@example.com",
            "role": "client",
            "phone": "+7 999 333-33-33",
            "username": "Клиент Сидоров",
            "hashed_password": hash_password("client123"),
            "created_at": now,
            "updated_at": now,
        },
        {
            "email": "client4@example.com",
            "role": "client",
            "phone": "+7 999 444-44-44",
            "username": "Клиент Козлова",
            "hashed_password": hash_password("client123"),
            "created_at": now,
            "updated_at": now,
        },
        {
            "email": "client5@example.com",
            "role": "client",
            "phone": "+7 999 555-55-55",
            "username": "Клиент Николаев",
            "hashed_password": hash_password("client123"),
            "created_at": now,
            "updated_at": now,
        },
        # Работники
        {
            "email": "worker1@example.com",
            "role": "worker",
            "phone": "+7 999 666-66-66",
            "username": "Работник Петров",
            "hashed_password": hash_password("worker123"),
            "created_at": now,
            "updated_at": now,
            "worker_info": {
                "date_of_birth": datetime(1990, 1, 1, tzinfo=timezone.utc),
                "date_of_employment": datetime(2020, 1, 1, tzinfo=timezone.utc),
                "comment": "Раскройщик",
                "work_day_start": "08:00",
                "work_day_end": "17:00",
                "start_experience": 2,
            },
            "worker_positions": [
                {"position": "Раскройщик", "date": datetime(2020, 1, 1, tzinfo=timezone.utc)},
            ],
        },
        {
            "email": "worker2@example.com",
            "role": "worker",
            "phone": "+7 999 777-77-77",
            "username": "Смирнов Игорь",
            "hashed_password": hash_password("worker234"),
            "created_at": now,
            "updated_at": now,
            "worker_info": {
                "date_of_birth": datetime(1992, 4, 10, tzinfo=timezone.utc),
                "date_of_employment": datetime(2019, 6, 1, tzinfo=timezone.utc),
                "comment": "Сборщик",
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
            "phone": "+7 999 888-88-88",
            "username": "Павлов Артём",
            "hashed_password": hash_password("worker345"),
            "created_at": now,
            "updated_at": now,
            "worker_info": {
                "date_of_birth": datetime(1995, 9, 15, tzinfo=timezone.utc),
                "date_of_employment": datetime(2023, 1, 10, tzinfo=timezone.utc),
                "comment": "Монтажник",
                "work_day_start": "10:00",
                "work_day_end": "19:00",
                "start_experience": 0,
            },
            "worker_positions": [
                {"position": "Монтажник", "date": datetime(2023, 1, 10, tzinfo=timezone.utc)},
            ],
        },
        {
            "email": "worker4@example.com",
            "role": "worker",
            "phone": "+7 999 999-99-99",
            "username": "Волков Денис",
            "hashed_password": hash_password("worker456"),
            "created_at": now,
            "updated_at": now,
            "worker_info": {
                "date_of_birth": datetime(1988, 7, 22, tzinfo=timezone.utc),
                "date_of_employment": datetime(2018, 3, 15, tzinfo=timezone.utc),
                "comment": "Доставщик",
                "work_day_start": "07:00",
                "work_day_end": "16:00",
                "start_experience": 5,
            },
            "worker_positions": [
                {"position": "Водитель", "date": datetime(2018, 3, 15, tzinfo=timezone.utc)},
                {"position": "Старший доставщик", "date": datetime(2021, 5, 1, tzinfo=timezone.utc)},
            ],
        },
        {
            "email": "worker5@example.com",
            "role": "worker",
            "phone": "+7 999 000-00-00",
            "username": "Морозова Анна",
            "hashed_password": hash_password("worker567"),
            "created_at": now,
            "updated_at": now,
            "worker_info": {
                "date_of_birth": datetime(1993, 12, 5, tzinfo=timezone.utc),
                "date_of_employment": datetime(2021, 8, 20, tzinfo=timezone.utc),
                "comment": "Дизайнер-технолог",
                "work_day_start": "09:00",
                "work_day_end": "18:00",
                "start_experience": 1,
            },
            "worker_positions": [
                {"position": "Технолог", "date": datetime(2021, 8, 20, tzinfo=timezone.utc)},
            ],
        },
        # Администратор
        {
            "email": "admin@example.com",
            "role": "admin",
            "phone": "+7 999 123-45-67",
            "username": "Администратор Сидоров",
            "hashed_password": hash_password("admin123"),
            "created_at": now,
            "updated_at": now,
        },
    ]
    for user in users:
        db.users.update_one({"email": user["email"]}, {"$set": user}, upsert=True)
    print(f"Seeded {db.users.count_documents({})} users")


def seed_materials():
    now = datetime.now(timezone.utc)
    materials = [
        {"name": "ЛДСП 16мм", "remain": 250, "cost": 1500, "updated_at": now},
        {"name": "МДФ 19мм", "remain": 120, "cost": 2500, "updated_at": now},
        {"name": "Кромка ПВХ", "remain": 800, "cost": 50, "updated_at": now},
        {"name": "Стекло матовое", "remain": 60, "cost": 3000, "updated_at": now},
        {"name": "Алюминиевый профиль", "remain": 200, "cost": 800, "updated_at": now},
        {"name": "Фасады из пластика", "remain": 90, "cost": 2200, "updated_at": now},
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
            "description": "Классический дизайн с резными фасадами",
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
            "description": "Минимализм, глянцевые фасады",
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
            "material_id": material_map.get("ЛДСП 16мм", ""),
            "material": "ЛДСП 16мм",
            "design_price": 95000,
            "material_price": 55000,
            "color": {"red": 210, "green": 180, "blue": 140, "name": "Дуб"},
            "description": "Кухня с островной столешницей",
            "production_time": 28,
            "need_material": 30,
            "blueprint": 1003,
            "created_at": now,
            "updated_at": now,
        },
        {
            "name": "Лофт",
            "type": TypeDesign("Г-образная"),
            "size": {"height": 92, "width": 70, "length": 320},
            "material_id": material_map.get("МДФ 19мм", ""),
            "material": "МДФ 19мм",
            "design_price": 68000,
            "material_price": 40000,
            "color": {"red": 80, "green": 80, "blue": 80, "name": "Бетон"},
            "description": "Стиль лофт, металлические вставки",
            "production_time": 18,
            "need_material": 20,
            "blueprint": 1004,
            "created_at": now,
            "updated_at": now,
        },
        {
            "name": "Прованс",
            "type": TypeDesign("П-образная"),
            "size": {"height": 86, "width": 60, "length": 380},
            "material_id": material_map.get("ЛДСП 16мм", ""),
            "material": "ЛДСП 16мм",
            "design_price": 82000,
            "material_price": 48000,
            "color": {"red": 240, "green": 248, "blue": 255, "name": "Лаванда"},
            "description": "Романтический прованс, пастельные тона",
            "production_time": 24,
            "need_material": 25,
            "blueprint": 1005,
            "created_at": now,
            "updated_at": now,
        },
        {
            "name": "Хай-тек",
            "type": TypeDesign("Двухлинейная"),
            "size": {"height": 88, "width": 60, "length": 450},
            "material_id": material_map.get("Алюминиевый профиль", ""),
            "material": "Алюминиевый профиль",
            "design_price": 110000,
            "material_price": 70000,
            "color": {"red": 192, "green": 192, "blue": 192, "name": "Серебро"},
            "description": "Стекло, металл, подсветка",
            "production_time": 30,
            "need_material": 28,
            "blueprint": 1006,
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

    client_users = list(db.users.find({"role": "client"}))
    worker_users = list(db.users.find({"role": "worker"}))
    if not client_users or not worker_users:
        print("Clients or workers not found, skipping orders seeding")
        return

    designs = {d["name"]: d for d in db.designs.find({})}
    materials = {m["name"]: m for m in db.materials.find({})}
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
                "client_id": str(order_data["client_id"]),
                "username": order_data["client_username"],
                "phone": order_data["client_phone"],
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
        db.orders.update_one({"item": order["item"]}, {"$set": order}, upsert=True)

    kitchen_items = [
        "Кухонный гарнитур", "Угловая кухня", "Прямая кухня",
        "Кухня с барной стойкой", "Компактная кухня"
    ]
    addresses = [
        "ул. Ленина, д. 10", "пр. Мира, д. 25", "ул. Гагарина, д. 7",
        "б-р Рокоссовского, д. 3", "ул. Пушкина, д. 15", "ул. Чехова, д. 22"
    ]
    colors = [
        {"red": 255, "green": 255, "blue": 255, "name": "Белый"},
        {"red": 50, "green": 50, "blue": 50, "name": "Темно-серый"},
        {"red": 210, "green": 180, "blue": 140, "name": "Дуб"},
        {"red": 80, "green": 80, "blue": 80, "name": "Бетон"},
        {"red": 240, "green": 248, "blue": 255, "name": "Лаванда"},
    ]

    scenario_available = 0
    scenario_in_progress = 0
    scenario_overdue = 0
    scenario_completed = 0
    scenario_canceled = 0
    scenario_fully_completed = 0

    for i in range(1, 60):
        client = client_users[i % len(client_users)]
        client_id = str(client["_id"])
        client_username = client["username"]
        client_phone = client.get("phone", "+7 999 000-00-00")

        design_name = list(designs.keys())[i % len(designs)]
        material_name = designs[design_name]["material"]
        created_at = now - timedelta(days=random.randint(1, 60))
        base_price = 50000 + (i * 3000)

        order_data = {
            "client_id": client_id,
            "client_username": client_username,
            "client_phone": client_phone,
            "item": kitchen_items[i % len(kitchen_items)] + f" №{i}",
            "design_name": design_name,
            "material_name": material_name,
            "address": addresses[i % len(addresses)],
            "floor": (i % 5) + 1,
            "has_lift": i % 2 == 0,
            "total_price": base_price,
            "type_price": int(base_price * 0.5),
            "material_price": int(base_price * 0.3),
            "delivery_price": 5000 + (i % 5) * 1000,
            "comment_price": 1000 + (i % 10) * 500,
            "comment": f"Тестовый заказ {i}",
            "color": colors[i % len(colors)],
        }

        scenario = i % 7
        if scenario in (0, 6) and scenario_available < 7:
            scenario_type = "available"
            scenario_available += 1
        elif scenario == 1 and scenario_in_progress < 7:
            scenario_type = "in_progress"
            scenario_in_progress += 1
        elif scenario == 2 and scenario_overdue < 6:
            scenario_type = "overdue"
            scenario_overdue += 1
        elif scenario == 3 and scenario_completed < 6:
            scenario_type = "completed"
            scenario_completed += 1
        elif scenario == 4 and scenario_canceled < 6:
            scenario_type = "canceled"
            scenario_canceled += 1
        elif scenario == 5 and scenario_fully_completed < 6:
            scenario_type = "fully_completed"
            scenario_fully_completed += 1
        else:
            if scenario_available < 7:
                scenario_type = "available"
                scenario_available += 1
            else:
                scenario_type = "in_progress"
                scenario_in_progress += 1

        stages = []
        worker = worker_users[i % len(worker_users)]
        worker_id = str(worker["_id"])

        if scenario_type == "available":
            stages.append({
                "name_stage": TypeStage.Cutting,
                "worker_id": "",
                "status": TypeStatus.In_progress,
                "task_status": TypeTask.Available,
                "times": {
                    "deadline": created_at + timedelta(days=3),
                    "start": created_at,
                    "end": None,
                    "est_time": 2880,
                    "spent": 0,
                    "expired_time": 0,
                }
            })

        elif scenario_type == "in_progress":
            stages.append({
                "name_stage": TypeStage.Cutting,
                "worker_id": worker_id,
                "status": TypeStatus.Completed,
                "task_status": TypeTask.Completed,
                "times": {
                    "deadline": created_at + timedelta(days=3),
                    "start": created_at,
                    "end": created_at + timedelta(days=3),
                    "est_time": 3,
                    "spent": 3,
                    "expired_time": 0,
                }
            })
            stages.append({
                "name_stage": TypeStage.Production,
                "worker_id": worker_id,
                "status": TypeStatus.In_progress,
                "task_status": TypeTask.In_progress,
                "times": {
                    "deadline": created_at + timedelta(days=10),
                    "start": created_at + timedelta(days=3),
                    "end": None,
                    "est_time": 7,
                    "spent": 2,
                    "expired_time": 0,
                }
            })

        elif scenario_type == "overdue":
            stages.append({
                "name_stage": TypeStage.Cutting,
                "worker_id": worker_id,
                "status": TypeStatus.Completed,
                "task_status": TypeTask.Completed,
                "times": {
                    "deadline": created_at + timedelta(days=3),
                    "start": created_at,
                    "end": created_at + timedelta(days=3),
                    "est_time": 3,
                    "spent": 3,
                    "expired_time": 0,
                }
            })
            deadline_past = created_at + timedelta(days=5)
            stages.append({
                "name_stage": TypeStage.Production,
                "worker_id": worker_id,
                "status": TypeStatus.In_progress,
                "task_status": TypeTask.Overdue,
                "times": {
                    "deadline": deadline_past,
                    "start": created_at + timedelta(days=3),
                    "end": None,
                    "est_time": 7,
                    "spent": 1,
                    "expired_time": (now - deadline_past).total_seconds() / 60,
                }
            })

        elif scenario_type == "completed":
            stages.append({
                "name_stage": TypeStage.Cutting,
                "worker_id": worker_id,
                "status": TypeStatus.Completed,
                "task_status": TypeTask.Completed,
                "times": {
                    "deadline": created_at + timedelta(days=3),
                    "start": created_at,
                    "end": created_at + timedelta(days=3),
                    "est_time": 3,
                    "spent": 3,
                    "expired_time": 0,
                }
            })
            stages.append({
                "name_stage": TypeStage.Production,
                "worker_id": worker_id,
                "status": TypeStatus.Completed,
                "task_status": TypeTask.Completed,
                "times": {
                    "deadline": created_at + timedelta(days=10),
                    "start": created_at + timedelta(days=3),
                    "end": created_at + timedelta(days=10),
                    "est_time": 7,
                    "spent": 7,
                    "expired_time": 0,
                }
            })
            stages.append({
                "name_stage": TypeStage.Delivery,
                "worker_id": worker_id,
                "status": TypeStatus.Completed,
                "task_status": TypeTask.Completed,
                "times": {
                    "deadline": created_at + timedelta(days=12),
                    "start": created_at + timedelta(days=10),
                    "end": created_at + timedelta(days=12),
                    "est_time": 2,
                    "spent": 2,
                    "expired_time": 0,
                }
            })
            stages.append({
                "name_stage": TypeStage.Montage,
                "worker_id": "",
                "status": TypeStatus.In_progress,
                "task_status": TypeTask.Available,
                "times": {
                    "deadline": created_at + timedelta(days=17),
                    "start": created_at + timedelta(days=12),
                    "end": None,
                    "est_time": 5,
                    "spent": 0,
                    "expired_time": 0,
                }
            })

        elif scenario_type == "canceled":
            stages.append({
                "name_stage": TypeStage.Cutting,
                "worker_id": worker_id,
                "status": TypeStatus.Completed,
                "task_status": TypeTask.Completed,
                "times": {
                    "deadline": created_at + timedelta(days=3),
                    "start": created_at,
                    "end": created_at + timedelta(days=3),
                    "est_time": 3,
                    "spent": 3,
                    "expired_time": 0,
                }
            })
            stages.append({
                "name_stage": TypeStage.Canceled,
                "worker_id": worker_id,
                "status": TypeStatus.Canceled,
                "task_status": TypeTask.Canceled,
                "times": {
                    "deadline": created_at + timedelta(days=4),
                    "start": created_at + timedelta(days=3),
                    "end": created_at + timedelta(days=4),
                    "est_time": 0,
                    "spent": 0,
                    "expired_time": 0,
                }
            })

        elif scenario_type == "fully_completed":
            stages.append({
                "name_stage": TypeStage.Cutting,
                "worker_id": worker_id,
                "status": TypeStatus.Completed,
                "task_status": TypeTask.Completed,
                "times": {
                    "deadline": created_at + timedelta(days=3),
                    "start": created_at,
                    "end": created_at + timedelta(days=3),
                    "est_time": 3,
                    "spent": 3,
                    "expired_time": 0,
                }
            })
            stages.append({
                "name_stage": TypeStage.Production,
                "worker_id": worker_id,
                "status": TypeStatus.Completed,
                "task_status": TypeTask.Completed,
                "times": {
                    "deadline": created_at + timedelta(days=10),
                    "start": created_at + timedelta(days=3),
                    "end": created_at + timedelta(days=10),
                    "est_time": 7,
                    "spent": 7,
                    "expired_time": 0,
                }
            })
            stages.append({
                "name_stage": TypeStage.Delivery,
                "worker_id": worker_id,
                "status": TypeStatus.Completed,
                "task_status": TypeTask.Completed,
                "times": {
                    "deadline": created_at + timedelta(days=12),
                    "start": created_at + timedelta(days=10),
                    "end": created_at + timedelta(days=12),
                    "est_time": 2,
                    "spent": 2,
                    "expired_time": 0,
                }
            })
            stages.append({
                "name_stage": TypeStage.Montage,
                "worker_id": worker_id,
                "status": TypeStatus.Completed,
                "task_status": TypeTask.Completed,
                "times": {
                    "deadline": created_at + timedelta(days=17),
                    "start": created_at + timedelta(days=12),
                    "end": created_at + timedelta(days=17),
                    "est_time": 5,
                    "spent": 5,
                    "expired_time": 0,
                }
            })
            stages.append({
                "name_stage": TypeStage.Completed,
                "worker_id": worker_id,
                "status": TypeStatus.Completed,
                "task_status": TypeTask.Completed,
                "times": {
                    "deadline": created_at + timedelta(days=17),
                    "start": created_at + timedelta(days=17),
                    "end": created_at + timedelta(days=17),
                    "est_time": 0,
                    "spent": 0,
                    "expired_time": 0,
                }
            })

        add_order(order_data, stages, created_at)

    print(f"Seeded {db.orders.count_documents({})} orders with stages")
    print(f"Scenarios: available={scenario_available}, in_progress={scenario_in_progress}, overdue={scenario_overdue}, completed={scenario_completed}, canceled={scenario_canceled}, fully_completed={scenario_fully_completed}")


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