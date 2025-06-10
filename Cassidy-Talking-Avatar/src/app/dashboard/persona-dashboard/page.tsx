"use client"

import "../../App.scss";
import '../../globals.css'
import AuthRequired from "@/components/auth-required"
import React, { useEffect, useState } from "react";
import TherapyInsights from "./graphs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user"

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { languageOptions } from "@/components/languageOptions";
import { ChevronDown, Globe, Check, Search } from "lucide-react";

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
  const [selectedLanguage, setSelectedLanguage] = useState(
    languageOptions.find(lang => lang.language === "English") || languageOptions[0]
  ); // Default to English or first language
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter languages based on search term
  const filteredLanguages = languageOptions.filter(lang =>
    lang.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Popular languages to show at the top
  const popularLanguages = ["English", "Spanish", "French", "German", "Chinese", "Japanese", "Arabic", "Hindi"];
  
  // Separate popular and other languages
  const popularFiltered = filteredLanguages.filter(lang => 
    popularLanguages.includes(lang.language)
  );
  const otherFiltered = filteredLanguages.filter(lang => 
    !popularLanguages.includes(lang.language)
  );

  // Handle language selection
  const handleLanguageSelect = (option: typeof languageOptions[0]) => {
    setSelectedLanguage(option);
    setSearchTerm("");
    console.log(`Selected language: ${option.language} (${option.code})`);
    // TODO: Implement actual translation functionality here
    // This could trigger a translation of the report content
  };
  
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
              <p className="text-gray-700">We couldn&apos;t generate your report. Please try again later.</p>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  className="h-11 px-4 py-2 bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-lg flex items-center gap-3 min-w-[200px] justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors duration-200">
                      <Globe className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-gray-800 text-sm leading-tight">{selectedLanguage.language}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 leading-tight">{selectedLanguage.code.toUpperCase()}</span>
                        {selectedLanguage.language !== "English" && (
                          <span className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-0.5 rounded-full font-medium">
                            Translate
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-all duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-64 max-h-96 bg-white border border-gray-200 shadow-xl rounded-lg p-2 animate-in slide-in-from-top-2 duration-200"
                align="end"
                sideOffset={8}
              >
                {/* Search Input with Counter */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${languageOptions.length} languages...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-12 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    {searchTerm && filteredLanguages.length > 0 && (
                      <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                        {filteredLanguages.length}
                      </span>
                    )}
                    {searchTerm && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchTerm("");
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 rounded-full hover:bg-gray-100"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Language Options */}
                <div className="max-h-72 overflow-y-auto dropdown-scrollbar">
                  {filteredLanguages.length > 0 ? (
                    <>
                      {/* Popular Languages Section */}
                      {!searchTerm && popularFiltered.length > 0 && (
                        <>
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Popular Languages
                          </div>
                          {popularFiltered.map((option) => (
                            <DropdownMenuItem 
                              key={option.code} 
                              onSelect={() => handleLanguageSelect(option)}
                              className="px-3 py-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 cursor-pointer rounded-md transition-all duration-200 flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-xs font-bold text-blue-700 border border-blue-200 group-hover:from-blue-200 group-hover:to-indigo-300 transition-all duration-200">
                                  {option.code.toUpperCase().slice(0, 2)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors duration-200">{option.language}</span>
                                  <span className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors duration-200">Code: {option.code}</span>
                                </div>
                              </div>
                              {selectedLanguage.code === option.code && (
                                <div className="flex items-center justify-center w-5 h-5 bg-blue-100 rounded-full">
                                  <Check className="h-3 w-3 text-blue-600 font-bold" />
                                </div>
                              )}
                            </DropdownMenuItem>
                          ))}
                          
                          {/* Divider */}
                          {otherFiltered.length > 0 && (
                            <div className="my-2 border-t border-gray-200">
                              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                All Languages
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* All Languages or Search Results */}
                      {(searchTerm ? filteredLanguages : otherFiltered).map((option) => (
                        <DropdownMenuItem 
                          key={option.code} 
                          onSelect={() => handleLanguageSelect(option)}
                          className="px-3 py-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 cursor-pointer rounded-md transition-all duration-200 flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-indigo-200 flex items-center justify-center text-xs font-bold text-gray-600 group-hover:text-blue-700 border border-gray-200 group-hover:border-blue-200 transition-all duration-200">
                              {option.code.toUpperCase().slice(0, 2)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors duration-200">{option.language}</span>
                              <span className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors duration-200">Code: {option.code}</span>
                            </div>
                          </div>
                          {selectedLanguage.code === option.code && (
                            <div className="flex items-center justify-center w-5 h-5 bg-blue-100 rounded-full">
                              <Check className="h-3 w-3 text-blue-600 font-bold" />
                            </div>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </>
                  ) : (
                    <div className="px-3 py-8 text-center text-gray-500">
                      <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm font-medium text-gray-600">No languages found</p>
                      <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* <Button 
              onClick={() => router.push("/")} 
              className="bg-[#6ac5fe] hover:bg-primary/90 text-white px-6 py-2 rounded-full shadow-md transition-all duration-300 flex items-center gap-2"
            >
              <span>Chat</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </Button> */}
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