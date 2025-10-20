'use client';

import { useState } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { SignupForm } from '@/components/auth/signup-form';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="w-full max-w-sm md:max-w-4xl">
      <Card className="overflow-hidden p-0 bg-slate-800/90 border-slate-700">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Left side - Login/Signup Form */}
          <div className="p-6 md:p-8 bg-slate-800/95 text-white">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">
                  {mode === 'login' ? 'Central de Solicitações' : 'Criar Conta'}
                </h1>
                {mode === 'signup' && (
                  <p className="text-slate-300 text-balance">
                    Crie sua conta para solicitar viagens
                  </p>
                )}
              </div>

              {mode === 'login' ? (
                <LoginForm />
              ) : (
                <SignupForm />
              )}

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="underline underline-offset-4 hover:text-cyan-400 text-slate-300"
                >
                  {mode === 'login' 
                    ? "Não tem uma conta? Cadastre-se"
                    : 'Já tem uma conta? Faça login'}
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Logo and Background */}
          <div className="bg-gradient-to-br from-slate-900/20 via-blue-900/20 to-slate-800/20 relative hidden md:flex items-center justify-center p-8">
            {/* Background pattern overlay */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
                {/* Flowing lines pattern */}
                <defs>
                  <pattern id="flowing-lines" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                    <path d="M0 50 Q 25 25 50 50 T 100 50" stroke="#00bcd4" strokeWidth="1" fill="none" opacity="0.4"/>
                    <path d="M0 25 Q 25 0 50 25 T 100 25" stroke="#26c6da" strokeWidth="1" fill="none" opacity="0.3"/>
                    <path d="M0 75 Q 25 50 50 75 T 100 75" stroke="#4dd0e1" strokeWidth="1" fill="none" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#flowing-lines)" />
              </svg>
            </div>
            
            {/* Logo container */}
            <div className="relative z-10 flex items-center justify-center h-full w-full p-4">
              <Image
                src="/perfil 1.jpg"
                alt="CEIA Logo"
                width={400}
                height={400}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-slate-400 text-center text-xs text-balance mt-4">
        Ao continuar, você concorda com nossos{' '}
        <a href="#" className="underline underline-offset-4 hover:text-cyan-400">Termos de Serviço</a>{' '}
        e{' '}
        <a href="#" className="underline underline-offset-4 hover:text-cyan-400">Política de Privacidade</a>.
      </div>
    </div>
  );
}