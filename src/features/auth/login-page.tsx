import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { TextField } from '../../components/ui/text-field';
import { usePageMeta } from '../../lib/use-page-meta';
import { AuthLayout } from './auth-layout';
import { safeNext } from './safe-next';
import { useLogin } from './use-session';
import { validateCredentials } from './validation';
import type { Credentials, FieldErrors } from './types';

const LoginPage = () => {
  usePageMeta('Sign in', 'Sign in to QuizLingo to continue your HSK 3.0 practice.');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const login = useLogin();
  const [form, setForm] = useState<Credentials>({ email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<Credentials>>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validateCredentials(form);
    setErrors(found);
    const firstInvalid = (['email', 'password'] as const).find((field) => found[field]);
    if (firstInvalid) {
      event.currentTarget.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    login.mutate(
      { email: form.email.trim(), password: form.password },
      { onSuccess: () => navigate(safeNext(params.get('next')), { replace: true }) },
    );
  };

  return (
    <AuthLayout
      title="Sign in"
      intro="Pick up where you left off. Your progress is saved to your account."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-semibold text-strong underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        {login.error && <InlineMessage tone="error">{login.error.message}</InlineMessage>}
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={form.email}
          error={errors.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          error={errors.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
        <Button type="submit" size="lg" isLoading={login.isPending} loadingText="Signing in">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
