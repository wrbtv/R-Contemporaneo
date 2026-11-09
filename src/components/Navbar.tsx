import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

interface NavbarProps {
  onOpenCart: () => void;
  cartCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, cartCount }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0c0a08]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
        {/* Brand - Clicar no logo volta ao topo */}
        <Link 
          to="/" 
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 group cursor-pointer"
          title="Voltar ao início"
        >
          <img
            src="/assets/logo.png"
            alt="Restaurante Contemporâneo"
            className="w-12 h-12 rounded-full border border-[#9b753a] p-0.5 object-cover bg-black group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="text-[10px] tracking-[0.2em] uppercase text-zinc-400">Restaurante</span>
            <b className="font-serif tracking-widest text-[#dfc28a] text-sm group-hover:text-[#ffd98a] transition-colors">
              CONTEMPORÂNEO
            </b>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-xs tracking-wider text-zinc-300">
          <a href="#cardapio" className="hover:text-[#d8a84e] transition-colors">CARDÁPIO</a>
          <a href="#horarios" className="hover:text-[#d8a84e] transition-colors">HORÁRIO</a>
          <a href="#localizacao" className="hover:text-[#d8a84e] transition-colors">LOCALIZAÇÃO</a>
          <a
            href="https://wa.me/558894917022"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#22c55e] transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>(88) 99491-7022</span>
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCart}
            className="relative px-4 py-2.5 bg-gradient-to-r from-[#f1d18b] to-[#c7953d] text-[#241208] text-[11px] font-bold uppercase tracking-wider rounded transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-[#d8a84e]/10"
          >
            Carrinho
            {cartCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black bg-[#b83b27] text-white rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
