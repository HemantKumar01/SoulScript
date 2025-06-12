"use client";
import React, { useState, useEffect } from "react";
import { signInWithGoogle, waitForAuthState } from "@/lib/firebase";

interface SignInFormData {
  email: string;
  password: string;
}

const SoulScriptSignIn: React.FC = () => {
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
  });
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (formData.email && formData.password) {
      setIsSigningIn(true);

      // Simulate sign-in process
      setTimeout(() => {
        alert("Sign-in functionality would be implemented here!");
        setIsSigningIn(false);
      }, 1500);
    }
  };

  const checkUserAndRedirect = async () => {
    let user = await waitForAuthState();
    if (user) {
      // User is signed in, redirect or perform any necessary actions
      console.log("User is signed in:", user);
      window.location.href = "/"; // Redirect to the main app page
      // You can redirect to the main app page or perform other actions here
    } else {
      // User is not signed in, stay on the sign-in page
      console.log("No user is signed in.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Google Sign-In implementation would go here
    // alert("Google Sign-In would be implemented here!");
    if (!loading) {
      await signInWithGoogle();
      checkUserAndRedirect();
    }
  };
  useEffect(() => {
    checkUserAndRedirect();
  }, []);
  const GoogleIcon: React.FC = () => (
    <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-green-800">
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }

        .bg-leaf {
          position: absolute;
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
          font-size: 40px;
        }

        .bg-leaf:nth-child(1) {
          top: 10%;
          left: 20%;
          animation-delay: 0s;
        }

        .bg-leaf:nth-child(2) {
          top: 70%;
          right: 15%;
          font-size: 35px;
          animation-delay: 2s;
        }

        .bg-leaf:nth-child(3) {
          bottom: 20%;
          left: 10%;
          font-size: 45px;
          animation-delay: 4s;
        }

        .logo {
          font-size: 2.5rem;
          font-weight: bold;
          background: linear-gradient(45deg, #365314, #4a7c59, #6b9b7f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }

        .logo::before {
          content: "🌿";
          position: absolute;
          left: -40px;
          top: 0;
          font-size: 1.8rem;
          animation: pulse 2s infinite;
        }

        .form-input {
          transition: all 0.3s ease;
        }

        .form-input:focus {
          transform: translateY(-2px);
          box-shadow: 0 0 10px rgba(107, 155, 127, 0.2);
        }

        .sign-in-btn {
          position: relative;
          overflow: hidden;
        }

        .sign-in-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s;
        }

        .sign-in-btn:hover::before {
          left: 100%;
        }

        .google-btn:hover {
          transform: translateY(-2px);
        }

        .form-group:focus-within {
          transform: translateX(5px);
        }
      `}</style>

      {/* Floating background elements */}
      <div className="bg-leaf">🍃</div>
      <div className="bg-leaf">🌱</div>
      <div className="bg-leaf">🌿</div>

      <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-10 w-full max-w-md shadow-2xl text-center relative border-2 border-green-200/30 mx-4">
        <div className="mb-8">
          <h1 className="logo mb-2">SoulScript</h1>
          <p className="text-green-700 text-sm italic mb-8">
            Your journey to inner peace begins here
          </p>
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="google-btn w-full py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-700 text-base cursor-pointer transition-all duration-300 flex items-center justify-center gap-3 mb-5 hover:border-green-400 hover:shadow-md"
        >
          <GoogleIcon />
          {loading ? "Loading..." : isSigningIn ? "..." : "Sign In with Google"}
        </button>
      </div>
    </div>
  );
};

export default SoulScriptSignIn;
