import { Layer } from '%window/Layer.js'
import { Varying } from '%component/Varying.js'
import { global } from '%engine/Global.js'
import { ScriptGraphVisualizer } from './ScriptGraphVisualizer.js'

export class EditorLayer extends Layer {
  constructor(window, game, playerScript) {
    super('EditorLayer')
    this.game = game
    this.paused = false
    this.textSize = new Varying(75, 100, -1, { step: 0.5 })
    this.textTheta = new Varying(-Math.PI / 16, Math.PI / 16, -1, {
      step: 0.33,
    })
    this.showDebug = true
    this.fps = 0
    /**
     * @HATODO hack
     */
    this.graphvis = new ScriptGraphVisualizer(window.canvas.ctx, playerScript)
    this.graphvis.arrangeX()
    this.graphvis.arrangeY()
  }
  onAppTick(e) {
    if (!this.paused) {
      this.game.update(e.deltaTime)
      this.fps = 1000 / e.deltaTime
    }
    return false
  }
  onKeyDown(e) {
    if (!e.repeat) {
      switch (e.key) {
        case 'Escape':
          this.paused ^= 1
          break
        case '`':
          this.showDebug ^= 1
          break
      }
    }
  }
  onRender(e) {
    this.game.draw(e.renderer)
    this.graphvis.draw(e.renderer, 100, 100)

    if (this.showDebug) {
      e.renderer.drawText(
        `FPS: ${parseInt(this.fps)}`,
        10,
        10,
        'Courier',
        20,
        '#0f0'
      )
    }

    if (this.paused) {
      const cw = global.canvas.targetWidth,
        ch = global.canvas.targetHeight
      e.renderer.drawRect(0, 0, cw, ch, '#000', { alpha: 0.5 })
      e.renderer.drawCenteredText(
        'PAUSED',
        cw / 2,
        ch / 2,
        'Courier',
        this.textSize.getValue(),
        '#0f0',
        { theta: this.textTheta.getValue() }
      )
    }
  }
}
