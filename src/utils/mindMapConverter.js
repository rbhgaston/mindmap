import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

const LAYOUT_OPTIONS = {
  horizontal: {
    algorithm: 'layered',
    direction: 'RIGHT',
  },
  vertical: {
    algorithm: 'layered',
    direction: 'DOWN',
  },
  radial: {
    algorithm: 'radial',
  },
  force: {
    algorithm: 'force',
  },
};

function buildElkGraph(llmNodes, parentId = null, nodes = [], edges = [], level = 0) {
  llmNodes.forEach((llmNode) => {
    const nodeId = `node-${nodes.length + 1}`;
    
    // Calculate node size based on content with constraints
    const bulletCount = llmNode.bullets?.length || 0;
    const labelLength = llmNode.label?.length || 0;
    
    // Max dimensions to prevent overlap
    const maxWidth = 280;
    const maxHeight = 200;
    const minWidth = 180;
    const minHeight = 100;
    
    // Calculate width with text wrapping consideration
    const charWidth = 8; // Approximate character width
    const maxCharsPerLine = Math.floor(maxWidth / charWidth);
    const effectiveLabelLength = Math.min(labelLength, maxCharsPerLine);
    
    // Width calculation with wrapping
    const width = Math.max(minWidth, Math.min(maxWidth, 
      150 + effectiveLabelLength * charWidth + bulletCount * 8
    ));
    
    // Height calculation with expandable consideration
    const baseHeight = 80;
    const bulletHeight = 18;
    const maxVisibleBullets = 4; // Show first 4 bullets, rest expandable
    const visibleBullets = Math.min(bulletCount, maxVisibleBullets);
    const hiddenBullets = Math.max(0, bulletCount - maxVisibleBullets);
    
    let height = baseHeight + visibleBullets * bulletHeight;
    
    // If there are hidden bullets, add expand indicator space
    if (hiddenBullets > 0) {
      height += 25; // Space for "Show more" indicator
    }
    
    // Ensure height doesn't exceed max
    height = Math.max(minHeight, Math.min(maxHeight, height));
    
    nodes.push({
      id: nodeId,
      width: width,
      height: height,
      label: llmNode.label || 'Untitled',
      data: {
        label: llmNode.label || 'Untitled',
        bullets: llmNode.bullets || [],
        isLeaf: !llmNode.children || llmNode.children.length === 0,
        level: level,
        width: width,
        height: height,
        hiddenBullets: hiddenBullets,
        isExpandable: hiddenBullets > 0,
        maxVisibleBullets: maxVisibleBullets,
      },
    });
    if (parentId) {
      edges.push({ id: `edge-${parentId}-${nodeId}`, source: parentId, target: nodeId });
    }
    if (llmNode.children && llmNode.children.length > 0) {
      buildElkGraph(llmNode.children, nodeId, nodes, edges, level + 1);
    }
  });
  return { nodes, edges };
}

function calculateContentAwareSpacing(nodes, layoutType) {
  if (!nodes || nodes.length === 0) return 50;
  
  // Calculate spacing for each node based on content
  const nodeSpacings = nodes.map(node => {
    const contentLength = (node.data?.label?.length || 0) + ((node.data?.bullets?.length || 0) * 20);
    const level = node.data?.level || 0;
    const hasManyBullets = (node.data?.bullets?.length || 0) > 4;
    
    // Base spacing: 40px minimum for readability
    let spacing = 40;
    
    // Content factor: +2px per 10 characters
    spacing += Math.floor(contentLength / 10) * 2;
    
    // Level factor: Deeper levels get tighter spacing
    spacing -= level * 5;
    
    // Density factor: Nodes with many bullets need more breathing room
    if (hasManyBullets) spacing += 15;
    
    // Layout-specific adjustments
    if (layoutType === 'radial') {
      spacing = Math.max(30, spacing * 0.8); // Radial can be tighter
    } else if (layoutType === 'force') {
      spacing = Math.max(35, spacing * 0.9); // Force layout slightly tighter
    }
    
    return Math.max(30, Math.min(80, spacing)); // Clamp between 30-80px
  });
  
  // Return average spacing for the layout
  const averageSpacing = nodeSpacings.reduce((sum, spacing) => sum + spacing, 0) / nodeSpacings.length;
  return Math.round(averageSpacing);
}

export async function elkLayoutedMindMap(llmNodes, layoutType = 'horizontal') {
  try {
    const { nodes, edges } = buildElkGraph(llmNodes);
    const elkNodes = nodes.map((n) => ({ 
      id: n.id, 
      width: n.width, 
      height: n.height, 
      labels: [{ text: n.label }] 
    }));
    const elkEdges = edges.map((e) => ({ 
      id: e.id, 
      sources: [e.source], 
      targets: [e.target] 
    }));

    // Calculate content-aware spacing
    const contentAwareSpacing = calculateContentAwareSpacing(nodes, layoutType);

    const elkGraph = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': LAYOUT_OPTIONS[layoutType]?.algorithm || 'layered',
        'elk.direction': LAYOUT_OPTIONS[layoutType]?.direction,
        'elk.spacing.nodeNode': contentAwareSpacing,
        'elk.spacing.nodeNodeBetweenLayers': contentAwareSpacing * 1.2,
        'elk.spacing.edgeNode': contentAwareSpacing * 0.5,
        'elk.spacing.edgeEdge': contentAwareSpacing * 0.3,
        'elk.layered.spacing.nodeNodeBetweenLayers': contentAwareSpacing * 1.2,
        'elk.layered.spacing.edgeNodeBetweenLayers': contentAwareSpacing * 0.8,
        'elk.radial.spacing': contentAwareSpacing,
        'elk.force.spacing': contentAwareSpacing,
      },
      children: elkNodes,
      edges: elkEdges,
    };

    const layout = await elk.layout(elkGraph);
    
    // Map positions back to React Flow
    const rfNodes = layout.children.map((n) => ({
      id: n.id,
      type: 'mindMapNode',
      position: { x: n.x, y: n.y },
      data: {
        ...nodes.find((orig) => orig.id === n.id).data,
        layout: layoutType,
      },
    }));
    
    const rfEdges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'straight',
      style: { strokeWidth: 2, stroke: '#666666' },
    }));
    
    return { nodes: rfNodes, edges: rfEdges };
  } catch (error) {
    console.error('Error in elkLayoutedMindMap:', error);
    // Fallback to simple layout if ELK fails
    return {
      nodes: llmNodes.map((node, index) => ({
        id: `node-${index + 1}`,
        type: 'mindMapNode',
        position: { x: index * 300, y: 200 },
        data: {
          label: node.label || 'Untitled',
          bullets: node.bullets || [],
          isLeaf: !node.children || node.children.length === 0,
          level: 0,
          layout: layoutType,
        },
      })),
      edges: [],
    };
  }
}

export class MindMapConverter {
  static nodeIdCounter = 0;

  static generateNodeId() {
    return `node-${++this.nodeIdCounter}`;
  }

  static convertNodeToReactFlow(llmNode, level, parentId, angle = 0, radius = 0) {
    const nodeId = this.generateNodeId();
    const isLeaf = !llmNode.children || llmNode.children.length === 0;
    
    // Calculate position based on level and angle
    const centerX = 600; // Center of the canvas
    const centerY = 400; // Center of the canvas
    
    let x, y;
    if (level === 0) {
      // Root node at center
      x = centerX;
      y = centerY;
    } else {
      // Child nodes positioned in a circle around their parent
      x = centerX + Math.cos(angle) * radius;
      y = centerY + Math.sin(angle) * radius;
    }

    const node = {
      id: nodeId,
      type: 'mindMapNode',
      position: { x, y },
      data: {
        label: llmNode.label,
        bullets: llmNode.bullets || [],
        isLeaf,
        level
      }
    };

    const nodes = [node];
    const edges = [];

    // Create edge from parent if exists
    if (parentId) {
      edges.push({
        id: `edge-${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: 'smoothstep'
      });
    }

    // Process children
    if (llmNode.children && llmNode.children.length > 0) {
      const childCount = llmNode.children.length;
      const angleStep = (2 * Math.PI) / childCount; // Distribute children evenly in a circle
      const childRadius = 200 + (level * 150); // Increase radius for each level
      
      llmNode.children.forEach((child, index) => {
        const childAngle = angle + (index * angleStep) - (Math.PI / 2); // Start from top
        const childResult = this.convertNodeToReactFlow(
          child,
          level + 1,
          nodeId,
          childAngle,
          childRadius
        );

        nodes.push(...childResult.nodes);
        edges.push(...childResult.edges);
      });
    }

    return { nodes, edges };
  }

  static convertLLMNodesToReactFlow(llmNodes) {
    this.nodeIdCounter = 0;
    
    let allNodes = [];
    let allEdges = [];

    // If multiple root nodes, arrange them horizontally
    if (llmNodes.length > 1) {
      const spacing = 400;
      const startX = 600 - ((llmNodes.length - 1) * spacing) / 2;
      
      llmNodes.forEach((llmNode, index) => {
        const xOffset = startX + (index * spacing);
        const result = this.convertNodeToReactFlow(llmNode, 0, undefined, 0, 0);
        
        // Adjust positions for multiple root nodes
        result.nodes.forEach(node => {
          if (node.data.level === 0) {
            node.position.x = xOffset;
          } else {
            node.position.x += xOffset - 600; // Adjust relative to new root position
          }
        });
        
        allNodes.push(...result.nodes);
        allEdges.push(...result.edges);
      });
    } else {
      // Single root node
      const result = this.convertNodeToReactFlow(llmNodes[0], 0, undefined, 0, 0);
      allNodes.push(...result.nodes);
      allEdges.push(...result.edges);
    }

    return {
      nodes: allNodes,
      edges: allEdges
    };
  }
} 