import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Adjust path as needed
import { questions } from "@/components/avatar/questions_flat.js";
import { getCurrentUser, waitForAuthState } from "@/lib/firebase";

interface ProgressProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({
  size = 80,
  strokeWidth = 8,
  className = "",
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserName(user.displayName || "Friend");
      setUserId(user.uid);
    } else {
      waitForAuthState().then((user) => {
        if (user) {
          setUserName(user.displayName || "Friend");
          setUserId(user.uid);
        } else {
          console.error("User is not authenticated");
          window.location.href = "/login"; // Redirect to login if not authenticated
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const userDocRef = doc(db, "users", userId);

    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const userProgress = data.progress || 0;
          setProgress(userProgress);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to progress updates:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const totalQuestions = questions.length;
  const progressPercentage = Math.min((progress / totalQuestions) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`relative ${className} flex justify-center items-center`}
      style={{ width: size + 100, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-blue-500 transition-all duration-300 ease-in-out"
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold text-gray-300">
          {Math.round(progressPercentage)}%
        </span>
      </div>
      {/* Progress text */}
      <div className="absolute -bottom-8 left-0 right-0 text-center">
        <span className="text-sm text-gray-100">Conversation Quality</span>
      </div>
    </div>
  );
};

export default Progress;
