import React from 'react';
import { Activity, HardDrive, Cpu, Thermometer } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, color = "blue" }) => {
    const colorClasses = {
        blue: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
        green: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
        yellow: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300",
        red: "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300",
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            {value}
                        </span>
                        {subtext && <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{subtext}</span>}
                    </div>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

export default function SystemStats({ data }) {
    if (!data) return null;

    // Support both old and new data structures to prevent crashing
    const cpuPercent = typeof data.cpu === 'object' ? data.cpu.percent : data.cpu;
    const memory = data.memory || data.ram || { percent: 0, used: 0 };
    const disk = data.disk || { percent: 0, used: 0 };
    const temp = typeof data.temperature === 'number' ? data.temperature : 0;

    const getStatusColor = (percent) => {
        if (percent > 90) return "red";
        if (percent > 70) return "yellow";
        return "green";
    };

    const formatGB = (bytes) => (bytes / (1024 * 1024 * 1024)).toFixed(1);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
                title="CPU Usage"
                value={`${cpuPercent}%`}
                icon={Cpu}
                color={getStatusColor(cpuPercent)}
            />
            <StatCard
                title="Memory"
                value={`${memory.percent}%`}
                subtext={`${formatGB(memory.used)} GB used`}
                icon={Activity}
                color={getStatusColor(memory.percent)}
            />
            <StatCard
                title="Disk Usage"
                value={`${disk.percent}%`}
                subtext={`${formatGB(disk.used)} GB used`}
                icon={HardDrive}
                color={getStatusColor(disk.percent)}
            />
            <StatCard
                title="Temperature"
                value={`${temp.toFixed(1)}°C`}
                icon={Thermometer}
                color={temp > 75 ? "red" : temp > 60 ? "yellow" : "blue"}
            />
        </div>
    );
}
