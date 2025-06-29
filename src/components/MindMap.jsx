import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  ReactFlowProvider,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import MindMapNode from './MindMapNode.jsx';
import EditNodeDialog from './EditNodeDialog.jsx';

const nodeTypes = {
  mindMapNode: MindMapNode,
};

const MindMapComponent = ({ data, onNodeUpdate }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(data.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges);
  const [editingNode, setEditingNode] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeDoubleClick = useCallback((event, node) => {
    setEditingNode(node);
    setIsEditDialogOpen(true);
  }, []);

  // Handle node position changes from React Flow
  const handleNodesChange = useCallback((changes) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((node) => {
        const change = changes.find((c) => c.id === node.id);
        if (change && change.type === 'position' && change.position) {
          return {
            ...node,
            position: change.position,
            positionAbsolute: change.positionAbsolute
          };
        }
        return node;
      });
      
      // Notify parent component of node updates
      if (onNodeUpdate) {
        onNodeUpdate(updatedNodes);
      }
      return updatedNodes;
    });
  }, [setNodes, onNodeUpdate]);

  const handleSaveNode = useCallback((updatedNode) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((node) =>
        node.id === updatedNode.id ? updatedNode : node
      );
      // Notify parent component of node updates
      if (onNodeUpdate) {
        onNodeUpdate(updatedNodes);
      }
      return updatedNodes;
    });
  }, [setNodes, onNodeUpdate]);

  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingNode(null);
  }, []);

  // Update nodes when data changes (e.g., layout change)
  useEffect(() => {
    setNodes(data.nodes);
    setEdges(data.edges);
  }, [data.nodes, data.edges, setNodes, setEdges]);

  return (
    <div className="mindmap-fullscreen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor="#667eea"
          nodeStrokeColor="#fff"
          nodeStrokeWidth={2}
          maskColor="rgba(0, 0, 0, 0.1)"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
          }}
        />
      </ReactFlow>
      
      <EditNodeDialog
        node={editingNode}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onSave={handleSaveNode}
      />
    </div>
  );
};

const MindMap = (props) => {
  return (
    <ReactFlowProvider>
      <MindMapComponent {...props} />
    </ReactFlowProvider>
  );
};

export default MindMap; 