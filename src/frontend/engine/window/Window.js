import {
  KeyDownEvent,
  KeyUpEvent,
  MouseMoveEvent,
  MouseScrollEvent,
  MouseDownEvent,
  MouseUpEvent,
  AppTickEvent,
  RenderEvent,
  ResizeEvent,
} from './Event.js'
import { InputCache } from './InputCache.js'

export class Window {
  constructor(canvas, clearColor) {
    this.layers = []
    this.inputCache = undefined
    this.clearColor = clearColor || undefined
    this.canvas = undefined
    this.setCanvas(canvas)
  }
  clear() {}
  setCanvas(canvas) {
    if (this.canvas === canvas) {
      return
    }

    this.canvas = canvas
    this.inputCache = new InputCache(this.canvas)

    // necessary for key events to get sent to the canvas
    this.canvas.addEventListener('click', () => {
      this.canvas.focus({
        focusVisible: true,
      })
    })
    this.canvas.addEventListener('keydown', (e) => {
      this.propagateEvent('onKeyDown', new KeyDownEvent(e))
    })
    this.canvas.addEventListener('keyup', (e) => {
      this.propagateEvent('onKeyUp', new KeyUpEvent(e))
    })
    this.canvas.addEventListener('pointermove', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const x = e.clientX - Math.floor(rect.x),
        y = e.clientY - Math.floor(rect.y)
      this.propagateEvent('onMouseMove', new MouseMoveEvent(e, x, y))
    })
    this.canvas.addEventListener('pointerdown', (e) => {
      this.canvas.setPointerCapture(e.pointerId)
      this.propagateEvent('onMouseDown', new MouseDownEvent(e))
    })
    this.canvas.addEventListener('pointerup', (e) => {
      this.canvas.releasePointerCapture(e.pointerId)
      this.propagateEvent('onMouseUp', new MouseUpEvent(e))
    })
    this.canvas.addEventListener('wheel', (e) => {
      this.propagateEvent('onMouseScroll', new MouseScrollEvent(e))
    })
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
  }
  pushLayer(layer) {
    this.layers.push(layer)
    layer.window = this
    layer.onAttach()
  }
  removeLayer(layer) {
    this.layers = this.layers.filter((l) => l.debugName !== layer.debugName)
  }
  propagateEvent(fn, e) {
    // start from the top of the layer stack and continue until the event has been handled
    for (var i = this.layers.length - 1; i >= 0; i--)
      if (this.layers[i][fn](e)) break
  }
  propagateResizeEvent() {
    this.propagateEvent(
      'onResize',
      new ResizeEvent(this.canvas.width, this.canvas.height)
    )
  }
  update(deltaTime) {
    // update everything
    this.propagateEvent('onAppTick', new AppTickEvent(deltaTime))
    // draw everything
    this.propagateEvent('onRender', new RenderEvent(this))
  }
}
