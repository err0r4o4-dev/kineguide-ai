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

export function PoseOverlay({ snapshot }: { snapshot: PoseTrackingSnapshot }) {
  const { bounds, landmarks, status, unreliableLandmarks } = snapshot
  if (!landmarks || !bounds) return null

  const isReady = status === 'ready'
  const stroke = isReady ? '#34d399' : '#fbbf24'
  const unreliable = new Set(unreliableLandmarks)

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full [transform:scaleX(-1)]"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <rect
        fill="none"
        height={bounds.height * SVG_SCALE}
        rx="2.5"
        stroke={stroke}
        strokeDasharray={isReady ? undefined : '2 1.5'}
        strokeWidth="1.25"
        width={bounds.width * SVG_SCALE}
        x={bounds.x * SVG_SCALE}
        y={bounds.y * SVG_SCALE}
      />
      {CONNECTIONS.map(([start, end]) => {
        const from = landmarks[start]
        const to = landmarks[end]
        if (!from || !to || unreliable.has(start) || unreliable.has(end)) {
          return null
        }
        return (
          <line
            key={`${start}-${end}`}
            stroke={stroke}
            strokeLinecap="round"
            strokeWidth="2"
            x1={from.x * SVG_SCALE}
            x2={to.x * SVG_SCALE}
            y1={from.y * SVG_SCALE}
            y2={to.y * SVG_SCALE}
          />
        )
      })}
      {landmarks.map((landmark, index) =>
        (landmark.visibility ?? 0) >= 0.5 ? (
          <circle
            cx={landmark.x * SVG_SCALE}
            cy={landmark.y * SVG_SCALE}
            fill={unreliable.has(index) ? '#fbbf24' : '#f8fafc'}
            key={index}
            r="1.15"
            stroke={stroke}
            strokeWidth="0.65"
          />
        ) : null
      )}
    </svg>
  )
}
