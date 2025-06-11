"use client"

import "../../App.scss";
import '../../globals.css'
import AuthRequired from "@/components/auth-required"
import React, { useEffect, useState } from "react";
import TherapyInsights from "./graphs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user"

import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { languageOptions } from "@/components/languageOptions";
import { ChevronDown, Globe, Check, Search, Mail } from "lucide-react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
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
  // Add a new state for error message
const [errorMessage, setErrorMessage] = useState("");
  const [originalData, setOriginalData] = useState<DataStructure | null>(null); // Store original data
  const [translatedData, setTranslatedData] = useState<DataStructure | null>(null); // Store translated data
  const [translationCache, setTranslationCache] = useState<{ [key: string]: DataStructure }>(() => {
    // Load cache from localStorage on initialization
    if (typeof window !== 'undefined') {
      const savedCache = localStorage.getItem('translationCache');
      return savedCache ? JSON.parse(savedCache) : {};
    }
    return {};
  }); // Cache translations
  const [titleCache, setTitleCache] = useState<{ [key: string]: string }>(() => {
    // Load title cache from localStorage on initialization
    if (typeof window !== 'undefined') {
      const savedTitleCache = localStorage.getItem('titleCache');
      return savedTitleCache ? JSON.parse(savedTitleCache) : { 'en': 'Know About Me' };
    }
    return { 'en': 'Know About Me' };
  }); // Cache titles
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [translating, setTranslating] = useState(false); // Translation loading state
  const [pageTitle, setPageTitle] = useState("Know About Me"); // Title translation state
  const [selectedLanguage, setSelectedLanguage] = useState(
    languageOptions.find(lang => lang.language === "English") || languageOptions[0]
  ); // Default to English or first language
  const [searchTerm, setSearchTerm] = useState("");

  // Email functionality states
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

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

  // Clear translation cache
  const clearTranslationCache = () => {
    setTranslationCache({});
    setTitleCache({ 'en': 'Know About Me' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('translationCache');
      localStorage.removeItem('titleCache');
    }
    console.log('Translation cache cleared');
  };

  // Add cache statistics for debugging
  const getCacheStats = () => {
    const cacheSize = Object.keys(translationCache).length;
    const titleCacheSize = Object.keys(titleCache).length;
    const cachedLanguages = Object.keys(translationCache);
    return { cacheSize, titleCacheSize, cachedLanguages };
  };

  // Email sending function
  const sendReportEmail = async () => {
    setSendingEmail(true);
    try {
      // Get authId (reusing the logic from useEffect)
      const q = query(collection(db, "users"), where("email", "==", user?.email));
      const snapshot = await getDocs(q);
      let authId = "";
      if (!snapshot.empty) {
        authId = snapshot.docs[0].id;
      } else {
        throw new Error("User document not found");
      }

      const response = await fetch("api/getMailReport", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email,
          authId: authId,
        }),
      });

      if (response.ok) {
        setEmailSent(true);
        setNotification({
          show: true,
          message: 'Report sent successfully to your email!',
          type: 'success'
        });
        // Hide notification after 5 seconds
        setTimeout(() => {
          setNotification({ show: false, message: '', type: '' });
        }, 5000);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setNotification({
        show: true,
        message: 'Failed to send email. Please try again.',
        type: 'error'
      });
      // Hide notification after 5 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 5000);
    } finally {
      setSendingEmail(false);
    }
  };

  // Handle language selection
  const handleLanguageSelect = async (option: typeof languageOptions[0]) => {
    setSelectedLanguage(option);
    setSearchTerm("");
    setEmailSent(false); // Reset email state when language changes
    console.log(`Selected language: ${option.language} (${option.code})`);

    // If English is selected, show original data
    if (option.language === "English") {
      setData(originalData);
      setPageTitle("Persona Dashboard");
      return;
    }

    // Check if we have cached translations for this language
    if (translationCache[option.code] && titleCache[option.code]) {
      console.log(`Using cached translation for ${option.language}`);
      setData(translationCache[option.code]);
      setPageTitle(titleCache[option.code]);
      return;
    }

    // Translate the page title and data if not cached
    console.log(`Translating to ${option.language} for the first time`);

    // Translate the page title
    await translatePageTitle(option.code);

    // Translate data
    await translateData(option.code);
  };

  // Translate page title
  const translatePageTitle = async (targetLanguage: string) => {
    try {
      const response = await fetch('/dashboard/api/translation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: "Know About Me",
          targetLanguage: targetLanguage,
          sourceLanguage: 'en'
        })
      });

      if (response.ok) {
        const result = await response.json();
        const translatedTitle = result.translatedText;
        setPageTitle(translatedTitle);
        setTitleCache(prev => {
          const newCache = { ...prev, [targetLanguage]: translatedTitle };
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('titleCache', JSON.stringify(newCache));
          }
          return newCache;
        });
      }
    } catch (error) {
      console.error('Title translation error:', error);
    }
  };

  // Translation function with batching for better performance
  const translateData = async (targetLanguage: string) => {
    if (!originalData) return;

    setTranslating(true);
    try {
      const translatedStructure: DataStructure = { ...originalData };

      // Collect all text that needs translation
      const textsToTranslate: string[] = [];
      const textMapping: { [key: string]: { sectionKey: string; itemIndex: number; field: string } } = {};

      // Collect all texts for translation
      for (const [sectionKey, sectionData] of Object.entries(originalData)) {
        if (Array.isArray(sectionData)) {
          sectionData.forEach((item: DataItem | ChartDataItem, itemIndex: number) => {
            if (item.label) {
              const key = `${sectionKey}_${itemIndex}_label`;
              textsToTranslate.push(item.label);
              textMapping[item.label] = { sectionKey, itemIndex, field: 'label' };
            }

            if ('value' in item && item.value) {
              const key = `${sectionKey}_${itemIndex}_value`;
              textsToTranslate.push(item.value);
              textMapping[item.value] = { sectionKey, itemIndex, field: 'value' };
            }

            if ('score' in item && item.score) {
              const key = `${sectionKey}_${itemIndex}_score`;
              textsToTranslate.push(item.score);
              textMapping[item.score] = { sectionKey, itemIndex, field: 'score' };
            }

            if ('effectiveness' in item && item.effectiveness) {
              const key = `${sectionKey}_${itemIndex}_effectiveness`;
              textsToTranslate.push(item.effectiveness);
              textMapping[item.effectiveness] = { sectionKey, itemIndex, field: 'effectiveness' };
            }
          });
        }
      }

      // Translate in smaller batches to avoid overwhelming the API
      const batchSize = 10;
      const translations: { [key: string]: string } = {};

      for (let i = 0; i < textsToTranslate.length; i += batchSize) {
        const batch = textsToTranslate.slice(i, i + batchSize);

        // Translate each item in the batch
        const batchPromises = batch.map(async (text) => {
          try {
            const response = await fetch('/dashboard/api/translation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: text,
                targetLanguage: targetLanguage,
                sourceLanguage: 'en'
              })
            });

            if (response.ok) {
              const result = await response.json();
              return { original: text, translated: result.translatedText };
            }
            return { original: text, translated: text }; // Fallback to original
          } catch (error) {
            console.error('Translation error for text:', text, error);
            return { original: text, translated: text }; // Fallback to original
          }
        });

        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(({ original, translated }) => {
          translations[original] = translated;
        });

        // Small delay between batches to be respectful to the API
        if (i + batchSize < textsToTranslate.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Apply translations to the data structure
      for (const [sectionKey, sectionData] of Object.entries(originalData)) {
        if (Array.isArray(sectionData)) {
          const translatedSection = sectionData.map((item: DataItem | ChartDataItem) => {
            const translatedItem = { ...item };

            if (item.label && translations[item.label]) {
              translatedItem.label = translations[item.label];
            }

            if ('value' in item && item.value && translations[item.value]) {
              (translatedItem as DataItem).value = translations[item.value];
            }

            if ('score' in item && item.score && translations[item.score]) {
              (translatedItem as ChartDataItem).score = translations[item.score];
            }

            if ('effectiveness' in item && item.effectiveness && translations[item.effectiveness]) {
              (translatedItem as ChartDataItem).effectiveness = translations[item.effectiveness];
            }

            return translatedItem;
          });

          translatedStructure[sectionKey as keyof DataStructure] = translatedSection as any;
        }
      }

      setTranslatedData(translatedStructure);
      setData(translatedStructure);

      // Cache the translated data for future use
      setTranslationCache(prev => {
        const newCache = { ...prev, [targetLanguage]: translatedStructure };
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('translationCache', JSON.stringify(newCache));
        }
        return newCache;
      });
      console.log(`Cached translation for language: ${targetLanguage}`);
    } catch (error) {
      console.error('Translation error:', error);
      // Show error message to user
      setNotification({
        show: true,
        message: 'Translation failed. Please try again.',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 5000);
    } finally {
      setTranslating(false);
    }
  };

  // Move useCurrentUser hook to the top level
  const { user, loading: userLoading } = useCurrentUser();

useEffect(() => {
  // Don't proceed if user is still loading or user doesn't exist
  if (userLoading || !user) return;

  setLoading(true);
  setError(false); // Reset error state
  setErrorMessage(""); // Reset error message

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
        throw new Error("USER_NOT_FOUND");
      }

      console.log("Auth ID:", authId);

      // Check if user document exists and has required fields
      const userDocRef = doc(db, "users", authId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        throw new Error("USER_DOC_MISSING");
      }

      // Check if userHistory field exists in the user document
      const userData = userDocSnap.data();
      if (!userData.userHistory) {
        throw new Error("USER_HISTORY_MISSING");
      }

      // Check if journalEntries collection exists and has documents
      const journalEntriesRef = collection(db, "users", authId, "journalEntries");
      const journalSnapshot = await getDocs(journalEntriesRef);
      
      if (journalSnapshot.empty) {
        throw new Error("JOURNAL_ENTRIES_MISSING");
      }

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
        throw new Error(`API_ERROR_${response.status}`);
      }

      const responseData = await response.json();
      console.log("API Response:", responseData);

      // Update state with the response data
      setOriginalData(responseData.info); // Store original data
      setData(responseData.info);
      setGraphData(responseData.graph);
      setLoading(false);
    } catch (error) {
      console.error("Error in data fetching process:", error);
      
      // Set specific error messages based on error type
      let message = "We couldn't generate your report. Please try again later.";
      
      if (typeof error === "object" && error !== null && "message" in error && typeof (error as any).message === "string") {
        const errorMessage = (error as any).message as string;
        switch (errorMessage) {
          case "USER_NOT_FOUND":
            message = "Your user account was not found. Please contact support.";
            break;
          case "USER_DOC_MISSING":
            message = "Your user profile is incomplete. Please contact support.";
            break;
          case "USER_HISTORY_MISSING":
            message = "Your Chat history is missing. Try starting a conversation with Cassidy to begin.";
            break;
          case "JOURNAL_ENTRIES_MISSING":
            message = "No journal entries found. Please add some journal entries first.";
            break;
          case "API_ERROR_404":
            message = "Report service not found. Please contact support.";
            break;
          case "API_ERROR_500":
            message = "Server error occurred. Please try again later.";
            break;
          default:
            if (errorMessage.startsWith("API_ERROR_")) {
              message = "API service is currently unavailable. Please try again later.";
            }
            break;
        }
      }
      
      setErrorMessage(message);
      setError(true);
      setLoading(false);
    }
  };

  // Execute the data fetching
  fetchData();
}, [user, userLoading]);

  const backgroundStyle = "bg-[linear-gradient(60deg,_rgb(247,_149,_51),_rgb(243,_112,_85),_rgb(239,_78,_123),_rgb(161,_102,_171),_rgb(80,_115,_184),_rgb(16,_152,_173),_rgb(7,_179,_155),_rgb(111,_186,_130))] min-h-screen py-12 text-black";
if (loading || userLoading) {
  return (
    <AuthRequired>
      <div className={backgroundStyle}>
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="bg-white shadow-lg rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Generating Report</h2>
            <div className="flex justify-center">
              {/* Lottie loader */}
              <DotLottieReact
                src="https://lottie.host/00918141-1a56-47ba-8ba8-5c5902aba48b/2jp7AfTff5.lottie"
                loop
                autoplay
                style={{ height: '120px' }}
              />
            </div>
            <p className="mt-4 text-gray-600">
              This may take 1–2 minutes as we analyze your information...
            </p>
          </div>
        </div>
      </div>
    </AuthRequired>
  );
}

// Updated error display component
if (error || !data) {
  return (
    <AuthRequired>
      <div className={backgroundStyle}>
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="bg-white shadow-lg rounded-xl p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h2>
            <p className="text-gray-700 mb-6">
              {errorMessage || "We couldn't generate your report. Please try again later."}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
              >
                Try Again
              </button>
              {errorMessage.includes("journal entries") && (
                <button
                  onClick={() => window.location.href = '/dashboard/mindlog'}
                  className="w-full px-4 py-2 bg-emerald-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Add Journal Entries
                </button>
              )}
              {errorMessage.includes("history") && (
                <button
                  onClick={() =>  window.location.href = '/dashboard'}
                  className="w-full px-4 py-2 bg-emerald-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Talk With Cassidy
                </button>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>If this problem persists, please contact support.</p>
            </div>
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
          {/* Notification Toast */}
          {notification.show && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${notification.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
              }`}>
              <div className="flex items-center gap-2">
                {notification.type === 'success' ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
                <span className="font-medium">{notification.message}</span>
                <button
                  onClick={() => setNotification({ show: false, message: '', type: '' })}
                  className="ml-2 text-white hover:text-gray-200 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Translation loading overlay */}
          {translating && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-xl p-8 text-center shadow-2xl">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Translating Content</h3>
                <p className="text-gray-600">Translating to {selectedLanguage.language}...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center bg-white shadow-lg rounded-xl mb-8 p-6">
            <h1 className="text-4xl font-extrabold text-gray-800">{pageTitle}</h1>

            <div className="flex items-center gap-4">
              {/* Email Button */}
              <Button
                onClick={sendReportEmail}
                disabled={sendingEmail || emailSent}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 font-semibold ${emailSent
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  } disabled:transform-none disabled:shadow-lg`}
              >
                {sendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending Email...
                  </>
                ) : emailSent ? (
                  <>
                    <Check className="h-4 w-4" />
                    Email Sent
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Email Report
                  </>
                )}
              </Button>

              {/* Language Dropdown */}
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
                              {translating ? "Translating..." :
                                (translationCache[selectedLanguage.code] ? "Cached" : "Translate")}
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
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors duration-200">Code: {option.code}</span>
                                      {translationCache[option.code] && (
                                        <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded-full font-medium">
                                          Cached
                                        </span>
                                      )}
                                    </div>
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
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors duration-200">Code: {option.code}</span>
                                  {translationCache[option.code] && (
                                    <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded-full font-medium">
                                      Cached
                                    </span>
                                  )}
                                </div>
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
            </div>

            {/* Debug Cache Info - Only in development */}
            {/* {process.env.NODE_ENV === 'development' && (
              <div className="hidden lg:block text-xs text-gray-500 bg-gray-100 rounded px-2 py-1">
                Cache: {Object.keys(translationCache).length} languages
                {Object.keys(translationCache).length > 0 && (
                  <span className="ml-1">({Object.keys(translationCache).join(', ')})</span>
                )}
              </div>
            )} */}
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