import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Bot, UserCheck, Calendar, Bell, FileQuestion, TrendingUp,
  GraduationCap, ScanLine, Languages, Volume2, Search, Cpu, Mail, CheckCircle,
  AlertTriangle, Play, BookOpen, Send, Download, FileText, Plus, ListPlus,
  Compass, BadgeAlert, ArrowRight, Music, Layers
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function AiHub() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("chatbot");
  const [loading, setLoading] = useState(false);

  // ── States for AI Chatbot ──
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([
    { role: "ai", text: "Hello! I am your AI Campus Guide. How can I assist you with your academic operations today?" }
  ]);

  // ── States for Admission Assistant ──
  const [admissionGpa, setAdmissionGpa] = useState("3.8");
  const [admissionScore, setAdmissionScore] = useState("1450");
  const [admissionDept, setAdmissionDept] = useState("Computer Science");
  const [admissionExtras, setAdmissionExtras] = useState("President of Robotics Club, Varsity Debate team captain");
  const [admissionResult, setAdmissionResult] = useState<any>(null);

  // ── States for Timetable Generator ──
  const [scheduleCourses, setScheduleCourses] = useState("CS101 (Intro Programming), CS203 (Data Structures), MA102 (Linear Algebra)");
  const [scheduleFaculty, setScheduleFaculty] = useState("Dr. Alice Vance, Prof. Robert Miller, Dr. Chen Wei");
  const [timetableResult, setTimetableResult] = useState<any>(null);

  // ── States for Notice Generator ──
  const [noticeTopic, setNoticeTopic] = useState("Annual Cultural Festival Festiva 2026 Rescheduling");
  const [noticePoints, setNoticePoints] = useState("Postponed due to upcoming mid-semester examinations. New date will be announced in November.");
  const [noticeTone, setNoticeTone] = useState("Professional and Authoritative");
  const [noticeAudience, setNoticeAudience] = useState("all students and faculty");
  const [noticeResult, setNoticeResult] = useState<any>(null);

  // ── States for Question Paper Generator ──
  const [qpSubject, setQpSubject] = useState("Microprocessors");
  const [qpTopic, setQpTopic] = useState("Interrupt handling and 8086 instructions");
  const [qpDifficulty, setQpDifficulty] = useState("Medium");
  const [qpCount, setQpCount] = useState(5);
  const [qpResult, setQpResult] = useState<any>(null);

  // ── States for Result Analytics ──
  const [studentMarksInput, setStudentMarksInput] = useState(JSON.stringify([
    { course: "Algorithms", midTerm: 65, finalExam: 72, attendance: 78 },
    { course: "Database Systems", midTerm: 88, finalExam: 92, attendance: 95 },
    { course: "Networking", midTerm: 42, finalExam: 50, attendance: 64 }
  ], null, 2));
  const [analyticsResult, setAnalyticsResult] = useState<any>(null);

  // ── States for Faculty Analytics ──
  const [facWorkload, setFacWorkload] = useState(16);
  const [facResearch, setFacResearch] = useState("Deep reinforcement learning for scheduling (IEEE 2025)");
  const [facFeedback, setFacFeedback] = useState("Explain concepts exceptionally but quizzes are quite difficult; Always open for post-lecture doubts");
  const [facultyResult, setFacultyResult] = useState<any>(null);

  // ── States for Attendance Insights ──
  const [attendanceRecords, setAttendanceRecords] = useState(JSON.stringify([
    { date: "2026-10-01", status: "Present" },
    { date: "2026-10-02", status: "Absent" },
    { date: "2026-10-05", status: "Absent" },
    { date: "2026-10-06", status: "Absent" },
    { date: "2026-10-07", status: "Present" }
  ], null, 2));
  const [attendanceResult, setAttendanceResult] = useState<any>(null);

  // ── States for Research Assistant ──
  const [researchTopic, setResearchTopic] = useState("Using multimodal large language models for smart university timetable conflicts resolution");
  const [researchDraft, setResearchDraft] = useState("We explore a novel prompt architecture that scheduling assistants can use to structure and map weekly slots conflict-free.");
  const [researchResult, setResearchResult] = useState<any>(null);

  // ── States for OCR Document Scanner ──
  const [ocrDocType, setOcrDocType] = useState("Academic Certificate");
  const [ocrSimulateFile, setOcrSimulateFile] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<any>(null);

  // ── States for Translator ──
  const [translateText, setTranslateText] = useState("The university main library will be closed this Friday for quarterly stock audit and maintenance.");
  const [translateLang, setTranslateLang] = useState("French");
  const [translateResult, setTranslateResult] = useState<any>(null);

  // ── States for Voice Assistant ──
  const [voiceText, setVoiceText] = useState("Welcome back! Here is your automated lecture review system.");
  const [voiceName, setVoiceName] = useState("Kore");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // ── States for Smart Search ──
  const [searchQuery, setSearchQuery] = useState("find physics results under 75% attendance");
  const [searchScope, setSearchScope] = useState("All");
  const [searchResult, setSearchResult] = useState<any>(null);

  // ── States for Workflow Automation ──
  const [wfTrigger, setWfTrigger] = useState("Attendance falls below 75%");
  const [wfAction, setWfAction] = useState("Auto-draft parent warning email and send SMS alert");
  const [wfConditions, setWfConditions] = useState("Except medical leave slip uploaded");
  const [wfResult, setWfResult] = useState<any>(null);

  // Generic fetch helper
  const callAiEndpoint = async (endpoint: string, payload: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/ai/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to query server AI");
      }
      return json;
    } catch (err: any) {
      toast({
        title: "AI Inference Error",
        description: err.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Chatbot send message
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);

    const res = await callAiEndpoint("chat", { message: userMsg });
    if (res) {
      setChatMessages(prev => [...prev, { role: "ai", text: res.reply }]);
    }
  };

  // Admission Analyze
  const handleAdmissionAnalyze = async () => {
    const res = await callAiEndpoint("admission-chance", {
      studentGpa: parseFloat(admissionGpa),
      testScore: parseInt(admissionScore),
      department: admissionDept,
      extraCurriculars: admissionExtras
    });
    if (res) setAdmissionResult(res.data);
  };

  // Timetable generate
  const handleTimetableGenerate = async () => {
    const res = await callAiEndpoint("timetable-generate", {
      courses: scheduleCourses.split(",").map(c => c.trim()),
      faculty: scheduleFaculty.split(",").map(f => f.trim())
    });
    if (res) setTimetableResult(res.data);
  };

  // Notice draft
  const handleNoticeDraft = async () => {
    const res = await callAiEndpoint("notice-draft", {
      topic: noticeTopic,
      keyPoints: noticePoints,
      tone: noticeTone,
      audience: noticeAudience
    });
    if (res) setNoticeResult(res.data);
  };

  // Question paper generate
  const handleQpGenerate = async () => {
    const res = await callAiEndpoint("question-paper", {
      subject: qpSubject,
      topic: qpTopic,
      difficulty: qpDifficulty,
      count: qpCount
    });
    if (res) setQpResult(res.data);
  };

  // Result Analytics
  const handleResultAnalyze = async () => {
    try {
      const parsed = JSON.parse(studentMarksInput);
      const res = await callAiEndpoint("result-analytics", { studentMarks: parsed });
      if (res) setAnalyticsResult(res.data);
    } catch (e) {
      toast({
        title: "JSON Parsing Error",
        description: "Please check your marks JSON formatting",
        variant: "destructive"
      });
    }
  };

  // Faculty analytics
  const handleFacultyAnalyze = async () => {
    const res = await callAiEndpoint("faculty-metrics", {
      workloadHours: facWorkload,
      researchPapers: facResearch ? [facResearch] : [],
      studentFeedbacks: facFeedback ? [facFeedback] : []
    });
    if (res) setFacultyResult(res.data);
  };

  // Attendance Insights
  const handleAttendanceAnalyze = async () => {
    try {
      const parsed = JSON.parse(attendanceRecords);
      const res = await callAiEndpoint("attendance-insights", {
        studentName: user?.name,
        attendanceRecord: parsed
      });
      if (res) setAttendanceResult(res.data);
    } catch (e) {
      toast({
        title: "JSON Parsing Error",
        description: "Verify attendance records format",
        variant: "destructive"
      });
    }
  };

  // Research Assistant
  const handleResearchAnalyze = async () => {
    const res = await callAiEndpoint("research-assist", {
      topic: researchTopic,
      draftAbstract: researchDraft
    });
    if (res) setResearchResult(res.data);
  };

  // OCR document scan
  const handleOcrSimulate = async () => {
    // We will supply a mock Base64 image representing a transcript to make the execution successful
    const dummyBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
    const res = await callAiEndpoint("ocr", {
      documentBase64: dummyBase64,
      docType: ocrDocType
    });
    if (res) setOcrResult(res.data);
  };

  // Translator
  const handleTranslate = async () => {
    const res = await callAiEndpoint("translate", {
      text: translateText,
      targetLanguage: translateLang
    });
    if (res) setTranslateResult(res.data);
  };

  // Voice synthesis
  const handleVoiceSynthesize = async () => {
    const res = await callAiEndpoint("voice", {
      text: voiceText,
      voice: voiceName
    });
    if (res && res.audioBase64) {
      const binaryString = window.atob(res.audioBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes.buffer], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      
      // Auto play
      setTimeout(() => {
        const audio = new Audio(url);
        audio.play().catch(e => console.log("Audio autoplay was prevented:", e));
      }, 100);

      toast({
        title: "Vocal Synthesized",
        description: "Playing synthesized response via prebuilt voice " + voiceName
      });
    }
  };

  // Smart Search
  const handleSmartSearch = async () => {
    const res = await callAiEndpoint("search", {
      query: searchQuery,
      searchScope: searchScope
    });
    if (res) setSearchResult(res.data);
  };

  // Workflow automation
  const handleWorkflowCreate = async () => {
    const res = await callAiEndpoint("workflow", {
      triggerEvent: wfTrigger,
      actionType: wfAction,
      conditions: wfConditions
    });
    if (res) setWfResult(res.data);
  };

  const tabsConfig = [
    { id: "chatbot", label: "AI Chatbot", icon: Bot },
    { id: "admission", label: "Admission Assistant", icon: UserCheck },
    { id: "timetable", label: "Timetable Optimizer", icon: Calendar },
    { id: "notice", label: "Notice Drafting", icon: Bell },
    { id: "question", label: "Question Paper Gen", icon: FileQuestion },
    { id: "result", label: "Grades Predictor", icon: TrendingUp },
    { id: "faculty", label: "Faculty Analytics", icon: GraduationCap },
    { id: "attendance", label: "Attendance Insights", icon: Layers },
    { id: "research", label: "Research Assistant", icon: Compass },
    { id: "ocr", label: "OCR & Scanner", icon: ScanLine },
    { id: "translation", label: "Multi-Language Translate", icon: Languages },
    { id: "voice", label: "Voice Assistant", icon: Volume2 },
    { id: "search", label: "Smart Search", icon: Search },
    { id: "workflow", label: "Workflow Trigger", icon: Cpu }
  ];

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Header card with glass background */}
      <div className="relative p-6 rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-secondary/10 overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="h-40 w-40 text-primary animate-pulse" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-primary" />
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-primary border-primary">
                AI Academic Suite Enabled
              </Badge>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">AI Campus Hub</h1>
            <p className="text-muted-foreground text-sm max-w-2xl mt-1">
              Configure and run state-of-the-art server-side Gemini intelligence tasks. All modules are fully isolated, tenant-compliant, and optional.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">MODEL: GEMINI-3.5-FLASH</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation panel */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 p-1.5 bg-card border rounded-2xl shrink-0">
          {tabsConfig.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm scale-[1.02]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "animate-bounce" : ""}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-9 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
            >
              {/* 1. AI CHATBOT */}
              {activeTab === "chatbot" && (
                <Card className="border border-border/80">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      Dynamic Campus AI Chatbot
                    </CardTitle>
                    <CardDescription>
                      A conversational assistant optimized for campus schedules, courses, and guidance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-[320px] overflow-y-auto border rounded-xl p-4 space-y-3 bg-muted/20">
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2 text-xs leading-relaxed ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-card border text-foreground"
                            }`}
                          >
                            <p className="whitespace-pre-line">{msg.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        placeholder="Ask about library hours, homework guidelines..."
                        onKeyDown={e => e.key === "Enter" && handleChatSend()}
                        disabled={loading}
                        className="text-xs"
                      />
                      <Button onClick={handleChatSend} disabled={loading} size="icon" className="shrink-0">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 2. ADMISSION ASSISTANT */}
              {activeTab === "admission" && (
                <Card className="border border-border/80">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-primary" />
                      AI Admission Officer
                    </CardTitle>
                    <CardDescription>
                      Calculates enrollment eligibility and drafts student feedback drafts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground">High School GPA</Label>
                        <Input value={admissionGpa} onChange={e => setAdmissionGpa(e.target.value)} placeholder="e.g. 3.8" className="text-xs" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground">Standardized Score</Label>
                        <Input value={admissionScore} onChange={e => setAdmissionScore(e.target.value)} placeholder="e.g. 1450" className="text-xs" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground">Target Department</Label>
                        <Input value={admissionDept} onChange={e => setAdmissionDept(e.target.value)} placeholder="e.g. Computer Science" className="text-xs" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Extracurricular Highlights</Label>
                      <Textarea value={admissionExtras} onChange={e => setAdmissionExtras(e.target.value)} placeholder="Describe club activities..." className="text-xs min-h-[60px]" />
                    </div>
                    <Button onClick={handleAdmissionAnalyze} disabled={loading} className="w-full text-xs font-semibold py-5">
                      Evaluate Admission Chance
                    </Button>

                    {admissionResult && (
                      <div className="mt-4 p-4 rounded-xl border bg-muted/10 space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                          <span className="text-xs font-semibold">Eligibility Confidence:</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={admissionResult.chancePercentage >= 70 ? "default" : "secondary"}>
                              {admissionResult.chancePercentage}% Match
                            </Badge>
                            <span className="text-xs font-mono font-bold text-primary">{admissionResult.verdict}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <h4 className="font-bold text-emerald-600">Candidate Strengths:</h4>
                            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                              {admissionResult.strengths?.map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                            </ul>
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-amber-600">Identified Gaps:</h4>
                            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                              {admissionResult.gaps?.map((g: string, idx: number) => <li key={idx}>{g}</li>)}
                            </ul>
                          </div>
                        </div>
                        {admissionResult.draftResponse && (
                          <div className="pt-2 border-t">
                            <h4 className="font-bold text-xs mb-1">Generated Draft Response Email:</h4>
                            <div className="bg-card p-3 rounded border text-muted-foreground font-mono text-[10px] leading-relaxed whitespace-pre-wrap">
                              {admissionResult.draftResponse}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 3. TIMETABLE GENERATOR */}
              {activeTab === "timetable" && (
                <Card className="border border-border/80">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      AI Academic Timetable Optimizer
                    </CardTitle>
                    <CardDescription>
                      Schedule conflicting lectures and rooms without double-bookings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Courses to schedule (comma-separated)</Label>
                      <Input value={scheduleCourses} onChange={e => setScheduleCourses(e.target.value)} className="text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Faculty members list (comma-separated)</Label>
                      <Input value={scheduleFaculty} onChange={e => setScheduleFaculty(e.target.value)} className="text-xs" />
                    </div>
                    <Button onClick={handleTimetableGenerate} disabled={loading} className="w-full text-xs font-semibold py-5">
                      Resolve & Generate Optimal Timetable
                    </Button>

                    {timetableResult && (
                      <div className="mt-4 border rounded-xl overflow-hidden text-xs">
                        <div className="bg-muted p-3 font-semibold border-b">Optimized Academic Schedule</div>
                        <div className="p-3 bg-card text-muted-foreground text-[11px] mb-2 font-serif border-b leading-relaxed whitespace-pre-line">
                          {timetableResult.optimizationsExplanation}
                        </div>
                        <div className="divide-y max-h-[220px] overflow-y-auto">
                          {timetableResult.schedule?.map((item: any, idx: number) => (
                            <div key={idx} className="p-3 flex justify-between items-center bg-muted/5 hover:bg-muted/20">
                              <div>
                                <span className="font-bold text-foreground mr-2">{item.day}</span>
                                <span className="text-muted-foreground font-mono text-[10px]">{item.slot}</span>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-primary">{item.course}</p>
                                <p className="text-[10px] text-muted-foreground">{item.faculty} • {item.room}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 4. NOTICE DRAFTING */}
              {activeTab === "notice" && (
                <Card className="border border-border/80">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bell className="h-5 w-5 text-primary" />
                      AI Official Notice Generator
                    </CardTitle>
                    <CardDescription>
                      Draft beautiful institutional announcements with selected target audiences and custom tones.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Announcement Topic</Label>
                      <Input value={noticeTopic} onChange={e => setNoticeTopic(e.target.value)} className="text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Specific Points to Include</Label>
                      <Textarea value={noticePoints} onChange={e => setNoticePoints(e.target.value)} className="text-xs min-h-[60px]" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground">Notice Tone</Label>
                        <Select value={noticeTone} onValueChange={setNoticeTone}>
                          <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Professional and Authoritative">Professional</SelectItem>
                            <SelectItem value="Casual and Encouraging">Casual / Friendly</SelectItem>
                            <SelectItem value="Urgent and Warning">Urgent Notice</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground">Target Audience</Label>
                        <Input value={noticeAudience} onChange={e => setNoticeAudience(e.target.value)} placeholder="e.g. all students and faculty" className="text-xs" />
                      </div>
                    </div>
                    <Button onClick={handleNoticeDraft} disabled={loading} className="w-full text-xs font-semibold py-5">
                      Draft Campus Announcement
                    </Button>

                    {noticeResult && (
                      <div className="mt-4 p-4 rounded-xl border bg-muted/10 space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                          <h4 className="font-extrabold text-xs text-primary">{noticeResult.subject}</h4>
                          <div className="flex gap-1">
                            {noticeResult.tags?.map((t: string, idx: number) => <Badge key={idx} variant="secondary" className="text-[9px]">{t}</Badge>)}
                          </div>
                        </div>
                        <div className="bg-card p-4 rounded border text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                          {noticeResult.body}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 5. QUESTION PAPER GENERATOR */}
              {activeTab === "question" && (
                <Card className="border border-border/80">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileQuestion className="h-5 w-5 text-primary" />
                      AI Question Paper & Quiz Generator
                    </CardTitle>
                    <CardDescription>
                      Generate customizable exams, quizzes, or homework assignments based on subject.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground">Subject</Label>
                        <Input value={qpSubject} onChange={e => setQpSubject(e.target.value)} className="text-xs" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground">Specific Topic</Label>
                        <Input value={qpTopic} onChange={e => setQpTopic(e.target.value)} className="text-xs" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground">Difficulty</Label>
                        <Select value={qpDifficulty} onValueChange={setQpDifficulty}>
                          <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">Easy (Conceptual)</SelectItem>
                            <SelectItem value="Medium">Medium (Application-based)</SelectItem>
                            <SelectItem value="Hard">Hard (Problem-solving)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground">No. of Questions</Label>
                        <Input type="number" value={qpCount} onChange={e => setQpCount(parseInt(e.target.value))} className="text-xs" />
                      </div>
                    </div>
                    <Button onClick={handleQpGenerate} disabled={loading} className="w-full text-xs font-semibold py-5">
                      Generate Assessment Paper
                    </Button>

                    {qpResult && (
                      <div className="mt-4 p-4 rounded-xl border bg-muted/10 space-y-4">
                        <div className="border-b pb-2">
                          <h4 className="font-extrabold text-sm text-foreground">{qpResult.title}</h4>
                          <p className="text-[10px] text-muted-foreground italic mt-0.5">{qpResult.instructions}</p>
                        </div>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto">
                          {qpResult.questions?.map((q: any) => (
                            <div key={q.id} className="text-xs space-y-1.5">
                              <p className="font-bold">{q.id}. {q.questionText} <span className="text-primary font-mono text-[10px]">({q.marks} Marks)</span></p>
                              {q.options && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                                  {q.options.map((opt: string, optIdx: number) => (
                                    <div key={optIdx} className="bg-card p-2 rounded border text-muted-foreground text-[11px] hover:text-foreground">
                                      {opt}
                                    </div>
                                  ))}
                                </div>
                              )}
                              <p className="text-[10px] font-mono text-emerald-600 pl-4 bg-emerald-500/5 py-1.5 rounded">
                                Solution: {q.correctAnswer}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 6. GRADE PREDICTOR */}
              {activeTab === "result" && (
                <Card className="border border-border/80">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Predictive Result Analytics
                    </CardTitle>
                    <CardDescription>
                      Predict final student GPA scores and potential attrition/failure risks based on current session parameters.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Marks Dataset (JSON)</Label>
                      <Textarea value={studentMarksInput} onChange={e => setStudentMarksInput(e.target.value)} className="font-mono text-[11px] min-h-[140px]" />
                    </div>
                    <Button onClick={handleResultAnalyze} disabled={loading} className="w-full text-xs font-semibold py-5">
                      Synthesize Grades & Assess Risk
                    </Button>

                    {analyticsResult && (
                      <div className="mt-4 p-4 rounded-xl border bg-muted/10 space-y-3 text-xs">
                        <div className="flex items-center justify-between border-b pb-2">
                          <span className="font-bold">Predicted Final Session GPA:</span>
                          <span className="font-mono text-base font-extrabold text-primary">{analyticsResult.gpaEstimate}/4.00</span>
                        </div>
                        <div className="flex items-center gap-3 bg-card p-3 rounded border">
                          <BadgeAlert className={`h-5 w-5 ${analyticsResult.riskAssessment === "High" ? "text-red-500" : "text-amber-500"}`} />
                          <div>
                            <p className="font-bold">Risk Standing: {analyticsResult.riskAssessment} Risk</p>
                            <p className="text-muted-foreground text-[10px] mt-0.5">{analyticsResult.riskExplanation}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-bold text-foreground mb-1">Strong Core Areas:</h4>
                            <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-[11px]">
                              {analyticsResult.strengths?.map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground mb-1">Actionable Interventions:</h4>
                            <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-[11px]">
                              {analyticsResult.recommendations?.map((r: string, idx: number) => <li key={idx}>{r}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 7. FACULTY ANALYTICS */}
              {activeTab === "faculty" && (
                <Card className="border border-border/80">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      AI Faculty Workload & Feedback Analyzer
                    </CardTitle>
                    <CardDescription>
                      Evaluates weekly workloads and extracts students' rating feedbacks sentiment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground">Classroom Hours/Week</Label>
                        <Input type="number" value={facWorkload} onChange={e => setFacWorkload(parseInt(e.target.value))} className="text-xs" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground">Research Papers Published (Latest)</Label>
                        <Input value={facResearch} onChange={e => setFacResearch(e.target.value)} className="text-xs" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Students Feedback Text Slips</Label>
                      <Textarea value={facFeedback} onChange={e => setFacFeedback(e.target.value)} className="text-xs" />
                    </div>
                    <Button onClick={handleFacultyAnalyze} disabled={loading} className="w-full text-xs font-semibold py-5">
                      Analyze Faculty Metrics
                    </Button>

                    {facultyResult && (
                      <div className="mt-4 p-4 rounded-xl border bg-muted/10 space-y-3 text-xs">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-3 bg-card rounded border">
                            <p className="text-[10px] text-muted-foreground">Overall Score</p>
                            <p className="text-base font-extrabold text-primary">{facultyResult.overallRating}/10</p>
                          </div>
                          <div className="p-3 bg-card rounded border">
                            <p className="text-[10px] text-muted-foreground">Sentiment</p>
                            <p className="text-xs font-extrabold text-emerald-600">{facultyResult.sentimentAnalysis}</p>
                          </div>
                          <div className="p-3 bg-card rounded border">
                            <p className="text-[10px] text-muted-foreground">Workload Status</p>
                            <p className="text-xs font-extrabold text-amber-600">{facultyResult.workloadVerdict}</p>
                          </div>
                        </div>
                        <div className="space-y-2 pt-2">
                          <div>
                            <h4 className="font-bold text-foreground">Peer Insights:</h4>
                            <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-[11px]">
                              {facultyResult.insights?.map((i: string, idx: number) => <li key={idx}>{i}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground">Aesthetic Achievements:</h4>
                            <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-[11px]">
                              {facultyResult.achievements?.map((a: string, idx: number) => <li key={idx}>{a}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 8. ATTENDANCE INSIGHTS */}
              {activeTab === "attendance" && (
                <Card className="border border-border/80">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      AI Attendance Insights
                    </CardTitle>
                    <CardDescription>
                      Scans attendance history trends and triggers automated threshold alerts if attendance drops under 75%.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Raw Attendance Log dataset</Label>
                      <Textarea value={attendanceRecords} onChange={e => setAttendanceRecords(e.target.value)} className="font-mono text-[11px] min-h-[120px]" />
                    </div>
                    <Button onClick={handleAttendanceAnalyze} disabled={loading} className="w-full text-xs font-semibold py-5">
                      Analyze Attendance Records
                    </Button>

                    {attendanceResult && (
                      <div className="mt-4 p-4 rounded-xl border bg-muted/10 space-y-3 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="font-semibold">Calculated Total Percentage:</span>
                          <span className="font-mono font-extrabold text-base text-primary">{attendanceResult.percentage}%</span>
                        </div>
                        <div className="flex items-center gap-2 justify-between">
                          <span className="font-bold">Attendance Standing Trend:</span>
                          <Badge variant={attendanceResult.isBelowThreshold ? "destructive" : "default"}>
                            {attendanceResult.trend}
                          </Badge>
                        </div>
                        {attendanceResult.draftWarningEmail && (
                          <div className="pt-2 border-t space-y-1">
                            <h4 className="font-bold text-red-500 flex items-center gap-1.5 text-xs">
                              <AlertTriangle className="h-4 w-4" /> Attendance Drop Action: Drafted Warning Notice
                            </h4>
                            <div className="bg-card p-3 rounded border font-mono text-[10px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
                              {attendanceResult.draftWarningEmail}
                            </div>
                          </div>
                        )}
                        <div className="space-y-1">
                          <h4 className="font-bold">Counselling suggestions:</h4>
                          <ul className="list-disc pl-4 text-[11px] text-muted-foreground space-y-0.5">
                            {attendanceResult.insights?.map((ins: string, idx: number) => <li key={idx}>{ins}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 9. RESEARCH ASSISTANT */}
              {activeTab === "research" && (
                <Card className="border border-border/80">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Compass className="h-5 w-5 text-primary" />
                      AI Peer Research Assistant
                    </CardTitle>
                    <CardDescription>
                      Assists with writing polished academic paper abstracts and suggests peer literature citation mappings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Proposed Research Paper Title / Topic</Label>
                      <Input value={researchTopic} onChange={e => setResearchTopic(e.target.value)} className="text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Rough Abstract Draft / Key Intent</Label>
                      <Textarea value={researchDraft} onChange={e => setResearchDraft(e.target.value)} className="text-xs min-h-[60px]" />
                    </div>
                    <Button onClick={handleResearchAnalyze} disabled={loading} className="w-full text-xs font-semibold py-5">
                      Synthesize Refined Research Paper Schema
                    </Button>

                    {researchResult && (
                      <div className="mt-4 p-4 rounded-xl border bg-muted/10 space-y-3 text-xs">
                        <div className="space-y-1">
                          <h4 className="font-bold text-primary">Polished Academic Abstract:</h4>
                          <div className="bg-card p-3 rounded border text-muted-foreground leading-relaxed italic">
                            "{researchResult.academicAbstract}"
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-bold text-foreground">Recommended Methodology:</h4>
                            <p className="text-muted-foreground text-[11px] mt-0.5 leading-relaxed">{researchResult.recommendedMethodology}</p>
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground">Suggested Citations Map:</h4>
                            <ul className="list-decimal pl-4 space-y-1 text-muted-foreground text-[11px] mt-1">
                              {researchResult.suggestedCitations?.map((c: string, idx: number) => <li key={idx}>{c}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 10. OCR SCANNER */}
              {activeTab === "ocr" && (
                <Card className="border border-border/80">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ScanLine className="h-5 w-5 text-primary" />
                      AI OCR Document Scanner & Generator
                    </CardTitle>
                    <CardDescription>
                      Simulate high-performance document optical character recognition (OCR) scanning to extract structured metadata.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Document Category</Label>
                      <Select value={ocrDocType} onValueChange={setOcrDocType}>
                        <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Academic Transcript">Academic Transcript</SelectItem>
                          <SelectItem value="Medical Sickness Certificate">Medical Certificate</SelectItem>
                          <SelectItem value="Enrollment Proof">Enrollment Proof</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-4 p-4 border-2 border-dashed rounded-xl bg-card">
                      <ScanLine className="h-10 w-10 text-muted-foreground shrink-0" />
                      <div className="flex-1 text-xs">
                        <p className="font-semibold">Transcripts_Scan_A.jpg</p>
                        <p className="text-muted-foreground text-[10px]">Mock base64 image data is pre-mapped for instant verification.</p>
                      </div>
                    </div>
                    <Button onClick={handleOcrSimulate} disabled={loading} className="w-full text-xs font-semibold py-5">
                      Extract & Generate OCR Report
                    </Button>

                    {ocrResult && (
                      <div className="mt-4 p-4 rounded-xl border bg-muted/10 space-y-3 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span className="font-semibold">OCR confidence alignment:</span>
                          <Badge variant="default" className="bg-emerald-600">{ocrResult.confidenceScore}% Confidence</Badge>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold">Extracted Fields:</h4>
                          <div className="grid grid-cols-2 gap-2 text-[11px] bg-card p-2 rounded border">
                            {Object.entries(ocrResult.extractedData || {}).map(([k, v]: any) => (
                              <div key={k} className="flex justify-between border-b pb-1">
                                <span className="font-mono text-muted-foreground">{k}:</span>
                                <span className="font-bold">{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {ocrResult.formattedMarkdownReport && (
                          <div className="pt-2">
                            <h4 className="font-bold mb-1">Generated Printable Document Summary:</h4>
                            <div className="bg-card p-4 rounded border font-mono text-[10px] leading-relaxed text-muted-foreground whitespace-pre-wrap border-l-4 border-l-primary">
                              {ocrResult.formattedMarkdownReport}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 11. MULTI-LANGUAGE TRANSLATE */}
              {activeTab === "translation" && (
                <Card className="border border-border/80">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Languages className="h-5 w-5 text-primary" />
                      AI Multilingual Notice Translator
                    </CardTitle>
                    <CardDescription>
                      Instantly translates lecture syllabi or circulars into diverse global languages.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Text Content to Translate</Label>
                      <Textarea value={translateText} onChange={e => setTranslateText(e.target.value)} className="text-xs min-h-[60px]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Target Language</Label>
                      <Select value={translateLang} onValueChange={setTranslateLang}>
                        <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Spanish">Spanish (Español)</SelectItem>
                          <SelectItem value="French">French (Français)</SelectItem>
                          <SelectItem value="Hindi">Hindi (हिन्दी)</SelectItem>
                          <SelectItem value="German">German (Deutsch)</SelectItem>
                          <SelectItem value="Chinese">Chinese (中文)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleTranslate} disabled={loading} className="w-full text-xs font-semibold py-5">
                      Translate Content
                    </Button>

                    {translateResult && (
                      <div className="mt-4 p-4 rounded-xl border bg-muted/10 space-y-2 text-xs">
                        <div className="font-semibold text-primary">Translated Output:</div>
                        <div className="bg-card p-3 rounded border text-foreground text-sm font-medium leading-relaxed">
                          {translateResult.translatedText}
                        </div>
                        {translateResult.pronunciationHint && (
                          <div className="text-[10px] text-muted-foreground font-serif">
                            Pronunciation guide: {translateResult.pronunciationHint}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 12. VOICE ASSISTANT */}
              {activeTab === "voice" && (
                <Card className="border border-border/80">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Volume2 className="h-5 w-5 text-primary" />
                      Voice Synthesis & Assistant Room
                    </CardTitle>
                    <CardDescription>
                      Leverages the prebuilt Gemini vocal engine to hear simulated guidance responses.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Enter Message to Speak</Label>
                      <Textarea value={voiceText} onChange={e => setVoiceText(e.target.value)} className="text-xs min-h-[60px]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Voice Persona</Label>
                      <Select value={voiceName} onValueChange={setVoiceName}>
                        <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kore">Kore (Balanced, Professional)</SelectItem>
                          <SelectItem value="Fenrir">Fenrir (Deep, Authoritative)</SelectItem>
                          <SelectItem value="Puck">Puck (Cheerful, Energetic)</SelectItem>
                          <SelectItem value="Zephyr">Zephyr (Soft, Warm)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleVoiceSynthesize} disabled={loading} className="w-full text-xs font-semibold py-5 flex items-center justify-center gap-2">
                      <Play className="h-4 w-4" /> Synthesize & Stream Voice Response
                    </Button>

                    {audioUrl && (
                      <div className="mt-4 p-4 rounded-xl border bg-card flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                          <div>
                            <p className="font-bold">Synthesis Ready!</p>
                            <p className="text-muted-foreground text-[10px]">Prebuilt voice '{voiceName}' has successfully processed.</p>
                          </div>
                        </div>
                        <audio src={audioUrl} controls className="h-8 max-w-full" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 13. SMART SEARCH */}
              {activeTab === "search" && (
                <Card className="border border-border/80">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Search className="h-5 w-5 text-primary" />
                      AI Natural Language Smart Search
                    </CardTitle>
                    <CardDescription>
                      Queries across directories, libraries, or records using semantic synonyms parsing.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-3">
                        <Label className="text-[11px] font-semibold text-muted-foreground">Natural Language Query</Label>
                        <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="text-xs mt-1" />
                      </div>
                      <div>
                        <Label className="text-[11px] font-semibold text-muted-foreground">Scope</Label>
                        <Select value={searchScope} onValueChange={setSearchScope}>
                          <SelectTrigger className="text-xs mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All Databases</SelectItem>
                            <SelectItem value="Library">Library Catalogs</SelectItem>
                            <SelectItem value="Notices">Notices Board</SelectItem>
                            <SelectItem value="Students">Student Directory</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleSmartSearch} disabled={loading} className="w-full text-xs font-semibold py-5">
                      Compile Smart Query Filters
                    </Button>

                    {searchResult && (
                      <div className="mt-4 p-4 rounded-xl border bg-muted/10 space-y-3 text-xs">
                        <div className="flex items-center gap-2 font-semibold">
                          <Compass className="h-4 w-4 text-primary" /> Parse Target: <span className="font-mono text-primary font-bold">"{searchResult.parsedIntent}"</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-bold">Identified Keywords & Synonyms:</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {searchResult.keywords?.map((k: string, idx: number) => <Badge key={idx} variant="secondary" className="text-[9px]">{k}</Badge>)}
                              {searchResult.semanticSynonyms?.map((s: string, idx: number) => <Badge key={idx} variant="outline" className="text-[9px] border-primary text-primary">{s}</Badge>)}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-bold">Formulated Query Mappings:</h4>
                            <div className="bg-card p-2 rounded border font-mono text-[9px] text-muted-foreground mt-1">
                              {JSON.stringify(searchResult.suggestedFilters, null, 2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 14. WORKFLOW AUTOMATION */}
              {activeTab === "workflow" && (
                <Card className="border border-border/80">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-primary" />
                      AI ERP Workflow Automation
                    </CardTitle>
                    <CardDescription>
                      Sets up self-triggering administrative rules and compiles action handlers automatically.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Trigger Hook Event</Label>
                      <Input value={wfTrigger} onChange={e => setWfTrigger(e.target.value)} className="text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Action to execute</Label>
                      <Input value={wfAction} onChange={e => setWfAction(e.target.value)} className="text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Additional Conditions / Guards</Label>
                      <Input value={wfConditions} onChange={e => setWfConditions(e.target.value)} className="text-xs" />
                    </div>
                    <Button onClick={handleWorkflowCreate} disabled={loading} className="w-full text-xs font-semibold py-5">
                      Compile Automated Workflow Trigger
                    </Button>

                    {wfResult && (
                      <div className="mt-4 p-4 rounded-xl border bg-muted/10 space-y-3 text-xs">
                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="font-bold text-primary">Workflow Class:</span>
                          <Badge variant="default" className="bg-primary">{wfResult.workflowName}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-bold">Generated Node Hook Name:</h4>
                            <p className="font-mono text-muted-foreground text-[10px] mt-0.5">{wfResult.triggerHook}</p>
                          </div>
                          <div>
                            <h4 className="font-bold">Compiled JS Conditions Evaluator Guard:</h4>
                            <div className="bg-card p-3 rounded border font-mono text-[9px] text-muted-foreground mt-1 whitespace-pre-wrap leading-relaxed">
                              {wfResult.conditionsEvaluatorJS}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
