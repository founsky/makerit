import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Header ── */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-slate-900">MakerIt</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/marketplace" className="text-slate-500 hover:text-indigo-600 text-sm font-medium transition-colors">Marketplace</Link>
            <Link href="/makers" className="text-slate-500 hover:text-indigo-600 text-sm font-medium transition-colors">Makers</Link>
            <Link href="/#how" className="text-slate-500 hover:text-indigo-600 text-sm font-medium transition-colors">Comment ça marche</Link>
            <Link href="/faq" className="text-slate-500 hover:text-indigo-600 text-sm font-medium transition-colors">FAQ</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-slate-600 hover:text-indigo-600 text-sm font-medium transition-colors hidden sm:block">Connexion</Link>
            <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-28 px-6 overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
        {/* Decorative blobs */}
        <div className="absolute top-24 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-indigo-200 px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
            <span className="text-lg">✨</span>
            + de 500 makers actifs en France
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Donnez vie à vos{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              idées en 3D
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connectez-vous avec des makers passionnés qui imprimeront vos créations, ou partagez vos modèles avec la communauté.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/marketplace"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all shadow-lg shadow-indigo-900/50 hover:-translate-y-0.5"
            >
              Trouver un maker
            </Link>
            <Link
              href="/register?role=MAKER"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/25 hover:border-white/40 px-8 py-4 rounded-xl font-semibold text-base transition-all backdrop-blur-sm hover:-translate-y-0.5"
            >
              Je suis maker
            </Link>
          </div>

          {/* Inline stats bar */}
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 text-center">
            {[
              { value: '500+', label: 'modèles partagés' },
              { value: '4.9★', label: 'note moyenne' },
              { value: '2 000+', label: 'impressions réalisées' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Galerie Réalisations ── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">Réalisations</span>
            <h2 className="text-4xl font-bold text-slate-900 mb-3">Ce que font nos makers</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Des créations uniques imaginées et imprimées par notre communauté</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 – Figurine */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-slate-100">
              <div className="h-52 bg-gradient-to-br from-violet-100 to-purple-200 flex items-center justify-center">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="drop-shadow-md">
                  <ellipse cx="40" cy="68" rx="16" ry="4" fill="#7c3aed" opacity="0.3"/>
                  <rect x="32" y="50" width="16" height="18" rx="4" fill="#7c3aed"/>
                  <rect x="28" y="54" width="8" height="10" rx="3" fill="#6d28d9"/>
                  <rect x="44" y="54" width="8" height="10" rx="3" fill="#6d28d9"/>
                  <circle cx="40" cy="38" r="12" fill="#8b5cf6"/>
                  <rect x="30" y="44" width="20" height="8" rx="2" fill="#7c3aed"/>
                  <circle cx="36" cy="36" r="2" fill="#ddd6fe"/>
                  <circle cx="44" cy="36" r="2" fill="#ddd6fe"/>
                  <path d="M36 42 Q40 45 44 42" stroke="#ddd6fe" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">Figurine</span>
                <h3 className="font-bold text-slate-900 mt-2 mb-0.5">Chevalier Médiéval</h3>
                <p className="text-slate-500 text-sm mb-3">par <span className="text-indigo-600 font-medium">ThomasB</span></p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">12 €</span>
                  <span className="text-xs text-slate-400">★ 4.9</span>
                </div>
              </div>
            </div>

            {/* Card 2 – Engrenage */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-slate-100">
              <div className="h-52 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="drop-shadow-md">
                  <circle cx="40" cy="40" r="20" fill="#475569" stroke="#94a3b8" strokeWidth="2"/>
                  <circle cx="40" cy="40" r="8" fill="#1e293b"/>
                  <circle cx="40" cy="40" r="3" fill="#64748b"/>
                  {[0,45,90,135,180,225,270,315].map((angle, i) => {
                    const rad = (angle * Math.PI) / 180
                    const x1 = 40 + 18 * Math.cos(rad)
                    const y1 = 40 + 18 * Math.sin(rad)
                    const x2 = 40 + 26 * Math.cos(rad)
                    const y2 = 40 + 26 * Math.sin(rad)
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="5" strokeLinecap="round"/>
                  })}
                </svg>
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">Mécanique</span>
                <h3 className="font-bold text-slate-900 mt-2 mb-0.5">Engrenage Fonctionnel</h3>
                <p className="text-slate-500 text-sm mb-3">par <span className="text-indigo-600 font-medium">PierreL</span></p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">8 €</span>
                  <span className="text-xs text-slate-400">★ 5.0</span>
                </div>
              </div>
            </div>

            {/* Card 3 – Vase */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-slate-100">
              <div className="h-52 bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="drop-shadow-md">
                  <path d="M28 70 Q24 50 24 38 Q24 20 40 18 Q56 20 56 38 Q56 50 52 70 Z" fill="#0d9488" stroke="#0f766e" strokeWidth="1.5"/>
                  <path d="M30 68 Q26 50 26 38 Q26 22 40 20 Q54 22 54 38 Q54 50 50 68" fill="#14b8a6" opacity="0.5"/>
                  <rect x="26" y="68" width="28" height="4" rx="2" fill="#0f766e"/>
                  <rect x="22" y="18" width="36" height="5" rx="2.5" fill="#0d9488"/>
                  <ellipse cx="40" cy="18" rx="14" ry="3" fill="#0f766e"/>
                  <path d="M32 40 Q40 35 48 40" stroke="#a7f3d0" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <path d="M30 50 Q40 44 50 50" stroke="#a7f3d0" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">Décoration</span>
                <h3 className="font-bold text-slate-900 mt-2 mb-0.5">Vase Géométrique</h3>
                <p className="text-slate-500 text-sm mb-3">par <span className="text-indigo-600 font-medium">SophieR</span></p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">15 €</span>
                  <span className="text-xs text-slate-400">★ 4.8</span>
                </div>
              </div>
            </div>

            {/* Card 4 – Bijou */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-slate-100">
              <div className="h-52 bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="drop-shadow-md">
                  <polygon points="40,12 52,28 72,28 58,42 64,60 40,50 16,60 22,42 8,28 28,28" fill="#f43f5e" stroke="#be123c" strokeWidth="1.5"/>
                  <polygon points="40,20 49,30 63,30 52,39 56,52 40,44 24,52 28,39 17,30 31,30" fill="#fb7185" opacity="0.7"/>
                  <circle cx="40" cy="36" r="5" fill="#fff" opacity="0.6"/>
                </svg>
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Bijou</span>
                <h3 className="font-bold text-slate-900 mt-2 mb-0.5">Pendentif Étoile</h3>
                <p className="text-slate-500 text-sm mb-3">par <span className="text-indigo-600 font-medium">ClaraM</span></p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">6 €</span>
                  <span className="text-xs text-slate-400">★ 4.7</span>
                </div>
              </div>
            </div>

            {/* Card 5 – Support téléphone */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-slate-100">
              <div className="h-52 bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="drop-shadow-md">
                  <rect x="28" y="10" width="24" height="40" rx="4" fill="#f97316" stroke="#ea580c" strokeWidth="1.5"/>
                  <rect x="30" y="13" width="20" height="28" rx="2" fill="#fed7aa"/>
                  <circle cx="40" cy="45" r="2.5" fill="#ea580c"/>
                  <path d="M20 55 L60 55 L64 70 L16 70 Z" fill="#f97316" stroke="#ea580c" strokeWidth="1.5"/>
                  <path d="M24 55 L28 70" stroke="#ea580c" strokeWidth="1.5"/>
                  <path d="M52 55 L56 70" stroke="#ea580c" strokeWidth="1.5"/>
                  <rect x="28" y="50" width="24" height="5" rx="1" fill="#fb923c"/>
                </svg>
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Accessoire</span>
                <h3 className="font-bold text-slate-900 mt-2 mb-0.5">Support Téléphone Bureau</h3>
                <p className="text-slate-500 text-sm mb-3">par <span className="text-indigo-600 font-medium">MaximeD</span></p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">9 €</span>
                  <span className="text-xs text-slate-400">★ 4.9</span>
                </div>
              </div>
            </div>

            {/* Card 6 – Château miniature */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-slate-100">
              <div className="h-52 bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="drop-shadow-md">
                  <rect x="18" y="50" width="44" height="22" fill="#3b82f6"/>
                  <rect x="22" y="55" width="8" height="12" rx="1" fill="#bfdbfe"/>
                  <rect x="36" y="52" width="8" height="20" rx="1" fill="#93c5fd"/>
                  <rect x="50" y="55" width="8" height="12" rx="1" fill="#bfdbfe"/>
                  <rect x="14" y="34" width="12" height="18" fill="#2563eb"/>
                  <rect x="54" y="34" width="12" height="18" fill="#2563eb"/>
                  <rect x="30" y="26" width="20" height="26" fill="#1d4ed8"/>
                  <rect x="38" y="44" width="4" height="10" rx="2" fill="#bfdbfe"/>
                  <rect x="12" y="30" width="4" height="6" fill="#1d4ed8"/>
                  <rect x="18" y="30" width="4" height="6" fill="#1d4ed8"/>
                  <rect x="56" y="30" width="4" height="6" fill="#1d4ed8"/>
                  <rect x="62" y="30" width="4" height="6" fill="#1d4ed8"/>
                  <rect x="28" y="22" width="4" height="6" fill="#1d4ed8"/>
                  <rect x="34" y="22" width="4" height="6" fill="#1d4ed8"/>
                  <rect x="42" y="22" width="4" height="6" fill="#1d4ed8"/>
                  <rect x="48" y="22" width="4" height="6" fill="#1d4ed8"/>
                  <rect x="36" y="14" width="8" height="14" fill="#1e40af"/>
                  <polygon points="40,8 36,14 44,14" fill="#1e3a8a"/>
                </svg>
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Miniature</span>
                <h3 className="font-bold text-slate-900 mt-2 mb-0.5">Château Médiéval</h3>
                <p className="text-slate-500 text-sm mb-3">par <span className="text-indigo-600 font-medium">JulienF</span></p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">24 €</span>
                  <span className="text-xs text-slate-400">★ 5.0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/marketplace" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
              Voir tous les modèles
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section id="how" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">Comment ça marche</span>
            <h2 className="text-4xl font-bold text-slate-900 mb-3">Simple, rapide et sécurisé</h2>
            <p className="text-slate-500 text-lg">Que vous soyez client ou maker, démarrez en quelques minutes</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Makers */}
            <div className="relative bg-gradient-to-br from-indigo-50 via-indigo-50 to-violet-50 rounded-3xl p-8 border border-indigo-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Pour les makers</h3>
              </div>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Inscrivez-vous avec votre imprimante', desc: 'Renseignez votre modèle d\'imprimante, vos matériaux disponibles et votre tarif horaire.' },
                  { step: '2', title: 'Partagez vos modèles 3D', desc: 'Uploadez vos fichiers STL, ajoutez des photos et définissez vos prix.' },
                  { step: '3', title: 'Acceptez des commandes et gagnez de l\'argent', desc: 'Recevez des demandes, imprimez et expédiez. Les paiements sont automatiques.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm">
                      {item.step}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{item.title}</div>
                      <div className="text-slate-500 text-sm mt-1 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/register?role=MAKER" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm">
                  Devenir maker →
                </Link>
              </div>
            </div>

            {/* Clients */}
            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-8 border border-slate-200">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shadow-md shadow-slate-300">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 11H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Pour les clients</h3>
              </div>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Parcourez les modèles disponibles', desc: 'Des milliers de modèles 3D dans toutes les catégories, filtrés par matériau et prix.' },
                  { step: '2', title: 'Choisissez votre maker', desc: 'Comparez les profils, les avis et les réalisations. Envoyez votre demande en un clic.' },
                  { step: '3', title: 'Recevez votre impression chez vous', desc: 'Payez en ligne de manière sécurisée et recevez votre objet imprimé sous 48-72h.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{item.title}</div>
                      <div className="text-slate-500 text-sm mt-1 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/marketplace" className="inline-block bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
                  Explorer le marketplace →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Témoignages ── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">Témoignages</span>
            <h2 className="text-4xl font-bold text-slate-900 mb-3">Ils nous font confiance</h2>
            <p className="text-slate-500 text-lg">La satisfaction de notre communauté parle pour nous</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                initials: 'EM', color: 'bg-violet-600', name: 'Emma Martin',
                ville: 'Lyon', role: 'Cliente',
                quote: 'J\'ai commandé un support custom pour mon studio photo. Le maker a été ultra réactif et le rendu était parfait. Livré en 3 jours !',
                stars: 5,
              },
              {
                initials: 'AL', color: 'bg-indigo-600', name: 'Antoine Leclerc',
                ville: 'Paris', role: 'Maker vérifié',
                quote: 'Grâce à MakerIt, j\'ai amorti mon imprimante en moins de 2 mois et je gagne maintenant un revenu complémentaire sympa chaque semaine.',
                stars: 5,
              },
              {
                initials: 'NC', color: 'bg-teal-600', name: 'Nadia Chaoui',
                ville: 'Bordeaux', role: 'Cliente & Maker',
                quote: 'La plateforme est vraiment intuitive. J\'ai trouvé des modèles superbes pour décorer mon appartement. La communauté est bienveillante.',
                stars: 5,
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
                <div className="flex text-amber-400 mb-4 text-sm gap-0.5">
                  {'★'.repeat(t.stars)}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                    <div className="text-slate-400 text-xs">{t.ville} · {t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Makers en vedette ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">Makers en vedette</span>
            <h2 className="text-4xl font-bold text-slate-900 mb-3">Nos makers du moment</h2>
            <p className="text-slate-500 text-lg">Des passionnés prêts à imprimer votre prochain projet</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                initials: 'TB', color: 'bg-indigo-600', name: 'Thomas Bertrand',
                ville: 'Paris (75)', printer: 'Bambu Lab X1', materials: ['PLA', 'PETG', 'TPU'],
                rating: 4.9, prints: 142,
              },
              {
                initials: 'SR', color: 'bg-violet-600', name: 'Sophie Rousseau',
                ville: 'Toulouse (31)', printer: 'Prusa MK4', materials: ['PLA', 'ABS', 'Résine'],
                rating: 5.0, prints: 87,
              },
              {
                initials: 'JF', color: 'bg-teal-600', name: 'Julien Fabre',
                ville: 'Nantes (44)', printer: 'Creality Ender 5', materials: ['PLA', 'PETG', 'Bois'],
                rating: 4.8, prints: 203,
              },
            ].map((maker) => (
              <div key={maker.name} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-indigo-200 transition-colors hover:shadow-md group">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 ${maker.color} rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm`}>
                    {maker.initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{maker.name}</h3>
                    <p className="text-slate-500 text-sm flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      {maker.ville}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-amber-400 text-xs">★</span>
                      <span className="text-slate-700 text-xs font-semibold">{maker.rating}</span>
                      <span className="text-slate-400 text-xs ml-1">{maker.prints} impressions</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 mb-2 font-medium">{maker.printer}</div>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {maker.materials.map((m) => (
                    <span key={m} className="bg-white text-slate-600 border border-slate-200 text-xs px-2 py-0.5 rounded-full">{m}</span>
                  ))}
                </div>
                <Link href="/makers" className="block w-full text-center bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 hover:border-indigo-300 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Voir le profil
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/makers" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
              Voir tous les makers
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="relative py-24 px-6 overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700">
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">Prêt à commencer ?</h2>
          <p className="text-indigo-200 text-lg mb-10">
            Rejoignez des milliers de makers et de clients qui font déjà confiance à MakerIt.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-4 rounded-xl font-bold text-base transition-colors shadow-lg">
              Créer un compte gratuit
            </Link>
            <Link href="/marketplace" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-xl font-semibold text-base transition-colors backdrop-blur-sm">
              Explorer le marketplace
            </Link>
          </div>
          <p className="text-indigo-300 text-sm mt-6">Gratuit · Sans engagement · Paiement sécurisé</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 text-slate-400 py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-xl font-bold text-white">MakerIt</span>
              </div>
              <p className="text-sm leading-relaxed">
                La marketplace de référence pour l&apos;impression 3D en France. Commandez, vendez, créez.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Plateforme</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link href="/makers" className="hover:text-white transition-colors">Makers</Link></li>
                <li><Link href="/#how" className="hover:text-white transition-colors">Comment ça marche</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Aide</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><a href="mailto:contact@makerit.fr" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Compte</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register" className="hover:text-white transition-colors">S&apos;inscrire</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Connexion</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span>© {new Date().getFullYear()} MakerIt. Tous droits réservés.</span>
            <div className="flex gap-4">
              <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
              <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
