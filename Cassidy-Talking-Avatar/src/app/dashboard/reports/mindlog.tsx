"use client"

import { useState } from "react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Brain, Download, AlertCircle, CheckCircle, Loader2, Zap, BookOpen, PenTool, Info } from "lucide-react"
import { useAuthId } from "@/hooks/use-auth-id"
import { Input } from "@/components/ui/input"

interface ApiError {
  error: string
  error_code?: string
  entries_found?: number
  message?: string
}

const MindLogReportViewer = () => {
  const { user, loading: userLoading } = useCurrentUser()
  const authId = useAuthId()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [entriesFound, setEntriesFound] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [numDays, setNumDays] = useState(7)

  const handleGenerateReport = async () => {
    if (!authId) return
    setLoading(true)
    setError(null)
    setErrorCode(null)
    setEntriesFound(null)
    setPdfUrl(null)
    setProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
     

        const res = await fetch("api/getMindLogReport", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authId,
            email: user?.email,
            numdays: numDays,
          }),
        })

     

      // Always try to parse JSON response, regardless of status
      let data
      let responseText = ""
      try {
        responseText = await res.text()
      
        data = JSON.parse(responseText)
      
      } catch (parseError) {
       
      
        throw new Error(`Failed to parse server response. Status: ${res.status}`)
      }

      if (!res.ok) {
        // Handle specific error cases from backend
        if (data.error_code) {
          setErrorCode(data.error_code)
          setError(data.message || data.error) // Use message first, then error
          if (data.entries_found !== undefined) {
            setEntriesFound(data.entries_found)
          }
        } else {
          setError(data.error || data.message || `Server error: ${res.status}`)
        }
        clearInterval(progressInterval)
        return
      }

      // Success case
      if (data.pdf_base64) {
        const base64 = data.pdf_base64
        setPdfUrl(`data:application/pdf;base64,${base64}`)
        setProgress(100)
      } else {
        throw new Error("No PDF data received from server")
      }
    } catch (err: any) {
   

      // Handle different types of errors
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError("Network error. Please check your connection and try again.")
      } else if (err.message.includes("parse")) {
        setError("Server response error. Please try again later.")
      } else {
        setError(err.message || "Failed to generate report. Please try again.")
      }

      clearInterval(progressInterval)
    } finally {
      setLoading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const downloadPdf = () => {
    if (!pdfUrl) return
    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = "MindLogReport.pdf"
    link.click()
  }

  const renderErrorAlert = () => {
    if (!error) return null

    if (errorCode === "NO_ENTRIES") {
      return (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <BookOpen className="h-5 w-5 text-amber-400" />
          <AlertDescription className="text-amber-300">
            <div className="space-y-3">
              <div className="text-lg font-semibold">No Journal Entries Found</div>
              <p className="text-amber-200">
                You haven&apos;t written any journal entries yet. Start your mental health journey by writing your first
                entry!
              </p>
              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => {
                    // Navigate to journal writing page - adjust the path as needed
                    window.location.href = "/dashboard/mindlog"
                  }}
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  Write Your First Entry
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )
    }

    if (errorCode === "INSUFFICIENT_ENTRIES") {
      return (
        <Alert className="border-blue-500/50 bg-blue-500/10">
          <Info className="h-5 w-5 text-blue-400" />
          <AlertDescription className="text-blue-300">
            <div className="space-y-3">
              <div className="text-lg font-semibold">Need More Journal Entries</div>
              <p className="text-blue-200">
                You have only {entriesFound} journal {entriesFound === 1 ? "entry" : "entries"}.
              </p>
              <div className="bg-blue-500/20 rounded-lg p-4 mt-3">
                <div className="text-sm text-blue-100">
                  <strong>Tips for better analysis:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Write entries regularly (daily or every few days)</li>
                    <li>Include your thoughts, feelings, and experiences</li>
                    <li>Be honest and detailed in your reflections</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => {
                    // Navigate to journal writing page - adjust the path as needed
                    window.location.href = "/dashboard/mindlog"
                  }}
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  Add More Entries
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )
    }

    // Default error handling
    return (
      <Alert className="border-red-500/50 bg-red-500/10">
        <AlertCircle className="h-5 w-5 text-red-400" />
        <AlertDescription className="text-red-300 text-lg">{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      <Card className="border border-slate-700 bg-gradient-to-br from-slate-800/50 via-slate-800/50 to-purple-900/20 shadow-lg shadow-purple-500/10">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl text-white font-bold mb-2">MindLog Report</CardTitle>
              <CardDescription className="text-slate-300 text-lg">
                Generate a comprehensive analysis of your mental health patterns over your selected timeframe
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Day Selection */}
          <div className="p-6 bg-gradient-to-br from-slate-700/30 via-purple-900/20 to-pink-900/20 rounded-xl border border-slate-600/50">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-1">Report Duration</h3>
              <p className="text-slate-300 text-sm">Select a preset or enter custom number of days to analyze</p>
            </div>

            {/* Preset Options */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {[
                { days: 7, label: "7 Days", subtitle: "1 Week" },
                { days: 14, label: "14 Days", subtitle: "2 Weeks" },
                { days: 30, label: "30 Days", subtitle: "1 Month" },
                { days: 60, label: "60 Days", subtitle: "2 Months" },
                { days: 90, label: "90 Days", subtitle: "3 Months" },
              ].map((option) => (
                <button
                  key={option.days}
                  onClick={() => setNumDays(option.days)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                    numDays === option.days
                      ? "border-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-md shadow-purple-500/25"
                      : "border-slate-600 bg-slate-700/50 hover:bg-gradient-to-br hover:from-slate-700 hover:to-purple-900/30 hover:border-slate-500"
                  }`}
                >
                  <div className="text-white font-semibold text-lg">{option.label}</div>
                  <div className="text-slate-400 text-sm">{option.subtitle}</div>
                  {numDays === option.days && (
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mt-2"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                <span>Or enter a custom number of days:</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-xs">
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={numDays}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value) || 1
                      if (value >= 1 && value <= 365) {
                        setNumDays(value)
                      }
                    }}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
                    placeholder="Enter days (1-365)"
                  />
                </div>
                <div className="text-slate-400 text-sm">days (max 365)</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-400 mt-4 pt-4 border-t border-slate-600/50">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              <span>Analyzing your mental health patterns over the last {numDays} days</span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <Button
              onClick={handleGenerateReport}
              disabled={loading || !authId}
              size="lg"
              className="min-w-[220px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 text-lg py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Magic...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Generate {numDays}-Day Report
                </>
              )}
            </Button>

            {authId && (
              <Badge className="bg-green-500 text-white border-0 shadow-md flex items-center gap-2 px-4 py-2">
                <CheckCircle className="h-4 w-4" />
                User Verified
              </Badge>
            )}
          </div>

          {loading && (
            <div className="space-y-4 p-6 bg-slate-700/50 rounded-xl">
              <div className="flex items-center justify-between text-lg">
                <span className="text-white font-medium">Generating your {numDays}-day personalized report...</span>
                <span className="text-purple-400 font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-slate-600/50 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {renderErrorAlert()}
        </CardContent>
      </Card>

      {pdfUrl && (
        <Card className="border border-slate-700 bg-slate-800/50 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-white font-bold">Your MindLog Report</CardTitle>
                <CardDescription className="text-slate-300 text-lg">Report generated successfully</CardDescription>
              </div>
              <Button
                onClick={downloadPdf}
                className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-md transition-all duration-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border border-slate-600 rounded-xl overflow-hidden bg-white shadow-lg">
              <iframe src={pdfUrl} className="w-full h-[700px]" title="MindLog Report PDF" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MindLogReportViewer
