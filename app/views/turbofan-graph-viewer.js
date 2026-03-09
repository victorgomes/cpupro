discovery.view.define('turbofan-graph-viewer', {
    render(el, config, data, context) {
        el.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('tf-node-input')) {
                const nodeId = e.target.dataset.nodeId;
                const nodeEl = el.querySelector(`.tf-node-${nodeId}`);
                if (nodeEl) nodeEl.classList.add('tf-node-highlight');
            } else if (e.target.classList.contains('tf-node-id')) {
                const nodeId = e.target.dataset.nodeId;
                const uses = el.querySelectorAll(`.tf-node-input[data-node-id="${nodeId}"]`);
                for (const use of uses) {
                    const parentNode = use.closest('.tf-node');
                    if (parentNode) parentNode.classList.add('tf-node-highlight');
                }
            } else if (e.target.classList.contains('tf-block-ref')) {
                const targetBlockId = e.target.dataset.target;
                const blockEl = el.querySelector(`.tf-block-${targetBlockId}`);
                if (blockEl) blockEl.classList.add('tf-block-highlight');
            }
        });
        el.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('tf-node-input')) {
                const nodeId = e.target.dataset.nodeId;
                const nodeEl = el.querySelector(`.tf-node-${nodeId}`);
                if (nodeEl) nodeEl.classList.remove('tf-node-highlight');
            } else if (e.target.classList.contains('tf-node-id')) {
                const nodeId = e.target.dataset.nodeId;
                const uses = el.querySelectorAll(`.tf-node-input[data-node-id="${nodeId}"]`);
                for (const use of uses) {
                    const parentNode = use.closest('.tf-node');
                    if (parentNode) parentNode.classList.remove('tf-node-highlight');
                }
            } else if (e.target.classList.contains('tf-block-ref')) {
                const targetBlockId = e.target.dataset.target;
                const blockEl = el.querySelector(`.tf-block-${targetBlockId}`);
                if (blockEl) blockEl.classList.remove('tf-block-highlight');
            }
        });

        el.addEventListener('click', (e) => {
            if (e.target.classList.contains('tf-block-ref')) {
                const targetBlockId = e.target.dataset.target;
                const blockEl = el.querySelector(`.tf-block-${targetBlockId}`);
                if (blockEl) {
                    blockEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    blockEl.classList.add('tf-block-flash');
                    setTimeout(() => blockEl.classList.remove('tf-block-flash'), 1000);
                }
            }
        });

        const createGraphPane = (phasePath, otherPhasePath, isBase) => ({
            view: 'switch',
            data: phasePath,
            content: [
                {
                    when: 'type = "graph"',
                    content: {
                        view: 'block',
                        className: 'source tf-graph',
                        content: {
                            view: 'list',
                            data: function(phase) {
                                if (!phase || !phase.data || !phase.data.nodes) return [];
                                const nodes = phase.data.nodes;
                                const edges = phase.data.edges || [];
                                const edgesByTarget = new Map();
                                for (const edge of edges) {
                                    if (!edgesByTarget.has(edge.target)) edgesByTarget.set(edge.target, []);
                                    edgesByTarget.get(edge.target).push(edge);
                                }
                                
                                const visited = new Set();
                                const tempMark = new Set();
                                const sorted = [];
                                const nodeById = new Map();
                                for (const node of nodes) {
                                    nodeById.set(node.id, node);
                                }
                                
                                function visit(nodeId) {
                                    if (visited.has(nodeId)) return;
                                    if (tempMark.has(nodeId)) return;
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
                                
                                const sortedNodes = nodes.slice().sort((a, b) => a.id - b.id);
                                for (const node of sortedNodes) {
                                    visit(node.id);
                                }
                                return sorted;
                            },
                            item: {
                                view: 'html',
                                data: `
                                    $customColors: {
                                        value: '#2196f3',
                                        effect: '#ff9800',
                                        control: '#4caf50',
                                        'frame-state': '#9c27b0',
                                        context: '#e91e63'
                                    };
                                    $nodeId: id;
                                    $edges: ${phasePath}.data.edges.[target = $nodeId];
                                    $otherPhase: ${otherPhasePath};
                                    $isDiffMode: $otherPhase and $otherPhase.name != "---";
                                    $otherNode: $isDiffMode ? $otherPhase.data.nodes.[id = $nodeId][0] : null;
                                    
                                    $isMissingInOther: $isDiffMode and not $otherNode;
                                    $diffClass: $isMissingInOther ? (${isBase ? "'tf-node-added'" : "'tf-node-removed'"}) : '';
                                    
                                    $changedOp: $isDiffMode and $otherNode and $otherNode.title != title;
                                    $finalClass: $diffClass or ($changedOp ? 'tf-node-changed' : '');
                                    
                                    $inputsHTML: $edges.map(=> (
                                        '<span class="tf-node-input" data-node-id="' + source + '" style="color: ' + ($customColors[type] or 'inherit') + ';" title="' + type + '">#' + source + '</span>'
                                    )).join(' ');
                                    $titleHtml: title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                    '<div class="tf-node tf-node-' + id + ' ' + $finalClass + '"><span class="tf-node-id" data-node-id="' + id + '">#' + id + '</span> <span class="tf-node-title">' + $titleHtml + '</span> ' + ($inputsHTML ? '(' + $inputsHTML + ')' : '()') + '</div>'
                                `
                            }
                        }
                    }
                },
                {
                    when: 'type = "turboshaft_graph"',
                    content: {
                        view: 'list',
                        className: 'source tf-graph',
                        data: 'data.blocks',
                        item: {
                            view: 'block',
                            className: function(data) { return 'tf-block tf-block-' + data.id; },
                            content: [
                                { view: 'h5', className: 'tf-block-title', content: 'text:`B${id}`' },
                                {
                                    view: 'list',
                                    data: `$blockId: id; ${phasePath}.data.nodes.[block_id = $blockId]`,
                                    item: {
                                        view: 'html',
                                        data: `
                                            $customColors: {
                                                value: '#2196f3',
                                                effect: '#ff9800',
                                                control: '#4caf50',
                                                'frame-state': '#9c27b0',
                                                context: '#e91e63'
                                            };
                                            $nodeId: id;
                                            $edges: ${phasePath}.data.edges.[target = $nodeId];
                                            $otherPhase: ${otherPhasePath};
                                            $isDiffMode: $otherPhase and $otherPhase.name != "---";
                                            $otherNode: $isDiffMode ? $otherPhase.data.nodes.[id = $nodeId][0] : null;
                                            
                                            $isMissingInOther: $isDiffMode and not $otherNode;
                                            $diffClass: $isMissingInOther ? (${isBase ? "'tf-node-added'" : "'tf-node-removed'"}) : '';
                                            
                                            $changedOp: $isDiffMode and $otherNode and ($otherNode.title != title or $otherNode.op_effects != op_effects);
                                            $finalClass: $diffClass or ($changedOp ? 'tf-node-changed' : '');
                                            
                                            $inputsHTML: $edges ? $edges.map(=> (
                                                '<span class="tf-node-input" data-node-id="' + source + '" style="color: ' + ($customColors[type] or 'inherit') + ';" title="' + type + '">#' + source + '</span>'
                                            )).join(' ') : '';
                                            
                                            $customData: ${phasePath}.keys()
                                                .[${phasePath}[$].type = "turboshaft_custom_data"]
                                                .({
                                                    name: $,
                                                    value: ${phasePath}[$].data.[key = $nodeId].value[0]
                                                })
                                                .[value];
                                                
                                            $filteredCustomData: $customData.[name != "Properties" and name != "op_effects"];
                                            $tooltipLines: $filteredCustomData.map(=> name + ': ' + value).join('&#10;');
                                            $tooltipContent: $tooltipLines.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                            
                                            $propsVal: $customData.[name = "Properties"].value | join('');
                                            $propsStr: properties ? '[' + properties + ']' : ($propsVal ? $propsVal : '');
                                            $propsStrEscaped: $propsStr.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                            $propsStrWithRefs: $propsStrEscaped.replace(/\\bB(\\d+)\\b/g, '<span class="tf-block-ref" data-target="$1">$&</span>');
                                            $propsHtml: $propsStrWithRefs ? ' <span class="tf-node-properties" style="color: #999;">' + $propsStrWithRefs + '</span>' : '';
                                            
                                            $titleHtml: title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                            '<div class="tf-node tf-node-' + id + ' ' + $finalClass + '"><span class="tf-node-id" data-node-id="' + id + '">#' + id + '</span> <span class="tf-node-title"' + ($tooltipContent ? ' title="' + $tooltipContent + '"' : '') + '>' + $titleHtml + '</span>' + $propsHtml + ' ' + ($inputsHTML ? '(' + $inputsHTML + ')' : '()') + '</div>'
                                        `
                                    }
                                }
                            ]
                        }
                    }
                },
                {
                    when: 'type = "schedule" or type = "disassembly"',
                    content: {
                        view: 'source',
                        data: '{ content: data, syntax: type = "disassembly" ? "x86asm" : "text", lineNum: false }'
                    }
                },
                {
                    when: 'type = "sequence" or type = "instructions"',
                    content: {
                        view: 'list',
                        data: 'data.blocks',
                        item: [
                            { view: 'h5', className: 'tf-block-title', content: 'text:`B${id}`' },
                            {
                                view: 'list',
                                data: 'instructions',
                                item: 'text:`${id}: ${opcode}`'
                            }
                        ]
                    }
                },
                {
                    content: {
                        view: 'block',
                        className: 'data-unavailable',
                        content: 'text:`Unsupported phase type: ${type}`'
                    }
                }
            ]
        });

        return this.render(el, {
            view: 'context',
            modifiers: [
                {
                    view: 'block',
                    className: 'tf-toolbar',
                    content: [
                        { view: 'text', data: '"Phase: "' },
                        {
                            view: 'select',
                            name: 'tfPhase',
                            data: 'phases',
                            text: 'name',
                            value: '$[name="V8.TFBytecodeGraphBuilder"] or $[0]'
                        },
                        { view: 'text', data: '" Compare with: "' },
                        {
                            view: 'select',
                            name: 'tfDiffPhase',
                            data: '[{ name: "---", value: null }] + phases',
                            text: 'name',
                            value: '$[0]'
                        }
                    ]
                }
            ],
            content: {
                view: 'block',
                className: 'tf-graph-container',
                content: [
                    {
                        view: 'block',
                        className: 'tf-graph-pane tf-graph-main-pane',
                        content: [
                            { view: 'h4', className: 'tf-pane-title', content: 'text:#.tfPhase.name' },
                            createGraphPane('#.tfPhase', '#.tfDiffPhase', false)
                        ]
                    },
                    {
                        view: 'block',
                        className: 'tf-graph-pane tf-graph-diff-pane',
                        when: '#.tfDiffPhase.name != "---"',
                        content: [
                            { view: 'h4', className: 'tf-pane-title', content: 'text:#.tfDiffPhase.name' },
                            createGraphPane('#.tfDiffPhase', '#.tfPhase', true)
                        ]
                    }
                ]
            }
        }, data, context);
    }
});
