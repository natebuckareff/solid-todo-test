import { action, cache, reload } from '@solidjs/router';
import { storage } from '~/lib/db';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

async function throttle() {
  // await new Promise(resolve => setTimeout(resolve, 2_000));
}

export const getTodoIds = cache(async () => {
  'use server';
  await throttle();
  return await storage.getKeys();
}, 'getTodoIds');

export const getTodo = cache(async (id: string) => {
  'use server';
  await throttle();
  return (await storage.getItem(id)) as Todo;
}, 'getTodo');

export const createTodo = action(async (formData: FormData) => {
  'use server';
  await throttle();
  const id = Math.random().toString(36).slice(2);
  const title = formData.get('title');
  if (typeof title !== 'string') {
    throw Error('invalid title');
  }
  await storage.setItem(id, { id, title, completed: false });
  reload({ revalidate: [getTodoIds.key] });
}, 'createTodo');

export const updateTodo = action(async (id: string, changes: Partial<Omit<Todo, 'id'>>) => {
  'use server';
  await throttle();
  if (!(await storage.hasItem(id))) {
    throw new Error('todo not found');
  }
  const todo = (await storage.getItem(id)) as Todo;
  await storage.setItem(id, { ...todo, ...changes });
  reload({ revalidate: [] }); // getTodo.keyFor(id) });
}, 'updateTodo');

export const deleteTodo = action(async (id: string) => {
  'use server';
  await throttle();
  if (!(await storage.hasItem(id))) {
    throw new Error('todo not found');
  }
  await storage.removeItem(id);
  reload({ revalidate: [getTodoIds.key, getTodo.keyFor(id)] });
}, 'deleteTodo');
