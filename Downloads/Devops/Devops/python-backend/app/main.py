from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from app.database import connect_db, disconnect_db
from app.routes import declaration, visitor

load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="CARE Backend API",
    description="Backend API for CARE animal sanctuary management system",
    version="0.1.0"
)

# CORS middleware
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(declaration.router)
app.include_router(visitor.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    connect_db()


@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    disconnect_db()


@app.get("/", tags=["root"])
async def read_root():
    """Root endpoint"""
    return {
        "message": "Welcome to CARE Backend API",
        "docs": "/docs",
        "openapi": "/openapi.json"
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "CARE Backend API"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("API_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
