import * as planck from "planck"

declare module "pixi.js" {
  interface Graphics {
    body: planck.Body
  }
}
