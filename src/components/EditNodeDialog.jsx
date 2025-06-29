import React, { useState, useEffect } from 'react';

const EditNodeDialog = ({ node, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    if (node) {
      setTitle(node.data.label || '');
      setDetails(node.data.bullets ? node.data.bullets.join('\n') : '');
    }
  }, [node]);

  const handleSave = () => {
    if (onSave && node) {
      const updatedNode = {
        ...node,
        data: {
          ...node.data,
          label: title.trim(),
          bullets: details.trim() ? details.trim().split('\n').filter(line => line.trim()) : []
        }
      };
      onSave(updatedNode);
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.metaKey) {
      handleSave();
    }
  };

  if (!isOpen || !node) return null;

  return (
    <div className="edit-dialog-overlay" onClick={onClose}>
      <div className="edit-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="edit-dialog-header">
          <h3>Edit Node</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="edit-dialog-content">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter node title..."
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="details">Details (one per line)</label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter details, one per line..."
              rows={6}
            />
          </div>
        </div>
        
        <div className="edit-dialog-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="save-button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditNodeDialog; 