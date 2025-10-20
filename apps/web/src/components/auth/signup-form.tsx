'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader } from '@/components/loader';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const signupSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
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
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Você deve aceitar os termos e condições',
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não correspondem',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const { signUp, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    control,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const password = watch('password');

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    const labels = ['', 'Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte'];
    const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];

    return {
      strength,
      label: labels[strength],
      color: colors[strength],
      percentage: (strength / 5) * 100,
    };
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);

    try {
      await signUp(data.email, data.password, { name: data.name });
      setSignupSuccess(true);
      toast.success('Conta criada com sucesso!');
    } catch (error: unknown) {
      console.error('Signup error:', error);
      
      // Handle specific error messages
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('already registered')) {
        setError('email', {
          message: 'Este email já está cadastrado',
        });
      } else if (errorMessage.includes('Invalid email')) {
        setError('email', {
          message: 'Email inválido',
        });
      } else {
        setError('root', {
          message: 'Erro ao criar conta. Tente novamente.',
        });
      }
      
      toast.error('Falha ao criar conta');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (signupSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Conta criada com sucesso!
        </h2>
        <p className="text-gray-600">
          Verifique seu email para confirmar sua conta. 
          Após a confirmação, você poderá fazer login.
        </p>
        <Button
          onClick={() => router.push('/login')}
          className="w-full"
        >
          Ir para Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errors.root && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">{errors.root.message}</div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            type="text"
            placeholder="João Silva"
            autoComplete="name"
            {...register('name')}
            disabled={isSubmitting || authLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

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
              autoComplete="new-password"
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
          
          {/* Password strength indicator */}
          {password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      level <= passwordStrength.strength
                        ? passwordStrength.color
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600">
                Força da senha: <span className="font-medium">{passwordStrength.label}</span>
              </p>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('confirmPassword')}
              disabled={isSubmitting || authLoading}
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

        <div className="flex items-start space-x-2">
          <Controller
            name="acceptTerms"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="acceptTerms"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isSubmitting || authLoading}
                className="mt-1"
              />
            )}
          />
          <div className="flex-1">
            <Label 
              htmlFor="acceptTerms" 
              className="text-sm font-normal cursor-pointer"
            >
              Eu aceito os{' '}
              <a
                href="/terms"
                target="_blank"
                className="text-blue-600 hover:text-blue-500 underline"
              >
                termos e condições
              </a>{' '}
              e a{' '}
              <a
                href="/privacy"
                target="_blank"
                className="text-blue-600 hover:text-blue-500 underline"
              >
                política de privacidade
              </a>
            </Label>
            {errors.acceptTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
            )}
          </div>
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
            Criando conta...
          </>
        ) : (
          'Criar conta'
        )}
      </Button>

      <div className="text-xs text-center text-gray-500">
        Ao criar uma conta, você concorda em receber emails sobre suas solicitações de viagem.
      </div>
    </form>
  );
}