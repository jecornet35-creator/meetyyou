import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Shield, Award, TrendingUp, Users, Eye, RefreshCw, Loader2, ShieldCheck } from 'lucide-react';
import { updateUserTrustScore } from '@/components/trust/TrustScoreCalculator';
import TrustBadge from '@/components/trust/TrustBadge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminTrustScores() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [detailsDialog, setDetailsDialog] = useState({ open: false, score: null });
  const [recalculating, setRecalculating] = useState(null);

  const { data: trustScores = [], isLoading } = useQuery({
    queryKey: ['trust-scores'],
    queryFn: () => base44.entities.TrustScore.list('-overall_score', 100),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: () => base44.entities.Profile.list('-created_date', 100),
  });

  const recalculateScore = async (userEmail, profileId) => {
    setRecalculating(userEmail);
    try {
      await updateUserTrustScore(userEmail, profileId);
      queryClient.invalidateQueries({ queryKey: ['trust-scores'] });
      toast.success('Score recalculé avec succès');
    } catch (error) {
      toast.error('Erreur lors du recalcul');
    } finally {
      setRecalculating(null);
    }
  };

  const recalculateAll = async () => {
    toast.info('Recalcul de tous les scores...');
    let count = 0;
    for (const profile of profiles.slice(0, 20)) {
      try {
        await updateUserTrustScore(profile.created_by, profile.id);
        count++;
      } catch (error) {
        console.error('Error for', profile.created_by, error);
      }
    }
    queryClient.invalidateQueries({ queryKey: ['trust-scores'] });
    toast.success(`${count} scores recalculés`);
  };

  const filteredScores = trustScores.filter(score =>
    score.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const excellentCount = trustScores.filter(s => s.trust_level === 'excellent').length;
  const highCount = trustScores.filter(s => s.trust_level === 'high').length;
  const averageScore = trustScores.length > 0 
    ? Math.round(trustScores.reduce((sum, s) => sum + s.overall_score, 0) / trustScores.length)
    : 0;

  const getTrustLevelColor = (level) => {
    const colors = {
      excellent: 'bg-amber-100 text-amber-700',
      high: 'bg-green-100 text-green-700',
      medium: 'bg-blue-100 text-blue-700',
      low: 'bg-gray-100 text-gray-700'
    };
    return colors[level] || colors.low;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="AdminTrustScores" />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scores de Confiance</h1>
              <p className="text-gray-500 mt-1">Système de confiance basé sur l'IA</p>
            </div>
            <Button onClick={recalculateAll} className="bg-purple-600 hover:bg-purple-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Recalculer tous
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{trustScores.length}</p>
                <p className="text-sm text-gray-500">Total scores</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{excellentCount}</p>
                <p className="text-sm text-gray-500">Excellents</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{highCount}</p>
                <p className="text-sm text-gray-500">Élevés</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageScore}</p>
                <p className="text-sm text-gray-500">Score moyen</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <Input
            placeholder="Rechercher par email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Scores List */}
        <div className="space-y-4">
          {filteredScores.map((score) => (
            <Card key={score.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                      {score.overall_score}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{score.user_email}</span>
                        <Badge className={getTrustLevelColor(score.trust_level)}>
                          {score.trust_level}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-5 gap-2 text-xs text-gray-600 mb-2">
                        <div>Profil: {score.profile_completion_score}%</div>
                        <div>Vérif: {score.verification_score}%</div>
                        <div>Interact: {score.interaction_score}%</div>
                        <div>Signalements: {score.report_score}%</div>
                        <div>Activité: {score.activity_score}%</div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {score.benefits_unlocked?.map((benefit, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            ✓ {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDetailsDialog({ open: true, score })}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Détails
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => recalculateScore(score.user_email, score.profile_id)}
                      disabled={recalculating === score.user_email}
                    >
                      {recalculating === score.user_email ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Details Dialog */}
        <Dialog open={detailsDialog.open} onOpenChange={(open) => setDetailsDialog({ ...detailsDialog, open })}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails du Score de Confiance</DialogTitle>
            </DialogHeader>

            {detailsDialog.score && (
              <div className="space-y-6">
                {/* Score principal */}
                <TrustBadge trustScore={detailsDialog.score} showDetails />

                {/* Analyse IA */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Analyse IA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{detailsDialog.score.ai_analysis}</p>
                  </CardContent>
                </Card>

                {/* Scores détaillés */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Scores par catégorie</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: 'Complétion du profil', value: detailsDialog.score.profile_completion_score },
                      { label: 'Vérification', value: detailsDialog.score.verification_score },
                      { label: 'Interactions', value: detailsDialog.score.interaction_score },
                      { label: 'Signalements', value: detailsDialog.score.report_score },
                      { label: 'Activité', value: detailsDialog.score.activity_score }
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.label}</span>
                          <span className="font-semibold">{item.value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Signaux d'alerte */}
                {detailsDialog.score.red_flags?.length > 0 && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="text-sm text-red-800">Signaux d'alerte</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {detailsDialog.score.red_flags.map((flag, idx) => (
                          <li key={idx} className="text-sm text-red-700">⚠️ {flag}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Avantages */}
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-800">Avantages débloqués</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {detailsDialog.score.benefits_unlocked?.map((benefit, idx) => (
                        <div key={idx} className="text-sm text-green-700">✓ {benefit}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Métadonnées */}
                <div className="text-xs text-gray-500">
                  Dernière mise à jour: {detailsDialog.score.last_calculated && 
                    format(new Date(detailsDialog.score.last_calculated), 'dd MMM yyyy HH:mm', { locale: fr })}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}