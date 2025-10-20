'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/loader';
import { ArrowLeft, User, MapPin, Calendar, Plane, DollarSign, FileText, AlertCircle } from 'lucide-react';

interface TravelRequest {
  id: string;
  request_number: string;
  status: string;

  // Passenger info
  passenger_name: string;
  passenger_email: string;
  passenger_cpf: string;
  passenger_rg: string;
  passenger_birth_date: string;
  passenger_phone: string;

  // Emergency contact
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_email?: string;

  // Requester
  requester_name: string;
  requester_email: string;

  // Cost center
  cost_center: string;
  cost_center_manager: string;

  // Project
  project_name: string;

  // Travel details
  trip_origin: string;
  trip_destination: string;
  trip_start_date: string;
  trip_end_date: string;
  transport_type: string;
  transport_details?: string;

  // Expenses
  expense_types: string[];
  baggage_allowance: boolean;
  transport_allowance: boolean;
  estimated_daily_allowance: number;

  // International
  is_international: boolean;
  passport_number?: string;
  passport_expiry?: string;
  passport_issuing_country?: string;
  visa_required?: boolean;
  visa_information?: string;

  // Time restrictions
  has_time_restrictions: boolean;
  time_restrictions_details?: string;

  // Flight preferences
  preferred_airlines?: any;
  preferred_departure_time?: string;
  preferred_arrival_time?: string;
  seat_preference?: string;
  additional_notes?: string;

  // Trip objective
  trip_objective: string;
  expected_outcomes?: string;

  // Bank details
  bank_name?: string;
  bank_branch?: string;
  bank_account?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
  submitted_at?: string;
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  submitted: 'default',
  under_review: 'outline',
  approved: 'default',
  rejected: 'destructive',
  cancelled: 'secondary',
};

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  submitted: 'Enviado',
  under_review: 'Em Análise',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  cancelled: 'Cancelado',
};

const transportTypeLabels: Record<string, string> = {
  flight: 'Aéreo',
  bus: 'Rodoviário',
  car_rental: 'Carro Próprio',
  other: 'Outro',
};

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [request, setRequest] = useState<TravelRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestId = params.id as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchRequest() {
      try {
        const response = await fetch(`/api/requests/${requestId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Solicitação não encontrada');
          } else if (response.status === 401) {
            setError('Não autorizado');
            router.push('/login');
          } else {
            setError('Erro ao carregar solicitação');
          }
          return;
        }

        const data = await response.json();
        setRequest(data);
      } catch (err) {
        console.error('Error fetching request:', err);
        setError('Erro ao carregar solicitação');
      } finally {
        setLoading(false);
      }
    }

    if (user && requestId) {
      fetchRequest();
    }
  }, [user, requestId, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/my-requests')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Card className="bg-slate-800/90 border-slate-700">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">
                {error || 'Solicitação não encontrada'}
              </h3>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/my-requests')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Minhas Solicitações
          </Button>

          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-white">
                Solicitação #{request.request_number}
              </h2>
              <p className="text-slate-300 mt-2">
                Criada em {new Date(request.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <Badge variant={statusColors[request.status] || 'default'} className="text-lg px-4 py-2">
              {statusLabels[request.status] || request.status}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Travel Details */}
          <Card className="bg-slate-800/90 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <MapPin className="mr-2 h-5 w-5" />
                Detalhes da Viagem
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-slate-300">
              <div>
                <p className="text-sm text-slate-400">Origem</p>
                <p className="font-medium">{request.trip_origin}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Destino</p>
                <p className="font-medium">{request.trip_destination}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Data de Ida</p>
                <p className="font-medium">
                  {new Date(request.trip_start_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Data de Volta</p>
                <p className="font-medium">
                  {new Date(request.trip_end_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Tipo de Transporte</p>
                <p className="font-medium">
                  {transportTypeLabels[request.transport_type] || request.transport_type}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Viagem Internacional</p>
                <p className="font-medium">{request.is_international ? 'Sim' : 'Não'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Passenger Information */}
          <Card className="bg-slate-800/90 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <User className="mr-2 h-5 w-5" />
                Informações do Passageiro
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-slate-300">
              <div>
                <p className="text-sm text-slate-400">Nome</p>
                <p className="font-medium">{request.passenger_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">E-mail</p>
                <p className="font-medium">{request.passenger_email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">CPF</p>
                <p className="font-medium">{request.passenger_cpf}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">RG</p>
                <p className="font-medium">{request.passenger_rg}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Data de Nascimento</p>
                <p className="font-medium">
                  {new Date(request.passenger_birth_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Telefone</p>
                <p className="font-medium">{request.passenger_phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Project and Cost Center */}
          <Card className="bg-slate-800/90 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <FileText className="mr-2 h-5 w-5" />
                Projeto e Centro de Custo
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-slate-300">
              <div>
                <p className="text-sm text-slate-400">Projeto</p>
                <p className="font-medium">{request.project_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Centro de Custo</p>
                <p className="font-medium">{request.cost_center}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Gestor do Centro de Custo</p>
                <p className="font-medium">{request.cost_center_manager}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Solicitante</p>
                <p className="font-medium">{request.requester_name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Trip Objective */}
          <Card className="bg-slate-800/90 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Objetivo da Viagem</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p className="whitespace-pre-wrap">{request.trip_objective}</p>
              {request.expected_outcomes && (
                <>
                  <p className="text-sm text-slate-400 mt-4 mb-2">Resultados Esperados</p>
                  <p className="whitespace-pre-wrap">{request.expected_outcomes}</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Financial Details */}
          <Card className="bg-slate-800/90 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <DollarSign className="mr-2 h-5 w-5" />
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Auxílio Bagagem</p>
                  <p className="font-medium">{request.baggage_allowance ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Auxílio Transporte</p>
                  <p className="font-medium">{request.transport_allowance ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Diária Estimada</p>
                  <p className="font-medium">
                    R$ {Number(request.estimated_daily_allowance).toFixed(2)}
                  </p>
                </div>
              </div>

              {request.expense_types && request.expense_types.length > 0 && (
                <div>
                  <p className="text-sm text-slate-400 mb-2">Tipos de Despesa</p>
                  <div className="flex flex-wrap gap-2">
                    {request.expense_types.map((expense, index) => (
                      <Badge key={index} variant="outline">
                        {expense}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(request.bank_name || request.bank_branch || request.bank_account) && (
                <div>
                  <p className="text-sm text-slate-400 mb-2">Dados Bancários</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    {request.bank_name && (
                      <div>
                        <p className="text-sm text-slate-400">Banco</p>
                        <p className="font-medium">{request.bank_name}</p>
                      </div>
                    )}
                    {request.bank_branch && (
                      <div>
                        <p className="text-sm text-slate-400">Agência</p>
                        <p className="font-medium">{request.bank_branch}</p>
                      </div>
                    )}
                    {request.bank_account && (
                      <div>
                        <p className="text-sm text-slate-400">Conta</p>
                        <p className="font-medium">{request.bank_account}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* International Travel Info */}
          {request.is_international && (
            <Card className="bg-slate-800/90 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Plane className="mr-2 h-5 w-5" />
                  Informações Internacionais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4 text-slate-300">
                {request.passport_number && (
                  <div>
                    <p className="text-sm text-slate-400">Número do Passaporte</p>
                    <p className="font-medium">{request.passport_number}</p>
                  </div>
                )}
                {request.passport_expiry && (
                  <div>
                    <p className="text-sm text-slate-400">Validade do Passaporte</p>
                    <p className="font-medium">
                      {new Date(request.passport_expiry).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-400">Visto Necessário</p>
                  <p className="font-medium">{request.visa_required ? 'Sim' : 'Não'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Contact */}
          <Card className="bg-slate-800/90 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Contato de Emergência</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-slate-300">
              <div>
                <p className="text-sm text-slate-400">Nome</p>
                <p className="font-medium">{request.emergency_contact_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Telefone</p>
                <p className="font-medium">{request.emergency_contact_phone}</p>
              </div>
              {request.emergency_contact_email && (
                <div>
                  <p className="text-sm text-slate-400">E-mail</p>
                  <p className="font-medium">{request.emergency_contact_email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          {(request.has_time_restrictions || request.additional_notes) && (
            <Card className="bg-slate-800/90 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Informações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-300">
                {request.has_time_restrictions && request.time_restrictions_details && (
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Restrições de Horário</p>
                    <p className="whitespace-pre-wrap">{request.time_restrictions_details}</p>
                  </div>
                )}
                {request.additional_notes && (
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Observações</p>
                    <p className="whitespace-pre-wrap">{request.additional_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
