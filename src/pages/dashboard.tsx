import React from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
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

  return user ? (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <Dashboard isAdmin={true} />
    </div>
  ) : null;
}