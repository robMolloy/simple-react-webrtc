import { useEffect, useRef, useState } from "react";

export const LocalViewer = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const candidateQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const offerRef = useRef<RTCSessionDescriptionInit | null>(null);
  const [remoteStream] = useState<MediaStream>(() => new MediaStream());

  const [offerReceived, setOfferReceived] = useState(false); // streamer detected
  const [streaming, setStreaming] = useState(false); // viewer clicked start

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
      if (msg.type === "offer" && !pcRef.current) {
        setOfferReceived(true);

        // Store the offer temporarily; will set up peer when user clicks start
        offerRef.current = msg.sdp;
      }

      // ICE candidates while PC not created yet
      if (msg.type === "candidate") {
        const candidate = msg.candidate;
        if (!pcRef.current && candidate) {
          candidateQueueRef.current.push(candidate);
        } else if (pcRef.current && candidate) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch {
            candidateQueueRef.current.push(candidate);
          }
        }
      }
    };

    return () => {
      channel.close();
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, []);

  // Start streaming when user clicks button
  const startStream = async () => {
    const offer = offerRef.current;
    if (!offer) return;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    // Handle remote tracks
    pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => {
        if (!remoteStream.getTracks().some((t) => t.id === track.id)) {
          remoteStream.addTrack(track);
        }
      });
    };

    // Send ICE candidates to streamer
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        channelRef.current?.postMessage({
          type: "candidate",
          candidate: event.candidate.toJSON(),
        });
      }
    };

    try {
      await pc.setRemoteDescription(offer);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      channelRef.current?.postMessage({ type: "answer", sdp: answer });

      // Apply queued ICE candidates
      for (const c of candidateQueueRef.current) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        } catch {
          console.warn("Failed to add queued ICE candidate", c);
        }
      }
      candidateQueueRef.current = [];
      offerRef.current = null;

      setStreaming(true);
    } catch (err) {
      console.error("Failed to start stream:", err);
    }
  };

  // Attach stream to video
  useEffect(() => {
    if (streaming && videoRef.current) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [streaming, remoteStream]);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
      <h2>Local Viewer</h2>

      {!offerReceived && <p>Waiting for stream...</p>}

      {offerReceived && !streaming && (
        <button onClick={startStream} style={{ marginTop: 10 }}>
          Start Stream
        </button>
      )}

      {streaming && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "100%", background: "#000", marginTop: 10 }}
        />
      )}
    </div>
  );
};
