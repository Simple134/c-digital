import AuthForm from "../AuthForm";

export const metadata = { title: "Crear cuenta · Panel de cliente" };

type RegistroPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PanelRegistroPage({
  searchParams,
}: RegistroPageProps) {
  const params = searchParams ? await searchParams : {};
  const rawEmail = params.email;
  const initialEmail = Array.isArray(rawEmail) ? rawEmail[0] : rawEmail;

  return <AuthForm initialEmail={initialEmail ?? ""} />;
}
