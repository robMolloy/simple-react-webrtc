import { useEffect, useRef } from "react";

export type LocalViewerSlaveStatus =
  | { mode: "awaiting" }
  | {
      mode: "offer-received";
      data: { offer: RTCSessionDescriptionInit; peerConnection: RTCPeerConnection };
    }
  | { mode: "streaming"; data: { remoteStream: MediaStream; peerConnection: RTCPeerConnection } };

// Component for awaiting status
const AwaitingStatus = () => {
  return <p>Waiting for stream...</p>;
};

// Component for offer-received status
const OfferReceivedStatus = ({
  offer,
  peerConnection,
  onAnswerCreated,
}: {
  offer: RTCSessionDescriptionInit;
  peerConnection: RTCPeerConnection;
  onAnswerCreated?: (answer: RTCSessionDescriptionInit) => void;
}) => {
  const handleStartStream = async () => {
    if (!peerConnection) {
      console.error("peerConnection is not initialized");
      return;
    }

    try {
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      onAnswerCreated?.(answer);
    } catch (err) {
      console.error("Failed to create answer:", err);
    }
  };

  return (
    <button onClick={handleStartStream} style={{ marginTop: 10 }}>
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
}) => {
  const { status, onAnswerCreated, onDisconnect } = p;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
      <h2>Local Viewer</h2>

      {status.mode === "awaiting" && <AwaitingStatus />}

      {status.mode === "offer-received" && (
        <OfferReceivedStatus
          peerConnection={status.data.peerConnection}
          offer={status.data.offer}
          onAnswerCreated={onAnswerCreated}
        />
      )}

      {status.mode === "streaming" && (
        <StreamingStatus remoteStream={status.data.remoteStream} onDisconnect={onDisconnect} />
      )}
    </div>
  );
};
