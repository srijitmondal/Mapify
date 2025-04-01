
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff, Layers, CircleEllipsis } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Layer {
  id: string;
  name: string;
  type: 'point' | 'line' | 'polygon' | 'circle' | 'rectangle';
  visible: boolean;
  features: any[];
}

interface LayersPanelProps {
  layers: Layer[];
  onToggleLayerVisibility: (layerId: string) => void;
  onLayerSelected: (layerId: string) => void;
  selectedLayer: string | null;
  onAddLayer: () => void;
  onRemoveLayer: (layerId: string) => void;
  onRenameLayer: (layerId: string) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  onToggleLayerVisibility,
  onLayerSelected,
  selectedLayer,
  onAddLayer,
  onRemoveLayer,
  onRenameLayer,
}) => {
  // Helper function to get icon based on layer type
  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'point':
        return <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>;
      case 'line':
        return <div className="h-[2px] w-4 bg-green-500 mr-2"></div>;
      case 'polygon':
        return <div className="h-3 w-3 bg-purple-500 mr-2"></div>;
      case 'circle':
        return <div className="h-3 w-3 rounded-full border-2 border-orange-500 mr-2"></div>;
      case 'rectangle':
        return <div className="h-3 w-3 border-2 border-red-500 mr-2"></div>;
      default:
        return <Layers className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="w-full h-full bg-background rounded-md border border-border p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Layers className="h-5 w-5 mr-2" />
          Layers
        </h2>
        <Button variant="outline" size="sm" onClick={onAddLayer}>
          Add Layer
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {layers.map((layer) => (
            <div
              key={layer.id}
              className={`flex items-center justify-between p-2 rounded-md ${
                selectedLayer === layer.id ? 'bg-accent' : 'hover:bg-accent/50'
              }`}
              onClick={() => onLayerSelected(layer.id)}
            >
              <div className="flex items-center flex-1 overflow-hidden">
                {getLayerIcon(layer.type)}
                <span className="text-sm truncate">{layer.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({layer.features.length})
                </span>
              </div>
              
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLayerVisibility(layer.id);
                  }}
                >
                  {layer.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CircleEllipsis className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Layer Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onRenameLayer(layer.id)}>
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => onRemoveLayer(layer.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          
          {layers.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No layers created</p>
              <p className="text-sm">Click "Add Layer" to get started</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default LayersPanel;
