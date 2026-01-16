import React, { useState, useEffect } from 'react';
import axios from 'axios';

const N8nMonitor = () => {
    const [status, setStatus] = useState(null);
    const [workflows, setWorkflows] = useState([]);
    const [executions, setExecutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, workflows, executions
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL || '/api',
    });

    const fetchN8nData = async () => {
        try {
            // Fetch status
            const statusRes = await api.get('/n8n/status');
            setStatus(statusRes.data);

            // Fetch workflows
            const workflowsRes = await api.get('/n8n/workflows');
            setWorkflows(workflowsRes.data.workflows || []);

            // Fetch recent executions
            const executionsRes = await api.get('/n8n/executions?limit=10');
            setExecutions(executionsRes.data.executions || []);

            setLastUpdated(new Date());
            setLoading(false);
        } catch (error) {
            console.error('Error fetching n8n data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchN8nData();
        const interval = setInterval(fetchN8nData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const handleActivateWorkflow = async (workflowId) => {
        try {
            await api.post(`/n8n/workflows/${workflowId}/activate`);
            fetchN8nData();
        } catch (error) {
            alert(`Failed to activate: ${error.response?.data?.detail || error.message}`);
        }
    };

    const handleDeactivateWorkflow = async (workflowId) => {
        try {
            await api.post(`/n8n/workflows/${workflowId}/deactivate`);
            fetchN8nData();
        } catch (error) {
            alert(`Failed to deactivate: ${error.response?.data?.detail || error.message}`);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            running: 'bg-green-100 text-green-800',
            stopped: 'bg-red-100 text-red-800',
            unknown: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || colors.unknown;
    };

    const getExecutionStatusBadge = (status) => {
        const colors = {
            success: 'bg-green-100 text-green-800',
            error: 'bg-red-100 text-red-800',
            running: 'bg-blue-100 text-blue-800',
            waiting: 'bg-yellow-100 text-yellow-800',
            crashed: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading && !status) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                            🔧 n8n Service Monitor
                            {status && (
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(status.status)}`}>
                                    {status.status}
                                </span>
                            )}
                        </h2>
                        <div className="text-xs text-gray-500 mt-1">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </div>
                    </div>
                    <button
                        onClick={fetchN8nData}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'overview'
                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('workflows')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'workflows'
                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        Workflows ({workflows.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('executions')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'executions'
                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        Executions
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && status && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Health Status</div>
                                <div className="text-2xl font-bold mt-1 dark:text-blue-100">
                                    {status.healthy ? '✅ Healthy' : '❌ Unhealthy'}
                                </div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                <div className="text-sm text-green-600 dark:text-green-400 font-medium">Total Workflows</div>
                                <div className="text-2xl font-bold mt-1 dark:text-green-100">{status.workflows_count || 0}</div>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Active Executions</div>
                                <div className="text-2xl font-bold mt-1 dark:text-purple-100">{status.active_executions || 0}</div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Connection Info</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <div>URL: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{status.url}</code></div>
                                <div>Version: {status.version || 'Unknown'}</div>
                            </div>
                        </div>

                        {!status.healthy && (
                            <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 rounded-lg p-4">
                                <div className="font-medium text-red-800 dark:text-red-300">⚠️ Connection Issue</div>
                                <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    {status.error || 'Cannot connect to n8n'}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Workflows Tab */}
                {activeTab === 'workflows' && (
                    <div>
                        {workflows.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No workflows found
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {workflows.map((workflow) => (
                                    <div
                                        key={workflow.id}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0 mr-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-medium text-gray-900 dark:text-white truncate" title={workflow.name}>
                                                        {workflow.name}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${workflow.active
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                                                        }`}>
                                                        {workflow.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-2">
                                                    ID: {workflow.id}
                                                </div>
                                                {workflow.tags && workflow.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {workflow.tags.map((tag, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs"
                                                            >
                                                                {tag.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                {workflow.active ? (
                                                    <button
                                                        onClick={() => handleDeactivateWorkflow(workflow.id)}
                                                        className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 rounded text-xs font-medium transition-colors"
                                                    >
                                                        Stop
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleActivateWorkflow(workflow.id)}
                                                        className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 rounded text-xs font-medium transition-colors"
                                                    >
                                                        Start
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Executions Tab */}
                {activeTab === 'executions' && (
                    <div>
                        {executions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No recent executions
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Started</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {executions.map((exec) => {
                                            const duration = exec.stoppedAt
                                                ? ((new Date(exec.stoppedAt) - new Date(exec.startedAt)) / 1000).toFixed(2)
                                                : null;

                                            return (
                                                <tr key={exec.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-500 dark:text-gray-400">
                                                        {exec.id.substring(0, 8)}...
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getExecutionStatusBadge(exec.status)}`}>
                                                            {exec.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(exec.startedAt).toLocaleTimeString()}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                                                        {duration ? `${duration}s` : '...'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default N8nMonitor;
