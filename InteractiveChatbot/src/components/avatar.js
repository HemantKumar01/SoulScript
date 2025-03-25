import { useState, useRef, useEffect } from "react";

export default function LipSyncAnimation({
  audioFile,
  mouthShapeData,
  thinking,
}) {
  const [currentMouthShape, setCurrentMouthShape] = useState("X");
  const [isPlaying, setIsPlaying] = useState(false);
  const [parsedShapes, setParsedShapes] = useState([]);
  const [blink, setBlink] = useState(false);
  const blinkingRate = 3000;

  const audioRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!mouthShapeData || !Array.isArray(mouthShapeData)) return;

    const parsed = mouthShapeData.sort((a, b) => a.start - b.start);
    setParsedShapes(parsed);
    if (parsed.length > 0) {
      setCurrentMouthShape(parsed[0].value);
    }
  }, [mouthShapeData]);

  const updateAnimation = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;

      const currentShape = parsedShapes.find(
        (shape) => time >= shape.start && time < shape.end
      );

      setCurrentMouthShape(currentShape?.value || "X");
      animationFrameRef.current = requestAnimationFrame(updateAnimation);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateAnimation);
    } else {
      cancelAnimationFrame(animationFrameRef.current);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isPlaying, parsedShapes]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleAudioEnd = () => {
      setIsPlaying(false);
      cancelAnimationFrame(animationFrameRef.current);
    };

    audio.addEventListener("ended", handleAudioEnd);
    return () => audio.removeEventListener("ended", handleAudioEnd);
  }, []);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (isPlaying) return;
      setBlink(true);
      setTimeout(() => setBlink(false), blinkingRate * 0.1);
    }, blinkingRate);
    return () => clearInterval(blinkInterval);
  }, [isPlaying]);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      animationFrameRef.current = requestAnimationFrame(updateAnimation);
    }
  };
  useEffect(() => {
    if (audioFile && mouthShapeData) {
      handlePlay();
    }
  }, [audioFile, mouthShapeData]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-100 bg-[#ffffff23] border-2 border-transparent overflow-visible rounded-lg flex items-center justify-center shadow-lg">
        <img
          src="/face.png"
          alt="Face"
          className="w-full h-full object-cover absolute"
        />
        <img
          src={`/eye_shapes/${blink ? "closed" : "open"}.png`}
          className="absolute w-[65%] top-[32%]"
          alt="Eyes"
        />
        <img
          src={`/mouth_shapes/${isPlaying ? currentMouthShape : "X"}.png`}
          className="absolute w-[28%] bottom-[35%]"
          alt="Mouth"
        />
      </div>

      <audio
        ref={audioRef}
        src={audioFile}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
}
