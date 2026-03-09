discovery.view.define('turbofan-graph-viewer', {
    render(el, config, data, context) {
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
                                    view: 'tree',
                                    data: 'data.nodes',
                                    expanded: 3,
                                    item: [
                                        { view: 'text', data: '`[${id}] ${title}`' },
                                        {
                                            view: 'list',
                                            data: '` Properties: ${properties}`',
                                            whenData: true,
                                            item: 'text'
                                        }
                                    ],
                                    children: '$node: $; #.tfPhase.data.edges.[source = $node.id].({ ...$node, id: target, title: #.tfPhase.data.nodes.[id = target].title[0] })'
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
