const sizes = { standard: [390, 844], compact: [375, 812] }
const stage = document.querySelector('#review-stage')
const spacer = document.querySelector('#review-spacer')
const device = document.querySelector('#review-device')
const screen = document.querySelector('#mobile-screen')
const toggle = document.querySelector('#fit-toggle')
const caption = document.querySelector('#review-size')
let selected = 'standard'
let originalSize = false

function fitPhone() {
  const [width, height] = sizes[selected]
  const style = getComputedStyle(stage)
  const availableWidth = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
  const availableHeight = stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
  const scale = originalSize ? 1 : Math.max(.1, Math.min(1, availableWidth / (width + 14), availableHeight / (height + 14)))
  screen.width = width
  screen.height = height
  screen.style.width = `${width}px`
  screen.style.height = `${height}px`
  screen.title = `手机端作品集，${width} × ${height}`
  spacer.style.setProperty('--phone-scale', String(scale))
  device.style.transform = `scale(${scale})`
  spacer.style.width = `${(width + 14) * scale}px`
  spacer.style.height = `${(height + 14) * scale}px`
  caption.textContent = `可视区 ${width} × ${height} · 显示 ${Math.round(scale * 100)}%`
}

document.querySelectorAll('[data-device]').forEach(button => {
  button.addEventListener('click', () => {
    selected = button.dataset.device
    document.querySelectorAll('[data-device]').forEach(item => item.setAttribute('aria-pressed', String(item === button)))
    fitPhone()
  })
})
toggle.addEventListener('click', () => {
  originalSize = !originalSize
  toggle.setAttribute('aria-pressed', String(originalSize))
  toggle.textContent = originalSize ? '适应窗口' : '原尺寸 100%'
  fitPhone()
})
document.querySelector('#home').addEventListener('click', () => {
  screen.src = new URL('./mobile.html?framed=1#home', document.baseURI).href
})
document.querySelector('#reload').addEventListener('click', () => {
  screen.contentWindow.location.reload()
})
new ResizeObserver(fitPhone).observe(stage)
fitPhone()
