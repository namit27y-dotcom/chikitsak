from fastapi.testclient import TestClient

from tests.conftest import register_and_get_headers


def test_reminders_and_appointments_crud_and_user_isolation(
    client: TestClient,
) -> None:
    user_a = register_and_get_headers(client, email="usera@example.com", full_name="User A")
    user_b = register_and_get_headers(client, email="userb@example.com", full_name="User B")

    # User A creates a reminder
    rem_res = client.post(
        "/api/v1/reminders",
        headers=user_a,
        json={
            "title": "Take Morning Paracetamol 500mg",
            "reminder_time": "8:00 AM",
            "frequency": "Daily",
            "category": "Medicine",
        },
    )
    assert rem_res.status_code == 201
    rem_id = rem_res.json()["id"]

    # User A creates an appointment
    apt_res = client.post(
        "/api/v1/appointments",
        headers=user_a,
        json={
            "doctor_name": "Dr. Meera Verma",
            "hospital_name": "City Care Hospital",
            "appointment_date": "12 Dec 2025",
            "appointment_notes": "Bring fasting sugar report",
        },
    )
    assert apt_res.status_code == 201
    apt_id = apt_res.json()["id"]

    # User B cannot see, update, or delete User A's records
    assert client.get("/api/v1/reminders", headers=user_b).json() == []
    assert client.get("/api/v1/appointments", headers=user_b).json() == []
    assert (
        client.patch(
            f"/api/v1/reminders/{rem_id}",
            headers=user_b,
            json={"is_completed": True},
        ).status_code
        == 404
    )
    assert client.delete(f"/api/v1/reminders/{rem_id}", headers=user_b).status_code == 404
    assert (
        client.patch(
            f"/api/v1/appointments/{apt_id}",
            headers=user_b,
            json={"status": "Kept"},
        ).status_code
        == 404
    )
    assert (
        client.delete(f"/api/v1/appointments/{apt_id}", headers=user_b).status_code
        == 404
    )

    # User A updates and checks dashboard overview
    upd_rem = client.patch(
        f"/api/v1/reminders/{rem_id}",
        headers=user_a,
        json={"is_completed": True},
    )
    assert upd_rem.status_code == 200
    assert upd_rem.json()["is_completed"] is True

    upd_apt = client.patch(
        f"/api/v1/appointments/{apt_id}",
        headers=user_a,
        json={"status": "Kept"},
    )
    assert upd_apt.status_code == 200
    assert upd_apt.json()["status"] == "Kept"

    overview = client.get("/api/v1/dashboard/overview", headers=user_a)
    assert overview.status_code == 200
    stats = overview.json()["stats"]
    assert stats["appointments_kept_count"] == 1
    assert stats["total_appointments_count"] == 1
    assert stats["active_reminders_count"] == 0

    # User A deletes records
    assert client.delete(f"/api/v1/reminders/{rem_id}", headers=user_a).status_code == 200
    assert client.delete(f"/api/v1/appointments/{apt_id}", headers=user_a).status_code == 200
