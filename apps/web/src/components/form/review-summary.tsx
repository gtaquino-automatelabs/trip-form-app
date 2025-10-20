'use client';

import { useMemo, useCallback } from 'react';
import { useFormStore } from '@/stores/form-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  MapPin, 
  DollarSign, 
  Globe, 
  Clock, 
  Plane,
  Edit2 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SummarySection {
  title: string;
  pageNumber: number;
  icon: React.ReactNode;
  data: { label: string; value: string | React.ReactNode }[];
  show: boolean;
}

export function ReviewSummary() {
  const { formData, setCurrentPage } = useFormStore();

  const handleEdit = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, [setCurrentPage]);

  const formatDate = useCallback((date: Date | string | undefined) => {
    if (!date) return 'Não informado';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  }, []);

  const formatRequestType = useCallback((type: string | undefined) => {
    const types: Record<string, string> = {
      'passages_per_diem': 'Passagens e Diárias',
      'passages_only': 'Somente Passagens',
      'per_diem_only': 'Somente Diárias'
    };
    return types[type || ''] || 'Não informado';
  }, []);

  const formatTransportType = useCallback((type: string | undefined) => {
    const types: Record<string, string> = {
      'air': 'Aéreo',
      'road': 'Rodoviário',
      'both': 'Aéreo e Rodoviário',
      'own_car': 'Veículo Próprio'
    };
    return types[type || ''] || 'Não informado';
  }, []);

  const formatExpenseTypes = useCallback((types: string[] | undefined) => {
    if (!types || types.length === 0) return 'Nenhum selecionado';
    
    const expenseLabels: Record<string, string> = {
      'passagem': 'Passagem',
      'hospedagem': 'Hospedagem',
      'alimentacao': 'Alimentação',
      'transporte': 'Transporte Local',
      'inscricao': 'Inscrição em Evento',
      'outros': 'Outros'
    };

    return (
      <div className="flex flex-wrap gap-1">
        {types.map((type) => (
          <Badge key={type} variant="secondary" className="text-xs">
            {expenseLabels[type] || type}
          </Badge>
        ))}
      </div>
    );
  }, []);

  const sections: SummarySection[] = useMemo(() => [
    {
      title: 'Dados do Passageiro',
      pageNumber: 1,
      icon: <User className="w-4 h-4" />,
      show: true,
      data: [
        { label: 'Nome do Passageiro', value: formData.passengerName || 'Não informado' },
        { label: 'E-mail', value: formData.passengerEmail || 'Não informado' },
        { label: 'CPF', value: formData.cpf || 'Não informado' },
        { label: 'RG / Órgão Expedidor', value: formData.rg && formData.rgIssuer ? `${formData.rg} / ${formData.rgIssuer}` : 'Não informado' },
        { label: 'Data de Nascimento', value: formatDate(formData.birthDate) },
        { label: 'Projeto Vinculado', value: formData.projectName || 'Não informado' },
        { label: 'Tipo de Solicitação', value: formatRequestType(formData.requestType) },
      ]
    },
    {
      title: 'Detalhes da Viagem',
      pageNumber: 2,
      icon: <MapPin className="w-4 h-4" />,
      show: true,
      data: [
        { label: 'Cidade de Origem', value: formData.origin || 'Não informado' },
        { label: 'Cidade de Destino', value: formData.destination || 'Não informado' },
        { label: 'Data de Ida', value: formatDate(formData.departureDate) },
        { label: 'Data de Volta', value: formatDate(formData.returnDate) },
        { label: 'Tipo de Transporte', value: formatTransportType(formData.transportType) },
      ]
    },
    {
      title: 'Despesas e Preferências',
      pageNumber: 3,
      icon: <DollarSign className="w-4 h-4" />,
      show: true,
      data: [
        { label: 'Tipos de Despesa', value: formatExpenseTypes(formData.expenseTypes) },
        { label: 'Franquia de Bagagem', value: formData.baggageAllowance ? 'Sim' : 'Não' },
        { label: 'Auxílio Transporte', value: formData.transportAllowance ? 'Sim' : 'Não' },
        { label: 'Estimativa de Diárias', value: formData.estimatedDailyAllowance ? `R$ ${formData.estimatedDailyAllowance}` : 'Não informado' },
      ]
    },
    {
      title: 'Viagem Internacional',
      pageNumber: 5,
      icon: <Globe className="w-4 h-4" />,
      show: formData.isInternational || false,
      data: [
        { label: 'Número do Passaporte', value: formData.passportNumber || 'Não informado' },
        { label: 'Validade do Passaporte', value: formatDate(formData.passportValidity) },
        { label: 'Imagem do Passaporte', value: formData.passportImageUrl ? 'Enviado' : 'Não enviado' },
        { label: 'Visto Necessário', value: formData.visaRequired ? 'Sim' : 'Não' },
      ]
    },
    {
      title: 'Restrições de Horário',
      pageNumber: 6,
      icon: <Clock className="w-4 h-4" />,
      show: formData.hasTimeRestrictions || false,
      data: [
        { label: 'Detalhes', value: formData.timeRestrictionDetails || 'Não informado' },
      ]
    },
    {
      title: 'Preferências de Voo',
      pageNumber: 7,
      icon: <Plane className="w-4 h-4" />,
      show: formData.hasFlightPreferences || false,
      data: [
        { 
          label: 'Arquivos Enviados', 
          value: formData.flightSuggestionFiles?.length 
            ? `${formData.flightSuggestionFiles.length} arquivo(s)` 
            : 'Nenhum arquivo' 
        },
        { label: 'Observações', value: formData.flightPreferences || 'Não informado' },
      ]
    },
  ], [formData, formatDate, formatRequestType, formatTransportType, formatExpenseTypes]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-3">Resumo da Solicitação</h3>
      
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {sections.filter(section => section.show).map((section) => (
          <Card key={section.pageNumber} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {section.icon}
                  <CardTitle className="text-sm font-medium">
                    {section.title}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(section.pageNumber)}
                  className="h-7 px-2 text-xs"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {section.data.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {item.label}:
                    </span>
                    <span className="text-xs font-medium text-right">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 Revise todas as informações antes de enviar. Clique em &quot;Editar&quot; para fazer alterações.
        </p>
      </div>
    </div>
  );
}