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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between pointer-events-none"> {/* Prevent hover effects for now */}
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            {value}
                        </span>
                        {subtext && <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{subtext}</span>}
                    </div>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

export default function SystemStats({ data }) {
    if (!data) return null;

    const getStatusColor = (percent) => {
        if (percent > 90) return "red";
        if (percent > 70) return "yellow";
        return "green";
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
                title="CPU Usage"
                value={`${data.cpu}%`}
                icon={Cpu}
                color={getStatusColor(data.cpu)}
            />
            <StatCard
                title="Memory"
                value={`${data.ram.percent}%`}
                subtext={`${(data.ram.used / 1024 / 1024 / 1024).toFixed(1)} GB used`}
                icon={Activity}
                color={getStatusColor(data.ram.percent)}
            />
            <StatCard
                title="Disk"
                value={`${data.disk.percent}%`}
                subtext={`${(data.disk.used / 1024 / 1024 / 1024).toFixed(1)} GB used`}
                icon={HardDrive}
                color={getStatusColor(data.disk.percent)}
            />
            <StatCard
                title="Temperature"
                value={`${data.temperature.toFixed(1)}°C`}
                icon={Thermometer}
                color={data.temperature > 80 ? "red" : "blue"}
            />
        </div>
    );
}
