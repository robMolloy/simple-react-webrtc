import { useEffect, useRef, useState } from "react";

export const SimpleViewer = () => {
  const videoElmRef = useRef<HTMLVideoElement | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [remoteOfferSDP, setRemoteOfferSDP] = useState("");
  const [answerSDP, setAnswerSDP] = useState("");
  const [candidateInput, setCandidateInput] = useState("");
  const [candidates, setCandidates] = useState<RTCIceCandidate[]>([]);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (videoElmRef.current && remoteStream) {
      videoElmRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2>SimpleViewer</h2>

      <video ref={videoElmRef} autoPlay playsInline style={{ width: "100%", background: "#000" }} />

      <div style={{ marginTop: 20 }}>
        {/* Remote Offer Input */}
        <div>
          <label>Remote Offer SDP (from streamer):</label>
          <textarea
            rows={10}
            style={{ width: "100%" }}
            value={remoteOfferSDP}
            onChange={function (event) {
              setRemoteOfferSDP(event.target.value);
            }}
          />
        </div>

        {/* Create Answer Button */}
        {remoteOfferSDP && (
          <button
            style={{ marginTop: 10 }}
            onClick={async function () {
              // Create peer connection
              const peerConnection = new RTCPeerConnection();

              // Remote tracks will be added to this stream
              const incomingStream = new MediaStream();
              setRemoteStream(incomingStream);

              peerConnection.ontrack = function (event) {
                event.streams[0] &&
                  event.streams[0].getTracks().forEach((track) => {
                    incomingStream.addTrack(track);
                  });
              };

              // Collect ICE candidates
              const localCandidates: RTCIceCandidate[] = [];
              peerConnection.onicecandidate = function (event) {
                if (event.candidate) {
                  localCandidates.push(event.candidate);
                  setCandidates([...localCandidates]);
                }
              };

              // Set remote offer
              const offerDescription = new RTCSessionDescription(JSON.parse(remoteOfferSDP));
              await peerConnection.setRemoteDescription(offerDescription);

              // Create answer
              const answerDescription = await peerConnection.createAnswer();
              await peerConnection.setLocalDescription(answerDescription);

              setAnswerSDP(JSON.stringify(answerDescription, null, 2));
              setPc(peerConnection);
            }}
          >
            Create Answer
          </button>
        )}

        {/* Answer Output */}
        {answerSDP && (
          <div style={{ marginTop: 10 }}>
            <label>Answer SDP (paste to streamer):</label>
            <textarea rows={10} style={{ width: "100%" }} readOnly value={answerSDP} />
          </div>
        )}

        {/* Remote ICE Candidate Input */}
        {pc && (
          <div style={{ marginTop: 10 }}>
            <label>Remote ICE Candidate (from streamer):</label>
            <textarea
              rows={5}
              style={{ width: "100%" }}
              value={candidateInput}
              onChange={function (event) {
                setCandidateInput(event.target.value);
              }}
            />
            <button
              onClick={async function () {
                candidateInput &&
                  (await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(candidateInput))));
              }}
            >
              Add Candidate
            </button>
          </div>
        )}

        {/* Local ICE Candidates */}
        {candidates.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <label>Generated ICE Candidates (paste to streamer):</label>
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
