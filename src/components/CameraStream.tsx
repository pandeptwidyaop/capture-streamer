
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

  const toggleStreaming = () => {
    console.log("Toggle streaming called, current state:", isStreaming, "webcam active:", isActive);
    
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
      
      console.log("Starting frame capture interval");
      const interval = setInterval(() => {
        console.log("Attempting to capture frame, webcam active:", isActive);
        const frame = captureFrame(quality);
        if (frame) {
          // Log the first 100 characters of the frame data
          console.log("Captured frame data (first 100 chars):", frame.substring(0, 100) + "...");
          console.log("Frame data size:", frame.length);
          // Now let's actually send the frame
          //TODO: Send to websocket
          // sendMessage(frame);
        } else {
          console.warn("Failed to capture frame");
        }
      }, 1000 / frameRate);
      
      setStreamInterval(interval);
      setIsStreaming(true);
      toast.success("Streaming started");
    }
  };

  const handleConnect = (wsUrl: string) => {
    connect(wsUrl);
  };

  const toggleWebcam = async () => {
    console.log("Toggle webcam called, current state:", isActive);
    if (isActive) {
      // If currently streaming, stop that first
      if (isStreaming) {
        if (streamInterval) {
          clearInterval(streamInterval);
          setStreamInterval(null);
        }
        setIsStreaming(false);
        toast.info("Streaming stopped because camera was turned off");
      }
      
      stopWebcam();
      console.log("Stopping webcam");
    } else {
      console.log("Starting webcam");
      try {
        await startWebcam();
        console.log("Webcam started successfully");
      } catch (error) {
        console.error("Error starting webcam:", error);
        toast.error("Failed to start camera. Please check permissions.");
      }
    }
  };

  // Clean up the stream interval when frame rate or quality changes
  useEffect(() => {
    if (isStreaming) {
      if (streamInterval) {
        clearInterval(streamInterval);
      }
      
      console.log("Updating stream interval due to frameRate or quality change");
      const interval = setInterval(() => {
        console.log("Attempting to capture frame (from effect)");
        const frame = captureFrame(quality);
        if (frame) {
          console.log("Captured frame, size:", frame.length);
          sendMessage(frame);
        } else {
          console.warn("Failed to capture frame (from effect)");
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
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (streamInterval) {
        clearInterval(streamInterval);
      }
      // stopWebcam();
      // disconnect();
    };
  }, [streamInterval, stopWebcam, disconnect]);

  // Debug log for monitoring webcam state
  useEffect(() => {
    console.log("Webcam state changed:", { isActive, isLoading, error });
  }, [isActive, isLoading, error]);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="overflow-hidden border shadow-md">
        <CardContent className="p-0">
          <div className="webcam-container aspect-video relative">
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-card/95 z-10">
                <div className="text-center p-6">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={startWebcam}>Try Again</Button>
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-card/90 z-10">
                <div className="animate-pulse-subtle">Loading camera...</div>
              </div>
            )}
            
            {!isActive && !isLoading && !error && (
              <div className="absolute inset-0 flex flex-col gap-4 items-center justify-center bg-card/95 z-20">
                <Video className="h-16 w-16 text-muted-foreground" />
                <Button 
                  onClick={toggleWebcam} 
                  className="hover-scale relative z-30"
                  type="button"
                >
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
              <div className="absolute bottom-4 right-4 z-20">
                <Button 
                  variant="secondary" 
                  size="icon"
                  className="rounded-full shadow-lg"
                  onClick={toggleWebcam}
                  type="button"
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
