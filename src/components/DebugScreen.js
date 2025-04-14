// src/components/DebugScreen.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const DebugContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  max-height: 50vh;
  background-color: rgba(0, 0, 0, 0.8);
  color: #00ff00;
  font-family: monospace;
  font-size: 12px;
  padding: 10px;
  overflow-y: auto;
  z-index: 9999;
`;

const DebugHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const DebugButton = styled.button`
  background-color: #333;
  color: white;
  border: 1px solid #666;
  padding: 2px 5px;
  font-size: 10px;
`;

const DebugEntry = styled.div`
  margin-bottom: 5px;
  border-bottom: 1px solid #333;
  padding-bottom: 5px;
  word-wrap: break-word;
`;

// Global error log array
const errorLogs = [];

// Global function to add logs
window.addDebugLog = (message, data = null) => {
  const timestamp = new Date().toISOString();
  const entry = {
    timestamp,
    message,
    data: data ? JSON.stringify(data) : null
  };
  errorLogs.unshift(entry); // Add to beginning of array
  
  // Keep only the last 50 logs
  if (errorLogs.length > 50) {
    errorLogs.pop();
  }
  
  // Trigger update in any mounted DebugScreen components
  window.dispatchEvent(new Event('debugLogUpdated'));
};

// Override console.error to capture errors
const originalConsoleError = console.error;
console.error = (...args) => {
  window.addDebugLog('ERROR', args);
  originalConsoleError.apply(console, args);
};

const DebugScreen = () => {
  const [logs, setLogs] = useState(errorLogs);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const handleUpdate = () => {
      setLogs([...errorLogs]);
    };
    
    window.addEventListener('debugLogUpdated', handleUpdate);
    return () => {
      window.removeEventListener('debugLogUpdated', handleUpdate);
    };
  }, []);
  
  const clearLogs = () => {
    errorLogs.length = 0;
    setLogs([]);
  };
  
  if (!isVisible) {
    return (
      <DebugButton 
        style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 9999 }}
        onClick={() => setIsVisible(true)}
      >
        Show Debug
      </DebugButton>
    );
  }
  
  return (
    <DebugContainer>
      <DebugHeader>
        <span>Debug Console ({logs.length} entries)</span>
        <div>
          <DebugButton onClick={clearLogs}>Clear</DebugButton>
          <DebugButton onClick={() => setIsVisible(false)}>Hide</DebugButton>
        </div>
      </DebugHeader>
      
      {logs.map((log, index) => (
        <DebugEntry key={index}>
          <div>{log.timestamp} - {log.message}</div>
          {log.data && <div>{log.data}</div>}
        </DebugEntry>
      ))}
    </DebugContainer>
  );
};

export default DebugScreen;
