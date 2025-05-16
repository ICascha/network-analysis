import { GraphCanvas, GraphCanvasRef, useSelection, lightTheme } from 'reagraph';  
import { useRef, useImperativeHandle, forwardRef, useEffect, useMemo } from 'react';  
import { Node as CustomNode, Edge } from './networkDataService';  

// Define a sophisticated color palette for categories
const categoryColors: Record<string, string> = {
  'Gezondheid': 'rgb(72, 143, 177)', // Original teal blue
  'Geopolitiek & militair': 'rgb(72, 92, 114)', // Slate blue
  'Economisch': 'rgb(165, 137, 67)', // Muted gold
  'Sociaal & Maatschappelijk': 'rgb(158, 109, 135)', // Muted mauve
  'Ecologisch': 'rgb(105, 145, 94)', // Sage green
  'Technologisch & digitaal': 'rgb(99, 113, 163)', // Dusty blue
  'unknown': 'rgb(133, 133, 133)' // Sophisticated grey for unknown categories
};

// Base theme modification
const denkWerkTheme = {
  ...lightTheme,
  node: {
    ...lightTheme.node,
    activeFill: 'rgb(0,168,120)', // Changed to teal green for active nodes
    label: {
      ...lightTheme.node.label,
      activeColor: 'rgb(0,168,120)', // Changed to teal green for active labels
    },
  },
  edge: {
    ...lightTheme.edge,
    activeStroke: 'rgb(0,168,120)', // Changed to teal green for active edges
    activeFill: 'rgb(0,168,120)', // Changed to teal green for active edges
    opacity: 0.5,
  },
  arrow: {
    ...lightTheme.arrow,
    activeFill: 'rgb(0,168,120)', // Changed to teal green for active arrows
  },
  ring: {
    ...lightTheme.ring,
    activeFill: 'rgb(0,168,120)', // Changed to teal green for active rings
  },
  cluster: null as any,
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
  sizingAttribute?:  'eigen_centrality' | 
  'eigen_centrality_in' | 
  'eigen_centrality_out' | 
  'cross_category_eigen_centrality' | 
  'cross_category_eigen_centrality_in' | 
  'cross_category_eigen_centrality_out';
  minNodeSize?: number;
  maxNodeSize?: number;
  edgeWeightCutoff?: number;
  useWeightBasedEdgeSize?: boolean;
  clusterOnCategory?: boolean;
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
  ({ 
    nodes, 
    edges, 
    loading, 
    error, 
    selectedNodeId, 
    onNodeSelect, 
    showRelationships = false,
    sizingAttribute = 'hub',
    minNodeSize = 5,
    maxNodeSize = 15,
    edgeWeightCutoff = 1.5,
    useWeightBasedEdgeSize = false,
    clusterOnCategory = false,
  }, ref) => {      
    // Internal ref to the actual GraphCanvas      
    const graphRef = useRef<GraphCanvasRef>(null);

    // Process nodes to add category-based colors
    const processedNodes = useMemo(() => {
      return nodes.map(node => {
        const category = node.category || 'unknown';
        const color = categoryColors[category] || categoryColors.unknown;
        
        return {
          ...node,
          fill: color,
          color: color,
          data:
          {
            ...node.data,
            category: category,
          }
        };
      });
    }, [nodes]);

    // Filter edges based on weight cutoff and add size attribute if needed
    const processedEdges = useMemo(() => {
      // First find the min and max weights
      const weights = edges.map(edge => edge.weight);
      const minWeight = Math.min(...weights);
      const maxWeight = Math.max(...weights);
      
      // Scale factor for normalization between 1 and 5
      const scaleFactor = maxWeight === minWeight 
        ? 1 
        : 16 / (maxWeight - minWeight);
      
      return edges
        .filter(edge => edge.weight >= edgeWeightCutoff)
        .map(edge => {
          // Normalize weight to range 1-5 using min-max normalization and convert to integer
          const normalizedWeight = Math.round(
            1 + (edge.weight - minWeight) * scaleFactor / 3
          );
          
          return {
            ...edge,
            // Use normalized weight if useWeightBasedEdgeSize is true, otherwise use 1
            size: useWeightBasedEdgeSize ? normalizedWeight : 1,
            // Store the normalized weight for reference
            normalizedWeight
          };
        });
    }, [edges, edgeWeightCutoff, useWeightBasedEdgeSize]);

    // Use the selection hook
    const { 
      selections, 
      actives, 
      clearSelections, 
      setSelections 
    } = useSelection({
      ref: graphRef,
      nodes: processedNodes, // Use processed nodes with colors
      edges: processedEdges,
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
        edgeInterpolation="curved"
        ref={graphRef}
        nodes={processedNodes} // Use processed nodes with category colors
        edges={processedEdges}
        selections={selections}
        actives={actives}
        onNodeClick={handleNodeClick}
        onCanvasClick={handleCanvasClick}
        sizingType="attribute"
        sizingAttribute={sizingAttribute}
        theme={denkWerkTheme}
        minNodeSize={minNodeSize}
        maxNodeSize={maxNodeSize}
        clusterAttribute= {clusterOnCategory ? 'category' : undefined}
      />
    );
  }  
);  

// Add display name for debugging  
GraphChart.displayName = 'GraphChart';  

export default GraphChart;