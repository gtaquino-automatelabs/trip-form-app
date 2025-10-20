'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/loader";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/my-requests');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="container mx-auto px-6 py-12">
      <Card className="p-8 bg-slate-800/90 border-slate-700">
        <div className="flex items-center justify-center text-white">
          <Loader />
          <span className="ml-3">Redirecionando...</span>
        </div>
      </Card>
    </div>
  );
}