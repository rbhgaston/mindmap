import React, { useState, useCallback } from 'react';
import TextInput from './components/TextInput.jsx';
import MindMap from './components/MindMap.jsx';
import { LLMService } from './utils/llm.js';
import { elkLayoutedMindMap } from './utils/mindMapConverter.js';
import './App.css';

const LAYOUTS = [
  { value: 'horizontal', label: 'Horizontal', icon: '→' },
  { value: 'vertical', label: 'Vertical', icon: '↓' },
  { value: 'radial', label: 'Radial', icon: '●' },
  { value: 'force', label: 'Force', icon: '⚡' },
];

function App() {
  const [mindMapData, setMindMapData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [layout, setLayout] = useState('horizontal');
  const [llmNodes, setLlmNodes] = useState(null);
  const [inputText, setInputText] = useState('');
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [renderKey, setRenderKey] = useState(0); // Force re-render

  const generateMindMap = useCallback(async (text, selectedLayout = layout) => {
    setIsLoading(true);
    setError(null);
    setInputText(text);
    try {
      const llmNodesResult = await LLMService.generateMindMap(text);
      setLlmNodes(llmNodesResult);
      const reactFlowData = await elkLayoutedMindMap(llmNodesResult, selectedLayout);
      setMindMapData(reactFlowData);
      setRenderKey(prev => prev + 1); // Force re-render
      setShowTextDialog(false);
    } catch (err) {
      setError('Failed to generate mind map. Please try again.');
      console.error('Error generating mind map:', err);
    } finally {
      setIsLoading(false);
    }
  }, [layout]);

  const handleTextSubmit = useCallback(async (text) => {
    await generateMindMap(text);
  }, [generateMindMap]);

  const handleReset = useCallback(() => {
    setMindMapData(null);
    setLlmNodes(null);
    setInputText('');
    setError(null);
    setRenderKey(prev => prev + 1);
  }, []);

  const handleLayoutChange = useCallback(async (e) => {
    const newLayout = e.target.value;
    setLayout(newLayout);
    if (llmNodes && Array.isArray(llmNodes) && llmNodes.length > 0) {
      setIsLoading(true);
      try {
        console.log('Switching layout. LLM nodes:', llmNodes);
        const reactFlowData = await elkLayoutedMindMap(llmNodes, newLayout);
        setMindMapData(reactFlowData);
        setRenderKey(prev => prev + 1); // Force re-render
      } catch (err) {
        setError('Failed to change layout.');
        console.error('Layout change error:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.warn('No LLM nodes available for layout change:', llmNodes);
    }
  }, [llmNodes]);

  const handleRegenerate = useCallback(async () => {
    if (inputText.trim()) {
      await generateMindMap(inputText);
    }
  }, [inputText, generateMindMap]);

  const handleEditText = useCallback(() => {
    setShowTextDialog(true);
  }, []);

  return (
    <div className="app">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>🧠 AI Mind Map</h1>
          <p>Transform text into interactive mind maps</p>
        </div>

        <div className="sidebar-content">
          {/* Layout Selector */}
          <div className="layout-section">
            <h3>Layout Type</h3>
            <div className="layout-grid">
              {LAYOUTS.map((l) => (
                <button
                  key={l.value}
                  className={`layout-option ${layout === l.value ? 'active' : ''}`}
                  onClick={() => handleLayoutChange({ target: { value: l.value } })}
                  disabled={!mindMapData}
                >
                  <span className="layout-icon">{l.icon}</span>
                  <span className="layout-label">{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Input Section */}
          <div className="text-section">
            <h3>Input Text</h3>
            {!mindMapData ? (
              <button 
                className="text-input-trigger"
                onClick={handleEditText}
              >
                <span>📝</span>
                <span>Enter your text here...</span>
              </button>
            ) : (
              <div className="text-display">
                <div className="text-preview">
                  {inputText.length > 200 
                    ? `${inputText.substring(0, 200)}...` 
                    : inputText
                  }
                </div>
                <div className="text-actions">
                  <button 
                    className="edit-text-btn"
                    onClick={handleEditText}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="regenerate-btn"
                    onClick={handleRegenerate}
                    disabled={isLoading}
                  >
                    🔄 Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="actions-section">
            {mindMapData && (
              <button onClick={handleReset} className="reset-button">
                🗑️ Clear Mind Map
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      {/* Main Mind Map Area */}
      <div className="main-content">
        {mindMapData ? (
          <MindMap key={renderKey} data={mindMapData} />
        ) : (
          <div className="welcome-screen">
            <div className="welcome-content">
              <h2>Welcome to AI Mind Map Generator</h2>
              <p>Paste your text and let AI create a beautiful mind map</p>
              <button 
                className="start-button"
                onClick={handleEditText}
              >
                🚀 Start Creating
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Text Input Dialog */}
      {showTextDialog && (
        <div className="dialog-overlay" onClick={() => setShowTextDialog(false)}>
          <div className="text-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>Enter Your Text</h3>
              <button 
                className="close-dialog"
                onClick={() => setShowTextDialog(false)}
              >
                ✕
              </button>
            </div>
            <TextInput 
              onTextSubmit={handleTextSubmit} 
              isLoading={isLoading}
              initialText={inputText}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 