import type { FC, HTMLAttributes, ReactNode } from 'react';
import styles from './signal-typography.module.css';

export type SignalTypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'title-bold'
  | 'title-regular'
  | 'body1-bold'
  | 'body1-regular'
  | 'body1-caps-bold'
  | 'body1-caps-regular'
  | 'body2-bold'
  | 'body2-regular'
  | 'label-bold'
  | 'label-regular'
  | 'strike-number';

type ElementTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label';

export interface SignalTypographyProps extends HTMLAttributes<HTMLElement> {
  /** Typography variant from the design system */
  variant: SignalTypographyVariant;
  /** Override the rendered HTML element */
  as?: ElementTag;
  /** Content */
  children: ReactNode;
}

const DEFAULT_ELEMENT_MAP: Record<SignalTypographyVariant, ElementTag> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  'title-bold': 'p',
  'title-regular': 'p',
  'body1-bold': 'p',
  'body1-regular': 'p',
  'body1-caps-bold': 'p',
  'body1-caps-regular': 'p',
  'body2-bold': 'p',
  'body2-regular': 'p',
  'label-bold': 'span',
  'label-regular': 'span',
  'strike-number': 'span',
};

const SignalTypography: FC<SignalTypographyProps> = ({
  variant,
  as,
  children,
  className,
  ...props
}) => {
  const Tag = as ?? DEFAULT_ELEMENT_MAP[variant];
  const classes = [
    styles['signal-typography'],
    styles[`signal-typography--${variant}`],
    className ?? '',
  ].filter(Boolean).join(' ');

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
};

export default SignalTypography;
