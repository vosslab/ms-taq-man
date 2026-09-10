import { sprites } from "../art/sprites_generated";
import type { SpriteName } from "../art/sprites_generated";
export function loadSprites(): Map<SpriteName, HTMLImageElement> {
  const atlas = new Map<SpriteName, HTMLImageElement>();
  function load(name: SpriteName): void {
    const image = new Image();
    image.src = `data:image/svg+xml,${encodeURIComponent(sprites[name])}`;
    atlas.set(name, image);
  }
  load("taq_man");
  load("primer");
  load("exo");
  load("dimer");
  load("chelate");
  load("rnase");
  load("reagent_magnesium");
  return atlas;
}
