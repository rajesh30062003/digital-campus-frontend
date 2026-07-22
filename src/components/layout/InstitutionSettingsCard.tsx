import React, { useState, useEffect } from "react";
import { useInstitution } from "@/hooks/useInstitution";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Palette,
  Settings2,
  BookOpen,
  FileSpreadsheet,
  Globe,
  MapPin,
  Mail,
  CheckCircle2,
  Loader2,
  Wrench,
  ToggleLeft,
  Stethoscope,
  Sparkles,
  Info
} from "lucide-react";

const INSTITUTION_TYPES = [
  "School",
  "Higher Secondary School",
  "College",
  "Engineering College",
  "Medical College",
  "Homeopathic College",
  "Dental College",
  "Nursing College",
  "Pharmacy College",
  "Ayurveda College",
  "Veterinary College",
  "University",
  "Polytechnic College",
  "ITI",
  "Coaching Centre",
  "Skill Development Institute",
  "Research Institution"
];

const PRESET_THEMES = [
  { name: "Amethyst (Default)", primary: "#6d28d9", secondary: "#4f46e5" },
  { name: "Emerald Medical", primary: "#059669", secondary: "#0d9488" },
  { name: "Oceanic University", primary: "#0284c7", secondary: "#0369a1" },
  { name: "Crimson Academy", primary: "#dc2626", secondary: "#991b1b" },
  { name: "Cyber Tech", primary: "#0891b2", secondary: "#0f766e" },
  { name: "Sunset Training", primary: "#ea580c", secondary: "#c2410c" }
];

const MODULE_CATEGORIES = [
  {
    title: "Core Academic Modules",
    modules: [
      { id: "admissions", label: "Admissions & Intake", description: "Manage student intake, registration and demographics" },
      { id: "academics", label: "Academics & LMS", description: "Upload assignments, view class materials and notice announcements" },
      { id: "departments", label: "Departments Directory", description: "Organizational mapping of departments and resources" },
      { id: "courses", label: "Course & Subjects", description: "Manage catalogs, curriculum and faculty mappings" },
      { id: "attendance", label: "Attendance Tracker", description: "Capture student class presence and generate logs" },
      { id: "timetable", label: "Timetable Scheduler", description: "Track class hour allocations and faculty routines" }
    ]
  },
  {
    title: "Operations & Admin Support",
    modules: [
      { id: "examination", label: "Examination Engine", description: "Define examination schedules, criteria, and seating" },
      { id: "results", label: "Results & Grading", description: "Record marks, compute averages and generate transcripts" },
      { id: "fees", label: "Fees & Accounts", description: "Log payment collections, invoice tuition and track balances" },
      { id: "library", label: "Library Management System", description: "Track book index registers, borrow logs, and availability" },
      { id: "hr", label: "HR & Payroll Staffing", description: "Manage faculty directory details, qualification records" }
    ]
  },
  {
    title: "Advanced Institutional Integrations",
    modules: [
      { id: "placement", label: "Placement Cell & Career Portal", description: "Post recruitment drives, eligible branches, and apply" },
      { id: "parents", label: "Parents Portal", description: "Coordinate student progress dashboards and alerts to parents" },
      { id: "alumni", label: "Alumni Network Hub", description: "Log directory listings, career transitions, and donor logs" },
      { id: "inventory", label: "Inventory Stock Register", description: "Track college assets, chemical compounds or mechanical tools" },
      { id: "ai-assistant", label: "AI Copilot & Smart Assistant", description: "Empower academic schedules with smart Gemini AI guidance" }
    ]
  },
  {
    title: "Specialized Clinical / Technical Modules",
    modules: [
      { id: "hospital", label: "Hospital ERP Management", description: "IPD/OPD patient records, consultations, homeopathic LSM case sheets" },
      { id: "clinical-postings", label: "Clinical Rotation Posting", description: "Assign students in hospital postings and track rotation diaries" },
      { id: "laboratory", label: "Laboratory Management", description: "Manage experiment scheduling, testing tools, and laboratory diaries" },
      { id: "pharmacy", label: "Pharmacy Stock & Medicine Dispenser", description: "Manage medicine inventory levels and dispense prescriptions" }
    ]
  }
];

export function InstitutionSettingsCard() {
  const { config, updateConfig, isUpdating } = useInstitution();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [institutionType, setInstitutionType] = useState("Medical College");
  const [logo, setLogo] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#6d28d9");
  const [secondaryColor, setSecondaryColor] = useState("#4f46e5");
  const [academicStructure, setAcademicStructure] = useState<"Semester" | "Year">("Semester");
  const [examinationRules, setExaminationRules] = useState("");
  const [attendanceRules, setAttendanceRules] = useState("");
  const [feeStructure, setFeeStructure] = useState("");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [address, setAddress] = useState("");
  const [contactDetails, setContactDetails] = useState("");
  const [enabledModules, setEnabledModules] = useState<string[]>([]);

  // Synchronize state with backend config when it resolves
  useEffect(() => {
    if (config) {
      setName(config.name || "Digital Campus");
      setInstitutionType(config.institutionType || "Medical College");
      setLogo(config.logo || "");
      setPrimaryColor(config.primaryColor || "#6d28d9");
      setSecondaryColor(config.secondaryColor || "#4f46e5");
      setAcademicStructure(config.academicStructure || "Semester");
      setExaminationRules(config.examinationRules || "");
      setAttendanceRules(config.attendanceRules || "");
      setFeeStructure(config.feeStructure || "");
      setLanguage(config.language || "en");
      setTimezone(config.timezone || "UTC");
      setAddress(config.address || "");
      setContactDetails(config.contactDetails || "");
      setEnabledModules(config.enabledModules || []);
    }
  }, [config]);

  const handleToggleModule = (modId: string) => {
    setEnabledModules((prev) =>
      prev.includes(modId) ? prev.filter((id) => id !== modId) : [...prev, modId]
    );
  };

  const handleApplyPreset = (primary: string, secondary: string) => {
    setPrimaryColor(primary);
    setSecondaryColor(secondary);
    toast({
      title: "Preset Applied",
      description: "Color palette updated locally. Click save below to persist changes university-wide.",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateConfig({
        name,
        institutionType,
        logo,
        primaryColor,
        secondaryColor,
        academicStructure,
        examinationRules,
        attendanceRules,
        feeStructure,
        language,
        timezone,
        address,
        contactDetails,
        enabledModules
      });
      toast({
        title: "Ecosystem Configured",
        description: "Universal ERP architecture, active modules, and branding guidelines saved successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Configuration Failed",
        description: err.message || "Could not update institution config.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="px-5 pt-5 pb-3 border-b bg-muted/20">
        <CardTitle className="text-base flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary" />
          Ecosystem Institutional Configurator
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          [Super Admin] Configure identity, dynamic modules, styling metrics, academic terms, and regional rules.
        </p>
      </CardHeader>
      <CardContent className="px-5 py-5">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section: Identity */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Institutional Identity & Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="inst-name" className="text-xs font-semibold">Institution Name</Label>
                <Input
                  id="inst-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Harvard University, Lincoln School, Homeopathic Medical College"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inst-type" className="text-xs font-semibold">Institution Type</Label>
                <select
                  id="inst-type"
                  value={institutionType}
                  onChange={(e) => setInstitutionType(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {INSTITUTION_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="inst-logo" className="text-xs font-semibold">Logo URL</Label>
                <Input
                  id="inst-logo"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-[10px] text-muted-foreground">Specify a direct image URL to apply a custom launcher logo.</p>
              </div>
            </div>
          </div>

          <hr className="border-border" />

          {/* Section: Theme Colors */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Theme Engine & Brand Styling
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="primary-color" className="text-xs font-semibold">Primary Color (Hex)</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="primary-color-picker"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-9 p-0 cursor-pointer"
                  />
                  <Input
                    id="primary-color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#6d28d9"
                    maxLength={7}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="secondary-color" className="text-xs font-semibold">Secondary Color (Hex)</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="secondary-color-picker"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-9 p-0 cursor-pointer"
                  />
                  <Input
                    id="secondary-color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    placeholder="#4f46e5"
                    maxLength={7}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase">Fast Preset Themes</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_THEMES.map((theme) => (
                  <button
                    type="button"
                    key={theme.name}
                    onClick={() => handleApplyPreset(theme.primary, theme.secondary)}
                    className="flex items-center gap-2 p-2 border rounded-lg hover:bg-muted/50 text-left transition-all"
                  >
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: theme.primary }} />
                    <span className="w-3 h-3 rounded-full -ml-3 shrink-0" style={{ backgroundColor: theme.secondary }} />
                    <span className="text-xs font-medium truncate">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-border" />

          {/* Section: Academic Structure & Settings */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5" /> Academic Structure & Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="academic-structure" className="text-xs font-semibold">Academic Structure</Label>
                <select
                  id="academic-structure"
                  value={academicStructure}
                  onChange={(e) => setAcademicStructure(e.target.value as any)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="Semester">Semester-based System</option>
                  <option value="Year">Year-based System</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exam-rules" className="text-xs font-semibold">Examination Passing Criteria</Label>
                <Input
                  id="exam-rules"
                  value={examinationRules}
                  onChange={(e) => setExaminationRules(e.target.value)}
                  placeholder="e.g. Min 50% needed to pass."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="attendance-rules" className="text-xs font-semibold">Attendance Threshold Rules</Label>
                <Input
                  id="attendance-rules"
                  value={attendanceRules}
                  onChange={(e) => setAttendanceRules(e.target.value)}
                  placeholder="e.g. Min 75% class attendance required."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fee-structure" className="text-xs font-semibold font-mono">Fee Description Summary</Label>
                <Input
                  id="fee-structure"
                  value={feeStructure}
                  onChange={(e) => setFeeStructure(e.target.value)}
                  placeholder="e.g. Tuition fee: $4000 per term."
                />
              </div>
            </div>
          </div>

          <hr className="border-border" />

          {/* Section: Modular ERP Features Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ToggleLeft className="w-3.5 h-3.5 text-primary" /> Dynamic Modular ERP Switches
              </h3>
              <Badge variant="secondary" className="font-mono text-[9px]">{enabledModules.length} Modules Active</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Turn modules on or off instantaneously. Modules that are disabled will be hidden from all user directories, sidebars, dashboard metrics, and router maps.
            </p>

            <div className="space-y-5 mt-3">
              {MODULE_CATEGORIES.map((cat) => (
                <div key={cat.title} className="space-y-2 border p-3.5 rounded-xl bg-muted/10">
                  <h4 className="text-xs font-bold text-foreground/80 border-b pb-1 flex items-center gap-1">
                    {cat.title.includes("Clinical") && <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />}
                    {cat.title.includes("Advanced") && <Sparkles className="w-3.5 h-3.5 text-primary" />}
                    {cat.title}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                    {cat.modules.map((mod) => {
                      const isActive = enabledModules.includes(mod.id);
                      return (
                        <div
                          key={mod.id}
                          className={`flex items-start justify-between p-2.5 rounded-lg border transition-all ${
                            isActive
                              ? "bg-primary/5 border-primary/20"
                              : "bg-background border-border/60 hover:border-border"
                          }`}
                        >
                          <div className="space-y-0.5 pr-2">
                            <span className="text-xs font-bold block text-foreground">{mod.label}</span>
                            <span className="text-[10px] leading-snug text-muted-foreground block">
                              {mod.description}
                            </span>
                          </div>
                          <Switch
                            checked={isActive}
                            onCheckedChange={() => handleToggleModule(mod.id)}
                            className="mt-0.5"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-border" />

          {/* Section: Regional & Contacts */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Regional Settings & Address Logs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="language" className="text-xs font-semibold">Primary Locale</Label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="en">English (US/UK)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="timezone" className="text-xs font-semibold">Standard Timezone</Label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="UTC">UTC (GMT+0)</option>
                  <option value="EST">EST (GMT-5)</option>
                  <option value="IST">IST (GMT+5:30)</option>
                  <option value="PST">PST (GMT-8)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-details" className="text-xs font-semibold">Contact Logs (Phone / Email)</Label>
                <Input
                  id="contact-details"
                  value={contactDetails}
                  onChange={(e) => setContactDetails(e.target.value)}
                  placeholder="email: info@campus.edu, phone: +123"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs font-semibold">Campus Postal Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Education Drive, Cityville"
                />
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="pt-2">
            <Button type="submit" disabled={isUpdating} className="w-full gap-2">
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating Global Architecture Settings…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Institutional Configurations & Re-compile
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
