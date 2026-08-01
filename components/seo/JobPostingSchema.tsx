import { siteUrl } from "@/lib/site";

/**
 * schema.org JobPosting — what makes a listing eligible for the Google for
 * Jobs results panel, which is the main organic channel for a job board.
 *
 * Only fields we genuinely have are emitted. Google penalises listings whose
 * structured data disagrees with the visible page, so nothing here is
 * invented: no fake salary ranges, no fake locations, no fake dates.
 */
export function JobPostingSchema({
  title,
  description,
  slug,
  publishedAt,
  city,
  remote,
  hourlyWageCents,
  hoursPerWeek,
  employerName,
  employerSlug,
}: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string | null;
  city: string | null;
  remote: boolean;
  hourlyWageCents: number;
  hoursPerWeek: number;
  employerName: string;
  employerSlug: string;
}) {
  const base = siteUrl();

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description,
    url: `${base}/jobs/${slug}`,
    employmentType: "PART_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: employerName,
      sameAs: `${base}/companies/${employerSlug}`,
    },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "EUR",
      value: {
        "@type": "QuantitativeValue",
        value: hourlyWageCents / 100,
        unitText: "HOUR",
      },
    },
    workHours: `${hoursPerWeek} hours per week`,
    directApply: true,
  };

  if (publishedAt) schema.datePosted = publishedAt.slice(0, 10);

  if (city) {
    schema.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: city,
        addressCountry: "DE",
      },
    };
  }

  // Google requires this specific shape for remote-eligible roles, plus a
  // jobLocation, which we have above.
  if (remote) {
    schema.jobLocationType = "TELECOMMUTE";
    schema.applicantLocationRequirements = {
      "@type": "Country",
      name: "Germany",
    };
  }

  return (
    <script
      type="application/ld+json"
      // Values are escaped by JSON.stringify and rendered inside a
      // non-executable ld+json block; "</script>" is neutralised below.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
