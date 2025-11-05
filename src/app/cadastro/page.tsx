
export const metadata = { title: "Criar conta" };
import SignupForm from "./signup-form";

export default function Page() {
  return (
    <div className="container-max min-h-[calc(100vh-8rem)] py-10 flex items-center justify-center">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-3xl font-bold">Criar conta</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Crie sua conta para explorar e reservar.</p>
        <SignupForm />
      </div>
    </div>
  );
}
