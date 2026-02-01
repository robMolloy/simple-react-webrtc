import { useEffect, useRef, useState } from "react";
import { LocalViewerSlave, type LocalViewerSlaveStatus } from "./LocalViewerSlave";

export const LocalViewerOrchestrator = () => {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [slaveStatus, setSlaveStatus] = useState<LocalViewerSlaveStatus>({
    mode: "awaiting",
  });

  // Listen for potential streamer
  useEffect(() => {
    const channel = new BroadcastChannel("webrtc-demo");
    channelRef.current = channel;

    // Ask for offer in case streamer started first
    channel.postMessage({ type: "request-offer" });

    channel.onmessage = async (event) => {
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;

      // Offer received from streamer
      if (msg.type === "offer") {
        setSlaveStatus({ mode: "offer-received", data: { offer: msg.sdp } });
      }

      // Stream ended - revert to awaiting
      if (msg.type === "stream-ended") {
        setSlaveStatus({ mode: "awaiting" });
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  // Callback handlers
  const handleAnswerCreated = (answer: RTCSessionDescriptionInit) => {
    channelRef.current?.postMessage({ type: "answer", sdp: answer });
  };

  const handleDisconnect = () => {
    setSlaveStatus({ mode: "awaiting" });
    channelRef.current?.postMessage({ type: "request-offer" });
  };

  return (
    <LocalViewerSlave
      status={slaveStatus}
      onAnswerCreated={handleAnswerCreated}
      onDisconnect={handleDisconnect}
    />
  );
};
