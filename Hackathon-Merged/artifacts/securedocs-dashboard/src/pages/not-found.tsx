import { Shield } from 'lucide-react';
import { useLocation } from 'wouter';

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex min-h-[calc(100vh-140px)] w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center text-center">
        <Shield className="mb-4 h-16 w-16 text-blue-600" />
        
        <h1 className="mb-2 text-7xl font-black text-blue-600 md:text-8xl">
          404
        </h1>
        
        <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
          Page Not Found
        </h2>
        
        <p className="mb-2 max-w-md px-4 text-slate-500">
          The page you are looking for does not exist or may have been moved.
        </p>
        
        <p className="mb-8 max-w-md px-4 text-sm text-slate-400">
          Please verify the URL or return to the secure dashboard.
        </p>
        
        <button
          onClick={() => setLocation('/dashboard')}
          className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md"
        >
          &larr; Back to Dashboard
        </button>
      </div>
    </div>
  );
}
