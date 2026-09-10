import { directions, vectors } from "../game/coords";
import type { Direction } from "../game/coords";
import { sprites } from "../art/sprites_generated";
import type { SpriteName } from "../art/sprites_generated";

export type SpriteAtlasStatus = {
  generation: number;
  loaded: readonly SpriteName[];
  requested: readonly SpriteName[];
};

export type SpriteAtlas = {
  get: (name: SpriteName, direction?: Direction) => ImageBitmap | undefined;
  ready: () => Promise<void>;
  status: () => SpriteAtlasStatus;
  resize: (ratio: number) => void;
  dispose: () => void;
};

type LoadBatch = {
  generation: number;
  promise: Promise<void>;
  resolve: () => void;
  reject: (error: Error) => void;
  settled: boolean;
};

function createLoadBatch(generation: number): LoadBatch {
  let resolveBatch: (() => void) | undefined;
  let rejectBatch: ((error: Error) => void) | undefined;
  const promise = new Promise<void>((resolve, reject) => {
    resolveBatch = resolve;
    rejectBatch = reject;
  });
  if (!resolveBatch || !rejectBatch) throw new Error("Sprite load batch was not initialized");
  return {
    generation,
    promise,
    resolve: resolveBatch,
    reject: rejectBatch,
    settled: false,
  };
}

function settleBatch(batch: LoadBatch, error?: Error): void {
  if (batch.settled) return;
  batch.settled = true;
  if (error) batch.reject(error);
  else batch.resolve();
}

function reportSpriteError(error: Error): void {
  window.reportError(error);
}

export function loadSprites(): SpriteAtlas {
  const atlas = new Map<string, ImageBitmap>();
  const requested = new Set<SpriteName>();
  let generation = 0;
  let currentRatio = 0;
  let disposed = false;
  let currentBatch = createLoadBatch(generation);
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
    settleBatch(currentBatch);
    const batch = createLoadBatch(version);
    currentBatch = batch;
    const tasks: Promise<void>[] = [];
    for (const name of Object.keys(sprites)) {
      if (!isSpriteName(name)) continue;
      const variants = sprites[name].includes('id="direction_pupils"') ? directions : [undefined];
      for (const direction of variants) tasks.push(load(name, ratio, version, direction));
    }
    void Promise.all(tasks).then(
      () => {
        if (disposed || batch !== currentBatch || version !== generation) return;
        settleBatch(batch);
      },
      (error: unknown) => {
        const loadError = error instanceof Error ? error : new Error("Sprite loading failed");
        if (batch !== currentBatch) return;
        settleBatch(batch, loadError);
      },
    );
    // Production rendering stays non-blocking. Callers that need a complete
    // atlas can await ready().
    void batch.promise.catch(reportSpriteError);
  }
  resize(window.devicePixelRatio || 1);
  async function ready(): Promise<void> {
    while (true) {
      if (disposed) throw new Error("Sprite atlas was disposed before it became ready");
      const batch = currentBatch;
      await batch.promise;
      if (disposed) throw new Error("Sprite atlas was disposed before it became ready");
      if (batch === currentBatch && batch.generation === generation) return;
    }
  }
  function get(name: SpriteName, direction?: Direction): ImageBitmap | undefined {
    const bitmap = atlas.get(`${name}:${direction ?? "right"}`) ?? atlas.get(name);
    if (bitmap) requested.add(name);
    return bitmap;
  }
  function status(): SpriteAtlasStatus {
    const loaded = Object.keys(sprites)
      .filter(isSpriteName)
      .filter((name) => isLoaded(name));
    const sortedLoaded = loaded.sort();
    const sortedRequested = [...requested].sort();
    return { generation, loaded: sortedLoaded, requested: sortedRequested };
  }
  function dispose(): void {
    if (disposed) return;
    disposed = true;
    generation++;
    settleBatch(currentBatch, new Error("Sprite atlas was disposed"));
    for (const bitmap of atlas.values()) bitmap.close();
    atlas.clear();
    requested.clear();
  }
  const spriteAtlas: SpriteAtlas = { get, ready, status, resize, dispose };
  return spriteAtlas;

  function isLoaded(name: SpriteName): boolean {
    if (!sprites[name].includes('id="direction_pupils"')) return atlas.has(name);
    return directions.every((direction) => atlas.has(`${name}:${direction}`));
  }
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
