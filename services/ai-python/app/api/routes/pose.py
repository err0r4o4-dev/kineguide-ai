from fastapi import APIRouter

from app.schemas.pose import (
    CameraFeedback,
    PoseStatus,
    TechnicalPoseRequest,
    TechnicalPoseResponse,
)

router = APIRouter(prefix="/v1/pose", tags=["pose-technical"])


@router.post("/technical-feedback", response_model=TechnicalPoseResponse)
async def technical_feedback(request: TechnicalPoseRequest) -> TechnicalPoseResponse:
    visibility = request.landmark_visibility
    confidence = sum(visibility) / len(visibility) if visibility else None
    feedback_by_status: dict[PoseStatus, CameraFeedback] = {
        "idle": "waiting_for_camera",
        "loading_model": "waiting_for_camera",
        "ready": "camera_ready",
        "adjust_camera": "adjust_camera",
        "no_pose": "adjust_camera",
        "multiple_poses": "multiple_people_detected",
        "unsupported_exercise": "unsupported_exercise",
        "unavailable": "technical_analysis_unavailable",
        "error": "technical_analysis_unavailable",
    }
    return TechnicalPoseResponse(
        status="completed",
        movement_phase="unavailable",
        repetition_count=None,
        confidence_score=confidence,
        camera_feedback=feedback_by_status[request.pose_status],
    )
