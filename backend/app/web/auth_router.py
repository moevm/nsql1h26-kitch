from fastapi import APIRouter
from app.models.user import UserCreate, UserAuth, RegisterResponse, AuthResponse
from app.service.auth_service import register_user, authenticate_user

router = APIRouter(prefix="/api", tags=["auth"])


@router.post("/register", response_model=RegisterResponse, status_code=201)
async def register(data: UserCreate):
    user_id = await register_user(data)
    return RegisterResponse(id=user_id)


@router.post(
    "/auth",
    response_model=AuthResponse,
    status_code=200,
    summary="авторизация пользователей",
    description="""
    клиент: client@example.com client123
    рабочий: worker@example.com worker123
    админ: admin@example.com admin123
    """
)
async def auth(data: UserAuth):
    token = await authenticate_user(data)
    return AuthResponse(token=token)
