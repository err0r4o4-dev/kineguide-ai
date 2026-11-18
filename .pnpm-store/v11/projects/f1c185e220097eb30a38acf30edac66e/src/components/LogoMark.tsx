export function LogoMark({
  className = 'size-10',
  labelled = false
}: {
  className?: string
  labelled?: boolean
}) {
  return (
    <img
      alt={labelled ? 'KineGuide AI' : ''}
      className={`shrink-0 ${className}`}
      src="/logo.svg"
    />
  )
}
