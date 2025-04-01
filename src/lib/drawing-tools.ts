
// Represents drawing state and manage drawing operations
export class DrawingManager {
  private map: google.maps.Map;
  private drawingMode: string | null = null;
  private drawingOverlay: google.maps.drawing.DrawingManager | null = null;
  private drawnFeatures: any[] = [];
  private selectedFeature: any | null = null;
  private historyStack: any[][] = [[]];
  private historyIndex = 0;
  private listeners: google.maps.MapsEventListener[] = [];
  
  constructor(map: google.maps.Map) {
    this.map = map;
    this.initDrawingManager();
  }
  
  // Initialize Google Maps drawing manager
  private initDrawingManager() {
    this.drawingOverlay = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      markerOptions: {
        draggable: true,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#2563EB',
          strokeWeight: 2,
        },
      },
      polylineOptions: {
        strokeColor: '#10B981',
        strokeWeight: 3,
        strokeOpacity: 1,
        editable: true,
        draggable: true,
      },
      polygonOptions: {
        strokeColor: '#6366F1',
        strokeWeight: 2,
        strokeOpacity: 1,
        fillColor: '#6366F1',
        fillOpacity: 0.3,
        editable: true,
        draggable: true,
      },
      circleOptions: {
        strokeColor: '#F59E0B',
        strokeWeight: 2,
        strokeOpacity: 1,
        fillColor: '#F59E0B',
        fillOpacity: 0.3,
        editable: true,
        draggable: true,
      },
      rectangleOptions: {
        strokeColor: '#EF4444',
        strokeWeight: 2,
        strokeOpacity: 1,
        fillColor: '#EF4444',
        fillOpacity: 0.3,
        editable: true,
        draggable: true,
      },
    });
    
    this.drawingOverlay.setMap(this.map);
    
    // Listen for complete events
    this.listeners.push(
      google.maps.event.addListener(
        this.drawingOverlay, 
        'overlaycomplete', 
        (event: google.maps.drawing.OverlayCompleteEvent) => {
          this.handleOverlayComplete(event);
        }
      )
    );
  }
  
  // Handle completed drawing
  private handleOverlayComplete(event: google.maps.drawing.OverlayCompleteEvent) {
    const overlay = event.overlay;
    const type = event.type;
    
    // Add to drawn features
    const feature = {
      id: Date.now().toString(),
      type,
      overlay,
      properties: {
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${this.drawnFeatures.length + 1}`,
        createdAt: new Date().toISOString(),
      },
    };
    
    this.drawnFeatures.push(feature);
    
    // Make the feature selectable
    this.addFeatureListeners(feature);
    
    // Add to history
    this.pushToHistory();
    
    // Reset drawing mode
    this.setDrawingMode(null);
    
    // Select the newly created feature
    this.selectFeature(feature);
  }
  
  // Add event listeners to a feature
  private addFeatureListeners(feature: any) {
    const overlay = feature.overlay;
    
    this.listeners.push(
      google.maps.event.addListener(overlay, 'click', () => {
        this.selectFeature(feature);
      })
    );
    
    // For editable features, track changes for undo/redo
    if (feature.type !== 'marker') {
      const trackChanges = () => {
        this.pushToHistory();
      };
      
      if (feature.type === 'polyline' || feature.type === 'polygon') {
        this.listeners.push(
          google.maps.event.addListener(overlay.getPath(), 'set_at', trackChanges)
        );
        this.listeners.push(
          google.maps.event.addListener(overlay.getPath(), 'insert_at', trackChanges)
        );
        this.listeners.push(
          google.maps.event.addListener(overlay.getPath(), 'remove_at', trackChanges)
        );
      } else if (feature.type === 'circle') {
        this.listeners.push(
          google.maps.event.addListener(overlay, 'radius_changed', trackChanges)
        );
        this.listeners.push(
          google.maps.event.addListener(overlay, 'center_changed', trackChanges)
        );
      } else if (feature.type === 'rectangle') {
        this.listeners.push(
          google.maps.event.addListener(overlay, 'bounds_changed', trackChanges)
        );
      }
      
      this.listeners.push(
        google.maps.event.addListener(overlay, 'dragend', trackChanges)
      );
    }
  }
  
  // Set the drawing mode
  public setDrawingMode(mode: string | null) {
    this.drawingMode = mode;
    
    if (!this.drawingOverlay) return;
    
    if (mode === 'marker') {
      this.drawingOverlay.setDrawingMode(google.maps.drawing.OverlayType.MARKER);
    } else if (mode === 'polyline') {
      this.drawingOverlay.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
    } else if (mode === 'polygon') {
      this.drawingOverlay.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    } else if (mode === 'circle') {
      this.drawingOverlay.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);
    } else if (mode === 'rectangle') {
      this.drawingOverlay.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
    } else {
      this.drawingOverlay.setDrawingMode(null);
    }
    
    // Clear selection when starting to draw
    if (mode !== null) {
      this.clearSelection();
    }
  }
  
  // Select a feature
  public selectFeature(feature: any) {
    // Deselect current selection if exists
    this.clearSelection();
    
    this.selectedFeature = feature;
    
    // Highlight selected feature
    if (feature.overlay && feature.type !== 'marker') {
      if (feature.type === 'polyline') {
        feature.overlay.setOptions({
          strokeWeight: 5,
          strokeOpacity: 1,
        });
      } else {
        feature.overlay.setOptions({
          strokeWeight: 3,
          strokeOpacity: 1,
          fillOpacity: 0.5,
        });
      }
      
      // Enable editing
      if (feature.type === 'polyline' || feature.type === 'polygon') {
        feature.overlay.setEditable(true);
      } else if (feature.type === 'circle' || feature.type === 'rectangle') {
        feature.overlay.setEditable(true);
      }
    }
  }
  
  // Clear selection
  public clearSelection() {
    if (this.selectedFeature) {
      const feature = this.selectedFeature;
      
      // Reset styles
      if (feature.overlay && feature.type !== 'marker') {
        if (feature.type === 'polyline') {
          feature.overlay.setOptions({
            strokeWeight: 3,
            strokeOpacity: 0.8,
          });
        } else {
          feature.overlay.setOptions({
            strokeWeight: 2,
            strokeOpacity: 0.8,
            fillOpacity: 0.3,
          });
        }
        
        // Disable editing
        if (feature.type === 'polyline' || feature.type === 'polygon') {
          feature.overlay.setEditable(false);
        } else if (feature.type === 'circle' || feature.type === 'rectangle') {
          feature.overlay.setEditable(false);
        }
      }
      
      this.selectedFeature = null;
    }
  }
  
  // Delete the selected feature
  public deleteSelectedFeature() {
    if (!this.selectedFeature) return;
    
    const featureIndex = this.drawnFeatures.findIndex(
      f => f.id === this.selectedFeature.id
    );
    
    if (featureIndex !== -1) {
      // Remove from map
      this.selectedFeature.overlay.setMap(null);
      
      // Remove from array
      this.drawnFeatures.splice(featureIndex, 1);
      
      // Add to history
      this.pushToHistory();
      
      this.selectedFeature = null;
    }
  }
  
  // Add current state to history
  private pushToHistory() {
    // Truncate the history stack if we're not at the end
    if (this.historyIndex < this.historyStack.length - 1) {
      this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
    }
    
    // Add a deep copy of the current state
    this.historyStack.push(this.cloneFeatures());
    
    // Move the pointer
    this.historyIndex = this.historyStack.length - 1;
  }
  
  // Clone features for history
  private cloneFeatures() {
    return this.drawnFeatures.map(feature => ({ ...feature }));
  }
  
  // Check if undo is available
  public canUndo(): boolean {
    return this.historyIndex > 0;
  }
  
  // Check if redo is available
  public canRedo(): boolean {
    return this.historyIndex < this.historyStack.length - 1;
  }
  
  // Undo the last action
  public undo() {
    if (!this.canUndo()) return;
    
    this.historyIndex -= 1;
    this.restoreFromHistory();
  }
  
  // Redo the last undone action
  public redo() {
    if (!this.canRedo()) return;
    
    this.historyIndex += 1;
    this.restoreFromHistory();
  }
  
  // Restore state from history
  private restoreFromHistory() {
    // Clear current features from the map
    this.clearAllFeatures();
    
    // Get the historical state
    const historicalFeatures = this.historyStack[this.historyIndex];
    
    // Restore features
    // This is a placeholder, actual implementation would depend on feature serialization
    this.drawnFeatures = historicalFeatures;
  }
  
  // Clear all features from the map
  private clearAllFeatures() {
    this.drawnFeatures.forEach(feature => {
      if (feature.overlay) {
        feature.overlay.setMap(null);
      }
    });
    
    this.drawnFeatures = [];
    this.selectedFeature = null;
  }
  
  // Clean up
  public dispose() {
    // Remove all listeners
    this.listeners.forEach(listener => {
      google.maps.event.removeListener(listener);
    });
    
    // Clear drawing manager
    if (this.drawingOverlay) {
      this.drawingOverlay.setMap(null);
    }
    
    // Clear all features
    this.clearAllFeatures();
  }
  
  // Get all features
  public getFeatures() {
    return this.drawnFeatures;
  }
  
  // Get selected feature
  public getSelectedFeature() {
    return this.selectedFeature;
  }
  
  // Get current drawing mode
  public getDrawingMode() {
    return this.drawingMode;
  }
}
