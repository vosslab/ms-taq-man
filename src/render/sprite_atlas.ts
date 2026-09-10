import { directions, vectors } from "../game/coords";
import type { Direction } from "../game/coords";
import { sprites } from "../art/sprites_generated";
import type { SpriteName } from "../art/sprites_generated";
export function loadSprites(): {
  get: (name: SpriteName, direction?: Direction) => ImageBitmap | undefined;
  resize: (ratio: number) => void;
  dispose: () => void;
} {
  const atlas = new Map<string, ImageBitmap>();
  let generation = 0;
  let currentRatio = 0;
  let disposed = false;
  async function load(
    name: SpriteName,
    ratio: number,
    version: number,
    direction?: Direction,
  ): Promise<void> {
    const key = direction ? `${name}:${direction}` : name;
    const image = new Image();
    image.src = `data:image/svg+xml,${encodeURIComponent(spriteMarkup(name, direction))}`;
    await image.decode();
    const raster = document.createElement("canvas");
    raster.width = Math.ceil(image.naturalWidth * ratio);
    raster.height = Math.ceil(image.naturalHeight * ratio);
    const context = raster.getContext("2d");
    if (!context) throw new Error("Sprite canvas unavailable");
    context.drawImage(image, 0, 0, raster.width, raster.height);
    const bitmap = await createImageBitmap(raster);
    if (disposed || version !== generation) {
      bitmap.close();
      return;
    }
    atlas.get(key)?.close();
    atlas.set(key, bitmap);
  }
  function resize(ratio: number): void {
    if (disposed || currentRatio === ratio) return;
    currentRatio = ratio;
    const version = ++generation;
    for (const name of Object.keys(sprites)) {
      if (!isSpriteName(name)) continue;
      const variants = sprites[name].includes('id="direction_pupils"') ? directions : [undefined];
      for (const direction of variants)
        void load(name, ratio, version, direction).catch((error: unknown) => {
          window.reportError(error);
        });
    }
  }
  resize(window.devicePixelRatio || 1);
  return {
    get: (name, direction) => atlas.get(`${name}:${direction ?? "right"}`) ?? atlas.get(name),
    resize,
    dispose: (): void => {
      disposed = true;
      generation++;
      for (const bitmap of atlas.values()) bitmap.close();
      atlas.clear();
    },
  };
}
function isSpriteName(name: string): name is SpriteName {
  return Object.prototype.hasOwnProperty.call(sprites, name);
}
export function reagentSprite(name: string): SpriteName {
  switch (name) {
    case "dNTP mix":
      return "reagent_dntp";
    case "BSA":
      return "reagent_bsa";
    case "DMSO":
      return "reagent_dmso";
    case "betaine":
      return "reagent_betaine";
    case "hot-start antibody":
      return "reagent_antibody";
    case "glycerol":
      return "reagent_glycerol";
    default:
      return "reagent_magnesium";
  }
}

export function spriteMarkup(name: SpriteName, direction?: Direction): string {
  if (!direction) return sprites[name];
  const offset = vectors[direction];
  return sprites[name].replace(
    'id="direction_pupils"',
    `id="direction_pupils" transform="translate(${offset.x * 2.5} ${offset.y * 2.5})"`,
  );
}
