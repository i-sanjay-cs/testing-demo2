// hooks/useRecordVoice.js
import { useState, useRef } from "react";

export const useRecordVoice = () => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const chunks = useRef([]);

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream, {
          mimeType: "audio/webm; codecs=opus",
          bitsPerSecond: 128000,
          sampleRate: 48000,
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        });

        recorder.addEventListener("dataavailable", (event) => {
          chunks.current.push(event.data);
        });

        recorder.addEventListener("stop", () => {
          const blob = new Blob(chunks.current, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          setRecording(false);
          setAudioBlob(blob);
        });

        recorder.start();
        setMediaRecorder(recorder);
        setRecording(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  };

  return { recording, startRecording, stopRecording, audioUrl, audioBlob };
};
