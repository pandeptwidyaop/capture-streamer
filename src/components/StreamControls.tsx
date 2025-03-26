
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal } from "lucide-react";

interface StreamControlsProps {
  isConnected: boolean;
  isActive: boolean;
  isStreaming: boolean;
  onToggleStream: () => void;
  frameRate: number;
  onFrameRateChange: (value: number) => void;
  quality: number;
  onQualityChange: (value: number) => void;
}

export function StreamControls({
  isConnected,
  isActive,
  isStreaming,
  onToggleStream,
  frameRate,
  onFrameRateChange,
  quality,
  onQualityChange
}: StreamControlsProps) {
  const canStream = isConnected && isActive;

  const handleFrameRateChange = (values: number[]) => {
    if (values.length > 0) {
      console.log("Changing frame rate to:", values[0]);
      onFrameRateChange(values[0]);
    }
  };

  const handleQualityChange = (values: number[]) => {
    if (values.length > 0) {
      console.log("Changing quality to:", values[0]);
      onQualityChange(values[0]);
    }
  };

  const handleToggleStream = () => {
    console.log("Stream toggle button clicked, current state:", isStreaming);
    onToggleStream();
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Stream Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="fps">Frame Rate: {frameRate} FPS</Label>
              <span className="text-xs text-muted-foreground">{frameRate} frames/sec</span>
            </div>
            <Slider
              id="fps"
              min={1}
              max={30}
              step={1}
              defaultValue={[frameRate]}
              value={[frameRate]}
              onValueChange={handleFrameRateChange}
              disabled={!canStream}
              className="focus-ring"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="quality">Quality: {Math.round(quality * 100)}%</Label>
              <span className="text-xs text-muted-foreground">JPEG quality</span>
            </div>
            <Slider
              id="quality"
              min={0.1}
              max={1}
              step={0.05}
              defaultValue={[quality]}
              value={[quality]}
              onValueChange={handleQualityChange}
              disabled={!canStream}
              className="focus-ring"
            />
          </div>
        </div>
        
        <Button 
          onClick={handleToggleStream} 
          disabled={!canStream}
          className="w-full hover-scale"
          variant={isStreaming ? "destructive" : "default"}
          type="button"
        >
          {isStreaming ? "Stop Streaming" : "Start Streaming"}
        </Button>
        
        {!canStream && (
          <p className="text-xs text-muted-foreground text-center">
            {!isConnected && "Connect to a WebSocket server to start streaming."}
            {isConnected && !isActive && "Start your camera to enable streaming."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
