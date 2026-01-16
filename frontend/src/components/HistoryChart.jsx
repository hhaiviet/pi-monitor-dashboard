import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const HistoryChart = () => {
    const [data, setData] = useState([]);
    const [hours, setHours] = useState(24);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL || '/api',
    });

    const fetchHistory = async () => {
        try {
            // Only set loading on first load or manual refresh, not background polling
            if (data.length === 0) setLoading(true);
            setError(null);

            const response = await api.get(`/system/history?hours=${hours}`);
            const historyData = response.data.data || [];

            console.log(`Fetched ${historyData.length} history records`);
            setData(historyData);
        } catch (err) {
            console.error('Error fetching history:', err);
            setError('Failed to fetch history data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 30000); // Polling every 30s match backend
        return () => clearInterval(interval);
    }, [hours]);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg text-xs">
                    <p className="font-bold mb-2 text-gray-700 dark:text-gray-300">{new Date(label).toLocaleString()}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="mb-1">
                            {entry.name}: {entry.value}%
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8 transition-colors duration-200">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">System History</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Resource usage trends over time</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={1}>Last Hour</option>
                        <option value={6}>Last 6 Hours</option>
                        <option value={12}>Last 12 Hours</option>
                        <option value={24}>Last 24 Hours</option>
                    </select>
                    <button
                        onClick={() => { setLoading(true); fetchHistory(); }}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md text-sm transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            <div className="h-[300px] w-full">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-2"></div>
                        Loading history data...
                    </div>
                ) : error ? (
                    <div className="h-full flex items-center justify-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                        <span className="flex items-center gap-2">
                            ⚠️ {error}
                        </span>
                    </div>
                ) : data.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="mb-2">📊 No historical data available yet</p>
                        <p className="text-xs">Data collection runs every 30 seconds</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-gray-700" />
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={formatTime}
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={50}
                            />
                            <YAxis
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                domain={[0, 100]}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="cpu"
                                name="CPU"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorCpu)"
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="memory"
                                name="Memory"
                                stroke="#10B981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorMem)"
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default HistoryChart;
