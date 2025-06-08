"use client"

import AuthRequired from "@/components/auth-required"
import React, { useEffect, useState } from "react";
import TherapyInsights from "./graphs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user"

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface DataItem {
  label: string;
  value: string;
}

interface ChartDataItem {
  label: string;
  score?: string;
  effectiveness?: string;
}

interface DataStructure {
  demographics: DataItem[];
  familyEmployment: DataItem[];
  therapyReasons: DataItem[];
  mentalHealthHistory: DataItem[];
  traumaAndAdverseExperiences: DataItem[];
  substanceUse: DataItem[];
  healthAndLifestyle: DataItem[];
  relationshipsAndSocialSupport: DataItem[];
  selfPerceptionData: ChartDataItem[];
  copingStrategies: ChartDataItem[];
  medicalAndMedicationHistory: DataItem[];
  behavioralPatterns: DataItem[];
  riskAssessment: DataItem[];
  psychologicalFormulation: DataItem[];
  strengthsAndResources: DataItem[];
  therapyRecommendations: DataItem[];
}

const KnowAboutMe: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<DataStructure | null>(null);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Move useCurrentUser hook to the top level
  const { user, loading: userLoading } = useCurrentUser();

  useEffect(() => {
    // Don't proceed if user is still loading or user doesn't exist
    if (userLoading || !user) return;
    
    setLoading(true);
    
    // Main async function to handle API request
    const fetchData = async () => {
      try {
        // Query Firestore for user document
        const q = query(collection(db, "users"), where("email", "==", user.email));
        const snapshot = await getDocs(q);
        
        // Get the document ID (authId)
        let authId = "";
        if (!snapshot.empty) {
          authId = snapshot.docs[0].id;
        } else {
          throw new Error("User document not found");
        }

        console.log("Auth ID:", authId);
        
        // Make the API request
        const response = await fetch("api/getReport", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "authId": authId,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log("API Response:", responseData);
        
        // Update state with the response data
        setData(responseData.info);
        setGraphData(responseData.graph);
        setLoading(false);
      } catch (error) {
        console.error("Error in data fetching process:", error);
        setError(true);
        setLoading(false);
      }
    };
    
    // Execute the data fetching
    fetchData();
  }, [user, userLoading]); // Add dependencies

  // This is the colorful background style
  const backgroundStyle = "bg-[linear-gradient(60deg,_rgb(247,_149,_51),_rgb(243,_112,_85),_rgb(239,_78,_123),_rgb(161,_102,_171),_rgb(80,_115,_184),_rgb(16,_152,_173),_rgb(7,_179,_155),_rgb(111,_186,_130))] min-h-screen py-12 text-black";

  if (loading || userLoading) {
    return (
      <AuthRequired>
        <div className={backgroundStyle}>
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="bg-white shadow-lg rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Generating Report</h2>
              <div className="flex justify-center">
                {/* Loading spinner */}
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <p className="mt-4 text-gray-600">This may take a moment as we analyze your information...</p>
            </div>
          </div>
        </div>
      </AuthRequired>
    );
  }

  if (error || !data) {
    return (
      <AuthRequired>
        <div className={backgroundStyle}>
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="bg-white shadow-lg rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h2>
              <p className="text-gray-700">We couldn't generate your report. Please try again later.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </AuthRequired>
    );
  }

  return (
    <AuthRequired>
      <div className={backgroundStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center bg-white shadow-lg rounded-xl mb-8 p-6">
            <h1 className="text-4xl font-extrabold text-gray-800">Know About Me</h1>
            <Button 
              onClick={() => router.push("/")} 
              className="bg-[#6ac5fe] hover:bg-primary/90 text-white px-6 py-2 rounded-full shadow-md transition-all duration-300 flex items-center gap-2"
            >
              <span>Chat</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(data).map(([sectionTitle, sectionData]) =>
              Array.isArray(sectionData) ? (
                <Section key={sectionTitle} title={formatTitle(sectionTitle)} data={sectionData} />
              ) : null
            )}
          </div>
          {graphData && <TherapyInsights gdata={graphData} />}
        </div>
      </div>
    </AuthRequired>
  );
};

const Section: React.FC<{ title: string; data: DataItem[] }> = ({ title, data }) => (
  <div className="bg-white shadow-md rounded-xl p-6">
    <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
    {data.map((item, index) => (
      <div key={index} className="mb-2 border-b pb-2 last:border-none">
        <strong className="text-blue-800">{item.label}:</strong> {item.value}
      </div>
    ))}
  </div>
);

const formatTitle = (key: string) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

export default function PersonaDashboardPage() {
  return (
    <KnowAboutMe />
  );
}