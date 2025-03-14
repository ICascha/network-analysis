import { GraphCanvas, GraphCanvasRef } from 'reagraph';
import { useRef, useImperativeHandle, forwardRef } from 'react';
import { Node as CustomNode, Edge } from './networkDataService';

// Interface for our props
interface GraphChartProps {
  nodes: CustomNode[];
  edges: Edge[];
  loading?: boolean;
  error?: string | null;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
}

// Interface for the ref we expose
export interface GraphChartRef {
  centerOnNode: (nodeId: string) => void;
  fitAllNodesInView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetCamera: () => void;
}

const GraphChart = forwardRef<GraphChartRef, GraphChartProps>(
  ({ nodes, edges, loading, error, selectedNodeId, onNodeSelect }, ref) => {
    // Internal ref to the actual GraphCanvas
    const graphRef = useRef<GraphCanvasRef>(null);

    // Expose methods to the parent component via ref
    useImperativeHandle(ref, () => ({
      centerOnNode: (nodeId: string) => {
        if (graphRef.current) {
          // Use only fitNodesInView with a specific zoom level for smoothness
          graphRef.current.centerGraph([nodeId]);
          if(graphRef.current.getControls().camera.zoom < 2){
            graphRef.current.zoomIn();
          }
          console.log(graphRef.current.getControls().camera.zoom);
        }
      },
      fitAllNodesInView: () => {
        graphRef.current?.fitNodesInView();
      },
      zoomIn: () => {
        graphRef.current?.zoomIn();
      },
      zoomOut: () => {
        graphRef.current?.zoomOut();
      },
      resetCamera: () => {
        graphRef.current?.resetControls();
      }
    }));

    // Handle node click directly without using useSelection
    const handleNodeClick = (node: any) => {
      if (node && node.id) {
        onNodeSelect(node.id);
      }
    };

    // Handle canvas click to clear selection
    const handleCanvasClick = () => {
      onNodeSelect(null);
    };

    // Calculate selections based on selectedNodeId
    const selections = selectedNodeId ? [selectedNodeId] : [];
    const actives = selectedNodeId ? [selectedNodeId] : [];

    // Render loading state
    if (loading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            Loading graph data...
          </div>
        </div>
      );
    }

    // Render error state
    if (error) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-red-500">
            Error loading graph: {error}
          </div>
        </div>
      );
    }

    // Render the graph
    return (
      <GraphCanvas 
        ref={graphRef}
        nodes={nodes}
        edges={edges}
        selections={selections}
        actives={actives}
        onNodeClick={handleNodeClick}
        onCanvasClick={handleCanvasClick}
      />
    );
  }
);

// Add display name for debugging
GraphChart.displayName = 'GraphChart';

export default GraphChart;