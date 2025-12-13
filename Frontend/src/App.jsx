export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-xl bg-white shadow-lg p-6 space-y-4 dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Tailwind Test
        </h1>

        <p className="text-gray-600 dark:text-gray-300">
          If this looks styled, Tailwind is working 🎉
        </p>

        <div className="flex gap-3">
          <button className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition">
            Primary
          </button>
          <button className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition">
            Secondary
          </button>
        </div>

        <div className="rounded-lg bg-green-100 p-3 text-green-800 text-sm dark:bg-green-900 dark:text-green-200">
          Responsive test: resize the screen
        </div>
      </div>
    </div>
  );
}
