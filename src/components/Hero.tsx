import React from 'react';
import { Clock, MapPin, Sparkles, ChevronDown } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[580px] sm:min-h-[620px] flex items-center justify-center border-b border-white/10 overflow-hidden bg-[#0d0a08]">
      {/* Background Image: no mobile ligeiramente deslocada à direita para liberar espaço ao texto e valorizar a foto */}
      <div 
        className="absolute inset-0 bg-cover bg-[60%_center] md:bg-[center_53%] bg-no-repeat transition-all duration-300"
        style={{ backgroundImage: `url('/assets/hero-premium.png')` }}
      />

      {/* Degradê Mobile (mais escuro na esquerda onde fica o texto, transparente na direita onde brilha o prato) */}
      <div 
        className="absolute inset-0 pointer-events-none md:hidden"
        style={{
          background: 'linear-gradient(90deg, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.78) 55%, rgba(10,8,6,0.30) 80%, rgba(10,8,6,0.10) 100%), linear-gradient(0deg, rgba(10,8,6,0.85) 0%, transparent 60%)'
        }}
      />

      {/* Degradê Desktop original intacto */}
      <div 
        className="absolute inset-0 pointer-events-none hidden md:block"
        style={{
          background: 'linear-gradient(90deg, rgba(10,8,6,0.98) 0%, rgba(10,8,6,0.92) 35%, rgba(10,8,6,0.55) 54%, rgba(10,8,6,0.04) 75%, rgba(10,8,6,0.15) 100%), linear-gradient(0deg, rgba(8,6,5,0.7), transparent 45%, rgba(8,6,5,0.15))'
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:py-16 w-full flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Bloco editorial limpo, sem nenhuma caixa ou moldura artificial */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#d8a84e] mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            <span className="w-6 h-px bg-[#b83b27]" />
            <Sparkles className="w-3.5 h-3.5 text-[#d8a84e]" />
            <span>Sabor Japonês · Feito em Ibiapina</span>
          </div>

          <h1 
            className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#f8f0e4] leading-[1.12] tracking-tight mb-5"
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.95), 0 4px 25px rgba(0,0,0,0.9), 0 0 35px rgba(0,0,0,0.8)'
            }}
          >
            Uma experiência japonesa com <em className="not-italic text-[#f5d38b]">alma cearense.</em>
          </h1>

          <p 
            className="text-sm sm:text-base text-zinc-200 leading-relaxed mb-8 max-w-lg"
            style={{
              textShadow: '0 1px 6px rgba(0,0,0,0.95), 0 2px 14px rgba(0,0,0,0.85)'
            }}
          >
            Do primeiro olhar ao último pedaço: pratos preparados com cuidado para transformar sua fome em um bom momento.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#cardapio"
              className="inline-flex items-center justify-between gap-3 px-6 py-3.5 bg-gradient-to-r from-[#f1d18b] to-[#c7953d] text-[#241208] text-xs font-bold uppercase tracking-wider rounded transition-transform hover:-translate-y-0.5 shadow-xl shadow-[#d8a84e]/20"
            >
              <span>Explorar o Cardápio</span>
              <ChevronDown className="w-4 h-4" />
            </a>

            <a
              href="https://wa.me/558894917022?text=Olá!%20Gostaria%20de%20informações%20sobre%20o%20Restaurante%20Contemporâneo."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 border border-[#8b632c] text-[#f5d38b] text-xs uppercase tracking-wider rounded bg-[#17100c]/80 hover:bg-[#d8a84e]/10 transition-colors shadow-lg shadow-black/40"
            >
              Falar com a gente ↗
            </a>
          </div>

          {/* Proof Badges com sombra suave para legibilidade total */}
          <div className="flex flex-wrap items-center gap-6 mt-10 text-xs text-zinc-300 border-t border-white/10 pt-6 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#d8a84e]" />
              <span>Quarta a Segunda: <strong>18:00 às 00:00</strong> <span className="text-[#f5d38b]/80 text-[11px] font-semibold">(Terça folga)</span></span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-zinc-700" />
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#d8a84e]" />
              <span>Feito para Ibiapina, CE</span>
            </div>
          </div>
        </div>

        {/* Feature badge card */}
        <div className="hidden lg:flex flex-col gap-3 p-6 rounded-xl bg-[#17100c]/90 border border-[#8b632c]/50 backdrop-blur-md max-w-xs shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[11px] uppercase tracking-widest text-[#d8a84e] font-bold">Delivery Ativo</span>
          </div>
          <strong className="font-serif text-lg text-[#f8f0e4]">Uma pausa que vale a pena</strong>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Seu próximo prato favorito está a um pedido de distância. Taxa fixa de apenas <strong>R$ 4,00</strong> em Ibiapina/CE.
          </p>
        </div>
      </div>
    </section>
  );
};
