import { useEffect, useRef, useState } from "react";

export const LocalViewer = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const candidateQueueRef = useRef<RTCIceCandidateInit[]>([]);

  // Single remote stream for all incoming tracks
  const [remoteStream] = useState<MediaStream>(() => new MediaStream());

  // Attach remoteStream once
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    const channel = new BroadcastChannel("webrtc-demo");
    channelRef.current = channel;

    // Ask for current offer in case streamer started first
    channel.postMessage({ type: "request-offer" });

    channel.onmessage = async (event) => {
      const msg = event.data;

      // Streamer sends offer
      if (msg.type === "offer") {
        // Prevent multiple PeerConnections if offer arrives again
        if (pcRef.current) return;

        const peerConnection = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        pcRef.current = peerConnection;

        // Handle incoming tracks
        peerConnection.ontrack = (event) => {
          event.streams[0]?.getTracks().forEach((track) => {
            if (!remoteStream.getTracks().some((t) => t.id === track.id)) {
              remoteStream.addTrack(track);
            }
          });
        };

        // Send ICE candidates back to streamer safely
        peerConnection.onicecandidate = (event) => {
          if (!event.candidate) return;

          try {
            channelRef.current?.postMessage({
              type: "candidate",
              candidate: event.candidate.toJSON(),
            });
          } catch (err) {
            console.warn("Failed to send ICE candidate:", err);
          }
        };

        // Set remote offer
        await peerConnection.setRemoteDescription(msg.sdp);

        // Create and send local answer
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        channel.postMessage({ type: "answer", sdp: answer });

        // Apply queued ICE candidates
        for (const c of candidateQueueRef.current) {
          try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(c));
          } catch (err) {
            console.warn("Failed to add queued ICE candidate:", err);
          }
        }
        candidateQueueRef.current.length = 0;
      }

      // Streamer sends ICE candidate
      if (msg.type === "candidate") {
        const pc = pcRef.current;
        if (pc) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
          } catch {
            candidateQueueRef.current.push(msg.candidate);
          }
        } else {
          candidateQueueRef.current.push(msg.candidate);
        }
      }
    };

    return () => {
      // Close BroadcastChannel and PeerConnection on unmount
      channel.close();
      if (pcRef.current) {
        pcRef.current.onicecandidate = null;
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2>Local Viewer</h2>
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        style={{ width: "100%", background: "#000" }}
      />
    </div>
  );
};
