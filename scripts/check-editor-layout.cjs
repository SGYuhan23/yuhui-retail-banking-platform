const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('../yuhui-web/node_modules/typescript');
const root = path.resolve(__dirname, '..');
const record = process.argv.includes('--record');
const fixturePath = path.join(root, 'verification/internal-refactor/editor-layout.json');
let code;
if (record) {
  const source = fs.readFileSync(path.join(root, '.runtime/refactor-baseline/editor.tsx'), 'utf8');
  const ast = ts.createSourceFile('editor.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let body;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'graph') body = node.initializer.arguments[0].body.getText(ast);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.ok(body);
  code = source.slice(source.indexOf('const W ='), source.indexOf('const RuleTreeEditor:')) + '\nexports.layoutGraph = (tree, nodes, lines, positions) => ' + body;
} else {
  code = fs.readFileSync(path.join(root, 'yuhui-web/src/pages/RuleTreeEditor/graph-model.ts'), 'utf8');
}
const exportsMock = {};
vm.runInNewContext(ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { exports: exportsMock });
const layout = exportsMock.layoutGraph;
let seed = 241017;
const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const fixtures = [];
for (let c = 0; c < 120; c++) {
  const count = c % 13;
  const nodes = Array.from({ length: count }, (_, i) => ({ id: String(i + 1), ruleName: 'rule_' + i, ruleDesc: '节点' + i, ruleValue: String(i) }));
  const lines = [];
  for (let i = 0; i < count; i++) for (let j = i + 1; j < count; j++) if (random() < 0.35) lines.push({ id: String(lines.length), ruleNodeFrom: nodes[i].ruleName, ruleNodeTo: nodes[j].ruleName, ruleLimitValue: random() < 0.5 ? 'ALLOW' : 'TAKE_OVER' });
  if (c % 4 === 0) lines.push({ id: 'missing', ruleNodeFrom: 'absent', ruleNodeTo: 'missing' });
  if (c % 7 === 0 && nodes.length) nodes.push({ ...nodes[0], id: 'duplicate' });
  if (c % 9 === 0) nodes.push({ id: 'unnamed' });
  const positions = {};
  for (const node of nodes) if (random() < 0.3) positions[node.id] = { x: Math.floor(random() * 800), y: Math.floor(random() * 800) };
  const tree = c % 5 === 0 ? {} : { treeNodeRuleKey: 'rule_0' };
  const input = { tree, nodes, lines, positions };
  const before = JSON.stringify(input);
  const output = layout(tree, nodes, lines, positions);
  assert.equal(JSON.stringify(input), before, 'layout must not mutate caller data');
  fixtures.push({ input, output });
}
const normalized = JSON.parse(JSON.stringify(fixtures));
if (record) fs.writeFileSync(fixturePath, '[\n' + normalized.map(value => JSON.stringify(value)).join(',\n') + '\n]\n');
else assert.deepEqual(normalized, JSON.parse(fs.readFileSync(fixturePath, 'utf8')));
console.log(JSON.stringify({ result: 'PASS', graphs: fixtures.length, comparison: 'all node/edge fields, order, coordinates and canvas dimensions', inputMutation: false }));
