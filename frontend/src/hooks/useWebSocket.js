import { useState, useEffect, useRef } from 'react';

export const useWebSocket = (url) => {
    const [data, setData] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef(null);

    useEffect(() => {
        let reconnectTimeout;

        const connect = () => {
            wsRef.current = new WebSocket(url);

            wsRef.current.onopen = () => {
                console.log('WS Connected');
                setIsConnected(true);
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const parsed = JSON.parse(event.data);
                    setData(parsed);
                } catch (e) {
                    console.error('Parse error', e);
                }
            };

            wsRef.current.onclose = () => {
                console.log('WS Closed, reconnecting...');
                setIsConnected(false);
                reconnectTimeout = setTimeout(connect, 3000);
            };

            wsRef.current.onerror = (err) => {
                console.error('WS Error', err);
                wsRef.current.close();
            };
        };

        connect();

        return () => {
            if (wsRef.current) wsRef.current.close();
            clearTimeout(reconnectTimeout);
        };
    }, [url]);

    return { data, isConnected };
};
