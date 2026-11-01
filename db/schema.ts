import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
export const products = sqliteTable('products', {
 id: integer('id').primaryKey({ autoIncrement: true }),
 name: text('name').notNull(), description: text('description').notNull(),
 price: integer('price').notNull(), category: text('category').notNull(),
 image: text('image').notNull(), status: text('status').notNull().default('draft'),
 revision: integer('revision').notNull().default(1),
 updatedAt: text('updated_at').notNull()
});
export const siteSettings=sqliteTable('site_settings',{
 id:integer('id').primaryKey(),
 value:text('value').notNull(),
 revision:integer('revision').notNull().default(1),
 updatedAt:text('updated_at').notNull()
});
