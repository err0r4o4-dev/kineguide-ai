"""Train and evaluate a subject-separated nearest-centroid research baseline."""

from __future__ import annotations

import argparse
import csv
import json
import math
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .features import extract_features
from .npy_reader import read_joint_array


EXERCISES = {
    1: "arm-abduction",
    2: "arm-vw",
    3: "table-push-up",
    4: "standing-leg-abduction",
    5: "lunge",
    6: "squat",
}
@dataclass(frozen=True)
class Example:
    exercise_id: int
    person_id: int
    label: int
    features: list[float]


def _allowed(row: dict[str, str]) -> bool:
    if row["mocap_erroneous"] != "0" or row["cam17_orientation"] == "half-profile":
        return False
    if row["cam17_orientation"] == "front":
        return row["extra_person_in_cam17"] == "0"
    if row["cam17_orientation"] == "profile":
        return row["extra_person_in_cam18"] == "0"
    return False


def _camera(row: dict[str, str]) -> str:
    return "c17" if row["cam17_orientation"] == "front" else "c18"


def load_examples(dataset_root: Path) -> list[Example]:
    cache: dict[Path, Any] = {}
    examples: list[Example] = []
    with (dataset_root / "Segmentation.csv").open(encoding="utf-8", newline="") as source:
        for row in csv.DictReader(source, delimiter=";"):
            if not _allowed(row):
                continue
            exercise_id = int(row["exercise_id"])
            path = (
                dataset_root
                / "2d_joints"
                / f"Ex{exercise_id}"
                / f"{row['video_id']}-{_camera(row)}-30fps.npy"
            )
            skeleton = cache.get(path)
            if skeleton is None:
                skeleton = read_joint_array(path)
                cache[path] = skeleton
            first = int(row["first_frame"])
            last = min(int(row["last_frame"]), skeleton.shape[0] - 1)
            examples.append(
                Example(
                    exercise_id=exercise_id,
                    person_id=int(row["person_id"]),
                    label=int(row["correctness"]),
                    features=extract_features(skeleton.point, first, last),
                )
            )
    return examples


def squared_distance(left: list[float], right: list[float]) -> float:
    return sum((a - b) ** 2 for a, b in zip(left, right, strict=True))


def standardization(rows: list[list[float]]) -> tuple[list[float], list[float]]:
    means = [sum(values) / len(rows) for values in zip(*rows, strict=True)]
    deviations = []
    for index, mean in enumerate(means):
        variance = sum((row[index] - mean) ** 2 for row in rows) / len(rows)
        deviations.append(max(math.sqrt(variance), 1e-9))
    return means, deviations


def standardize(
    features: list[float], means: list[float], deviations: list[float]
) -> list[float]:
    return [
        (value - mean) / deviation
        for value, mean, deviation in zip(features, means, deviations, strict=True)
    ]


def predict_knn(
    features: list[float], train: list[tuple[int, list[float]]], neighbors: int = 5
) -> int:
    nearest = sorted(
        train, key=lambda item: squared_distance(features, item[1])
    )[:neighbors]
    correct = sum(label for label, _features in nearest)
    return 1 if correct > len(nearest) / 2 else 0


def train_and_evaluate(examples: list[Example]) -> dict[str, Any]:
    results: dict[str, Any] = {}

    for exercise_id, exercise_slug in EXERCISES.items():
        exercise_examples = [item for item in examples if item.exercise_id == exercise_id]
        matrix = {"tp": 0, "tn": 0, "fp": 0, "fn": 0}
        evaluated_people: list[int] = []
        for person_id in sorted({item.person_id for item in exercise_examples}):
            train_fold = [item for item in exercise_examples if item.person_id != person_id]
            test_fold = [item for item in exercise_examples if item.person_id == person_id]
            if not test_fold or {item.label for item in train_fold} != {0, 1}:
                continue
            means, deviations = standardization([item.features for item in train_fold])
            standardized_train = [
                (item.label, standardize(item.features, means, deviations))
                for item in train_fold
            ]
            evaluated_people.append(person_id)
            for item in test_fold:
                prediction = predict_knn(
                    standardize(item.features, means, deviations), standardized_train
                )
                key = {
                    (1, 1): "tp",
                    (0, 0): "tn",
                    (0, 1): "fp",
                    (1, 0): "fn",
                }[(item.label, prediction)]
                matrix[key] += 1

        total = sum(matrix.values())
        accuracy = (matrix["tp"] + matrix["tn"]) / total if total else math.nan
        sensitivity_denominator = matrix["tp"] + matrix["fn"]
        specificity_denominator = matrix["tn"] + matrix["fp"]
        results[exercise_slug] = {
            "examples": len(exercise_examples),
            "evaluation": "leave-one-subject-out cross-validation",
            "evaluated_person_ids": evaluated_people,
            "confusion_matrix": matrix,
            "accuracy": accuracy,
            "sensitivity": matrix["tp"] / sensitivity_denominator
            if sensitivity_denominator
            else None,
            "specificity": matrix["tn"] / specificity_denominator
            if specificity_denominator
            else None,
        }
    return results


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("dataset_root", type=Path)
    parser.add_argument("output", type=Path)
    arguments = parser.parse_args()
    examples = load_examples(arguments.dataset_root)
    result = {
        "dataset": "REHAB24-6",
        "dataset_doi": "10.5281/zenodo.13305826",
        "method": "front-view normalized 2D skeleton standardized 5-nearest-neighbor baseline",
        "release_status": "research_only",
        "examples_after_quality_filter": len(examples),
        "exercises": train_and_evaluate(examples),
    }
    arguments.output.parent.mkdir(parents=True, exist_ok=True)
    arguments.output.write_text(json.dumps(result, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
