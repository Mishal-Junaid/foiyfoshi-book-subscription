import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../../services/api';


/**
 * Component for monitoring and debugging API calls in development
 * Can be conditionally rendered in any component where API issues need to be debugged
 */
const APIDebugger = ({ endpoint }) => {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [requestHistory, setRequestHistory] = useState([]);

  // Make a test request to the endpoint
  const testEndpoint = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(endpoint);
      setApiData(response.data);
      
      // Add to history
      setRequestHistory(prev => [
        ...prev, 
        { 
          timestamp: new Date().toLocaleTimeString(), 
          endpoint, 
          status: response.status,
          success: true,
          data: response.data
        }
      ]);
    } catch (err) {
      setError({
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      
      // Add failed request to history
      setRequestHistory(prev => [
        ...prev, 
        { 
          timestamp: new Date().toLocaleTimeString(), 
          endpoint, 
          status: err.response?.status || 'Error',
          success: false,
          error: err.message
        }
      ]);
    } finally {
      setLoading(false);
    }  };
  
  // Test multiple common variations of the endpoint
  const testAllEndpointVariations = async () => {
    setLoading(true);
    
    const variations = [
      endpoint,
      endpoint.startsWith('/') ? endpoint : `/${endpoint}`,
      endpoint.startsWith('/api/') ? endpoint.substring(4) : `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`,
    ];
    
    // Add root endpoint for collections
    if (endpoint.split('/').filter(Boolean).length === 1) {
      variations.push('');
    }
    
    // Remove duplicates
    const uniqueVariations = [...new Set(variations)];
    
    for (const variation of uniqueVariations) {
      try {
        const response = await api.get(variation);
        setRequestHistory(prev => [
          ...prev, 
          { 
            timestamp: new Date().toLocaleTimeString(), 
            endpoint: variation || '/', 
            status: response.status,
            success: true,
            data: response.data
          }
        ]);
      } catch (err) {
        setRequestHistory(prev => [
          ...prev, 
          { 
            timestamp: new Date().toLocaleTimeString(), 
            endpoint: variation || '/', 
            status: err.response?.status || 'Error',
            success: false,
            error: err.message
          }
        ]);
      }
    }      setLoading(false);
  };

  return (
    <DebugContainer>
      <DebugHeader onClick={() => setIsExpanded(!isExpanded)}>
        <h3>API Debugger {isExpanded ? '▼' : '►'}</h3>
        <EndpointBadge>{endpoint}</EndpointBadge>
      </DebugHeader>
      
      {isExpanded && (
        <DebugBody>          <TestButtonGroup>
            <TestButton onClick={testEndpoint} disabled={loading}>
              {loading ? 'Testing...' : 'Test Endpoint'}
            </TestButton>
            <TestButton onClick={testAllEndpointVariations} disabled={loading} title="Tests multiple variations of the endpoint path to help find the correct one">
              {loading ? 'Testing...' : 'Test Variations'}
            </TestButton>
            <ClearButton onClick={() => setRequestHistory([])}>
              Clear History
            </ClearButton>
          </TestButtonGroup>
          
          {error && (
            <ErrorPanel>
              <h4>Error: {error.status} {error.statusText}</h4>
              <p>{error.message}</p>
            </ErrorPanel>
          )}
          
          {apiData && (
            <ResultPanel>
              <h4>Response Data:</h4>
              <pre>{JSON.stringify(apiData, null, 2)}</pre>
            </ResultPanel>
          )}
          
          {requestHistory.length > 0 && (
            <HistoryPanel>
              <h4>Request History:</h4>
              <HistoryTable>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Endpoint</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requestHistory.map((item, index) => (
                    <HistoryRow key={index} success={item.success}>
                      <td>{item.timestamp}</td>
                      <td>{item.endpoint}</td>
                      <td>{item.status}</td>
                    </HistoryRow>
                  ))}
                </tbody>
              </HistoryTable>
            </HistoryPanel>
          )}
        </DebugBody>
      )}
    </DebugContainer>
  );
};

// Styled Components
const DebugContainer = styled.div`
  border: 2px dotted #ff6b6b;
  border-radius: 6px;
  margin: 1rem 0;
  font-family: monospace;
  background-color: #f8f9fa;
`;

const DebugHeader = styled.div`
  padding: 0.75rem 1rem;
  background-color: #f1f3f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  
  h3 {
    margin: 0;
    font-size: 1rem;
    color: #ff6b6b;
  }
`;

const EndpointBadge = styled.span`
  background-color: #e9ecef;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #495057;
`;

const DebugBody = styled.div`
  padding: 1rem;
`;

const TestButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const TestButton = styled.button`
  background-color: #339af0;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  
  &:disabled {
    background-color: #adb5bd;
    cursor: not-allowed;
  }
`;

const ClearButton = styled.button`
  background-color: #868e96;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
`;

const ErrorPanel = styled.div`
  background-color: #fff5f5;
  border: 1px solid #ffa8a8;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
  
  h4 {
    color: #e03131;
    margin-top: 0;
    margin-bottom: 0.5rem;
  }
`;

const ResultPanel = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
  
  h4 {
    margin-top: 0;
    margin-bottom: 0.5rem;
  }
  
  pre {
    background-color: #e9ecef;
    padding: 0.5rem;
    border-radius: 4px;
    white-space: pre-wrap;
    overflow: auto;
    max-height: 200px;
    font-size: 0.8rem;
  }
`;

const HistoryPanel = styled.div`
  h4 {
    margin-top: 0;
    margin-bottom: 0.5rem;
  }
`;

const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  
  th, td {
    padding: 0.5rem;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
  }
  
  th {
    background-color: #e9ecef;
  }
`;

const HistoryRow = styled.tr.withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) => {
    if (['success'].includes(prop)) {
      return false;
    }
    if (typeof defaultValidatorFn === 'function') {
      return defaultValidatorFn(prop);
    }
    return !prop.startsWith('$');
  }
})`
  background-color: ${props => props.success ? '#ebfbee' : '#fff5f5'};
`;

export default APIDebugger;
