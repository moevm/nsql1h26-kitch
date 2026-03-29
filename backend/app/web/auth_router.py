from fastapi import APIRouter
from app.models.user import UserCreate, UserAuth,RegisterResponse,AuthResponse
from app.service.auth_service import register_user, authenticate_user

router = APIRouter(prefix="/api", tags=["auth"])

@router.post("/register", response_model=RegisterResponse, status_code=201)
async def register(data: UserCreate):
    user_id = register_user(data)
    return RegisterResponse(id=user_id)

@router.post("/auth", response_model=AuthResponse, status_code=200)
async def auth(data: UserAuth):
    token = authenticate_user(data)
    return AuthResponse(token=token)
