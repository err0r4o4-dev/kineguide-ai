import type { PoseTrackingSnapshot } from './usePoseTracking'

const CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 7],
  [0, 4],
  [4, 5],
  [5, 6],
  [6, 8],
  [9, 10],
  [11, 12],
  [11, 13],
  [13, 15],
  [15, 17],
  [15, 19],
  [15, 21],
  [17, 19],
  [12, 14],
  [14, 16],
  [16, 18],
  [16, 20],
  [16, 22],
  [18, 20],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [24, 26],
  [25, 27],
  [26, 28],
  [27, 29],
  [28, 30],
  [29, 31],
  [30, 32],
  [27, 31],
  [28, 32]
] as const

const SVG_SCALE = 100
// A stricter display gate suppresses unstable self-occluded side-view points.
// It does not change pose classification or exercise feedback.
const DISPLAY_VISIBILITY_GATE = 0.5
// Pose landmarks 0-10 are a coarse face approximation. The dedicated face
// mesh below owns facial rendering so these marks are intentionally omitted.
const FIRST_BODY_LANDMARK = 11

const HAND_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17]
] as const

function chain(indices: readonly number[]) {
  return indices.slice(1).map((end, index) => [indices[index], end] as const)
}

const FACE_FEATURES = [
  chain([
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379,
    378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127,
    162, 21, 54, 103, 67, 109, 10
  ]),
  chain([33, 160, 158, 133, 153, 144, 33]),
  chain([362, 385, 387, 263, 373, 380, 362]),
  chain([70, 63, 105, 66, 107]),
  chain([336, 296, 334, 293, 300]),
  chain([61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 61]),
  chain([168, 6, 197, 195, 5, 4, 1, 2]),
  chain([98, 97, 2, 326, 327])
] as const

function LandmarkLines({
  connections,
  landmarks,
  stroke,
  width
}: {
  connections: readonly (readonly [number, number])[]
  landmarks: readonly { x: number; y: number }[]
  stroke: string
  width: number
}) {
  return connections.map(([start, end]) => {
    const from = landmarks[start]
    const to = landmarks[end]
    if (!from || !to) return null
    return (
      <line
        key={`${start}-${end}`}
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={width}
        x1={from.x * SVG_SCALE}
        x2={to.x * SVG_SCALE}
        y1={from.y * SVG_SCALE}
        y2={to.y * SVG_SCALE}
      />
    )
  })
}

export function PoseOverlay({ snapshot }: { snapshot: PoseTrackingSnapshot }) {
  const {
    blink,
    bounds,
    faceLandmarks,
    landmarks,
    leftHandLandmarks,
    rightHandLandmarks,
    status,
    unreliableLandmarks
  } = snapshot
  if (!landmarks || !bounds) return null

  const bodyStroke = status === 'ready' ? '#5eead4' : '#fbbf24'
  const unreliable = new Set(unreliableLandmarks)

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full [transform:scaleX(-1)]"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <g data-overlay="body">
        {CONNECTIONS.map(([start, end]) => {
          if (start < FIRST_BODY_LANDMARK || end < FIRST_BODY_LANDMARK) {
            return null
          }
          const from = landmarks[start]
          const to = landmarks[end]
          if (!from || !to || unreliable.has(start) || unreliable.has(end)) {
            return null
          }
          if (
            (from.visibility ?? 0) < DISPLAY_VISIBILITY_GATE ||
            (to.visibility ?? 0) < DISPLAY_VISIBILITY_GATE
          ) {
            return null
          }
          return (
            <line
              data-body-connection={`${start}-${end}`}
              key={`${start}-${end}`}
              stroke={bodyStroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.72"
              x1={from.x * SVG_SCALE}
              x2={to.x * SVG_SCALE}
              y1={from.y * SVG_SCALE}
              y2={to.y * SVG_SCALE}
            />
          )
        })}
        {landmarks.map((landmark, index) =>
          index >= FIRST_BODY_LANDMARK &&
          (landmark.visibility ?? 0) >= DISPLAY_VISIBILITY_GATE ? (
            <circle
              cx={landmark.x * SVG_SCALE}
              cy={landmark.y * SVG_SCALE}
              data-body-landmark={index}
              fill={unreliable.has(index) ? '#fbbf24' : bodyStroke}
              key={index}
              r="0.45"
              stroke="#f8fafc"
              strokeWidth="0.18"
            />
          ) : null
        )}
      </g>
      {faceLandmarks && (
        <g
          data-blink={blink?.detected ? 'detected' : 'open'}
          data-overlay="face"
        >
          {FACE_FEATURES.map((connections, index) => (
            <LandmarkLines
              connections={connections}
              key={index}
              landmarks={faceLandmarks}
              stroke={
                blink?.detected && (index === 1 || index === 2)
                  ? '#fbbf24'
                  : '#5eead4'
              }
              width={index === 0 ? 0.55 : 0.4}
            />
          ))}
          {[1, 4, 33, 133, 263, 362].map((index) => {
            const point = faceLandmarks[index]
            return point ? (
              <circle
                cx={point.x * SVG_SCALE}
                cy={point.y * SVG_SCALE}
                fill="#f8fafc"
                key={index}
                r="0.48"
                stroke="#0f766e"
                strokeWidth="0.22"
              />
            ) : null
          })}
        </g>
      )}
      {[leftHandLandmarks, rightHandLandmarks].map((hand, index) =>
        hand ? (
          <g data-overlay="hand" key={index}>
            <LandmarkLines
              connections={HAND_CONNECTIONS}
              landmarks={hand}
              stroke="#0f172a"
              width={1.35}
            />
            <LandmarkLines
              connections={HAND_CONNECTIONS}
              landmarks={hand}
              stroke="#5eead4"
              width={0.72}
            />
            {hand.map((point, pointIndex) => (
              <circle
                cx={point.x * SVG_SCALE}
                cy={point.y * SVG_SCALE}
                fill="#f8fafc"
                key={pointIndex}
                r="0.45"
              />
            ))}
          </g>
        ) : null
      )}
    </svg>
  )
}
