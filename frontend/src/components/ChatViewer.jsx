export default function ChatViewer({ logs }) {
    return (
        <div className="bg-black text-green-400 p-4 h-64 overflow-auto rounded-xl text-sm">
            {logs.map((l, i) => (
                <div key={i}>
                    <b>{l.from}</b> → <b>{l.to}</b>: {l.message}
                </div>
            ))}
        </div>
    );
}
