'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/loader';
import { Plus, FileText, Calendar, MapPin, Clock } from 'lucide-react';

interface TripRequest {
  id: string;
  request_number: string;
  trip_type: string;
  start_date: string;
  end_date: string;
  destination: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at: string;
}

const statusColors = {
  draft: 'secondary',
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
  cancelled: 'secondary',
} as const;

const statusLabels = {
  draft: 'Rascunho',
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  cancelled: 'Cancelado',
};

export default function MyRequestsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<TripRequest[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Minhas Solicitações</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas solicitações de viagem
          </p>
        </div>
        <Button onClick={() => router.push('/form')} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Nova Solicitação
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Nenhuma solicitação encontrada
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              Você ainda não possui solicitações de viagem.
              <br />
              Clique no botão abaixo para criar sua primeira solicitação.
            </p>
            <Button onClick={() => router.push('/form')}>
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
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/requests/${request.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      Solicitação #{request.request_number}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {request.trip_type}
                    </CardDescription>
                  </div>
                  <Badge variant={statusColors[request.status]}>
                    {statusLabels[request.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{request.destination || 'Não especificado'}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>
                      {new Date(request.start_date).toLocaleDateString('pt-BR')} - 
                      {new Date(request.end_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
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
  );
}