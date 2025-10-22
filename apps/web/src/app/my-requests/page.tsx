'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/loader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, FileText, Calendar, MapPin, Clock, User, Users } from 'lucide-react';

interface TripRequest {
  id: string;
  request_number: string;
  transport_type: string;
  trip_start_date: string;
  trip_end_date: string;
  trip_destination: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'submitted';
  created_at: string;
}

const statusColors = {
  draft: 'secondary',
  pending: 'warning',
  submitted: 'warning',
  approved: 'success',
  rejected: 'destructive',
  cancelled: 'secondary',
} as const;

const statusLabels = {
  draft: 'Rascunho',
  pending: 'Pendente',
  submitted: 'Enviado',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  cancelled: 'Cancelado',
};

// Helper function to format date without timezone issues
const formatDateLocal = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';

  // Parse the date as local, not UTC
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString('pt-BR');
};

export default function MyRequestsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<TripRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestTypeDialog, setShowRequestTypeDialog] = useState(false);

  const handleNewRequest = () => {
    setShowRequestTypeDialog(true);
  };

  const handleRequestForSelf = () => {
    setShowRequestTypeDialog(false);
    router.push('/form?loadProfile=true');
  };

  const handleRequestForOther = () => {
    setShowRequestTypeDialog(false);
    router.push('/form');
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch('/api/trip-requests');
        if (response.ok) {
          const data = await response.json();
          setRequests(data);
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchRequests();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Minhas Solicitações</h2>
            <p className="text-slate-300 mt-2">
              Gerencie suas solicitações de viagem
            </p>
          </div>
          <Button onClick={handleNewRequest} size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
            <Plus className="mr-2 h-5 w-5" />
            Nova Solicitação
          </Button>
        </div>

      {requests.length === 0 ? (
        <Card className="bg-slate-800/90 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">
              Nenhuma solicitação encontrada
            </h3>
            <p className="text-slate-300 text-center mb-6">
              Você ainda não possui solicitações de viagem.
              <br />
              Clique no botão abaixo para criar sua primeira solicitação.
            </p>
            <Button onClick={handleNewRequest} className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Solicitação
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card
              key={request.id}
              className="hover:shadow-lg transition-shadow cursor-pointer bg-slate-800/90 border-slate-700 hover:bg-slate-800/95"
              onClick={() => router.push(`/requests/${request.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-white">
                      Solicitação #{request.request_number}
                    </CardTitle>
                    <CardDescription className="mt-1 text-slate-300">
                      {request.transport_type || 'Não especificado'}
                    </CardDescription>
                  </div>
                  <Badge variant={statusColors[request.status]}>
                    {statusLabels[request.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-slate-300">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{request.trip_destination || 'Não especificado'}</span>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>
                      {formatDateLocal(request.trip_start_date)} - {formatDateLocal(request.trip_end_date)}
                    </span>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>
                      Criado em {new Date(request.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>

      {/* Request Type Dialog */}
      <Dialog open={showRequestTypeDialog} onOpenChange={setShowRequestTypeDialog}>
        <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              Para quem é a solicitação?
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Você quer fazer uma solicitação de Passagens e Diárias para você ou para uma outra pessoa?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={handleRequestForSelf}
              size="lg"
              className="bg-cyan-600 hover:bg-cyan-700 text-white w-full justify-start"
            >
              <User className="mr-2 h-5 w-5" />
              Eu mesmo
            </Button>
            <Button
              onClick={handleRequestForOther}
              size="lg"
              className="bg-cyan-600 hover:bg-cyan-700 text-white w-full justify-start"
            >
              <Users className="mr-2 h-5 w-5" />
              Outra pessoa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}