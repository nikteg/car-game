import setupKeyboard, { keyCodes } from "./keyboard.js";
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
container.scale.set(0.1);

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

const world = new World({
  gravity: Vec2(0, -10)
});

const SPEED = 15.0;

const ground = world.createBody(Vec2(0, -10));

const groundFD = {
  density: 0.0,
  friction: 0.6
};

ground.createFixture(Edge(Vec2(-20.0, 0.0), Vec2(20.0, 0.0)), groundFD);

const hs = [0.25, 1.0, 4.0, 0.0, 0.0, -1.0, -2.0, -2.0, -1.25, 0.0];

let x = 20.0,
  y1 = 0.0,
  dx = 5.0;

for (let i = 0; i < 10; ++i) {
  const y2 = hs[i];
  ground.createFixture(Edge(Vec2(x, y1), Vec2(x + dx, y2)), groundFD);
  y1 = y2;
  x += dx;
}

for (let i = 0; i < 10; ++i) {
  const y2 = hs[i];
  ground.createFixture(Edge(Vec2(x, y1), Vec2(x + dx, y2)), groundFD);
  y1 = y2;
  x += dx;
}

ground.createFixture(Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);

x += 80.0;
ground.createFixture(Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);

x += 40.0;
ground.createFixture(Edge(Vec2(x, 0.0), Vec2(x + 10.0, 5.0)), groundFD);

x += 20.0;
ground.createFixture(Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);

x += 40.0;
ground.createFixture(Edge(Vec2(x, 0.0), Vec2(x, 20.0)), groundFD);

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

const g = new PIXI.Graphics();

container.addChild(g);
container.x = 300;
container.y = 200;

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

  // if (window._keys[keyCodes["LEFT"]]) {
  //   car.applyAngularImpulse(7);
  // } else if (window._keys[keyCodes["RIGHT"]]) {
  //   car.applyAngularImpulse(-7);
  // }

  g.clear();
  g.lineStyle(4, 0xffffff);
  // g.beginFill(0x5cafe2);
  for (let b = world.getBodyList(); b; b = b.getNext()) {
    for (let f = b.getFixtureList(); f; f = f.getNext()) {
      const type = f.getType();
      const shape = f.getShape();
      const { x, y } = b.getPosition();
      const angle = b.getAngle();
      // console.log(type);

      // console.log(b.getPosition());

      // if (x && y) {
      //   g.x = x;
      //   g.y = y;
      // }

      // g.rotation = angle * Math.PI;

      // g.rotation = -angle;

      if (type === "polygon") {
        // TODO: Fix angle rotation
        g.moveTo(
          mpx(x + shape.m_vertices[0].x),
          mpx(-y - shape.m_vertices[0].y)
        );
        for (let i = 1; i < shape.m_vertices.length; i++) {
          g.lineTo(
            mpx(x + shape.m_vertices[i].x),
            mpx(-y - shape.m_vertices[i].y)
          );
        }
        g.closePath();
        // g.stroke();
        // g.drawPolygon([0, 0, 10, 0, 10, 10, 0, 10]);
      } else if (type === "edge") {
        // console.log(shape);
        g.moveTo(mpx(x + shape.m_vertex1.x), mpx(-y - shape.m_vertex1.y));
        g.lineTo(mpx(x + shape.m_vertex2.x), mpx(-y - shape.m_vertex2.y));
      } else if (type === "circle") {
        g.drawCircle(mpx(x), mpx(-y), mpx(shape.m_radius));
      }
    }
  }
  g.endFill();

  app.render();
}

app.ticker.add(function(delta) {
  gameLoop(delta);
});

setTimeout(() => {
  // app.stop();
}, 1500);

// setInterval(() => gameLoop(1), 1000);
