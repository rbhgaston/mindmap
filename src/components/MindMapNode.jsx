import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

const MindMapNode = ({ data }) => {
  const { 
    label, 
    bullets, 
    isLeaf, 
    level, 
    layout = 'horizontal',
    hiddenBullets = 0,
    isExpandable = false,
    maxVisibleBullets = 4
  } = data;

  const [isExpanded, setIsExpanded] = useState(false);

  // Determine handle positions based on layout
  const isHorizontal = layout === 'horizontal';
  const sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
  const targetPosition = isHorizontal ? Position.Left : Position.Top;

  // Handle text wrapping for long labels
  const wrapText = (text, maxWidth = 35) => {
    if (!text || text.length <= maxWidth) return [text];
    
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
      if ((currentLine + word).length <= maxWidth) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    
    if (currentLine) lines.push(currentLine);
    return lines.length > 0 ? lines : [text];
  };

  const labelLines = wrapText(label);
  const visibleBullets = isExpanded ? (bullets || []) : (bullets?.slice(0, maxVisibleBullets) || []);

  return (
    <div className="mind-map-node">
      <Handle type="target" position={targetPosition} />
      
      <div className="node-content">
        <div className="node-label">
          {labelLines.map((line, index) => (
            <div key={index} className="label-line">
              {line}
            </div>
          ))}
          {isLeaf && <span className="leaf-indicator">●</span>}
        </div>
        
        {visibleBullets && visibleBullets.length > 0 && (
          <div className="node-bullets">
            {visibleBullets.map((bullet, index) => (
              <div key={index} className="bullet-point">
                • {bullet}
              </div>
            ))}
            {isExpandable && !isExpanded && (
              <button 
                className="expand-button"
                onClick={() => setIsExpanded(true)}
              >
                +{hiddenBullets} more...
              </button>
            )}
            {isExpandable && isExpanded && (
              <button 
                className="collapse-button"
                onClick={() => setIsExpanded(false)}
              >
                Show less
              </button>
            )}
          </div>
        )}
      </div>
      
      <Handle type="source" position={sourcePosition} />
    </div>
  );
};

export default MindMapNode; 