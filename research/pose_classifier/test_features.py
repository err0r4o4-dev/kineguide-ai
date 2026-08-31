import unittest

from research.pose_classifier.features import FRAME_COUNT, JOINT_INDICES, extract_features


class FeatureTests(unittest.TestCase):
    def test_normalizes_to_hip_origin_and_torso_scale(self) -> None:
        def point(frame: int, joint: int) -> tuple[float, float]:
            if joint == 0:
                return (10.0 + frame, 20.0)
            if joint == 3:
                return (10.0 + frame, 30.0)
            return (10.0 + frame + joint, 20.0 + joint)

        features = extract_features(point, 0, 31)

        self.assertEqual(len(features), FRAME_COUNT * len(JOINT_INDICES) * 2)
        self.assertAlmostEqual(features[0], 0.0)
        self.assertAlmostEqual(features[1], 1.0)

    def test_rejects_empty_ranges(self) -> None:
        with self.assertRaises(ValueError):
            extract_features(lambda _frame, _joint: (0.0, 0.0), 2, 2)


if __name__ == "__main__":
    unittest.main()
