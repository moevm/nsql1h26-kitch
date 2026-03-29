
import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

# uri = "mongodb+srv://<db_username>:<db_password>@cluster0.yevxekt.mongodb.net/?appName=Cluster0"
uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")

# Create a new client and connect to the server
client = MongoClient(uri)

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Connected to MongoDB!")
except Exception as e:
    print(e)

db = client[os.getenv("MONGO_INITDB_DATABASE", "database")]  
