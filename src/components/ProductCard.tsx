import React from 'react';
import { Product } from '../types';
import { formatMoney } from '../utils/formatters';
import { Plus, EyeOff } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const isAvailable = product.is_available !== false;

  return (
    <article
      className={`group relative flex flex-col justify-between bg-gradient-to-b from-[#1a110c] to-[#100b08] border rounded-xl overflow-hidden transition-all duration-300 ${
        isAvailable 
          ? 'border-[#49301e] hover:border-[#d8a84e]/70 hover:-translate-y-1 shadow-lg hover:shadow-[#d8a84e]/10' 
          : 'border-white/5 opacity-60'
      }`}
    >
      {/* Imagem do prato */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#160e0a]">
        <img
          src={product.image_url || '/assets/pratos/combo-sushi-boat.jpg'}
          alt={`${product.name}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('combo-sushi-boat.jpg')) {
              target.src = '/assets/pratos/combo-sushi-boat.jpg';
            }
          }}
        />

        {/* Badge "Imagem Ilustrativa" */}
        <span className="absolute bottom-2 left-2 z-10 px-2 py-0.5 text-[9px] tracking-wider uppercase bg-black/85 text-[#f5d38b] border border-[#d8a84e]/40 rounded pointer-events-none">
          Imagem Ilustrativa
        </span>

        {/* Overlay quando pausado / esgotado */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1.5 text-zinc-300">
            <EyeOff className="w-6 h-6 text-red-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">Esgotado Hoje</span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-serif text-lg text-[#f8f0e4] leading-snug font-semibold group-hover:text-[#f5d38b] transition-colors">
              {product.name}
            </h3>
            <span className="text-sm font-bold text-[#f5d38b] whitespace-nowrap">
              {formatMoney(product.price)}
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
            {product.desc}
          </p>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          disabled={!isAvailable}
          className={`w-full py-2.5 px-3 rounded flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            isAvailable
              ? 'bg-[#26180f] text-[#f5d38b] border border-[#8b632c] hover:bg-[#d8a84e] hover:text-[#100b08] hover:border-[#d8a84e] active:scale-98'
              : 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed'
          }`}
        >
          {isAvailable ? (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar ao Pedido</span>
            </>
          ) : (
            <span>Indisponível</span>
          )}
        </button>
      </div>
    </article>
  );
};
