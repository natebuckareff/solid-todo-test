import { RouteDefinition, createAsync, useAction, useSubmissions } from '@solidjs/router';
import { For, Show } from 'solid-js';
import { createTodo, getTodo, getTodoIds, updateTodo } from '~/lib/api';

export const route = {
  load() {
    getTodoIds();
  },
} satisfies RouteDefinition;

export default function Home() {
  const todoIds = createAsync(() => getTodoIds());
  const todosCreating = useSubmissions(createTodo);
  return (
    <main>
      <form action={createTodo} method="post">
        <label>
          title:
          <input name="title" type="text" />
        </label>
        <input type="submit" value="create" />
      </form>
      <table>
        <thead>
          <tr>
            <th>id</th>
            <th>title</th>
            <th>completed</th>
          </tr>
        </thead>
        <tbody>
          <For each={todoIds()}>{id => <TodoItem id={id} />}</For>
          <For each={todosCreating}>
            {sub => (
              <tr>
                <td></td>
                <td>{sub.input[0].get('title') as string}</td>
                <td>
                  <input type="checkbox" checked={false} />
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </main>
  );
}

function TodoItem(props: { id: string }) {
  const todo = createAsync(() => getTodo(props.id));
  const todoUpdater = useAction(updateTodo);
  const todoUpdating = useSubmissions(updateTodo);
  return (
    <Show when={todo()}>
      {todo => (
        <tr>
          <td style={{ 'text-align': 'right' }}>
            <code style={{ color: 'gray', 'font-style': 'italic' }}>{todo().id}</code>
          </td>
          <td>{todo().title}</td>
          <td>
            <input
              type="checkbox"
              checked={todo().completed}
              disabled={Boolean(todoUpdating.find(x => x.input[0] === todo().id))}
              onClick={e =>
                todoUpdater(todo().id, {
                  completed: e.currentTarget.checked,
                })
              }
            />
          </td>
        </tr>
      )}
    </Show>
  );
}
