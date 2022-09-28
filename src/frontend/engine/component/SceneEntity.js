import { Component } from './Component.js'
import { Vec2 } from '%util/Vec2.js'
import { Renderable } from '%graphics/Renderable.js'
import { global } from '%engine/Global.js'
import matter from 'matter-js'
const { Body } = matter

const VERTEX_DATA = [-1, -1, 0, 0, 1, -1, 1, 0, 1, 1, 1, 1, -1, 1, 0, 1]
const INDEX_DATA = [0, 1, 2, 0, 2, 3]
class SceneEntityOptions {
  constructor({
    vertices = VERTEX_DATA,
    indices = INDEX_DATA,
    isStatic = true,
    scale = 1,
  } = {}) {
    this.vertices = vertices
    this.indices = indices
    this.isStatic = isStatic
    this.scale = scale
  }
}

// base class for everything that exists in the scene
export class SceneEntity extends Component {
  constructor(gameWindow, pos, frameTime, urls, options = {}) {
    super('SceneEntity')
    this.ops = new SceneEntityOptions(options)
    const vertexData = this.ops.vertices,
      indexData = this.ops.indices
    this.renderable = new Renderable(
      gameWindow.gl,
      pos,
      gameWindow.shaderProgram,
      vertexData,
      indexData,
      frameTime,
      urls,
      { scale: this.ops.scale }
    )

    this.minX = Infinity
    this.maxX = -Infinity
    this.minY = Infinity
    this.maxY = -Infinity
    for (var i = 0; i < vertexData.length; i += 4) {
      this.minX = Math.min(this.minX, vertexData[i])
      this.maxX = Math.max(this.maxX, vertexData[i])
      this.minY = Math.min(this.minY, vertexData[i + 1])
      this.maxY = Math.max(this.maxY, vertexData[i + 1])
    }

    this.pos = pos
    this.createPhysicsProxy()
  }
  createPhysicsProxy() {
    this.dim = new Vec2(this.maxX - this.minX, this.maxY - this.minY).scale(
      this.ops.scale
    )
    this.physicsProxy = global.physicsEngine.createRect(
      this.pos.plus(this.dim.scale(0.5)),
      this.dim,
      {
        isStatic: this.ops.isStatic,
        friction: 0,
      }
    )
    this.physicsProxy._owner = this
    /**
     * @HATODO for platformers?
     */
    // Body.setCentre(
    //   this.physicsProxy,
    //   { x: -this.dim.x / 2, y: this.dim.y / 2 },
    //   true
    // )
  }
  setScale(scale) {
    if (scale === this.ops.scale) return

    this.ops.scale = scale
    this.renderable.setScale(scale)
    global.physicsEngine.deleteRect(this.physicsProxy)
    this.createPhysicsProxy()
  }
}

export class DynamicSceneEntity extends SceneEntity {
  constructor(gameWindow, pos, frameTime, urls, options = {}) {
    super(gameWindow, pos, frameTime, urls, { isStatic: false, ...options })
    const v = options.vel || new Vec2(0, 0)
    Body.setVelocity(this.physicsProxy, { x: v.x, y: v.y })
  }
  move() {
    // copy position from physics simulation
    const { position } = this.physicsProxy
    this.pos.x = position.x
    this.pos.y = position.y

    this.renderable.setTransform(this.pos)
  }
  applyForce(f) {
    Body.applyForce(this.physicsProxy, this.physicsProxy.position, f)
  }
  setVelocity(v) {
    Body.setVelocity(this.physicsProxy, { x: v.x, y: v.y })
  }
  setVelocityX(x) {
    Body.setVelocity(this.physicsProxy, {
      x: x,
      y: this.physicsProxy.velocity.y,
    })
  }
}

export class ControlledSceneEntity extends DynamicSceneEntity {
  constructor(gameWindow, pos, frameTime, urls, behavior, options = {}) {
    super(gameWindow, pos, frameTime, urls, options)
    this.behavior = behavior
  }
  addScript(script) {
    this.behavior.scripts.push(script)
  }
  removeScript(script) {
    const i = this.behavior.scripts.indexOf(script)
    if (i !== -1) {
      this.behavior.scripts.splice(i, 1)
    }
  }
  runBehavior(event, ...data) {
    this.behavior.run(this, event, ...data)
  }
}
