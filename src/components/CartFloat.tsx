import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface CartFloatProps {
  count: number;
  onClick: () => void;
}

export const CartFloat: React.FC<CartFloatProps> = ({ count, onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label={`Abrir carrinho com ${count} itens`}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-[#c7953d] to-[#f5d38b] text-[#1a100a] flex items-center justify-center shadow-2xl shadow-black/80 hover:scale-105 active:scale-95 transition-all border border-[#ffd98a]"
    >
      <ShoppingBag className="w-6 h-6" />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 bg-[#b83b27] text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-[#0c0a08] shadow-md">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};
