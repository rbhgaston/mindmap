import React from 'react';
import { Handle, Position } from 'reactflow';

const MindMapNode = ({ data }) => {
  const { label, bullets, isLeaf, level } = data;

  return (
    <div className="mind-map-node">
      <Handle type="target" position={Position.Top} />
      
      <div className="node-content">
        <div className="node-label">
          {label}
          {isLeaf && <span className="leaf-indicator">●</span>}
        </div>
        
        {bullets && bullets.length > 0 && (
          <div className="node-bullets">
            {bullets.map((bullet, index) => (
              <div key={index} className="bullet-point">
                • {bullet}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default MindMapNode; 