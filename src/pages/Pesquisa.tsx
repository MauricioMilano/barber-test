import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Send, Loader2, CheckCircle } from 'lucide-react';

export default function Pesquisa() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [survey, setSurvey] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadSurvey();
  }, [token]);

  const loadSurvey = async () => {
    try {
      const response = await api.get(`/pesquisa/${token}`);
      if (response.data.survey.respondedAt) {
        setSubmitted(true);
      }
      setSurvey(response.data.survey);
    } catch (err) {
      console.error('Error loading survey:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Por favor, selecione uma avaliação');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/pesquisa/${token}`, {
        rating,
        comment,
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting survey:', err);
      alert('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-soft flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-hairline">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-medium text-ink mb-2">Obrigado!</h1>
            <p className="text-muted">
              Sua avaliação foi enviada com sucesso.
            </p>
            <p className="text-sm text-muted mt-4">
              A Barbearia STYLE agradece seu feedback.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-soft flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-hairline">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 rounded-xl bg-ink flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3v18M18 3v18M6 3h12M6 21h12M12 3v18" />
            </svg>
          </div>
          <CardTitle className="text-xl text-ink">Pesquisa de Satisfação</CardTitle>
          <p className="text-sm text-muted mt-1">
            Como foi seu atendimento na Barbearia STYLE?
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {survey && (
            <div className="text-center p-4 bg-surface-soft rounded-xl">
              <p className="text-sm text-muted">Serviço realizado</p>
              <p className="font-medium text-ink">
                {survey.order?.items?.[0]?.name || 'Atendimento'}
              </p>
              <p className="text-sm text-muted mt-1">
                com {survey.order?.client?.name}
              </p>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm font-medium text-muted mb-4">Sua avaliação</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-2 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= rating
                        ? 'fill-signature-yellow text-signature-yellow'
                        : 'text-hairline hover:text-signature-mustard'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted mt-2">
              {rating === 1 && 'Muito ruim'}
              {rating === 2 && 'Ruim'}
              {rating === 3 && 'Regular'}
              {rating === 4 && 'Bom'}
              {rating === 5 && 'Excelente'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">
              Comentário (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Deixe seu comentário..."
              className="w-full h-24 p-3 rounded-xl border border-hairline bg-canvas text-ink placeholder:text-muted resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="w-full bg-ink hover:bg-ink/90"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Avaliação
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}