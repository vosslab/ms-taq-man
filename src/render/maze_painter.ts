import type { ReadOnly } from "../game/read_only";
import type { Maze } from "../game/maze";

export function paintMaze(
  context: CanvasRenderingContext2D,
  maze: ReadOnly<Maze>,
  size: number,
  backbone: string,
): void {
  context.clearRect(0, 0, maze.width * size, maze.height * size);
  context.strokeStyle = backbone;
  context.fillStyle = "#102839";
  context.lineWidth = 1.5;
  const edges = new Map<string, { x: number; y: number }[]>();
  function wall(x: number, y: number): boolean {
    return maze.rows[y]?.[x] === "#";
  }
  function edge(x: number, y: number, endX: number, endY: number): void {
    const key = `${x},${y}`;
    const outgoing = edges.get(key) ?? [];
    outgoing.push({ x: endX, y: endY });
    edges.set(key, outgoing);
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
    let heading: { x: number; y: number } | undefined;
    const points: { x: number; y: number }[] = [];
    do {
      const outgoing = edges.get(key);
      if (!outgoing?.length) break;
      const [x = 0, y = 0] = key.split(",").map(Number);
      // Keep wall material on the right at diagonal contacts. Each boundary
      // must survive even when several edges share the same grid vertex.
      const incoming = heading;
      let choice = 0;
      if (incoming && outgoing.length > 1) {
        choice = outgoing.findIndex(
          (end) => incoming.x * (end.y - y) - incoming.y * (end.x - x) > 0,
        );
        if (choice < 0) choice = 0;
      }
      const next = outgoing.splice(choice, 1)[0];
      if (!next) break;
      if (!outgoing.length) edges.delete(key);
      heading = { x: next.x - x, y: next.y - y };
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
  paintEnzymeHouse(context, maze, size, backbone);
}

function paintEnzymeHouse(
  context: CanvasRenderingContext2D,
  maze: ReadOnly<Maze>,
  size: number,
  backbone: string,
): void {
  let doorX: number | undefined;
  let doorY: number | undefined;
  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      if (maze.rows[y]?.[x] !== "-") continue;
      doorX = x;
      doorY = y;
    }
  }
  if (doorX === undefined || doorY === undefined) return;

  const width = size * 3;
  const height = size * 2;
  const centerX = (doorX + 0.5) * size;
  const left = centerX - width / 2;
  const right = left + width;
  const top = (doorY + 0.22) * size;
  const bottom = top + height;
  const corner = size * 0.22;
  const doorwayHalfWidth = size * 0.34;
  const doorwayHeight = size * 0.76;

  context.save();
  context.fillStyle = "#081323";
  context.fillRect(left, top, width, height);
  context.fillStyle = "#030812";
  context.fillRect(centerX - doorwayHalfWidth, top - 1, doorwayHalfWidth * 2, doorwayHeight);
  context.strokeStyle = backbone;
  context.lineWidth = 2.2;
  context.beginPath();
  context.moveTo(left + corner, top);
  context.lineTo(centerX - doorwayHalfWidth, top);
  context.moveTo(centerX + doorwayHalfWidth, top);
  context.lineTo(right - corner, top);
  context.quadraticCurveTo(right, top, right, top + corner);
  context.lineTo(right, bottom - corner);
  context.quadraticCurveTo(right, bottom, right - corner, bottom);
  context.lineTo(left + corner, bottom);
  context.quadraticCurveTo(left, bottom, left, bottom - corner);
  context.lineTo(left, top + corner);
  context.quadraticCurveTo(left, top, left + corner, top);
  context.stroke();
  context.strokeStyle = "#ffdc70";
  context.lineWidth = 1.4;
  context.beginPath();
  context.moveTo(centerX - doorwayHalfWidth, top + doorwayHeight);
  context.lineTo(centerX + doorwayHalfWidth, top + doorwayHeight);
  context.stroke();
  context.restore();
}
