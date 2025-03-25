"use client";
import { useState, useRef, useEffect } from "react";

export default function LipSyncApp() {
  const [mouthShapeData, setMouthShapeData] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [currentMouthShape, setCurrentMouthShape] = useState("X");
  const [isPlaying, setIsPlaying] = useState(false);
  const [parsedShapes, setParsedShapes] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [blink, setBlink] = useState(false);
  const blinkingRate = 3000;

  const audioRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Parse the input TSV data
  const parseShapeData = (tsvData) => {
    if (!tsvData) return [];

    return tsvData
      .trim()
      .split("\n")
      .map((line) => {
        const [time, shape] = line.split("\t");
        return {
          time: parseFloat(time),
          shape: shape.trim(),
        };
      })
      .sort((a, b) => a.time - b.time);
  };

  // Handle mouth shape data input change
  const handleDataChange = (e) => {
    setMouthShapeData(e.target.value);
    const parsed = parseShapeData(e.target.value);
    setParsedShapes(parsed);
    if (parsed.length > 0) {
      setCurrentMouthShape(parsed[0].shape);
    }
  };

  // Handle audio file upload
  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(URL.createObjectURL(file));
    }
  };

  // Play/pause functionality
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Reset everything
  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    if (parsedShapes.length > 0) {
      setCurrentMouthShape(parsedShapes[0].shape);
    } else {
      setCurrentMouthShape("X");
    }
    setCurrentTime(0);
  };

  // Update the current time and mouth shape during playback
  const updateAnimation = () => {
    if (audioRef.current && isPlaying) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);

      // Find the appropriate mouth shape for the current time
      const currentShape = parsedShapes.reduce((prev, curr) => {
        if (curr.time <= time) {
          return curr;
        }
        return prev;
      }, parsedShapes[0]);

      if (currentShape) {
        setCurrentMouthShape(currentShape.shape);
      }

      animationFrameRef.current = requestAnimationFrame(updateAnimation);
    }
  };
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (isPlaying) return;
      setBlink(true);
      setTimeout(() => {
        setBlink(false);
      }, blinkingRate * 0.1);
    }, blinkingRate);

    return () => clearInterval(blinkInterval);
  }, [isPlaying]);

  // Start/stop animation based on playback
  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateAnimation);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, parsedShapes]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;

    const handleAudioEnd = () => {
      setIsPlaying(false);
      handleReset();
    };

    if (audio) {
      audio.addEventListener("ended", handleAudioEnd);

      return () => {
        audio.removeEventListener("ended", handleAudioEnd);
      };
    }
  }, []);

  // Component for mouth shape visualization
  const Face = ({ shape }) => {
    return (
      <div className="relative w-64 h-64 bg-orange-200 border-2 border-gray-300 rounded-lg flex items-center justify-center shadow-lg">
        <img
          src="/face.png"
          alt=""
          className="w-full h-full object-cover absolute"
        />
        <div className="absolute z-100 w-[45%] h-auto aspect-auto top-19">
          {renderEyeShape(shape)}
        </div>
        <div className="absolute z-100 w-[24%] h-auto aspect-auto bottom-19">
          {renderMouthShape(shape)}
        </div>
      </div>
    );
  };

  // Render different mouth shapes
  const renderMouthShape = (shape) => {
    return (
      <img
        src={"/mouth_shapes/" + shape + ".png"}
        className="w-full h-full aspect-auto"
      ></img>
    );
  };
  const renderEyeShape = (shape) => {
    return (
      <img
        src={"/eye_shapes/" + (blink ? "closed" : shape) + ".png"}
        className="w-full h-full aspect-auto"
      ></img>
    );
  };

  return (
    <div className="flex flex-col items-center p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Lip Sync Animation</h1>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold mb-2">Input Data</h2>
          <textarea
            className="w-full h-64 p-3 border border-gray-300 rounded-lg mb-4"
            placeholder="Enter tab-separated mouth shape data (time shape)
Example:
0.00  X
0.13  D
0.40  B
..."
            value={mouthShapeData}
            onChange={handleDataChange}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Upload Audio File
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={togglePlayback}
              disabled={!audioFile || parsedShapes.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>

            <button
              onClick={handleReset}
              disabled={!audioFile}
              className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:bg-gray-400"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">Animation Preview</h2>
          <Face shape={currentMouthShape} />
          <div className="mt-4 text-center">
            <p className="text-lg font-medium">
              Current Shape: {currentMouthShape}
            </p>
            <p className="text-md">Time: {currentTime.toFixed(2)}s</p>
          </div>
        </div>
      </div>

      <div className="w-full mb-6">
        <h2 className="text-xl font-semibold mb-2">Audio Player</h2>
        <audio
          ref={audioRef}
          src={audioFile}
          controls
          className="w-full"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>

      <div className="w-full">
        <h2 className="text-xl font-semibold mb-4">All Mouth Shapes</h2>
        <div className="grid grid-cols-3 gap-4">
          {["A", "B", "C", "D", "E", "F", "G", "H", "X"].map((shape) => (
            <div key={shape} className="flex flex-col items-center">
              <div className="w-24 h-24 border border-gray-300 rounded-lg flex items-center justify-center">
                {renderMouthShape(shape)}
              </div>
              <p className="mt-2 font-medium">{shape}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
