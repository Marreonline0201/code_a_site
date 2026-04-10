import { AuthForm } from "@/app/_components/auth-form";
import { AuthPanel } from "@/app/_components/auth-panel";
import { BrandShell } from "@/app/_components/brand-shell";

export default function SignupPage() {
  return (
    <BrandShell actions={<></>}>
      <AuthPanel mode="signup">
        <AuthForm mode="signup" />
      </AuthPanel>
    </BrandShell>
  );
}
