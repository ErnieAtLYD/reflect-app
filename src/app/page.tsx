export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold" data-testid="main-heading">
          Reflect App
        </h1>
        <p className="mb-8 text-gray-600" data-testid="description">
          Next.js 15 with TypeScript and Tailwind CSS
        </p>
        <button
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          data-testid="test-button"
        >
          Test Button
        </button>
      </div>
    </div>
  )
}
