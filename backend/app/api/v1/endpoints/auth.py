from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.database import get_session
from app.schemas.user import UserCreate, UserRead, Token
from app.services.auth import register_user, login_user

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(UserCreate):
    pass


@router.post("/register", response_model=UserRead, status_code=201)
def register(data: UserCreate, session: Session = Depends(get_session)):
    return register_user(data, session)


@router.post("/login", response_model=Token)
def login(data: LoginRequest, session: Session = Depends(get_session)):
    return login_user(data.email, data.password, session)