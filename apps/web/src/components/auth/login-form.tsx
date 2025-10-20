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
    } catch (error: unknown) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', error);
      }
      
      // Handle specific error messages
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('Invalid login credentials')) {
        setError('root', {
          message: 'Email ou senha inválidos',
        });
      } else if (errorMessage.includes('Email not confirmed')) {
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
    <>
      {/* Show URL error params */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md flex items-start gap-2">
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
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">{errors.root.message}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        {/* Email Field */}
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-slate-300">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            {...register('email')}
            disabled={isSubmitting || authLoading}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          />
          {errors.email && (
            <p className="text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password" className="text-slate-300">Senha</Label>
            <a
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-2 hover:underline text-slate-300 hover:text-cyan-400"
            >
              Esqueceu sua senha?
            </a>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password')}
              disabled={isSubmitting || authLoading}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
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
            <p className="text-sm text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me */}
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
            className="text-sm font-normal cursor-pointer text-slate-300"
          >
            Lembrar de mim
          </Label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
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
      </form>

      {/* Social Login Divider */}
      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-slate-600">
        <span className="relative z-10 bg-slate-800 px-2 text-slate-300">
          Ou continue com
        </span>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            try {
              await signInWithGoogle();
              toast.success('Redirecionando para Google...');
            } catch (error: unknown) {
              toast.error('Erro ao conectar com Google');
              console.error('Google sign-in error:', error);
            }
          }}
          disabled={isSubmitting || authLoading}
          className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
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
            } catch (error: unknown) {
              toast.error('Erro ao conectar com Microsoft');
              console.error('Microsoft sign-in error:', error);
            }
          }}
          disabled={isSubmitting || authLoading}
          className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              d="M21 12.05h-9v-9h9m-1.5 1.5h-6v6h6m-16.5 10h9v-9h-9m1.5 1.5h6v6h-6m-1.5-16.5v9h9v-9m-1.5 1.5v6h-6v-6"
              fill="currentColor"
            />
          </svg>
          Microsoft
        </Button>
      </div>
    </>
  );
}