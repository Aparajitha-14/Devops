"""
Starter tests for the CARE Storeroom backend.
Uses FastAPI's TestClient (backed by httpx) with an in-memory SQLite DB
so tests run without needing a real Postgres instance.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import models
import database
from main import app

# ---------------------------------------------------------------------------
# Test database setup – uses in-memory SQLite instead of Postgres
# ---------------------------------------------------------------------------
SQLALCHEMY_TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Patch the dependency so every request uses the test DB
app.dependency_overrides[database.get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    """Create all tables before each test, drop them after."""
    models.Base.metadata.create_all(bind=engine)
    yield
    models.Base.metadata.drop_all(bind=engine)


client = TestClient(app)


# ---------------------------------------------------------------------------
# Helper – obtain a JWT token for authenticated endpoints
# ---------------------------------------------------------------------------
def get_auth_header() -> dict:
    """Register the default admin and return an Authorization header."""
    from passlib.context import CryptContext

    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    db = TestingSessionLocal()
    admin = db.query(models.AdminUser).filter(models.AdminUser.username == "admin").first()
    if not admin:
        hashed = pwd_context.hash("admin")
        db.add(models.AdminUser(username="admin", hashed_password=hashed))
        db.commit()
    db.close()

    resp = client.post("/login", json={"username": "admin", "password": "admin"})
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Auth tests
# ---------------------------------------------------------------------------
class TestAuth:
    def test_login_success(self):
        headers = get_auth_header()
        assert "Authorization" in headers

    def test_login_wrong_password(self):
        # Ensure admin exists first
        get_auth_header()
        resp = client.post("/login", json={"username": "admin", "password": "wrong"})
        assert resp.status_code == 401

    def test_verify_valid_token(self):
        headers = get_auth_header()
        resp = client.get("/verify", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["user"] == "admin"

    def test_verify_invalid_token(self):
        resp = client.get("/verify", headers={"Authorization": "Bearer invalid.token.here"})
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Category CRUD tests
# ---------------------------------------------------------------------------
class TestCategories:
    def test_create_and_list_category(self):
        headers = get_auth_header()
        resp = client.post(
            "/api/categories",
            json={"name": "Medical", "description": "Medical supplies"},
            headers=headers,
        )
        assert resp.status_code == 200
        cat_id = resp.json()["id"]

        resp = client.get("/api/categories")
        assert resp.status_code == 200
        names = [c["name"] for c in resp.json()]
        assert "Medical" in names

    def test_update_category(self):
        headers = get_auth_header()
        resp = client.post(
            "/api/categories",
            json={"name": "Old Name", "description": "desc"},
            headers=headers,
        )
        cat_id = resp.json()["id"]

        resp = client.put(
            f"/api/categories/{cat_id}",
            json={"name": "New Name", "description": "updated"},
            headers=headers,
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "New Name"

    def test_delete_category(self):
        headers = get_auth_header()
        resp = client.post(
            "/api/categories",
            json={"name": "ToDelete", "description": "bye"},
            headers=headers,
        )
        cat_id = resp.json()["id"]

        resp = client.delete(f"/api/categories/{cat_id}", headers=headers)
        assert resp.status_code == 200


# ---------------------------------------------------------------------------
# Department CRUD tests
# ---------------------------------------------------------------------------
class TestDepartments:
    def test_create_and_list_department(self):
        headers = get_auth_header()
        resp = client.post(
            "/api/departments",
            json={"dept_name": "Kitchen", "dept_lead": "Chef Ravi", "notes": "contact: 9876543210"},
            headers=headers,
        )
        assert resp.status_code == 200

        resp = client.get("/api/departments")
        assert resp.status_code == 200
        names = [d["dept_name"] for d in resp.json()]
        assert "Kitchen" in names
