import { useEffect, useRef } from 'react'
import BrandMark from './BrandMark'
import { Icon } from './Icons'
import './mobile-nav.css'

const links = [['work', '作品'], ['about', '关于'], ['contact', '联系我']]

export default function MobileNav({ section, open, onOpenChange, onBack, backLabel, disabled }) {
  const root = useRef(null)
  const toggle = useRef(null)
  const panel = useRef(null)
  const focusFrame = useRef(0)

  useEffect(() => () => cancelAnimationFrame(focusFrame.current), [])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const frame = requestAnimationFrame(() => panel.current?.querySelector('a')?.focus({ preventScroll: true }))
    const key = event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onOpenChange(false)
        toggle.current?.focus({ preventScroll: true })
      }
      if (event.key !== 'Tab') return
      const controls = [...root.current.querySelectorAll('a[href], button:not([disabled])')]
        .filter(element => element.tabIndex >= 0 && element.getClientRects().length)
      const first = controls[0]
      const last = controls.at(-1)
      if (event.shiftKey && (document.activeElement === first || !root.current.contains(document.activeElement))) {
        event.preventDefault(); last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus()
      }
    }
    document.addEventListener('keydown', key)
    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', key)
    }
  }, [open, onOpenChange])

  const followMenuLink = event => {
    const staysHere = event.currentTarget.hash === location.hash
    onOpenChange(false)
    cancelAnimationFrame(focusFrame.current)
    if (staysHere && open) focusFrame.current = requestAnimationFrame(() => toggle.current?.focus({ preventScroll: true }))
  }

  return <div ref={root} className="m-nav-root" data-menu-open={open ? '' : undefined} inert={disabled}>
    <button type="button" tabIndex={-1} className="m-menu-backdrop" aria-label="关闭导航菜单"
      aria-hidden={!open} inert={!open} onClick={() => { onOpenChange(false); toggle.current?.focus() }}/>
    <header className="m-header m-nav-bar">
      <button type="button" className="m-home-return" aria-label={backLabel}
        onClick={() => { onOpenChange(false); onBack() }}><BrandMark/></button>
      <a className="m-nav-contact" href="#contact" onClick={followMenuLink}>
        <span>联系我</span><Icon name="diagonal"/>
      </a>
      <button ref={toggle} type="button" className="m-menu-toggle" aria-label={open ? '关闭导航菜单' : '打开导航菜单'}
        aria-controls="mobile-menu" aria-expanded={open} onClick={() => onOpenChange(!open)}>
        <span className="m-menu-symbol" aria-hidden="true"><i/><i/></span>
      </button>
    </header>
    <nav ref={panel} id="mobile-menu" className="m-menu-panel" aria-label="主导航" aria-hidden={!open} inert={!open}>
      {links.map(([id, title], index) => <a href={`#${id}`} key={id} style={{ '--menu-index': index }}
        aria-current={section === id ? 'page' : undefined} onClick={followMenuLink}>
        <span>{title}</span><Icon name="diagonal"/>
      </a>)}
    </nav>
  </div>
}
