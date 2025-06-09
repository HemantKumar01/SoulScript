"use client"

import type React from "react"
import { useState } from "react"
import MindLogReportViewer from "./mindlog"
import ChatSummaryViewer from "./chat"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, MessageSquare, FileText, Sparkles, Star } from "lucide-react"

const ReportPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<"mindlog" | "chat" | null>(null)

  const reportTypes = [
    {
      id: "mindlog" as const,
      title: "MindLog Report",
      description: "Comprehensive analysis of your mental health journey and patterns",
      icon: Brain,
      gradient: "from-pink-500 via-purple-500 to-indigo-500",
      badge: "7 Days",
      features: ["Pattern Analysis", "Mood Tracking", "Insights"],
    },
    {
      id: "chat" as const,
      title: "Chat Summary",
      description: "Detailed summary of your conversations and key insights",
      icon: MessageSquare,
      gradient: "from-purple-500 via-pink-500 to-rose-500",
      badge: "All Time",
      features: ["Key Topics", "Sentiment Analysis", "Highlights"],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Star className="h-6 w-6 text-yellow-400 fill-current animate-pulse" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
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
                  className="group cursor-pointer transition-all duration-500 hover:scale-105 border-0 bg-white/5 backdrop-blur-xl hover:bg-white/10 shadow-2xl hover:shadow-pink-500/25 relative overflow-hidden"
                  onClick={() => setSelectedReport(report.id)}
                >
                  {/* Card Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <CardHeader className="text-center pb-6 relative z-10">
                    <div className="relative mb-6">
                      <div
                        className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${report.gradient} flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-pink-500/50 transition-all duration-500`}
                      >
                        <IconComponent className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-pink-500/50 to-purple-500/50 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-500" />
                    </div>

                    <div className="flex items-center justify-center gap-3 mb-3">
                      <CardTitle className="text-2xl text-white font-bold">{report.title}</CardTitle>
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 shadow-lg">
                        {report.badge}
                      </Badge>
                    </div>

                    <CardDescription className="text-slate-300 text-lg leading-relaxed mb-4">
                      {report.description}
                    </CardDescription>

                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {report.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white/10 text-slate-300 rounded-full text-sm backdrop-blur-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 relative z-10">
                    <Button
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 text-lg py-6"
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
              className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
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
