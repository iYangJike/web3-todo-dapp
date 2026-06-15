export default function TodoItem({ todo, onToggle, onDelete, loading }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3.5 mb-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
      <span
        className={`flex-1 ${todo.completed ? "line-through text-gray-500" : "text-gray-200"}`}
      >
        {todo.text}
      </span>
      <button
        onClick={() => onToggle(todo.index)}
        disabled={loading}
        className="px-3 py-1.5 text-sm rounded-md bg-white/10 hover:bg-white/20 text-gray-300 cursor-pointer transition-colors disabled:opacity-50"
      >
        {todo.completed ? "撤销" : "完成"}
      </button>
      <button
        onClick={() => onDelete(todo.index)}
        disabled={loading}
        className="px-3 py-1.5 text-sm rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-400 cursor-pointer transition-colors disabled:opacity-50"
      >
        删除
      </button>
    </li>
  );
}
