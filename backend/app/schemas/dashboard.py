from datetime import datetime

from pydantic import BaseModel


class RecentSecurityActivity(BaseModel):
    event_id: str
    request_id: str
    timestamp: datetime
    user_id: str
    user_role: str
    risk_score: int | None = None
    risk_severity: str | None = None
    policy_decision: str | None = None
    outcome: str


class DashboardMetricsOut(BaseModel):
    total_requests: int
    allowed_requests: int
    blocked_requests: int
    warned_requests: int
    threat_counts: dict[str, int]
    average_risk_score: float
    recent_security_activity: list[RecentSecurityActivity]
