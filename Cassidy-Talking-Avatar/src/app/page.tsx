"use client";
import React, { useState, useEffect } from "react";
import {
  Leaf,
  Heart,
  BookOpen,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import localFont from "next/font/local";
const ClashDisplay = localFont({
  src: "../fonts/ClashDisplay_Complete/Fonts/WEB/fonts/ClashDisplay-Variable.woff2",
});

const HeroSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [floatingElements, setFloatingElements] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([]);

  useEffect(() => {
    setIsVisible(true);

    // Generate floating elements for ambient animation
    const elements = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4,
    }));
    setFloatingElements(elements);
  }, []);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-800 via-teal-900 to-slate-900 relative overflow-hidden ${ClashDisplay.className}`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute w-2 h-2 bg-teal-300 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDelay: `${element.delay}s`,
              animationDuration: "3s",
            }}
          />
        ))}
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-teal-500 rounded-full opacity-10 blur-3xl animate-pulse animation-duration-[10s]" />
      <div
        className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-400 rounded-full opacity-10 blur-3xl animate-pulse animation-duration-[10s]"
        style={{ animationDelay: "5s" }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20">
        {/* Logo */}
        <div
          className={`absolute top-0 left-0 flex items-center justify-start md:justify-center  px-5 gap-2 mb-12 py-4 w-full transition-all duration-1000  ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          }`}
        >
          {/* <Leaf className="w-8 h-8 py-2 text-emerald-400 " /> */}
          <h1 className="text-2xl font-regular text-white text-center">
            🍀SoulScript
          </h1>
          <div className="absolute left-auto right-4 top-1/2 flex gap-3 items-center justify-center transform -translate-y-1/2 ">
            <Link href="/dashboard">
              <button className="group  px-6 py-2 bg-[#00FF8C] cursor-pointer rounded-full text-slate-800 font-semibold text-md overflow-hiddenhover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25">
                {/* <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}
                <span className="relative flex items-center gap-2">
                  Try Now <ExternalLink></ExternalLink>
                </span>
              </button>
            </Link>
            <Link href="mailto:ytbhemant@gmail.com" target="_blank">
              <button className="hidden md:flex group px-6 py-2 bg-[#e40050] cursor-pointer rounded-full text-white font-semibold text-md overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25">
                {/* <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}
                <span className="relative flex items-center gap-2">
                  Sponsor <Heart fill="white"></Heart>
                </span>
              </button>
            </Link>
          </div>
        </div>

        {/* Main Heading */}
        <div
          className={`w-full px-[10vw] mb-16 transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-[#B2DFC8] leading-tight mb-4 flex flex-col items-center justify-center w-full mt-10">
            <div className="w-full text-left">Mental Health Issues</div>
            <div className="text-[#B2DFC8] w-full text-right">
              {"Don't Always "}
              <span className="text-[#00FF8C]">Scream</span>
            </div>
          </h2>
        </div>

        {/* Central Illustration with Features */}
        <div
          className={`relative mb-16 transition-all duration-1000 delay-600 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          {/* <div className="relative w-96 h-96 md:w-[500px] md:h-[500px]">
            <div
              className="absolute inset-0 border-2 border-teal-400/20 rounded-full animate-spin"
              style={{ animationDuration: "20s" }}
            />
            <div
              className="absolute inset-12 border border-teal-300/15 rounded-full animate-spin"
              style={{
                animationDuration: "15s",
                animationDirection: "reverse",
              }}
            />

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[70%] w-[70%] overflow-hidden rounded-full">
              <img
                src="/girl_bg_removed.png"
                alt="meditating girl"
                className="relative z-10 -top-10 w-full h-full"
              />
              <div className="absolute h-[80%] w-[80%] rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br bg-[#B2DFC8] z-0"></div>
            </div>
          </div> */}
          <img
            src="/illustration.png"
            alt="Meditation illustration"
            className="hidden md:block mx-auto w-[80%] pointer-events-none select-none"
          />
        </div>

        {/* CTA Button */}
        <div
          className={`transition-all duration-1000 delay-900 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Link href="/dashboard">
            <button className="group relative px-12 py-4 bg-[#00FF8C] cursor-pointer rounded-full text-slate-800 font-semibold text-xl overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25">
              {/* <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}
              <span className="relative flex items-center gap-2">
                Try Now <ExternalLink></ExternalLink>
              </span>
            </button>
          </Link>
          <div className="text-sm text-white mt-2">🔴 Beta Release</div>
        </div>
      </div>

      {/* Bottom ambient glow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-32 bg-gradient-to-t from-emerald-500/10 to-transparent" />
      <div className="w-full pb-[10em] px-2 md:px-5 lg:px-10">
        <h1 className="mx-auto text-white text-3xl text-center mt-[7em] ">
          {` Transform your mental wellness journey with our AI-powered mental health solutions.`}
        </h1>
        <div className="flex flex-wrap flex-row items-center justify-center gap-4">
          <div className="text-white w-[300px] h-[300px] py-10 px-3 flex items-center justify-center flex-col rounded-lg border-white/20 border-2  mt-10">
            <img
              src="/confidential.gif"
              alt="confidential"
              className="h-[100px] w-[100px] mb-10"
            />
            <h1 className="text-2xl text-center font-semibold text-[#00FF8C]">
              Confidential
            </h1>
            <p className="text-center">
              All your data is completely encrypted for your privacy.
            </p>
          </div>
          <div className="text-white w-[300px] h-[300px] py-10 px-3 flex items-center justify-center flex-col rounded-lg border-white/20 border-2  mt-10">
            <img src="/ai.gif" alt="ai" className="h-[100px] w-[100px] mb-10" />
            <h1 className="text-2xl text-center font-semibold text-[#00FF8C]">
              Smart
            </h1>
            <p className="text-center">
              Powered by state of the art AI models, made just for you.
            </p>
          </div>
          <div className="text-white w-[300px] h-[300px] py-10 px-3 flex items-center justify-center flex-col rounded-lg border-white/20 border-2  mt-10">
            <img
              src="/doctor_2.gif"
              alt="doctor"
              className="h-[100px] w-[100px] mb-10"
            />
            <h1 className="text-2xl text-center font-semibold text-[#00FF8C]">
              Personalized
            </h1>
            <p className="text-center">
              Talk to your AI therapist, who knows you best.
            </p>
          </div>
        </div>
      </div>
      <div className="w-[90%] max-w-[1440px] min-h-[600px] bg-slate-900 mx-auto rounded-xl flex items-center justify-center flex-col relative mt-10 px-5 py-5 md:px-30">
        <h1 className="relative flex items-center justify-center text-white text-5xl text-center ">
          <div className="text-white h-50 w-50 absolute left-0 bottom-[100%] opacity-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 310">
              <path
                d="M79 144.11c-6 0-11.37.28-16.19.8 8.02-32.82 27.27-48.06 55.31-60.35L103.1 50.31C75.18 62.56 56.9 76.59 43.81 95.82c-15.2 22.35-22.6 51.72-22.6 89.81v16.46c0 31.83.11 57.6 57.79 57.6 57.79 0 57.79-25.87 57.79-57.79 0-31.91.37-57.79-57.79-57.79zm152 0c-6 0-11.37.28-16.19.8 8.02-32.82 27.27-48.06 55.31-60.35L255.1 50.31c-27.92 12.25-46.2 26.28-59.29 45.51-15.2 22.35-22.6 51.72-22.6 89.81v16.46c0 31.83.11 57.6 57.79 57.6 57.79 0 57.79-25.87 57.79-57.79 0-31.91.37-57.79-57.79-57.79z"
                fill="#FFF"
              ></path>
            </svg>
          </div>
          {
            "Soulscript is a well thought out, powerful tool for therapists and clients alike."
          }
        </h1>
        <p className="w-full flex flex-col text-white text-lg mt-4 text-right">
          <span className="text-xl text-[#00FF8C]">Nirmal Kr. Bera</span>
          <span>Consultant Neuro Psychiatrist</span>
          <span>Prof N.B Medical College and Hospital</span>
        </p>
      </div>
      <div className="relative w-full flex flex-wrap items-center justify-center text-center py-20 gap-5">
        <div
          className={`transition-all duration-1000 delay-90 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Link href="/dashboard">
            <button className="group relative px-12 py-4 bg-[#00FF8C] cursor-pointer rounded-full text-slate-800 font-semibold text-xl overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25">
              {/* <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}
              <span className="relative flex items-center gap-2">
                Try Now <ExternalLink></ExternalLink>
              </span>
            </button>
          </Link>
        </div>
        <Link href="mailto:ytbhemant@gmail.com" target="_blank">
          <button className="group relative px-12 py-4 bg-[#cf0048] cursor-pointer rounded-full text-white font-regular text-xl overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25">
            {/* <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}
            <span className="relative flex items-center gap-2">
              Sponsor <Heart fill="#ffffff"></Heart>
            </span>
          </button>
        </Link>
      </div>
      <div className="footer relative bg-teal-900/20 pt-10 flex items-center justify-center flex-col">
        <h1 className="text-2xl font-regular text-white text-center mb-5">
          🍀SoulScript
        </h1>
        <Link
          href="mailto:ytbhemant@gmail.com"
          target="_blank"
          className="text-blue-100/80 text-xl my-2 mb-10 text-center w-full"
        >
          Contact Us
        </Link>
        <div className="border-t-white/50 border-t-[1px] flex text center items-center justify-center text-white/50 text-sm w-full py-2 bottom-0">
          © 2025 SoulScript. All rights reserved.
        </div>
      </div>
    </div>
  );
};

const SoulScriptLanding: React.FC = () => {
  return (
    <>
      <HeroSection></HeroSection>
    </>
  );
};

export default SoulScriptLanding;
