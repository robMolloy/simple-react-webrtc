import { useEffect, useRef } from "react";

export type LocalViewerSlaveStatus =
  | { mode: "awaiting" | "offer-received" }
  | { mode: "streaming"; data: { remoteStream: MediaStream } };

// Component for awaiting status
const AwaitingStatus = () => {
  return <p>Waiting for stream...</p>;
};

// Component for offer-received status
const OfferReceivedStatus = ({ onStartStreamRequest }: { onStartStreamRequest?: () => void }) => {
  return (
    <button onClick={() => onStartStreamRequest?.()} style={{ marginTop: 10 }}>
      Start Stream
    </button>
  );
};

// Component for streaming status
const StreamingStatus = ({
  remoteStream,
  onDisconnect,
}: {
  remoteStream: MediaStream;
  onDisconnect?: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "100%", background: "#000", marginTop: 10 }}
      />
      <button onClick={() => onDisconnect?.()} style={{ marginTop: 10 }}>
        Disconnect
      </button>
    </>
  );
};

export const LocalViewerSlave = (p: {
  status: LocalViewerSlaveStatus;
  onAnswerCreated?: (answer: RTCSessionDescriptionInit) => void;
  onDisconnect?: () => void;
  onIceCandidate?: (candidate: RTCIceCandidateInit) => void;
  onStartStreamRequest?: () => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}) => {
  const { status, onDisconnect, onStartStreamRequest } = p;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
      <h2>Local Viewer</h2>

      {status.mode === "awaiting" && <AwaitingStatus />}

      {status.mode === "offer-received" && (
        <OfferReceivedStatus onStartStreamRequest={onStartStreamRequest} />
      )}

      {status.mode === "streaming" && (
        <StreamingStatus remoteStream={status.data.remoteStream} onDisconnect={onDisconnect} />
      )}
    </div>
  );
};
