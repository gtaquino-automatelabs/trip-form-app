'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader } from '@/components/loader';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithGoogle, signInWithMicrosoft, loading: authLoading, error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirect = searchParams.get('redirect') || '/my-requests';
  const error = searchParams.get('error');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    control,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);

    try {
      await signIn(data.email, data.password);
      toast.success('Login realizado com sucesso!');
      router.push(redirect);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error messages
      if (error.message?.includes('Invalid login credentials')) {
        setError('root', {
          message: 'Email ou senha inválidos',
        });
      } else if (error.message?.includes('Email not confirmed')) {
        setError('root', {
          message: 'Por favor, confirme seu email antes de fazer login',
        });
      } else {
        setError('root', {
          message: 'Erro ao fazer login. Tente novamente.',
        });
      }
      
      toast.error('Falha no login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Show URL error params */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            {error === 'session_expired' && 'Sua sessão expirou. Por favor, faça login novamente.'}
            {error === 'no_code' && 'Código de autenticação não encontrado.'}
            {error === 'callback_error' && 'Erro no processo de autenticação.'}
          </div>
        </div>
      )}

      {/* Show form submission errors */}
      {errors.root && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">{errors.root.message}</div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            {...register('email')}
            disabled={isSubmitting || authLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password')}
              disabled={isSubmitting || authLoading}
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
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="rememberMe"
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting || authLoading}
                />
              )}
            />
            <Label 
              htmlFor="rememberMe" 
              className="text-sm font-normal cursor-pointer"
            >
              Lembrar de mim
            </Label>
          </div>

          <a
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Esqueceu a senha?
          </a>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || authLoading}
      >
        {isSubmitting || authLoading ? (
          <>
            <Loader className="mr-2 h-4 w-4" />
            Entrando...
          </>
        ) : (
          'Entrar'
        )}
      </Button>

      {/* OAuth buttons - disabled for now */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Ou continue com</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            try {
              await signInWithGoogle();
              toast.success('Redirecionando para Google...');
            } catch (error: any) {
              toast.error('Erro ao conectar com Google');
              console.error('Google sign-in error:', error);
            }
          }}
          disabled={isSubmitting || authLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            try {
              await signInWithMicrosoft();
              toast.success('Redirecionando para Microsoft...');
            } catch (error: any) {
              toast.error('Erro ao conectar com Microsoft');
              console.error('Microsoft sign-in error:', error);
            }
          }}
          disabled={isSubmitting || authLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21 12.05h-9v-9h9m-1.5 1.5h-6v6h6m-16.5 10h9v-9h-9m1.5 1.5h6v6h-6m-1.5-16.5v9h9v-9m-1.5 1.5v6h-6v-6"
            />
          </svg>
          Microsoft
        </Button>
      </div>
    </form>
  );
}