import React from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import SystemStats from './components/SystemStats';
import N8nMonitor from './components/N8nMonitor';
import ProcessList from './components/ProcessList';
import HistoryChart from './components/HistoryChart';
import { LayoutDashboard } from 'lucide-react';

function App() {
    // Use WS from environment or default to relative path
    // Use WS from environment or default to relative path with auto-protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.host}/ws/system`;
    const { data, isConnected } = useWebSocket(wsUrl);

    return (
        <div className="min-h-screen transition-colors duration-200">
            <nav className="bg-cyber-gray bg-opacity-90 backdrop-blur-lg border-b border-neon-blue/20 sticky top-0 z-50 shadow-[0_0_15px_rgba(0,243,255,0.1)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center group cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="relative">
                                <LayoutDashboard className="w-8 h-8 text-neon-blue drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]" />
                                <div className="absolute inset-0 blur-sm bg-neon-blue opacity-40 animate-pulse"></div>
                            </div>
                            <span className="ml-3 text-xl font-cyber font-bold tracking-widest text-white text-shadow-glow">
                                PI<span className="text-neon-blue">MONITOR</span>
                            </span>
                        </div>
                        <div className={`flex items-center px-4 py-1.5 rounded-full text-xs font-cyber tracking-widest border ${isConnected
                                ? 'bg-neon-green/10 text-neon-green border-neon-green/50 shadow-[0_0_10px_rgba(10,255,0,0.3)]'
                                : 'bg-red-500/10 text-red-500 border-red-500/50 shadow-[0_0_10px_rgba(255,0,0,0.3)]'
                            }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-neon-green animate-pulse' : 'bg-red-500'}`} />
                            {isConnected ? 'ONLINE' : 'OFFLINE'}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <SystemStats data={data} />

                <HistoryChart />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <N8nMonitor />
                    <ProcessList />
                </div>
            </main>
        </div>
    );
}

export default App;
