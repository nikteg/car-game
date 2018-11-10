import * as PIXI from "pixi.js";
import "planck-js";

// @ts-ignore
import * as planck from "planck-js";

console.log(window);

const {
  Vec2,
  World,
  Edge,
  Circle,
  Box,
  RevoluteJoint,
  WheelJoint,
  Polygon
} = planck;

export const actors = [];

const HZ = 8.0;
const ZETA = 0.7;
const LINE_WIDTH = 1;

const pscale = 30;

export function mpx(m) {
  return m * pscale;
}

export function pxm(p) {
  return p / pscale;
}

export function createWorld(verticalGravity = 10) {
  return new World({ gravity: Vec2(0, -verticalGravity) });
}

export function createGround(world, x = 0, y = 0) {
  const body = world.createBody(Vec2(x, y));

  const groundGraphics = new PIXI.Graphics();
  groundGraphics.body = body;
  groundGraphics.moveTo(mpx(x), mpx(y));
  actors.push(groundGraphics);

  const groundFD = {
    density: 0,
    friction: 0.8
  };

  return [
    body,
    (x1, y1, x2, y2) => {
      body.createFixture(Edge(Vec2(x1, y1), Vec2(x2, y2)), groundFD);
      const edgeGraphics = new PIXI.Graphics();
      edgeGraphics.lineStyle(LINE_WIDTH, 0xffffff);
      edgeGraphics.moveTo(mpx(x1), mpx(y1));
      edgeGraphics.lineTo(mpx(x2), mpx(y2));

      groundGraphics.addChild(edgeGraphics);
    }
  ];
}

export function createBridge(world, ground) {
  const bridgeFD = { density: 1, friction: 0.6 };

  let prevBody = ground;
  for (let i = 0; i < 20; ++i) {
    const bridgeBlock = world.createDynamicBody(Vec2(161.0 + 2.0 * i, -10.125));
    bridgeBlock.createFixture(Box(1, 0.125), bridgeFD);

    const edgeGraphics = new PIXI.Graphics();
    edgeGraphics.body = bridgeBlock;
    edgeGraphics.lineStyle(LINE_WIDTH * 8, 0xffffff, 0.2);
    edgeGraphics.moveTo(mpx(-1), mpx(0.125));
    edgeGraphics.lineTo(mpx(1), mpx(0.125));

    actors.push(edgeGraphics);

    world.createJoint(
      RevoluteJoint({}, prevBody, bridgeBlock, Vec2(160.0 + 2.0 * i, -10.125))
    );

    prevBody = bridgeBlock;
  }

  world.createJoint(
    RevoluteJoint({}, prevBody, ground, Vec2(160.0 + 2.0 * 20, -10.125))
  );
}

/**
 *
 * @param {planck.World} world
 * @param {number} x
 * @param {number} y
 */
export function createMotorcycle(world, x, y) {
  const body = world.createDynamicBody(Vec2(x, y));

  body.createFixture(Box(0.75, 0.25), 1);

  const bodyGraphics = new PIXI.Graphics();
  bodyGraphics.body = body;
  bodyGraphics.lineStyle(LINE_WIDTH, 0xffffff);
  bodyGraphics.beginFill(0);
  bodyGraphics.drawPolygon([
    mpx(-0.75),
    mpx(-0.25),
    mpx(0.75),
    mpx(-0.25),
    mpx(0.75),
    mpx(0.15),
    mpx(-0.75),
    mpx(0.5)
  ]);
  bodyGraphics.closePath();
  bodyGraphics.drawRect(mpx(-1), mpx(0.4), mpx(0.5), mpx(0.15));
  bodyGraphics.endFill();

  actors.push(bodyGraphics);

  const wheelFD = {
    density: 1,
    friction: 1
  };
  // wheelFD.restitution = 0.7;

  const wheelBack = world.createDynamicBody(Vec2(x - 0.6, y - 0.5));
  wheelBack.createFixture(Circle(0.4), wheelFD);

  const wheelBackGraphics = new PIXI.Graphics();
  wheelBackGraphics.body = wheelBack;
  wheelBackGraphics.moveTo(mpx(x), mpx(y));
  wheelBackGraphics.beginFill(0);
  wheelBackGraphics.lineStyle(LINE_WIDTH, 0xffffff);
  wheelBackGraphics.drawCircle(0, 0, mpx(0.4));
  wheelBackGraphics.drawCircle(0, 0, mpx(0.3));
  for (let i = 0; i < 12; ++i) {
    wheelBackGraphics.moveTo(
      Math.cos((((360 / 12) * Math.PI) / 180) * i) * mpx(0.3),
      Math.sin((((360 / 12) * Math.PI) / 180) * i) * mpx(0.3)
    );
    wheelBackGraphics.lineTo(
      Math.cos((((360 / 12) * Math.PI) / 180) * i) * mpx(0.4),
      Math.sin((((360 / 12) * Math.PI) / 180) * i) * mpx(0.4)
    );
  }
  wheelBackGraphics.endFill();
  actors.push(wheelBackGraphics);

  const wheelFront = world.createDynamicBody(Vec2(x + 0.8, y - 0.3));
  wheelFront.createFixture(Circle(0.4), wheelFD);

  const wheelFrontGraphics = new PIXI.Graphics();
  wheelFrontGraphics.body = wheelFront;
  wheelFrontGraphics.moveTo(mpx(x), mpx(y));
  wheelFrontGraphics.beginFill(0);
  wheelFrontGraphics.lineStyle(LINE_WIDTH, 0xffffff);
  wheelFrontGraphics.drawCircle(0, 0, mpx(0.4));
  wheelFrontGraphics.drawCircle(0, 0, mpx(0.3));
  for (let i = 0; i < 12; ++i) {
    wheelFrontGraphics.moveTo(
      Math.cos((((360 / 12) * Math.PI) / 180) * i) * mpx(0.3),
      Math.sin((((360 / 12) * Math.PI) / 180) * i) * mpx(0.3)
    );
    wheelFrontGraphics.lineTo(
      Math.cos((((360 / 12) * Math.PI) / 180) * i) * mpx(0.4),
      Math.sin((((360 / 12) * Math.PI) / 180) * i) * mpx(0.4)
    );
  }
  wheelFrontGraphics.endFill();
  actors.push(wheelFrontGraphics);

  const springBack = world.createJoint(
    WheelJoint(
      {
        motorSpeed: 0,
        maxMotorTorque: 50.0,
        // enableLimit: true,
        enableMotor: true,
        frequencyHz: HZ,
        dampingRatio: ZETA
      },
      body,
      wheelBack,
      wheelBack.getPosition(),
      Vec2(0, 0.4)
    )
  );

  world.createJoint(
    WheelJoint(
      {
        motorSpeed: 0.0,
        maxMotorTorque: 40.0,
        enableMotor: false,
        frequencyHz: HZ,
        dampingRatio: ZETA
      },
      body,
      wheelFront,
      wheelFront.getPosition(),
      Vec2(0.8, 0.4)
    )
  );

  return [body, springBack];
}
