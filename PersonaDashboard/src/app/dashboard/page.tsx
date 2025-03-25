"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

// Define TypeScript interfaces for better type safety
interface DataItem {
  label: string;
  value: string;
}

interface ChartDataItem {
  name: string;
  score?: number;
  effectiveness?: number;
}

interface DataStructure {
  demographics: DataItem[];
  familyEmployment: DataItem[];
  therapyReasons: DataItem[];
  mentalHealthHistory: DataItem[];
  selfPerceptionData: ChartDataItem[];
  copingStrategies: ChartDataItem[];
  therapyRecommendations: { label: string; description: string }[];
}

const KnowAboutMe: React.FC = () => {
  const [data, setData] = useState<DataStructure | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data.json") // Fetching JSON from the `public` folder
      .then((res) => res.json())
      .then((jsonData) => {
        // Transform the data to match our component structure
        const transformedData: DataStructure = {
          demographics: Object.entries(jsonData["EXTRACTED INFORMATION"].Demographics).map(([label, value]) => ({ 
            label, 
            value: value as string 
          })),
          familyEmployment: Object.entries(jsonData["EXTRACTED INFORMATION"]["Family & Employment"]).map(([label, value]) => ({ 
            label, 
            value: value as string 
          })),
          therapyReasons: Object.entries(jsonData["EXTRACTED INFORMATION"]["Reasons for Seeking Therapy"]).map(([label, value]) => ({ 
            label, 
            value: value as string 
          })),
          mentalHealthHistory: Object.entries(jsonData["EXTRACTED INFORMATION"]["Mental Health History"]).map(([label, value]) => ({ 
            label, 
            value: value as string 
          })),
          selfPerceptionData: [
            { name: "Self-Esteem", score: parseInt(jsonData["EXTRACTED INFORMATION"]["Self-Perception"]["Self-Esteem"].split('/')[0]) },
            { name: "Family Closeness", score: parseInt(jsonData["EXTRACTED INFORMATION"]["Relationships and Social Support"]["Family Closeness"].split('/')[0]) },
            { name: "Friend Closeness", score: parseInt(jsonData["EXTRACTED INFORMATION"]["Relationships and Social Support"]["Friend Closeness"].split('/')[0]) },
            { name: "Personal Support", score: parseInt(jsonData["EXTRACTED INFORMATION"]["Relationships and Social Support"]["Personal Life Support"].split('/')[0]) },
            { name: "Work Support", score: parseInt(jsonData["EXTRACTED INFORMATION"]["Relationships and Social Support"]["Professional Life Support"].split('/')[0]) }
          ],
          copingStrategies: [], // Not used in current UI
          // Transform recommendations to the expected format
          therapyRecommendations: Object.entries(jsonData["RECOMMENDATIONS"])
            .filter(([key]) => key !== "Counseling") // Excluding the "Counseling" entry as it has a different structure
            .map(([label, details]) => ({
              label,
              description: (details as any).Rationale
            }))
        };
        
        // Add Counseling if it exists
        if (jsonData["RECOMMENDATIONS"]["Counseling"]) {
          transformedData.therapyRecommendations.push({
            label: jsonData["RECOMMENDATIONS"]["Counseling"].Type || "Counseling",
            description: jsonData["RECOMMENDATIONS"]["Counseling"].Rationale
          });
        }
        
        setData(transformedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center text-gray-800">Loading...</p>;
  if (!data) return <p className="text-center text-red-600">Failed to load data.</p>;

  return (
    <div className=" bg-[linear-gradient(60deg,_rgb(247,_149,_51),_rgb(243,_112,_85),_rgb(239,_78,_123),_rgb(161,_102,_171),_rgb(80,_115,_184),_rgb(16,_152,_173),_rgb(7,_179,_155),_rgb(111,_186,_130))]   text-black min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl mb-8 p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-extrabold text-gray-800">
              Know Yourself Better
            </h1>
            <Link href="/">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Dashboard
              </button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Section title="Personal Overview" data={data.demographics} />
            <Section title="Family & Employment" data={data.familyEmployment} />
          </div>
          <div className="space-y-6">
            <Section title="Reasons for Seeking Therapy" data={data.therapyReasons} />
            <Section title="Mental Health History" data={data.mentalHealthHistory} />
          </div>
        </div>

        <div className="mt-8">
          <ChartCard title="Self-Perception & Support">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.selfPerceptionData}>
                <XAxis dataKey="name" className="text-sm" />
                <YAxis domain={[0, 10]} className="text-sm" />
                <Tooltip />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* <ChartCard title="Effectiveness of Coping Strategies">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.copingStrategies}>
                <XAxis dataKey="name" className="text-sm" />
                <YAxis domain={[0, 10]} className="text-sm" />
                <Tooltip />
                <Bar dataKey="effectiveness" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard> */}
        </div>

        <div className="mt-8 bg-white  shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recommended Therapy Plan</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {data.therapyRecommendations.map((item, index) => (
              <div key={index} className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">{item.label}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
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

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white shadow-md rounded-xl p-6">
    <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
    {children}
  </div>
);

export default KnowAboutMe;
  