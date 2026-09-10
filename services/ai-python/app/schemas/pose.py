from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

PoseStatus = Literal[
    "idle",
    "loading_model",
    "ready",
    "adjust_camera",
    "no_pose",
    "multiple_poses",
    "unsupported_activity",
    "unsupported_exercise",
    "unavailable",
    "error",
]

CameraFeedback = Literal[
    "waiting_for_camera",
    "camera_ready",
    "adjust_camera",
    "multiple_people_detected",
    "unsupported_activity",
    "unsupported_exercise",
    "technical_analysis_unavailable",
]


class TechnicalPoseRequest(BaseModel):
    """Derived visibility values only; raw media and landmark coordinates are forbidden."""

    model_config = ConfigDict(extra="forbid")

    pose_status: PoseStatus
    landmark_visibility: list[float] = Field(default_factory=list, max_length=33)

    @field_validator("landmark_visibility")
    @classmethod
    def validate_visibility(cls, value: list[float]) -> list[float]:
        if any(item < 0 or item > 1 for item in value):
            raise ValueError("landmark visibility must be between 0 and 1")
        return value


class TechnicalPoseResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Literal["completed"]
    movement_phase: Literal["unavailable"]
    repetition_count: None = None
    confidence_score: float | None = Field(default=None, ge=0, le=1)
    camera_feedback: CameraFeedback
