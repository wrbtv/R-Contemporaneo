import React from 'react';
import { Clock, MapPin, Sparkles, ChevronDown } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[580px] flex items-center justify-center border-b border-white/10 overflow-hidden bg-[#0d0a08]">
      {/* Background Image com as cores vibrantes originais */}
      <div 
        className="absolute inset-0 bg-cover bg-[center_53%] bg-no-repeat"
        style={{ backgroundImage: `url('/assets/hero-premium.png')` }}
      />
      {/* Degradê original que preserva o contraste do texto sem desbotar a imagem */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(10,8,6,0.98) 0%, rgba(10,8,6,0.92) 35%, rgba(10,8,6,0.55) 54%, rgba(10,8,6,0.04) 75%, rgba(10,8,6,0.15) 100%), linear-gradient(0deg, rgba(8,6,5,0.7), transparent 45%, rgba(8,6,5,0.15))'
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:py-16 w-full flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Caixa de vidro fumê exclusiva para telas de celular, mantendo desktop intacto */}
        <div className="max-w-xl p-5 sm:p-7 md:p-0 rounded-2xl md:rounded-none bg-gradient-to-r from-black/85 via-black/65 to-black/35 md:bg-transparent backdrop-blur-[6px] md:backdrop-blur-none border border-[#d8a84e]/20 md:border-none shadow-2xl md:shadow-none">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#d8a84e] mb-4">
            <span className="w-6 h-px bg-[#b83b27]" />
            <Sparkles className="w-3.5 h-3.5 text-[#d8a84e]" />
            <span>Tradição & Sofisticação</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#f8f0e4] leading-[1.12] tracking-tight mb-5 drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
            Uma experiência oriental exclusiva em <em className="not-italic text-[#f5d38b]">Ibiapina</em>.
          </h1>

          <p className="text-sm sm:text-base text-zinc-100 md:text-zinc-300 leading-relaxed mb-8 max-w-lg drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
            Sushis selecionados com maestria, pratos executivos, yakisoba artesanal e hambúrgueres premium. Faça seu pedido online e receba com rapidez e padrão de excelência.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#cardapio"
              className="inline-flex items-center justify-between gap-3 px-6 py-3.5 bg-gradient-to-r from-[#f1d18b] to-[#c7953d] text-[#241208] text-xs font-bold uppercase tracking-wider rounded transition-transform hover:-translate-y-0.5 shadow-xl shadow-[#d8a84e]/20"
            >
              <span>Explorar Cardápio</span>
              <ChevronDown className="w-4 h-4" />
            </a>

            <a
              href="https://wa.me/558894917022?text=Olá!%20Gostaria%20de%20informações%20sobre%20o%20Restaurante%20Contemporâneo."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 border border-[#8b632c] text-[#f5d38b] text-xs uppercase tracking-wider rounded bg-[#17100c]/80 hover:bg-[#d8a84e]/10 transition-colors"
            >
              Falar no WhatsApp
            </a>
          </div>

          {/* Proof Badges */}
          <div className="flex flex-wrap items-center gap-6 mt-10 text-xs text-zinc-300 border-t border-white/10 pt-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#d8a84e]" />
              <span>Atendimento: <strong>18:00 às 00:00</strong></span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-zinc-700" />
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#d8a84e]" />
              <span>Ibiapina, Ceará</span>
            </div>
          </div>
        </div>

        {/* Feature badge card */}
        <div className="hidden lg:flex flex-col gap-3 p-6 rounded-xl bg-[#17100c]/90 border border-[#8b632c]/50 backdrop-blur-md max-w-xs shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[11px] uppercase tracking-widest text-[#d8a84e] font-bold">Delivery Ativo</span>
          </div>
          <strong className="font-serif text-lg text-[#f8f0e4]">Entrega Local em Ibiapina</strong>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Taxa fixa de apenas <strong>R$ 4,00</strong> na cidade de Ibiapina/CE. Consulte valores para localidades vizinhas.
          </p>
        </div>
      </div>
    </section>
  );
};
