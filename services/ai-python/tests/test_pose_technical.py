from fastapi.testclient import TestClient


def test_pose_technical_feedback_is_bounded_and_non_clinical(
    client: TestClient,
) -> None:
    response = client.post(
        "/v1/pose/technical-feedback",
        json={"pose_status": "ready", "landmark_visibility": [0.5, 1.0]},
    )

    assert response.status_code == 200
    assert response.json() == {
        "status": "completed",
        "movement_phase": "unavailable",
        "repetition_count": None,
        "confidence_score": 0.75,
        "camera_feedback": "camera_ready",
    }
    assert "diagnosis" not in response.json()
    assert "treatment_recommendation" not in response.json()


def test_pose_technical_feedback_rejects_raw_media_fields(
    client: TestClient,
) -> None:
    response = client.post(
        "/v1/pose/technical-feedback",
        json={
            "pose_status": "ready",
            "landmark_visibility": [1.0],
            "video": "raw-media-must-not-cross-the-boundary",
        },
    )

    assert response.status_code == 422


def test_pose_technical_feedback_uses_activity_language_without_assessing_movement(
    client: TestClient,
) -> None:
    response = client.post(
        "/v1/pose/technical-feedback",
        json={"pose_status": "unsupported_activity", "landmark_visibility": []},
    )

    assert response.status_code == 200
    assert response.json()["camera_feedback"] == "unsupported_activity"
    assert response.json()["movement_phase"] == "unavailable"
    assert response.json()["repetition_count"] is None
