import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { InlineMessage } from '../../components/ui/inline-message';
import { TextField } from '../../components/ui/text-field';
import { usePageMeta } from '../../lib/use-page-meta';
import { AuthLayout } from './auth-layout';
import { useRegister } from './use-session';
import { validateRegistration } from './validation';
import type { FieldErrors, Registration } from './types';

const RegisterPage = () => {
  usePageMeta('Create an account', 'Create a free QuizLingo account to save your HSK 3.0 practice progress.');
  const navigate = useNavigate();
  const register = useRegister();
  const [form, setForm] = useState<Registration>({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<Registration>>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validateRegistration(form);
    setErrors(found);
    const firstInvalid = (['name', 'email', 'password'] as const).find((field) => found[field]);
    if (firstInvalid) {
      event.currentTarget.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    register.mutate(
      { name: form.name.trim(), email: form.email.trim(), password: form.password },
      { onSuccess: () => navigate('/', { replace: true }) },
    );
  };

  return (
    <AuthLayout
      title="Create your account"
      intro="Free, and it only takes your name, email and a password. Every answer you give is saved to it."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-strong underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
        {register.error && <InlineMessage tone="error">{register.error.message}</InlineMessage>}
        <TextField
          label="Name"
          name="name"
          autoComplete="nickname"
          value={form.name}
          error={errors.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
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
          autoComplete="new-password"
          hint="At least 8 characters."
          value={form.password}
          error={errors.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
        <Button type="submit" size="lg" isLoading={register.isPending} loadingText="Creating your account">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
