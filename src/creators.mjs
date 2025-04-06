import * as PIXI from "pixi.js"
import { World, Vec2, Edge, Box, RevoluteJoint, Circle, WheelJoint } from "planck"

export const actors = []

const CATEGORY_PLAYER = 0x0001 // 0000000000000001 in binary
const CATEGORY_SCENERY = 0x0004 // 0000000000000100 in binary

const HZ = 8.0
const ZETA = 0.7
const LINE_WIDTH = 2

const pscale = 60

export function mpx(m) {
  return m * pscale
}

export function pxm(p) {
  return p / pscale
}

export function createWorld(verticalGravity = 10) {
  return new World({ gravity: new Vec2(0, -verticalGravity) })
}

export function createGround(world, x = 0, y = 0) {
  const body = world.createBody(new Vec2(x, y))

  const groundGraphics = new PIXI.Graphics()
  groundGraphics.body = body
  groundGraphics.moveTo(mpx(x), mpx(y))
  actors.push(groundGraphics)

  const groundFixtureOptions = {
    density: 0,
    friction: 0.8,
    filterCategoryBits: CATEGORY_SCENERY,
  }

  const addGroundFixture = (x1 = 0, y1 = 0, x2 = 0, y2 = 0) => {
    body.createFixture(new Edge(new Vec2(x1, y1), new Vec2(x2, y2)), groundFixtureOptions)
    const edgeGraphics = new PIXI.Graphics()
    edgeGraphics
      .stroke({ width: LINE_WIDTH, color: 0xffffff })
      .moveTo(mpx(x1), mpx(y1))
      .lineTo(mpx(x2), mpx(y2))
      .stroke()

    groundGraphics.addChild(edgeGraphics)
  }

  return { body, addGroundFixture }
}

export function createBridge(world, ground) {
  const bridgeFixtureOptions = {
    density: 1,
    friction: 0.6,
    filterCategoryBits: CATEGORY_SCENERY,
  }

  let prevBody = ground
  for (let i = 0; i < 20; ++i) {
    const bridgeBlock = world.createDynamicBody(new Vec2(161.0 + 2.0 * i, -10.125))
    bridgeBlock.createFixture(new Box(1, 0.125), bridgeFixtureOptions)

    const edgeGraphics = new PIXI.Graphics()
    edgeGraphics.body = bridgeBlock
    edgeGraphics
      .stroke({ width: LINE_WIDTH * 8, color: 0xffffff })
      .moveTo(mpx(-1), mpx(0.125))
      .lineTo(mpx(1), mpx(0.125))
      .stroke()

    actors.push(edgeGraphics)

    world.createJoint(new RevoluteJoint({}, prevBody, bridgeBlock, new Vec2(160.0 + 2.0 * i, -10.125)))

    prevBody = bridgeBlock
  }

  world.createJoint(new RevoluteJoint({}, prevBody, ground, new Vec2(160.0 + 2.0 * 20, -10.125)))
}

export function createMotorcycle(world, x = 0, y = 0, color = 0xffffff) {
  const body = world.createDynamicBody(new Vec2(x, y))

  const bodyFixtureOptions = {
    density: 1,
    filterCategoryBits: CATEGORY_PLAYER,
    filterMaskBits: CATEGORY_SCENERY,
  }
  body.createFixture(new Box(0.75, 0.25), bodyFixtureOptions)

  const bodyGraphics = new PIXI.Graphics()
  bodyGraphics.body = body
  bodyGraphics
    .stroke({ width: LINE_WIDTH, color: color })
    .poly([mpx(-0.75), mpx(-0.25), mpx(0.75), mpx(-0.25), mpx(0.75), mpx(0.15), mpx(-0.75), mpx(0.5)])
    .closePath()
    .rect(mpx(-1), mpx(0.4), mpx(0.5), mpx(0.15))
    .stroke()

  actors.push(bodyGraphics)

  const wheelFixtureOptions = {
    density: 1,
    friction: 1,
    filterCategoryBits: CATEGORY_PLAYER,
    filterMaskBits: CATEGORY_SCENERY,
  }

  const wheelBack = world.createDynamicBody(new Vec2(x - 0.6, y - 0.5))
  wheelBack.createFixture(new Circle(0.4), wheelFixtureOptions)

  const wheelBackGraphics = new PIXI.Graphics()
  wheelBackGraphics.body = wheelBack
  wheelBackGraphics.moveTo(mpx(x), mpx(y))
  wheelBackGraphics.stroke({ width: LINE_WIDTH, color: color }).circle(0, 0, mpx(0.4)).circle(0, 0, mpx(0.3)).stroke()

  for (let i = 0; i < 12; ++i) {
    wheelBackGraphics.moveTo(
      Math.cos((((360 / 12) * Math.PI) / 180) * i) * mpx(0.3),
      Math.sin((((360 / 12) * Math.PI) / 180) * i) * mpx(0.3)
    )
    wheelBackGraphics.lineTo(
      Math.cos((((360 / 12) * Math.PI) / 180) * i) * mpx(0.4),
      Math.sin((((360 / 12) * Math.PI) / 180) * i) * mpx(0.4)
    )
  }
  actors.push(wheelBackGraphics)

  const wheelFront = world.createDynamicBody(new Vec2(x + 0.8, y - 0.3))
  wheelFront.createFixture(new Circle(0.4), wheelFixtureOptions)

  const wheelFrontGraphics = new PIXI.Graphics()
  wheelFrontGraphics.body = wheelFront
  wheelFrontGraphics.moveTo(mpx(x), mpx(y))
  wheelFrontGraphics.stroke({ width: LINE_WIDTH, color: color }).circle(0, 0, mpx(0.4)).circle(0, 0, mpx(0.3)).stroke()
  for (let i = 0; i < 12; ++i) {
    wheelFrontGraphics.moveTo(
      Math.cos((((360 / 12) * Math.PI) / 180) * i) * mpx(0.3),
      Math.sin((((360 / 12) * Math.PI) / 180) * i) * mpx(0.3)
    )
    wheelFrontGraphics.lineTo(
      Math.cos((((360 / 12) * Math.PI) / 180) * i) * mpx(0.4),
      Math.sin((((360 / 12) * Math.PI) / 180) * i) * mpx(0.4)
    )
  }
  actors.push(wheelFrontGraphics)

  const springBack = world.createJoint(
    new WheelJoint(
      {
        motorSpeed: 0,
        maxMotorTorque: 50.0,
        // enableLimit: true,
        enableMotor: true,
        frequencyHz: HZ,
        dampingRatio: ZETA,
      },
      body,
      wheelBack,
      wheelBack.getPosition(),
      new Vec2(0, 0.4)
    )
  )

  world.createJoint(
    new WheelJoint(
      {
        motorSpeed: 0.0,
        maxMotorTorque: 40.0,
        enableMotor: false,
        frequencyHz: HZ,
        dampingRatio: ZETA,
      },
      body,
      wheelFront,
      wheelFront.getPosition(),
      new Vec2(0.8, 0.4)
    )
  )

  return { body, springBack }
}
