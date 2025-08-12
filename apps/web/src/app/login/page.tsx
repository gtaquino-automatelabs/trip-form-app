'use client';

import { useState } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { SignupForm } from '@/components/auth/signup-form';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {mode === 'login' ? 'Entrar' : 'Criar Conta'}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {mode === 'login' 
            ? 'Faça login para acessar o formulário de viagem'
            : 'Crie sua conta para solicitar viagens'}
        </p>
      </div>

      {mode === 'login' ? (
        <LoginForm />
      ) : (
        <SignupForm />
      )}

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          {mode === 'login' 
            ? 'Não tem uma conta? Cadastre-se'
            : 'Já tem uma conta? Faça login'}
        </button>
      </div>
    </Card>
  );
}