import { Check, CircleCheck } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { Reveal } from './ui/Reveal'
import { SectionHeading } from './ui/SectionHeading'
import { ButtonRouterLink } from './ui/Button'

export function Pricing() {
  const { t } = useI18n()

  return (
    <section id="pricing" className="scroll-mt-28 py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <SectionHeading
          kicker={t.pricing.kicker}
          title={t.pricing.title}
          sub={t.pricing.sub}
        />

        <div className="grid items-stretch gap-6 pt-4 md:grid-cols-3">
          {t.pricing.tiers.map((tier, i) => (
            <Reveal key={tier.name} index={i} className="h-full">
              <article
                className={`relative flex h-full flex-col rounded-card bg-surface p-8 ${
                  tier.highlighted
                    ? 'shadow-card-hover ring-2 ring-primary'
                    : 'border shadow-card'
                }`}
              >
                {tier.badge && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3.5 py-1 text-xs font-bold text-white">
                    {tier.badge}
                  </span>
                )}

                <h3 className="font-semibold">{tier.name}</h3>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-sm text-ink-muted">{tier.cadence}</span>
                </p>
                <p className="mt-2.5 text-sm text-ink-muted">{tier.desc}</p>

                <ul className="mt-7 flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-2.5 text-sm">
                      {/* Green is reserved for compliance and trust cues */}
                      {feature.compliance ? (
                        <CircleCheck
                          size={18}
                          className="mt-px shrink-0 text-success"
                          aria-hidden="true"
                        />
                      ) : (
                        <Check
                          size={18}
                          className="mt-px shrink-0 text-primary"
                          aria-hidden="true"
                        />
                      )}
                      {feature.text}
                    </li>
                  ))}
                </ul>

                <ButtonRouterLink
                  to={i === 0 ? '/login?role=student' : '/login?role=employer'}
                  variant={tier.highlighted ? 'primary' : 'outline'}
                  className="mt-8 w-full"
                >
                  {tier.cta}
                </ButtonRouterLink>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
