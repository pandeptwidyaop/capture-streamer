
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ConnectionFormProps {
  onConnect: (url: string) => void;
  onDisconnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  connectionUrl: string;
}

export function ConnectionForm({
  onConnect,
  onDisconnect,
  isConnected,
  isConnecting,
  connectionUrl
}: ConnectionFormProps) {
  const [url, setUrl] = useState(connectionUrl || "ws://localhost:8080");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isConnected) {
      onDisconnect();
    } else {
      onConnect(url);
    }
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">WebSocket Connection</CardTitle>
          {isConnected ? (
            <Badge variant="default" className="bg-green-500">Connected</Badge>
          ) : isConnecting ? (
            <Badge variant="outline" className="animate-pulse">Connecting...</Badge>
          ) : (
            <Badge variant="secondary">Disconnected</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="WebSocket URL (e.g., ws://localhost:8080)"
              disabled={isConnected || isConnecting}
              className="flex-1"
            />
            <Button 
              type="submit" 
              className="whitespace-nowrap hover-scale"
              disabled={isConnecting}
              variant={isConnected ? "destructive" : "default"}
            >
              {isConnected ? "Disconnect" : isConnecting ? "Connecting..." : "Connect"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
