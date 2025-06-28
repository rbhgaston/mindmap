import React, { useState } from 'react';
import TextInput from './components/TextInput.jsx';
import MindMap from './components/MindMap.jsx';
import { LLMService } from './utils/llm.js';
import { MindMapConverter } from './utils/mindMapConverter.js';
import './App.css';

function App() {
  const [mindMapData, setMindMapData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTextSubmit = async (text) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate mind map structure using LLM
      const llmNodes = await LLMService.generateMindMap(text);
      
      // Convert LLM nodes to React Flow format
      const reactFlowData = MindMapConverter.convertLLMNodesToReactFlow(llmNodes);
      
      setMindMapData(reactFlowData);
    } catch (err) {
      setError('Failed to generate mind map. Please try again.');
      console.error('Error generating mind map:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMindMapData(null);
    setError(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧠 AI Mind Map Generator</h1>
        <p>Transform text into multi-level mind maps with AI</p>
      </header>

      <main className="app-main">
        {!mindMapData ? (
          <TextInput onTextSubmit={handleTextSubmit} isLoading={isLoading} />
        ) : (
          <div className="mindmap-view">
            <div className="mindmap-controls">
              <button onClick={handleReset} className="reset-button">
                Generate New Mind Map
              </button>
            </div>
            <MindMap data={mindMapData} />
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by AI and React Flow</p>
      </footer>
    </div>
  );
}

export default App; 