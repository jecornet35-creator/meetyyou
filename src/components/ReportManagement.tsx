import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Flag,
  ChevronDown,
  Search,
  Filter,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { motion } from 'motion/react';
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

export default function ReportManagement() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Tous les statuts');

  const fetchReports = async () => {
    try {
      const data = await api.get('reports');
      setReports(data || []);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDeleteReport = async (reportId) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce signalement ?")) {
      try {
        const updatedReports = reports.filter(r => r.id !== reportId);
        await api.save('reports', updatedReports);
        setReports(updatedReports);
        toast.success("Signalement supprimé");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      const updatedReports = reports.map(r => 
        r.id === reportId ? { ...r, status: 'Résolu' } : r
      );
      await api.save('reports', updatedReports);
      setReports(updatedReports);
      toast.success("Signalement marqué comme résolu");
    } catch (error) {
      toast.error("Erreur lors de la résolution");
    }
  };

  const filteredReports = reports.filter(r => {
    if (statusFilter === 'Tous les statuts') return true;
    return r.status === statusFilter;
  });

  const pendingCount = reports.filter(r => !r.status || r.status === 'En attente').length;
  const resolvedCount = reports.filter(r => r.status === 'Résolu').length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Signalements</h1>
        <p className="text-neutral-500">Gérez les signalements des utilisateurs</p>
      </header>

      {/* Stats Grid */}
      <div className="flex flex-wrap gap-6 mb-8">
        <StatCard icon={Clock} label="En attente" value={pendingCount} color="text-yellow-600" bgColor="bg-yellow-50" />
        <StatCard icon={AlertTriangle} label="Urgents" value={reports.filter(r => r.priority === 'Urgente').length} color="text-red-600" bgColor="bg-red-50" />
        <StatCard icon={CheckCircle2} label="Résolus" value={resolvedCount} color="text-emerald-600" bgColor="bg-emerald-50" />
        <StatCard icon={Flag} label="Total" value={reports.length} color="text-neutral-400" bgColor="bg-neutral-50" />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 mb-6 flex flex-wrap gap-4">
        <div className="relative min-w-[200px]">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-white border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 appearance-none text-sm text-neutral-600"
          >
            <option>Tous les statuts</option>
            <option>En attente</option>
            <option>Résolu</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-4 h-4" />
        </div>
      </div>

      {loading ? (
        <div className="p-20 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                <th className="px-6 py-4 border-b border-neutral-100">Utilisateur Signalé</th>
                <th className="px-6 py-4 border-b border-neutral-100">Raison</th>
                <th className="px-6 py-4 border-b border-neutral-100">Date</th>
                <th className="px-6 py-4 border-b border-neutral-100">Statut</th>
                <th className="px-6 py-4 border-b border-neutral-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-neutral-800">{report.reportedUserName}</div>
                    <div className="text-xs text-neutral-400">ID: {report.reportedUserId}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {report.reason}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500">
                    {new Date(report.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      report.status === 'Résolu' ? 'bg-emerald-100 text-emerald-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {report.status || 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {report.status !== 'Résolu' && (
                        <button 
                          onClick={() => handleResolveReport(report.id)}
                          className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Marquer comme résolu"
                        >
                          <CheckCircle className="w-[18px] h-[18px]" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteReport(report.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer le signalement"
                      >
                        <Trash2 className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-20 flex flex-col items-center justify-center text-center">
          <p className="text-neutral-500 text-lg">Aucun signalement trouvé</p>
        </div>
      )}
    </motion.div>
  );
}
