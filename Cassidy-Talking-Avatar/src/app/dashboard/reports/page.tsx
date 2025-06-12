"use client";

import { useState } from "react";
import MindLogReportViewer from "./mindlog";
import ChatSummaryViewer from "./chat";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  MessageSquare,
  FileText,
  Sparkles,
  Star,
  Notebook,
} from "lucide-react";
import localFont from "next/font/local";
const ClashDisplay = localFont({
  src: "../../../fonts/ClashDisplay_Complete/Fonts/WEB/fonts/ClashDisplay-Variable.woff2",
});
const ReportPage = () => {
  const [selectedReport, setSelectedReport] = useState<
    "mindlog" | "chat" | null
  >(null);

  const reportTypes = [
    {
      id: "mindlog" as const,
      title: "MindLog Report",
      description:
        "Comprehensive analysis of your mental health journey and patterns",
      icon: Notebook,

      features: ["Pattern Analysis", "Mood Tracking", "Insights"],
    },
    {
      id: "chat" as const,
      title: "Chat Summary",
      description:
        "Detailed summary of your conversations with Cassidy and key insights",
      icon: MessageSquare,

      features: ["Key Topics", "Sentiment Analysis", "Highlights"],
    },
  ];

  return (
    <div
      className={`min-h-screen bg-slate-900 relative ${ClashDisplay.className}`}
    >
      <div
        className={`hidden md:block banner-text fixed z-[20] pointer-events-none w-[100vh] h-auto top-1/2 transform -translate-y-1/2 right-0 text-[100px] font-[900] text-[#ffffff] text-center opacity-5 origin-center -rotate-90 translate-x-[calc(50%-0.5em)] select-none ${ClashDisplay.className}`}
      >
        Insights Hub
      </div>
      <div className="container mx-auto px-2 md:px-32 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="flex items-center justify-center text-4xl md:text-5xl font-regular text-white mb-4">
            <img
              src="/report_animated.gif"
              alt="report"
              className="h-[1.5em] w-auto mr-0  md:mr-2"
            />
            Insights Hub
          </h1>

          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Generate <span className="text-[#47ff9d]">comprehensive</span>{" "}
            reports to track your progress and gain valuable insights with our
            <span className="text-[#47ff9d]"> advanced analytics</span>
          </p>
        </div>

        {/* Report Type Selection */}
        {!selectedReport && (
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {reportTypes.map((report) => {
              const IconComponent = report.icon;
              return (
                <Card
                  key={report.id}
                  className="cursor-pointer transition-all duration-300 hover:scale-105 border border-slate-700 bg-gradient-to-br from-slate-800/50 via-slate-800/50 to-green-900/20 hover:bg-gradient-to-br hover:from-slate-800 hover:to-green-900/30 shadow-lg shadow-green-500/10"
                  onClick={() => setSelectedReport(report.id)}
                >
                  <CardHeader className="text-center pb-6">
                    <div className="mb-6">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00ff77] to-[#00bfff] flex items-center justify-center mx-auto shadow-lg ">
                        <IconComponent className="h-10 w-10 text-white" />
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 mb-3">
                      <CardTitle className="text-2xl text-white font-bold">
                        {report.title}
                      </CardTitle>
                    </div>

                    <CardDescription className="text-slate-300 text-lg leading-relaxed mb-4">
                      {report.description}
                    </CardDescription>

                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {report.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <Button
                      className="w-full bg-gradient-to-r from-[#00ff77] to-[#00bfff]  text-slate-900 border-0 shadow-md hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 text-lg py-6"
                      size="lg"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Back Button */}
        {selectedReport && (
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => setSelectedReport(null)}
              className="mb-6 bg-gradient-to-r from-slate-800/50 to-green-900/20 border-slate-700 text-white hover:bg-gradient-to-r hover:from-slate-700 hover:to-green-900/30 backdrop-blur-sm"
            >
              ← Back to Report Selection
            </Button>
          </div>
        )}

        {/* Report Viewers */}
        <div className="transition-all duration-500">
          {selectedReport === "mindlog" && <MindLogReportViewer />}
          {selectedReport === "chat" && <ChatSummaryViewer />}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
