import { useState, useEffect, useCallback } from "react";
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState
} from "reactflow";
import "reactflow/dist/style.css";

// Custom Agent Node Component
function AgentNode({ data }) {
    return (
        <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '16px 24px',
            color: 'white',
            boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
            border: '2px solid rgba(255,255,255,0.2)',
            minWidth: '150px',
            textAlign: 'center'
        }}>
            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>
                {data.type || 'Agent'}
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                {data.label}
            </div>
        </div>
    );
}

const nodeTypes = { agent: AgentNode };

// Sample initial nodes for demo
const initialNodes = [
    {
        id: '1',
        type: 'agent',
        position: { x: 100, y: 100 },
        data: { label: 'User Input', type: 'Input' }
    },
    {
        id: '2',
        type: 'agent',
        position: { x: 350, y: 100 },
        data: { label: 'AI Processor', type: 'LLM Agent' }
    },
    {
        id: '3',
        type: 'agent',
        position: { x: 600, y: 100 },
        data: { label: 'Response', type: 'Output' }
    }
];

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#667eea', strokeWidth: 2 } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#667eea', strokeWidth: 2 } }
];

export default function Builder() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [logs, setLogs] = useState([
        { from: 'System', to: 'User', message: 'Welcome to AI Agent Network Builder!' },
        { from: 'System', to: 'User', message: 'Connect to backend to see live agent communications.' }
    ]);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#667eea', strokeWidth: 2 } }, eds)),
        [setEdges]
    );

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws");

        ws.onopen = () => {
            setLogs((prev) => [...prev, { from: 'System', to: 'Client', message: 'Connected to backend!' }]);
        };

        ws.onmessage = (evt) => {
            const msg = JSON.parse(evt.data);
            setLogs((prev) => [...prev, msg]);
        };

        ws.onerror = () => {
            setLogs((prev) => [...prev, { from: 'System', to: 'Client', message: 'WebSocket connection error' }]);
        };

        return () => ws.close();
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
        }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0
                }}>
                    🤖 AI Agent Network Builder
                </h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                    }}>
                        + Add Agent
                    </button>
                    <button style={{
                        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(56, 239, 125, 0.4)'
                    }}>
                        ▶ Run Flow
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '24px',
                flex: 1
            }}>
                {/* Graph Canvas */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                    height: '600px'
                }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Background color="#667eea" gap={20} size={1} />
                        <Controls style={{
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }} />
                        <MiniMap
                            nodeColor="#667eea"
                            maskColor="rgba(0,0,0,0.8)"
                            style={{
                                background: 'rgba(0,0,0,0.5)',
                                borderRadius: '8px'
                            }}
                        />
                    </ReactFlow>
                </div>

                {/* Chat/Logs Panel */}
                <div style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <h2 style={{
                        color: '#667eea',
                        fontSize: '18px',
                        fontWeight: '600',
                        marginBottom: '16px',
                        margin: '0 0 16px 0'
                    }}>
                        📡 Agent Communications
                    </h2>
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        {logs.map((l, i) => (
                            <div key={i} style={{
                                background: 'rgba(102, 126, 234, 0.1)',
                                borderRadius: '8px',
                                padding: '12px',
                                borderLeft: '3px solid #667eea'
                            }}>
                                <div style={{
                                    fontSize: '12px',
                                    color: '#888',
                                    marginBottom: '4px'
                                }}>
                                    <span style={{ color: '#667eea', fontWeight: '600' }}>{l.from}</span>
                                    {' → '}
                                    <span style={{ color: '#764ba2', fontWeight: '600' }}>{l.to}</span>
                                </div>
                                <div style={{ color: '#e0e0e0', fontSize: '14px' }}>
                                    {l.message}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
