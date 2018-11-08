import setupKeyboard, { keyCodes } from "./keyboard.js";
import { createGround, createWorld, bodies } from "./creators.js";
import * as PIXI from "pixi.js";
import * as planck from "planck-js";

import "./style.css";

PIXI.utils.skipHello();

setupKeyboard();

const pscale = 100;

function mpx(m) {
  return m * pscale;
}

function pxm(p) {
  return p / pscale;
}

const renderOptions = {
  backgroundColor: 0x000000,
  autoResize: true,
  resolution: window.devicePixelRatio,
  antialias: true
};

const app = new PIXI.Application(renderOptions);
app.renderer.resize(document.body.clientWidth, document.body.clientHeight);
document.body.appendChild(app.view);

window.addEventListener("resize", () => {
  app.renderer.resize(document.body.clientWidth, document.body.clientHeight);
});

const container = new PIXI.Container();
app.stage.addChild(container);
// container.scale.set(0.1);

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

const SPEED = 15.0;

const world = createWorld(10);

function createLevel(world) {
  const addGroundFixture = createGround(world, 0, -10);
  const fixtureContainer = new PIXI.Container();
  fixtureContainer.x = 0;
  fixtureContainer.y = 10;

  function addFixture(x1, y1, x2, y2) {
    addGroundFixture(x1, y1, x2, y2);
    const g = new PIXI.Graphics();
    g.lineStyle(2, 0xffffff);
    g.moveTo(x1, -y1);
    g.lineTo(x2, -y2);

    fixtureContainer.addChild(g);
  }

  addFixture(-20, 0, 20, 0);

  const hs = [0.25, 1.0, 4.0, 0.0, 0.0, -1.0, -2.0, -2.0, -1.25, 0.0];

  let x = 20.0;
  let y1 = 0.0;
  let dx = 5.0;

  for (let i = 0; i < 10; ++i) {
    const y2 = hs[i];
    addFixture(x, y1, x + dx, y2);
    y1 = y2;
    x += dx;
  }

  for (let i = 0; i < 10; ++i) {
    const y2 = hs[i];
    addFixture(x, y1, x + dx, y2);
    y1 = y2;
    x += dx;
  }

  addFixture(x, 0.0, x + 40.0, 0.0);

  x += 80.0;
  addFixture(x, 0.0, x + 40.0, 0.0);

  x += 40.0;
  addFixture(x, 0.0, x + 10.0, 5.0);

  x += 20.0;
  addFixture(x, 0.0, x + 40.0, 0.0);

  x += 40.0;
  addFixture(x, 0.0, x, 20.0);

  return fixtureContainer;
}

container.addChild(createLevel(world));

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
const box = Box(0.5, 0.5);

// world.createDynamicBody(Vec2(230.0, 0.5)).createFixture(box, 0.5);

// world.createDynamicBody(Vec2(230.0, 1.5)).createFixture(box, 0.5);

// world.createDynamicBody(Vec2(230.0, 2.5)).createFixture(box, 0.5);

// world.createDynamicBody(Vec2(230.0, 3.5)).createFixture(box, 0.5);

// world.createDynamicBody(Vec2(230.0, 4.5)).createFixture(box, 0.5);

const car = world.createDynamicBody(Vec2(0.0, 1.0));
car.createFixture(
  Polygon([
    Vec2(0, 7),
    Vec2(6, 7),
    Vec2(7, 5),
    Vec2(6, 4),
    Vec2(2, 4),
    Vec2(1, 5)
  ]),
  0.5
);

// const carGraphics = new PIXI.Graphics();
// carGraphics.body = car;
// carGraphics.beginFill(0xffffff);
// carGraphics.drawCircle(10, 10, 20);
// carGraphics.endFill();

// app.stage.addChild(carGraphics);

const wheelFD = {};
wheelFD.density = 0.4;
wheelFD.friction = 1;
wheelFD.restitution = 0.5;

const wheelBack = world.createDynamicBody(Vec2(1, 5));
wheelBack.createFixture(Circle(1.5), wheelFD);

const wheelFront = world.createDynamicBody(Vec2(7, 5));
wheelFront.createFixture(Circle(1.5), wheelFD);

const springBack = world.createJoint(
  WheelJoint(
    {
      motorSpeed: 0,
      maxMotorTorque: 500.0,
      enableLimit: true,
      enableMotor: true
    },
    car,
    wheelBack,
    wheelBack.getPosition(),
    Vec2(0.0, 1.0)
  )
);

world.createJoint(
  WheelJoint(
    {
      motorSpeed: 0.0,
      maxMotorTorque: 40.0,
      enableMotor: false
    },
    car,
    wheelFront,
    wheelFront.getPosition(),
    Vec2(0.0, 1.0)
  )
);

// gameLoop();

function gameLoop(delta) {
  world.step(1 / 60);

  if (window._keys[keyCodes["UP"]]) {
    springBack.enableMotor(true);
    springBack.setMotorSpeed(-SPEED);
  } else if (window._keys[keyCodes["DOWN"]]) {
    springBack.enableMotor(true);
    springBack.setMotorSpeed(+SPEED);
  } else {
    // springBack.setMotorSpeed(0);
    // springBack.enableMotor(false);
  }

  if (window._keys[keyCodes["LEFT"]]) {
    car.applyAngularImpulse(7);
  } else if (window._keys[keyCodes["RIGHT"]]) {
    car.applyAngularImpulse(-7);
  }

  // for (let body of bodies) {
  //   body
  // }

  app.render();
}

app.ticker.add(function(delta) {
  gameLoop(delta);
});

setTimeout(() => {
  app.stop();
}, 1500);

// setInterval(() => gameLoop(1), 1000);
