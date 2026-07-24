from fastapi.testclient import TestClient

from src.app import app, activities


client = TestClient(app)


def test_get_activities_includes_participants():
    response = client.get("/activities")

    assert response.status_code == 200
    data = response.json()
    assert "Chess Club" in data
    assert data["Chess Club"]["participants"] == ["michael@mergington.edu", "daniel@mergington.edu"]


def test_unregister_participant_removes_email():
    activity_name = "Chess Club"
    email = "test-unregister@mergington.edu"
    activities[activity_name]["participants"].append(email)

    response = client.post(f"/activities/{activity_name}/unregister?email={email}")

    assert response.status_code == 200
    assert email not in activities[activity_name]["participants"]


def test_unregister_unknown_email_returns_warning():
    response = client.post("/activities/Chess Club/unregister?email=missing@mergington.edu")

    assert response.status_code == 400
    assert response.json()["detail"] == "Email is not registered for this activity"
