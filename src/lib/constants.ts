export const CATEGORIES = [
  { slug: 'growth-hormone', label: 'Growth Hormone' },
  { slug: 'metabolic', label: 'Metabolic' },
  { slug: 'neuropeptide', label: 'Neuropeptide' },
  { slug: 'tissue-repair', label: 'Tissue & Repair' },
  { slug: 'anti-aging', label: 'Anti-aging' },
  { slug: 'growth-factor', label: 'Growth Factor' },
  { slug: 'immune', label: 'Immune' },
  { slug: 'stacks', label: 'Stacks' },
  { slug: 'other', label: 'Other' },
] as const

export type CategorySlug = (typeof CATEGORIES)[number]['slug']

export const DISCLAIMER_TEXT =
  'For research and educational purposes only. Not for human consumption.'

export const DISCLAIMER_FULL =
  'All products sold by Gene X Labs are intended strictly for in-vitro research and educational purposes only. They are not intended for use in food, drugs, medical devices, or cosmetics for humans or animals. Not for human consumption. Buyer agrees to use products solely for research purposes.'

export const SITE_NAME = 'Gene X Labs'
export const SITE_URL = 'https://genexpep.com'
export const SITE_DESCRIPTION =
  'Precision research peptides for scientific exploration. Education-first approach to peptide research.'
