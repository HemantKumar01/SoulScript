"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Brain, Download, AlertCircle, CheckCircle, Loader2, Zap } from "lucide-react"

const MindLogReportViewer: React.FC = () => {
  const { user, loading: userLoading } = useCurrentUser()
  const [authId, setAuthId] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [numDays, setNumDays] = useState(7)

  useEffect(() => {
    const getAuthId = async () => {
      if (!user || userLoading) return
      try {
        const q = query(collection(db, "users"), where("email", "==", "ytbhemant@gmail.com"))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          setAuthId(snapshot.docs[0].id)
        } else {
          setError("User not found in Firestore.")
        }
      } catch (err: any) {
        setError(err.message || "Failed to get user authId")
      }
    }

    getAuthId()
  }, [user, userLoading])

  const handleGenerateReport = async () => {
    if (!authId) return
    setLoading(true)
    setError(null)
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
      const res = await fetch("http://127.0.0.1:8000/getMindLogReport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authId,
          email: user?.email,
          numdays: numDays,
        }),
      })

      if (!res.ok) throw new Error(`API error: ${res.statusText}`)

      const data = await res.json()
      const base64 = data.pdf_base64
      setPdfUrl(`data:application/pdf;base64,${base64}`)
      setProgress(100)
    } catch (err: any) {
      setError(err.message || "Failed to generate report.")
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

  return (
    <div className="space-y-8">
      <Card className="border-0 bg-white/5 backdrop-blur-xl shadow-2xl">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-2xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur opacity-75" />
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
          <div className="p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-1">Report Duration</h3>
              <p className="text-slate-300 text-sm">Select the number of days to analyze</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
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
                      ? "border-pink-500 bg-gradient-to-r from-pink-500/20 to-purple-500/20 shadow-lg shadow-pink-500/25"
                      : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="text-white font-semibold text-lg">{option.label}</div>
                  <div className="text-slate-400 text-sm">{option.subtitle}</div>
                  {numDays === option.days && (
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mx-auto mt-2"></div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
              <span>Analyzing your mental health patterns over the last {numDays} days</span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <Button
              onClick={handleGenerateReport}
              disabled={loading || !authId}
              size="lg"
              className="min-w-[220px] bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 text-lg py-6"
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
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg flex items-center gap-2 px-4 py-2">
                <CheckCircle className="h-4 w-4" />
                User Verified
              </Badge>
            )}
          </div>

          {loading && (
            <div className="space-y-4 p-6 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-between text-lg">
                <span className="text-white font-medium">Generating your {numDays}-day personalized report...</span>
                <span className="text-pink-400 font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-500 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <Alert className="border-red-500/50 bg-red-500/10 backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <AlertDescription className="text-red-300 text-lg">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {pdfUrl && (
        <Card className="border-0 bg-white/5 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-white font-bold">Your MindLog Report</CardTitle>
                <CardDescription className="text-slate-300 text-lg">Report generated successfully</CardDescription>
              </div>
              <Button
                onClick={downloadPdf}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border border-white/20 rounded-xl overflow-hidden bg-white shadow-2xl">
              <iframe src={pdfUrl} className="w-full h-[700px]" title="MindLog Report PDF" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MindLogReportViewer
