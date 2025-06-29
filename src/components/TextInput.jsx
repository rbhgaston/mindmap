import React, { useState, useEffect } from 'react';

const TextInput = ({ onTextSubmit, isLoading = false, initialText = '' }) => {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onTextSubmit(text.trim());
    }
  };

  return (
    <div className="text-input-container">
      <div className="input-header">
        <h2>Generate Mind Map with AI</h2>
        <p>Paste your text and let AI create a structured mind map with multiple levels</p>
      </div>
      
      <form onSubmit={handleSubmit} className="text-input-form">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your lecture notes, meeting minutes, or any text here..."
          className="text-area"
          disabled={isLoading}
          autoFocus
        />
        
        <div className="text-input-actions">
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="generate-button"
          >
            {isLoading ? 'Generating Mind Map...' : 'Generate Mind Map'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TextInput; 