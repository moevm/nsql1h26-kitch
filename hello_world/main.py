import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError

load_dotenv()

class Student:
    def __init__(self, name, group):
        self.name = name
        self.group = group

    def to_dict(self):
        return {
            "name": self.name,
            "group": self.group
        }


def main():
    username = os.getenv("MONGO_INITDB_ROOT_USERNAME")
    password = os.getenv("MONGO_INITDB_ROOT_PASSWORD")
    database = os.getenv("MONGO_INITDB_DATABASE")

    URI = f"mongodb://{username}:{password}@localhost:27017/{database}?authSource=admin"

    students = [
        Student("Ivan", "1234"),
        Student("Petr", "1234"),
        Student("Oleg", "1234"),
        Student("Maria", "1235"),
    ]

    try:
        # подключаемся к базе данных и проверяем подключение
        client = MongoClient(URI)

        client.admin.command('ping')
        print("#Connection: ok")

        # получаем коллекцию
        collection = client[database]["students"]
        
        # добавляем записи
        collection.insert_many([student.to_dict() for student in students])

        # проверяем добавились ли записи
        print("\nДо изменений:")
        [print(student) for student in collection.find()]
        print()

        # удаляем одну запись
        collection.delete_one(
            {"name": "Oleg"}
        )

        # изменяем одну запись 
        collection.update_one(
            {"name": "Maria"},
            {"$set": {"group": "1234"}}
        )

        # проверяем изменения
        print("\nПосле изменений:")
        [print(student) for student in collection.find()]
        print()

    except PyMongoError as e:
        print("#Connection: fail")
        print(f"#Error: {e}")
    finally:
        client.close()

    return 0;

if __name__ == "__main__":
    main()