const fs = require('fs');
const data = JSON.parse(fs.readFileSync('turbo-add-0.json', 'utf8'));
const phase = data.phases.find(p => p.type === 'graph');
const nodes = phase.data.nodes;
const edges = phase.data.edges;

const edgesByTarget = new Map();
for (const edge of edges) {
    if (!edgesByTarget.has(edge.target)) {
        edgesByTarget.set(edge.target, []);
    }
    edgesByTarget.get(edge.target).push(edge);
}
    
const visited = new Set();
const tempMark = new Set();
const sorted = [];
const nodeById = new Map(nodes.map(n => [n.id, n]));

function visit(nodeId) {
    if (visited.has(nodeId)) return;
    if (tempMark.has(nodeId)) {
        // cycle
        return;
    }
    tempMark.add(nodeId);
    
    const nodeEdges = edgesByTarget.get(nodeId) || [];
    nodeEdges.sort((a, b) => a.index - b.index);
    
    for (const edge of nodeEdges) {
        visit(edge.source);
    }
    
    tempMark.delete(nodeId);
    visited.add(nodeId);
    if (nodeById.has(nodeId)) {
        sorted.push(nodeById.get(nodeId));
    }
}

// Ensure stable deterministic order by sorting nodes by id first
nodes.sort((a, b) => a.id - b.id);
for (const node of nodes) {
    visit(node.id);
}

console.log(sorted.map(n => n.id).join(', '));
