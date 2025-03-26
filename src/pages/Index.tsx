
import { Layout } from "@/components/Layout";
import { CameraStream } from "@/components/CameraStream";

export default function Index() {
  return (
    <Layout>
      <div className="py-6 space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-medium tracking-tight">WebCamera Stream</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Capture and stream your webcam over WebSocket with adjustable frame rate and quality.
          </p>
        </div>
        <CameraStream />
      </div>
    </Layout>
  );
}
