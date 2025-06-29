import React, { useCallback, useState } from 'react';
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

const MindMapComponent = ({ data }) => {
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

  const handleSaveNode = useCallback((updatedNode) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === updatedNode.id ? updatedNode : node
      )
    );
  }, [setNodes]);

  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingNode(null);
  }, []);

  return (
    <div className="mindmap-fullscreen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
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