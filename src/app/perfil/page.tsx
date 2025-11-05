
export const metadata = { title: "Perfil" };
import ProfileClient from "./profile-client";

export default function Page() {
  return (
    <div className="container-max py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">Perfil</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Seu perfil e histórico de viagens.</p>
        <ProfileClient />
      </div>
    </div>
  );
}
