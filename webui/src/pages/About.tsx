import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">About</h1>
        <p className="text-lg text-gray-600 mb-4">
          This project is built with the following technologies:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
          <li>React 19 - UI library</li>
          <li>TypeScript - Type safety</li>
          <li>Vite - Build tool</li>
          <li>Tailwind CSS v4 - Styling</li>
          <li>React Router - Navigation</li>
          <li>ESLint & Prettier - Code quality</li>
        </ul>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}
