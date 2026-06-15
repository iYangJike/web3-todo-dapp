import { useState } from "react";

export default function TodoInput({ onSubmit, loading }) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text);
    setText("");
  };

  return (
    <div className="flex gap-2 mb-5">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="输入新任务..."
        disabled={loading}
        className="flex-1 px-4 py-3 border border-gray-600 rounded-lg bg-white/5 text-white text-base outline-none focus:border-violet-500 disabled:opacity-50"
      />
      <button
        onClick={handleSubmit}
        disabled={loading || !text.trim()}
        className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-6 py-3 rounded-lg text-base cursor-pointer transition-colors"
      >
        添加
      </button>
    </div>
  );
}
