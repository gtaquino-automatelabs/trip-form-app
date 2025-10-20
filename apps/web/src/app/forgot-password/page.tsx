'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/loader';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { resetPassword } from '@/lib/auth/auth-helpers';
import { toast } from 'sonner';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        throw error;
      }

      setEmailSent(true);
      toast.success('Email enviado com sucesso!');
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      setError('root', {
        message: 'Erro ao enviar email de recuperação. Tente novamente.',
      });
      toast.error('Falha ao enviar email');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Email enviado!
          </h1>
          <p className="text-gray-600">
            Enviamos um link de recuperação de senha para{' '}
            <span className="font-medium">{getValues('email')}</span>
          </p>
          <p className="text-sm text-gray-500">
            Verifique sua caixa de entrada e siga as instruções no email 
            para redefinir sua senha.
          </p>
          <div className="pt-4">
            <Button
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Voltar para Login
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur">
      <div className="mb-8">
        <button
          onClick={() => router.push('/login')}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para login
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">
          Recuperar senha
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Digite seu email e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">{errors.root.message}</div>
          </div>
        )}

        <div>
          <Label htmlFor="email">Email cadastrado</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            {...register('email')}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader className="mr-2 h-4 w-4" />
              Enviando...
            </>
          ) : (
            'Enviar link de recuperação'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Lembrou sua senha?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-blue-600 hover:text-blue-500"
          >
            Faça login
          </button>
        </p>
      </div>
    </Card>
  );
}