import React from 'react';
import { MapPin, Clock, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-[#080605] text-zinc-400 text-xs py-12">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Coluna 1: Sobre */}
        <div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 mb-3 text-left group cursor-pointer"
            title="Voltar ao início"
          >
            <img
              src="/assets/logo.png"
              alt="Restaurante Contemporâneo"
              className="w-10 h-10 rounded-full border border-[#9b753a] object-cover group-hover:scale-105 transition-transform"
            />
            <span className="font-serif tracking-widest text-[#dfc28a] text-base font-bold group-hover:text-[#ffd98a] transition-colors">
              CONTEMPORÂNEO
            </span>
          </button>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
            Uma autêntica experiência gastronômica oriental no coração da serra de Ibiapina/CE. Sushis finos, petiscos e pratos especiais preparados artesanalmente.
          </p>
        </div>

        {/* Coluna 2: Informações e Horários */}
        <div id="horarios" className="space-y-2">
          <h4 className="font-serif text-sm font-semibold text-[#f5d38b] uppercase tracking-wider mb-3">
            Atendimento
          </h4>
          <p className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#d8a84e] flex-shrink-0" />
            <span>Quarta a Segunda: <strong>18:00 às 00:00</strong> <span className="text-[#f5d38b] font-semibold">(Terça: Folga)</span></span>
          </p>
          <p className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#d8a84e]" />
            <span>WhatsApp: <strong>(88) 99491-7022</strong></span>
          </p>
          <p id="localizacao" className="flex items-start gap-2 text-zinc-300">
            <MapPin className="w-4 h-4 text-[#d8a84e] flex-shrink-0 mt-0.5" />
            <a
              href="https://www.google.com/maps/search/?api=1&query=Av.+Pref.+Francisco+L.+de+Sousa+-+S%C3%A3o+Jo%C3%A3o,+Ibiapina+-+CE,+62360-000"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#d8a84e] transition-colors leading-relaxed"
            >
              Av. Pref. Francisco L. de Sousa - São João, Ibiapina - CE, 62360-000
            </a>
          </p>
        </div>

        {/* Coluna 3: Links Úteis */}
        <div className="space-y-3">
          <h4 className="font-serif text-sm font-semibold text-[#f5d38b] uppercase tracking-wider mb-3">
            Acesso Rápido
          </h4>
          <ul className="space-y-2">
            <li>
              <a href="#cardapio" className="hover:text-[#d8a84e] transition-colors">Cardápio Completo</a>
            </li>
            <li>
              <a href="#horarios" className="hover:text-[#d8a84e] transition-colors">Horários de Funcionamento</a>
            </li>
            <li>
              <a href="#localizacao" className="hover:text-[#d8a84e] transition-colors">Localização & Entrega</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
        <p>© {new Date().getFullYear()} Restaurante Contemporâneo. Todos os direitos reservados.</p>
        <p className="text-zinc-400">
          Desenvolvido por{' '}
          <strong className="text-zinc-200 font-semibold">Wagner Bomfim</strong>{' '}
          •{' '}
          <a
            href="https://wa.me/5588996484494"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#d8a84e] hover:underline"
          >
            +55 88 996484494
          </a>
        </p>
      </div>
    </footer>
  );
};
