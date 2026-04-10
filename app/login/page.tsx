import { AuthForm } from "@/app/_components/auth-form";
import { AuthPanel } from "@/app/_components/auth-panel";
import { BrandShell } from "@/app/_components/brand-shell";

export default function LoginPage() {
  return (
    <BrandShell actions={<></>}>
      <AuthPanel mode="login">
        <AuthForm mode="login" />
      </AuthPanel>
    </BrandShell>
  );
}
