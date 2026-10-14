import { history } from '@@/core/history';
import {
  ApartmentOutlined,
  BranchesOutlined,
  DeleteOutlined,
  EditOutlined,
  NodeIndexOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import {
  add_rule_tree_node,
  add_rule_tree_node_line,
  delete_rule_tree_node,
  delete_rule_tree_node_line,
  query_rule_tree,
  query_rule_tree_node_line,
  query_rule_tree_node_one,
  update_rule_tree_node,
  update_rule_tree_node_line,
} from '@/services/api';
import {
  App,
  Button,
  Card,
  Drawer,
  Empty,
  Form,
  Popconfirm,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './index.less';

type Pos = { x: number; y: number };
type PickState = { type: 'tree' | 'node' | 'line'; id: string } | null;
type DragState = { id: string; dx: number; dy: number } | null;
type ConnectState = {
  fromId: string;
  fromRule: string;
  sx: number;
  sy: number;
  x: number;
  y: number;
} | null;
type EditorNode = API.RuleTreeNodeItem & { x: number; y: number; isEntry: boolean };
type EditorEdge = API.RuleTreeNodeLineItem & {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  labelX: number;
  labelY: number;
};
type NodeFormValues = {
  id?: string;
  ruleTreeId?: string;
  ruleName?: string;
  ruleDesc?: string;
  ruleValue?: string;
};
type LineFormValues = {
  id?: string;
  ruleTreeId?: string;
  ruleNodeFrom?: string;
  ruleNodeTo?: string;
  ruleLimitType?: string;
  ruleLimitValue?: string;
};

const W = 196;
const H = 152;
const PX = 48;
const PY = 48;
const CG = 240;
const RG = 210;
const STORE = 'rule-tree-editor-layout';
const NODE_OPTS = [
  { label: 'rule_lock(次数锁)', value: 'rule_lock' },
  { label: 'rule_stock(库存)', value: 'rule_stock' },
  { label: 'rule_luck_award(兜底)', value: 'rule_luck_award' },
];
const EDGE_VALUE_OPTS = [
  { label: 'ALLOW', value: 'ALLOW' },
  { label: 'TAKE_OVER', value: 'TAKE_OVER' },
];
const EDGE_TYPE_OPTS = [
  { label: 'EQUAL', value: 'EQUAL' },
  { label: 'GT', value: 'GT' },
  { label: 'LT', value: 'LT' },
  { label: 'GTE', value: 'GTE' },
  { label: 'LTE', value: 'LTE' },
];
const TEMPLATES = [
  { type: 'rule_lock', title: '次数锁节点', desc: '入口判断节点。' },
  { type: 'rule_stock', title: '库存节点', desc: '库存判断节点。' },
  { type: 'rule_luck_award', title: '兜底节点', desc: '接管兜底节点。' },
];

const clamp = (value: number, min: number) => Math.max(value, min);
const pathOf = (x1: number, y1: number, x2: number, y2: number) =>
  `M ${x1} ${y1} C ${x1 + 90} ${y1}, ${x2 - 90} ${y2}, ${x2} ${y2}`;
const getEdgeValueClassName = (value?: string) => {
  if (value === 'ALLOW') return styles.edgeAllow;
  if (value === 'TAKE_OVER') return styles.edgeTakeOver;
  return '';
};
const getEdgeStrokeColor = (value?: string, active?: boolean) => {
  if (active) return '#1677ff';
  if (value === 'ALLOW') return '#52c41a';
  if (value === 'TAKE_OVER') return '#ff4d4f';
  return '#9eb9df';
};
const getEdgeMarkerId = (value?: string, active?: boolean) => {
  if (active) return 'rule-tree-arrow-selected';
  if (value === 'ALLOW') return 'rule-tree-arrow-allow';
  if (value === 'TAKE_OVER') return 'rule-tree-arrow-take-over';
  return 'rule-tree-arrow-default';
};

const readPos = (treeId?: string) => {
  if (!treeId || typeof window === 'undefined') return {} as Record<string, Pos>;
  try {
    return JSON.parse(window.localStorage.getItem(`${STORE}:${treeId}`) || '{}');
  } catch {
    return {};
  }
};

const savePos = (treeId: string | undefined, pos: Record<string, Pos>) => {
  if (!treeId || typeof window === 'undefined') return;
  window.localStorage.setItem(`${STORE}:${treeId}`, JSON.stringify(pos));
};

const getDuplicateRuleNames = (nodes: API.RuleTreeNodeItem[]) => {
  const counter = nodes.reduce<Record<string, number>>((acc, item) => {
    const key = String(item.ruleName || '');
    if (key) acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counter)
    .filter(([, count]) => count > 1)
    .map(([name]) => name);
};

const separateNodesForBypassEdges = (
  items: EditorNode[],
  levels: Record<string, number>,
  graphLines: API.RuleTreeNodeLineItem[],
  savedPos: Record<string, Pos>,
) => {
  const next = items.map((item) => ({ ...item }));
  const byRule = next.reduce<Record<string, EditorNode>>((acc, item) => {
    const key = String(item.ruleName || '');
    if (key) acc[key] = item;
    return acc;
  }, {});

  graphLines.forEach((line) => {
    const fromRule = String(line.ruleNodeFrom || '');
    const toRule = String(line.ruleNodeTo || '');
    const from = byRule[fromRule];
    const to = byRule[toRule];
    const fromLevel = levels[fromRule];
    const toLevel = levels[toRule];
    if (!from || !to || fromLevel === undefined || toLevel === undefined) return;
    if (Math.abs(toLevel - fromLevel) <= 1) return;

    const left = Math.min(from.x + W, to.x);
    const right = Math.max(from.x + W, to.x);
    const lineY = (from.y + H / 2 + to.y + H / 2) / 2;

    next.forEach((node) => {
      if (!node.id || savedPos[String(node.id)]) return;
      if (node.ruleName === fromRule || node.ruleName === toRule) return;
      const nodeLevel = levels[String(node.ruleName || '')];
      if (nodeLevel === undefined) return;
      if (nodeLevel <= Math.min(fromLevel, toLevel) || nodeLevel >= Math.max(fromLevel, toLevel)) return;

      const nodeCenterX = node.x + W / 2;
      const nodeCenterY = node.y + H / 2;
      const isInsideBypassLane = nodeCenterX > left && nodeCenterX < right && Math.abs(nodeCenterY - lineY) < H * 0.75;
      if (!isInsideBypassLane) return;

      node.y += RG;
    });
  });

  return next;
};

const spreadEdgeLabels = (items: EditorEdge[]) => {
  const sorted = [...items].sort((a, b) => (a.labelY - b.labelY) || (a.labelX - b.labelX));
  const groups: EditorEdge[][] = [];

  sorted.forEach((item) => {
    const group = groups.find((candidate) =>
      candidate.some(
        (edge) => Math.abs(edge.labelX - item.labelX) < 180 && Math.abs(edge.labelY - item.labelY) < 42,
      ),
    );
    if (group) {
      group.push(item);
      return;
    }
    groups.push([item]);
  });

  groups.forEach((group) => {
    if (group.length <= 1) return;
    group
      .sort((a, b) => a.labelX - b.labelX)
      .forEach((edge, index) => {
        const step = Math.floor(index / 2) + 1;
        const direction = index % 2 === 0 ? -1 : 1;
        edge.labelY += direction * step * 28;
      });
  });

  return items;
};

const RuleTreeEditor: React.FC = () => {
  const { message } = App.useApp();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [trees, setTrees] = useState<API.RuleTreeItem[]>([]);
  const [nodes, setNodes] = useState<API.RuleTreeNodeItem[]>([]);
  const [lines, setLines] = useState<API.RuleTreeNodeLineItem[]>([]);
  const [treeId, setTreeId] = useState<string>();
  const [pick, setPick] = useState<PickState>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [nodeOpen, setNodeOpen] = useState(false);
  const [lineOpen, setLineOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState<Record<string, Pos>>({});
  const [drag, setDrag] = useState<DragState>(null);
  const [connect, setConnect] = useState<ConnectState>(null);
  const [editNode, setEditNode] = useState<API.RuleTreeNodeItem>();
  const [editLine, setEditLine] = useState<API.RuleTreeNodeLineItem>();
  const [nodeForm] = Form.useForm<NodeFormValues>();
  const [lineForm] = Form.useForm<LineFormValues>();

  const point = (clientX: number, clientY: number) => {
    const el = canvasRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return { x: clientX - rect.left + el.scrollLeft, y: clientY - rect.top + el.scrollTop };
  };

  const loadTrees = async () => {
    const res = await query_rule_tree();
    const list = Array.isArray(res?.data) ? res.data : [];
    setTrees(list);
    setTreeId((prev) => (prev && list.some((t) => t.id === prev) ? prev : String(list[0]?.id || '')));
  };

  const loadGraph = async (id: string) => {
    setLoading(true);
    try {
      const [n, l] = await Promise.all([query_rule_tree_node_one(id), query_rule_tree_node_line()]);
      setNodes(Array.isArray(n?.data) ? n.data : []);
      setLines(Array.isArray(l?.data) ? l.data.filter((item) => item.ruleTreeId === id) : []);
      setPositions(readPos(id));
      setPick({ type: 'tree', id });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('ruleTreeId');
    if (id) setTreeId(id);
    void loadTrees();
  }, []);

  useEffect(() => {
    if (treeId) void loadGraph(treeId);
  }, [treeId]);

  useEffect(() => savePos(treeId, positions), [positions, treeId]);

  const tree = useMemo(() => trees.find((t) => t.id === treeId), [trees, treeId]);

  const graph = useMemo(() => {
    const levels: Record<string, number> = {};
    const entry = String(tree?.treeNodeRuleKey || '');
    if (entry) {
      levels[entry] = 0;
      const q = [entry];
      while (q.length) {
        const cur = q.shift() as string;
        lines.filter((l) => l.ruleNodeFrom === cur).forEach((l) => {
          const next = String(l.ruleNodeTo || '');
          const lv = levels[cur] + 1;
          if (next && (levels[next] === undefined || levels[next] < lv)) {
            levels[next] = lv;
            q.push(next);
          }
        });
      }
    }
    let fallback = Object.values(levels).length ? Math.max(...Object.values(levels)) + 1 : 0;
    nodes.forEach((n) => {
      const name = String(n.ruleName || '');
      if (name && levels[name] === undefined) levels[name] = fallback++;
    });

    const grouped = nodes.reduce<Record<number, API.RuleTreeNodeItem[]>>((acc, n) => {
      const lv = levels[String(n.ruleName || '')] || 0;
      (acc[lv] ||= []).push(n);
      return acc;
    }, {});

    const drawNodes = separateNodesForBypassEdges(
      Object.entries(grouped).flatMap(([lv, list]) =>
      list
        .sort((a, b) => String(a.ruleName || '').localeCompare(String(b.ruleName || '')))
        .map((n, i) => {
          const saved = n.id ? positions[String(n.id)] : undefined;
          return {
            ...n,
            x: saved?.x ?? PX + Number(lv) * CG,
            y: saved?.y ?? PY + i * RG,
            isEntry: n.ruleName === tree?.treeNodeRuleKey,
          };
        }),
      ),
      levels,
      lines,
      positions,
    );

    const map = drawNodes.reduce<Record<string, EditorNode>>((acc, n) => {
      const key = String(n.ruleName || '');
      if (key) acc[key] = n;
      return acc;
    }, {});

    const drawLines = spreadEdgeLabels(
      lines
      .map((l) => {
        const from = map[String(l.ruleNodeFrom || '')];
        const to = map[String(l.ruleNodeTo || '')];
        if (!from || !to) return undefined;
        return {
          ...l,
          fromX: from.x + W,
          fromY: from.y + H / 2,
          toX: to.x,
          toY: to.y + H / 2,
          labelX: (from.x + W + to.x) / 2,
          labelY: (from.y + H / 2 + to.y + H / 2) / 2 - 18,
        };
      })
      .filter(Boolean) as EditorEdge[],
    );

    return {
      nodes: drawNodes,
      lines: drawLines,
      width: drawNodes.length > 0 ? Math.max(...drawNodes.map((n) => n.x + W + PX), 880) : 880,
      height: drawNodes.length > 0 ? Math.max(...drawNodes.map((n) => n.y + H + PY), 640) : 640,
    };
  }, [tree, nodes, lines, positions]);

  const selectedNode = pick?.type === 'node' ? nodes.find((n) => n.id === pick.id) : undefined;
  const selectedLine = pick?.type === 'line' ? lines.find((l) => l.id === pick.id) : undefined;
  const nodeOptions = nodes.map((n) => ({ label: n.ruleName || '', value: n.ruleName || '' }));

  const refreshCurrentTree = async () => {
    await loadTrees();
    if (treeId) await loadGraph(treeId);
  };

  const openCreateLineModal = (preset?: Partial<LineFormValues>) => {
    if (!treeId) return message.warning('请先选择规则树');
    lineForm.resetFields();
    lineForm.setFieldsValue({ ruleTreeId: treeId, ...preset });
    setEditLine(undefined);
    setLineOpen(true);
  };

  const handleNodeDelete = async (node: API.RuleTreeNodeItem) => {
    if (!node.id || !treeId) return;
    const res = await delete_rule_tree_node(node.id);
    if (res.code === 1000) {
      setPositions((prev) => {
        const next = { ...prev };
        delete next[String(node.id)];
        return next;
      });
      await loadGraph(treeId);
      return;
    }
    message.error(res.message || '节点删除失败');
  };

  const handleLineDelete = async (line: API.RuleTreeNodeLineItem) => {
    if (!line.id || !treeId) return;
    const res = await delete_rule_tree_node_line(line.id);
    if (res.code === 1000) {
      await loadGraph(treeId);
      return;
    }
    message.error(res.message || '连线删除失败');
  };

  const saveNode = async (values: NodeFormValues) => {
    if (!treeId) return false;
    const dup = nodes.find((n) => n.ruleName === values.ruleName && n.id !== values.id);
    if (dup) {
      message.error('当前版本要求同一棵规则树内节点类型唯一，避免连线歧义');
      return false;
    }
    const res = values.id
      ? await update_rule_tree_node({ ...values, ruleTreeId: treeId })
      : await add_rule_tree_node({ ...values, ruleTreeId: treeId });
    if (res.code === 1000) {
      setNodeOpen(false);
      await loadGraph(treeId);
      return true;
    }
    message.error(res.message || '节点保存失败');
    return false;
  };

  const saveLine = async (values: LineFormValues) => {
    if (!treeId) return false;
    if (values.ruleNodeFrom === values.ruleNodeTo) {
      message.error('起点和终点不能相同');
      return false;
    }
    const dup = lines.find(
      (l) =>
        l.ruleNodeFrom === values.ruleNodeFrom &&
        l.ruleNodeTo === values.ruleNodeTo &&
        l.ruleLimitType === values.ruleLimitType &&
        l.ruleLimitValue === values.ruleLimitValue &&
        l.id !== values.id,
    );
    if (dup) {
      message.error('相同条件的连线已存在');
      return false;
    }
    const res = values.id
      ? await update_rule_tree_node_line({ ...values, ruleTreeId: treeId })
      : await add_rule_tree_node_line({ ...values, ruleTreeId: treeId });
    if (res.code === 1000) {
      setLineOpen(false);
      await loadGraph(treeId);
      return true;
    }
    message.error(res.message || '连线保存失败');
    return false;
  };

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      if (drag) {
        const p = point(event.clientX, event.clientY);
        setPositions((prev) => ({
          ...prev,
          [drag.id]: { x: clamp(p.x - drag.dx, 24), y: clamp(p.y - drag.dy, 24) },
        }));
      }
      if (connect) {
        const p = point(event.clientX, event.clientY);
        setConnect((prev) => (prev ? { ...prev, x: p.x, y: p.y } : prev));
      }
    };
    const onUp = () => {
      if (drag) setDrag(null);
      if (connect) setConnect(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [drag, connect]);

  return (
    <PageContainer pageHeaderRender={false}>
      <Card
        bordered={false}
        className={styles.pageCard}
        title="规则树编排"
        extra={
          <Space wrap>
            <Select
              style={{ minWidth: 320 }}
              placeholder="请选择规则树"
              value={treeId}
              options={trees.map((item) => ({ label: `${item.id} (${item.treeName})`, value: item.id }))}
              onChange={setTreeId}
              showSearch
              optionFilterProp="label"
            />
            <Button icon={<ReloadOutlined />} onClick={refreshCurrentTree}>刷新</Button>
            <Button onClick={() => setDrawerOpen(true)}>属性面板</Button>
            <Button icon={<ApartmentOutlined />} onClick={() => history.push('/strategy/tree')}>规则树列表</Button>
            <Button icon={<NodeIndexOutlined />} onClick={() => { nodeForm.resetFields(); nodeForm.setFieldsValue({ ruleTreeId: treeId }); setEditNode(undefined); setNodeOpen(true); }}>新建节点</Button>
            <Button type="primary" icon={<BranchesOutlined />} onClick={() => openCreateLineModal()}>新建连线</Button>
          </Space>
        }
      >
        <div className={styles.editorLayout}>
          <Card bordered={false} className={styles.sideCard} title={<span className={styles.sectionTitle}>节点模板</span>}>
            <Typography.Paragraph type="secondary">节点可拖拽排布，节点右侧拖到其他节点左侧即可创建连线。</Typography.Paragraph>
            <div className={styles.templateList}>
              {TEMPLATES.map((item) => (
                <Button
                  key={item.type}
                  className={styles.templateButton}
                  icon={<PlusOutlined />}
                  onClick={() => {
                    nodeForm.resetFields();
                    nodeForm.setFieldsValue({ ruleTreeId: treeId, ruleName: item.type });
                    setEditNode(undefined);
                    setNodeOpen(true);
                  }}
                >
                  <span className={styles.templateMeta}>
                    <Typography.Text strong>{item.title}</Typography.Text>
                    <Typography.Text type="secondary">{item.desc}</Typography.Text>
                  </span>
                </Button>
              ))}
            </div>
            <div className={styles.legendList}>
              <div className={styles.legendItem}><span>规则树</span><Tag color="blue">{trees.length}</Tag></div>
              <div className={styles.legendItem}><span>节点</span><Tag color="geekblue">{nodes.length}</Tag></div>
              <div className={styles.legendItem}><span>连线</span><Tag color="cyan">{lines.length}</Tag></div>
            </div>
          </Card>

          <Card bordered={false} className={styles.graphPanel} loading={loading}>
            {getDuplicateRuleNames(nodes).length > 0 && (
              <Typography.Paragraph type="warning" style={{ marginBottom: 16 }}>
                当前树存在重复节点类型，现有接口按 `ruleName` 连线，编排器会限制新增重复类型节点。
              </Typography.Paragraph>
            )}

            {!treeId ? (
              <div className={styles.emptyCanvas}><Empty description="暂无规则树，请先创建" /></div>
            ) : (
              <div ref={canvasRef} className={styles.graphCanvas}>
                <svg className={styles.canvasSvg} width={graph.width} height={graph.height} viewBox={`0 0 ${graph.width} ${graph.height}`}>
                  <defs>
                    <marker id="rule-tree-arrow-default" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                      <path d="M 0 0 L 7 3.5 L 0 7 z" fill="#7a9fd6" />
                    </marker>
                    <marker id="rule-tree-arrow-allow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                      <path d="M 0 0 L 7 3.5 L 0 7 z" fill="#52c41a" />
                    </marker>
                    <marker id="rule-tree-arrow-take-over" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                      <path d="M 0 0 L 7 3.5 L 0 7 z" fill="#ff4d4f" />
                    </marker>
                    <marker id="rule-tree-arrow-selected" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                      <path d="M 0 0 L 7 3.5 L 0 7 z" fill="#1677ff" />
                    </marker>
                  </defs>
                  {graph.lines.map((line) => {
                    const active = pick?.type === 'line' && pick.id === line.id;
                    const d = pathOf(line.fromX, line.fromY, line.toX, line.toY);
                    const strokeColor = getEdgeStrokeColor(line.ruleLimitValue, active);
                    const markerId = getEdgeMarkerId(line.ruleLimitValue, active);
                    return (
                      <g key={line.id}>
                        <path d={d} fill="none" stroke={strokeColor} strokeWidth={active ? 3 : 2} markerEnd={`url(#${markerId})`} />
                        <path
                          d={d}
                          fill="none"
                          stroke="transparent"
                          strokeWidth={16}
                          style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                          onClick={() => {
                            setPick({ type: 'line', id: String(line.id || '') });
                          }}
                        />
                      </g>
                    );
                  })}
                  {connect && (
                    <path d={pathOf(connect.sx, connect.sy, connect.x, connect.y)} fill="none" stroke="#1677ff" strokeDasharray="8 6" strokeWidth={3} markerEnd="url(#rule-tree-arrow-selected)" />
                  )}
                </svg>
                <div className={styles.canvasInner} style={{ width: graph.width, height: graph.height }}>
                  {graph.nodes.length === 0 ? (
                    <div className={styles.emptyCanvas}><Empty description="当前规则树暂无节点" /></div>
                  ) : (
                    <>
                      {graph.nodes.map((node) => {
                        const active = pick?.type === 'node' && pick.id === node.id;
                        return (
                          <Card
                            key={node.id}
                            size="small"
                            className={`${styles.nodeCard} ${active ? styles.nodeSelected : ''} ${drag?.id === node.id ? styles.nodeDragging : ''}`}
                            style={{ left: node.x, top: node.y }}
                            onMouseDown={(event) => {
                              const target = event.target as HTMLElement;
                              if (target.closest('[data-no-drag="true"]')) return;
                              const p = point(event.clientX, event.clientY);
                              setPick({ type: 'node', id: String(node.id || '') });
                              setDrag({ id: String(node.id || ''), dx: p.x - node.x, dy: p.y - node.y });
                            }}
                            onClick={() => {
                              setPick({ type: 'node', id: String(node.id || '') });
                            }}
                          >
                            <button
                              type="button"
                              data-no-drag="true"
                              className={`${styles.nodeHandle} ${styles.nodeHandleInput}`}
                              onMouseUp={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                if (!connect || connect.fromId === node.id) {
                                  setConnect(null);
                                  return;
                                }
                                openCreateLineModal({
                                  ruleNodeFrom: connect.fromRule,
                                  ruleNodeTo: String(node.ruleName || ''),
                                });
                                setConnect(null);
                              }}
                            />
                            <button
                              type="button"
                              data-no-drag="true"
                              className={`${styles.nodeHandle} ${styles.nodeHandleOutput}`}
                              onMouseDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                setPick({ type: 'node', id: String(node.id || '') });
                                setConnect({
                                  fromId: String(node.id || ''),
                                  fromRule: String(node.ruleName || ''),
                                  sx: node.x + W,
                                  sy: node.y + H / 2,
                                  x: node.x + W,
                                  y: node.y + H / 2,
                                });
                              }}
                            />
                            <div className={styles.nodeHeader}>
                              <div>
                                <Typography.Text strong className={styles.nodeName}>{node.ruleName}</Typography.Text>
                              </div>
                              {node.isEntry && <Tag color="blue">入口</Tag>}
                            </div>
                            <Typography.Paragraph ellipsis={{ rows: 2 }} className={styles.nodeDesc} type="secondary">
                              {node.ruleDesc || '未填写描述'}
                            </Typography.Paragraph>
                            <div className={styles.nodeFooter}>
                              <Tag color="processing">{node.ruleValue || '无规则值'}</Tag>
                              <Button
                                size="small"
                                type="link"
                                data-no-drag="true"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setPick({ type: 'node', id: String(node.id || '') });
                                  setEditNode(node);
                                  nodeForm.setFieldsValue(node);
                                  setNodeOpen(true);
                                }}
                              >
                                编辑
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                      {graph.lines.map((line) => {
                        const active = pick?.type === 'line' && pick.id === line.id;
                        return (
                          <span
                            key={`label-${line.id}`}
                            className={`${styles.edgeLabel} ${getEdgeValueClassName(line.ruleLimitValue)} ${active ? styles.edgeSelected : ''}`}
                            style={{ left: line.labelX, top: line.labelY }}
                            onClick={() => {
                              setPick({ type: 'line', id: String(line.id || '') });
                            }}
                          >
                            <span>{line.ruleLimitType} / {line.ruleLimitValue}</span>
                            <button
                              type="button"
                              className={styles.edgeEdit}
                              onClick={(event) => {
                                event.stopPropagation();
                                setPick({ type: 'line', id: String(line.id || '') });
                                setEditLine(line);
                                lineForm.setFieldsValue(line);
                                setLineOpen(true);
                              }}
                              aria-label="编辑连线"
                              title="编辑连线"
                            >
                              ✎
                            </button>
                            <Popconfirm
                              title="确定删除该连线吗？"
                              onConfirm={(event) => {
                                event?.stopPropagation();
                                void handleLineDelete(line);
                              }}
                              okText="确定"
                              cancelText="取消"
                            >
                              <button
                                type="button"
                                className={styles.edgeDelete}
                                onClick={(event) => {
                                  event.stopPropagation();
                                }}
                              >
                                ×
                              </button>
                            </Popconfirm>
                          </span>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </Card>

      <Drawer
        title={<Typography.Title level={4} className={styles.drawerTitle}>属性面板</Typography.Title>}
        open={drawerOpen}
        width={360}
        onClose={() => setDrawerOpen(false)}
      >
        {pick?.type === 'node' && selectedNode ? (
          <>
            <div className={styles.detailList}>
              <div className={styles.detailRow}><span className={styles.detailLabel}>节点ID</span><span className={styles.detailValue}>{selectedNode.id}</span></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>节点类型</span><span className={styles.detailValue}>{selectedNode.ruleName}</span></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>规则描述</span><span className={styles.detailValue}>{selectedNode.ruleDesc || '--'}</span></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>规则值</span><span className={styles.detailValue}>{selectedNode.ruleValue || '--'}</span></div>
            </div>
            <div className={styles.detailActions}>
              <Button icon={<EditOutlined />} onClick={() => { setPick({ type: 'node', id: String(selectedNode.id || '') }); setEditNode(selectedNode); nodeForm.setFieldsValue(selectedNode); setNodeOpen(true); }}>编辑节点</Button>
              <Popconfirm title="删除该节点后，相关连线需要手动清理。是否继续？" onConfirm={() => handleNodeDelete(selectedNode)} okText="确定" cancelText="取消">
                <Button danger icon={<DeleteOutlined />}>删除节点</Button>
              </Popconfirm>
            </div>
          </>
        ) : pick?.type === 'line' && selectedLine ? (
          <>
            <div className={styles.detailList}>
              <div className={styles.detailRow}><span className={styles.detailLabel}>连线ID</span><span className={styles.detailValue}>{selectedLine.id}</span></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>起点</span><span className={styles.detailValue}>{selectedLine.ruleNodeFrom}</span></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>终点</span><span className={styles.detailValue}>{selectedLine.ruleNodeTo}</span></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>条件类型</span><span className={styles.detailValue}>{selectedLine.ruleLimitType}</span></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>条件值</span><span className={styles.detailValue}>{selectedLine.ruleLimitValue}</span></div>
            </div>
            <div className={styles.detailActions}>
              <Button icon={<EditOutlined />} onClick={() => { setPick({ type: 'line', id: String(selectedLine.id || '') }); setEditLine(selectedLine); lineForm.setFieldsValue(selectedLine); setLineOpen(true); }}>编辑连线</Button>
              <Popconfirm title="确定删除该连线吗？" onConfirm={() => handleLineDelete(selectedLine)} okText="确定" cancelText="取消">
                <Button danger icon={<DeleteOutlined />}>删除连线</Button>
              </Popconfirm>
            </div>
          </>
        ) : (
          <div className={styles.treeMeta}>
            <Typography.Title level={5} style={{ margin: 0 }}>{tree?.treeName || '未选择规则树'}</Typography.Title>
            <Typography.Paragraph type="secondary">{tree?.treeDesc || '请选择一棵规则树开始编排。'}</Typography.Paragraph>
            <div className={styles.detailList}>
              <div className={styles.detailRow}><span className={styles.detailLabel}>规则树ID</span><span className={styles.detailValue}>{tree?.id || '--'}</span></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>入口规则</span><span className={styles.detailValue}>{tree?.treeNodeRuleKey || '--'}</span></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>节点数</span><span className={styles.detailValue}>{nodes.length}</span></div>
              <div className={styles.detailRow}><span className={styles.detailLabel}>连线数</span><span className={styles.detailValue}>{lines.length}</span></div>
            </div>
          </div>
        )}
      </Drawer>

      <ModalForm<NodeFormValues>
        title={editNode ? '编辑规则节点' : '新建规则节点'}
        open={nodeOpen}
        form={nodeForm}
        modalProps={{ destroyOnClose: true, onCancel: () => setNodeOpen(false) }}
        onOpenChange={setNodeOpen}
        onFinish={saveNode}
      >
        <ProFormText name="id" label="节点ID" disabled hidden={!editNode} />
        <ProFormText name="ruleTreeId" hidden initialValue={treeId} />
        <ProFormSelect name="ruleName" label="节点类型" rules={[{ required: true, message: '请选择节点类型' }]} options={NODE_OPTS} />
        <ProFormText name="ruleDesc" label="规则描述" rules={[{ required: true, message: '请输入规则描述' }]} />
        <ProFormText name="ruleValue" label="规则值" />
      </ModalForm>

      <ModalForm<LineFormValues>
        title={editLine ? '编辑规则连线' : '新建规则连线'}
        open={lineOpen}
        form={lineForm}
        modalProps={{ destroyOnClose: true, onCancel: () => setLineOpen(false) }}
        onOpenChange={setLineOpen}
        onFinish={saveLine}
      >
        <ProFormText name="id" label="连线ID" disabled hidden={!editLine} />
        <ProFormText name="ruleTreeId" hidden initialValue={treeId} />
        <ProFormSelect name="ruleNodeFrom" label="起点节点" rules={[{ required: true, message: '请选择起点节点' }]} options={nodeOptions} />
        <ProFormSelect name="ruleNodeTo" label="终点节点" rules={[{ required: true, message: '请选择终点节点' }]} options={nodeOptions} />
        <ProFormSelect name="ruleLimitType" label="条件类型" rules={[{ required: true, message: '请选择条件类型' }]} options={EDGE_TYPE_OPTS} />
        <ProFormSelect name="ruleLimitValue" label="条件值" rules={[{ required: true, message: '请选择条件值' }]} options={EDGE_VALUE_OPTS} />
      </ModalForm>
    </PageContainer>
  );
};

export default RuleTreeEditor;
