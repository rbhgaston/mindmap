import React, { useCallback } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import MindMapNode from './MindMapNode.jsx';

const nodeTypes = {
  mindMapNode: MindMapNode,
};

const MindMapComponent = ({ data }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(data.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
      </ReactFlow>
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