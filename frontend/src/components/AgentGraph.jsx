import ReactFlow from "reactflow";
import "reactflow/dist/style.css";

export default function AgentGraph({ nodes, edges, onConnect }) {
    return (
        <div style={{ width: "100%", height: "500px" }}>
            <ReactFlow nodes={nodes} edges={edges} onConnect={onConnect} fitView />
        </div>
    );
}
