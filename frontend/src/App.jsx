import React from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import SystemStats from './components/SystemStats';
import N8nControl from './components/N8nControl';
import ProcessList from './components/ProcessList';
import HistoryChart from './components/HistoryChart';
import { LayoutDashboard } from 'lucide-react';

function App() {
    // Use WS from environment or default to relative path
    const wsUrl = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:8000/ws/system`;
    const { data, isConnected } = useWebSocket(wsUrl);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 text-gray-900 dark:text-gray-100">
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <LayoutDashboard className="w-8 h-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold">Pi Monitor</span>
                        </div>
                        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${isConnected ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <SystemStats data={data} />

                <HistoryChart />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <N8nControl />
                    <ProcessList />
                </div>
            </main>
        </div>
    );
}

export default App;
