import LoginForm from "@/components/LoginForm";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { mode } = await searchParams;
  return <LoginForm initialMode={mode === "signup" ? "signup" : "signin"} />;
}
