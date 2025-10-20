'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  FileText, 
  Home, 
  Printer,
  User,
  AlertCircle,
  RefreshCw,
  Plane,
  CreditCard,
  Target,
  AlertTriangle,
  Paperclip
} from 'lucide-react';
import { useFormStore } from '@/stores/form-store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './confirmation.css';

interface RequestSummary {
  requestId: string;
  requestNumber: string;
  timestamp: string;
  personalInfo: {
    projectName: string;
    passengerName: string;
    passengerEmail: string;
    phone: string;
    cpf: string;
    rg: string;
    rgIssuer: string;
    birthDate: string;
    bankDetails: string;
    requestType: string;
  };
  travelDetails: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    transportType: string;
    isInternational: boolean;
    isUrgent: boolean;
    urgentJustification?: string;
  };
  expenseInfo: {
    expenseTypes: string[];
    otherExpenseDescription?: string;
    baggageAllowance: boolean;
    transportAllowance: boolean;
    estimatedDailyAllowance: number;
  };
  passportInfo?: {
    passportNumber: string;
    passportValidity: string;
    visaRequired: boolean;
  };
  restrictions?: {
    hasTimeRestrictions: boolean;
    timeRestrictionDetails?: string;
    hasFlightPreferences: boolean;
    flightPreferences?: string;
  };
  files?: {
    passportImageUrl?: string;
    flightSuggestionFiles?: Array<{
      fileName: string;
      fileUrl: string;
    }>;
  };
  additionalInfo: {
    tripObjective: string;
    observations?: string;
  };
}

function ConfirmationPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { 
    formData, 
    lastSubmissionId, 
    clearFormData, 
    clearUploadedFiles,
    resetSubmissionState,
    uploadedFiles 
  } = useFormStore();
  
  const [requestSummary, setRequestSummary] = useState<RequestSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);

  useEffect(() => {
    const requestId = searchParams.get('requestId') || lastSubmissionId;
    
    if (requestId && formData) {
      // Generate request number format
      const requestNumber = requestId;
      
      // Create summary from form data
      const summary: RequestSummary = {
        requestId,
        requestNumber,
        timestamp: new Date().toISOString(),
        personalInfo: {
          projectName: formData.projectName || '',
          passengerName: formData.passengerName || '',
          passengerEmail: formData.passengerEmail || '',
          phone: formData.phone || '',
          cpf: formData.cpf || '',
          rg: formData.rg || '',
          rgIssuer: formData.rgIssuer || '',
          birthDate: formData.birthDate?.toString() || '',
          bankDetails: formData.bankDetails || '',
          requestType: formData.requestType || '',
        },
        travelDetails: {
          origin: formData.origin || '',
          destination: formData.destination || '',
          departureDate: formData.departureDate?.toString() || '',
          returnDate: formData.returnDate?.toString() || '',
          transportType: formData.transportType || '',
          isInternational: formData.isInternational || false,
          isUrgent: formData.isUrgent || false,
          urgentJustification: formData.urgentJustification,
        },
        expenseInfo: {
          expenseTypes: formData.expenseTypes || [],
          otherExpenseDescription: formData.otherExpenseDescription,
          baggageAllowance: formData.baggageAllowance || false,
          transportAllowance: formData.transportAllowance || false,
          estimatedDailyAllowance: formData.estimatedDailyAllowance || 0,
        },
        additionalInfo: {
          tripObjective: formData.tripObjective || '',
          observations: formData.observations,
        },
      };

      // Add conditional sections
      if (formData.isInternational) {
        summary.passportInfo = {
          passportNumber: formData.passportNumber || '',
          passportValidity: formData.passportValidity?.toString() || '',
          visaRequired: formData.visaRequired || false,
        };
      }

      if (formData.hasTimeRestrictions || formData.hasFlightPreferences) {
        summary.restrictions = {
          hasTimeRestrictions: formData.hasTimeRestrictions || false,
          timeRestrictionDetails: formData.timeRestrictionDetails,
          hasFlightPreferences: formData.hasFlightPreferences || false,
          flightPreferences: formData.flightPreferences,
        };
      }

      if (uploadedFiles.passport || uploadedFiles.flights.length > 0) {
        summary.files = {
          passportImageUrl: uploadedFiles.passport?.fileUrl,
          flightSuggestionFiles: uploadedFiles.flights.map(f => ({
            fileName: f.fileName,
            fileUrl: f.fileUrl,
          })),
        };
      }

      setRequestSummary(summary);
    }
    
    setLoading(false);
  }, [searchParams, lastSubmissionId, formData, uploadedFiles]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatRequestType = (type: string) => {
    const types: Record<string, string> = {
      'passages_per_diem': 'Passagens e Diárias',
      'passages_only': 'Apenas Passagens',
      'per_diem_only': 'Apenas Diárias',
    };
    return types[type] || type;
  };

  const formatTransportType = (type: string) => {
    const types: Record<string, string> = {
      'air': 'Aéreo',
      'road': 'Rodoviário',
      'both': 'Aéreo e Rodoviário',
      'own_car': 'Veículo Próprio',
    };
    return types[type] || type;
  };

  const formatExpenseTypes = (types: string[]) => {
    const expenseMap: Record<string, string> = {
      'accommodation': 'Hospedagem',
      'food': 'Alimentação',
      'transport': 'Transporte Local',
      'registration': 'Inscrição em Evento',
      'other': 'Outros',
    };
    return types.map(t => expenseMap[t] || t).join(', ');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewRequest = () => {
    setShowNewRequestDialog(true);
  };

  const confirmNewRequest = () => {
    // Clear all form data and store
    clearFormData();
    clearUploadedFiles();
    resetSubmissionState();
    
    // Navigate to form
    router.push('/form');
  };

  const sendEmailConfirmation = useCallback(async () => {
    if (!requestSummary) return;

    try {
      const response = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: requestSummary.requestId,
          email: requestSummary.personalInfo.passengerEmail,
          summary: requestSummary,
        }),
      });

      if (response.ok) {
        // Email confirmation sent successfully
      }
    } catch (error) {
      console.error('Failed to send email confirmation:', error);
    }
  }, [requestSummary]);

  useEffect(() => {
    if (requestSummary) {
      sendEmailConfirmation();
    }
  }, [requestSummary, sendEmailConfirmation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!requestSummary) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
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
    <div className="min-h-screen relative print:min-h-0">
      {/* Background - hide on print */}
      <div 
        className="fixed inset-0 z-0 print:hidden"
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
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 print:p-0 print:min-h-0">
        <Card className="max-w-4xl w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm print:bg-white print:shadow-none">
          <CardHeader className="text-center pb-4 print:pb-2">
            <div className="flex justify-center mb-4 print:mb-2 print:hidden">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400 print:text-black">
              Solicitação Enviada com Sucesso!
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 print:space-y-4">
            {/* Request Number */}
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg print:border print:border-gray-300">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 print:text-black">
                Número de Referência
              </p>
              <p className="text-3xl font-bold text-primary print:text-black">
                {requestSummary.requestNumber}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 print:text-black">
                Data/Hora: {formatDateTime(requestSummary.timestamp)}
              </p>
            </div>

            {/* Summary Sections */}
            <div className="space-y-4 print:page-break-inside-avoid">
              {/* Personal Information */}
              <div className="border rounded-lg p-4 print:border-gray-300">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 print:hidden" />
                  Informações Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Projeto:</span> {requestSummary.personalInfo.projectName}</div>
                  <div><span className="font-medium">Nome:</span> {requestSummary.personalInfo.passengerName}</div>
                  <div><span className="font-medium">Email:</span> {requestSummary.personalInfo.passengerEmail}</div>
                  <div><span className="font-medium">Telefone:</span> {requestSummary.personalInfo.phone}</div>
                  <div><span className="font-medium">CPF:</span> {requestSummary.personalInfo.cpf}</div>
                  <div><span className="font-medium">RG:</span> {requestSummary.personalInfo.rg} - {requestSummary.personalInfo.rgIssuer}</div>
                  <div><span className="font-medium">Data Nascimento:</span> {formatDate(requestSummary.personalInfo.birthDate)}</div>
                  <div><span className="font-medium">Tipo Solicitação:</span> {formatRequestType(requestSummary.personalInfo.requestType)}</div>
                </div>
              </div>

              {/* Travel Details */}
              <div className="border rounded-lg p-4 print:border-gray-300">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Plane className="w-4 h-4 print:hidden" />
                  Detalhes da Viagem
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Origem:</span> {requestSummary.travelDetails.origin}</div>
                  <div><span className="font-medium">Destino:</span> {requestSummary.travelDetails.destination}</div>
                  <div><span className="font-medium">Data Ida:</span> {formatDate(requestSummary.travelDetails.departureDate)}</div>
                  <div><span className="font-medium">Data Volta:</span> {formatDate(requestSummary.travelDetails.returnDate)}</div>
                  <div><span className="font-medium">Transporte:</span> {formatTransportType(requestSummary.travelDetails.transportType)}</div>
                  <div><span className="font-medium">Internacional:</span> {requestSummary.travelDetails.isInternational ? 'Sim' : 'Não'}</div>
                  {requestSummary.travelDetails.isUrgent && (
                    <div className="col-span-2">
                      <span className="font-medium">Urgente:</span> Sim - {requestSummary.travelDetails.urgentJustification}
                    </div>
                  )}
                </div>
              </div>

              {/* Expense Information */}
              <div className="border rounded-lg p-4 print:border-gray-300">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 print:hidden" />
                  Informações de Despesas
                </h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Tipos de Despesa:</span> {formatExpenseTypes(requestSummary.expenseInfo.expenseTypes)}</div>
                  {requestSummary.expenseInfo.otherExpenseDescription && (
                    <div><span className="font-medium">Outras Despesas:</span> {requestSummary.expenseInfo.otherExpenseDescription}</div>
                  )}
                  <div><span className="font-medium">Auxílio Bagagem:</span> {requestSummary.expenseInfo.baggageAllowance ? 'Sim' : 'Não'}</div>
                  <div><span className="font-medium">Auxílio Transporte:</span> {requestSummary.expenseInfo.transportAllowance ? 'Sim' : 'Não'}</div>
                  <div><span className="font-medium">Diária Estimada:</span> R$ {requestSummary.expenseInfo.estimatedDailyAllowance}</div>
                </div>
              </div>

              {/* Passport Information (if international) */}
              {requestSummary.passportInfo && (
                <div className="border rounded-lg p-4 print:border-gray-300">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 print:hidden" />
                    Informações de Passaporte
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Número:</span> {requestSummary.passportInfo.passportNumber}</div>
                    <div><span className="font-medium">Validade:</span> {formatDate(requestSummary.passportInfo.passportValidity)}</div>
                    <div><span className="font-medium">Visto Necessário:</span> {requestSummary.passportInfo.visaRequired ? 'Sim' : 'Não'}</div>
                  </div>
                </div>
              )}

              {/* Trip Objective */}
              <div className="border rounded-lg p-4 print:border-gray-300">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 print:hidden" />
                  Objetivo da Viagem
                </h3>
                <p className="text-sm">{requestSummary.additionalInfo.tripObjective}</p>
                {requestSummary.additionalInfo.observations && (
                  <div className="mt-2">
                    <span className="font-medium text-sm">Observações:</span>
                    <p className="text-sm mt-1">{requestSummary.additionalInfo.observations}</p>
                  </div>
                )}
              </div>

              {/* Attached Files */}
              {requestSummary.files && (requestSummary.files.passportImageUrl || (requestSummary.files.flightSuggestionFiles && requestSummary.files.flightSuggestionFiles.length > 0)) && (
                <div className="border rounded-lg p-4 print:border-gray-300">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 print:hidden" />
                    Arquivos Anexados
                  </h3>
                  <ul className="text-sm space-y-1">
                    {requestSummary.files.passportImageUrl && (
                      <li>• Imagem do Passaporte</li>
                    )}
                    {requestSummary.files.flightSuggestionFiles?.map((file, index) => (
                      <li key={index}>• {file.fileName}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons - hide on print */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 print:hidden">
              <Button
                variant="default"
                className="flex-1"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleNewRequest}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
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

            {/* Important Notes - hide on print */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg print:hidden">
              <h4 className="font-medium text-sm mb-2 text-yellow-800 dark:text-yellow-200">
                Informações Importantes:
              </h4>
              <ul className="text-xs space-y-1 text-yellow-700 dark:text-yellow-300">
                <li>• Um e-mail de confirmação foi enviado para {requestSummary.personalInfo.passengerEmail}</li>
                <li>• Acompanhe o status da sua solicitação através do número de referência</li>
                <li>• Tempo médio de processamento: 48 horas úteis</li>
                <li>• Em caso de urgência, entre em contato com o setor responsável</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Request Confirmation Dialog */}
      {showNewRequestDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:hidden">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Confirmar Nova Solicitação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Ao criar uma nova solicitação, todos os dados do formulário atual serão limpos. Deseja continuar?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={confirmNewRequest}
                >
                  Sim, criar nova
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNewRequestDialog(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <ConfirmationPageContent />
    </Suspense>
  );
}