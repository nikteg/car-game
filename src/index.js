import setupKeyboard, { keyCodes } from "./keyboard.js"
import { createGround, createWorld, createMotorcycle, mpx, actors, createBridge } from "./creators.js"
import * as PIXI from "pixi.js"
import Stats from "stats.js"

import "./style.css"

// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.dispose(() => {
    window.location.reload()
    throw "whatever"
  })
}

PIXI.utils.skipHello()

setupKeyboard()

const renderOptions = {
  backgroundColor: 0x000000,
  autoResize: true,
  resolution: 1,
  antialias: true,
}

const app = new PIXI.Application(renderOptions)
app.renderer.resize(document.body.clientWidth, document.body.clientHeight)
document.body.appendChild(app.view)

window.addEventListener("resize", () => {
  app.renderer.resize(document.body.clientWidth, document.body.clientHeight)
})

const container = new PIXI.Container()
app.stage.addChild(container)
container.scale.x = 1
container.scale.y = 1
container.scale.y = -container.scale.y // Invert because of physics
container.position.set(app.renderer.screen.width / 2, app.renderer.screen.height / 2)

const SPEED = 50.0
const ROTATE_SPEED = 0.1

const world = createWorld(10)

function createLevel(world) {
  const { body: ground, addGroundFixture } = createGround(world, 0, -10)

  addGroundFixture(-20, 0, 20, 0)

  const hs = [0.25, 1.0, 4.0, 0.0, 0.0, -1.0, -2.0, -2.0, -1.25, 0.0]

  let x = 20.0
  let y1 = 0.0
  let dx = 5.0

  for (let i = 0; i < 10; ++i) {
    const y2 = hs[i]
    addGroundFixture(x, y1, x + dx, y2)
    y1 = y2
    x += dx
  }

  for (let i = 0; i < 10; ++i) {
    const y2 = hs[i]
    addGroundFixture(x, y1, x + dx, y2)
    y1 = y2
    x += dx
  }

  addGroundFixture(x, 0.0, x + 40.0, 0.0)

  x += 80.0
  addGroundFixture(x, 0.0, x + 40.0, 0.0)

  x += 40.0
  addGroundFixture(x, 0.0, x + 10.0, 5.0)

  x += 20.0
  addGroundFixture(x, 0.0, x + 40.0, 0.0)

  x += 40.0
  addGroundFixture(x, 0.0, x, 20.0)

  createBridge(world, ground)
}

createLevel(world)

const { body: motorcycle, springBack: motorcycleSpringBack } = createMotorcycle(world, 0, -8, 0x4db6ac)
const { body: motorcycle2, springBack: motorcycle2SpringBack } = createMotorcycle(world, 4, -8, 0xe57373)

// Teeter
// const teeter = world.createDynamicBody(Vec2(140.0, 1.0));
// teeter.createFixture(Box(10.0, 0.25), 1.0);
// world.createJoint(
//   RevoluteJoint(
//     {
//       lowerAngle: (-8.0 * Math.PI) / 180.0,
//       upperAngle: (8.0 * Math.PI) / 180.0,
//       enableLimit: true
//     },
//     ground,
//     teeter,
//     teeter.getPosition()
//   )
// );

// teeter.applyAngularImpulse(100.0, true);

// Bridge
// const bridgeFD = {};
// bridgeFD.density = 1.0;
// bridgeFD.friction = 0.6;

// let prevBody = ground;
// for (let i = 0; i < 20; ++i) {
//   const bridgeBlock = world.createDynamicBody(Vec2(161.0 + 2.0 * i, -0.125));
//   bridgeBlock.createFixture(Box(1.0, 0.125), bridgeFD);

//   world.createJoint(
//     RevoluteJoint({}, prevBody, bridgeBlock, Vec2(160.0 + 2.0 * i, -0.125))
//   );

//   prevBody = bridgeBlock;
// }

// world.createJoint(
//   RevoluteJoint({}, prevBody, ground, Vec2(160.0 + 2.0 * 20, -0.125))
// );

// Boxes
// const box = Box(0.5, 0.5);

// world.createDynamicBody(Vec2(230.0, 0.5)).createFixture(box, 0.5);

// world.createDynamicBody(Vec2(230.0, 1.5)).createFixture(box, 0.5);

// world.createDynamicBody(Vec2(230.0, 2.5)).createFixture(box, 0.5);

// world.createDynamicBody(Vec2(230.0, 3.5)).createFixture(box, 0.5);

// world.createDynamicBody(Vec2(230.0, 4.5)).createFixture(box, 0.5);
for (let actor of actors) {
  container.addChild(actor)
}

var stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

function inputLoop() {
  if (window._keys[keyCodes["UP"]]) {
    motorcycleSpringBack.enableMotor(true)
    motorcycleSpringBack.setMotorSpeed(-SPEED)
  } else if (window._keys[keyCodes["DOWN"]]) {
    motorcycleSpringBack.enableMotor(true)
    motorcycleSpringBack.setMotorSpeed(+SPEED)
  } else {
    motorcycleSpringBack.setMotorSpeed(0)
    motorcycleSpringBack.enableMotor(false)
  }

  if (window._keys[keyCodes["W"]]) {
    motorcycle2SpringBack.enableMotor(true)
    motorcycle2SpringBack.setMotorSpeed(-SPEED)
  } else if (window._keys[keyCodes["S"]]) {
    motorcycle2SpringBack.enableMotor(true)
    motorcycle2SpringBack.setMotorSpeed(+SPEED)
  } else {
    motorcycle2SpringBack.setMotorSpeed(0)
    motorcycle2SpringBack.enableMotor(false)
  }

  if (window._keys[keyCodes["SPACE"]]) {
    if (app.ticker.started) {
      app.ticker.stop()
    } else {
      app.ticker.start()
    }
  }

  if (window._keys[keyCodes["LEFT"]]) {
    motorcycle.applyAngularImpulse(ROTATE_SPEED)
  } else if (window._keys[keyCodes["RIGHT"]]) {
    motorcycle.applyAngularImpulse(-ROTATE_SPEED)
  }
  if (window._keys[keyCodes["A"]]) {
    motorcycle2.applyAngularImpulse(ROTATE_SPEED)
  } else if (window._keys[keyCodes["D"]]) {
    motorcycle2.applyAngularImpulse(-ROTATE_SPEED)
  }
}

function physicsLoop() {
  world.step(1 / 60, app.ticker.elapsedMS / 1000)
}

function renderLoop() {
  stats.begin()

  for (let actor of actors) {
    const { x, y } = actor.body.getPosition()
    const angle = actor.body.getAngle()
    actor.position.x = mpx(x)
    actor.position.y = mpx(y)
    actor.rotation = angle
  }

  const { x, y } = motorcycle.getPosition()

  container.pivot.x = (mpx(x) - container.pivot.x) * 0.1 + container.pivot.x
  container.pivot.y = (mpx(y) - container.pivot.y) * 0.1 + container.pivot.y

  stats.end()
}

const inputTicker = new PIXI.ticker.Ticker()
inputTicker.autoStart = true
inputTicker.add(function(delta) {
  inputLoop()
})

app.ticker.add(function(delta) {
  physicsLoop()
  renderLoop()
})

setTimeout(() => {
  // app.stop();
}, 1500)

// setInterval(() => gameLoop(1), 1000);
