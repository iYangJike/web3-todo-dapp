import TodoItem from "./TodoItem";

export default function TodoList({ todos, onToggle, onDelete, loading }) {
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div>
      {todos.length > 0 && (
        <p className="text-center text-sm text-gray-500 mb-4">
          共 {todos.length} 项，已完成 {completedCount} 项
        </p>
      )}

      <ul className="list-none p-0 m-0">
        {todos.length === 0 ? (
          <li className="text-center text-gray-600 py-5">暂无任务，添加一个吧！</li>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo.index}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              loading={loading}
            />
          ))
        )}
      </ul>
    </div>
  );
}
