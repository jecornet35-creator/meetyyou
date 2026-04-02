import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Flag,
  MessageSquare,
  Inbox,
  User,
  AlertTriangle,
  MoreVertical,
  Check,
  X,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { toast } from 'sonner';

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4 flex-1 min-w-[200px]">
    <div className={`p-4 rounded-xl ${bgColor} ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h3 className="text-2xl font-bold text-neutral-900">{value}</h3>
      <p className="text-sm text-neutral-500 font-medium">{label}</p>
    </div>
  </div>
);

export default function ReportedConversations() {
  const [activeTab, setActiveTab] = useState('Tous');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedReport, setExpandedReport] = useState(null);

  const tabs = ['Tous', 'En attente', 'En cours', 'Résolu', 'Rejeté'];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await api.get('conversation_reports') || [];
      setReports(Array.isArray(data) ? data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : []);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      toast.error("Erreur lors du chargement des signalements");
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (id, newStatus) => {
    try {
      const updatedReports = reports.map(r => 
        r.id === id ? { ...r, status: newStatus } : r
      );
      await api.save('conversation_reports', updatedReports);
      setReports(updatedReports);
      toast.success(`Signalement marqué comme ${newStatus.toLowerCase()}`);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteReport = async (id) => {
    if (window.confirm("Supprimer ce signalement ?")) {
      try {
        const updatedReports = reports.filter(r => r.id !== id);
        await api.save('conversation_reports', updatedReports);
        setReports(updatedReports);
        toast.success("Signalement supprimé");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const filteredReports = reports.filter(r => 
    activeTab === 'Tous' || r.status === activeTab
  );

  const stats = {
    pending: reports.filter(r => r.status === 'En attente').length,
    resolved: reports.filter(r => r.status === 'Résolu').length,
    total: reports.length
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Conversations signalées</h1>
        <p className="text-neutral-500">Examinez les conversations signalées par les utilisateurs</p>
      </header>

      {/* Stats Grid */}
      <div className="flex flex-wrap gap-6 mb-8">
        <StatCard icon={Clock} label="En attente" value={stats.pending} color="text-yellow-600" bgColor="bg-yellow-50" />
        <StatCard icon={CheckCircle2} label="Résolus" value={stats.resolved} color="text-emerald-600" bgColor="bg-emerald-50" />
        <StatCard icon={Flag} label="Total" value={stats.total} color="text-red-600" bgColor="bg-red-50" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === tab 
                ? 'bg-orange-500 text-white shadow-sm' 
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="text-neutral-200 w-10 h-10" />
            </div>
            <p className="text-neutral-500 text-lg">Aucune conversation signalée</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <motion.div
              layout
              key={report.id}
              className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <img 
                      src={report.reported_profile_photo} 
                      alt={report.reported_profile_name}
                      className="w-12 h-12 rounded-full object-cover border border-neutral-200"
                    />
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full border-2 border-white">
                      <AlertTriangle className="w-2.5 h-2.5" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-neutral-900">{report.reported_profile_name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        report.status === 'En attente' ? 'bg-yellow-100 text-yellow-700' :
                        report.status === 'Résolu' ? 'bg-emerald-100 text-emerald-700' :
                        report.status === 'Rejeté' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Signalé par <span className="font-medium text-neutral-700">{report.reporter_email}</span> • {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    {expandedReport === report.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    Détails
                  </button>
                  
                  <div className="h-8 w-px bg-neutral-100 mx-1" />

                  {report.status === 'En attente' && (
                    <>
                      <button 
                        onClick={() => updateReportStatus(report.id, 'Résolu')}
                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Marquer comme résolu"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => updateReportStatus(report.id, 'Rejeté')}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Rejeter le signalement"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  
                  <button 
                    onClick={() => deleteReport(report.id)}
                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expandedReport === report.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-neutral-50 bg-neutral-50/50"
                  >
                    <div className="p-6 space-y-6">
                      <div>
                        <h5 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Raison du signalement</h5>
                        <p className="text-neutral-700 bg-white p-4 rounded-xl border border-neutral-100 italic">
                          "{report.reason}"
                        </p>
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Derniers messages échangés</h5>
                        <div className="space-y-3">
                          {report.messages && report.messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                                msg.sender === 'me' 
                                  ? 'bg-orange-100 text-orange-800' 
                                  : 'bg-white text-neutral-700 border border-neutral-200'
                              }`}>
                                <p className="text-[10px] font-bold opacity-50 mb-1">
                                  {msg.sender === 'me' ? 'Utilisateur' : report.reported_profile_name} • {msg.time}
                                </p>
                                {msg.text}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
