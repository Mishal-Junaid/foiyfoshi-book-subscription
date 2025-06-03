import React, { useState } from 'react';
import styled from 'styled-components';
import { useContent } from '../../context/ContentContext';

const DebugContainer = styled.div`
  padding: 1rem;
  margin: 1rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
  font-family: monospace;
`;

const ToggleButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
  
  &:hover {
    background-color: #0069d9;
  }
`;

const ContentSection = styled.div`
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
`;

const ContentKey = styled.div`
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const ContentValue = styled.pre`
  white-space: pre-wrap;
  background-color: #eee;
  padding: 0.5rem;
  border-radius: 4px;
  max-height: 200px;
  overflow: auto;
`;

const StatusBadge = styled.span.withConfig({
  shouldForwardProp: prop => !['type'].includes(prop)
})`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
  background-color: ${props => props.type === 'success' ? '#28a745' : props.type === 'warning' ? '#ffc107' : '#dc3545'};
  color: ${props => props.type === 'warning' ? '#212529' : '#fff'};
`;

const SectionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
  
  &:hover {
    background-color: #e9e9e9;
  }
`;

const TableCell = styled.td`
  padding: 0.5rem;
  border: 1px solid #ddd;
`;

const TableHeader = styled.th`
  background-color: #e9ecef;
  padding: 0.5rem;
  border: 1px solid #ddd;
  text-align: left;
`;

const DebugContentViewer = () => {
  const [visible, setVisible] = useState(false);
  const { content, loading, error } = useContent();
  
  // List of expected section names grouped by page
  const expectedSections = {
    home: ['hero', 'about', 'how-it-works', 'products', 'testimonials', 'cta'],
    about: ['about-hero', 'our-story', 'different', 'mission'],
    contact: ['contact-hero', 'contact-info', 'contact-form']
  };
  // Flatten all expected sections for general checks
  const allExpectedSections = [
    ...expectedSections.home, 
    ...expectedSections.about, 
    ...expectedSections.contact
  ];
  
  // Check for mismatches
  const getMismatchStatus = (section) => {
    if (allExpectedSections.includes(section)) {
      return <StatusBadge type="success">Used in frontend</StatusBadge>;
    }
    
    // Check if this might be a variant of a known section
    const withoutSuffix = section.replace('-section', '');
    const withSuffix = `${section}-section`;
    
    if (allExpectedSections.includes(withoutSuffix) || allExpectedSections.includes(withSuffix)) {
      return <StatusBadge type="warning">Name format mismatch</StatusBadge>;
    }
    
    return <StatusBadge type="error">Unused in frontend</StatusBadge>;
  };

  const getPageCompletionStatus = (pageName) => {
    const pageSections = expectedSections[pageName];
    const existingSections = pageSections.filter(section => Object.keys(content).includes(section));
    return {
      total: pageSections.length,
      existing: existingSections.length,
      percent: Math.round((existingSections.length / pageSections.length) * 100)
    };
  };

  return (
    <DebugContainer>
      <ToggleButton onClick={() => setVisible(!visible)}>
        {visible ? 'Hide Content Debug' : 'Show Content Debug'}
      </ToggleButton>
      
      {visible && (
        <div>
          <h3>Content Debug Information</h3>
          
          {loading && <p>Loading content data...</p>}
          
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          
          {!loading && !error && (
            <>
              <p>Total content sections available: {Object.keys(content).length} / {allExpectedSections.length} required</p>
              
              <h4>Page Content Status</h4>
              <SectionTable>
                <thead>
                  <tr>
                    <TableHeader>Page</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Completion</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(expectedSections).map(page => {
                    const status = getPageCompletionStatus(page);
                    return (
                      <TableRow key={page}>
                        <TableCell style={{ textTransform: 'capitalize' }}>{page}</TableCell>
                        <TableCell>
                          {status.existing}/{status.total} sections
                        </TableCell>
                        <TableCell>
                          <div style={{ 
                            width: '100%', 
                            backgroundColor: '#e9ecef',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${status.percent}%`,
                              backgroundColor: status.percent === 100 ? '#28a745' : status.percent > 50 ? '#ffc107' : '#dc3545',
                              height: '20px',
                              textAlign: 'center',
                              color: 'white',
                              fontWeight: 'bold'
                            }}>
                              {status.percent}%
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </tbody>
              </SectionTable>
              
              <h4>Missing Content Sections</h4>
              <SectionTable>
                <thead>
                  <tr>
                    <TableHeader>Section Name</TableHeader>
                    <TableHeader>Page</TableHeader>
                    <TableHeader>Action</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(expectedSections).flatMap(([page, sections]) => 
                    sections
                      .filter(section => !Object.keys(content).includes(section))
                      .map(section => (
                        <TableRow key={section}>
                          <TableCell><code>{section}</code></TableCell>
                          <TableCell style={{ textTransform: 'capitalize' }}>{page}</TableCell>
                          <TableCell>
                            <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
                              Needs to be created
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </tbody>
              </SectionTable>
              
              <h4>Detailed Content Sections</h4>
              {Object.keys(content).length === 0 ? (
                <p>No content sections found!</p>
              ) : (
                <SectionTable>
                  <thead>
                    <tr>
                      <TableHeader>Section Name</TableHeader>
                      <TableHeader>Title</TableHeader>
                      <TableHeader>Status</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(content).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell><code>{key}</code></TableCell>
                        <TableCell>{value.title || '-'}</TableCell>
                        <TableCell>{getMismatchStatus(key)}</TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </SectionTable>              )}
            </>
          )}
          
          <div style={{ marginTop: '2rem' }}>
            <h4>How to Fix Missing Content</h4>
            <ol style={{ paddingLeft: '1.5rem' }}>
              <li>Click on the <strong>Add Content</strong> button above</li>
              <li>Enter the exact section name from the table above</li>
              <li>Add a title, subtitle (optional), and content (optional)</li>
              <li>Add any images or links if needed</li>
              <li>Save the content</li>
              <li>Click "Refresh Front-end Content" to update the site</li>
            </ol>
          </div>
        </div>
      )}
    </DebugContainer>
  );
};

export default DebugContentViewer;
