import React, { useState, useCallback, useEffect } from 'react';
import TextInput from './components/TextInput.jsx';
import MindMap from './components/MindMap.jsx';
import { LLMService } from './utils/llm.js';
import { elkLayoutedMindMap } from './utils/mindMapConverter.js';
import { saveState, loadState, clearState, saveLayoutState, loadLayoutState } from './utils/persistence.js';
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
  const [layoutStates, setLayoutStates] = useState({}); // Store states for each layout
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load saved state on component mount
  useEffect(() => {
    const savedState = loadState();
    if (savedState) {
      // Restore the saved state
      if (savedState.mindMapData) {
        setMindMapData(savedState.mindMapData);
      }
      if (savedState.layout) {
        setLayout(savedState.layout);
      }
      if (savedState.llmNodes) {
        setLlmNodes(savedState.llmNodes);
      }
      if (savedState.inputText) {
        setInputText(savedState.inputText);
      }
      setRenderKey(prev => prev + 1);
    }
  }, []);

  // Save state whenever relevant data changes (excluding layout-specific data)
  useEffect(() => {
    if (mindMapData || inputText) {
      const stateToSave = {
        mindMapData, // Keep this for browser reload
        layout,
        llmNodes,
        inputText,
        timestamp: Date.now()
      };
      saveState(stateToSave);
    }
  }, [mindMapData, layout, llmNodes, inputText]);

  // Save layout-specific state when mind map data changes
  useEffect(() => {
    if (mindMapData && layout) {
      const layoutState = {
        mindMapData,
        timestamp: Date.now()
      };
      saveLayoutState(layout, layoutState);
      
      // Update local layout states
      setLayoutStates(prev => ({
        ...prev,
        [layout]: layoutState
      }));
    }
  }, [mindMapData, layout]);

  const generateMindMapForAllLayouts = useCallback(async (text, llmNodesResult = null) => {
    setIsLoading(true);
    setError(null);
    setInputText(text);
    try {
      // Use provided LLM nodes or generate new ones
      const llmNodesData = llmNodesResult || await LLMService.generateMindMap(text);
      setLlmNodes(llmNodesData);
      const layouts = ['horizontal', 'vertical', 'radial', 'force'];
      const layoutStatesObj = {};
      let currentLayoutData = null;
      for (const layoutType of layouts) {
        const reactFlowData = await elkLayoutedMindMap(llmNodesData, layoutType);
        const layoutState = { mindMapData: reactFlowData, timestamp: Date.now() };
        saveLayoutState(layoutType, layoutState);
        layoutStatesObj[layoutType] = layoutState;
        if (layoutType === layout) {
          currentLayoutData = reactFlowData;
        }
      }
      setMindMapData(currentLayoutData);
      setLayoutStates(layoutStatesObj);
      setRenderKey(prev => prev + 1); // Force re-render
      setShowTextDialog(false);
    } catch (err) {
      setError('Failed to generate mind map. Please try again.');
      console.error('Error generating mind map:', err);
    } finally {
      setIsLoading(false);
    }
  }, [layout]);

  const generateMindMap = useCallback(async (text, selectedLayout = layout) => {
    await generateMindMapForAllLayouts(text);
  }, [generateMindMapForAllLayouts]);

  const handleTextSubmit = useCallback(async (text) => {
    await generateMindMap(text);
  }, [generateMindMap]);

  const handleReset = useCallback(() => {
    setMindMapData(null);
    setLlmNodes(null);
    setInputText('');
    setError(null);
    setLayoutStates({});
    setRenderKey(prev => prev + 1);
    clearState(); // Clear from localStorage
  }, []);

  const handleLayoutChange = useCallback(async (e) => {
    const newLayout = e.target.value;
    setLayout(newLayout);
    
    if (llmNodes && Array.isArray(llmNodes) && llmNodes.length > 0) {
      // Check if we have saved state for this layout
      const savedLayoutState = loadLayoutState(newLayout);
      
      if (savedLayoutState && savedLayoutState.mindMapData) {
        // Use saved layout state
        setMindMapData(savedLayoutState.mindMapData);
        setRenderKey(prev => prev + 1);
      } else {
        // Generate new layout
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
      }
    } else {
      console.warn('No LLM nodes available for layout change:', llmNodes);
    }
  }, [llmNodes]);

  const handleRegenerate = useCallback(async () => {
    if (inputText.trim()) {
      await generateMindMapForAllLayouts(inputText);
    }
  }, [inputText, generateMindMapForAllLayouts]);

  const handleEditText = useCallback(() => {
    setShowTextDialog(true);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Handle node updates from the mind map component
  const handleNodeUpdate = useCallback((updatedNodes) => {
    if (mindMapData) {
      const updatedMindMapData = {
        ...mindMapData,
        nodes: updatedNodes
      };
      setMindMapData(updatedMindMapData);
    }
  }, [mindMapData]);

  return (
    <div className="app">
      {/* Mobile Hamburger Menu */}
      <button 
        className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Left Sidebar */}
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h1>AI Mind Map</h1>
          <p>Transform text into interactive mind maps</p>
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {!isSidebarCollapsed && (
          <div className="sidebar-content">
            {/* Layout Selector */}
            <div className="layout-section">
              <h3>Layout Type</h3>
              <div className="layout-grid">
                {LAYOUTS.map((l) => (
                  <button
                    key={l.value}
                    className={`layout-option ${layout === l.value ? 'active' : ''}`}
                    onClick={() => {
                      handleLayoutChange({ target: { value: l.value } });
                      closeMobileMenu();
                    }}
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
                  onClick={() => {
                    handleEditText();
                    closeMobileMenu();
                  }}
                >
                  <span>Enter</span>
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
                      onClick={() => {
                        handleEditText();
                        closeMobileMenu();
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className="regenerate-btn"
                      onClick={() => {
                        handleRegenerate();
                        closeMobileMenu();
                      }}
                      disabled={isLoading}
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="actions-section">
              {mindMapData && (
                <button 
                  onClick={() => {
                    handleReset();
                    closeMobileMenu();
                  }} 
                  className="reset-button"
                >
                  Clear Mind Map
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu}></div>
      )}

      {/* Main Mind Map Area */}
      <div className="main-content">
        {mindMapData ? (
          <MindMap key={renderKey} data={mindMapData} onNodeUpdate={handleNodeUpdate} />
        ) : (
          <div className="welcome-screen">
            <div className="welcome-content">
              <h2>Welcome to AI Mind Map Generator</h2>
              <p>Paste your text and let AI create a beautiful mind map</p>
              <button 
                className="start-button"
                onClick={handleEditText}
              >
                Start Creating
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
                ×
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