import './icons.css'

// A shared 24-unit grid, flat terminals and deliberate gaps keep the controls related.
const paths = {
  right: 'M3 12h12M13 5l7 7-7 7',
  diagonal: 'M5 19 15.5 8.5M6 5h13v13',
  menu: 'M3 5h18M3 12h18M3 19h18',
  close: 'M5 19 19 5M5 5l5 5m4 4 5 5',
  plus: 'M12 3v18M3 12h6m6 0h6',
  home: 'M2 11 12 2l10 9M5 12v9m14-9v9',
  copy: 'M8 3H3v13M8 9V7h13v14H8v-9',
  pause: 'M8 5v14M16 5v14',
  play: 'M7 4l12 8-12 8Z',
}

export function Icon({ name, className = '' }) {
  return <svg className={`ui-icon ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" data-icon={name}>
    {name === 'back'
      ? <path d="M1 16 7.93 9.03 8.99 10.09 3.08 16Z M6.6 14.36H23V16H6.6Z" fill="currentColor"/>
      : <path d={paths[name]} stroke="currentColor" strokeWidth="1.65" strokeLinecap="butt" strokeLinejoin="miter"/>}
  </svg>
}

export function Arrow({ diagonal = false, className = '' }) {
  return <Icon name={diagonal ? 'diagonal' : 'right'} className={`arrow ${className}`}/>
}
