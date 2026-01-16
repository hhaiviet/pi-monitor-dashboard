import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProcessList = () => {
    const [processes, setProcesses] = useState([]);
    const [sortBy, setSortBy] = useState('cpu');
    const [loading, setLoading] = useState(false);

    const fetchProcesses = async () => {
        try {
            // Don't set loading on every refresh to avoid flicker
            if (processes.length === 0) setLoading(true);
            const response = await axios.get(`/api/processes?sort_by=${sortBy}&limit=20`); // Limit to 20 for UI
            setProcesses(response.data.processes);
        } catch (error) {
            console.error('Error fetching processes:', error);
        } finally {
            if (processes.length === 0) setLoading(false);
        }
    };

    useEffect(() => {
        fetchProcesses();
        const interval = setInterval(fetchProcesses, 5000);
        return () => clearInterval(interval);
    }, [sortBy]);

    const handleKillProcess = async (pid, name) => {
        if (!window.confirm(`Kill process "${name}" (PID: ${pid})?`)) return;

        try {
            await axios.delete(`/api/processes/${pid}`);
            alert(`Process ${name} terminated`);
            fetchProcesses();
        } catch (error) {
            alert(`Failed to kill process: ${error.response?.data?.detail || error.message}`);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Processes</h3>
                <div className="flex gap-2 text-sm">
                    <button
                        onClick={() => setSortBy('cpu')}
                        className={`px-3 py-1 rounded-md transition-colors ${sortBy === 'cpu' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        CPU
                    </button>
                    <button
                        onClick={() => setSortBy('memory')}
                        className={`px-3 py-1 rounded-md transition-colors ${sortBy === 'memory' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                        Mem
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">PID</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3 text-right">CPU</th>
                            <th className="px-6 py-3 text-right">Mem</th>
                            <th className="px-6 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processes.map((proc) => (
                            <tr key={proc.pid} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{proc.pid}</td>
                                <td className="px-6 py-4 font-mono">{proc.name}</td>
                                <td className="px-6 py-4">{proc.user}</td>
                                <td className="px-6 py-4 text-right">
                                    <span className={proc.cpu_percent > 50 ? 'text-red-600 font-bold' : ''}>
                                        {proc.cpu_percent}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className={proc.memory_percent > 10 ? 'text-yellow-600' : ''}>
                                        {proc.memory_percent}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => handleKillProcess(proc.pid, proc.name)}
                                        className="font-medium text-red-600 dark:text-red-500 hover:underline"
                                    >
                                        Kill
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProcessList;
