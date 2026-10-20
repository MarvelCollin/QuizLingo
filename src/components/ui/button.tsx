import { Link } from 'react-router';
import { cn } from '../../lib/utils';
import { buttonClasses } from './button-classes';
import { Spinner } from './spinner';
import type { ButtonLinkProps, ButtonProps } from './ui.types';

export const Button = ({
  variant,
  size,
  isLoading = false,
  loadingText,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    className={cn(buttonClasses(variant, size), className)}
    disabled={disabled || isLoading}
    aria-busy={isLoading || undefined}
    {...rest}
  >
    {isLoading ? (
      <>
        <Spinner />
        {loadingText ?? children}
      </>
    ) : (
      children
    )}
  </button>
);

export const ButtonLink = ({ variant, size, className, ...rest }: ButtonLinkProps) => (
  <Link className={cn(buttonClasses(variant, size), className)} {...rest} />
);
