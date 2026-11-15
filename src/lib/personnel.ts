import { requireSupabase } from './supabase'

export type Person = {
  id: string
  unit: string
  rank: string
  name: string
  platoon: number
}

export async function getPersonnel(): Promise<Person[]> {
  const { data, error } = await requireSupabase()
    .from('personnel')
    .select('id, unit, rank, name, platoon')
    .order('unit')
  if (error) throw error
  return (data ?? []) as Person[]
}

export async function savePerson(person: Person): Promise<void> {
  const cleaned: Person = {
    ...person,
    unit: person.unit.trim().toUpperCase(),
    rank: person.rank.trim().toUpperCase(),
    name: person.name.trim().toUpperCase(),
  }
  if (!cleaned.id || !cleaned.unit || !cleaned.rank || !cleaned.name || ![1, 2].includes(cleaned.platoon)) {
    throw new Error('Please provide valid personnel details.')
  }
  const { error } = await requireSupabase().from('personnel').upsert(cleaned, { onConflict: 'id' })
  if (error) throw error
}

export async function deletePerson(id: string): Promise<void> {
  const { error } = await requireSupabase().from('personnel').delete().eq('id', id)
  if (error) throw error
}
