import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import useEditorStore from "../util/store";
import EditorComponent from "../components/EditorComponent";
import OutputComponent from "../components/OutputComponent";
import RoomAuth from "../components/RoomAuth";
import axios from "axios";
// import MyDropdown from "../components/MyDropdown";
import LanguageDropdown from "../components/LanguageDropdown";
import MyButton from "../components/MyButton";

const socket = io(import.meta.env.VITE_BACKEND_URL);
export default function Home() {
  const { language, setLanguage, code, setCode } = useEditorStore();
  const [output, setOutput] = useState("");
  const [roomId, setRoomId] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null); // 🔹 Store local media stream
  const [waitingForAuth, setWaitingForAuth] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔹 New States for Video & Audio Toggle
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // 🔹 Auto-Fill Room ID & Password from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get("roomId");
    const passwordFromUrl = urlParams.get("password");

    if (roomFromUrl && passwordFromUrl) {
      setRoomId(roomFromUrl);
      setPassword(passwordFromUrl);
      setWaitingForAuth(true);
      toast.info("🔗 Room details auto-filled! Click 'Join Room' to enter.", {
        position: "top-right",
      });
    }
  }, []);

  // 🔹 WebSocket Listeners for Code Collaboration
  useEffect(() => {
    if (!roomId || waitingForAuth) return;

    const handleCodeUpdate = (updatedCode) => setCode(updatedCode);
    const handleOutputUpdate = (updatedOutput) => setOutput(updatedOutput);
    const handleRunningUpdate = (isRunning) => setLoading(isRunning);

    socket.on("codeUpdate", handleCodeUpdate);
    socket.on("outputUpdate", handleOutputUpdate);
    socket.on("runningUpdate", handleRunningUpdate);

    return () => {
      socket.off("codeUpdate", handleCodeUpdate);
      socket.off("outputUpdate", handleOutputUpdate);
      socket.off("runningUpdate", handleRunningUpdate);
    };
  }, [roomId, waitingForAuth]);

  // 🔹 Copy Invite Link to Clipboard
  const copyInviteLink = () => {
    if (!roomId || !password) {
      toast.error("Room ID or Password missing!", { position: "top-right" });
      return;
    }

    const inviteLink = `${window.location.origin}/?roomId=${roomId}&password=${password}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success("✅ Invite link copied!", { position: "top-right" });
  };

  // 🔹 Run Code in Room
  const runCode = () => {
    if (!roomId) return;
    socket.emit("codeRun", { roomId, language, code });
  };

  // 🔹 Handle Authentication (User Joins Room)
  const handleAuthenticated = (room, password, code) => {
    setCode(code);
    setRoomId(room);
    setPassword(password);
    setWaitingForAuth(false);
  };

  // 🔹 Handle Leaving Room Properly
  const handleLeaveRoom = () => {
    if (!roomId) return;

    // Notify backend
    socket.emit("leaveRoom", { roomId });

    // Stop all media tracks properly
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        track.stop(); // Stop track
      });
      localStream.current = null;
    }

    // Completely detach video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Close WebRTC Connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    // Reset state
    setRoomId(null);
    setCode("// Start coding...");
    setOutput("");
    setWaitingForAuth(true);
    setVideoEnabled(true);
    setAudioEnabled(true);

    // Show Toast Notification
    toast.info("🚪 Left the room successfully!", { position: "top-right" });
  };

  // 🔹 Setup WebRTC Video Call
  useEffect(() => {
    if (!roomId || waitingForAuth) return;

    navigator.mediaDevices
      .getUserMedia({ video: videoEnabled, audio: audioEnabled })
      .then((stream) => {
        localStream.current = stream; // Store Stream for Toggle
        localVideoRef.current.srcObject = stream;
        peerConnection.current = new RTCPeerConnection({
          iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
        });

        stream
          .getTracks()
          .forEach((track) => peerConnection.current.addTrack(track, stream));

        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("iceCandidate", { roomId, candidate: event.candidate });
          }
        };

        peerConnection.current.ontrack = (event) => {
          remoteVideoRef.current.srcObject = event.streams[0];
        };

        socket.on("offer", async ({ senderId, offer }) => {
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(offer)
          );
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          socket.emit("answer", { roomId, answer, senderId });
        });

        socket.on("answer", async ({ answer }) => {
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        });

        socket.on("iceCandidate", async ({ candidate }) => {
          try {
            await peerConnection.current.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          } catch (e) {
            console.error("Error adding received ICE candidate", e);
          }
        });
      });
  }, [roomId, waitingForAuth, videoEnabled, audioEnabled]);

  // 🔹 Toggle Video & Audio Without Reload
  const toggleMedia = (type) => {
    if (!localStream.current) return;

    localStream.current.getTracks().forEach((track) => {
      if (track.kind === type) {
        track.stop(); // Stop the track
        localStream.current.removeTrack(track); // Remove from stream
      }
    });

    // Restart video/audio if toggled back on
    if (type === "video") {
      setVideoEnabled((prev) => {
        const newState = !prev;
        toast.info(newState ? "📹 Video On" : "📹 Video Off", {
          position: "top-right",
        });
        return newState;
      });
      if (!videoEnabled) startMediaStream(); // Restart stream
    }

    if (type === "audio") {
      setAudioEnabled((prev) => {
        const newState = !prev;
        toast.info(newState ? "🎙️ Audio On" : "🎙️ Audio Off", {
          position: "top-right",
        });
        return newState;
      });
      if (!audioEnabled) startMediaStream(); // Restart stream
    }
  };
  const startMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: audioEnabled,
      });

      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, stream);
      });
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };
  const saveCode = async () => {
    if (!roomId) return;
    setSaving(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/rooms/save`,
        {
          roomId,
          code,
        }
      );

      if (response.data.success) {
        toast.success("Code succesfully saved", {
          position: "top-right",
        });
      } else {
        toast.error("Failed to save code!", { position: "top-right" });
      }
    } catch (error) {
      toast.error("Failed to save code!", { position: "top-right" });
    } finally {
      setSaving(false);
    }
  };

  return waitingForAuth ? (
    <RoomAuth onAuthenticated={handleAuthenticated} socket={socket} />
  ) : (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      <ToastContainer />
      <header className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 shadow-md flex justify-between items-center">
        <div className="font-bold text-white text-xl">
          Room: <span className="text-green-400">{roomId}</span>
        </div>
        <div className="flex gap-4 items-center">
          <LanguageDropdown language={language} setLanguage={setLanguage} />
          <MyButton onClick={copyInviteLink} text="Copy Invite Link" />
          <MyButton onClick={handleLeaveRoom} text="Leave Room" />
          {/* <button
            onClick={copyInviteLink}
            className="cursor-pointer bg-blue-500 px-4 py-2 rounded text-white text-sm"
          >
            Copy Invite Link
          </button> */}
          {/* <button
            onClick={handleLeaveRoom}
            className="cursor-pointer bg-red-500 px-4 py-2 rounded text-white text-sm"
          >
            Leave Room
          </button> */}
        </div>
      </header>

      <div className="flex flex-1 h-full">
        <div className="w-2/3 h-full p-4">
          <EditorComponent roomId={roomId} socket={socket} />
        </div>

        <div className="w-1/3 h-full flex flex-col border-l border-gray-700 p-4">
          <div className="h-1/2 flex gap-2">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="w-1/2 bg-black rounded-lg shadow-md"
            />
            <video
              ref={remoteVideoRef}
              autoPlay
              className="w-1/2 bg-black rounded-lg shadow-md"
            />
          </div>

          <div className="flex gap-1 justify-between mt-2">
            <MyButton
              onClick={() => toggleMedia("video")}
              text={videoEnabled ? "turn video off" : "turn video on"}
              color={videoEnabled ? "bg-red-400" : "bg-green-400"}
            />
            <MyButton
              onClick={() => toggleMedia("audio")}
              text={audioEnabled ? "turn audio off" : "turn audio on"}
              color={audioEnabled ? "bg-red-400" : "bg-green-400"}
            />
            <MyButton
              onClick={runCode}
              text={loading ? "" : "run code"}
              isLoading={loading}
            />
            <MyButton
              onClick={saveCode}
              text={saving ? "saving..." : "save code online"}
              isLoading={saving}
            />
            {/* <button
              onClick={() => toggleMedia("video")}
              className={`cursor-pointer px-4 py-2 rounded text-white ${
                videoEnabled ? "bg-red-500" : "bg-green-500"
              }`}
            > */}
            {/* {videoEnabled ? "turn video Off" : "turn video On"}
            </button> */}
            {/* <button
              onClick={() => toggleMedia("audio")}
              className={`cursor-pointer px-4 py-2 rounded text-white ${
                audioEnabled ? "bg-red-500" : "bg-green-500"
              }`}
            >
              {audioEnabled ? "turn audio Off" : "turn audio On"}
            </button> */}
            {/* <button
              onClick={runCode}
              className="cursor-pointer bg-green-500 px-4 py-2 rounded text-white"
            >
              {loading ? "running..." : "run code"}
            </button> */}
            {/* <button
              onClick={saveCode}
              className="cursor-pointer bg-blue-500 px-4 py-2 rounded text-white"
              disabled={saving}
            >
              {saving ? "saving..." : "save code online"}
            </button> */}
          </div>
          <div className=" mt-5 flex-1 overflow-auto">
            <OutputComponent output={output} />
          </div>
        </div>
      </div>
    </div>
  );
}
