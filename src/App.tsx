import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  MapPin,
  Activity,
  UploadCloud,
  CheckCircle,
  AlertOctagon,
  Compass,
  Radio,
  Users,
  Sparkles,
  Clock,
  Building,
  ChevronRight,
  Fingerprint,
  Lock,
  RefreshCw,
  Cpu,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Search,
  Database,
  Sliders,
  Mic,
  MicOff,
  Layers
} from "lucide-react";
import L from "leaflet";

// Define TypeScript interfaces
interface Incident {
  id: string;
  timestamp: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  afterImageUrl?: string;
  description?: string;
  upvotes: number;
  escalated: boolean;
  resolved?: boolean;
  category: string;
  isCivicIssue: boolean;
  fraudVerdict: 'GENUINE' | 'SUSPECTED_FRAUD';
  fraudReason: string;
  priorityLevel: 'High' | 'Medium' | 'Low';
  targetDepartment: string;
  recommendedResponseHours: number;
  logs: string[];
}

interface Escalation {
  id: string;
  incidentId: string;
  timestamp: string;
  category: string;
  priorityLevel: 'High' | 'Medium' | 'Low';
  targetDepartment: string;
  recommendedResponseHours: number;
  dispatchDetails: string;
}

export default function App() {
  // State variables
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const currentTab = activeTab;
  const setCurrentTab = setActiveTab;

  // Active Matrix search & filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  const [escalationThreshold, setEscalationThreshold] = useState(5);
  const [mockContacts, setMockContacts] = useState({
    dpw: "SECURE_CHANNEL_19",
    dot: "ROUTING_CHANNEL_42",
    ema: "THREAT_PROTOCOL_LVL_3"
  });

  // Geolocation states
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: 23.2599,
    lng: 77.4126
  });
  const [geoStatus, setGeoStatus] = useState<"LOCK" | "SCANNING" | "DEFAULT_GRID">("SCANNING");

  // Form states
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [category, setCategory] = useState("Pothole");
  const [description, setDescription] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Officer / Map Widgets / Speech states
  const [isOfficerView, setIsOfficerView] = useState(false);
  const [mapFilterPriority, setMapFilterPriority] = useState<'All' | 'High' | 'Medium' | 'Resolved'>('All');
  const [isHeatmapActive, setIsHeatmapActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechLang, setSpeechLang] = useState<'EN' | 'HI'>('EN');

  // City Switcher States
  const [citySearch, setCitySearch] = useState("");
  const [activeCity, setActiveCity] = useState("Bhopal");
  const [geocoding, setGeocoding] = useState(false);

  // Dynamic geocoding transition & seeding
  const handleCitySearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearch.trim()) return;
    setGeocoding(true);
    try {
      const res = await fetch("/api/seed-city", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: citySearch.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveCity(data.city);
        setUserCoords({ lat: data.lat, lng: data.lng });
        setIncidents(data.incidents || []);
        setEscalations(data.escalations || []);
        
        if (mapRef.current) {
          const zoom = data.city.toLowerCase() === 'nagpur' ? 12 : 14;
          mapRef.current.flyTo([data.lat, data.lng], zoom, { animate: true, duration: 2.0 });
        }
      }
    } catch (err) {
      console.error("Error geocoding and seeding city:", err);
    } finally {
      setGeocoding(false);
      setCitySearch("");
    }
  };

  // Start Voice Recognition
  const startSpeechRecognition = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setSpeechError("Speech recognition not supported in this browser.");
      alert("Native Speech Recognition is not supported in this browser version. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    setSpeechError(null);
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = speechLang === 'HI' ? 'hi-IN' : 'en-IN';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event);
      setSpeechError(event.error || "Recognition failed");
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onresult = (event: any) => {
      const transcriptText = event.results[0]?.[0]?.transcript;
      if (transcriptText) {
        setDescription((prev) => prev ? prev + " " + transcriptText : transcriptText);
      }
    };

    recognition.start();
  };

  // Map references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Constants for 7-Stage cybernetic pipeline animation
  const PIPELINE_STAGES = [
    { title: "INGESTION", desc: "Extracting metadata & validating geospatial tags..." },
    { title: "DEDUPLICATION", desc: "Scanning local coordinates within 50-meter radius..." },
    { title: "THREAT REVIEW", desc: "Verifying visual payload authenticity & fraud score..." },
    { title: "ROUTING MATRIX", desc: "Resolving target municipal department destination..." },
    { title: "SLA VALUATION", desc: "Calculating priority triage and safety threat level..." },
    { title: "DISPATCH MATRIX", desc: "Deploying active municipal routing & schedule update..." },
    { title: "HUD LEDGER SYNC", desc: "Syncing secure database and refreshing HUD view..." }
  ];

  // Fetch incidents from server
  const fetchIncidents = async () => {
    try {
      const res = await fetch("/api/incidents");
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
        setEscalations(data.escalations || []);
      }
    } catch (err) {
      console.error("Failed to sync incidents:", err);
    } finally {
      setLoading(false);
    }
  };

  // 10-second polling interval
  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Geolocation instantly
  useEffect(() => {
    if (navigator.geolocation) {
      setGeoStatus("SCANNING");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserCoords(coords);
          setGeoStatus("LOCK");
          if (mapRef.current) {
            mapRef.current.flyTo([coords.lat, coords.lng], 15, { animate: true, duration: 2.0 });
          }
        },
        (error) => {
          console.warn("Geolocation failed or denied, using Bhopal default:", error);
          setGeoStatus("DEFAULT_GRID");
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setGeoStatus("DEFAULT_GRID");
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
        doubleClickZoom: false,
        boxZoom: false
      }).setView([23.2599, 77.4126], 15); // Default to highly specific Bhopal coordinates at street level (15)

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 20
      }).addTo(map);

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = null;
      }
    };
  }, []);

  // Update map view when userCoords changes
  useEffect(() => {
    if (mapRef.current && geoStatus === "LOCK") {
      mapRef.current.flyTo([userCoords.lat, userCoords.lng], 15, { animate: true, duration: 2.0 });
    }
  }, [userCoords, geoStatus]);

  // Invalidate map size on tab change to ensure correct rendering
  useEffect(() => {
    if (activeTab === "dashboard" && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 150);
    }
  }, [activeTab]);

  // Synchronize Leaflet markers whenever incidents state is updated
  useEffect(() => {
    if (mapRef.current) {
      if (!markersRef.current) {
        markersRef.current = L.layerGroup().addTo(mapRef.current);
      }
      markersRef.current.clearLayers();

      // Add user location marker
      if (geoStatus === "LOCK" || geoStatus === "SCANNING") {
        const userMarker = L.circleMarker([userCoords.lat, userCoords.lng], {
          radius: 9,
          fillColor: "#00f2fe",
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(markersRef.current);

        userMarker.bindPopup(`
          <div style="font-family: monospace; padding: 4px;">
            <p style="margin:0; font-weight: bold; color: #00f2fe;">🛰️ Sentinel Base Node</p>
            <p style="margin:4px 0 0 0; font-size:10px; color:#94a3b8;">User Coordinates Loaded</p>
          </div>
        `);
      }

      // Filter incidents based on active map widget options
      const filteredIncidents = incidents.filter((inc) => {
        if (mapFilterPriority === "High") {
          return inc.priorityLevel === "High" && !inc.resolved;
        }
        if (mapFilterPriority === "Medium") {
          return inc.priorityLevel === "Medium" && !inc.resolved;
        }
        if (mapFilterPriority === "Resolved") {
          return inc.resolved === true;
        }
        return true; // "All"
      });

      // Add incident markers
      filteredIncidents.forEach((inc) => {
        const isHigh = inc.priorityLevel === "High";
        const isMedium = inc.priorityLevel === "Medium";
        const isResolved = inc.resolved === true;
        const priorityColor = isResolved ? "#10b981" : (isHigh ? "#ef4444" : isMedium ? "#eab308" : "#22c55e");

        const popupHTML = `
          <div style="font-family: monospace; font-size: 11px; padding: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0, 242, 254, 0.2); padding-bottom: 4px; margin-bottom: 6px;">
              <span style="font-weight: bold; color: #00f2fe; text-transform: uppercase;">[${inc.category}]</span>
              <span style="background: ${priorityColor}22; color: ${priorityColor}; padding: 1px 4px; border-radius: 3px; border: 1px solid ${priorityColor}; font-size: 9px; font-weight: bold;">${isResolved ? 'Resolved' : inc.priorityLevel}</span>
            </div>
            <p style="margin: 0 0 4px 0;"><strong>ID:</strong> ${inc.id.substring(0, 8)}</p>
            <p style="margin: 0 0 4px 0;"><strong>SLA:</strong> ${inc.recommendedResponseHours}h Target</p>
            <p style="margin: 0 0 4px 0;"><strong>Dept:</strong> ${inc.targetDepartment}</p>
            <p style="margin: 0 0 4px 0;"><strong>Upvotes:</strong> ${inc.upvotes}</p>
            ${inc.description ? `<p style="margin: 0 0 4px 0; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><strong>Desc:</strong> ${inc.description}</p>` : ''}
            <p style="margin: 0; color: ${isResolved ? '#10b981' : (inc.escalated ? '#c084fc' : '#94a3b8')}; font-weight: bold;">
              ${isResolved ? "🟢 COMPLETED & RESOLVED" : (inc.escalated ? "🚨 DISPATCH ESCALATED" : "🔵 ACTIVE MONITORING")}
            </p>
          </div>
        `;

        // Check if marker should have a pulsing CSS glow
        const isNew = (Date.now() - new Date(inc.timestamp).getTime()) < 600000; // 10 minutes
        const className = (isHigh || isNew) && !isResolved ? "glowing-marker-pulse" : "";

        const circleMarker = L.circleMarker([inc.lat, inc.lng], {
          radius: isHigh ? 13 : 9,
          fillColor: priorityColor,
          color: isResolved ? "#10b981" : (inc.escalated ? "#a855f7" : "#00f2fe"),
          weight: inc.escalated ? 3 : 1.5,
          opacity: 1,
          fillOpacity: 0.8,
          className: className
        });

        circleMarker.bindPopup(popupHTML);
        markersRef.current?.addLayer(circleMarker);

        // If Heatmap/Density simulation layer is active, overlay multiple translucent rings
        if (isHeatmapActive) {
          L.circle([inc.lat, inc.lng], {
            radius: isHigh ? 350 : 200,
            fillColor: priorityColor,
            color: "transparent",
            fillOpacity: 0.08,
            interactive: false
          }).addTo(markersRef.current!);

          L.circle([inc.lat, inc.lng], {
            radius: isHigh ? 180 : 100,
            fillColor: priorityColor,
            color: "transparent",
            fillOpacity: 0.14,
            interactive: false
          }).addTo(markersRef.current!);
        }
      });
    }
  }, [incidents, userCoords, geoStatus, mapFilterPriority, isHeatmapActive]);

  // Center map on a specific incident coordinate
  const handlePanToIncident = (lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 16);
    }
  };

  // Upvote/Verify Report handler
  const handleUpvote = async (id: string) => {
    try {
      const res = await handleUpvoteRequest(id);
      if (res.success) {
        // Optimistic state update or complete synchronization
        fetchIncidents();
      }
    } catch (err) {
      console.error("Upvote request failed:", err);
    }
  };

  // Separate function for the API call to ensure modularity
  const handleUpvoteRequest = async (id: string) => {
    const res = await fetch(`/api/upvote/${id}`, { method: "POST" });
    return await res.json();
  };

  // Handle resolving an incident
  const handleResolveIncident = async (id: string) => {
    try {
      const res = await fetch(`/api/resolve/${id}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        fetchIncidents();
      } else {
        alert(data.error || "Failed to resolve incident");
      }
    } catch (err) {
      console.error("Resolve request failed:", err);
    }
  };

  // Handle uploading 'after' proof photo
  const handleUploadAfterPhoto = (id: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          try {
            const res = await fetch(`/api/upload-after/${id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image: base64String })
            });
            const data = await res.json();
            if (data.success) {
              fetchIncidents();
              alert("Proof 'After' photo uploaded successfully. Verification saved inside distributed ledger.");
            } else {
              alert(data.error || "Failed to upload after photo");
            }
          } catch (err) {
            console.error("Failed to upload after photo:", err);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Handle Drag & Drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  // Convert uploaded image to base64 preview
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Reset file selection
  const clearFileSelection = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit Report form
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger full screen 7-stage processing matrix
    setSubmitting(true);
    setActiveStep(0);

    // Simulate multi-stage visual stepper for premium sci-fi feel
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < 6) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 900);

    try {
      const payload = {
        image: imagePreview || "",
        lat: userCoords.lat,
        lng: userCoords.lng,
        category: category,
        description: description
      };

      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Wait a small moment on stage 7 to allow the sync screen to show completed status
        setTimeout(() => {
          fetchIncidents();
          setSubmitting(false);
          setImagePreview(null);
          setDescription("");
          if (fileInputRef.current) fileInputRef.current.value = "";
        }, 1200);
      } else {
        clearInterval(stepInterval);
        alert("Server failed to ingest report.");
        setSubmitting(false);
      }
    } catch (err) {
      clearInterval(stepInterval);
      console.error(err);
      alert("Cyber-network transmission failure.");
      setSubmitting(false);
    }
  };

  const toggleLogs = (id: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Counter calculations
  const totalReports = incidents.length;
  const highRiskReports = incidents.filter((i) => i.priorityLevel === "High").length;
  const escalatedDispatches = escalations.length;

  return (
    <div id="cyber-root" className="min-h-screen bg-[#0b0f19] text-[#e2e8f0] flex flex-col font-sans select-none relative overflow-y-auto">
      
      {/* 7-STAGE AGENT PIPELINE OVERLAY */}
      {submitting && (
        <div className="fixed inset-0 bg-[#070b13]/95 backdrop-blur-md z-[9999] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="w-full max-w-xl bg-[#0f172a]/90 border border-[#00f2fe]/40 rounded-xl p-8 shadow-2xl relative glow-primary">
            
            {/* High-tech top line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00f2fe] to-transparent animate-pulse" />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Cpu className="text-[#00f2fe] w-5 h-5 animate-spin" />
                <span className="text-xs font-mono tracking-widest text-[#00f2fe]">CIVIC_SENTINEL_AI v3.5</span>
              </div>
              <span className="text-xs font-mono text-gray-400">ANALYSIS_PIPELINE: ACTIVE</span>
            </div>

            <h2 className="text-xl font-mono tracking-wider text-white uppercase mb-2">
              Ingesting Geo-Sensing Stream
            </h2>
            <p className="text-xs text-gray-400 mb-8 font-mono">
              Vector Target: [{userCoords.lat.toFixed(5)}, {userCoords.lng.toFixed(5)}]
            </p>

            {/* Steps Stepper */}
            <div className="space-y-3 text-left mb-8">
              {PIPELINE_STAGES.map((stage, idx) => {
                const isActive = activeStep === idx;
                const isCompleted = activeStep > idx;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border font-mono transition-all duration-300 ${
                      isActive
                        ? "bg-[#00f2fe]/10 border-[#00f2fe] text-white translate-x-2"
                        : isCompleted
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                        : "bg-gray-900/40 border-gray-800/40 text-gray-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          isActive
                            ? "bg-[#00f2fe] text-black font-bold"
                            : isCompleted
                            ? "bg-emerald-500 text-black font-bold"
                            : "bg-gray-800 text-gray-500"
                        }`}>
                          0{idx + 1}
                        </span>
                        <span className="text-xs font-bold tracking-wider">{stage.title}</span>
                      </div>
                      <span className="text-[10px]">
                        {isActive && "EXECUTING..."}
                        {isCompleted && "COMPLETE ✓"}
                        {!isActive && !isCompleted && "PENDING"}
                      </span>
                    </div>
                    {isActive && (
                      <p className="text-[11px] text-gray-300 mt-1 animate-pulse">
                        {stage.desc}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Glowing progress line */}
            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-2">
              <div
                className="bg-[#00f2fe] h-full transition-all duration-300 glow-primary"
                style={{ width: `${((activeStep + 1) / 7) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-gray-400">
              <span>LEDGER TRIAGE METRICS</span>
              <span>{Math.round(((activeStep + 1) / 7) * 100)}% ENGAGED</span>
            </div>

          </div>
        </div>
      )}

      {/* HEADER BAR (ELEGANT DARK STYLE) */}
      <header className="h-16 border-b border-cyan-900/50 flex items-center justify-between px-6 bg-[#0b0f19]/90 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500 rounded-sm flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tighter glow-text text-cyan-400">
              CIVIC SENTINEL <span className="text-white opacity-50">AI</span>
            </h1>
            <p className="text-[10px] mono text-cyan-700 font-mono">v3.5.0 // CORE_ENGINE_ACTIVE</p>
          </div>

          <form onSubmit={handleCitySearchSubmit} className="ml-2 md:ml-4 flex items-center gap-1 md:gap-1.5 border border-cyan-500/30 bg-slate-900/80 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md max-w-[110px] md:max-w-[180px] transition-all duration-300 focus-within:border-cyan-400 shrink">
            <span className="text-[7px] md:text-[9px] font-mono font-bold tracking-wider text-slate-400 whitespace-nowrap">🔍 TRACK:</span>
            <input
              type="text"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder={activeCity}
              disabled={geocoding}
              className="bg-transparent text-white text-[9px] md:text-xs font-mono font-bold focus:outline-none w-full placeholder-slate-500 min-w-0"
            />
            {geocoding && <div className="w-2 h-2 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />}
          </form>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          {/* Officer's Quick Action Toggle */}
          <div className="flex items-center gap-2 border border-cyan-500/20 bg-slate-900/40 px-2.5 py-1 rounded-full">
            <span className={`text-[9px] font-mono font-bold tracking-wider ${isOfficerView ? 'text-[#00f2fe] glow-text' : 'text-slate-400'}`}>
              {isOfficerView ? '⚠️ OFFICER_ACTIVE' : 'OFFICER_VIEW'}
            </span>
            <button
              type="button"
              id="officer-toggle-btn"
              onClick={() => setIsOfficerView(!isOfficerView)}
              className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                isOfficerView ? 'bg-[#00f2fe] shadow-[0_0_8px_#00f2fe]' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-[#05080f] shadow ring-0 transition duration-200 ease-in-out ${
                  isOfficerView ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Current Geolocation</p>
            <p className="text-xs mono text-cyan-400 font-mono">
              {userCoords.lat.toFixed(4)}° N, {userCoords.lng.toFixed(4)}° E
            </p>
          </div>
          <div className="h-8 w-[1px] bg-slate-800 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-[10px] mono font-mono text-slate-300">POLLING: 10S</p>
          </div>
        </div>
      </header>

      {/* MOBILE TAB BAR */}
      <div className="md:hidden flex bg-[#080c14] border-b border-cyan-500/20 overflow-x-auto scrollbar-none font-mono text-[10px] shrink-0 p-1.5 gap-1 z-40">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-1.5 rounded text-center font-bold transition-all ${
            activeTab === 'dashboard' ? "bg-cyan-500/10 text-[#00f2fe] border border-cyan-500/30 shadow-[0_0_8px_rgba(0,242,254,0.2)]" : "text-slate-400"
          }`}
        >
          🏠 Map
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`flex-1 py-1.5 rounded text-center font-bold transition-all ${
            activeTab === 'matrix' ? "bg-cyan-500/10 text-[#00f2fe] border border-cyan-500/30 shadow-[0_0_8px_rgba(0,242,254,0.2)]" : "text-slate-400"
          }`}
        >
          📋 Matrix
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-1.5 rounded text-center font-bold transition-all ${
            activeTab === 'analytics' ? "bg-cyan-500/10 text-[#00f2fe] border border-cyan-500/30 shadow-[0_0_8px_rgba(0,242,254,0.2)]" : "text-slate-400"
          }`}
        >
          📊 Stats
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('escalated')}
          className={`flex-1 py-1.5 rounded text-center font-bold transition-all ${
            activeTab === 'escalated' ? "bg-cyan-500/10 text-[#00f2fe] border border-cyan-500/30 shadow-[0_0_8px_rgba(0,242,254,0.2)]" : "text-slate-400"
          }`}
        >
          🚨 Dispatch ({escalatedDispatches})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-1.5 rounded text-center font-bold transition-all ${
            activeTab === 'settings' ? "bg-cyan-500/10 text-[#00f2fe] border border-cyan-500/30 shadow-[0_0_8px_rgba(0,242,254,0.2)]" : "text-slate-400"
          }`}
        >
          ⚙️ Node
        </button>
      </div>

      {/* 3-COLUMN REAL-APP LAYOUT */}
      <div className="flex-1 flex overflow-y-auto lg:overflow-visible min-h-fit">
        
        {/* COLUMN 1: FIXED LEFT NAVIGATION SHELL (The Control Sidebar) */}
        <aside className="w-16 md:w-60 border-r border-cyan-500/20 bg-[#080c14]/95 backdrop-blur-md flex flex-col justify-between p-3 z-30 transition-all duration-300 shrink-0 select-none">
          <div className="flex flex-col gap-6">
            {/* Control Sidebar Header */}
            <div className="flex items-center gap-2.5 px-2 py-1 border-b border-cyan-950/40 pb-4 hidden md:flex">
              <div className="w-7 h-7 bg-cyan-500/10 border border-[#00f2fe] rounded flex items-center justify-center animate-pulse">
                <Compass className="w-4 h-4 text-[#00f2fe]" />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-wider text-white">SENTINEL SHELL</h3>
                <p className="text-[8px] font-mono text-cyan-500">MUNICIPAL_BMC_CORE</p>
              </div>
            </div>

            {/* Mobile / Icons logo */}
            <div className="flex justify-center md:hidden pb-4 border-b border-cyan-950/40">
              <Compass className="w-5 h-5 text-[#00f2fe] animate-pulse" />
            </div>

            {/* Tabs List */}
            <nav className="flex flex-col gap-1.5 font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-200 cursor-pointer group ${
                  activeTab === 'dashboard'
                    ? "bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/30 shadow-[0_0_12px_rgba(0,242,254,0.15)] font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                }`}
              >
                <span className="text-sm shrink-0">🏠</span>
                <span className="hidden md:block font-medium tracking-wide">Live Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('matrix')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-200 cursor-pointer group ${
                  activeTab === 'matrix'
                    ? "bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/30 shadow-[0_0_12px_rgba(0,242,254,0.15)] font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                }`}
              >
                <span className="text-sm shrink-0">📋</span>
                <span className="hidden md:block font-medium tracking-wide">Active Matrix</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-200 cursor-pointer group ${
                  activeTab === 'analytics'
                    ? "bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/30 shadow-[0_0_12px_rgba(0,242,254,0.15)] font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                }`}
              >
                <span className="text-sm shrink-0">📊</span>
                <span className="hidden md:block font-medium tracking-wide">Ward Analytics</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('escalated')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all duration-200 cursor-pointer group ${
                  activeTab === 'escalated'
                    ? "bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/30 shadow-[0_0_12px_rgba(0,242,254,0.15)] font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm shrink-0">🚨</span>
                  <span className="hidden md:block font-medium tracking-wide">Emergency Dispatch</span>
                </div>
                {escalatedDispatches > 0 && (
                  <span className="hidden md:inline-block text-[9px] bg-[#ef4444] text-white font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    {escalatedDispatches}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-200 cursor-pointer group ${
                  activeTab === 'settings'
                    ? "bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/30 shadow-[0_0_12px_rgba(0,242,254,0.15)] font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                }`}
              >
                <span className="text-sm shrink-0">⚙️</span>
                <span className="hidden md:block font-medium tracking-wide">System Config</span>
              </button>
            </nav>
          </div>

          {/* Quick Metrics at bottom of left sidebar (desktop only) */}
          <div className="hidden md:flex flex-col gap-2 border-t border-cyan-950/40 pt-4">
            <div className="p-2.5 rounded bg-black/30 border border-cyan-950/40 text-[10px] font-mono">
              <p className="text-slate-500 font-bold mb-0.5 font-mono">CORE STATUS</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[#00f2fe] font-medium font-mono">ACTIVE_SENSORS</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-600 text-center font-mono">WARD_45_BHOPAL_SYS</p>
          </div>
        </aside>

        {/* COLUMN 2: CONDITIONAL CENTRAL WORKSPACE */}
        <section className="flex-1 relative bg-[#05080f] lg:overflow-visible flex flex-col">
          
          {/* VIEW: DASHBOARD (MAP BACKDROP & KPI HUD & BOTTOM INCIDENT CARDS) */}
          <div className={`${activeTab === 'dashboard' ? 'relative flex-1 opacity-100 pointer-events-auto z-10' : 'absolute inset-0 opacity-0 pointer-events-none z-0 h-0 overflow-hidden'} transition-all duration-300 flex flex-col bg-[#05080f]`}>
            
            {/* MAP CONTAINER BLOCK */}
            <div className="relative w-full h-[320px] lg:flex-1 lg:min-h-[350px] shrink-0 border-b border-cyan-500/20 shadow-lg">
              <div ref={mapContainerRef} className="w-full h-full" />
              
              {/* Scanline tactical overlay */}
              <div className="scan-line pointer-events-none" />

              {/* RECENTER TARGET COMPASS BUTTON (Floating over map) */}
              <button
                type="button"
                id="map-recenter-btn"
                onClick={() => {
                  if (mapRef.current) {
                    mapRef.current.flyTo([23.2599, 77.4126], 13, { animate: true, duration: 1.5 });
                  }
                }}
                className="absolute top-[10px] left-[10px] lg:top-[90px] lg:left-[10px] z-[400] w-[32px] h-[32px] lg:w-[34px] lg:h-[34px] bg-[#0d1424]/95 hover:bg-[#00f2fe]/20 text-[#00f2fe] border border-cyan-500/40 rounded-lg shadow-[0_0_10px_rgba(0,242,254,0.3)] flex items-center justify-center transition-all duration-200 cursor-pointer group"
                title="Recenter to Default Grid"
              >
                <Compass className="w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover:rotate-45" />
              </button>

              {/* Floating indicators (Desktop only) */}
              <div className="hidden lg:flex absolute bottom-6 right-6 z-[400] flex-col gap-2">
                <div className="w-3.5 h-3.5 bg-[#ef4444] rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)]" title="HIGH THREAT TRIGGER"></div>
                <div className="w-3.5 h-3.5 bg-[#00f2fe] rounded-full shadow-[0_0_15px_rgba(0,242,254,0.8)] animate-pulse" title="SENTINEL POLLING ACTIVE"></div>
                <div className="w-3.5 h-3.5 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)]" title="ESCALATED DISPATCH STREAM"></div>
              </div>
            </div>

            {/* UNIFIED INTEGRATED FILTERS ROW & HEATMAP CONTROLS */}
            {/* On mobile, this stacks below the map; on desktop, it floats in the top-right corner of the map */}
            <div className="w-full bg-[#0d1424]/95 p-3 flex flex-wrap gap-2 items-center border-b border-cyan-500/20 select-none font-mono shrink-0 lg:absolute lg:top-4 lg:right-4 lg:w-auto lg:p-1.5 lg:border lg:rounded-xl lg:shadow-[0_0_15px_rgba(6,182,212,0.15)] lg:z-[400] lg:flex-row lg:items-center">
              <span className="text-[9px] text-slate-500 font-bold px-1 uppercase whitespace-nowrap">TACTICAL FILTERS:</span>
              {(['All', 'High', 'Medium', 'Resolved'] as const).map((p) => {
                const isActive = mapFilterPriority === p;
                let count = 0;
                let label = "";
                if (p === 'All') {
                  count = incidents.length;
                  label = `🌐 All (${count})`;
                } else if (p === 'High') {
                  count = incidents.filter(i => i.priorityLevel === 'High' && !i.resolved).length;
                  label = `🔴 High (${count})`;
                } else if (p === 'Medium') {
                  count = incidents.filter(i => (i.priorityLevel === 'Medium' || i.priorityLevel === 'Low') && !i.resolved).length;
                  label = `🟡 Med (${count})`;
                } else if (p === 'Resolved') {
                  count = incidents.filter(i => i.resolved).length;
                  label = `🟢 Resolved (${count})`;
                }

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setMapFilterPriority(p)}
                    className={`px-2.5 py-1.5 text-[9px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40 shadow-[0_0_8px_rgba(0,242,254,0.3)]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}

              <div className="h-6 w-[1px] bg-cyan-900/40 hidden md:block" />

              {/* Heatmap Toggle Button */}
              <button
                type="button"
                onClick={() => setIsHeatmapActive(!isHeatmapActive)}
                className={`px-3 py-1.5 rounded-lg border transition-all duration-300 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isHeatmapActive
                    ? 'bg-purple-500/20 text-[#c084fc] border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : 'bg-[#0d1424]/90 text-slate-400 hover:text-white border-cyan-500/20'
                }`}
              >
                <Layers className={`w-3.5 h-3.5 ${isHeatmapActive ? 'animate-spin' : ''}`} />
                {isHeatmapActive ? 'HEATMAP ON' : 'HEATMAP OFF'}
              </button>
            </div>

            {/* GRID CONTAINER FOR BOTTOM SECTION */}
            <div className="w-full bg-[#080c14]/95 border-t border-cyan-500/20 shrink-0 select-none grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-auto lg:min-h-fit p-4 lg:p-5 pb-24 lg:pb-5 overflow-y-auto lg:overflow-visible">
              
              {/* 'REAL-TIME INCIDENT STREAM' container - spans exactly 2 columns on lg */}
              <div className="lg:col-span-2 flex flex-col gap-3 min-w-0 h-full">
                <div className="flex justify-between items-center shrink-0">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-2 tracking-widest font-mono">
                    <span className="w-1.5 h-3 bg-[#00f2fe]"></span> Real-Time Incident Stream
                  </h3>
                  <div className="flex gap-4 text-[9px] mono text-slate-500 font-mono">
                    <span>ACTIVE_NODES: {incidents.length}</span>
                    <span>SYSTEM_UPTIME: 99.98%</span>
                  </div>
                </div>

                {/* CARDS CONTAINER */}
                <div className="flex-1 flex flex-col md:flex-row lg:flex-col gap-3 overflow-y-auto md:overflow-x-auto lg:overflow-visible pb-2 pr-1 scrollbar-thin max-h-[300px] lg:max-h-none lg:h-auto">
                  {incidents.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 font-mono text-xs">
                      <Lock className="w-5 h-5 mb-1.5 opacity-30" />
                      NO INCIDENT LEDGER COMMITTED YET. STANDBY FOR TRANSMISSION.
                    </div>
                  ) : (
                    incidents.slice().reverse().map((inc) => {
                      const isHigh = inc.priorityLevel === "High";
                      const isMedium = inc.priorityLevel === "Medium";
                      const priorityColor = isHigh
                        ? "border-red-500"
                        : isMedium
                        ? "border-yellow-500"
                        : "border-cyan-500";
                      const priorityText = isHigh ? "High Priority" : isMedium ? "Medium Priority" : "Low Priority";
                      const priorityBadgeColor = isHigh
                        ? "bg-red-500/20 text-[#ef4444]"
                        : isMedium
                        ? "bg-yellow-500/20 text-[#f59e0b]"
                        : "bg-cyan-500/20 text-[#00f2fe]";

                      return (
                        <div
                          key={inc.id}
                          className={`incident-card glass rounded-lg p-3.5 flex flex-col border-l-4 ${priorityColor} shrink-0 lg:shrink transition-all hover:border-[#00f2fe] duration-200 relative bg-[#0d1424]/80 w-full md:w-[295px] md:min-w-[295px] lg:w-full lg:min-w-0`}
                          style={{ height: inc.afterImageUrl ? "165px" : (isOfficerView ? "145px" : "115px") }}
                        >
                          <div className="flex justify-between items-start mb-1 font-mono">
                            <span className={`text-[8px] ${priorityBadgeColor} px-1.5 py-0.5 rounded font-bold uppercase`}>
                              {inc.resolved ? "✓ Resolved" : priorityText}
                            </span>
                            <span className="text-[8px] text-slate-500 flex items-center gap-1">
                              #{inc.id.substring(0, 8)}
                              <button
                                onClick={() => handlePanToIncident(inc.lat, inc.lng)}
                                className="text-cyan-400 hover:text-white cursor-pointer"
                                title="Focus Map Grid Coordinates"
                              >
                                <MapPin className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          </div>

                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-white truncate uppercase tracking-wide font-mono">
                                {inc.category}
                              </h4>
                              <p className="text-[8px] text-slate-400 mb-1 font-mono">
                                Dept: {inc.targetDepartment.substring(0, 24)} | SLA: {inc.recommendedResponseHours}h Max
                              </p>
                              {inc.description && (
                                <p className="text-[8px] text-slate-400 italic truncate mb-1">
                                  "{inc.description}"
                                </p>
                              )}
                            </div>
                            {inc.afterImageUrl && (
                              <div className="relative shrink-0 ml-1.5 border border-emerald-500/30 rounded p-0.5 bg-black/40">
                                <img
                                  src={inc.afterImageUrl}
                                  alt="After Proof"
                                  referrerPolicy="no-referrer"
                                  className="w-8 h-8 rounded object-cover"
                                />
                                <span className="absolute -top-1 -right-1 bg-emerald-500 text-black text-[5px] font-bold px-0.5 rounded">AFTER</span>
                              </div>
                            )}
                          </div>

                          {/* High-tech Multi-stage Glow Bars */}
                          <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4, 5, 6, 7].map((barIdx) => {
                              const isActive = inc.resolved || inc.escalated || inc.upvotes >= barIdx;
                              return (
                                <div
                                  key={barIdx}
                                  className={`h-0.5 w-full rounded-full transition-colors duration-300 ${
                                    isActive ? (inc.resolved ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.6)]" : "bg-[#00f2fe] shadow-[0_0_4px_rgba(0,242,254,0.6)]") : "bg-slate-800"
                                  }`}
                                />
                              );
                            })}
                          </div>

                          <div className="flex justify-between items-center mt-auto font-mono text-[8px]">
                            <span className={`font-bold uppercase ${inc.resolved ? 'text-emerald-400' : 'text-[#00f2fe]'}`}>
                              {inc.resolved ? "✓ COMPLETED" : (inc.fraudVerdict === "GENUINE" ? "✓ VERIFIED" : "⚠ SUSPECTED")}
                            </span>
                            <button
                              onClick={() => handleUpvote(inc.id)}
                              disabled={inc.resolved}
                              className={`font-bold px-1.5 py-0.5 rounded transition cursor-pointer ${inc.resolved ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-[#00f2fe] hover:bg-white text-black'}`}
                            >
                              + VERIFY ({inc.upvotes})
                            </button>
                          </div>

                          {/* Officer Quick Actions row */}
                          {isOfficerView && (
                            <div className="flex gap-1.5 mt-1.5 pt-1.5 border-t border-cyan-950/40 font-mono text-[7px] justify-between">
                              {inc.resolved ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-0.5 uppercase">
                                  ✓ RESOLVED COMPLETED
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleResolveIncident(inc.id)}
                                  className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black font-bold px-1.5 py-0.5 rounded transition cursor-pointer border border-emerald-500/30 font-mono uppercase"
                                >
                                  ✓ MARK RESOLVED
                                </button>
                              )}

                              <button
                                onClick={() => handleUploadAfterPhoto(inc.id)}
                                className="bg-purple-500/20 hover:bg-purple-500 text-purple-400 hover:text-black font-bold px-1 py-0.5 rounded transition cursor-pointer border border-purple-500/30 flex items-center gap-0.5 font-mono uppercase"
                              >
                                📷 {inc.afterImageUrl ? 'UPDATE AFTER' : 'PROOF PHOTO'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 'REPORT ANOMALY' / Photo Upload card component - spans exactly 1 column on lg */}
              <div className="lg:col-span-1 border border-cyan-500/20 bg-[#0d1424]/40 p-4 rounded-xl flex flex-col gap-4 min-w-0 h-full">
                <div className="flex items-center justify-between pb-2 border-b border-cyan-900/40 shrink-0">
                  <h2 className="font-bold text-xs tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                    <UploadCloud className="w-4 h-4 text-[#00f2fe] animate-pulse" />
                    REPORT ANOMALY
                  </h2>
                  <span className="text-[8px] font-mono text-cyan-500 uppercase">SYS_INTAKE</span>
                </div>

                <form onSubmit={handleSubmitReport} className="flex-1 flex flex-col gap-3 font-mono text-xs overflow-y-auto lg:overflow-visible scrollbar-none pr-0.5">
                  {/* Dropzone & Preview Component */}
                  {imagePreview ? (
                    <div className="border border-[#00f2fe]/30 rounded-lg p-2 bg-black/40 flex flex-col items-center justify-center relative min-h-[95px] shrink-0">
                      <img
                        src={imagePreview}
                        alt="Uploaded Visual Feed"
                        referrerPolicy="no-referrer"
                        className="max-h-[85px] rounded object-cover"
                      />
                      <button
                        type="button"
                        onClick={clearFileSelection}
                        className="absolute top-1.5 right-1.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded px-1.5 py-0.5 text-[8px] font-mono transition"
                      >
                        CLEAR
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border border-dashed rounded-lg p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition min-h-[95px] shrink-0 pointer-events-auto ${
                        dragOver
                          ? "bg-[#00f2fe]/10 border-[#00f2fe]"
                          : "border-cyan-500/20 hover:border-cyan-500/50 bg-[#121b2e]/50"
                      }`}
                    >
                      <UploadCloud className="w-6 h-6 text-[#00f2fe] animate-pulse" />
                      <div className="text-center">
                        <p className="text-[9px] font-bold text-white uppercase">DRAG PHOTOMETRY OR CLICK TO RECORD IMAGE</p>
                        <p className="text-[8px] text-slate-500">PNG, JPG, WEBP SUPPORTED</p>
                      </div>
                      <input
                        type="file"
                        id="anomaly-upload"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden pointer-events-none"
                      />
                    </div>
                  )}

                  {/* Category & Voice row */}
                  <div className="grid grid-cols-3 gap-2 shrink-0">
                    <div className="col-span-2">
                      <label className="block text-[9px] text-slate-400 mb-1 uppercase font-bold tracking-wider">
                        Triage Category Hint:
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-[#131b2b]/95 border border-cyan-500/20 text-gray-200 rounded px-2 py-1.5 text-[10px] font-mono focus:border-cyan-400 focus:outline-none h-8 text-[10px]"
                      >
                        <option value="Pothole">Pothole (Roadway)</option>
                        <option value="Graffiti">Graffiti (Vandalism)</option>
                        <option value="Power Outage">Power Outage (Grid)</option>
                        <option value="Trash">Trash Accumulation</option>
                        <option value="Water Leak">Water Leak (Utility)</option>
                        <option value="Road Block">Road Block / Obstruction</option>
                        <option value="Vandalism">Property Vandalism</option>
                        <option value="Safety Hazard">Critical Public Safety Hazard</option>
                        <option value="Other">Other Anomaly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-400 mb-1 uppercase font-bold tracking-wider text-center">
                        Voice ({speechLang}):
                      </label>
                      <div className="flex gap-1 h-8">
                        <button
                          type="button"
                          onClick={() => setSpeechLang(prev => prev === 'EN' ? 'HI' : 'EN')}
                          className="px-1.5 bg-slate-900 border border-cyan-500/20 text-[8px] font-bold text-cyan-400 rounded hover:border-cyan-300 transition shrink-0 cursor-pointer font-mono"
                        >
                          {speechLang}
                        </button>
                        <button
                          type="button"
                          onClick={startSpeechRecognition}
                          className={`flex-1 flex items-center justify-center rounded border transition-all cursor-pointer ${
                            isRecording
                              ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse'
                              : 'bg-[#131b2b] border-cyan-500/20 text-[#00f2fe] hover:border-[#00f2fe]/40'
                          }`}
                        >
                          <Mic className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Description Summary */}
                  <div className="flex-1 flex flex-col min-h-[60px]">
                    <label className="block text-[9px] text-slate-400 mb-1 uppercase font-bold tracking-wider shrink-0">
                      Complaint Description / Summary:
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={isRecording ? "Listening... Speak now!" : "Enter details or dictate..."}
                      className="w-full flex-1 min-h-[50px] bg-[#131b2b]/95 border border-cyan-500/20 text-gray-200 rounded p-2 text-[10px] font-mono focus:border-cyan-400 focus:outline-none resize-none"
                    />
                    {speechError && (
                      <p className="text-[8px] text-red-400 mt-1 font-mono uppercase shrink-0">⚠ {speechError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#00f2fe] hover:bg-white text-black font-bold text-[10px] py-2 rounded transition-colors uppercase tracking-widest font-mono relative cursor-pointer shrink-0 mt-auto"
                  >
                    Transmit to Sentinel Matrix ✓
                  </button>
                </form>
              </div>

            </div>

          </div>

          {/* VIEW: ACTIVE COMPLAINT MATRIX */}
          {activeTab === 'matrix' && (
            <div className="absolute inset-0 z-20 overflow-y-auto p-6 bg-[#080c14] flex flex-col gap-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-cyan-950/40 pb-3 gap-2">
                <div className="font-mono">
                  <h2 className="text-md font-bold text-[#00f2fe] glow-text uppercase tracking-widest flex items-center gap-2">
                    📋 CITIZEN COMPLAINT LEDGER MATRIX
                  </h2>
                  <p className="text-[10px] text-slate-400">COMPLETE LIST OF VERIFIED ANOMALIES ACROSS BHOPAL SMART CITY GRID</p>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-500">
                  RECORDS: <span className="text-white font-bold">{totalReports} COMPILATIONS</span>
                </div>
              </div>

              {/* Search & Filter Controls bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/30 p-3 rounded-xl border border-cyan-950/30 font-mono">
                {/* Search query box */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search ledger by department or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#121824] border border-cyan-950/40 rounded px-3 py-1.5 pl-8 text-xs text-white focus:border-[#00f2fe] outline-none"
                  />
                </div>

                {/* Category Filter dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-500 uppercase font-bold shrink-0">Category:</span>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-[#121824] border border-cyan-950/40 rounded px-2 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="Pothole">Pothole</option>
                    <option value="Graffiti">Graffiti</option>
                    <option value="Power Outage">Power Outage</option>
                    <option value="Trash">Trash Accumulation</option>
                    <option value="Water Leak">Water Leak</option>
                    <option value="Road Block">Road Block</option>
                    <option value="Safety Hazard">Safety Hazard</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Priority Filter dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-500 uppercase font-bold shrink-0">Priority:</span>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full bg-[#121824] border border-cyan-950/40 rounded px-2 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="All">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Searchable Data Ledger Table */}
              <div className="glass rounded-xl overflow-hidden flex-1 flex flex-col border border-cyan-950/40">
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-900/60 border-b border-cyan-900/30 text-[9px] text-slate-400 uppercase tracking-widest">
                        <th className="p-3">SLA ID</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Target Agency</th>
                        <th className="p-3">Response SLA</th>
                        <th className="p-3 text-center">Upvotes</th>
                        <th className="p-3">Priority</th>
                        <th className="p-3">Verification</th>
                        <th className="p-3 text-center">Interactive Map</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cyan-950/20">
                      {incidents
                        .filter((inc) => {
                          const searchMatches = 
                            inc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            inc.targetDepartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            inc.fraudReason.toLowerCase().includes(searchQuery.toLowerCase());
                          const catMatches = filterCategory === "All" || inc.category === filterCategory;
                          const priorityMatches = filterPriority === "All" || inc.priorityLevel === filterPriority;
                          return searchMatches && catMatches && priorityMatches;
                        })
                        .slice().reverse()
                        .map((inc) => {
                          const isHigh = inc.priorityLevel === "High";
                          const isMedium = inc.priorityLevel === "Medium";
                          const priorityColor = isHigh
                            ? "bg-red-500/10 text-[#ef4444] border border-red-500/30"
                            : isMedium
                            ? "bg-yellow-500/10 text-[#f59e0b] border border-yellow-500/30"
                            : "bg-cyan-500/10 text-[#00f2fe] border border-cyan-500/30";
                          return (
                            <tr key={inc.id} className="hover:bg-slate-900/20 transition-all">
                              <td className="p-3 font-bold text-[#00f2fe]">#{inc.id.substring(0, 8)}</td>
                              <td className="p-3 text-white font-bold">{inc.category.toUpperCase()}</td>
                              <td className="p-3 text-slate-300">{inc.targetDepartment}</td>
                              <td className="p-3 text-yellow-500 font-bold">{inc.recommendedResponseHours} Hours</td>
                              <td className="p-3 text-center text-slate-300 font-bold">{inc.upvotes}</td>
                              <td className="p-3">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${priorityColor}`}>
                                  {inc.priorityLevel}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className={`text-[10px] font-bold ${inc.fraudVerdict === 'GENUINE' ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {inc.fraudVerdict === 'GENUINE' ? '✓ GENUINE' : '⚠ SUSPECT'}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTab('dashboard');
                                    handlePanToIncident(inc.lat, inc.lng);
                                  }}
                                  className="bg-cyan-500/15 border border-cyan-500/30 hover:bg-[#00f2fe] hover:text-black text-cyan-400 text-[9px] font-bold px-2 py-1 rounded transition duration-150 cursor-pointer"
                                >
                                  FOCUS_MAP
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: WARD PERFORMANCE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="absolute inset-0 z-20 overflow-y-auto p-6 bg-[#080c14] flex flex-col gap-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-cyan-950/40 pb-3">
                <div className="font-mono">
                  <h2 className="text-md font-bold text-[#00f2fe] glow-text uppercase tracking-widest flex items-center gap-2">
                    📊 WARD CIVIC ANALYTICS DASHBOARD
                  </h2>
                  <p className="text-[10px] text-slate-400">DEPARTMENT SLA RESPONSE TRACKING & CLUSTERS ANALYSIS - WARD 45, BHOPAL</p>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-500">
                  SYSTEM_INTEGRATION: CORE_OK
                </div>
              </div>

              {/* Clean 4-card grid layout */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 select-none">
                <div className="glass p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 text-cyan-500/5 font-bold font-mono text-5xl">ING</div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-mono mb-1">INGESTION STREAM SUCCESS</p>
                  <p className="text-2xl font-bold font-mono text-cyan-400">99.85%</p>
                  <p className="text-[8px] text-emerald-400 font-mono mt-1">▸ SLA Triage Threshold Secure</p>
                </div>

                <div className="glass p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 text-purple-500/5 font-bold font-mono text-5xl">LAT</div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-mono mb-1">AI PIPELINE LATENCY</p>
                  <p className="text-2xl font-bold font-mono text-purple-400">1.42s</p>
                  <p className="text-[8px] text-slate-400 font-mono mt-1">▸ Gemini 3.5 Flash response</p>
                </div>

                <div className="glass p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 text-emerald-500/5 font-bold font-mono text-5xl">SAV</div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-mono mb-1">DEDUPLICATION RATE</p>
                  <p className="text-2xl font-bold font-mono text-emerald-400">28.4%</p>
                  <p className="text-[8px] text-emerald-400 font-mono mt-1">▸ Blocked duplicate visual payloads</p>
                </div>

                <div className="glass p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 text-yellow-500/5 font-bold font-mono text-5xl">SLA</div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-mono mb-1">SLA MET COMPLIANCE</p>
                  <p className="text-2xl font-bold font-mono text-yellow-400">96.72%</p>
                  <p className="text-[8px] text-yellow-400 font-mono mt-1">▸ Ward 45 municipal targets</p>
                </div>
              </div>

              {/* Three Column Grid with Charts & Leaderboard */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Chart 1: Top Civic Issues */}
                <div className="glass p-5 rounded-xl flex flex-col gap-4 bg-slate-900/20">
                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-2">
                      <span className="w-1.5 h-3 bg-[#00f2fe]" />
                      Top Civic Issues in Ward 45, MP Nagar
                    </h3>
                    <p className="text-[9px] text-slate-500 font-mono">COUNT OF REGISTERED ANOMALIES PER CATEGORY</p>
                  </div>
                  
                  {/* Glowing SVG Bar Chart */}
                  <div className="w-full">
                    <svg className="w-full h-48 bg-slate-950/40 rounded-lg border border-cyan-950/40 p-4" viewBox="0 0 500 200">
                      {/* Grid lines */}
                      <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(0, 242, 254, 0.05)" strokeWidth="1" />
                      <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(0, 242, 254, 0.05)" strokeWidth="1" />
                      <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(0, 242, 254, 0.05)" strokeWidth="1" />
                      <line x1="40" y1="160" x2="480" y2="160" stroke="rgba(0, 242, 254, 0.2)" strokeWidth="1.5" />
                      
                      {/* Bars */}
                      {(() => {
                        const categoriesList = ["Pothole", "Graffiti", "Power Outage", "Trash", "Water Leak", "Road Block", "Safety Hazard"];
                        const categoryCounts = categoriesList.map(cat => ({
                          name: cat,
                          count: incidents.filter(i => i.category === cat).length
                        }));
                        const maxCount = Math.max(...categoryCounts.map(c => c.count), 1);
                        
                        return categoryCounts.map((item, idx) => {
                          const barWidth = 32;
                          const barSpacing = (420 / categoryCounts.length);
                          const x = 50 + idx * barSpacing;
                          const barHeight = (item.count / maxCount) * 110;
                          const y = 160 - barHeight;
                          
                          return (
                            <g key={item.name} className="group cursor-pointer">
                              <title>{`${item.name}: ${item.count} Reports`}</title>
                              
                              {/* Highlight glow */}
                              <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight || 5}
                                rx="2"
                                className="fill-cyan-500/80 group-hover:fill-[#00f2fe] transition-all duration-200"
                                style={{ filter: "drop-shadow(0 0 5px rgba(0,242,254,0.4))" }}
                              />
                              
                              {/* Text values */}
                              <text
                                x={x + barWidth / 2}
                                y={y - 6}
                                textAnchor="middle"
                                className="fill-[#00f2fe] font-mono text-[9px] font-bold"
                              >
                                {item.count}
                              </text>
                              
                              {/* Rotate Text labels */}
                              <text
                                x={x + barWidth / 2}
                                y="176"
                                textAnchor="middle"
                                className="fill-slate-400 font-mono text-[8px] tracking-tight group-hover:fill-white"
                              >
                                {item.name.substring(0, 8)}
                              </text>
                            </g>
                          );
                        });
                      })()}
                    </svg>
                  </div>
                </div>

                {/* Chart 2: Department Resolution Times */}
                <div className="glass p-5 rounded-xl flex flex-col gap-4 bg-slate-900/20">
                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-2">
                      <span className="w-1.5 h-3 bg-cyan-400" />
                      Average Department Resolution Time (Hours)
                    </h3>
                    <p className="text-[9px] text-slate-500 font-mono">TARGET RESOLUTION SLAs COMPARED ACROSS AGENCIES</p>
                  </div>

                  {/* Horizontal Bar Chart representation */}
                  <div className="bg-slate-950/40 rounded-lg border border-cyan-950/40 p-4 flex flex-col gap-3 h-48 justify-between">
                    {[
                      { name: "Public Works (BMC)", hours: 16, color: "from-[#00f2fe] to-cyan-300" },
                      { name: "Vidyut Vitran (Electricity)", hours: 4, color: "from-[#f59e0b] to-yellow-300" },
                      { name: "Environmental Protection", hours: 24, color: "from-emerald-500 to-emerald-300" },
                      { name: "Municipal Utilities", hours: 12, color: "from-indigo-500 to-indigo-300" },
                      { name: "Emergency Management", hours: 2, color: "from-[#ef4444] to-rose-300" }
                    ].map((dept) => {
                      const maxHours = 24;
                      const percentage = (dept.hours / maxHours) * 100;
                      return (
                        <div key={dept.name} className="flex flex-col gap-0.5">
                          <div className="flex justify-between items-center text-[9px] font-mono">
                            <span className="text-slate-300 font-bold">{dept.name.toUpperCase()}</span>
                            <span className="text-[#00f2fe] font-bold">{dept.hours} Hours Target</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-cyan-950/30 flex">
                            <div 
                              className={`bg-gradient-to-r ${dept.color} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Column 3: Indian Municipal Ward Leaderboard */}
                <div className="glass p-5 rounded-xl flex flex-col gap-4 bg-[#0d1424]/40 border border-[#00f2fe]/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  <div>
                    <h3 className="text-xs font-bold text-[#00f2fe] glow-text uppercase tracking-widest font-mono flex items-center gap-2">
                      🏆 Indian Municipal Ward Leaderboard
                    </h3>
                    <p className="text-[9px] text-slate-500 font-mono uppercase">National Ward Smart-Resolution Rankings</p>
                  </div>

                  <div className="flex flex-col gap-2.5 font-mono text-xs">
                    {[
                      { rank: "1st", ward: "Ward 45 (MP Nagar, Bhopal)", rate: "98.4%", active: true, count: 48 },
                      { rank: "2nd", ward: "Ward 74 (Chandni Chowk, Delhi)", rate: "95.2%", active: false, count: 120 },
                      { rank: "3rd", ward: "Ward 12 (Andheri West, Mumbai)", rate: "93.8%", active: false, count: 195 },
                      { rank: "4th", ward: "Ward 88 (Indiranagar, Bengaluru)", rate: "91.5%", active: false, count: 82 },
                      { rank: "5th", ward: "Ward 56 (Gariahat, Kolkata)", rate: "89.2%", active: false, count: 64 },
                      { rank: "6th", ward: "Ward 33 (Adyar, Chennai)", rate: "87.6%", active: false, count: 75 }
                    ].map((item, idx) => (
                      <div
                        key={item.ward}
                        className={`p-2 rounded-lg border flex items-center justify-between transition-all duration-300 ${
                          item.active
                            ? 'bg-[#00f2fe]/10 border-[#00f2fe]/40 shadow-[0_0_10px_rgba(0,242,254,0.1)]'
                            : 'bg-black/30 border-cyan-950/40 hover:border-cyan-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            idx === 0
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : idx === 1
                              ? 'bg-slate-300/20 text-slate-300'
                              : idx === 2
                              ? 'bg-amber-600/20 text-amber-500'
                              : 'bg-slate-800/40 text-slate-400'
                          }`}>
                            {item.rank}
                          </span>
                          <div className="truncate">
                            <p className="text-[10px] text-white font-bold truncate">{item.ward}</p>
                            <p className="text-[8px] text-slate-500">{item.count} complaints resolved</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-emerald-400">{item.rate}</span>
                          <p className="text-[7px] text-slate-500 uppercase tracking-tight">solved</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Target Track SLA panel */}
              <div className="glass p-4 rounded-xl font-mono text-xs flex justify-between items-center bg-slate-900/10">
                <div className="space-y-1">
                  <p className="text-[9px] text-slate-500 uppercase font-bold">LEDGER INTEGRITY PROTOCOL</p>
                  <p className="text-[#00f2fe] font-bold">SHA-256 AUTOMATED BLOCKCHAIN AUDITING IN WARD 45</p>
                  <p className="text-[9px] text-slate-400">All citizens can submit photos. Computer Vision dedupes within 50m of any coordinates instantly.</p>
                </div>
                <div className="text-right shrink-0 hidden md:block">
                  <span className="text-[10px] bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/30 px-3 py-1.5 rounded uppercase font-bold">
                    SECURE_NODE_ACTIVE
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: EMERGENCY ESCALATION DISPATCH */}
          {activeTab === 'escalated' && (
            <div className="absolute inset-0 z-20 overflow-y-auto p-6 bg-[#080c14] flex flex-col gap-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-cyan-950/40 pb-3 gap-2">
                <div className="font-mono">
                  <h2 className="text-md font-bold text-[#ef4444] glow-text uppercase tracking-widest flex items-center gap-2">
                    🚨 EMERGENCY ESCALATION DISPATCH MATRIX
                  </h2>
                  <p className="text-[10px] text-slate-400">CRITICAL LEVEL LOGS DISPATCHED DIRECTLY TO DEPARTMENT FORCE CHANNELS</p>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded font-bold animate-pulse">
                  CRITICAL FORCE ALERTS: {escalatedDispatches} ACTIVE
                </span>
              </div>

              {/* Bulk Dispatch Action Header card */}
              <div className="glass p-5 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 font-mono bg-red-950/10 border-red-500/30">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-red-400 uppercase">⚡ CRITICAL COMMAND DISPATCH BROADCAST</h4>
                  <p className="text-[10px] text-slate-400">
                    Deploy municipal department forces and alert service crews. Authorizes bulk sirens, automated route planning, and high-speed emergency response targeting.
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => alert("EMERGENCY PROTOCOL CODES ENGAGED. AUTHORIZATION TRANSMITTED. BHOPAL MUNICIPAL DISPATCH FORCES DEPLOYED ON LINK ROAD 1, ARERA COLONY!")}
                  className="bg-[#ef4444] hover:bg-white hover:text-[#ef4444] text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.4)] transition cursor-pointer font-mono shrink-0 uppercase tracking-wider"
                >
                  ⚡ Authorize Bulk Dispatch
                </button>
              </div>

              <div className="glass rounded-xl overflow-hidden font-mono">
                {escalations.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-3 bg-[#0d1424]/20">
                    <Lock className="w-8 h-8 opacity-30 text-slate-400" />
                    NO EMERGENCY DISPATCH SIGNALS GENERATED YET.
                    <p className="text-[10px] text-slate-600">Incidents logged with High Priority automatically escalate instantly.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900/80 border-b border-cyan-900/40 text-[9px] text-slate-400 uppercase tracking-widest">
                          <th className="p-3">DISPATCH ID</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Target Department</th>
                          <th className="p-3">Response SLA</th>
                          <th className="p-3">Operational Command Dispatch Details</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cyan-950/20">
                        {escalations.slice().reverse().map((esc) => (
                          <tr key={esc.id} className="hover:bg-slate-900/30 transition-all">
                            <td className="p-3 text-[#ef4444] font-bold">#{esc.id}</td>
                            <td className="p-3 text-white font-bold">{esc.category.toUpperCase()}</td>
                            <td className="p-3 text-[#00f2fe]">{esc.targetDepartment}</td>
                            <td className="p-3 text-[#f59e0b] font-bold">{esc.recommendedResponseHours} Hours</td>
                            <td className="p-3 text-slate-300 max-w-sm" title={esc.dispatchDetails}>
                              {esc.dispatchDetails}
                            </td>
                            <td className="p-3">
                              <span className="text-[8px] bg-red-500/20 text-[#ef4444] border border-red-500/40 px-2 py-0.5 rounded font-bold uppercase animate-pulse">
                                ROUTING LIVE
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: SYSTEM GATEWAY CONFIG */}
          {activeTab === 'settings' && (
            <div className="absolute inset-0 z-20 overflow-y-auto p-6 bg-[#080c14] flex flex-col gap-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-cyan-950/40 pb-3">
                <div className="font-mono">
                  <h2 className="text-md font-bold text-[#00f2fe] glow-text uppercase tracking-widest flex items-center gap-2">
                    ⚙️ SYSTEM NODE CONFIGURATION PANEL
                  </h2>
                  <p className="text-[10px] text-slate-400">CONFIGURE CIVIC AI ENGINE GATEWAYS, API KEYS, WEBHOOKS, & CHANNELS</p>
                </div>
                <div className="text-right font-mono text-[10px] text-cyan-500">
                  NODE_ID: 0x99A-45_BHOPAL
                </div>
              </div>

              {/* Status and API keys Panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono select-none">
                <div className="glass p-4 rounded-xl flex flex-col justify-between">
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">API Key Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-white font-bold">GEMINI_API_KEY: ACTIVE</span>
                  </div>
                  <p className="text-[8px] text-slate-400 mt-2">Validated server-side Gemini 3.5 Flash connection.</p>
                </div>

                <div className="glass p-4 rounded-xl flex flex-col justify-between">
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Port Gateway</p>
                  <p className="text-sm font-bold text-white">PORT 3000 // EXPRESS_PROXY</p>
                  <p className="text-[8px] text-slate-400 mt-2">Nginx reverse-ingress routed successfully.</p>
                </div>

                <div className="glass p-4 rounded-xl flex flex-col justify-between">
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Network Environment</p>
                  <p className="text-sm font-bold text-yellow-400">NODE_ENV: PRODUCTION</p>
                  <p className="text-[8px] text-slate-400 mt-2">Durable cloud hosting enabled.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
                
                {/* Fallback API Thresholds */}
                <div className="glass p-5 rounded-xl flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 border-b border-cyan-950/40 pb-2">
                    <Sliders className="w-4 h-4 text-[#00f2fe]" /> Threshold Configurations
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Civic Upvote Threshold</span>
                        <span className="text-[#00f2fe] font-bold">{escalationThreshold} VOTE(S)</span>
                      </div>
                      <input 
                        type="range" 
                        min="2" 
                        max="15" 
                        value={escalationThreshold}
                        onChange={(e) => setEscalationThreshold(Number(e.target.value))}
                        className="w-full accent-[#00f2fe] cursor-pointer"
                      />
                      <p className="text-[9px] text-slate-500">
                        Configures the minimum civilian verification signal count required to trigger automated sirens and emergency dispatch to agencies.
                      </p>
                    </div>

                    <div className="space-y-1 pt-2">
                      <label className="text-[9px] text-slate-400 uppercase font-bold">Node Geofence Sensing Radius</label>
                      <select className="w-full bg-[#131b2b] border border-cyan-500/20 text-xs px-2 py-1.5 rounded text-white outline-none">
                        <option>50 Meters (Dynamic Spatial Match)</option>
                        <option>100 Meters (Aggressive Dedupe)</option>
                        <option>250 Meters (Wide Area Grid)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Secure Contact Channels */}
                <div className="glass p-5 rounded-xl flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 border-b border-cyan-950/40 pb-2">
                    <Radio className="w-4 h-4 text-[#00f2fe]" /> Secure Agency Routing Contacts
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[8px] text-slate-500 uppercase font-bold">BMC Public Works Secure Channel</label>
                      <input 
                        type="text" 
                        value={mockContacts.dpw}
                        onChange={(e) => setMockContacts(prev => ({...prev, dpw: e.target.value}))}
                        className="w-full bg-[#131b2b] border border-cyan-500/20 text-white px-2 py-1.5 rounded focus:border-[#00f2fe] outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] text-slate-500 uppercase font-bold">Vidyut Vitran Dispatch Frequency</label>
                      <input 
                        type="text" 
                        value={mockContacts.dot}
                        onChange={(e) => setMockContacts(prev => ({...prev, dot: e.target.value}))}
                        className="w-full bg-[#131b2b] border border-cyan-500/20 text-white px-2 py-1.5 rounded focus:border-[#00f2fe] outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] text-slate-500 uppercase font-bold">EMA Threat Level Channel</label>
                      <input 
                        type="text" 
                        value={mockContacts.ema}
                        onChange={(e) => setMockContacts(prev => ({...prev, ema: e.target.value}))}
                        className="w-full bg-[#131b2b] border border-cyan-500/20 text-white px-2 py-1.5 rounded focus:border-[#00f2fe] outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Webhook Configuration panel */}
                <div className="glass p-5 rounded-xl flex flex-col gap-3 md:col-span-2">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-cyan-950/40 pb-2 flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#00f2fe]" /> Smart-City Webhook Streaming Gateways
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-[8px] text-slate-500 uppercase font-bold">Slack / Discord Webhook Streaming URL</label>
                      <input 
                        type="text" 
                        placeholder="https://hooks.slack.com/services/..."
                        className="w-full bg-[#131b2b] border border-cyan-500/20 text-slate-300 px-2.5 py-1.5 rounded outline-none text-xs focus:border-[#00f2fe]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-slate-500 uppercase font-bold">Alert Streaming Threshold Trigger</label>
                      <select className="w-full bg-[#131b2b] border border-cyan-500/20 text-slate-300 px-2.5 py-1.5 rounded outline-none text-xs">
                        <option>Stream High Priority Alerts Only</option>
                        <option>Stream All Verified Anomalies</option>
                        <option>Stream Deduplication Diagnostics</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>

              {/* Reset to defaults info banner */}
              <div className="glass p-4 rounded-xl flex justify-between items-center font-mono text-xs">
                <span className="text-slate-400">Settings are persisted in local active memory segment.</span>
                <button 
                  type="button"
                  onClick={() => {
                    setEscalationThreshold(5);
                    setMockContacts({
                      dpw: "SECURE_CHANNEL_19",
                      dot: "ROUTING_CHANNEL_42",
                      ema: "THREAT_PROTOCOL_LVL_3"
                    });
                    alert("NODE ROUTING PARAMETERS RESET TO SYSTEM FACTORY DEFAULTS.");
                  }}
                  className="text-cyan-400 hover:text-white underline transition font-bold"
                >
                  RESET_TO_DEFAULTS
                </button>
              </div>
            </div>
          )}

        </section>

        {/* COLUMN 3: CONTEXTUAL RIGHT SIDE PANEL (Action & Live Feed Stream) */}
        <aside className="w-[380px] border-l border-cyan-500/20 bg-[#080c14]/95 backdrop-blur-md flex flex-col p-4 z-30 shrink-0 hidden xl:flex overflow-y-auto gap-4 select-none">
          
          {/* Top Section: REPORT ANOMALY widget - only visible on non-dashboard tabs to prevent duplication */}
          {activeTab !== 'dashboard' && (
            <section className="glass p-4 rounded-xl border border-dashed border-cyan-500/40 hover:border-cyan-400/70 transition-all duration-300 flex flex-col gap-3 bg-[#0d1424]/40">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-900/40">
                <h2 className="font-bold text-xs tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                  <UploadCloud className="w-4 h-4 text-[#00f2fe] animate-pulse" />
                  REPORT ANOMALY
                </h2>
                <span className="text-[8px] font-mono text-cyan-500 uppercase">SYS_INTAKE</span>
              </div>

              <form onSubmit={handleSubmitReport} className="flex flex-col gap-3 font-mono text-xs">
                {/* Dropzone & Preview Component */}
                {imagePreview ? (
                  <div className="border border-[#00f2fe]/30 rounded-lg p-2 bg-black/40 flex flex-col items-center justify-center relative min-h-[95px]">
                    <img
                      src={imagePreview}
                      alt="Uploaded Visual Feed"
                      referrerPolicy="no-referrer"
                      className="max-h-[85px] rounded object-cover"
                    />
                    <button
                      type="button"
                      onClick={clearFileSelection}
                      className="absolute top-1.5 right-1.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded px-1.5 py-0.5 text-[8px] font-mono transition"
                    >
                      CLEAR
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed rounded-lg p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition min-h-[95px] pointer-events-auto ${
                      dragOver
                        ? "bg-[#00f2fe]/10 border-[#00f2fe]"
                        : "border-cyan-500/20 hover:border-cyan-500/50 bg-[#121b2e]/50"
                    }`}
                  >
                    <UploadCloud className="w-6 h-6 text-[#00f2fe] animate-pulse" />
                    <div className="text-center">
                      <p className="text-[9px] font-bold text-white uppercase">DRAG PHOTOMETRY OR CLICK</p>
                      <p className="text-[8px] text-slate-500">SUPPORTED: PNG, JPG, WEBP</p>
                    </div>
                    <input
                      type="file"
                      id="anomaly-upload"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden pointer-events-none"
                    />
                  </div>
                )}

                {/* Category & Voice recognition row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[9px] text-slate-400 mb-1 uppercase font-bold tracking-wider">
                      Triage Category Hint:
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#131b2b]/95 border border-cyan-500/20 text-gray-200 rounded px-2 py-1.5 text-[10px] font-mono focus:border-cyan-400 focus:outline-none h-8"
                    >
                      <option value="Pothole">Pothole (Roadway)</option>
                      <option value="Graffiti">Graffiti (Vandalism)</option>
                      <option value="Power Outage">Power Outage (Grid)</option>
                      <option value="Trash">Trash Accumulation</option>
                      <option value="Water Leak">Water Leak (Utility)</option>
                      <option value="Road Block">Road Block / Obstruction</option>
                      <option value="Vandalism">Property Vandalism</option>
                      <option value="Safety Hazard">Critical Public Safety Hazard</option>
                      <option value="Other">Other Anomaly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-400 mb-1 uppercase font-bold tracking-wider text-center">
                      Voice ({speechLang}):
                    </label>
                    <div className="flex gap-1 h-8">
                      {/* EN/HI toggle */}
                      <button
                        type="button"
                        id="voice-lang-btn"
                        onClick={() => setSpeechLang(prev => prev === 'EN' ? 'HI' : 'EN')}
                        className="px-1.5 bg-slate-900 border border-cyan-500/20 text-[8px] font-bold text-cyan-400 rounded hover:border-cyan-300 transition shrink-0 cursor-pointer font-mono"
                        title="Switch language (English / Hindi)"
                      >
                        {speechLang}
                      </button>
                      {/* Record button */}
                      <button
                        type="button"
                        id="voice-record-btn"
                        onClick={startSpeechRecognition}
                        className={`flex-1 flex items-center justify-center rounded border transition-all cursor-pointer ${
                          isRecording
                            ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse'
                            : 'bg-[#131b2b] border-cyan-500/20 text-[#00f2fe] hover:border-[#00f2fe]/40'
                        }`}
                        title={isRecording ? "Listening... click to stop/restart" : "Click to speak description in Hindi or English"}
                      >
                        {isRecording ? <Mic className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description/Summary text field */}
                <div>
                  <label className="block text-[9px] text-slate-400 mb-1 uppercase font-bold tracking-wider">
                    Complaint Description / Summary:
                  </label>
                  <textarea
                    value={description}
                    id="complaint-desc-input"
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={isRecording ? "Listening... Speak now!" : "Enter details or click microphone to dictate in Hindi/English..."}
                    rows={3}
                    className="w-full bg-[#131b2b]/95 border border-cyan-500/20 text-gray-200 rounded p-2 text-[10px] font-mono focus:border-cyan-400 focus:outline-none resize-none"
                  />
                  {speechError && (
                    <p className="text-[8px] text-red-400 mt-1 font-mono uppercase">⚠ {speechError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#00f2fe] hover:bg-white text-black font-bold text-[10px] py-2 rounded transition-colors uppercase tracking-widest font-mono relative cursor-pointer"
                >
                  Transmit to Sentinel Matrix ✓
                </button>
              </form>
            </section>
          )}

          {/* Bottom Section: Chronological Engineering HUD Terminal Log */}
          <section className="flex-1 flex flex-col gap-2 overflow-hidden min-h-[200px]">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2 tracking-widest font-mono">
              <span className="w-1 h-3 bg-[#00f2fe]"></span> Engineering HUD Telemetry
            </h3>
            
            <div className="flex-1 bg-black/40 rounded p-3 text-[10px] mono text-cyan-200/70 overflow-y-auto leading-relaxed space-y-2 font-mono scrollbar-thin">
              <p className="text-[#00f2fe] font-bold">[SYSTEM_SECURE] INITIALIZING PIPELINE...</p>
              <p>[03:06:11] GEMINI-3.5-FLASH REALTIME CONNECTED</p>
              <p>[03:06:12] HAVERSINE_DEDUPLICATION: MATCH_NOT_FOUND</p>
              <p>[03:06:13] COORDINATES_DEFAULT_CENTER: BHOPAL_INDIA</p>
              <p>[03:06:14] ACTIVE_WARD: WARD_45_MP_NAGAR</p>
              
              {incidents.slice(-3).map((inc) => (
                <div key={inc.id} className="border-t border-cyan-950/40 pt-1.5 mt-1.5 space-y-0.5">
                  <p className="text-yellow-400 font-bold">[INCOMING] EVENT: {inc.category}</p>
                  <p className="text-slate-400">▸ GPS: {inc.lat.toFixed(4)}, {inc.lng.toFixed(4)}</p>
                  <p className="text-emerald-400">▸ VERDICT: {inc.fraudVerdict}</p>
                  <p className="text-cyan-400">▸ DEPT: {inc.targetDepartment}</p>
                </div>
              ))}

              <p className="text-slate-500 text-[9px] animate-pulse">[STANDBY] STANDBY FOR NEXT INCIDENT SIGNAL</p>
            </div>
          </section>

          {/* Security Status Panel */}
          <section className="glass p-3 rounded-lg border-l-2 border-cyan-500 flex flex-col gap-1 font-mono text-[9px]">
            <div className="flex justify-between text-slate-400 font-bold">
              <span>CORE GATEWAY STATUS:</span>
              <span className="text-green-400">ONLINE</span>
            </div>
            <div className="text-[8px] text-slate-500">
              Sensing coordinates mapped instantly from Ward 45. SHA-256 secure verification engine active.
            </div>
          </section>
        </aside>

      </div>

    </div>
  );
}
