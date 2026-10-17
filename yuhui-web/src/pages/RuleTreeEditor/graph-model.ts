/** Geometry is independent of React, storage and network requests. */
export type Position = { x: number; y: number };
type Node = API.RuleTreeNodeItem & Position & { isEntry: boolean };
type Edge = API.RuleTreeNodeLineItem & {
  fromX: number; fromY: number; toX: number; toY: number;
  labelX: number; labelY: number;
};
export const NODE_WIDTH = 196;
export const NODE_HEIGHT = 152;
const margin = 48;
const columnStep = 240;
const rowStep = 210;

function indexRules(nodes: Node[]) {
  const result = new Map<string, Node>();
  for (const node of nodes) if (node.ruleName) result.set(String(node.ruleName), node);
  return result;
}

function assignColumns(entry: string, nodes: API.RuleTreeNodeItem[], lines: API.RuleTreeNodeLineItem[]) {
  const columns = new Map<string, number>();
  const outgoing = new Map<string, API.RuleTreeNodeLineItem[]>();
  for (const edge of lines) {
    const key = edge.ruleNodeFrom;
    if (!key) continue;
    const edges = outgoing.get(key) || [];
    edges.push(edge);
    outgoing.set(key, edges);
  }
  // Preserve longest reachable path placement and input order for existing DAGs.
  const pending = entry ? [entry] : [];
  if (entry) columns.set(entry, 0);
  for (let cursor = 0; cursor < pending.length; cursor++) {
    const source = pending[cursor];
    for (const edge of outgoing.get(source) || []) {
      const target = String(edge.ruleNodeTo || '');
      const depth = columns.get(source)! + 1;
      if (target && (!columns.has(target) || columns.get(target)! < depth)) {
        columns.set(target, depth);
        pending.push(target);
      }
    }
  }
  let nextColumn = columns.size ? Math.max(...columns.values()) + 1 : 0;
  for (const node of nodes) {
    const rule = String(node.ruleName || '');
    if (rule && !columns.has(rule)) columns.set(rule, nextColumn++);
  }
  return columns;
}

function placeNodes(tree: API.RuleTreeItem | undefined, nodes: API.RuleTreeNodeItem[], columns: Map<string, number>, saved: Record<string, Position>): Node[] {
  const rows = new Map<number, API.RuleTreeNodeItem[]>();
  for (const node of nodes) {
    const column = columns.get(String(node.ruleName || '')) || 0;
    const group = rows.get(column) || [];
    group.push(node);
    rows.set(column, group);
  }
  return [...rows.keys()].sort((a, b) => a - b).flatMap(column =>
    rows.get(column)!.sort((a, b) => String(a.ruleName || '').localeCompare(String(b.ruleName || '')))
      .map((node, row) => {
        const position = node.id ? saved[String(node.id)] : undefined;
        return { ...node, x: position?.x ?? margin + column * columnStep,
          y: position?.y ?? margin + row * rowStep, isEntry: node.ruleName === tree?.treeNodeRuleKey };
      }),
  );
}

function clearBypassLanes(nodes: Node[], lines: API.RuleTreeNodeLineItem[], columns: Map<string, number>, saved: Record<string, Position>) {
  const byRule = indexRules(nodes);
  for (const line of lines) {
    const a = String(line.ruleNodeFrom || '');
    const b = String(line.ruleNodeTo || '');
    const from = byRule.get(a), to = byRule.get(b);
    const start = columns.get(a), end = columns.get(b);
    if (!from || !to || start === undefined || end === undefined || Math.abs(end - start) <= 1) continue;
    const left = Math.min(from.x + NODE_WIDTH, to.x);
    const right = Math.max(from.x + NODE_WIDTH, to.x);
    const laneY = (from.y + NODE_HEIGHT / 2 + to.y + NODE_HEIGHT / 2) / 2;
    for (const node of nodes) {
      if (!node.id || saved[String(node.id)] || node.ruleName === a || node.ruleName === b) continue;
      const depth = columns.get(String(node.ruleName || ''));
      if (depth === undefined || depth <= Math.min(start, end) || depth >= Math.max(start, end)) continue;
      const x = node.x + NODE_WIDTH / 2;
      if (x > left && x < right && Math.abs(node.y + NODE_HEIGHT / 2 - laneY) < NODE_HEIGHT * 0.75) node.y += rowStep;
    }
  }
}

function routeEdges(lines: API.RuleTreeNodeLineItem[], nodes: Node[]): Edge[] {
  const byRule = indexRules(nodes);
  const edges: Edge[] = [];
  for (const line of lines) {
    const from = byRule.get(String(line.ruleNodeFrom || ''));
    const to = byRule.get(String(line.ruleNodeTo || ''));
    if (!from || !to) continue;
    const fromX = from.x + NODE_WIDTH, fromY = from.y + NODE_HEIGHT / 2;
    const toX = to.x, toY = to.y + NODE_HEIGHT / 2;
    edges.push({ ...line, fromX, fromY, toX, toY, labelX: (fromX + toX) / 2, labelY: (fromY + toY) / 2 - 18 });
  }
  const clusters: Edge[][] = [];
  for (const edge of [...edges].sort((a, b) => (a.labelY - b.labelY) || (a.labelX - b.labelX))) {
    const cluster = clusters.find(group => group.some(other => Math.abs(other.labelX - edge.labelX) < 180 && Math.abs(other.labelY - edge.labelY) < 42));
    if (cluster) cluster.push(edge);
    else clusters.push([edge]);
  }
  for (const cluster of clusters) {
    if (cluster.length < 2) continue;
    cluster.sort((a, b) => a.labelX - b.labelX).forEach((edge, index) => {
      edge.labelY += (index % 2 ? 1 : -1) * (Math.floor(index / 2) + 1) * 28;
    });
  }
  return edges;
}

export function layoutGraph(tree: API.RuleTreeItem | undefined, nodes: API.RuleTreeNodeItem[], lines: API.RuleTreeNodeLineItem[], positions: Record<string, Position>) {
  const columns = assignColumns(String(tree?.treeNodeRuleKey || ''), nodes, lines);
  const placed = placeNodes(tree, nodes, columns, positions);
  clearBypassLanes(placed, lines, columns, positions);
  return {
    nodes: placed,
    lines: routeEdges(lines, placed),
    width: Math.max(880, ...placed.map(node => node.x + NODE_WIDTH + margin)),
    height: Math.max(640, ...placed.map(node => node.y + NODE_HEIGHT + margin)),
  };
}
