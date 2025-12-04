import { useState, useEffect, useCallback, useRef } from "react";
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    MarkerType
} from "reactflow";
import "reactflow/dist/style.css";
import { API_BASE_URL } from "../config";

const API_BASE = API_BASE_URL;

// --- Icons ---
const RobotIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
);
const UserIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const OutputIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
);
const PlayIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);
const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const TerminalIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
);

// --- Custom Node Component ---
function AgentNode({ data, selected }) {
    const colors = {
        'Input': {
            bg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            border: '#34d399',
            icon: <UserIcon />
        },
        'LLM Agent': {
            bg: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            border: '#818cf8',
            icon: <RobotIcon />
        },
        'Output': {
            bg: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)',
            border: '#f472b6',
            icon: <OutputIcon />
        },
        'default': {
            bg: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
            border: '#94a3b8',
            icon: <RobotIcon />
        }
    };

    const style = colors[data.type] || colors['default'];

    return (
        <div className="relative group">
            {/* Glow Effect on Selection */}
            <div style={{
                position: 'absolute',
                inset: -2,
                borderRadius: '14px',
                background: selected ? style.border : 'transparent',
                opacity: 0.5,
                filter: 'blur(4px)',
                transition: 'all 0.3s ease'
            }} />

            <div style={{
                background: '#1e293b', // Dark slate bg
                borderRadius: '12px',
                minWidth: '220px',
                border: `1px solid ${selected ? style.border : 'rgba(255,255,255,0.1)'}`,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
                transition: 'all 0.2s ease'
            }}>
                {/* Header */}
                <div style={{
                    background: style.bg,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ color: 'white' }}>{style.icon}</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{data.label}</div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {data.type}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '12px 16px' }}>
                    {data.role && (
                        <div style={{
                            fontSize: '12px',
                            color: '#94a3b8',
                            lineHeight: '1.4',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {data.role}
                        </div>
                    )}
                    <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{
                            fontSize: '10px',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#cbd5e1',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            {data.model || 'GPT-3.5'}
                        </span>
                    </div>
                </div>

                {/* Handles */}
                <Handle type="target" position={Position.Left} style={{ width: 10, height: 10, background: '#e2e8f0' }} />
                <Handle type="source" position={Position.Right} style={{ width: 10, height: 10, background: '#e2e8f0' }} />
            </div>
        </div>
    );
}

const nodeTypes = { agent: AgentNode };

export default function Builder() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [logs, setLogs] = useState([
        { from: 'System', to: 'User', message: 'Ready to build your agent network.', timestamp: new Date().toLocaleTimeString() }
    ]);
    const [showModal, setShowModal] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [agentForm, setAgentForm] = useState({
        name: '',
        role: '',
        goals: '',
        model: 'gpt-3.5-turbo',
        type: 'LLM Agent'
    });

    const logsEndRef = useRef(null);
    const nodeIdCounter = useRef(1);

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    const onConnect = useCallback(
        async (params) => {
            setEdges((eds) => addEdge({
                ...params,
                animated: true,
                style: { stroke: '#6366f1', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
            }, eds));

            try {
                await fetch(`${API_BASE}/connect`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ from: params.source, to: params.target })
                });
                addLog('System', 'User', `Connected: ${params.source} → ${params.target}`);
            } catch (err) {
                console.error('Failed to connect agents:', err);
            }
        },
        [setEdges]
    );

    const addLog = (from, to, message) => {
        setLogs(prev => [...prev, {
            from,
            to,
            message,
            timestamp: new Date().toLocaleTimeString()
        }]);
    };

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws");

        ws.onopen = () => addLog('System', 'Client', 'Connected to Agent Engine');
        ws.onmessage = (evt) => {
            const msg = JSON.parse(evt.data);
            addLog(msg.from, msg.to, msg.message);
        };
        ws.onerror = () => addLog('System', 'Client', 'Connection Error');

        return () => ws.close();
    }, []);

    const handleAddAgent = async () => {
        if (!agentForm.name || !agentForm.role) return;

        const agentId = `agent-${nodeIdCounter.current++}`;
        const agentData = {
            id: agentId,
            name: agentForm.name,
            role: agentForm.role,
            goals: agentForm.goals.split(',').map(g => g.trim()).filter(g => g),
            model: agentForm.model
        };

        try {
            const response = await fetch(`${API_BASE}/agent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(agentData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            const newNode = {
                id: result.agent_id || agentId,
                type: 'agent',
                position: {
                    x: 100 + (nodes.length % 3) * 300,
                    y: 100 + Math.floor(nodes.length / 3) * 200
                },
                data: {
                    label: agentForm.name,
                    type: agentForm.type,
                    role: agentForm.role,
                    model: agentForm.model,
                    ...agentData
                }
            };

            setNodes((nds) => [...nds, newNode]);
            addLog('System', 'User', `Created agent: ${agentForm.name}`);
            setAgentForm({ name: '', role: '', goals: '', model: 'gpt-3.5-turbo', type: 'LLM Agent' });
            setShowModal(false);
        } catch (err) {
            console.error('Error creating agent:', err);
            // Fallback for demo/offline mode or error handling
            const newNode = {
                id: agentId,
                type: 'agent',
                position: {
                    x: 100 + (nodes.length % 3) * 300,
                    y: 100 + Math.floor(nodes.length / 3) * 200
                },
                data: {
                    label: agentForm.name,
                    type: agentForm.type,
                    role: agentForm.role,
                    model: agentForm.model,
                    ...agentData
                }
            };
            setNodes((nds) => [...nds, newNode]);
            addLog('System', 'User', `Created agent (Local Fallback): ${agentForm.name}`);
            setShowModal(false);
        }
    };

    const handleRunFlow = async () => {
        if (nodes.length === 0) {
            addLog('System', 'User', '⚠️ No agents to run!');
            return;
        }

        setIsRunning(true);
        addLog('System', 'User', '🚀 Starting flow execution...');

        const targetIds = new Set(edges.map(e => e.target));
        const sourceNodes = nodes.filter(n => !targetIds.has(n.id));

        if (sourceNodes.length === 0) {
            addLog('System', 'User', '⚠️ No start node found (node with no inputs).');
            setIsRunning(false);
            return;
        }

        const startNode = sourceNodes[0];
        const initialMessage = `Start processing task for ${startNode.data.label}`;

        try {
            const response = await fetch(`${API_BASE}/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: startNode.id,
                    message: initialMessage
                })
            });
            const result = await response.json();

            if (!result.messages || result.messages.length === 0) {
                addLog('System', 'User', 'Flow completed.');
            }
        } catch (err) {
            addLog('System', 'User', `Execution error: ${err.message}`);
        }

        setIsRunning(false);
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
            {/* Navbar */}
            <nav style={{
                height: '64px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(10px)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '32px', height: '32px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 'bold'
                    }}>AI</div>
                    <h1 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                        Agent Network <span style={{ color: '#6366f1' }}>Builder</span>
                    </h1>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setShowModal(true)}
                        className="glass-input"
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        <PlusIcon /> Add Agent
                    </button>
                    <button
                        onClick={handleRunFlow}
                        disabled={isRunning}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            background: isRunning ? '#475569' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: 'white',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            cursor: isRunning ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            boxShadow: isRunning ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.4)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <PlayIcon /> {isRunning ? 'Running...' : 'Run Flow'}
                    </button>
                </div>
            </nav>

            {/* Main Workspace */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* Canvas Area */}
                <div style={{ flex: 1, position: 'relative' }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        fitView
                        defaultEdgeOptions={{
                            type: 'smoothstep',
                            animated: true,
                            style: { stroke: '#6366f1', strokeWidth: 2 }
                        }}
                    >
                        <Background color="#334155" gap={24} size={1} />
                        <Controls style={{
                            background: '#1e293b',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            padding: '4px'
                        }} />
                        <MiniMap
                            style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            nodeColor="#6366f1"
                            maskColor="rgba(15, 23, 42, 0.8)"
                        />
                    </ReactFlow>
                </div>

                {/* Right Sidebar - Logs */}
                <div style={{
                    width: '350px',
                    background: '#0f172a',
                    borderLeft: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        padding: '16px',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <TerminalIcon />
                        <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', margin: 0 }}>System Logs</h2>
                    </div>

                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px',
                        display: 'flex', flexDirection: 'column', gap: '12px'
                    }}>
                        {logs.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#64748b', marginTop: '40px', fontSize: '13px' }}>
                                No activity yet.
                            </div>
                        )}
                        {logs.map((l, i) => (
                            <div key={i} className="animate-fade-in" style={{
                                background: 'rgba(30, 41, 59, 0.5)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                padding: '12px',
                                fontSize: '13px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ color: '#818cf8', fontWeight: '600' }}>{l.from}</span>
                                        <span style={{ color: '#64748b', fontSize: '10px' }}>➜</span>
                                        <span style={{ color: '#c084fc', fontWeight: '600' }}>{l.to}</span>
                                    </div>
                                    <span style={{ color: '#64748b', fontSize: '10px' }}>{l.timestamp}</span>
                                </div>
                                <div style={{ color: '#cbd5e1', lineHeight: '1.5' }}>{l.message}</div>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 50
                }}>
                    <div className="glass-panel" style={{
                        width: '480px',
                        borderRadius: '16px',
                        padding: '32px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '24px' }}>
                            Configure New Agent
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px', fontWeight: '500' }}>AGENT NAME</label>
                                <input
                                    className="glass-input"
                                    value={agentForm.name}
                                    onChange={e => setAgentForm({ ...agentForm, name: e.target.value })}
                                    placeholder="e.g. Data Processor"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px', fontWeight: '500' }}>TYPE</label>
                                    <select
                                        className="glass-input"
                                        value={agentForm.type}
                                        onChange={e => setAgentForm({ ...agentForm, type: e.target.value })}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', boxSizing: 'border-box' }}
                                    >
                                        <option value="Input">Input Source</option>
                                        <option value="LLM Agent">LLM Agent</option>
                                        <option value="Output">Output Action</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px', fontWeight: '500' }}>MODEL</label>
                                    <select
                                        className="glass-input"
                                        value={agentForm.model}
                                        onChange={e => setAgentForm({ ...agentForm, model: e.target.value })}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', boxSizing: 'border-box' }}
                                    >
                                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                        <option value="gpt-4">GPT-4</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px', fontWeight: '500' }}>SYSTEM ROLE</label>
                                <textarea
                                    className="glass-input"
                                    value={agentForm.role}
                                    onChange={e => setAgentForm({ ...agentForm, role: e.target.value })}
                                    placeholder="Define the agent's persona and responsibilities..."
                                    rows={4}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', resize: 'vertical', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        flex: 1, padding: '10px', borderRadius: '8px',
                                        background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#cbd5e1', cursor: 'pointer', fontWeight: '500'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddAgent}
                                    style={{
                                        flex: 1, padding: '10px', borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none',
                                        color: 'white', cursor: 'pointer', fontWeight: '600',
                                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                                    }}
                                >
                                    Create Agent
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
