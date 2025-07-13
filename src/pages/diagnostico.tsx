import React from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import DiagnosticoPage from '../components/DiagnosticoPage';
import { useAuth } from '../contexts/AuthContext';

export default function Diagnostico() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return user ? <DiagnosticoPage /> : null;
}