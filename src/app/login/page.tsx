'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from './login-form';

function LoginContent() {
  const params = useSearchParams();
  const next = params.get('next') ?? '/';

  return (
    <main className="container-max min-h-[calc(100vh-8rem)] py-10 flex items-center justify-center">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-3xl font-bold">Entrar</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Acesso à conta para reservar e participar.</p>
        <LoginForm nextPath={next} />
      </div>
    </main>
  );
}

export default function Page() {
  return <Suspense fallback={null}><LoginContent /></Suspense>;
}
