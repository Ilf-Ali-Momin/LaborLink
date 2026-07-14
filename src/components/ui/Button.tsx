import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variant = 'primary' | 'outline' | 'ghost' | 'inverse'

const base =
  'inline-flex items-center justify-center gap-2 rounded-btn px-5 py-2.5 text-sm font-semibold transition ' +
  'motion-safe:hover:-translate-y-0.5'

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-white shadow-card hover:bg-primary-deep hover:shadow-card-hover',
  outline:
    'border border-primary/30 bg-surface/60 text-primary hover:border-primary/60 hover:bg-primary-soft',
  ghost: 'text-ink hover:bg-primary-soft hover:text-primary',
  inverse: 'bg-white text-primary shadow-card hover:bg-primary-soft',
}

export function buttonClasses(variant: Variant, extra = ''): string {
  return `${base} ${variants[variant]} ${extra}`.trim()
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
}

export function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  return <button className={buttonClasses(variant, className)} {...rest} />
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant
}

export function ButtonLink({
  variant = 'primary',
  className = '',
  ...rest
}: ButtonLinkProps) {
  return <a className={buttonClasses(variant, className)} {...rest} />
}

type ButtonRouterLinkProps = LinkProps & {
  variant?: Variant
}

/** Same look as ButtonLink but SPA navigation via react router. */
export function ButtonRouterLink({
  variant = 'primary',
  className = '',
  ...rest
}: ButtonRouterLinkProps) {
  return <Link className={buttonClasses(variant, className)} {...rest} />
}
