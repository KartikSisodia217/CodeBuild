from sqlalchemy.orm import Session

from backend.models.user import User
from backend.utils.security import verify_password


def login_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()

    if user is None:
        return None

    if not verify_password(password, user.password):
        return None

    return user