import { useEffect, useRef } from "react";

export interface LocalViewerSlaveStatus {
  mode: "awaiting" | "offer-received" | "streaming";
  data?: {
    remoteStream?: MediaStream;
  };
}

export interface LocalViewerSlaveCallbacks {
  onAnswerCreated?: (answer: RTCSessionDescriptionInit) => void;
  onDisconnect?: () => void;
  onIceCandidate?: (candidate: RTCIceCandidateInit) => void;
  onStartStreamRequest?: () => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

export interface LocalViewerSlaveProps {
  status?: LocalViewerSlaveStatus;
  callbacks?: LocalViewerSlaveCallbacks;
}

export const LocalViewerSlave = ({
  status,
  callbacks = {},
}: LocalViewerSlaveProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const {
    onAnswerCreated,
    onDisconnect,
    onIceCandidate,
    onStartStreamRequest,
    onConnectionStateChange,
  } = callbacks;

  const mode = status?.mode ?? "awaiting";
  const remoteStream = status?.data?.remoteStream;

  // Attach stream to video when streaming
  useEffect(() => {
    if (mode === "streaming" && videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [mode, remoteStream]);

  const handleStartStream = () => {
    onStartStreamRequest?.();
  };

  const handleDisconnect = () => {
    onDisconnect?.();
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
      <h2>Local Viewer</h2>

      {mode === "awaiting" && <p>Waiting for stream...</p>}

      {mode === "offer-received" && (
        <button onClick={handleStartStream} style={{ marginTop: 10 }}>
          Start Stream
        </button>
      )}

      {mode === "streaming" && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", background: "#000", marginTop: 10 }}
          />
          <button onClick={handleDisconnect} style={{ marginTop: 10 }}>
            Disconnect
          </button>
        </>
      )}
    </div>
  );
};
