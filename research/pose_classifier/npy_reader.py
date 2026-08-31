"""Minimal NumPy v1 reader for REHAB24-6 float64 C-order arrays.

This avoids adding a runtime dependency to any KineGuide production service.
"""

from __future__ import annotations

import ast
import struct
from array import array
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class JointArray:
    shape: tuple[int, int, int]
    values: array[float]

    def point(self, frame: int, joint: int) -> tuple[float, float]:
        frames, joints, coordinates = self.shape
        if not 0 <= frame < frames or not 0 <= joint < joints or coordinates != 2:
            raise IndexError("joint coordinate is outside the array")
        offset = (frame * joints + joint) * coordinates
        return self.values[offset], self.values[offset + 1]


def read_joint_array(path: Path) -> JointArray:
    with path.open("rb") as source:
        if source.read(6) != b"\x93NUMPY":
            raise ValueError("not a NumPy array")
        version = tuple(source.read(2))
        if version != (1, 0):
            raise ValueError(f"unsupported NumPy version: {version}")
        header_size = struct.unpack("<H", source.read(2))[0]
        header = ast.literal_eval(source.read(header_size).decode("latin1").strip())
        if header.get("descr") != "<f8" or header.get("fortran_order") is not False:
            raise ValueError("expected little-endian float64 C-order data")
        shape = header.get("shape")
        if not isinstance(shape, tuple) or len(shape) != 3 or shape[1:] != (26, 2):
            raise ValueError(f"unexpected skeleton shape: {shape}")
        values = array("d")
        values.fromfile(source, shape[0] * shape[1] * shape[2])
        if len(values) != shape[0] * shape[1] * shape[2]:
            raise ValueError("truncated NumPy array")
        return JointArray(shape=shape, values=values)
