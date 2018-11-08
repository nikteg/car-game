import * as PIXI from "pixi.js";
import * as planck from "planck-js";

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

export const bodies = [];
export const actors = {};

const pscale = 20;

function mpx(m) {
  return m * pscale;
}

function pxm(p) {
  return p / pscale;
}

export function createWorld(verticalGravity = 10) {
  return new World({ gravity: Vec2(0, -verticalGravity) });
}

export function createGround(world, x = 0, y = 0) {
  const ground = world.createBody(Vec2(x, y));

  // bodies.push(ground);
  // actors[ground] = [];

  const groundFD = {
    density: 0,
    friction: 0.8
  };

  return (x1, y1, x2, y2) => {
    ground.createFixture(Edge(Vec2(x1, y1), Vec2(x2, y2)), groundFD);
  };
}

function createEdge(context, x1, y1, x2, y2, options = {}) {
  context.createFixture(Edge(Vec2(x1, y1), Vec2(x2, y2)), options);
}

function createEdge(context, x1, y1, x2, y2, options = {}) {
  context.createFixture(Edge(Vec2(x1, y1), Vec2(x2, y2)), options);
}
