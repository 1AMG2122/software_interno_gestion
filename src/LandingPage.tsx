import React from 'react';

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased font-sans">
      {/* Header / Navbar */}
      <nav className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3 7h7l-5.5 4 2 7-6.5-4-6.5 4 2-7L2 9h7z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900">GIUS</span>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-8">
                <a href="#como-funciona" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition">Cómo funciona</a>
                <a href="#ventajas" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition">Ventajas</a>
                <a href="#precios" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition">Precios</a>
                <button
                  onClick={onLogin}
                  className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 transition active:scale-95"
                >
                  Entrar
                </button>
              </div>
            </div>
            <div className="md:hidden">
              <button onClick={onLogin} className="text-sm font-bold text-indigo-600">Entrar</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
        <div className="absolute top-0 left-1/2 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:-top-12 md:-top-20 lg:-top-32" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100/40 to-violet-100/40 opacity-40" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl">
              Gestiona tu espacio de trabajo de forma <span className="text-indigo-600">simple, segura y escalable</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
              Centraliza usuarios, información y procesos en una única plataforma pensada para equipos pequeños, empresas en crecimiento y organizaciones que necesitan orden y control.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={onLogin}
                className="rounded-full bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 hover:-translate-y-0.5 transition active:scale-95"
              >
                Empieza gratis
              </button>
              <a href="#como-funciona" className="text-sm font-semibold leading-6 text-zinc-900 hover:text-indigo-600 transition">
                Saber más <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <div className="mt-16 flow-root sm:mt-24">
            <div className="relative -m-2 rounded-xl bg-zinc-900/5 p-2 ring-1 ring-inset ring-zinc-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <div className="rounded-md bg-white shadow-2xl ring-1 ring-zinc-900/10 aspect-[16/9] flex items-center justify-center overflow-hidden">
                 <div className="p-8 text-center bg-zinc-50 w-full h-full flex flex-col justify-center items-center">
                    <div className="w-16 h-16 mb-4 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3 7h7l-5.5 4 2 7-6.5-4-6.5 4 2-7L2 9h7z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900">Vista previa del panel de control</h3>
                    <p className="text-zinc-500 mt-2 max-w-md">Organiza tus incidencias, gestiona tu equipo y optimiza tus procesos en un entorno profesional y limpio.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Explanation */}
      <section className="bg-zinc-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">¿Qué es GIUS?</h2>
            <p className="mt-6 text-lg leading-8 text-zinc-600">
              Esta aplicación permite organizar y gestionar tu entorno de trabajo desde un único lugar. Podrás administrar usuarios, controlar el acceso, centralizar información y trabajar de forma más eficiente con una estructura clara y escalable.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Cómo funciona</h2>
            <p className="mt-4 text-lg text-zinc-600">En solo cuatro pasos tendrás todo bajo control.</p>
          </div>
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "1", title: "Crea tu cuenta", desc: "Regístrate en pocos segundos y comienza a configurar tu espacio." },
              { step: "2", title: "Configura tu espacio", desc: "Personaliza los ajustes según las necesidades de tu equipo." },
              { step: "3", title: "Añade usuarios", desc: "Invita a tus colaboradores según el plan que mejor se adapte." },
              { step: "4", title: "Gestiona", desc: "Administra toda la información desde un panel centralizado." },
            ].map((item, i) => (
              <div key={i} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-zinc-900">
                  <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white shadow-lg shadow-indigo-100">
                    {item.step}
                  </div>
                  {item.title}
                </dt>
                <dd className="mt-2 text-sm leading-7 text-zinc-600">{item.desc}</dd>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section id="ventajas" className="bg-zinc-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Pensado para el rendimiento de tu equipo</h2>
              <p className="mt-6 text-lg leading-8 text-zinc-400">
                Nuestra plataforma elimina el ruido innecesario para que te centres en lo que realmente importa: resolver y avanzar.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-zinc-400 lg:max-w-none">
                {[
                  { title: "Plataforma fácil de usar", desc: "Interfaz intuitiva sin curvas de aprendizaje complejas." },
                  { title: "Gestión centralizada", desc: "Todo tu equipo y procesos en un único punto de acceso." },
                  { title: "Pensada para escalar", desc: "Crece con nosotros, desde un usuario hasta cientos." },
                  { title: "Planes flexibles", desc: "Opciones adaptadas al tamaño y presupuesto de tu equipo." },
                  { title: "Entorno profesional", desc: "Seguridad y orden para la información de tu empresa." },
                ].map((adv, i) => (
                  <div key={i} className="relative pl-9">
                    <dt className="inline font-semibold text-white">
                      <svg className="absolute left-1 top-1 h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      {adv.title}:
                    </dt>
                    <dd className="inline"> {adv.desc}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="relative">
               <div className="aspect-[4/3] rounded-3xl bg-indigo-500/10 ring-1 ring-white/10 flex items-center justify-center">
                  <div className="text-center p-8">
                    <svg className="mx-auto h-12 w-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="mt-4 text-xl font-bold text-white">Velocidad y Eficiencia</h3>
                    <p className="mt-2 text-zinc-400">Sin distracciones, solo resultados.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Planes diseñados para cada etapa</h2>
            <p className="mt-6 text-lg leading-8 text-zinc-600">
              Escoge el plan que mejor se adapte a tu equipo y escala cuando lo necesites.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
            {/* Free Plan */}
            <div className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-zinc-200 xl:p-10 hover:shadow-xl transition-shadow">
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 id="tier-free" className="text-lg font-semibold leading-8 text-zinc-900">Gratis</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-zinc-600">Perfecto para empezar y probar la plataforma.</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-zinc-900">0€</span>
                  <span className="text-sm font-semibold leading-6 text-zinc-600">/mes</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-zinc-600">
                  <li className="flex gap-x-3">
                    <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                    Hasta 2 usuarios
                  </li>
                  <li className="flex gap-x-3">
                    <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                    1 GB de almacenamiento
                  </li>
                  <li className="flex gap-x-3">
                    <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                    Funciones básicas
                  </li>
                </ul>
              </div>
              <button onClick={onLogin} className="mt-8 block rounded-full py-2.5 px-3 text-center text-sm font-semibold leading-6 text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300 active:scale-95 transition">
                Empezar ahora
              </button>
            </div>

            {/* Pro Plan */}
            <div className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-2 ring-indigo-600 xl:p-10 relative shadow-2xl shadow-indigo-100 transform lg:-translate-y-4">
              <div className="absolute top-0 right-8 -translate-y-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold text-white uppercase tracking-wider">Más popular</div>
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 id="tier-pro" className="text-lg font-semibold leading-8 text-indigo-600">Pro</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-zinc-600">Ideal para equipos pequeños en crecimiento.</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-zinc-900">10€</span>
                  <span className="text-sm font-semibold leading-6 text-zinc-600">/mes</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-zinc-600">
                  <li className="flex gap-x-3">
                    <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                    Hasta 5 usuarios
                  </li>
                  <li className="flex gap-x-3">
                    <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                    10 GB de almacenamiento
                  </li>
                  <li className="flex gap-x-3">
                    <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                    Soporte prioritario
                  </li>
                </ul>
              </div>
              <button onClick={onLogin} className="mt-8 block rounded-full py-2.5 px-3 text-center text-sm font-semibold leading-6 text-white bg-indigo-600 shadow-md hover:bg-indigo-500 active:scale-95 transition">
                Prueba Pro
              </button>
            </div>

            {/* Business Plan */}
            <div className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-zinc-200 xl:p-10 hover:shadow-xl transition-shadow">
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 id="tier-business" className="text-lg font-semibold leading-8 text-zinc-900">Business</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-zinc-600">Pensado para empresas y uso intensivo.</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-zinc-900">20€</span>
                  <span className="text-sm font-semibold leading-6 text-zinc-600">/mes</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-zinc-600">
                  <li className="flex gap-x-3">
                    <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                    Usuarios ilimitados
                  </li>
                  <li className="flex gap-x-3">
                    <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                    100 GB de almacenamiento
                  </li>
                  <li className="flex gap-x-3">
                    <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                    Todo incluido
                  </li>
                </ul>
              </div>
              <button onClick={onLogin} className="mt-8 block rounded-full py-2.5 px-3 text-center text-sm font-semibold leading-6 text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300 active:scale-95 transition">
                Solicitar acceso
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              ¿Listo para poner orden en tu equipo?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-100">
              Únete a las empresas que ya gestionan sus procesos de forma eficiente con GIUS.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={onLogin}
                className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition active:scale-95"
              >
                Probar ahora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="grid h-6 w-6 place-items-center rounded bg-zinc-900 text-white font-bold text-[10px]">G</div>
              <span className="text-sm font-bold tracking-tight">GIUS</span>
            </div>
            <p className="text-xs text-zinc-500">
              © {new Date().getFullYear()} GIUS. Todos los derechos reservados. Simple, rápido, sin ruido.
            </p>
            <div className="flex gap-6">
               <a href="#" className="text-xs text-zinc-500 hover:text-zinc-900">Privacidad</a>
               <a href="#" className="text-xs text-zinc-500 hover:text-zinc-900">Términos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
