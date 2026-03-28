import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.script.seed import seed_users, seed_materials, seed_designs, seed_orders

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting seed...")
    seed_users()
    seed_materials()
    seed_designs()
    seed_orders()
    print("Seed completed")
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/")
async def root():
    return {"message": "каркас"}

@app.get("/health", summary="Health check", tags=["health"], status_code=200)
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", reload=True, host="127.0.0.1", port=8000)
