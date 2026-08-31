# REHAB24-6 research baseline

This package evaluates whether REHAB24-6 can support KineGuide's intended
browser pose flow. It is not a production clinical model.

The pipeline excludes half-profile repetitions, mocap errors, and frames where
another person is visible in the selected front-view camera. It resamples each
repetition to 32 frames, translates joints to the hip origin, scales by torso
length, standardizes each feature using training subjects only, and evaluates an
exercise-specific 5-nearest-neighbor baseline. Evaluation uses leave-one-subject-
out cross-validation, so every prediction is made by a model that has not seen
that participant during training.

Run from the repository root:

```powershell
python -m unittest research.pose_classifier.test_features
python -m research.pose_classifier.train research/datasets/rehab24-6 research/evaluation/rehab24-6-baseline.json
```

The resulting aggregate metrics determine whether any exercise is suitable for
a later browser prototype. They do not establish clinical validity. Dataset and
model artifacts remain excluded from Git.
