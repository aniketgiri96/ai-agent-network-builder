export default function AgentNode({ data }) {
    return (
        <div className="p-3 bg-white rounded-xl shadow border w-40">
            <h4 className="font-bold">{data.name}</h4>
            <p className="text-xs text-gray-500">{data.role}</p>
        </div>
    );
}
