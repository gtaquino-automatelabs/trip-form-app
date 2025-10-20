'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  FileText, 
  Home, 
  Download,
  Calendar,
  User,
  MapPin
} from 'lucide-react';

interface SubmissionResult {
  id: string;
  requestNumber: string;
}

export default function ConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [submissionData, setSubmissionData] = useState<SubmissionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get data from URL params first
    const requestNumber = searchParams.get('requestNumber');
    const id = params.id as string;

    if (requestNumber && id) {
      setSubmissionData({ id, requestNumber });
      setLoading(false);
      // Clear session storage after reading
      sessionStorage.removeItem('submissionResult');
    } else {
      // Fallback to session storage
      const resultStr = sessionStorage.getItem('submissionResult');
      if (resultStr) {
        try {
          const result = JSON.parse(resultStr);
          setSubmissionData(result);
          sessionStorage.removeItem('submissionResult');
        } catch (error) {
          console.error('Error parsing submission result:', error);
        }
      }
      setLoading(false);
    }
  }, [params.id, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!submissionData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Nenhuma informação de confirmação encontrada.
              </p>
              <Button onClick={() => router.push('/form')}>
                Voltar ao Formulário
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
              Solicitação Enviada com Sucesso!
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Request Number */}
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Número da Solicitação
              </p>
              <p className="text-3xl font-bold text-primary">
                {submissionData.requestNumber}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Guarde este número para acompanhamento
              </p>
            </div>

            {/* Status Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium">Status Atual</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <Badge variant="warning">Pendente de Análise</Badge>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Próximos Passos</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Sua solicitação será analisada pela equipe responsável
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Tempo de Resposta</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Normalmente em até 48 horas úteis
                  </p>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h4 className="font-medium text-sm mb-2 text-yellow-800 dark:text-yellow-200">
                Informações Importantes:
              </h4>
              <ul className="text-xs space-y-1 text-yellow-700 dark:text-yellow-300">
                <li>• Você receberá um e-mail de confirmação em breve</li>
                <li>• Acompanhe o status da sua solicitação em &quot;Minhas Solicitações&quot;</li>
                <li>• Em caso de urgência, entre em contato com o setor responsável</li>
                <li>• Mantenha seus documentos de viagem atualizados</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="default"
                className="flex-1"
                onClick={() => router.push('/my-requests')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Ver Minhas Solicitações
              </Button>
              
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/form')}
              >
                Nova Solicitação
              </Button>

              <Button
                variant="ghost"
                onClick={() => router.push('/')}
              >
                <Home className="w-4 h-4 mr-2" />
                Início
              </Button>
            </div>

            {/* Print/Download Option */}
            <div className="text-center pt-2">
              <Button
                variant="link"
                size="sm"
                onClick={() => window.print()}
                className="text-gray-600 dark:text-gray-400"
              >
                <Download className="w-3 h-3 mr-1" />
                Imprimir ou Salvar Comprovante
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}