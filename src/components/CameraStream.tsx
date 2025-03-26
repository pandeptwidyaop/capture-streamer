
import { useEffect, useState } from "react";
import { useWebcam } from "@/hooks/useWebcam";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Video } from "lucide-react";
import { ConnectionForm } from "./ConnectionForm";
import { StreamControls } from "./StreamControls";
import { toast } from "sonner";

export function CameraStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [frameRate, setFrameRate] = useState(15);
  const [quality, setQuality] = useState(0.8);
  const [streamInterval, setStreamInterval] = useState<NodeJS.Timeout | null>(null);
  
  const {
    videoRef,
    canvasRef,
    isActive,
    isLoading,
    error,
    startWebcam,
    stopWebcam,
    captureFrame
  } = useWebcam({ width: 1280, height: 720 });
  
  const {
    url,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendMessage
  } = useWebSocket();

  // Start or stop streaming
  const toggleStreaming = () => {
    if (isStreaming) {
      // Stop streaming
      if (streamInterval) {
        clearInterval(streamInterval);
        setStreamInterval(null);
      }
      setIsStreaming(false);
      toast.info("Streaming stopped");
    } else {
      // Start streaming
      if (!isConnected) {
        toast.error("Not connected to WebSocket server");
        return;
      }
      
      if (!isActive) {
        toast.error("Camera is not active");
        return;
      }
      
      const interval = setInterval(() => {
        const frame = captureFrame(quality);
        if (frame) {
          sendMessage(frame);
        }
      }, 1000 / frameRate);
      
      setStreamInterval(interval);
      setIsStreaming(true);
      toast.success("Streaming started");
    }
  };
  
  // Handle connection
  const handleConnect = (wsUrl: string) => {
    connect(wsUrl);
  };

  // Toggle webcam
  const toggleWebcam = async () => {
    if (isActive) {
      stopWebcam();
    } else {
      await startWebcam();
    }
  };
  
  // Update streaming on frame rate or quality change
  useEffect(() => {
    if (isStreaming) {
      // Restart streaming with new settings
      if (streamInterval) {
        clearInterval(streamInterval);
      }
      
      const interval = setInterval(() => {
        const frame = captureFrame(quality);
        if (frame) {
          sendMessage(frame);
        }
      }, 1000 / frameRate);
      
      setStreamInterval(interval);
    }
    
    return () => {
      if (streamInterval) {
        clearInterval(streamInterval);
      }
    };
  }, [frameRate, quality, isStreaming, captureFrame, sendMessage]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamInterval) {
        clearInterval(streamInterval);
      }
      stopWebcam();
      disconnect();
    };
  }, [streamInterval, stopWebcam, disconnect]);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="overflow-hidden border shadow-md">
        <CardContent className="p-0">
          <div className="webcam-container aspect-video relative">
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-card/95">
                <div className="text-center p-6">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={startWebcam}>Try Again</Button>
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-card/90">
                <div className="animate-pulse-subtle">Loading camera...</div>
              </div>
            )}
            
            {!isActive && !isLoading && !error && (
              <div className="absolute inset-0 flex flex-col gap-4 items-center justify-center bg-card/95">
                <Video className="h-16 w-16 text-muted-foreground" />
                <Button onClick={startWebcam} className="hover-scale">
                  Start Camera
                </Button>
              </div>
            )}
            
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted
              className={isActive ? "opacity-100" : "opacity-0"}
            />
            
            <canvas 
              ref={canvasRef} 
              className="hidden" 
            />
            
            {isActive && (
              <div className="absolute bottom-4 right-4">
                <Button 
                  variant="secondary" 
                  size="icon"
                  className="rounded-full shadow-lg"
                  onClick={toggleWebcam}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <ConnectionForm 
          onConnect={handleConnect}
          isConnected={isConnected}
          isConnecting={isConnecting}
          onDisconnect={disconnect}
          connectionUrl={url}
        />
        
        <StreamControls
          isConnected={isConnected}
          isActive={isActive}
          isStreaming={isStreaming}
          onToggleStream={toggleStreaming}
          frameRate={frameRate}
          onFrameRateChange={setFrameRate}
          quality={quality}
          onQualityChange={setQuality}
        />
      </div>
    </div>
  );
}
