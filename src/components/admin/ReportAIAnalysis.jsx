import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertCircle, Lightbulb, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportAIAnalysis({ reports, onSimilarReportsFound }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeReports = async () => {
    setAnalyzing(true);
    try {
      // Préparer les données pour l'IA
      const reportsSummary = reports.slice(0, 50).map(r => ({
        id: r.id,
        type: r.type,
        reason: r.reason,
        description: r.description,
        reporter: r.reporter_email,
        reported_user: r.reported_user_email,
        priority: r.priority,
        status: r.status,
        date: r.created_date
      }));

      const prompt = `Tu es un système d'analyse de signalements pour une application de rencontres. Analyse les signalements suivants et fournis:

1. SIGNALEMENTS SIMILAIRES: Identifie les groupes de signalements qui concernent le même utilisateur ou des comportements similaires (même s'ils ne sont pas identiques). Groupe-les par utilisateur ciblé et par pattern de comportement.

2. SUGGESTIONS D'ACTIONS: Pour chaque groupe de signalements similaires, suggère une action de modération appropriée (warning, suspension temporaire, bannissement) basée sur:
   - La gravité des infractions
   - Le nombre de signalements
   - Les types de violations
   - La récurrence du comportement

3. RÉSUMÉ DES TENDANCES: Identifie les patterns de signalements les plus fréquents et les comportements problématiques récurrents dans l'application.

4. UTILISATEURS À RISQUE: Liste les utilisateurs avec plusieurs signalements qui nécessitent une attention immédiate.

Signalements à analyser:
${JSON.stringify(reportsSummary, null, 2)}

Sois concis et actionnable dans tes recommandations.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            similar_report_groups: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  reported_user: { type: "string" },
                  report_ids: { type: "array", items: { type: "string" } },
                  pattern: { type: "string" },
                  severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                  summary: { type: "string" },
                  suggested_action: {
                    type: "object",
                    properties: {
                      action_type: { type: "string", enum: ["warning", "temporary_suspension", "permanent_ban", "no_action"] },
                      reason: { type: "string" },
                      priority: { type: "string", enum: ["low", "medium", "high", "urgent"] }
                    }
                  }
                }
              }
            },
            trends_summary: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  trend: { type: "string" },
                  frequency: { type: "number" },
                  description: { type: "string" }
                }
              }
            },
            high_risk_users: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user_email: { type: "string" },
                  report_count: { type: "number" },
                  risk_level: { type: "string", enum: ["medium", "high", "critical"] },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAnalysis(result);
      toast.success('Analyse IA terminée');
    } catch (error) {
      toast.error('Erreur lors de l\'analyse IA');
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700'
    };
    return colors[severity] || colors.medium;
  };

  const getRiskColor = (risk) => {
    const colors = {
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700'
    };
    return colors[risk] || colors.medium;
  };

  const getActionColor = (action) => {
    const colors = {
      no_action: 'bg-gray-100 text-gray-700',
      warning: 'bg-orange-100 text-orange-700',
      temporary_suspension: 'bg-amber-100 text-amber-700',
      permanent_ban: 'bg-red-100 text-red-700'
    };
    return colors[action] || colors.warning;
  };

  const getActionLabel = (action) => {
    const labels = {
      no_action: 'Aucune action',
      warning: 'Avertissement',
      temporary_suspension: 'Suspension temporaire',
      permanent_ban: 'Bannissement définitif'
    };
    return labels[action] || action;
  };

  return (
    <div className="space-y-6">
      {/* Header avec bouton d'analyse */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Analyse IA des signalements</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Détection de patterns, suggestions d'actions et identification des risques
                </p>
              </div>
            </div>
            <Button 
              onClick={analyzeReports} 
              disabled={analyzing || reports.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Lancer l'analyse
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Résultats de l'analyse */}
      {analysis && (
        <>
          {/* Signalements similaires groupés */}
          {analysis.similar_report_groups?.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <CardTitle>Signalements similaires détectés</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.similar_report_groups.map((group, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSeverityColor(group.severity)}>
                            {group.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {group.report_ids?.length || 0} signalements
                          </Badge>
                        </div>
                        <p className="font-medium text-gray-900 mb-1">
                          👤 {group.reported_user}
                        </p>
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Pattern:</strong> {group.pattern}
                        </p>
                        <p className="text-sm text-gray-600">{group.summary}</p>
                      </div>
                    </div>

                    {/* Suggestion d'action */}
                    {group.suggested_action && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">💡 Action suggérée:</p>
                            <Badge className={getActionColor(group.suggested_action.action_type)}>
                              {getActionLabel(group.suggested_action.action_type)}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onSimilarReportsFound?.(group.report_ids)}
                          >
                            Voir les signalements
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          <strong>Raison:</strong> {group.suggested_action.reason}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Utilisateurs à risque */}
          {analysis.high_risk_users?.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <CardTitle>Utilisateurs à risque élevé</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.high_risk_users.map((user, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-red-50 border-red-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getRiskColor(user.risk_level)}>
                          Risque {user.risk_level}
                        </Badge>
                        <span className="font-medium text-gray-900">{user.user_email}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {user.report_count} signalements • {user.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Tendances et résumé */}
          {analysis.trends_summary?.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <CardTitle>Tendances des signalements</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.trends_summary.map((trend, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50 border-blue-200">
                    <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{trend.trend}</span>
                        <Badge variant="outline">{trend.frequency}x</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{trend.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}