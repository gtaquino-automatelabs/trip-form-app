'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/loader';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft, Save, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  trip_type: z.enum(['national', 'international'], {
    required_error: 'Selecione o tipo de viagem',
  }),
  destination: z.string().min(1, 'Destino é obrigatório'),
  purpose: z.string().min(10, 'Motivo deve ter pelo menos 10 caracteres'),
  start_date: z.date({
    required_error: 'Data de início é obrigatória',
  }),
  end_date: z.date({
    required_error: 'Data de término é obrigatória',
  }),
  requires_transport: z.boolean(),
  transport_type: z.string().optional(),
  requires_accommodation: z.boolean(),
  accommodation_preferences: z.string().optional(),
  requires_advance: z.boolean(),
  advance_amount: z.number().optional(),
  additional_notes: z.string().optional(),
}).refine(
  (data) => data.end_date >= data.start_date,
  {
    message: 'Data de término deve ser posterior à data de início',
    path: ['end_date'],
  }
);

type FormData = z.infer<typeof formSchema>;

export default function TripFormPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requires_transport: false,
      requires_accommodation: false,
      requires_advance: false,
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSaveDraft = async (data: FormData) => {
    setSaving(true);
    try {
      const response = await fetch('/api/trip-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, status: 'draft' }),
      });

      if (response.ok) {
        toast({
          title: 'Rascunho salvo',
          description: 'Sua solicitação foi salva como rascunho.',
        });
        router.push('/my-requests');
      }
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar o rascunho.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/trip-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, status: 'pending' }),
      });

      if (response.ok) {
        toast({
          title: 'Solicitação enviada',
          description: 'Sua solicitação foi enviada para aprovação.',
        });
        router.push('/my-requests');
      }
    } catch (error) {
      toast({
        title: 'Erro ao enviar',
        description: 'Ocorreu um erro ao enviar a solicitação.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/my-requests')}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nova Solicitação de Viagem</h1>
          <p className="text-muted-foreground mt-2">
            Preencha os dados da sua viagem
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Dados principais da viagem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="trip_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Viagem</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="national" id="national" />
                          <Label htmlFor="national">Nacional</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="international" id="international" />
                          <Label htmlFor="international">Internacional</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destino</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: São Paulo, SP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo da Viagem</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o motivo e objetivos da viagem"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Início</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP', { locale: ptBR })
                              ) : (
                                <span>Selecione a data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Término</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP', { locale: ptBR })
                              ) : (
                                <span>Selecione a data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              const startDate = form.getValues('start_date');
                              return startDate ? date < startDate : date < new Date();
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Necessidades da Viagem</CardTitle>
              <CardDescription>
                Informe os recursos necessários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="requires_transport"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Necessita de transporte
                      </FormLabel>
                      <FormDescription>
                        Marque se precisar de passagens ou veículo
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch('requires_transport') && (
                <FormField
                  control={form.control}
                  name="transport_type"
                  render={({ field }) => (
                    <FormItem className="ml-6">
                      <FormLabel>Tipo de Transporte</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="airplane">Avião</SelectItem>
                          <SelectItem value="bus">Ônibus</SelectItem>
                          <SelectItem value="car">Carro</SelectItem>
                          <SelectItem value="train">Trem</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="requires_accommodation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Necessita de hospedagem
                      </FormLabel>
                      <FormDescription>
                        Marque se precisar de hotel ou acomodação
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch('requires_accommodation') && (
                <FormField
                  control={form.control}
                  name="accommodation_preferences"
                  render={({ field }) => (
                    <FormItem className="ml-6">
                      <FormLabel>Preferências de Hospedagem</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Hotel próximo ao local do evento, quarto individual"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="requires_advance"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Necessita de adiantamento
                      </FormLabel>
                      <FormDescription>
                        Marque se precisar de valores antecipados
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch('requires_advance') && (
                <FormField
                  control={form.control}
                  name="advance_amount"
                  render={({ field }) => (
                    <FormItem className="ml-6">
                      <FormLabel>Valor do Adiantamento</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observações Adicionais</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="additional_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Informações adicionais relevantes para a viagem"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={form.handleSubmit(handleSaveDraft)}
              disabled={saving || submitting}
            >
              {saving ? (
                <Loader className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar Rascunho
            </Button>
            <Button type="submit" disabled={saving || submitting}>
              {submitting ? (
                <Loader className="mr-2 h-4 w-4" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Enviar Solicitação
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}