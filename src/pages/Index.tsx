
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Layers, Search, Map as MapIcon } from 'lucide-react';
import MapContainer from '@/components/MapContainer';
import Toolbar from '@/components/Toolbar';
import LayersPanel from '@/components/LayersPanel';
import SearchPanel from '@/components/SearchPanel';
import ExportDialog from '@/components/ExportDialog';
import { DrawingManager } from '@/lib/drawing-tools';
import { downloadFile } from '@/lib/map-utils';

const Index = () => {
  const { toast } = useToast();
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [layers, setLayers] = useState<any[]>([
    {
      id: 'default',
      name: 'Default Layer',
      type: 'polygon',
      visible: true,
      features: [],
    },
  ]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>('default');
  
  const drawingManagerRef = useRef<DrawingManager | null>(null);
  
  // Initialize the drawing manager when the map is ready
  useEffect(() => {
    if (!mapInstance) return;
    
    drawingManagerRef.current = new DrawingManager(mapInstance);
    
    return () => {
      if (drawingManagerRef.current) {
        drawingManagerRef.current.dispose();
      }
    };
  }, [mapInstance]);
  
  // Set the active drawing tool
  useEffect(() => {
    if (!drawingManagerRef.current) return;
    
    drawingManagerRef.current.setDrawingMode(activeTool);
  }, [activeTool]);
  
  // Update undo/redo state
  const updateUndoRedoState = useCallback(() => {
    if (!drawingManagerRef.current) return;
    
    setCanUndo(drawingManagerRef.current.canUndo());
    setCanRedo(drawingManagerRef.current.canRedo());
  }, []);
  
  // Handle tool activation
  const handleSetActiveTool = (tool: string | null) => {
    setActiveTool(tool);
  };
  
  // Handle undo action
  const handleUndo = () => {
    if (!drawingManagerRef.current) return;
    
    drawingManagerRef.current.undo();
    updateUndoRedoState();
  };
  
  // Handle redo action
  const handleRedo = () => {
    if (!drawingManagerRef.current) return;
    
    drawingManagerRef.current.redo();
    updateUndoRedoState();
  };
  
  // Handle delete selected feature
  const handleDelete = () => {
    if (!drawingManagerRef.current) return;
    
    if (drawingManagerRef.current.getSelectedFeature()) {
      drawingManagerRef.current.deleteSelectedFeature();
      updateUndoRedoState();
      
      toast({
        title: 'Feature Deleted',
        description: 'The selected feature has been removed',
      });
    } else {
      toast({
        title: 'No Selection',
        description: 'Please select a feature to delete',
        variant: 'destructive',
      });
    }
  };
  
  // Handle saving features
  const handleSave = () => {
    if (!drawingManagerRef.current) return;
    
    const features = drawingManagerRef.current.getFeatures();
    
    // In a real app, this would save to a database
    console.log('Saving features:', features);
    
    toast({
      title: 'Features Saved',
      description: `Saved ${features.length} features to the database`,
    });
  };
  
  // Handle exporting features
  const handleExportClick = () => {
    setShowExportDialog(true);
  };
  
  const handleExport = (format: string, options: any) => {
    if (!drawingManagerRef.current) return;
    
    const features = drawingManagerRef.current.getFeatures();
    
    let content = '';
    let filename = `mapify-export-${new Date().toISOString().slice(0, 10)}`;
    let mimeType = '';
    
    if (format === 'geojson') {
      // Convert features to GeoJSON (simplified)
      content = JSON.stringify({
        type: 'FeatureCollection',
        features: features.map(feature => ({
          type: 'Feature',
          properties: feature.properties,
          geometry: {
            // Simplified for demo purposes
            type: feature.type === 'marker' ? 'Point' : 
                  feature.type === 'polyline' ? 'LineString' : 
                  feature.type === 'polygon' ? 'Polygon' : 
                  feature.type === 'circle' ? 'Point' : 'Polygon',
            coordinates: [0, 0] // Placeholder
          }
        }))
      }, null, 2);
      
      filename += '.geojson';
      mimeType = 'application/geo+json';
    } else if (format === 'kml') {
      // Create a simple KML file (simplified)
      content = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Mapify Export</name>
    <description>Exported features from Mapify</description>
    <!-- Features would be included here in a real implementation -->
  </Document>
</kml>`;
      
      filename += '.kml';
      mimeType = 'application/vnd.google-earth.kml+xml';
    }
    
    // Download the file
    downloadFile(content, filename, mimeType);
    
    toast({
      title: 'Export Complete',
      description: `${features.length} features exported as ${format.toUpperCase()}`,
    });
  };
  
  // Handle toggling the layers panel
  const handleToggleLayers = () => {
    setShowLayersPanel(!showLayersPanel);
    if (showSearchPanel) setShowSearchPanel(false);
  };
  
  // Handle toggling the search panel
  const handleToggleSearch = () => {
    setShowSearchPanel(!showSearchPanel);
    if (showLayersPanel) setShowLayersPanel(false);
  };
  
  // Handle layer visibility toggle
  const handleToggleLayerVisibility = (layerId: string) => {
    setLayers(layers.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
  };
  
  // Handle layer selection
  const handleLayerSelected = (layerId: string) => {
    setSelectedLayer(layerId);
  };
  
  // Handle adding a new layer
  const handleAddLayer = () => {
    const newId = `layer-${Date.now()}`;
    const newLayer = {
      id: newId,
      name: `Layer ${layers.length + 1}`,
      type: 'polygon',
      visible: true,
      features: [],
    };
    
    setLayers([...layers, newLayer]);
    setSelectedLayer(newId);
    
    toast({
      title: 'Layer Added',
      description: `Created new layer: ${newLayer.name}`,
    });
  };
  
  // Handle removing a layer
  const handleRemoveLayer = (layerId: string) => {
    if (layers.length <= 1) {
      toast({
        title: 'Cannot Remove Layer',
        description: 'You must have at least one layer',
        variant: 'destructive',
      });
      return;
    }
    
    const layerToRemove = layers.find(layer => layer.id === layerId);
    
    setLayers(layers.filter(layer => layer.id !== layerId));
    
    if (selectedLayer === layerId) {
      setSelectedLayer(layers[0].id);
    }
    
    toast({
      title: 'Layer Removed',
      description: `Removed layer: ${layerToRemove?.name}`,
    });
  };
  
  // Handle renaming a layer
  const handleRenameLayer = (layerId: string) => {
    const layerToRename = layers.find(layer => layer.id === layerId);
    if (!layerToRename) return;
    
    // In a production app, this would show a dialog
    const newName = prompt('Enter a new name for the layer:', layerToRename.name);
    
    if (newName && newName.trim()) {
      setLayers(layers.map(layer => 
        layer.id === layerId 
          ? { ...layer, name: newName.trim() }
          : layer
      ));
      
      toast({
        title: 'Layer Renamed',
        description: `Renamed to: ${newName.trim()}`,
      });
    }
  };
  
  // Handle measurement tool
  const handleMeasure = () => {
    // For now, just a simple toast. In a real app, this would activate measurement mode
    toast({
      title: 'Measurement Tool',
      description: 'Measurement tool is not implemented in this demo',
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b p-4 bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <MapIcon className="h-6 w-6 mr-2 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Mapify</h1>
          </div>
          <p className="text-muted-foreground">Geometry Editor</p>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container mx-auto p-4">
        {/* Toolbar */}
        <div className="mb-4">
          <Toolbar
            activeTool={activeTool}
            setActiveTool={handleSetActiveTool}
            mapInstance={mapInstance}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onDelete={handleDelete}
            onSave={handleSave}
            onExport={handleExportClick}
            onToggleLayers={handleToggleLayers}
            onToggleSearch={handleToggleSearch}
            onMeasure={handleMeasure}
          />
        </div>
        
        {/* Map with panels */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-12rem)]">
          {/* Layers panel */}
          {showLayersPanel && (
            <div className="lg:col-span-1 h-full">
              <LayersPanel
                layers={layers}
                onToggleLayerVisibility={handleToggleLayerVisibility}
                onLayerSelected={handleLayerSelected}
                selectedLayer={selectedLayer}
                onAddLayer={handleAddLayer}
                onRemoveLayer={handleRemoveLayer}
                onRenameLayer={handleRenameLayer}
              />
            </div>
          )}
          
          {/* Search panel */}
          {showSearchPanel && (
            <div className="lg:col-span-1 h-full">
              <SearchPanel
                mapInstance={mapInstance}
                onClose={() => setShowSearchPanel(false)}
              />
            </div>
          )}
          
          {/* Map */}
          <div className={`${
            (showLayersPanel || showSearchPanel) ? 'lg:col-span-4' : 'lg:col-span-5'
          } h-full`}>
            <MapContainer setMapInstance={setMapInstance} />
          </div>
        </div>
      </main>
      
      {/* Export dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        onExport={handleExport}
        layerNames={layers.map(layer => layer.name)}
      />
    </div>
  );
};

export default Index;
