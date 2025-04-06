import * as PIXI from "pixi.js"
import { World, Vec2, Edge, Box, RevoluteJoint, Circle, WheelJoint } from "planck"

// const { World, Vec2, Edge, RevoluteJoint, WheelJoint, Box, Circle } = planck

export const actors = []

const CATEGORY_PLAYER = 0x0001 // 0000000000000001 in binary
const CATEGORY_SCENERY = 0x0004 // 0000000000000100 in binary

const HZ = 8.0
const ZETA = 0.7
const LINE_WIDTH = 1

const pscale = 30

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
    body.createFixture(Edge(new Vec2(x1, y1), new Vec2(x2, y2)), groundFixtureOptions)
    const edgeGraphics = new PIXI.Graphics()
    edgeGraphics.stroke({ width: LINE_WIDTH, color: 0xffffff })
    edgeGraphics.moveTo(mpx(x1), mpx(y1))
    edgeGraphics.lineTo(mpx(x2), mpx(y2))

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
    bridgeBlock.createFixture(Box(1, 0.125), bridgeFixtureOptions)

    const edgeGraphics = new PIXI.Graphics()
    edgeGraphics.body = bridgeBlock
    edgeGraphics.stroke({ width: LINE_WIDTH * 8, color: 0xffffff })
    edgeGraphics.moveTo(mpx(-1), mpx(0.125))
    edgeGraphics.lineTo(mpx(1), mpx(0.125))

    actors.push(edgeGraphics)

    world.createJoint(RevoluteJoint({}, prevBody, bridgeBlock, new Vec2(160.0 + 2.0 * i, -10.125)))

    prevBody = bridgeBlock
  }

  world.createJoint(RevoluteJoint({}, prevBody, ground, new Vec2(160.0 + 2.0 * 20, -10.125)))
}

export function createMotorcycle(world, x = 0, y = 0, color = 0xffffff) {
  const body = world.createDynamicBody(new Vec2(x, y))

  const bodyFixtureOptions = {
    density: 1,
    filterCategoryBits: CATEGORY_PLAYER,
    filterMaskBits: CATEGORY_SCENERY,
  }
  body.createFixture(Box(0.75, 0.25), bodyFixtureOptions)

  const bodyGraphics = new PIXI.Graphics()
  bodyGraphics.body = body
  bodyGraphics.stroke({ width: LINE_WIDTH, color: color })
  bodyGraphics.beginFill(0)
  bodyGraphics.drawPolygon([mpx(-0.75), mpx(-0.25), mpx(0.75), mpx(-0.25), mpx(0.75), mpx(0.15), mpx(-0.75), mpx(0.5)])
  bodyGraphics.closePath()
  bodyGraphics.drawRect(mpx(-1), mpx(0.4), mpx(0.5), mpx(0.15))
  bodyGraphics.endFill()

  actors.push(bodyGraphics)

  const wheelFixtureOptions = {
    density: 1,
    friction: 1,
    filterCategoryBits: CATEGORY_PLAYER,
    filterMaskBits: CATEGORY_SCENERY,
  }

  const wheelBack = world.createDynamicBody(new Vec2(x - 0.6, y - 0.5))
  wheelBack.createFixture(Circle(0.4), wheelFixtureOptions)

  const wheelBackGraphics = new PIXI.Graphics()
  wheelBackGraphics.body = wheelBack
  wheelBackGraphics.moveTo(mpx(x), mpx(y))
  wheelBackGraphics.beginFill(0)
  wheelBackGraphics.stroke({ width: LINE_WIDTH, color: color })
  wheelBackGraphics.drawCircle(0, 0, mpx(0.4))
  wheelBackGraphics.drawCircle(0, 0, mpx(0.3))
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
  wheelBackGraphics.endFill()
  actors.push(wheelBackGraphics)

  const wheelFront = world.createDynamicBody(new Vec2(x + 0.8, y - 0.3))
  wheelFront.createFixture(Circle(0.4), wheelFixtureOptions)

  const wheelFrontGraphics = new PIXI.Graphics()
  wheelFrontGraphics.body = wheelFront
  wheelFrontGraphics.moveTo(mpx(x), mpx(y))
  wheelFrontGraphics.beginFill(0)
  wheelFrontGraphics.stroke({ width: LINE_WIDTH, color: color })
  wheelFrontGraphics.drawCircle(0, 0, mpx(0.4))
  wheelFrontGraphics.drawCircle(0, 0, mpx(0.3))
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
  wheelFrontGraphics.endFill()
  actors.push(wheelFrontGraphics)

  const springBack = world.createJoint(
    WheelJoint(
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
    WheelJoint(
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
