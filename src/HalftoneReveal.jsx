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
  const touchGestureRef = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    mode: 'tap',
    hasCapture: false,
  })

  const isTouchPointer = (event) => event.pointerType === 'touch' || event.pointerType === 'pen'

  const updatePoint = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setPoint({
      x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100)),
    })
  }

  const handlePointerDown = (event) => {
    if (isTouchPointer(event)) {
      touchGestureRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        mode: 'tap',
        hasCapture: false,
      }
      // Move the lens immediately on a tap, but do not capture the pointer
      // yet. Capturing on touchstart can prevent the browser from handing a
      // vertical swipe back to page scrolling, which made the lower part of
      // this mobile frame feel untouchable.
      updatePoint(event)
      setActive(true)
      return
    }
    updatePoint(event)
  }

  const handlePointerUp = (event) => {
    if (isTouchPointer(event)) {
      const gesture = touchGestureRef.current
      if (gesture.pointerId !== event.pointerId) return

      // A tap, or a deliberate horizontal drag, moves the lens. A vertical
      // gesture belongs to the page and must not move the lens while the
      // browser scrolls past this section.
      if (gesture.mode !== 'scroll') {
        if (gesture.mode === 'drag') event.preventDefault()
        updatePoint(event)
        setActive(true)
      }
      touchGestureRef.current.pointerId = null
      if (gesture.hasCapture) {
        event.currentTarget.releasePointerCapture?.(event.pointerId)
      }
      return
    }
    updatePoint(event)
  }

  const handlePointerMove = (event) => {
    if (isTouchPointer(event)) {
      const gesture = touchGestureRef.current
      if (gesture.pointerId !== event.pointerId) return

      const deltaX = event.clientX - gesture.startX
      const deltaY = event.clientY - gesture.startY
      if (gesture.mode === 'tap' && Math.max(Math.abs(deltaX), Math.abs(deltaY)) > 10) {
        gesture.mode = Math.abs(deltaX) >= Math.abs(deltaY) ? 'drag' : 'scroll'
        if (gesture.mode === 'drag') {
          event.currentTarget.setPointerCapture?.(event.pointerId)
          gesture.hasCapture = true
        }
      }

      if (gesture.mode === 'drag') {
        event.preventDefault()
        updatePoint(event)
        setActive(true)
      }
      return
    }
    updatePoint(event)
  }

  const handlePointerCancel = (event) => {
    if (touchGestureRef.current.pointerId === event.pointerId) {
      const gesture = touchGestureRef.current
      touchGestureRef.current.pointerId = null
      if (gesture.hasCapture) {
        event.currentTarget.releasePointerCapture?.(event.pointerId)
      }
    }
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
      onPointerCancel={handlePointerCancel}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setActive(false)
      }}
      onClick={(event) => {
        // Pointer interaction handles mouse and touch directly. Keep click
        // for keyboard activation only, so the synthetic click after a tap
        // cannot move the lens a second time.
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
