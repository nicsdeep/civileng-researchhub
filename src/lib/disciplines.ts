/**
 * Civil engineering disciplines and the OpenAlex filter that defines each.
 *
 * OpenAlex classifies every work by topic → subfield → field. Civil engineering
 * spans several subfields, so each discipline combines verified ids with a
 * title/abstract keyword check. Ids were checked against the live API:
 *   2205 Civil and Structural Engineering · 2215 Building and Construction
 *   2211 Mechanics of Materials · 2305 Environmental Engineering
 *   2312 Water Science and Technology · 1902 Atmospheric Science
 *   3313 Transportation · T10233/T11375/T11046/T13941 geotechnical topics
 */
export interface Discipline {
  slug: string
  name: string
  description: string
  /** OpenAlex filter fragment (comma-separated filters, no free text from users). */
  filter: string
}

export const DISCIPLINES: Discipline[] = [
  {
    slug: 'structural',
    name: 'Structural',
    description: 'Buildings, bridges, seismic design, structural analysis',
    filter: 'primary_topic.subfield.id:2205,title_and_abstract.search:structural OR seismic OR bridge OR beam OR column',
  },
  {
    slug: 'geotechnical',
    name: 'Geotechnical',
    description: 'Soil mechanics, foundations, slopes, tunnelling',
    filter: 'primary_topic.id:T10233|T11375|T11046|T13941',
  },
  {
    slug: 'transportation',
    name: 'Transportation',
    description: 'Traffic, pavements, highways, transit systems',
    filter: 'primary_topic.subfield.id:3313|2205,title_and_abstract.search:traffic OR pavement OR transportation OR highway',
  },
  {
    slug: 'environmental',
    name: 'Environmental',
    description: 'Wastewater, air quality, solid waste, remediation',
    filter: 'primary_topic.subfield.id:2305|2312,title_and_abstract.search:wastewater OR "air quality" OR "solid waste" OR remediation OR landfill',
  },
  {
    slug: 'water-resources',
    name: 'Water Resources',
    description: 'Hydrology, hydraulics, flood risk, stormwater',
    filter: 'primary_topic.subfield.id:2312|2205|1902,title_and_abstract.search:hydrology OR flood OR hydraulic OR stormwater OR groundwater OR river OR reservoir',
  },
  {
    slug: 'construction',
    name: 'Construction',
    description: 'Project management, BIM, safety, productivity',
    filter: 'primary_topic.subfield.id:2215,title_and_abstract.search:construction',
  },
  {
    slug: 'materials',
    name: 'Materials',
    description: 'Concrete, steel, asphalt, sustainable materials',
    filter: 'primary_topic.subfield.id:2205|2215|2211,title_and_abstract.search:concrete OR asphalt OR cement OR steel',
  },
]

export function findDiscipline(slug: string): Discipline | undefined {
  return DISCIPLINES.find((d) => d.slug === slug)
}
