import type { AnchorHTMLAttributes, ReactNode } from "react"

type HardLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  children: ReactNode
}

/** Link com carregamento real (não SPA). Para navegação pública principal. */
export function HardLink({ href, children, ...props }: HardLinkProps) {
  return <a href={href} {...props}>{children}</a>
}
