
import { useRef, useState, useCallback, useEffect } from 'react';

interface WebcamOptions {
  width: number;
  height: number;
  facingMode?: string;
}

export function useWebcam(options: WebcamOptions = { width: 1280, height: 720 }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startWebcam = useCallback(async () => {
    if (streamRef.current) {
      console.log("Webcam already active, returning early");
      return;
    }
    
    try {
      console.log("Starting webcam...");
      setIsLoading(true);
      setError(null);
      
      const constraints = {
        video: {
          width: { ideal: options.width },
          height: { ideal: options.height },
          facingMode: options.facingMode || "user"
        },
        audio: false
      };
      
      console.log("Requesting media with constraints:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Media stream obtained");
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          setIsActive(true);
          setIsLoading(false);
          console.log("Webcam activated successfully");
        };
      } else {
        console.error("Video ref is null, cannot set stream");
        setIsLoading(false);
        throw new Error("Video element not available");
      }
    } catch (err) {
      console.error("Webcam access error:", err);
      setError("Could not access webcam. Please ensure you have granted camera permission.");
      setIsLoading(false);
      throw err;
    }
  }, [options.width, options.height, options.facingMode]);

  const stopWebcam = useCallback(() => {
    console.log("Stopping webcam...");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log("Stopping track:", track.kind);
        track.stop();
      });
      streamRef.current = null;
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      setIsActive(false);
      console.log("Webcam stopped successfully");
    } else {
      console.log("No active stream to stop");
    }
  }, []);

  const captureFrame = useCallback((quality: number = 0.9): string | null => {
    // Check if webcam is truly active by verifying both isActive state and streamRef
    if (!canvasRef.current || !videoRef.current) {
      console.log("Cannot capture frame: canvas or video ref is null");
      return null;
    }
    
    if (!isActive || !streamRef.current) {
      console.log("Cannot capture frame: webcam is not active", { 
        isActiveState: isActive, 
        hasStream: !!streamRef.current 
      });
      return null;
    }
    
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        console.error("Could not get 2D context from canvas");
        return null;
      }
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || options.width;
      canvas.height = video.videoHeight || options.height;
      
      console.log(`Capturing frame at ${canvas.width}x${canvas.height}`);
      
      // Draw the current video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL with specified quality
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      console.log(`Captured frame with quality ${quality}, data URL length: ${dataUrl.length}`);
      
      return dataUrl;
    } catch (error) {
      console.error("Error capturing frame:", error);
      return null;
    }
  }, [isActive, options.width, options.height]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    isActive,
    isLoading,
    error,
    startWebcam,
    stopWebcam,
    captureFrame
  };
}
