/**
 * Civil engineering disciplines and how each narrows an OpenAlex search.
 * `terms` is matched against titles and abstracts. Phase 2 will add verified
 * OpenAlex topic/subfield ids for more precise filtering.
 */
export interface Discipline {
  slug: string
  name: string
  description: string
  terms: string
}

export const DISCIPLINES: Discipline[] = [
  {
    slug: 'structural',
    name: 'Structural',
    description: 'Buildings, bridges, seismic design, structural analysis',
    terms: 'structural engineering',
  },
  {
    slug: 'geotechnical',
    name: 'Geotechnical',
    description: 'Soil mechanics, foundations, slopes, tunnelling',
    terms: 'geotechnical',
  },
  {
    slug: 'transportation',
    name: 'Transportation',
    description: 'Traffic, pavements, highways, transit systems',
    terms: 'transportation engineering',
  },
  {
    slug: 'environmental',
    name: 'Environmental',
    description: 'Wastewater, air quality, solid waste, remediation',
    terms: 'environmental engineering',
  },
  {
    slug: 'water-resources',
    name: 'Water Resources',
    description: 'Hydrology, hydraulics, flood risk, stormwater',
    terms: 'hydraulic engineering',
  },
  {
    slug: 'construction',
    name: 'Construction',
    description: 'Project management, BIM, safety, productivity',
    terms: 'construction management',
  },
  {
    slug: 'materials',
    name: 'Materials',
    description: 'Concrete, steel, asphalt, sustainable materials',
    terms: 'construction materials',
  },
]

export function findDiscipline(slug: string): Discipline | undefined {
  return DISCIPLINES.find((d) => d.slug === slug)
}
