import { useState } from "react";
import { X, User, Shield, UploadCloud, FileText, CheckCircle2 } from "lucide-react";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<"general" | "biodata">("general");
    const [documents, setDocuments] = useState<string[]>([]);

    if (!isOpen) return null;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setDocuments(prev => [...prev, e.target.files![0].name]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-4xl h-[600px] bg-background border border-border rounded-xl shadow-2xl flex overflow-hidden animate-slide-down">

                {/* Left Sidebar */}
                <div className="w-64 bg-secondary/30 flex flex-col pt-6 border-r border-border">
                    <h2 className="px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Settings</h2>
                    <nav className="flex-1 px-4 space-y-1">
                        <button
                            onClick={() => setActiveTab("general")}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "general" ? "bg-primary/20 text-primary" : "text-foreground hover:bg-secondary/50"
                                }`}
                        >
                            <Shield className="w-4 h-4" />
                            General
                        </button>
                        <button
                            onClick={() => setActiveTab("biodata")}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "biodata" ? "bg-primary/20 text-primary" : "text-foreground hover:bg-secondary/50"
                                }`}
                        >
                            <User className="w-4 h-4" />
                            Bio-Data Context
                        </button>
                    </nav>
                </div>

                {/* Right Content */}
                <div className="flex-1 flex flex-col relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-10 flex-1 overflow-y-auto">
                        {activeTab === "general" && (
                            <div className="space-y-6 max-w-2xl">
                                <h3 className="text-2xl font-bold border-b border-border pb-4">General Settings</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-foreground">AeroGuard Strict Protocol</p>
                                            <p className="text-sm text-muted-foreground">Force AI to prioritize safety parameters</p>
                                        </div>
                                        <div className="w-10 h-5 bg-primary rounded-full relative shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                                            <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "biodata" && (
                            <div className="space-y-6 max-w-2xl animate-fade-in">
                                <h3 className="text-2xl font-bold border-b border-border pb-4">Health Bio-Data Input</h3>
                                <p className="text-sm text-muted-foreground">
                                    Upload patient medical files securely. This context directly feeds into AeroGuard AI overriding the default severity protocols, tailoring the AQI Survival Assessment directly to the user's specific documented conditions.
                                </p>

                                <div className="mt-8 border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center bg-secondary/10 hover:bg-secondary/20 hover:border-primary/50 transition-all group">
                                    <UploadCloud className="w-10 h-10 text-muted-foreground group-hover:text-primary mb-4 transition-colors" />
                                    <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                                    <p className="text-xs text-muted-foreground mb-4">PDF, DOCX, TXT</p>
                                    <label className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all">
                                        Select Documents
                                        <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} />
                                    </label>
                                </div>

                                {documents.length > 0 && (
                                    <div className="mt-6 space-y-3">
                                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Saved Context Documents</h4>
                                        {documents.map((doc, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 border border-border rounded-lg animate-in slide-in-from-bottom flex-row">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-4 h-4 text-primary" />
                                                    <span className="text-sm font-medium">{doc}</span>
                                                </div>
                                                <CheckCircle2 className="w-4 h-4 text-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
