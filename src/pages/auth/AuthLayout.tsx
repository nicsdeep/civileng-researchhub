import type { ReactNode } from 'react'

/** Centred card used by the sign-in, sign-up and password pages. */
export function AuthLayout({ title, accent, intro, children }: { title: string; accent?: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <div className="container-page flex justify-center py-12 sm:py-16">
      <div className="panel w-full max-w-md p-6 sm:p-8">
        <h1 className="display text-4xl">
          {title} {accent && <em className="text-brand-italic">{accent}</em>}
        </h1>
        {intro && <div className="mt-2 text-sm text-muted">{intro}</div>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{message}</p>
}

export function Field({ id, label, hint, ...input }: { id: string; label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      <input id={id} className="field py-2.5 text-base" {...input} />
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}
