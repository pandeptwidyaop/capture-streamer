
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
    if (streamRef.current) return;
    
    try {
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
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
      }
    } catch (err) {
      setError("Could not access webcam. Please ensure you have granted camera permission.");
      console.error("Webcam error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [options.width, options.height, options.facingMode]);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      setIsActive(false);
    }
  }, []);

  const captureFrame = useCallback((quality: number = 0.9): string | null => {
    if (!canvasRef.current || !videoRef.current || !isActive) return null;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return null;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL with specified quality
    return canvas.toDataURL('image/jpeg', quality);
  }, [isActive]);

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
