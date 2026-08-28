from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_administrator_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardMetricsOut
from app.services.dashboard_metrics_service import DashboardMetricsService

router = APIRouter()


@router.get("/metrics", response_model=DashboardMetricsOut)
def get_dashboard_metrics(
    user: User = Depends(get_administrator_user),
    db: Session = Depends(get_db),
) -> DashboardMetricsOut:
    return DashboardMetricsService(db).get_metrics()
