"""Privacy-minimized skeleton features shared by training and browser export."""

from __future__ import annotations

import math
from collections.abc import Callable, Sequence


# Dataset joints that have a stable coarse counterpart in MediaPipe Pose.
JOINT_INDICES = (3, 6, 7, 8, 11, 12, 13, 16, 17, 18, 19, 21, 22, 23, 24)
FRAME_COUNT = 32

PointReader = Callable[[int, int], tuple[float, float]]


def _sample_position(start: int, end: int, output_index: int) -> float:
    if FRAME_COUNT == 1:
        return float(start)
    return start + (end - start) * output_index / (FRAME_COUNT - 1)


def extract_features(
    point: PointReader,
    first_frame: int,
    last_frame: int,
) -> list[float]:
    if first_frame < 0 or last_frame <= first_frame:
        raise ValueError("invalid repetition frame range")

    features: list[float] = []
    for output_index in range(FRAME_COUNT):
        position = _sample_position(first_frame, last_frame, output_index)
        low = math.floor(position)
        high = math.ceil(position)
        weight = position - low

        hip_low = point(low, 0)
        hip_high = point(high, 0)
        neck_low = point(low, 3)
        neck_high = point(high, 3)
        hip = _interpolate(hip_low, hip_high, weight)
        neck = _interpolate(neck_low, neck_high, weight)
        scale = math.dist(hip, neck)
        if not math.isfinite(scale) or scale <= 1e-9:
            raise ValueError("invalid torso scale")

        for joint in JOINT_INDICES:
            coordinate = _interpolate(point(low, joint), point(high, joint), weight)
            features.extend(((coordinate[0] - hip[0]) / scale, (coordinate[1] - hip[1]) / scale))
    return features


def _interpolate(
    low: Sequence[float], high: Sequence[float], weight: float
) -> tuple[float, float]:
    return (
        low[0] + (high[0] - low[0]) * weight,
        low[1] + (high[1] - low[1]) * weight,
    )
