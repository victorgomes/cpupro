const jora = require('./app/jora/index.js');
const tfPhase = { data: { edges: [{ source: 1, target: 7, type: 'value', index: 1 }, { source: 2, target: 7, type: 'control', index: 0 }] } };
const data = { id: 7, title: 'HeapConstant[0x020f01004801 <NativeContext[306]>]' };
const query = `
    $edges: #.tfPhase.data.edges.[target = id];
    $edges.size()
`;
console.log(jora(query)(data, { tfPhase }));
