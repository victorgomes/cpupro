discovery.view.define('turbofan-graph-viewer', {
    render(el, config, data, context) {
        el.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('tf-node-input')) {
                const nodeId = e.target.dataset.nodeId;
                const nodeEl = el.querySelector(`.tf-node-${nodeId}`);
                if (nodeEl) nodeEl.classList.add('tf-node-highlight');
            }
        });
        el.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('tf-node-input')) {
                const nodeId = e.target.dataset.nodeId;
                const nodeEl = el.querySelector(`.tf-node-${nodeId}`);
                if (nodeEl) nodeEl.classList.remove('tf-node-highlight');
            }
        });

        return this.render(el, {
            view: 'context',
            modifiers: [
                {
                    view: 'select',
                    name: 'tfPhase',
                    data: 'phases',
                    text: 'name',
                    value: '$[name="V8.TFBytecodeGraphBuilder"] or $[0]'
                }
            ],
            content: {
                view: 'block',
                content: [
                    { view: 'h4', data: '#.tfPhase.name' },
                    {
                        view: 'switch',
                        data: '#.tfPhase',
                        content: [
                            {
                                when: 'type = "graph"',
                                content: {
                                    view: 'list',
                                    data: 'data.nodes.sort(id ascN)',
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
                                            $edges: #.tfPhase.data.edges.[target = $nodeId];
                                            $inputsHTML: $edges.map(=> 
                                                '<span class="tf-node-input" data-node-id="' + source + '" style="color: ' + ($customColors[type] or 'inherit') + ';" title="' + type + '">#' + source + '</span>'
                                            ).join(', ');
                                            $titleHtml: title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                            '<div class="tf-node tf-node-' + id + '"><span class="tf-node-id">#' + id + '</span>:' + $titleHtml + '(' + $inputsHTML + ')</div>'
                                        `
                                    }
                                }
                            },
                            {
                                when: 'type = "turboshaft_graph"',
                                content: {
                                    view: 'list',
                                    data: 'data.blocks',
                                    item: [
                                        { view: 'h5', content: 'text:`Block ${id}`' },
                                        {
                                            view: 'list',
                                            data: '$blockId: id; #.tfPhase.data.nodes.[block_id = $blockId]',
                                            item: [
                                                { view: 'text', data: '`${id}: ${title} ${op_effects || ""}`' },
                                                {
                                                    view: 'list',
                                                    data: `$nodeId: id;
                                                        #.tfPhase.keys()
                                                            .[#.tfPhase[$].type = "turboshaft_custom_data"]
                                                            .({
                                                                name: $,
                                                                value: #.tfPhase[$].data.[key = $nodeId].value[0]
                                                            })
                                                            .[value]`,
                                                    whenData: true,
                                                    item: 'text:`${name}: ${value}`'
                                                }
                                            ]
                                        }
                                    ]
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
                                        { view: 'h5', content: 'text:`Block ${id}`' },
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
                    }
                ]
            }
        }, data, context);
    }
});
