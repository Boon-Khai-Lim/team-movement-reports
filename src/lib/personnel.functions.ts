import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const getPersonnel = createServerFn({ method: 'GET' }).handler(async () => {
  const { db } = await import('../../db/index')
  const { personnel } = await import('../../db/schema')
  return db.select().from(personnel).orderBy(personnel.unit)
})
const personInput = z.object({
  id: z.string().min(1).max(100),
  unit: z.string().trim().min(1).max(30).transform(s => s.toUpperCase()),
  rank: z.string().trim().min(1).max(30).transform(s => s.toUpperCase()),
  name: z.string().trim().min(1).max(150).transform(s => s.toUpperCase()),
  platoon: z.number().int().min(1).max(2),
})
export const savePerson = createServerFn({ method: 'POST' }).validator(personInput).handler(async ({ data }) => {
  const { db } = await import('../../db/index')
  const { personnel } = await import('../../db/schema')
  try {
    await db.insert(personnel).values(data).onConflictDoUpdate({ target: personnel.id, set: data })
  } catch { throw new Error('Could not save personnel. Check that the unit number is unique and try again.') }
  return { success: true }
})
export const deletePerson = createServerFn({ method: 'POST' }).validator(z.object({ id: z.string().min(1).max(100) })).handler(async ({ data }) => {
  const { db } = await import('../../db/index')
  const { personnel } = await import('../../db/schema')
  const { eq } = await import('drizzle-orm')
  await db.delete(personnel).where(eq(personnel.id, data.id))
  return { success: true }
})
