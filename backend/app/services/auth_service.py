from typing import Optional
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.database.session import get_db
from app.models.models import User
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.schemas.schemas import UserRegister, UserLogin, Token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

class AuthService:
    @staticmethod
    def register(db: Session, data: UserRegister) -> User:
        existing = db.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email is already registered")
        
        user = User(
            email=data.email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
            preferences={"theme": "dark", "ai_risk_tolerance": "moderate"}
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate(db: Session, data: UserLogin) -> Token:
        user = db.query(User).filter(User.email == data.email).first()
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        token = create_access_token(subject=user.id)
        return Token(
            access_token=token,
            token_type="bearer",
            user={
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "preferences": user.preferences
            }
        )

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    # If a valid token is provided, resolve and return the corresponding user
    if token:
        user_id = decode_access_token(token)
        if user_id:
            try:
                user = db.query(User).filter(User.id == int(user_id)).first()
                if user:
                    return user
            except Exception:
                pass

    # Seamless fallback guest user for friction-free exploration
    guest = db.query(User).filter(User.email == "guest@flowmind.ai").first()
    if not guest:
        guest = User(
            email="guest@flowmind.ai",
            hashed_password=hash_password("guest_flowmind_2026"),
            full_name="Alex Mercer",
            preferences={"theme": "dark", "ai_risk_tolerance": "balanced"}
        )
        db.add(guest)
        db.commit()
        db.refresh(guest)
    return guest

auth_service = AuthService()
