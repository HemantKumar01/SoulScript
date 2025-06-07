import { useState, useEffect } from "react";
import { useLiveAPIContext } from "@/contexts/LiveAPIContext";
const Cassidy = () => {
  const [eyeShape, setEyeShape] = useState("open.png");
  const [mouthShape, setMouthShape] = useState("X.png");

  const { connected, volume } = useLiveAPIContext();
  const setEyes = (shape: string) => {
    if (shape == "open.png") {
      setEyeShape("open.png");
      setTimeout(() => {
        setEyes("closed.png");
      }, 2500);
    } else {
      setEyeShape("closed.png");
      setTimeout(() => {
        setEyes("open.png");
      }, 300);
    }
  };
  const setMouth = (shape: string) => {
    setMouthShape(shape);
  };
  useEffect(() => {
    setEyes("open.png");
  }, []);
  const AUDIO_OUTPUT_DETECTION_THRESHOLD = 0.05;
  useEffect(() => {
    // console.log(volume);
    if (volume > AUDIO_OUTPUT_DETECTION_THRESHOLD) {
      setMouth("B.png");
    } else {
      setMouth("X.png");
    }
    // console.log("Cassidy volume", connected, volume);
  }, [connected, volume]);
  return (
    <div
      className="avatar relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] m-0 overflow-hidden h-[500px] w-[90%] max-w-[800px] rounded-[30px] text-center bg-[#2a2f313d] break-all bg-[url(/background/bg4_blurred.jpg)] bg-cover bg-center"
      style={{
        boxShadow: "0 0 10px rgba(255, 255, 255, 0.2)",
      }}
    >
      <div className="mt-[10px]  z-10 text-md bg-[#00000095] w-max text-white px-3 py-1 rounded-full m-auto">
        Cassidy 🟢
      </div>
      <div className="face-image w-[300px] absolute bottom-[0px] left-1/2 transform -translate-x-1/2 pb-0 z-10  select-none pointer-events-none">
        <img src="/face.png" alt="Cassidy" className="contain w-full h-auto" />
        <img
          src={"/eye_shapes/" + eyeShape}
          alt="eyes"
          className="contain absolute w-[47%] left-1/2 -translate-x-1/2 top-[34%] z-100"
        />
        <img
          src={"/mouth_shapes/" + mouthShape}
          alt="mouth"
          className="contain absolute w-[20%] left-1/2 -translate-x-1/2 bottom-[33%] z-100"
        />
      </div>

      {/* <div className="avatar-name">Cassidy</div> */}
    </div>
  );
};
export default Cassidy;
