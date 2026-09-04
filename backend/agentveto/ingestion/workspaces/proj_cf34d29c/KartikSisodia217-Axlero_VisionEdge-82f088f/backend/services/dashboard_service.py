from sqlalchemy.orm import Session

from backend.models.user import User


def get_dashboard_stats(db: Session):
    total_users = db.query(User).count()

    active_users = (
        db.query(User)
        .filter(User.is_active == True)
        .count()
    )

    inactive_users = total_users - active_users

    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": inactive_users,
        "gpu_usage": 72,
        "cpu_usage": 41,
        "database_status": "Connected",
    }