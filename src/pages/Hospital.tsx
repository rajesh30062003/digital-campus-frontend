import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { medicalApi, getUser } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Users, Stethoscope, FileSpreadsheet, Package, Activity, Calendar, 
  Plus, Search, ShieldAlert, CheckCircle2, ShoppingBag, BookOpen, Clock, AlertTriangle, ArrowRight
} from "lucide-react";

const CLINICAL_DEPARTMENTS = [
  "Materia Medica",
  "Organon of Medicine",
  "Repertory",
  "Practice of Medicine",
  "Gynecology & Obstetrics",
  "Surgery",
  "Homeopathic Pharmacy",
  "Community Medicine"
];

const MIASMS = ["psora", "sycosis", "syphilis", "tubercular", "mixed"];

const MEDICINE_FORMS = ["dilution", "mother_tincture", "globules", "tablets", "ointment", "other"];

export default function Hospital() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = getUser();
  const isDocOrAdmin = user?.role === "faculty" || user?.role === "admin";
  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = useState<"patients" | "appointments" | "case_taking" | "pharmacy" | "prescriptions" | "postings">("patients");

  // Patients states & queries
  const [patientSearch, setPatientSearch] = useState("");
  const [patientTypeFilter, setPatientTypeFilter] = useState("");
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [patientForm, setPatientForm] = useState({
    name: "",
    age: "",
    gender: "male",
    contact: "",
    address: "",
    type: "OPD",
    department: "Materia Medica",
    wardNo: "",
    bedNo: "",
  });

  const { data: patientsData, isLoading: loadingPatients } = useQuery({
    queryKey: ["patients", patientSearch, patientTypeFilter],
    queryFn: () => {
      const p: Record<string, string> = {};
      if (patientSearch) p.search = patientSearch;
      if (patientTypeFilter) p.type = patientTypeFilter;
      return medicalApi.getPatients(p);
    },
  });
  const patients = patientsData?.data?.docs || [];

  // Appointments states & queries
  const [showAddAppt, setShowAddAppt] = useState(false);
  const [apptForm, setApptForm] = useState({
    patientId: "",
    doctorId: "",
    studentId: "",
    dateTime: "",
    symptoms: "",
  });

  const { data: apptsData, isLoading: loadingAppts } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => medicalApi.getAppointments(),
  });
  const appointments = apptsData?.data?.docs || [];

  // Case taking states & queries
  const [showAddCase, setShowAddCase] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [caseForm, setCaseForm] = useState({
    chiefComplaints: "",
    pastHistory: "",
    familyHistory: "",
    appetite: "",
    thirst: "",
    desires: "",
    aversions: "",
    thermalRelation: "ambothermal",
    sleep: "",
    dreams: "",
    perspiration: "",
    mentalGenerals: "",
    miasmaticAnalysis: "psora",
    repertorization: "",
    remedySelectionReason: "",
  });

  const { data: casesData, isLoading: loadingCases } = useQuery({
    queryKey: ["case-records"],
    queryFn: () => medicalApi.getCaseRecords(),
  });
  const caseRecords = casesData?.data?.docs || [];

  // Follow-up state
  const [showFollowUpId, setShowFollowUpId] = useState<string | null>(null);
  const [followUpForm, setFollowUpForm] = useState({
    statusDetails: "",
    remedyPrescribed: "",
    potencyPrescribed: "",
  });

  // Pharmacy Stock states & queries
  const [medicineSearch, setMedicineSearch] = useState("");
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [medicineForm, setMedicineForm] = useState({
    name: "",
    potency: "",
    form: "globules",
    quantity: "",
    unit: "bottles",
    price: "",
    minStockLevel: "5",
  });

  const { data: medicinesData, isLoading: loadingMedicines } = useQuery({
    queryKey: ["medicines", medicineSearch],
    queryFn: () => {
      const p: Record<string, string> = {};
      if (medicineSearch) p.search = medicineSearch;
      return medicalApi.getMedicines(p);
    },
  });
  const medicines = medicinesData?.data?.docs || [];

  // Prescriptions states & queries
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: "",
    symptoms: "",
    diagnosis: "",
    labTests: "",
    studentId: "",
    items: [{ medicineName: "", potency: "", dosage: "4 globules", frequency: "thrice daily", duration: "7 days", instruction: "on empty stomach" }]
  });

  const { data: prescriptionsData, isLoading: loadingPrescriptions } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: () => medicalApi.getPrescriptions(),
  });
  const prescriptions = prescriptionsData?.data?.docs || [];

  // Clinical Postings states & queries
  const [showAddPosting, setShowAddPosting] = useState(false);
  const [postingForm, setPostingForm] = useState({
    student: "",
    department: "Materia Medica",
    startDate: "",
    endDate: "",
    supervisor: "",
    totalDays: "15",
  });

  const { data: postingsData, isLoading: loadingPostings } = useQuery({
    queryKey: ["postings"],
    queryFn: () => medicalApi.getClinicalPostings(),
  });
  const postings = postingsData?.data?.docs || [];

  // Mutations
  const createPatientMut = useMutation({
    mutationFn: medicalApi.createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast({ title: "Patient Registered Successfully", description: "OPD/IPD entry created successfully" });
      setShowAddPatient(false);
      setPatientForm({
        name: "", age: "", gender: "male", contact: "", address: "", type: "OPD", department: "Materia Medica", wardNo: "", bedNo: ""
      });
    },
    onError: (err: any) => {
      toast({ title: "Registration Failed", description: err.message, variant: "destructive" });
    }
  });

  const createApptMut = useMutation({
    mutationFn: medicalApi.createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "Appointment Scheduled", description: "Consultation slot and token created" });
      setShowAddAppt(false);
      setApptForm({ patientId: "", doctorId: "", studentId: "", dateTime: "", symptoms: "" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to Schedule", description: err.message, variant: "destructive" });
    }
  });

  const createCaseMut = useMutation({
    mutationFn: medicalApi.createCaseRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-records"] });
      toast({ title: "Case Sheet Saved", description: "Homeopathic clinical history record created" });
      setShowAddCase(false);
      setCaseForm({
        chiefComplaints: "", pastHistory: "", familyHistory: "", appetite: "", thirst: "", desires: "", aversions: "", thermalRelation: "ambothermal", sleep: "", dreams: "", perspiration: "", mentalGenerals: "", miasmaticAnalysis: "psora", repertorization: "", remedySelectionReason: ""
      });
    },
    onError: (err: any) => {
      toast({ title: "Failed to save Case record", description: err.message, variant: "destructive" });
    }
  });

  const addFollowUpMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => medicalApi.addFollowUp(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-records"] });
      toast({ title: "Follow Up Logged", description: "Added to the patient's case history sheet" });
      setShowFollowUpId(null);
      setFollowUpForm({ statusDetails: "", remedyPrescribed: "", potencyPrescribed: "" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to log follow-up", description: err.message, variant: "destructive" });
    }
  });

  const createMedicineMut = useMutation({
    mutationFn: medicalApi.createMedicine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast({ title: "Remedy Added to stock", description: "Homeopathic drug inventory updated" });
      setShowAddMedicine(false);
      setMedicineForm({ name: "", potency: "", form: "globules", quantity: "", unit: "bottles", price: "", minStockLevel: "5" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to add remedy", description: err.message, variant: "destructive" });
    }
  });

  const createPrescriptionMut = useMutation({
    mutationFn: (data: any) => {
      const formatted = {
        patientId: data.patientId,
        studentId: data.studentId || undefined,
        symptoms: data.symptoms,
        diagnosis: data.diagnosis || "",
        labTests: data.labTests ? data.labTests.split(",").map((s: string) => s.trim()) : [],
        medicines: data.items,
      };
      return medicalApi.createPrescription(formatted);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      toast({ title: "Prescription Created", description: "Awaiting dispensing at homeopathic pharmacy counter" });
      setShowAddPrescription(false);
      setPrescriptionForm({
        patientId: "", symptoms: "", diagnosis: "", labTests: "", studentId: "", items: [{ medicineName: "", potency: "", dosage: "4 globules", frequency: "thrice daily", duration: "7 days", instruction: "on empty stomach" }]
      });
    },
    onError: (err: any) => {
      toast({ title: "Failed to prescribe", description: err.message, variant: "destructive" });
    }
  });

  const dispensePrescriptionMut = useMutation({
    mutationFn: medicalApi.dispensePrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast({ title: "Prescription Dispensed", description: "Deducted remedy stock quantities from Pharmacy Inventory successfully!" });
    },
    onError: (err: any) => {
      toast({ title: "Dispensing Failed", description: err.message, variant: "destructive" });
    }
  });

  const createPostingMut = useMutation({
    mutationFn: medicalApi.createClinicalPosting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postings"] });
      toast({ title: "Clinical Rotation Posted", description: "Student intern assigned clinical post successfully" });
      setShowAddPosting(false);
      setPostingForm({ student: "", department: "Materia Medica", startDate: "", endDate: "", supervisor: "", totalDays: "15" });
    },
    onError: (err: any) => {
      toast({ title: "Posting Failed", description: err.message, variant: "destructive" });
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Homeopathic Hospital & Clinical ERP</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Dual hospital-college integrated clinical records, pharmacy dispensing, OPD registries, and rotation schedules.
        </p>
      </div>

      {/* Hospital KPI Mini Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase">OPD / IPD Patients</p>
              <h3 className="text-xl font-bold">{patients.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase">Appointments</p>
              <h3 className="text-xl font-bold">{appointments.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-xl shrink-0">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase">Pharmacy Remedies</p>
              <h3 className="text-xl font-bold">{medicines.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl shrink-0">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase">Pending Prescriptions</p>
              <h3 className="text-xl font-bold">{prescriptions.filter((p: any) => !p.dispensed).length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs list */}
      <div className="flex overflow-x-auto gap-2 border-b pb-px scrollbar-none">
        {[
          { id: "patients", label: "Patient Admission & OPD", icon: Users },
          { id: "appointments", label: "Consultation Schedules", icon: Calendar },
          { id: "case_taking", label: "Clinical Case Sheets", icon: FileSpreadsheet },
          { id: "pharmacy", label: "Pharmacy Stock", icon: Package },
          { id: "prescriptions", label: "Prescriptions & Dispense", icon: ShoppingBag },
          { id: "postings", label: "Clinical Postings", icon: BookOpen },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panels */}
      {activeTab === "patients" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 text-sm"
                  placeholder="Search by patient name, case sequence..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>
              <select
                className="h-10 text-sm border border-input bg-background rounded-lg px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                value={patientTypeFilter}
                onChange={(e) => setPatientTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="OPD">OPD (Outpatient)</option>
                <option value="IPD">IPD (Inpatient)</option>
              </select>
            </div>
            <Button onClick={() => setShowAddPatient(!showAddPatient)} className="text-xs">
              <Plus className="w-4 h-4 mr-1.5" /> Register Patient
            </Button>
          </div>

          {showAddPatient && (
            <Card className="bg-muted/10 border border-primary/20">
              <CardHeader className="py-4">
                <CardTitle className="text-base font-bold">New Patient Intake (OPD/IPD Registration)</CardTitle>
                <CardDescription className="text-xs">
                  Create a physical card file sequence inside the cloud database for patient diagnostic logging.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Full Name</label>
                    <Input
                      placeholder="Jane Doe"
                      className="text-xs"
                      value={patientForm.name}
                      onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Age</label>
                    <Input
                      type="number"
                      placeholder="35"
                      className="text-xs"
                      value={patientForm.age}
                      onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Gender</label>
                    <select
                      className="w-full h-9 text-xs border border-input rounded-lg px-2 bg-background focus:ring-1 focus:ring-primary"
                      value={patientForm.gender}
                      onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Phone Contact</label>
                    <Input
                      placeholder="9876543210"
                      className="text-xs"
                      value={patientForm.contact}
                      onChange={(e) => setPatientForm({ ...patientForm, contact: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Intake Registry Type</label>
                    <select
                      className="w-full h-9 text-xs border border-input rounded-lg px-2 bg-background"
                      value={patientForm.type}
                      onChange={(e) => setPatientForm({ ...patientForm, type: e.target.value })}
                    >
                      <option value="OPD">OPD (Outpatient)</option>
                      <option value="IPD">IPD (Inpatient)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Assigned Clinical Unit</label>
                    <select
                      className="w-full h-9 text-xs border border-input rounded-lg px-2 bg-background"
                      value={patientForm.department}
                      onChange={(e) => setPatientForm({ ...patientForm, department: e.target.value })}
                    >
                      {CLINICAL_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {patientForm.type === "IPD" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl">
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Ward No.</label>
                      <Input
                        placeholder="General Ward A"
                        className="text-xs"
                        value={patientForm.wardNo}
                        onChange={(e) => setPatientForm({ ...patientForm, wardNo: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Bed No.</label>
                      <Input
                        placeholder="Bed #14"
                        className="text-xs"
                        value={patientForm.bedNo}
                        onChange={(e) => setPatientForm({ ...patientForm, bedNo: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold mb-1 block">Home Address</label>
                  <Input
                    placeholder="123 Street Name, Town"
                    className="text-xs"
                    value={patientForm.address}
                    onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" size="xs" onClick={() => setShowAddPatient(false)}>Cancel</Button>
                  <Button
                    size="xs"
                    onClick={() => createPatientMut.mutate(patientForm)}
                    disabled={createPatientMut.isPending}
                  >
                    {createPatientMut.isPending ? "Registering..." : "Submit Registration"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loadingPatients ? (
            <div className="space-y-2">{[1, 2, 3].map((n) => <Skeleton key={n} className="h-16 w-full rounded-xl" />)}</div>
          ) : patients.length === 0 ? (
            <Card className="text-center py-10 text-muted-foreground">
              <Stethoscope className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">No Patient Records found</p>
              <p className="text-xs">Complete a registration form above to seed the registry.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {patients.map((p: any) => (
                <Card key={p._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{p.name}</h4>
                        <Badge variant="outline" className="text-[10px] py-px uppercase font-mono">
                          {p.caseNumber}
                        </Badge>
                        <Badge className={`text-[9px] ${p.type === "IPD" ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"}`}>
                          {p.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {p.age} years · {p.gender} · Contact: {p.contact || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Clinical Unit: <span className="font-semibold">{p.department}</span>
                        {p.type === "IPD" && p.wardNo && ` · Ward: ${p.wardNo} (Bed: ${p.bedNo})`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          setSelectedPatientId(p._id);
                          setActiveTab("case_taking");
                          setShowAddCase(true);
                        }}
                      >
                        <FileSpreadsheet className="w-3 h-3 mr-1" /> New Case Sheet
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          setPrescriptionForm({ ...prescriptionForm, patientId: p._id });
                          setActiveTab("prescriptions");
                          setShowAddPrescription(true);
                        }}
                      >
                        <ShoppingBag className="w-3.5 h-3.5 mr-1" /> Prescribe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "appointments" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-foreground">OPD Token Appointments</h3>
            <Button onClick={() => setShowAddAppt(!showAddAppt)} size="xs">
              <Plus className="w-4 h-4 mr-1.5" /> New Appointment
            </Button>
          </div>

          {showAddAppt && (
            <Card className="border-primary/20 bg-muted/10">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Select Patient</label>
                    <select
                      className="w-full h-9 text-xs border border-input rounded-lg px-2 bg-background focus:ring-1 focus:ring-primary"
                      value={apptForm.patientId}
                      onChange={(e) => setApptForm({ ...apptForm, patientId: e.target.value })}
                    >
                      <option value="">-- Choose Patient --</option>
                      {patients.map((p: any) => (
                        <option key={p._id} value={p._id}>{p.name} ({p.caseNumber})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Scheduled Consultant (Doctor)</label>
                    <Input
                      placeholder="Doctor / Faculty Object ID"
                      className="text-xs"
                      value={apptForm.doctorId}
                      onChange={(e) => setApptForm({ ...apptForm, doctorId: e.target.value })}
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Faculty/Consultant MongoDB ID</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Appointment Date & Time</label>
                    <Input
                      type="datetime-local"
                      className="text-xs"
                      value={apptForm.dateTime}
                      onChange={(e) => setApptForm({ ...apptForm, dateTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Assisting Intern (Student ID)</label>
                    <Input
                      placeholder="Intern User MongoDB ID (Optional)"
                      className="text-xs"
                      value={apptForm.studentId}
                      onChange={(e) => setApptForm({ ...apptForm, studentId: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Presenting Chief Complaints (Brief)</label>
                  <Input
                    placeholder="Short summary of pain, fever, etc."
                    className="text-xs"
                    value={apptForm.symptoms}
                    onChange={(e) => setApptForm({ ...apptForm, symptoms: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" size="xs" onClick={() => setShowAddAppt(false)}>Cancel</Button>
                  <Button
                    size="xs"
                    onClick={() => createApptMut.mutate(apptForm)}
                    disabled={createApptMut.isPending}
                  >
                    {createApptMut.isPending ? "Scheduling..." : "Schedule & Issue Token"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loadingAppts ? (
            <div className="space-y-2">{[1, 2].map((n) => <Skeleton key={n} className="h-16 w-full rounded-xl" />)}</div>
          ) : appointments.length === 0 ? (
            <Card className="text-center py-10 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">No Appointments found</p>
              <p className="text-xs">Schedule an outpatient consultation to generate daily tokens.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {appointments.map((a: any) => (
                <Card key={a._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5">
                          Daily Token #{a.tokenNumber}
                        </Badge>
                      </div>
                      <Badge className={`text-[9px] uppercase ${a.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {a.status}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-foreground">
                        Patient: {a.patient?.name || "—"} ({a.patient?.caseNumber || "—"})
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        {new Date(a.dateTime).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Doctor: <span className="font-semibold text-foreground">{a.doctor?.name || "—"}</span>
                      </p>
                      {a.student && (
                        <p className="text-xs text-muted-foreground">
                          Assisting Intern: <span className="font-semibold">{a.student?.name}</span>
                        </p>
                      )}
                      {a.symptoms && (
                        <p className="text-xs bg-muted/30 p-2 rounded-lg italic text-muted-foreground mt-2">
                          " {a.symptoms} "
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "case_taking" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-foreground">Homeopathic Case Sheet Taking</h3>
            <Button onClick={() => setShowAddCase(!showAddCase)} size="xs">
              <Plus className="w-4 h-4 mr-1.5" /> Start New Case Taking
            </Button>
          </div>

          {showAddCase && (
            <Card className="border-primary/20 bg-muted/10">
              <CardContent className="p-4 space-y-4">
                <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                  <h4 className="text-xs font-bold text-primary uppercase mb-2">Homeopathic Diagnostic Methodology</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Homeopathy relies on individualization. Please capture complaints with **Location, Sensation, Modality, and Concomitants (LSM-C)**, followed by deep Physical/Mental generals to locate the Simillimum.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Select Patient File</label>
                    <select
                      className="w-full h-9 text-xs border border-input rounded-lg px-2 bg-background"
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                    >
                      <option value="">-- Choose Patient --</option>
                      {patients.map((p: any) => (
                        <option key={p._id} value={p._id}>{p.name} ({p.caseNumber})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Miasmatic Analysis</label>
                    <select
                      className="w-full h-9 text-xs border border-input rounded-lg px-2 bg-background capitalize"
                      value={caseForm.miasmaticAnalysis}
                      onChange={(e) => setCaseForm({ ...caseForm, miasmaticAnalysis: e.target.value })}
                    >
                      {MIASMS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-primary mb-1 block">1. Chief Complaints (LSM-C Grid details)</label>
                    <textarea
                      rows={3}
                      className="w-full p-2.5 text-xs border border-input rounded-lg bg-background"
                      placeholder="Describe symptoms including location, sensation, modality (what makes it better/worse), and concomitants..."
                      value={caseForm.chiefComplaints}
                      onChange={(e) => setCaseForm({ ...caseForm, chiefComplaints: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Past History</label>
                      <textarea
                        rows={2}
                        className="w-full p-2 text-xs border border-input rounded-lg bg-background"
                        placeholder="Childhood illnesses, major surgeries, suppression of skin eruptions..."
                        value={caseForm.pastHistory}
                        onChange={(e) => setCaseForm({ ...caseForm, pastHistory: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Family History</label>
                      <textarea
                        rows={2}
                        className="w-full p-2 text-xs border border-input rounded-lg bg-background"
                        placeholder="Tuberculosis, cancer, asthma, cardiac illnesses in bloodline..."
                        value={caseForm.familyHistory}
                        onChange={(e) => setCaseForm({ ...caseForm, familyHistory: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-primary mb-2">2. Physical Generals</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-muted/40 p-3 rounded-xl border">
                      <div>
                        <label className="text-[11px] font-semibold mb-1 block">Appetite</label>
                        <Input
                          placeholder="Easy satiety / canine hunger"
                          className="text-xs"
                          value={caseForm.appetite}
                          onChange={(e) => setCaseForm({ ...caseForm, appetite: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold mb-1 block">Thirst</label>
                        <Input
                          placeholder="Thirstless with dry tongue"
                          className="text-xs"
                          value={caseForm.thirst}
                          onChange={(e) => setCaseForm({ ...caseForm, thirst: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold mb-1 block">Desires (Craving)</label>
                        <Input
                          placeholder="Sweets, spicy foods, salt"
                          className="text-xs"
                          value={caseForm.desires}
                          onChange={(e) => setCaseForm({ ...caseForm, desires: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold mb-1 block">Aversions</label>
                        <Input
                          placeholder="Fat, milk, warm food"
                          className="text-xs"
                          value={caseForm.aversions}
                          onChange={(e) => setCaseForm({ ...caseForm, aversions: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-muted/40 p-3 rounded-xl border mt-3">
                      <div>
                        <label className="text-[11px] font-semibold mb-1 block">Thermal Relation</label>
                        <select
                          className="w-full h-9 text-xs border border-input rounded-lg px-2 bg-background capitalize"
                          value={caseForm.thermalRelation}
                          onChange={(e) => setCaseForm({ ...caseForm, thermalRelation: e.target.value })}
                        >
                          <option value="ambothermal">Ambothermal</option>
                          <option value="hot">Hot (intolerant to heat)</option>
                          <option value="chilly">Chilly (intolerant to cold)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold mb-1 block">Sleep Pattern</label>
                        <Input
                          placeholder="Restless, sleep on abdomen"
                          className="text-xs"
                          value={caseForm.sleep}
                          onChange={(e) => setCaseForm({ ...caseForm, sleep: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold mb-1 block">Dreams</label>
                        <Input
                          placeholder="Falling from height, ghosts"
                          className="text-xs"
                          value={caseForm.dreams}
                          onChange={(e) => setCaseForm({ ...caseForm, dreams: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold mb-1 block">Perspiration</label>
                        <Input
                          placeholder="Profuse on head/neck"
                          className="text-xs"
                          value={caseForm.perspiration}
                          onChange={(e) => setCaseForm({ ...caseForm, perspiration: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-primary mb-1 block">3. Mental Generals (Temperament, Fears, Mood)</label>
                    <textarea
                      rows={2}
                      className="w-full p-2.5 text-xs border border-input rounded-lg bg-background"
                      placeholder="Consolation makes complaints worse, irritable temperament, fear of dark, etc."
                      value={caseForm.mentalGenerals}
                      onChange={(e) => setCaseForm({ ...caseForm, mentalGenerals: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Repertorization (Rubrics Sheet)</label>
                      <textarea
                        rows={2}
                        className="w-full p-2 text-xs border border-input rounded-lg bg-background"
                        placeholder="Enter selected rubrics from Kent, Boenninghausen, or Murphy repertories..."
                        value={caseForm.repertorization}
                        onChange={(e) => setCaseForm({ ...caseForm, repertorization: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Remedy Justification (Simillimum selection reason)</label>
                      <textarea
                        rows={2}
                        className="w-full p-2 text-xs border border-input rounded-lg bg-background"
                        placeholder="Why was this specific remedy prescribed over other similar remedies?"
                        value={caseForm.remedySelectionReason}
                        onChange={(e) => setCaseForm({ ...caseForm, remedySelectionReason: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" size="xs" onClick={() => setShowAddCase(false)}>Cancel</Button>
                  <Button
                    size="xs"
                    onClick={() => {
                      if (!selectedPatientId) {
                        toast({ title: "Validation Error", description: "Please select a patient first", variant: "destructive" });
                        return;
                      }
                      createCaseMut.mutate({
                        patientId: selectedPatientId,
                        chiefComplaints: caseForm.chiefComplaints,
                        pastHistory: caseForm.pastHistory,
                        familyHistory: caseForm.familyHistory,
                        physicalGenerals: {
                          appetite: caseForm.appetite,
                          thirst: caseForm.thirst,
                          desires: caseForm.desires,
                          aversions: caseForm.aversions,
                          thermalRelation: caseForm.thermalRelation,
                          sleep: caseForm.sleep,
                          dreams: caseForm.dreams,
                          perspiration: caseForm.perspiration,
                        },
                        mentalGenerals: caseForm.mentalGenerals,
                        miasmaticAnalysis: caseForm.miasmaticAnalysis,
                        repertorization: caseForm.repertorization,
                        remedySelectionReason: caseForm.remedySelectionReason,
                      });
                    }}
                    disabled={createCaseMut.isPending}
                  >
                    {createCaseMut.isPending ? "Saving..." : "Save Case Record Sheet"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loadingCases ? (
            <div className="space-y-2">{[1, 2].map((n) => <Skeleton key={n} className="h-16 w-full rounded-xl" />)}</div>
          ) : caseRecords.length === 0 ? (
            <Card className="text-center py-10 text-muted-foreground">
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">No Case Sheets on file</p>
              <p className="text-xs">Start a KENT repertorization sheet or homeopathic case-take session above.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {caseRecords.map((cr: any) => (
                <Card key={cr._id} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-sm font-bold text-foreground">
                          Case Sheet: {cr.patient?.name || "—"} ({cr.patient?.caseNumber || "—"})
                        </CardTitle>
                        <CardDescription className="text-xs font-semibold">
                          Case taker: {cr.caseTaker?.name} ({cr.caseTaker?.role}) · Registered {new Date(cr.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className="bg-primary/10 text-primary uppercase text-[9px]">
                        {cr.miasmaticAnalysis} miasm
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0 text-xs">
                    <div className="p-2.5 bg-muted/40 rounded-lg">
                      <p className="font-bold text-primary text-[11px] uppercase mb-1">Chief Complaints (LSM-C detail)</p>
                      <p className="text-muted-foreground whitespace-pre-wrap">{cr.chiefComplaints}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cr.mentalGenerals && (
                        <div>
                          <p className="font-bold text-foreground">Mental Generals</p>
                          <p className="text-muted-foreground">{cr.mentalGenerals}</p>
                        </div>
                      )}
                      {cr.remedySelectionReason && (
                        <div>
                          <p className="font-bold text-foreground">Selection Reason (Simillimum)</p>
                          <p className="text-muted-foreground">{cr.remedySelectionReason}</p>
                        </div>
                      )}
                    </div>

                    {cr.followUps && cr.followUps.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <p className="font-bold text-primary flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Follow Up Logs ({cr.followUps.length})
                        </p>
                        <div className="space-y-1.5 pl-3 border-l-2">
                          {cr.followUps.map((f: any, idx: number) => (
                            <div key={idx} className="bg-muted/30 p-2 rounded-lg">
                              <span className="text-[10px] text-muted-foreground block font-mono">
                                {new Date(f.date).toLocaleDateString()} · Follow-up #{idx + 1}
                              </span>
                              <p className="text-foreground">{f.statusDetails}</p>
                              {f.remedyPrescribed && (
                                <p className="text-[10px] text-emerald-600 font-bold mt-1">
                                  Remedy: {f.remedyPrescribed} ({f.potencyPrescribed})
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <Button
                        size="xs"
                        variant="outline"
                        className="text-[10px] h-7"
                        onClick={() => setShowFollowUpId(cr._id)}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add Follow Up Entry
                      </Button>
                    </div>

                    {showFollowUpId === cr._id && (
                      <Card className="bg-muted/10 border-primary/20 mt-3">
                        <CardContent className="p-3 space-y-2">
                          <p className="font-bold text-[11px]">New Follow-Up Status Log</p>
                          <textarea
                            className="w-full p-2 text-xs border bg-background rounded-lg"
                            rows={2}
                            placeholder="Amelioration / aggravation details, energy level updates..."
                            value={followUpForm.statusDetails}
                            onChange={(e) => setFollowUpForm({ ...followUpForm, statusDetails: e.target.value })}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="New Remedy (e.g. Sulphur)"
                              className="text-xs"
                              value={followUpForm.remedyPrescribed}
                              onChange={(e) => setFollowUpForm({ ...followUpForm, remedyPrescribed: e.target.value })}
                            />
                            <Input
                              placeholder="Potency (e.g. 200C)"
                              className="text-xs"
                              value={followUpForm.potencyPrescribed}
                              onChange={(e) => setFollowUpForm({ ...followUpForm, potencyPrescribed: e.target.value })}
                            />
                          </div>
                          <div className="flex gap-2 justify-end pt-1">
                            <Button size="xs" variant="outline" onClick={() => setShowFollowUpId(null)}>Cancel</Button>
                            <Button
                              size="xs"
                              onClick={() => {
                                if (!followUpForm.statusDetails) {
                                  toast({ title: "Missing status details", variant: "destructive" });
                                  return;
                                }
                                addFollowUpMut.mutate({ id: cr._id, data: followUpForm });
                              }}
                              disabled={addFollowUpMut.isPending}
                            >
                              {addFollowUpMut.isPending ? "Logging..." : "Save Entry"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "pharmacy" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 text-sm"
                placeholder="Search homeopathic remedies (Aconite, Lyco...)"
                value={medicineSearch}
                onChange={(e) => setMedicineSearch(e.target.value)}
              />
            </div>
            {isDocOrAdmin && (
              <Button onClick={() => setShowAddMedicine(!showAddMedicine)} size="xs">
                <Plus className="w-4 h-4 mr-1.5" /> Stock New Remedy
              </Button>
            )}
          </div>

          {showAddMedicine && (
            <Card className="border-primary/20 bg-muted/10">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Remedy Name</label>
                    <Input
                      placeholder="Arsenicum album"
                      className="text-xs"
                      value={medicineForm.name}
                      onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Potency / Scale</label>
                    <Input
                      placeholder="30C / 200C / Q"
                      className="text-xs"
                      value={medicineForm.potency}
                      onChange={(e) => setMedicineForm({ ...medicineForm, potency: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Remedy Form</label>
                    <select
                      className="w-full h-9 text-xs border border-input rounded-lg px-2 bg-background"
                      value={medicineForm.form}
                      onChange={(e) => setMedicineForm({ ...medicineForm, form: e.target.value })}
                    >
                      {MEDICINE_FORMS.map((f) => (
                        <option key={f} value={f}>{f.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Quantity (In stock)</label>
                    <Input
                      type="number"
                      placeholder="10"
                      className="text-xs"
                      value={medicineForm.quantity}
                      onChange={(e) => setMedicineForm({ ...medicineForm, quantity: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Stock Unit</label>
                    <Input
                      placeholder="bottles / grams"
                      className="text-xs"
                      value={medicineForm.unit}
                      onChange={(e) => setMedicineForm({ ...medicineForm, unit: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Price ($)</label>
                    <Input
                      type="number"
                      placeholder="5"
                      className="text-xs"
                      value={medicineForm.price}
                      onChange={(e) => setMedicineForm({ ...medicineForm, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Alert Min Stock Level</label>
                    <Input
                      type="number"
                      placeholder="5"
                      className="text-xs"
                      value={medicineForm.minStockLevel}
                      onChange={(e) => setMedicineForm({ ...medicineForm, minStockLevel: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" size="xs" onClick={() => setShowAddMedicine(false)}>Cancel</Button>
                  <Button
                    size="xs"
                    onClick={() => {
                      if (!medicineForm.name || !medicineForm.potency) {
                        toast({ title: "Validation Error", description: "Name and Potency are required", variant: "destructive" });
                        return;
                      }
                      createMedicineMut.mutate({
                        name: medicineForm.name,
                        potency: medicineForm.potency,
                        form: medicineForm.form,
                        quantity: Number(medicineForm.quantity) || 0,
                        unit: medicineForm.unit,
                        price: Number(medicineForm.price) || 0,
                        minStockLevel: Number(medicineForm.minStockLevel) || 5,
                      });
                    }}
                    disabled={createMedicineMut.isPending}
                  >
                    {createMedicineMut.isPending ? "Stocking..." : "Update Stock Inventory"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loadingMedicines ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-28 rounded-xl" />)}
            </div>
          ) : medicines.length === 0 ? (
            <Card className="text-center py-10 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">Pharmacy Inventory is empty</p>
              <p className="text-xs">Add standard Mother Tinctures or Dilutions to manage stock.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {medicines.map((m: any) => {
                const isLowStock = m.quantity <= m.minStockLevel;
                return (
                  <Card key={m._id} className={`shadow-sm border ${isLowStock ? "border-amber-300 bg-amber-50/20 dark:border-amber-700/50" : "border-border"}`}>
                    <CardContent className="p-3.5 space-y-1 text-center">
                      <Badge variant="outline" className="text-[9px] uppercase font-mono tracking-wider">
                        {m.form}
                      </Badge>
                      <h4 className="font-bold text-xs truncate text-foreground">{m.name}</h4>
                      <p className="text-primary font-bold text-[11px] bg-primary/5 py-1 rounded-md">
                        Potency: {m.potency}
                      </p>
                      <div className="pt-2 text-[11px] text-muted-foreground">
                        Count: <span className={`font-extrabold ${isLowStock ? "text-amber-600 font-black" : "text-foreground"}`}>
                          {m.quantity} {m.unit}
                        </span>
                        {isLowStock && (
                          <span className="flex items-center justify-center gap-1 text-[9px] text-amber-600 font-bold mt-1">
                            <AlertTriangle className="w-3 h-3" /> Low Stock Warning
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground pt-1 border-t mt-1">${m.price} per unit</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "prescriptions" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-foreground">Clinic Prescriptions</h3>
            {isDocOrAdmin && (
              <Button onClick={() => setShowAddPrescription(!showAddPrescription)} size="xs">
                <Plus className="w-4 h-4 mr-1.5" /> Write Prescription
              </Button>
            )}
          </div>

          {showAddPrescription && (
            <Card className="border-primary/20 bg-muted/10">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Patient File Link</label>
                    <select
                      className="w-full h-9 text-xs border border-input rounded-lg px-2 bg-background focus:ring-1 focus:ring-primary"
                      value={prescriptionForm.patientId}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, patientId: e.target.value })}
                    >
                      <option value="">-- Choose Patient --</option>
                      {patients.map((p: any) => (
                        <option key={p._id} value={p._id}>{p.name} ({p.caseNumber})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Clinical Symptoms</label>
                    <Input
                      placeholder="e.g. Throbbing head pain worse from motion"
                      className="text-xs"
                      value={prescriptionForm.symptoms}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, symptoms: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Miasm / Diagnosis</label>
                    <Input
                      placeholder="e.g. Psora/Migraine"
                      className="text-xs"
                      value={prescriptionForm.diagnosis}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, diagnosis: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Advisory Laboratory Tests</label>
                    <Input
                      placeholder="e.g. CBC, Lipid Profile, Blood Glucose (comma separated)"
                      className="text-xs"
                      value={prescriptionForm.labTests}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, labTests: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Assisting Intern (Student ID)</label>
                    <Input
                      placeholder="Intern User MongoDB ID (Optional)"
                      className="text-xs"
                      value={prescriptionForm.studentId}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, studentId: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2 border-t pt-2">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-primary">Homeopathic Remedy Selection Grid</p>
                    <Button
                      size="xs"
                      variant="outline"
                      className="h-7 text-[10px]"
                      onClick={() => setPrescriptionForm({
                        ...prescriptionForm,
                        items: [...prescriptionForm.items, { medicineName: "", potency: "", dosage: "4 globules", frequency: "thrice daily", duration: "7 days", instruction: "on empty stomach" }]
                      })}
                    >
                      + Add Remedy Line
                    </Button>
                  </div>

                  {prescriptionForm.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-muted/40 p-2.5 rounded-lg">
                      <div>
                        <label className="text-[10px] text-muted-foreground block">Remedy</label>
                        <Input
                          placeholder="Belladonna"
                          className="h-8 text-[11px]"
                          value={item.medicineName}
                          onChange={(e) => {
                            const newItems = [...prescriptionForm.items];
                            newItems[idx].medicineName = e.target.value;
                            setPrescriptionForm({ ...prescriptionForm, items: newItems });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block">Potency</label>
                        <Input
                          placeholder="30C / 200C"
                          className="h-8 text-[11px]"
                          value={item.potency}
                          onChange={(e) => {
                            const newItems = [...prescriptionForm.items];
                            newItems[idx].potency = e.target.value;
                            setPrescriptionForm({ ...prescriptionForm, items: newItems });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block">Dosage</label>
                        <Input
                          placeholder="4 globules"
                          className="h-8 text-[11px]"
                          value={item.dosage}
                          onChange={(e) => {
                            const newItems = [...prescriptionForm.items];
                            newItems[idx].dosage = e.target.value;
                            setPrescriptionForm({ ...prescriptionForm, items: newItems });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block">Frequency</label>
                        <Input
                          placeholder="thrice daily"
                          className="h-8 text-[11px]"
                          value={item.frequency}
                          onChange={(e) => {
                            const newItems = [...prescriptionForm.items];
                            newItems[idx].frequency = e.target.value;
                            setPrescriptionForm({ ...prescriptionForm, items: newItems });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block">Duration</label>
                        <Input
                          placeholder="7 days"
                          className="h-8 text-[11px]"
                          value={item.duration}
                          onChange={(e) => {
                            const newItems = [...prescriptionForm.items];
                            newItems[idx].duration = e.target.value;
                            setPrescriptionForm({ ...prescriptionForm, items: newItems });
                          }}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          size="xs"
                          variant="destructive"
                          className="h-8 w-full"
                          onClick={() => {
                            const newItems = prescriptionForm.items.filter((_, i) => i !== idx);
                            setPrescriptionForm({ ...prescriptionForm, items: newItems });
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" size="xs" onClick={() => setShowAddPrescription(false)}>Cancel</Button>
                  <Button
                    size="xs"
                    onClick={() => {
                      if (!prescriptionForm.patientId || !prescriptionForm.symptoms) {
                        toast({ title: "Validation Error", description: "Patient and symptoms are required", variant: "destructive" });
                        return;
                      }
                      createPrescriptionMut.mutate(prescriptionForm);
                    }}
                    disabled={createPrescriptionMut.isPending}
                  >
                    {createPrescriptionMut.isPending ? "Creating..." : "Transmit Prescription to Pharmacy"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loadingPrescriptions ? (
            <div className="space-y-2">{[1, 2].map((n) => <Skeleton key={n} className="h-16 w-full rounded-xl" />)}</div>
          ) : prescriptions.length === 0 ? (
            <Card className="text-center py-10 text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">No Prescriptions logged</p>
              <p className="text-xs">Write a homeopathic remedy prescription above to trigger pharmacy dispatch flows.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((p: any) => (
                <Card key={p._id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="py-3 bg-muted/20 border-b">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div>
                        <CardTitle className="text-xs sm:text-sm font-bold text-foreground">
                          Prescription for: {p.patient?.name || "—"} ({p.patient?.caseNumber || "—"})
                        </CardTitle>
                        <CardDescription className="text-[10px] font-semibold">
                          Consultant: {p.doctor?.name || "—"} · Filed {new Date(p.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className={`text-[10px] self-start sm:self-center uppercase ${p.dispensed ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"}`}>
                        {p.dispensed ? "Dispensed / Dispatched" : "Awaiting Dispatch"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 text-xs">
                    <div>
                      <p className="font-bold text-muted-foreground text-[10px] uppercase">Presenting Symptoms / Miasm Diagnosis</p>
                      <p className="text-foreground">{p.symptoms} {p.diagnosis && `· Diagnosis: ${p.diagnosis}`}</p>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-muted/40 text-[10px] text-muted-foreground border-b font-mono">
                            <th className="p-2">Remedy Name</th>
                            <th className="p-2">Potency</th>
                            <th className="p-2">Dosage</th>
                            <th className="p-2">Frequency</th>
                            <th className="p-2">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-[11px]">
                          {p.medicines?.map((m: any, idx: number) => (
                            <tr key={idx} className="hover:bg-muted/20">
                              <td className="p-2 font-bold text-primary">{m.medicineName}</td>
                              <td className="p-2">{m.potency}</td>
                              <td className="p-2">{m.dosage}</td>
                              <td className="p-2">{m.frequency}</td>
                              <td className="p-2">{m.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {p.labTests && p.labTests.length > 0 && (
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 rounded-lg">
                        <span className="font-bold text-[10px] block uppercase">Laboratory / Diagnostic Investigations Advised:</span>
                        <p>{p.labTests.join(", ")}</p>
                      </div>
                    )}

                    {!p.dispensed && isDocOrAdmin && (
                      <div className="pt-2 flex justify-end">
                        <Button
                          size="xs"
                          onClick={() => dispensePrescriptionMut.mutate(p._id)}
                          disabled={dispensePrescriptionMut.isPending}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Dispense from Inventory (Atomic)
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "postings" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-foreground">Clinical Intern Postings</h3>
            {isAdmin && (
              <Button onClick={() => setShowAddPosting(!showAddPosting)} size="xs">
                <Plus className="w-4 h-4 mr-1.5" /> Post Clinical Rotation
              </Button>
            )}
          </div>

          {showAddPosting && (
            <Card className="border-primary/20 bg-muted/10">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Student Intern ID</label>
                    <Input
                      placeholder="Student User MongoDB ID"
                      className="text-xs"
                      value={postingForm.student}
                      onChange={(e) => setPostingForm({ ...postingForm, student: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Supervisor ID (Faculty)</label>
                    <Input
                      placeholder="Supervisor User MongoDB ID"
                      className="text-xs"
                      value={postingForm.supervisor}
                      onChange={(e) => setPostingForm({ ...postingForm, supervisor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Clinical Unit / Specialty</label>
                    <select
                      className="w-full h-9 text-xs border border-input rounded-lg px-2 bg-background"
                      value={postingForm.department}
                      onChange={(e) => setPostingForm({ ...postingForm, department: e.target.value })}
                    >
                      {CLINICAL_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Rotation Start Date</label>
                    <Input
                      type="date"
                      className="text-xs"
                      value={postingForm.startDate}
                      onChange={(e) => setPostingForm({ ...postingForm, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Rotation End Date</label>
                    <Input
                      type="date"
                      className="text-xs"
                      value={postingForm.endDate}
                      onChange={(e) => setPostingForm({ ...postingForm, endDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Total Rotation Days</label>
                    <Input
                      type="number"
                      placeholder="15"
                      className="text-xs"
                      value={postingForm.totalDays}
                      onChange={(e) => setPostingForm({ ...postingForm, totalDays: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" size="xs" onClick={() => setShowAddPosting(false)}>Cancel</Button>
                  <Button
                    size="xs"
                    onClick={() => {
                      if (!postingForm.student || !postingForm.supervisor) {
                        toast({ title: "Validation Error", description: "Student and Supervisor fields are required", variant: "destructive" });
                        return;
                      }
                      createPostingMut.mutate({
                        student: postingForm.student,
                        department: postingForm.department,
                        startDate: new Date(postingForm.startDate),
                        endDate: new Date(postingForm.endDate),
                        supervisor: postingForm.supervisor,
                        totalDays: Number(postingForm.totalDays) || 15,
                      });
                    }}
                    disabled={createPostingMut.isPending}
                  >
                    {createPostingMut.isPending ? "Posting..." : "Authorize Posting Rotation"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loadingPostings ? (
            <div className="space-y-2">{[1, 2].map((n) => <Skeleton key={n} className="h-16 w-full rounded-xl" />)}</div>
          ) : postings.length === 0 ? (
            <Card className="text-center py-10 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">No Clinical Postings scheduled</p>
              <p className="text-xs">Schedule clinical postings to allocate students rotation slots across departments.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {postings.map((p: any) => (
                <Card key={p._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <Badge className="bg-primary/10 text-primary uppercase font-bold tracking-wider">
                        {p.department} Unit
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {p.totalDays} Days Rotation
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-foreground text-sm">
                        Intern: {p.student?.name || "—"}
                      </h4>
                      <p className="text-muted-foreground font-semibold">
                        Student ID: {p.student?.studentId || "—"} · Semester: {p.student?.semester || "—"}
                      </p>
                      <p className="text-muted-foreground">
                        Posting Dates: <span className="font-bold text-foreground">{new Date(p.startDate).toLocaleDateString()} to {new Date(p.endDate).toLocaleDateString()}</span>
                      </p>
                      <p className="text-muted-foreground mt-2">
                        Supervisor: <span className="font-semibold text-foreground">{p.supervisor?.name || "—"}</span>
                      </p>
                      {p.feedback && (
                        <p className="p-2 bg-muted/40 rounded-lg italic text-muted-foreground mt-2">
                          " {p.feedback} "
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
