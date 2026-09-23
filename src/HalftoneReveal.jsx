import { useRef, useState } from 'react'
import './HalftoneReveal.css'

export default function HalftoneReveal({
  // firstImage is the live-action frame revealed through the interaction;
  // secondImage is the 3D frame shown as the default top layer.
  firstImage,
  secondImage,
  firstLabel,
  secondLabel,
  firstAlt,
  secondAlt,
  mobileFirstImage,
  mobileSecondImage,
}) {
  const [active, setActive] = useState(false)
  const [point, setPoint] = useState({ x: 50, y: 50 })
  const touchPointerRef = useRef(false)

  const updatePoint = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setPoint({
      x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100)),
    })
  }

  const handlePointerDown = (event) => {
    updatePoint(event)
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      touchPointerRef.current = true
      setActive(true)
      event.currentTarget.setPointerCapture?.(event.pointerId)
    }
  }

  const handlePointerUp = (event) => {
    // Use the final touch position so a tap or a short drag always places
    // the circular viewer exactly where the person intended on a phone.
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      updatePoint(event)
      setActive(true)
      event.currentTarget.releasePointerCapture?.(event.pointerId)
    }
  }

  const handlePointerMove = (event) => {
    updatePoint(event)
    if (event.pointerType === 'touch' || event.pointerType === 'pen') setActive(true)
  }

  return (
    <div
      className={`halftoneReveal${active ? ' is-revealed' : ''}`}
      style={{ '--reveal-x': `${point.x}%`, '--reveal-y': `${point.y}%` }}
      tabIndex={0}
      role="button"
      aria-label={`${firstLabel}。触碰查看${secondLabel}`}
      onPointerDown={handlePointerDown}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') {
          updatePoint(event)
          setActive(true)
        }
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setActive(false)
      }}
      onClick={(event) => {
        // Pointer interaction handles mouse hover and touch directly. Keep
        // click for keyboard activation without immediately cancelling a
        // touch reveal through the synthetic click that follows a tap.
        if (touchPointerRef.current) {
          touchPointerRef.current = false
          return
        }
        if (event.detail === 0) setActive((value) => !value)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
        }
      }}
    >
      <div className="halftoneRevealLayer halftoneRevealLayer--base">
        <picture>
          {mobileSecondImage ? <source media="(max-width: 640px)" srcSet={mobileSecondImage} /> : null}
          <img src={secondImage} alt={secondAlt} loading="lazy" decoding="async" draggable={false} />
        </picture>
      </div>
      <div className="halftoneRevealRevealWrap" aria-hidden={!active}>
        <div className="halftoneRevealLayer halftoneRevealLayer--reveal">
          <picture>
            {mobileFirstImage ? <source media="(max-width: 640px)" srcSet={mobileFirstImage} /> : null}
            <img src={firstImage} alt={firstAlt} loading="lazy" decoding="async" draggable={false} />
          </picture>
        </div>
      </div>
      <div className="halftoneRevealFrame" aria-hidden="true" />
      <div className="halftoneRevealLabels">
        <span className="halftoneRevealLabel halftoneRevealLabel--first">{firstLabel}</span>
        <span className="halftoneRevealLabel halftoneRevealLabel--second">{secondLabel}</span>
      </div>
      <span className="halftoneRevealHint">HOVER / TAP TO REVEAL</span>
    </div>
  )
}
