"use client";

import React, { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { AlertTriangle, ChartBar, Users, UserCheck } from "lucide-react";

interface ChartDataItem {
    name: string;
    score?: number;
    severity?: number;
}

interface ExtractedData {
    selfPerception: ChartDataItem[];
    relationships: ChartDataItem[];
    symptoms: ChartDataItem[];
}

interface TherapyInsightsProps {
    gdata: ExtractedData | null;
}

const TherapyInsights: React.FC<TherapyInsightsProps> = ({ gdata }) => {
    const [data, setData] = useState<ExtractedData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        console.log("Received gdata:", gdata);
        
            setData(gdata);
            setLoading(false);
    }, [gdata]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 p-6 rounded-lg">
            <div className="animate-pulse w-16 h-16 bg-blue-200 rounded-full mb-4"></div>
            <p className="text-gray-600 font-medium">Loading insights...</p>
        </div>
    );

    if (error || !data) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-red-50 p-6 rounded-lg">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-red-600 font-semibold">Failed to load therapy insights</p>
            <p className="text-red-400 text-sm mt-2">Please try again later</p>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-linear-to-r from-blue-500 via-cyan-500 to-teal-500 p-6">
                    <h1 className="text-2xl font-bold text-white flex items-center">
                        <ChartBar className="mr-3 w-8 h-8" />
                        Therapy Progress Insights
                    </h1>
                </div>
                <div className="grid md:grid-cols-1 gap-6 p-6">
                    <GraphSection
                        title="Self-Perception"
                        dataKey="selfPerception"
                        data={data.selfPerception}
                        color="#82ca9d"
                        icon={<UserCheck className="w-6 h-6 text-green-500" />}
                    />
                    <GraphSection
                        title="Relationships & Support"
                        dataKey="relationships"
                        data={data.relationships}
                        color="#8884d8"
                        icon={<Users className="w-6 h-6 text-purple-500" />}
                    />
                    <GraphSection
                        title="Symptom Severity"
                        dataKey="symptoms"
                        data={data.symptoms}
                        color="#ff8042"
                        icon={<AlertTriangle className="w-6 h-6 text-orange-500" />}
                    />
                </div>
            </div>
        </div>
    );
};

const GraphSection: React.FC<{
    title: string;
    dataKey: string;
    data: ChartDataItem[];
    color: string;
    icon: React.ReactNode
}> = ({ title, data, color, icon }) => {
    const dataKey = data[0]?.score !== undefined ? "score" : "severity";

    return (
        <div className="bg-white border border-gray-100 rounded-lg shadow-md p-5">
            <div className="flex items-center mb-4">
                {icon}
                <h2 className="text-lg font-semibold ml-3 text-gray-800">{title}</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
                    <XAxis
                        dataKey="name"
                        axisLine={true}
                        tickLine={true}

                        className="text-sm text-gray-900"
                    />

                    <YAxis
                        domain={[0, 10]}
                        ticks={[0, 2, 4, 6, 8, 10]}
                        axisLine={{ stroke: '#000' }}
                        tickLine={false}
                        className="text-sm text-gray-500"
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                            backgroundColor: '#fff',
                            color: 'black',
                            borderRadius: '10px'
                        }}
                    />
                    <Bar
                        dataKey={dataKey}
                        fill={color}
                        barSize={100}
                        radius={[10, 10, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TherapyInsights;