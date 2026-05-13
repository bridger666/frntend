/**
 * WorkflowPreview Component
 * 
 * Visualizes AI-generated workflow blueprints using React Flow.
 * Supports read-only preview with zoom, pan, and auto-layout.
 * 
 * @component
 * @example
 * <WorkflowPreview 
 *   blueprint={{ nodes: [...], edges: [...] }}
 *   isOpen={true}
 *   onClose={() => setIsOpen(false)}
 * />
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;

// Node type styling configuration
const NODE_STYLES = {
  webhook: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '🔗',
    color: '#ffffff',
  },
  ai_agent: {
    background: 'linear-gradient(135deg, #07d197 0%, #06b380 100%)',
    icon: '🤖',
    color: '#1a0b2e',
  },
  crm_push: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: '📊',
    color: '#ffffff',
  },
  email: {
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: '📧',
    color: '#1a0b2e',
  },
  database: {
    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    icon: '💾',
    color: '#1a0b2e',
  },
  default: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '⚙️',
    color: '#ffffff',
  },
};

// ============================================================================
// LAYOUT ALGORITHM (Dagre)
// ============================================================================

/**
 * Automatically positions nodes using Dagre layout algorithm
 * @param {Array} nodes - React Flow nodes
 * @param {Array} edges - React Flow edges
 * @param {string} direction - Layout direction ('TB' or 'LR')
 * @returns {Array} Positioned nodes
 */
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });
};

// ============================================================================
// CUSTOM NODE COMPONENT
// ============================================================================

/**
 * Custom node renderer with icon and styled background
 */
const CustomNode = ({ data }) => {
  const nodeType = data.type?.toLowerCase().replace(/\s+/g, '_') || 'default';
  const style = NODE_STYLES[nodeType] || NODE_STYLES.default;

  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        background: style.background,
        color: style.color,
        border: '2px solid rgba(255, 255, 255, 0.2)',
        minWidth: NODE_WIDTH,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        fontSize: '14px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span style={{ fontSize: '20px' }}>{style.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', marginBottom: '2px' }}>
          {data.label || data.name || 'Unnamed Node'}
        </div>
        {data.description && (
          <div style={{ fontSize: '11px', opacity: 0.8 }}>
            {data.description}
          </div>
        )}
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const WorkflowPreview = ({ blueprint, isOpen, onClose, className = '' }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [layoutDirection, setLayoutDirection] = useState('TB');

  // ============================================================================
  // DATA PROCESSING
  // ============================================================================

  /**
   * Transform blueprint data into React Flow format
   */
  const processBlueprint = useCallback((blueprintData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate blueprint structure
      if (!blueprintData) {
        throw new Error('No blueprint data provided');
      }

      const rawNodes = blueprintData.nodes || [];
      const rawEdges = blueprintData.edges || [];

      if (rawNodes.length === 0) {
        throw new Error('Blueprint contains no nodes');
      }

      // Transform nodes to React Flow format
      const flowNodes = rawNodes.map((node, index) => ({
        id: node.id || `node-${index}`,
        type: 'custom',
        data: {
          label: node.label || node.name || `Node ${index + 1}`,
          type: node.type || 'default',
          description: node.description,
          ...node.data,
        },
        position: { x: 0, y: 0 }, // Will be set by layout algorithm
      }));

      // Transform edges to React Flow format
      const flowEdges = rawEdges.map((edge, index) => ({
        id: edge.id || `edge-${index}`,
        source: edge.source || edge.from,
        target: edge.target || edge.to,
        label: edge.label,
        animated: edge.animated !== false,
        style: {
          stroke: 'rgba(7, 209, 151, 0.6)',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'rgba(7, 209, 151, 0.8)',
        },
      }));

      // Apply auto-layout
      const layoutedNodes = getLayoutedElements(flowNodes, flowEdges, layoutDirection);

      setNodes(layoutedNodes);
      setEdges(flowEdges);
      setIsLoading(false);
    } catch (err) {
      console.error('Error processing blueprint:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, [layoutDirection, setNodes, setEdges]);

  // Process blueprint when it changes
  useEffect(() => {
    if (blueprint && isOpen) {
      processBlueprint(blueprint);
    }
  }, [blueprint, isOpen, processBlueprint]);

  // ============================================================================
  // LAYOUT CONTROLS
  // ============================================================================

  const handleLayoutChange = useCallback(() => {
    const newDirection = layoutDirection === 'TB' ? 'LR' : 'TB';
    setLayoutDirection(newDirection);
    
    if (nodes.length > 0) {
      const layoutedNodes = getLayoutedElements(nodes, edges, newDirection);
      setNodes(layoutedNodes);
    }
  }, [layoutDirection, nodes, edges, setNodes]);

  // ============================================================================
  // RENDER STATES
  // ============================================================================

  if (!isOpen) return null;

  return (
    <div
      className={`workflow-preview-modal ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem',
      }}
      onClick={onClose}
    >
      <div
        className="workflow-preview-container"
        style={{
          background: '#1a0b2e',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          width: '100%',
          maxWidth: '1400px',
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: '#ffffff', fontSize: '1.5rem', fontWeight: '300' }}>
              Workflow Preview
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
              {nodes.length} nodes • {edges.length} connections
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, position: 'relative', background: '#0f0820' }}>
          {isLoading && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#07d197',
                fontSize: '1.125rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div className="loading-spinner" style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(7, 209, 151, 0.2)',
                borderTop: '3px solid #07d197',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              <div>Generating preview...</div>
            </div>
          )}

          {error && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#ff6b6b',
                fontSize: '1rem',
                textAlign: 'center',
                maxWidth: '400px',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                Invalid Workflow Format
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
                {error}
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
              style={{ background: '#0f0820' }}
              defaultEdgeOptions={{
                animated: true,
              }}
            >
              <Background
                color="rgba(255, 255, 255, 0.05)"
                gap={16}
                size={1}
              />
              <Controls
                style={{
                  background: 'rgba(26, 11, 46, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                }}
              />
              <MiniMap
                style={{
                  background: 'rgba(26, 11, 46, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                }}
                nodeColor={(node) => {
                  const nodeType = node.data.type?.toLowerCase().replace(/\s+/g, '_') || 'default';
                  return NODE_STYLES[nodeType]?.background || NODE_STYLES.default.background;
                }}
              />
              <Panel position="top-right">
                <button
                  onClick={handleLayoutChange}
                  style={{
                    background: 'rgba(7, 209, 151, 0.1)',
                    border: '1px solid rgba(7, 209, 151, 0.3)',
                    borderRadius: '8px',
                    color: '#07d197',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}
                >
                  {layoutDirection === 'TB' ? '↔️ Horizontal' : '↕️ Vertical'}
                </button>
              </Panel>
            </ReactFlow>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default WorkflowPreview;
