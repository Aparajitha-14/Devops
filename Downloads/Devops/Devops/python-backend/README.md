# CARE Backend API (Currently redundant, if we're adding more microservices later we add it here)

A Python FastAPI backend for the CARE animal sanctuary management system.

## Features

- ✅ Simple and clean API structure
- ✅ MongoDB integration
- ✅ Pydantic validation
- ✅ CORS enabled for frontend integration
- ✅ Auto-generated API documentation
- ✅ Ready for WhatsApp notifications and other extensions

## Installation

1. **Create a Python virtual environment:**
   ```bash
   cd python-backend
   python -m venv venv
   ```

2. **Activate the virtual environment:**
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```
   Update the `MONGODB_URI` with your MongoDB connection string.

## Running the Server

```bash
python -m uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

- **API Documentation:** http://localhost:8000/docs
- **ReDoc Documentation:** http://localhost:8000/redoc

## API Endpoints

### Declarations
- `POST /api/declarations/` - Create a new declaration
- `GET /api/declarations/` - List all declarations (with pagination)
- `GET /api/declarations/{declaration_id}` - Get a specific declaration
- `DELETE /api/declarations/{declaration_id}` - Delete a declaration

### Visitors
- `POST /api/visitors/` - Create a new visitor form
- `GET /api/visitors/` - List all visitor forms (with pagination)
- `GET /api/visitors/{visitor_id}` - Get a specific visitor form
- `DELETE /api/visitors/{visitor_id}` - Delete a visitor form

### Health
- `GET /health` - Health check endpoint
- `GET /` - Root endpoint

## Project Structure

```
python-backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app and routes setup
│   ├── database.py          # MongoDB connection
│   ├── models.py            # Pydantic models
│   └── routes/
│       ├── __init__.py
│       ├── declaration.py   # Declaration endpoints
│       └── visitor.py       # Visitor endpoints
├── requirements.txt         # Python dependencies
├── .env.example             # Environment variables template
└── README.md               # This file
```

## Environment Variables

- `MONGODB_URI` - MongoDB connection string (default: `mongodb://localhost:27017`)
- `DATABASE_NAME` - Database name (default: `care_db`)
- `API_PORT` - API port (default: `8000`)
- `DEBUG` - Debug mode (default: `True`)

## Adding New Features

### Example: Adding WhatsApp Notifications

1. Create a new file `app/services/whatsapp.py`:
   ```python
   # WhatsApp notification service
   def send_notification(phone: str, message: str):
       # Your WhatsApp API integration here
       pass
   ```

2. Use it in your routes:
   ```python
   from app.services.whatsapp import send_notification
   
   @router.post("/")
   async def create_visitor(form: VisitorForm):
       # ... existing code ...
       # Send WhatsApp notification
       send_notification(form.phone, "Thank you for your submission!")
   ```

## Development

The project uses:
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **PyMongo** - MongoDB driver
- **python-dotenv** - Environment variable management

## Next Steps

1. Update your Next.js frontend to call the backend API instead of direct DB connections
2. Remove MongoDB connection from frontend
3. Update API endpoints in frontend to point to `http://localhost:8000/api/`
