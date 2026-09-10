import type { Maze } from "../game/maze";

export function paintMaze(
  context: CanvasRenderingContext2D,
  maze: Maze,
  size: number,
  backbone: string,
): void {
  context.clearRect(0, 0, maze.width * size, maze.height * size);
  context.strokeStyle = backbone;
  context.fillStyle = "#102839";
  context.lineWidth = 1.5;
  const edges = new Map<string, { x: number; y: number }>();
  function wall(x: number, y: number): boolean {
    return maze.rows[y]?.[x] === "#";
  }
  function edge(x: number, y: number, endX: number, endY: number): void {
    edges.set(`${x},${y}`, { x: endX, y: endY });
  }
  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      if (maze.rows[y]?.[x] !== "#") continue;
      if (!wall(x, y - 1)) edge(x, y, x + 1, y);
      if (!wall(x + 1, y)) edge(x + 1, y, x + 1, y + 1);
      if (!wall(x, y + 1)) edge(x + 1, y + 1, x, y + 1);
      if (!wall(x - 1, y)) edge(x, y + 1, x, y);
    }
  }
  context.beginPath();
  while (edges.size) {
    const start = edges.keys().next().value;
    if (start === undefined) break;
    let key = start;
    const points: { x: number; y: number }[] = [];
    do {
      const next = edges.get(key);
      if (!next) break;
      edges.delete(key);
      points.push({ x: next.x * size, y: next.y * size });
      key = `${next.x},${next.y}`;
    } while (key !== start);
    const corners = points.filter((point, index) => {
      const before = points[(index + points.length - 1) % points.length];
      const after = points[(index + 1) % points.length];
      return (
        before &&
        after &&
        (point.x - before.x) * (after.y - point.y) !== (point.y - before.y) * (after.x - point.x)
      );
    });
    for (const [index, point] of corners.entries()) {
      const before = corners[(index + corners.length - 1) % corners.length];
      const after = corners[(index + 1) % corners.length];
      if (!before || !after) continue;
      const radius = 5;
      const incoming = {
        x: point.x + Math.sign(before.x - point.x) * radius,
        y: point.y + Math.sign(before.y - point.y) * radius,
      };
      const outgoing = {
        x: point.x + Math.sign(after.x - point.x) * radius,
        y: point.y + Math.sign(after.y - point.y) * radius,
      };
      if (index === 0) context.moveTo(incoming.x, incoming.y);
      else context.lineTo(incoming.x, incoming.y);
      context.quadraticCurveTo(point.x, point.y, outgoing.x, outgoing.y);
    }
    context.closePath();
  }
  context.fill("evenodd");
  context.stroke();
}
