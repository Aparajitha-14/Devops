from pymongo import MongoClient
from pymongo.collection import Collection
from contextlib import contextmanager
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "care_db")

client: MongoClient = None
database = None


def connect_db():
    global client, database
    client = MongoClient(MONGODB_URI)
    database = client[DATABASE_NAME]
    # Test connection
    try:
        client.admin.command('ping')
        print("✓ Connected to MongoDB")
    except Exception as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        raise


def disconnect_db():
    global client
    if client:
        client.close()
        print("✓ Disconnected from MongoDB")


def get_db():
    return database


def get_collection(collection_name: str) -> Collection:
    """Get a collection from the database"""
    return database[collection_name]
