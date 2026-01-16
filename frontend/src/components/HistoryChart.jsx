import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const HistoryChart = () => {
    const [data, setData] = useState([]);
    const [hours, setHours] = useState(24);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get(`/api/system/history?hours=${hours}`);
                setData(response.data.data);
            } catch (error) {
                console.error('Error fetching history:', error);
            }
        };

        fetchHistory();
        const interval = setInterval(fetchHistory, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [hours]);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">System History</h2>
                <select
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                    <option value={1}>Last Hour</option>
                    <option value={6}>Last 6 Hours</option>
                    <option value={24}>Last 24 Hours</option>
                </select>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={formatTime}
                            minTickGap={50}
                            stroke="#9CA3AF"
                        />
                        <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                        <Tooltip
                            labelFormatter={formatTime}
                            formatter={(value) => `${value.toFixed(1)}%`}
                            contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line
                            type="monotone"
                            dataKey="cpu"
                            stroke="#3B82F6"
                            name="CPU"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="memory"
                            stroke="#10B981"
                            name="Memory"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="disk"
                            stroke="#F59E0B"
                            name="Disk"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HistoryChart;
