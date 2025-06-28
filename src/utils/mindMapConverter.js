export class MindMapConverter {
  static nodeIdCounter = 0;

  static generateNodeId() {
    return `node-${++this.nodeIdCounter}`;
  }

  static convertNodeToReactFlow(llmNode, level, parentId, xOffset = 0, yOffset = 0) {
    const nodeId = this.generateNodeId();
    const isLeaf = !llmNode.children || llmNode.children.length === 0;
    
    // Calculate position based on level
    const x = 400 + (level * 250) + xOffset;
    const y = 300 + yOffset;

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
      const childSpacing = 200;
      const totalWidth = (llmNode.children.length - 1) * childSpacing;
      const startX = -totalWidth / 2;

      llmNode.children.forEach((child, index) => {
        const childXOffset = startX + (index * childSpacing);
        const childYOffset = 150;
        
        const childResult = this.convertNodeToReactFlow(
          child,
          level + 1,
          nodeId,
          childXOffset,
          childYOffset
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

    llmNodes.forEach((llmNode, index) => {
      const xOffset = index * 300;
      const result = this.convertNodeToReactFlow(llmNode, 0, undefined, xOffset, 0);
      allNodes.push(...result.nodes);
      allEdges.push(...result.edges);
    });

    return {
      nodes: allNodes,
      edges: allEdges
    };
  }
} 