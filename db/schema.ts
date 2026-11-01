import { pgTable, text, integer } from 'drizzle-orm/pg-core'
export const personnel = pgTable('personnel', {
  id: text('id').primaryKey(),
  unit: text('unit').notNull().unique(),
  rank: text('rank').notNull(),
  name: text('name').notNull(),
  platoon: integer('platoon').notNull().default(1),
})
