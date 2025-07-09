// Call.jsx
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("https://wallmart-server.onrender.com");

export default function Call() {
  const [status, setStatus] = useState("Idle");
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const isCaller = useRef(false);

  useEffect(() => {
    socket.on("ready-to-call", async ({ isInitiator }) => {
      isCaller.current = isInitiator;
      await startCall();
    });

    socket.on("incoming-offer", async ({ offer }) => {
      await createPeer();
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      socket.emit("send-answer", { answer });
      setStatus("Connected");
    });

    socket.on("incoming-answer", async ({ answer }) => {
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      setStatus("Connected");
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (peerRef.current) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on("hangup", handleHangup);

    return () => socket.disconnect();
  }, []);

  const startCall = async () => {
    await getMediaStream();
    await createPeer();
    if (isCaller.current) {
      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);
      socket.emit("send-offer", { offer });
      setStatus("Calling...");
    }
  };

  const getMediaStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  };

  const createPeer = async () => {
    peerRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { candidate: event.candidate });
      }
    };

    peerRef.current.ontrack = (event) => {
      const remoteStream = event.streams[0];
      if (remoteAudioRef.current)
        remoteAudioRef.current.srcObject = remoteStream;
      if (remoteVideoRef.current)
        remoteVideoRef.current.srcObject = remoteStream;
    };

    localStreamRef.current
      .getTracks()
      .forEach((track) =>
        peerRef.current.addTrack(track, localStreamRef.current)
      );
  };

  const handleHangup = () => {
    peerRef.current?.close();
    peerRef.current = null;

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;

    setStatus("Disconnected");
  };

  const toggleAudio = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  return (
    <div className="app-container" style={{ marginTop: "50px" }}>
      <div className="card">
        <h1 className="anta-regular">🤳🏻 LetZ Talk</h1>
        <div className="video-section">
          <div className="video-wrapper">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="video"
            />
            {!isVideoEnabled && <div className="overlay-icon">📷🚫</div>}
            {!isAudioEnabled && <div className="mic-icon">🔇</div>}
          </div>
          <video ref={remoteVideoRef} autoPlay playsInline className="video" />
        </div>

        <div className="buttons">
          <button onClick={toggleAudio} className="btn small">
            {isAudioEnabled ? "🔊 Mute" : "🔇 Unmute"}
          </button>
          <button onClick={toggleVideo} className="btn small">
            {isVideoEnabled ? "🎥 Stop Video" : "📷 Start Video"}
          </button>
          <button onClick={() => socket.emit("hangup")} className="btn end-btn">
            ❌ End
          </button>
        </div>

        <div className="status">
          <strong>Status:</strong> {status}
        </div>

        <audio ref={remoteAudioRef} autoPlay hidden />
      </div>
    </div>
  );
}
