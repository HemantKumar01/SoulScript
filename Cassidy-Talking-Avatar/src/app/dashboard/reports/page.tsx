"use client"

import { useState } from "react"
import MindLogReportViewer from "./mindlog"
import ChatSummaryViewer from "./chat"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, MessageSquare, FileText, Sparkles, Star } from "lucide-react"

const ReportPage = () => {
  const [selectedReport, setSelectedReport] = useState<"mindlog" | "chat" | null>(null)

  const reportTypes = [
    {
      id: "mindlog" as const,
      title: "MindLog Report",
      description: "Comprehensive analysis of your mental health journey and patterns",
      icon: Brain,
     
      features: ["Pattern Analysis", "Mood Tracking", "Insights"],
    },
    {
      id: "chat" as const,
      title: "Chat Summary",
      description: "Detailed summary of your conversations and key insights",
      icon: MessageSquare,
     
      features: ["Key Topics", "Sentiment Analysis", "Highlights"],
    },
  ]

  return (
    <div className="min-h-screen bg-slate-900 relative">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Star className="h-6 w-6 text-yellow-400 fill-current" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Report Center
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Generate comprehensive reports to track your progress and gain valuable insights with our advanced analytics
          </p>
        </div>

        {/* Report Type Selection */}
        {!selectedReport && (
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {reportTypes.map((report) => {
              const IconComponent = report.icon
              return (
                <Card
                  key={report.id}
                  className="cursor-pointer transition-all duration-300 hover:scale-105 border border-slate-700 bg-gradient-to-br from-slate-800/50 via-slate-800/50 to-purple-900/20 hover:bg-gradient-to-br hover:from-slate-800 hover:to-purple-900/30 shadow-lg shadow-purple-500/10"
                  onClick={() => setSelectedReport(report.id)}
                >
                  <CardHeader className="text-center pb-6">
                    <div className="mb-6">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/50">
                        <IconComponent className="h-10 w-10 text-white" />
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 mb-3">
                      <CardTitle className="text-2xl text-white font-bold">{report.title}</CardTitle>
                      
                    </div>

                    <CardDescription className="text-slate-300 text-lg leading-relaxed mb-4">
                      {report.description}
                    </CardDescription>

                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {report.features.map((feature, index) => (
                        <span key={index} className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <Button
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 text-lg py-6"
                      size="lg"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Back Button */}
        {selectedReport && (
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => setSelectedReport(null)}
              className="mb-6 bg-gradient-to-r from-slate-800/50 to-purple-900/20 border-slate-700 text-white hover:bg-gradient-to-r hover:from-slate-700 hover:to-purple-900/30 backdrop-blur-sm"
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
  )
}

export default ReportPage
