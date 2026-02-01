import { useEffect, useRef, useState } from "react";

export async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    return { success: true, data: stream };
  } catch (err) {
    console.error("Failed to access camera:", err);
    return { success: false, error: err };
  }
}

export async function startStream(p: {
  cameraStream: MediaStream;
  onNewCandidate: (candidate: RTCIceCandidate) => void;
}) {
  const { cameraStream, onNewCandidate } = p;
  try {
    if (!cameraStream) throw new Error("No camera stream provided");

    const peerConnection = new RTCPeerConnection();

    // Add camera tracks to the connection
    cameraStream.getTracks().forEach(function (track) {
      peerConnection.addTrack(track, cameraStream);
    });

    // Collect ICE candidates
    peerConnection.onicecandidate = function (event) {
      if (event.candidate) onNewCandidate(event.candidate);
    };

    // Create offer
    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription);

    return {
      success: true,
      data: {
        pc: peerConnection,
        offerSDP: offerDescription,
      },
    } as const;
  } catch (err) {
    console.error("Failed to start stream:", err);
    return { success: false, error: err } as const;
  }
}

export const SimpleStreamer = () => {
  const videoElmRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [offerSDP, setOfferSDP] = useState("");
  const [answerSDP, setAnswerSDP] = useState("");
  const [candidateInput, setCandidateInput] = useState("");
  const [candidates, setCandidates] = useState<RTCIceCandidate[]>([]);

  useEffect(() => {
    (async function () {
      const cameraResponse = await startCamera();

      if (!cameraResponse.success) {
        console.error("Camera error:", cameraResponse.error);
        return;
      }

      const stream = cameraResponse.data;
      const videoElm = videoElmRef.current;
      if (!stream) return;
      if (!videoElm) return;

      setCameraStream(stream);

      videoElm.srcObject = stream;
    })();

    return function cleanup() {
      cameraStream && cameraStream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function addCandidate() {
    pc &&
      candidateInput &&
      (async function () {
        try {
          const candidate = new RTCIceCandidate(JSON.parse(candidateInput));
          await pc.addIceCandidate(candidate);
          alert("Candidate added!");
        } catch (err) {
          console.error(err);
          alert("Failed to add candidate");
        }
      })();
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2>SimpleStreamer</h2>

      <video
        ref={videoElmRef}
        autoPlay
        muted
        playsInline
        style={{ width: "100%", background: "#000" }}
      />

      <div style={{ marginTop: 20 }}>
        {/* Send Stream Button */}
        {cameraStream && (
          <button
            onClick={async function () {
              const startStreamResponse = await startStream({
                cameraStream,
                onNewCandidate: (candidate) => {
                  setCandidates((prev) => [...prev, candidate]);
                },
              });

              if (!startStreamResponse.success) return;

              setPc(startStreamResponse.data.pc);
              setOfferSDP(JSON.stringify(startStreamResponse.data.offerSDP, null, 2));
            }}
          >
            Send Stream
          </button>
        )}

        <div style={{ marginTop: 10 }}>
          <label>Local Offer SDP:</label>
          <textarea rows={10} style={{ width: "100%" }} readOnly value={offerSDP} />
        </div>

        {/* Apply Answer Section */}
        {pc && answerSDP && (
          <div style={{ marginTop: 10 }}>
            <label>Remote Answer SDP:</label>
            <textarea
              rows={10}
              style={{ width: "100%" }}
              value={answerSDP}
              onChange={function (event) {
                setAnswerSDP(event.target.value);
              }}
            />
            <button
              onClick={async function () {
                const remoteAnswer = new RTCSessionDescription(JSON.parse(answerSDP));
                await pc.setRemoteDescription(remoteAnswer);
                alert("Remote answer applied!");
              }}
            >
              Apply Answer
            </button>
          </div>
        )}

        {/* Add Candidate Section */}
        {pc && (
          <div style={{ marginTop: 10 }}>
            <label>Remote ICE Candidate:</label>
            <textarea
              rows={5}
              style={{ width: "100%" }}
              value={candidateInput}
              onChange={function (event) {
                setCandidateInput(event.target.value);
              }}
            />
            <button onClick={addCandidate}>Add Candidate</button>
          </div>
        )}

        {candidates.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <label>Generated ICE Candidates:</label>
            <ul>
              {candidates.map(function (candidate, index) {
                return (
                  <li key={index}>
                    <pre style={{ fontSize: 12 }}>{JSON.stringify(candidate, null, 2)}</pre>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
