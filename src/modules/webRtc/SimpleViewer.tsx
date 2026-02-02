import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

export const SimpleViewer = () => {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [offerReceived, setOfferReceived] = useState(false);
  const [answerCreated, setAnswerCreated] = useState(false);
  // const [listeningForIce, setListeningForIce] = useState(false);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  // const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  // const viewerIceCandidatesRef = useRef<RTCIceCandidate[]>([]);

  useEffect(() => {
    const channel = new BroadcastChannel("webrtc-demo2");
    channelRef.current = channel;

    const peerConnection = new RTCPeerConnection();
    peerConnectionRef.current = peerConnection;

    peerConnection.ontrack = (event) => {
      if (videoElementRef.current && event.streams[0]) {
        videoElementRef.current.srcObject = event.streams[0];
      }
    };

    // peerConnection.onicecandidate = (event) => {
    //   if (event.candidate) {
    //     // STORE viewer's ICE candidates, DO NOT SEND
    //     viewerIceCandidatesRef.current.push(event.candidate);
    //   }
    // };

    // Listen for offer and ICE candidates from streamer
    channel.onmessage = (event) => {
      if (event.data.type === "offer") {
        pendingOfferRef.current = event.data.offer;
        setOfferReceived(true);
      }
      // else if (
      //   event.data.type === "ice-candidate" &&
      //   event.data.sender === "streamer"
      // ) {
      //   // Store ICE candidates instead of processing immediately
      //   pendingIceCandidatesRef.current.push(event.data.candidate);
      // }
    };

    return () => {
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
      channel.close();
      channelRef.current = null;
    };
  }, []);

  const createAnswerFromOffer = async () => {
    if (pendingOfferRef.current && peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(pendingOfferRef.current);

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      channelRef.current?.postMessage({
        type: "answer",
        answer: answer,
      });

      setAnswerCreated(true);
    }
  };

  // const startHandlingIce = async () => {
  //   setListeningForIce(true);

  //   // First, process all pending ICE candidates from streamer
  //   if (peerConnectionRef.current) {
  //     for (const candidate of pendingIceCandidatesRef.current) {
  //       await peerConnectionRef.current.addIceCandidate(candidate);
  //     }
      
  //     // Then send viewer's ICE candidates to streamer
  //     viewerIceCandidatesRef.current.forEach((candidate) => {
  //       channelRef.current?.postMessage({
  //         type: "ice-candidate",
  //         candidate: candidate.toJSON(),
  //         sender: "viewer",
  //       });
  //     });
  //   }
  // };

  return (
    <div>
      <h2>Simple Viewer</h2>
      <video ref={videoElementRef} autoPlay playsInline muted style={{ width: "400px" }} />
      <div>
        <Button onClick={createAnswerFromOffer} disabled={!offerReceived || answerCreated}>
          Create Answer from Offer
        </Button>
        {/* <Button onClick={startHandlingIce} disabled={!answerCreated || listeningForIce}>
          Handle ICE Candidates
        </Button> */}
      </div>
    </div>
  );
};
