
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, Pencil, Pentagon, Circle, Square, Undo, Redo, Trash2, 
  Ruler, Download, Layers, Search, ZoomIn, ZoomOut, Save
} from 'lucide-react';

interface ToolbarProps {
  activeTool: string | null;
  setActiveTool: (tool: string | null) => void;
  mapInstance: google.maps.Map | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onSave: () => void;
  onExport: () => void;
  onToggleLayers: () => void;
  onToggleSearch: () => void;
  onMeasure: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  activeTool, 
  setActiveTool,
  mapInstance,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onDelete,
  onSave,
  onExport,
  onToggleLayers,
  onToggleSearch,
  onMeasure
}) => {
  const tools = [
    { id: 'marker', name: 'Place Marker', icon: MapPin, shortcut: 'M' },
    { id: 'polyline', name: 'Draw Line', icon: Pencil, shortcut: 'L' },
    { id: 'polygon', name: 'Draw Polygon', icon: Pentagon, shortcut: 'P' },
    { id: 'circle', name: 'Draw Circle', icon: Circle, shortcut: 'C' },
    { id: 'rectangle', name: 'Draw Rectangle', icon: Square, shortcut: 'R' },
  ];

  const handleToolClick = (toolId: string) => {
    setActiveTool(activeTool === toolId ? null : toolId);
  };

  const handleZoom = (factor: number) => {
    if (!mapInstance) return;
    const currentZoom = mapInstance.getZoom() || 0;
    mapInstance.setZoom(currentZoom + factor);
  };

  return (
    <TooltipProvider>
      <div className="flex items-center bg-background p-1 rounded-md shadow-sm">
        {tools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === tool.id ? "default" : "ghost"}
                size="icon"
                onClick={() => handleToolClick(tool.id)}
                className={`rounded-md mx-0.5 ${activeTool === tool.id ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <tool.icon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{tool.name} ({tool.shortcut})</p>
            </TooltipContent>
          </Tooltip>
        ))}

        <Separator orientation="vertical" className="mx-2 h-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              className="rounded-md mx-0.5"
            >
              <Undo className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Undo (Ctrl+Z)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
              className="rounded-md mx-0.5"
            >
              <Redo className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Redo (Ctrl+Y)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="rounded-md mx-0.5"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Delete Selected (Del)</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMeasure}
              className="rounded-md mx-0.5"
            >
              <Ruler className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Measure Distance/Area (Alt+M)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSave}
              className="rounded-md mx-0.5"
            >
              <Save className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Save Features (Ctrl+S)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onExport}
              className="rounded-md mx-0.5"
            >
              <Download className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Export Data (Ctrl+E)</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleLayers}
              className="rounded-md mx-0.5"
            >
              <Layers className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Toggle Layers Panel (L)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSearch}
              className="rounded-md mx-0.5"
            >
              <Search className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Search Location (Ctrl+F)</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleZoom(1)}
              className="rounded-md mx-0.5"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Zoom In (+)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleZoom(-1)}
              className="rounded-md mx-0.5"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Zoom Out (-)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default Toolbar;
