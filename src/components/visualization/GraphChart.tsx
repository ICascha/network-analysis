import { GraphCanvas, GraphCanvasRef, useSelection, lightTheme } from 'reagraph';  
import { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';  
import { Node as CustomNode, Edge } from './networkDataService';  

const denkWerkTheme = {
  ...lightTheme,
  node: {
    ...lightTheme.node,
    color: 'rgb(0,153,168)',
    fill: 'rgb(0,153,168)',
    activeFill: 'rgb(0,168,120)', // Changed to teal green
    label: {
      ...lightTheme.node.label,
      activeColor: 'rgb(0,168,120)', // Changed to teal green
    },
  },
  edge: {
    ...lightTheme.edge,
    activeStroke: 'rgb(0,168,120)', // Changed to teal green
    activeFill: 'rgb(0,168,120)', // Changed to teal green
  },
  arrow: {
    ...lightTheme.arrow,
    activeFill: 'rgb(0,168,120)', // Changed to teal green
  },
  ring: {
    ...lightTheme.ring,
    activeFill: 'rgb(0,168,120)', // Changed to teal green
  }
};

// Interface for our props  
interface GraphChartProps {    
  nodes: CustomNode[];    
  edges: Edge[];    
  loading?: boolean;    
  error?: string | null;    
  selectedNodeId: string | null;    
  onNodeSelect: (nodeId: string | null) => void;
  showRelationships?: boolean;
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
  ({ nodes, edges, loading, error, selectedNodeId, onNodeSelect, showRelationships = false }, ref) => {      
    // Internal ref to the actual GraphCanvas      
    const graphRef = useRef<GraphCanvasRef>(null);        

    // Use the selection hook
    const { 
      selections, 
      actives, 
      clearSelections, 
      setSelections 
    } = useSelection({
      ref: graphRef,
      nodes,
      edges,
      pathSelectionType: showRelationships ? 'all' : 'direct',
      selections: [],
    });

    // Reset selections when selected node or showRelationships changes
    useEffect(() => {
      // Clear all existing selections
      clearSelections();
      
      // If there's a selected node, add it to selections
      if (selectedNodeId) {
        setSelections([selectedNodeId]);
      }
    }, [selectedNodeId, showRelationships, clearSelections, setSelections]);

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

    // Handle node click manually to maintain our own state
    const handleNodeClick = (node: any) => {
      if (node && node.id) {
        onNodeSelect(node.id);
      }
    };
      
    // Handle canvas click to clear selection
    const handleCanvasClick = () => {
      onNodeSelect(null);
    };
      
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
        sizingType="pagerank"
        theme={denkWerkTheme}
      />
    );
  }  
);  

// Add display name for debugging  
GraphChart.displayName = 'GraphChart';  

export default GraphChart;