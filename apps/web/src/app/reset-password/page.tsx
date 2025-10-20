'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/loader';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { updatePassword } from '@/lib/auth/auth-helpers';
import { toast } from 'sonner';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve ter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve ter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve ter pelo menos um número'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não correspondem',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // Check if we have a valid recovery token
    // This would be handled by Supabase auth automatically
    // when the user clicks the link in their email
  }, []);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await updatePassword(data.password);
      
      if (error) {
        throw error;
      }

      setPasswordReset(true);
      toast.success('Senha redefinida com sucesso!');
    } catch (error: unknown) {
      console.error('Password update error:', error);
      
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('expired')) {
        setIsValidToken(false);
        setError('root', {
          message: 'Link de recuperação expirado. Solicite um novo.',
        });
      } else {
        setError('root', {
          message: 'Erro ao redefinir senha. Tente novamente.',
        });
      }
      
      toast.error('Falha ao redefinir senha');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (passwordReset) {
    return (
      <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Senha redefinida!
          </h1>
          <p className="text-gray-600">
            Sua senha foi redefinida com sucesso. 
            Agora você pode fazer login com sua nova senha.
          </p>
          <div className="pt-4">
            <Button
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Ir para Login
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!isValidToken) {
    return (
      <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Link expirado
          </h1>
          <p className="text-gray-600">
            Este link de recuperação de senha expirou ou é inválido.
            Por favor, solicite um novo link.
          </p>
          <div className="pt-4">
            <Button
              onClick={() => router.push('/forgot-password')}
              className="w-full"
            >
              Solicitar novo link
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Criar nova senha
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Digite sua nova senha abaixo.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">{errors.root.message}</div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="password">Nova senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('password')}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Mínimo 8 caracteres, com letras maiúsculas, minúsculas e números
            </p>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('confirmPassword')}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader className="mr-2 h-4 w-4" />
              Redefinindo...
            </>
          ) : (
            'Redefinir senha'
          )}
        </Button>
      </form>
    </Card>
  );
}