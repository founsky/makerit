import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">MakerIt</span>
          </Link>
          <p className="text-slate-500 text-sm mt-2">La communauté des makers 3D</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
