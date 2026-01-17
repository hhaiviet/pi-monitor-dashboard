import React from 'react';
import { Activity, HardDrive, Cpu, Thermometer, Globe, Zap } from 'lucide-react';

const CyberCard = ({ title, value, subtext, icon: Icon, colorClass, shadowClass, children }) => (
    <div className={`bg-cyber-gray bg-opacity-80 backdrop-blur-md p-6 rounded-xl border border-opacity-50 ${colorClass} ${shadowClass} transition-all hover:scale-105 duration-300 relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon className="w-16 h-16" />
        </div>
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className={`font-cyber text-xs uppercase tracking-widest opacity-80 mb-1 ${colorClass.split(' ')[0].replace('border-', 'text-')}`}>{title}</p>
                    <h3 className="text-3xl font-bold text-white font-cyber tracking-wide text-shadow-glow">{value}</h3>
                </div>
                <div className={`p-2 rounded-lg bg-opacity-20 ${colorClass.split(' ')[0].replace('border-', 'bg-')}`}>
                    <Icon className={`w-6 h-6 ${colorClass.split(' ')[0].replace('border-', 'text-')}`} />
                </div>
            </div>
            {children}
            {subtext && (
                <p className="text-gray-400 text-xs mt-3 font-mono border-t border-gray-700 pt-2 flex items-center">
                    <Zap className="w-3 h-3 mr-1 text-yellow-500" />
                    {subtext}
                </p>
            )}
        </div>
    </div>
);

export default function SystemStats({ data }) {
    if (!data) return null;

    // Data normalization
    const cpuPercent = typeof data.cpu === 'object' ? data.cpu.percent : data.cpu;
    const cpuCount = typeof data.cpu === 'object' ? data.cpu.count : '?';
    const memory = data.memory || { percent: 0, used: 0, total: 0 };
    const disk = data.disk || { percent: 0, used: 0, total: 0 };
    const temp = typeof data.temperature === 'number' ? data.temperature : 0;
    const publicIp = data.public_ip || 'Loading...';

    const formatGB = (bytes) => (bytes / (1024 * 1024 * 1024)).toFixed(1);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <CyberCard
                title="CPU Core"
                value={`${cpuPercent}%`}
                subtext={`${cpuCount} Threads Active`}
                icon={Cpu}
                colorClass="border-neon-blue"
                shadowClass="shadow-neon-blue"
            >
                <div className="w-full bg-gray-900 rounded-full h-1.5 mt-2 border border-gray-700 overflow-hidden">
                    <div
                        className="bg-neon-blue h-1.5 rounded-full shadow-[0_0_10px_#00f3ff] transition-all duration-500 relative"
                        style={{ width: `${cpuPercent}%` }}
                    >
                        <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                    </div>
                </div>
            </CyberCard>

            <CyberCard
                title="Memory RAM"
                value={`${memory.percent}%`}
                subtext={`${formatGB(memory.used)} GB / ${formatGB(memory.total)} GB`}
                icon={Activity}
                colorClass="border-neon-pink"
                shadowClass="shadow-neon-pink"
            >
                <div className="w-full bg-gray-900 rounded-full h-1.5 mt-2 border border-gray-700 overflow-hidden">
                    <div
                        className="bg-neon-pink h-1.5 rounded-full shadow-[0_0_10px_#ff00ff] transition-all duration-500 relative"
                        style={{ width: `${memory.percent}%` }}
                    >
                        <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                    </div>
                </div>
            </CyberCard>

            <CyberCard
                title="Disk NVMe"
                value={`${disk.percent}%`}
                subtext={`${formatGB(disk.used)} GB Used`}
                icon={HardDrive}
                colorClass="border-neon-green"
                shadowClass="shadow-neon-green"
            >
                <div className="w-full bg-gray-900 rounded-full h-1.5 mt-2 border border-gray-700 overflow-hidden">
                    <div
                        className="bg-neon-green h-1.5 rounded-full shadow-[0_0_10px_#0aff00] transition-all duration-500 relative"
                        style={{ width: `${disk.percent}%` }}
                    >
                        <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                    </div>
                </div>
            </CyberCard>

            <CyberCard
                title="Thermal Status"
                value={`${temp.toFixed(1)}°C`}
                icon={Thermometer}
                colorClass="border-orange-500"
                shadowClass="shadow-orange-500/50"
            >
                <div className="mt-4 pt-3 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-cyber text-xs uppercase">Public IP</span>
                        <Globe className="w-4 h-4 text-neon-blue animate-spin-slow" />
                    </div>
                    <div className="mt-1 flex items-center space-x-2">
                        <span className="text-lg font-mono text-neon-blue tracking-wider truncate">
                            {publicIp}
                        </span>
                    </div>
                </div>
            </CyberCard>
        </div>
    );
}
