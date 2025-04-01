
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: string, options: any) => void;
  layerNames: string[];
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  onExport,
  layerNames,
}) => {
  const [format, setFormat] = useState('geojson');
  const [selectedLayers, setSelectedLayers] = useState<string[]>(layerNames);
  const [includeStyles, setIncludeStyles] = useState(true);
  const [includeProperties, setIncludeProperties] = useState(true);
  
  const handleExport = () => {
    onExport(format, {
      layers: selectedLayers,
      includeStyles,
      includeProperties,
    });
    onOpenChange(false);
  };
  
  const toggleLayer = (layerName: string) => {
    setSelectedLayers(
      selectedLayers.includes(layerName)
        ? selectedLayers.filter(name => name !== layerName)
        : [...selectedLayers, layerName]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Map Data</DialogTitle>
          <DialogDescription>
            Choose the export format and options for your geographic data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Format</h4>
            <RadioGroup
              value={format}
              onValueChange={setFormat}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="geojson" id="geojson" />
                <Label htmlFor="geojson">GeoJSON</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="kml" id="kml" />
                <Label htmlFor="kml">KML</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Layers to Export</h4>
            <div className="space-y-2">
              {layerNames.map((layerName) => (
                <div key={layerName} className="flex items-center space-x-2">
                  <Checkbox
                    id={`layer-${layerName}`}
                    checked={selectedLayers.includes(layerName)}
                    onCheckedChange={() => toggleLayer(layerName)}
                  />
                  <Label htmlFor={`layer-${layerName}`}>{layerName}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Options</h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-styles"
                checked={includeStyles}
                onCheckedChange={(checked) => setIncludeStyles(!!checked)}
              />
              <Label htmlFor="include-styles">Include styles</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-properties"
                checked={includeProperties}
                onCheckedChange={(checked) => setIncludeProperties(!!checked)}
              />
              <Label htmlFor="include-properties">Include properties</Label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
