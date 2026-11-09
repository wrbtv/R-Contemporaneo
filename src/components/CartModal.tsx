import React from 'react';
import { CartItem } from '../types';
import { formatMoney } from '../utils/formatters';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg max-h-[90vh] bg-gradient-to-b from-[#21150e] to-[#0f0a07] border border-[#80602f] rounded-xl shadow-2xl flex flex-col overflow-hidden text-[#f8f0e4]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#d8a84e]" />
            <h2 className="font-serif text-xl font-bold text-[#f5d38b]">Seu Pedido</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {items.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2 text-zinc-400">
              <ShoppingBag className="w-12 h-12 text-zinc-600 stroke-[1.5]" />
              <p className="font-serif text-base text-zinc-300">Seu carrinho está vazio.</p>
              <span className="text-xs text-zinc-500">Escolha seus pratos favoritos no cardápio.</span>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={`${item.product.name}-${index}`}
                className="flex items-center gap-3 p-3 bg-[#100a07] border border-[#49301e] rounded-lg"
              >
                <img
                  src={item.product.image_url || '/assets/pratos/combo-sushi-boat.jpg'}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded bg-[#1c100a] flex-shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/assets/pratos/combo-sushi-boat.jpg';
                  }}
                />
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-sm font-semibold text-[#f8f0e4] truncate">
                    {item.product.name}
                  </h4>
                  <span className="text-xs text-[#d8a84e] font-medium">
                    {formatMoney(item.product.price)} por un.
                  </span>
                </div>

                {/* Quantidade */}
                <div className="flex items-center gap-2 bg-[#21140e] border border-[#49301e] px-2 py-1 rounded">
                  <button
                    onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                    className="p-0.5 text-zinc-400 hover:text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                    className="p-0.5 text-zinc-400 hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtotal do Item */}
                <div className="text-right min-w-[70px]">
                  <span className="text-sm font-bold text-[#f5d38b]">
                    {formatMoney(item.product.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => onRemoveItem(index)}
                    title="Remover item"
                    className="block ml-auto text-[10px] text-red-400 hover:underline mt-0.5"
                  >
                    <Trash2 className="w-3 h-3 inline-block" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-white/10 bg-[#160d09]">
            <div className="flex items-center justify-between mb-4 text-sm">
              <span className="text-zinc-400">Subtotal dos produtos:</span>
              <strong className="font-serif text-lg text-[#f5d38b]">{formatMoney(total)}</strong>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="w-1/3 py-3 border border-[#8b632c] text-[#f5d38b] text-xs font-bold uppercase tracking-wider rounded hover:bg-white/5 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={onProceedToCheckout}
                className="flex-1 py-3 bg-gradient-to-r from-[#f1d18b] to-[#c7953d] text-[#241208] text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all shadow-lg"
              >
                <span>Avançar para Entrega</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
