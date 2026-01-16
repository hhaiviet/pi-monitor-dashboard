import React, { useState } from 'react';
import axios from 'axios';
import { Play, Square, RotateCw, Terminal } from 'lucide-react';

export default function N8nControl() {
    const [status, setStatus] = useState("unknown");
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const [showLogs, setShowLogs] = useState(false);

    const controlService = async (action) => {
        setLoading(true);
        try {
            await axios.post(`/api/n8n/${action}`);
            checkStatus();
        } catch (error) {
            console.error(error);
            alert("Action failed");
        } finally {
            setLoading(false);
        }
    };

    const checkStatus = async () => {
        try {
            const res = await axios.get('/api/n8n/status');
            setStatus(res.data.status);
        } catch (e) {
            setStatus("error");
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await axios.get('/api/n8n/logs');
            setLogs(res.data.logs);
            setShowLogs(!showLogs);
        } catch (e) {
            console.error(e);
        }
    };

    React.useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">n8n Service Control</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}>
                    {status.toUpperCase()}
                </span>
            </div>

            <div className="p-6">
                <div className="flex flex-wrap gap-4 mb-6">
                    <button
                        onClick={() => controlService('start')}
                        disabled={loading || status === 'active'}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Play className="w-4 h-4 mr-2" /> Start
                    </button>
                    <button
                        onClick={() => controlService('stop')}
                        disabled={loading || status !== 'active'}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Square className="w-4 h-4 mr-2" /> Stop
                    </button>
                    <button
                        onClick={() => controlService('restart')}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <RotateCw className="w-4 h-4 mr-2" /> Restart
                    </button>
                    <button
                        onClick={fetchLogs}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ml-auto"
                    >
                        <Terminal className="w-4 h-4 mr-2" /> {showLogs ? 'Hide Logs' : 'Show Logs'}
                    </button>
                </div>

                {showLogs && (
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm h-64 overflow-y-auto">
                        {logs.map((line, i) => (
                            <div key={i} className="text-gray-300 border-b border-gray-800 py-1 last:border-0">
                                {line}
                            </div>
                        ))}
                        {logs.length === 0 && <div className="text-gray-500 italic">No logs available</div>}
                    </div>
                )}
            </div>
        </div>
    );
}
