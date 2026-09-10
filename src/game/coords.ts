declare const xBrand: unique symbol;
declare const yBrand: unique symbol;
declare const edgeBrand: unique symbol;
export type TileX = number & { readonly [xBrand]: true };
export type TileY = number & { readonly [yBrand]: true };
export type EdgeId = string & { readonly [edgeBrand]: true };
export type Direction = "up" | "left" | "down" | "right";
export type Tile = { x: TileX; y: TileY };
export const directions: readonly Direction[] = ["up", "left", "down", "right"];
export const vectors: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  left: { x: -1, y: 0 },
  down: { x: 0, y: 1 },
  right: { x: 1, y: 0 },
};
export const opposite: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};
export function tile(x: number, y: number): Tile {
  return { x: x as TileX, y: y as TileY };
}
export function tileKey(position: Tile): string {
  return `${position.x},${position.y}`;
}
export function edgeId(a: Tile, b: Tile): EdgeId {
  const keys = [tileKey(a), tileKey(b)].sort();
  return keys.join(":") as EdgeId;
}
export function pixelCenter(value: number, size: number): number {
  return (value + 0.5) * size;
}
export function wrap(value: number, width: number): number {
  return ((value % width) + width) % width;
}
