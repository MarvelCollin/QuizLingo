import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, Ref } from 'react';
import type { LinkProps } from 'react-router';
import type { ButtonSize, ButtonVariant } from './button-classes';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
};

export type ButtonLinkProps = LinkProps & { variant?: ButtonVariant; size?: ButtonSize };

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export type StackedBarProps = { segments: BarSegment[]; total: number; label: string; className?: string };

export type SpinnerProps = { className?: string };

export type SkeletonProps = { className?: string };

export type SegmentedControlProps<T extends string> = {
  label: string;
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  isStacked?: boolean;
};

export type SearchFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLabelVisible?: boolean;
  className?: string;
};

export type InlineMessageProps = { tone?: 'error' | 'info'; children: ReactNode; action?: ReactNode; className?: string };

export type ChecklistPopoverProps<T extends string | number> = {
  label: string;
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (selected: T[]) => void;
};

export type CheckboxProps = { label: string; isChecked: boolean; onChange: (isChecked: boolean) => void };

export type SegmentOption<T extends string> = { value: T; label: string; detail?: string };

export type BarSegment = { label: string; value: number; className: string };
