import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.script.seed import seed_users, seed_materials, seed_designs, seed_orders
from app.web.auth_router import router as auth_router
from app.web.material_router import router as material_router
from app.web.design_router import router as design_router
from app.web.order_router import router as order_router
from app.web.task_router import router as task_router
from app.web.worker_router import router as worker_router


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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:80",
        "http://frontend",
        "http://localhost:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(material_router)
app.include_router(design_router)
app.include_router(order_router)
app.include_router(task_router)
app.include_router(worker_router)


@app.get("/")
async def root():
    return {"message": "каркас"}


@app.get("/health", summary="Health check", tags=["health"], status_code=200)
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("main:app", reload=True, host="127.0.0.1", port=8000)
