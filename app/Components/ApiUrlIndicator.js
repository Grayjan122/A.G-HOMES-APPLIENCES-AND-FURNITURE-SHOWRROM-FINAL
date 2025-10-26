'use client';
import { useState, useEffect } from 'react';

const ApiUrlIndicator = () => {
    const [baseURL, setBaseURL] = useState('');
    const [environment, setEnvironment] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = sessionStorage.getItem('baseURL') || 'Not set';
            const env = window.location.hostname === 'localhost' ? 'Development (Localhost)' : 'Production';
            setBaseURL(url);
            setEnvironment(env);
        }
    }, []);

    if (typeof window === 'undefined') return null;

    // Only show if not production (remove this check to always show)
    if (window.location.hostname !== 'localhost') return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            backgroundColor: window.location.hostname === 'localhost' ? '#28a745' : '#007bff',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            zIndex: 9999,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontFamily: 'monospace'
        }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                🌐 {environment}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>
                API: {baseURL}
            </div>
        </div>
    );
};

export default ApiUrlIndicator;

