/**
 * Workflow Preview Test Page
 * 
 * Standalone test page to preview and test the WorkflowPreview component
 * with different mock data scenarios.
 */

import React, { useState } from 'react';
import WorkflowPreview from './WorkflowPreview';
import {
  simpleWorkflow,
  complexWorkflow,
  parallelWorkflow,
  emptyWorkflow,
  singleNodeWorkflow,
  customTypesWorkflow,
  generateRandomWorkflow,
} from './mockWorkflowData';

const WorkflowPreviewTest = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState(complexWorkflow);
  const [isOpen, setIsOpen] = useState(false);

  const workflows = [
    { name: 'Simple Linear', data: simpleWorkflow },
    { name: 'Complex Branching', data: complexWorkflow },
    { name: 'Parallel Processing', data: parallelWorkflow },
    { name: 'Single Node', data: singleNodeWorkflow },
    { name: 'Custom Types', data: customTypesWorkflow },
    { name: 'Empty (Error)', data: emptyWorkflow },
    { name: 'Random (5 nodes)', data: generateRandomWorkflow(5) },
    { name: 'Random (10 nodes)', data: generateRandomWorkflow(10) },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0820',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '2rem',
          textAlign: 'center',
        }}>
          <h1 style={{
            color: '#ffffff',
            fontSize: '2.5rem',
            fontWeight: '300',
            marginBottom: '0.5rem',
          }}>
            Workflow Preview Test
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '1.125rem',
          }}>
            Test different workflow scenarios
          </p>
        </div>

        {/* Workflow Selector Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {workflows.map((workflow, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedWorkflow(workflow.data);
                setIsOpen(true);
              }}
              style={{
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(7, 209, 151, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(7, 209, 151, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
              }}>
                {workflow.name}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.6)',
              }}>
                {workflow.data.nodes?.length || 0} nodes • {workflow.data.edges?.length || 0} edges
              </div>
            </button>
          ))}
        </div>

        {/* Current Selection Info */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h3 style={{
            color: '#07d197',
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Current Selection
          </h3>
          <pre style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '1rem',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '0.875rem',
            color: 'rgba(255, 255, 255, 0.8)',
            maxHeight: '300px',
          }}>
            {JSON.stringify(selectedWorkflow, null, 2)}
          </pre>
        </div>

        {/* Open Preview Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => setIsOpen(true)}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #07d197 0%, #06b380 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#1a0b2e',
              fontSize: '1.125rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🔄 Open Workflow Preview
          </button>
        </div>
      </div>

      {/* Workflow Preview Modal */}
      <WorkflowPreview
        blueprint={selectedWorkflow}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
};

export default WorkflowPreviewTest;
