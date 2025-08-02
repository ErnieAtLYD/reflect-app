export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-red-100">
      <div className="rounded-lg bg-white p-8 text-center shadow-lg">
        <h1
          className="font-heading mb-4 text-4xl font-bold text-blue-600"
          data-testid="main-heading"
        >
          Reflect App
        </h1>
        <p className="mb-8 text-gray-600" data-testid="description">
          Next.js 15 with TypeScript and Tailwind CSS
        </p>
        <button
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          data-testid="test-button"
        >
          Test Button
        </button>
      </div>
    </div>
  )
}
