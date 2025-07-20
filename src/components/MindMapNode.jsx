import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';

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
  const hasManyBullets = bullets && bullets.length > maxVisibleBullets;
  
  // Filter out empty or whitespace-only bullets
  const filteredBullets = (bullets || []).filter(bullet => 
    bullet && typeof bullet === 'string' && bullet.trim().length > 0
  );
  
  const visibleBullets = isExpanded ? filteredBullets : filteredBullets.slice(0, maxVisibleBullets);
  const hasFilteredManyBullets = filteredBullets.length > maxVisibleBullets;

  return (
    <div className="mind-map-node" data-level={level || 0}>
      <Handle 
        type="target" 
        position={targetPosition} 
        style={{ opacity: 0, width: 0, height: 0 }}
      />
      
      <div className="node-content">
        <div className="node-label">
          {labelLines.map((line, index) => (
            <div key={index} className="label-line">
              {line}
            </div>
          ))}
          {isLeaf && <span className="leaf-indicator">•</span>}
        </div>
        
        {visibleBullets && visibleBullets.length > 0 && (
          <div className="node-bullets">
            {visibleBullets.map((bullet, index) => (
              <div key={index} className="bullet-point">
                {bullet}
              </div>
            ))}
            
            {hasFilteredManyBullets && (
              <div className="expand-controls">
                {!isExpanded && (
                  <button 
                    className="expand-arrow-button"
                    onClick={() => setIsExpanded(true)}
                    title={`Show ${filteredBullets.length - maxVisibleBullets} more details`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                    <span className="expand-text">+{filteredBullets.length - maxVisibleBullets}</span>
                  </button>
                )}
                {isExpanded && (
                  <button 
                    className="collapse-arrow-button"
                    onClick={() => setIsExpanded(false)}
                    title="Show fewer details"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="18,15 12,9 6,15"></polyline>
                    </svg>
                    <span className="collapse-text">Less</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={sourcePosition} 
        style={{ opacity: 0, width: 0, height: 0 }}
      />
    </div>
  );
};

export default MindMapNode; 