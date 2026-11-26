from fastapi import APIRouter

from app.api.v1 import (
    appointments,
    auth,
    care_plans,
    dashboard,
    medications,
    reminders,
    reports,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(dashboard.router)
api_router.include_router(reports.router)
api_router.include_router(care_plans.router)
api_router.include_router(medications.router)
api_router.include_router(reminders.router)
api_router.include_router(appointments.router)
