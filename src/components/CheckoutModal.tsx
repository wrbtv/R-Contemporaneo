import React, { useState } from 'react';
import { CartItem } from '../types';
import { formatMoney, normalizeText, generateOrderId } from '../utils/formatters';
import { X, Send, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderSuccess: () => void;
  whatsappNumber?: string;
  deliveryFeeIbiapina?: number;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
  whatsappNumber = '558894917022',
  deliveryFeeIbiapina = 4.00,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    neighborhood: '',
    city: 'Ibiapina',
    state: 'CE',
    reference: '',
    notes: ''
  });

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Regra de entrega
  const normalizedCity = normalizeText(formData.city);
  const normalizedState = normalizeText(formData.state);
  const isLocal = normalizedCity === 'ibiapina' && normalizedState === 'ce';
  const deliveryFee = isLocal ? deliveryFeeIbiapina : null;
  const total = deliveryFee !== null ? subtotal + deliveryFee : null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) {
      v = `(${v.slice(0, 2)}) ${v.slice(2, v.length - 4)}-${v.slice(-4)}`;
    } else if (v.length > 2) {
      v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    }
    setFormData(prev => ({ ...prev, phone: v }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;

    const orderId = generateOrderId();
    const now = new Date();
    const dateLabel = now.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

    const lines = items.map((x, i) => [
      `*${String(i + 1).padStart(2, '0')}. ${x.product.name}*`,
      `Categoria: ${x.product.cat}`,
      `Descrição: ${x.product.desc}`,
      `Qtd.: ${x.quantity} × ${formatMoney(x.product.price)} = *${formatMoney(x.quantity * x.product.price)}*`
    ].join('\n')).join('\n\n');

    const totals = isLocal
      ? [
          `*Subtotal dos produtos:* ${formatMoney(subtotal)}`,
          `*Taxa de entrega:* ${formatMoney(deliveryFeeIbiapina)}`,
          `💰 *TOTAL DO PEDIDO: ${formatMoney(total!)}*`
        ]
      : [
          `*Subtotal dos produtos:* ${formatMoney(subtotal)}`,
          `*Taxa de entrega:* A CONSULTAR`,
          `💰 *TOTAL FINAL: A CONFIRMAR APÓS O FRETE*`,
          '',
          `⚠️ Calcular o frete para a localidade informada e confirmar o valor total com o cliente antes de concluir o pedido.`
        ];

    const message = [
      '🍣 *RESTAURANTE CONTEMPORÂNEO*',
      '━━━━━━━━━━━━━━━━━━━━',
      `🧾 *NOVO PEDIDO | ${orderId}*`,
      `🕒 Recebido em: ${dateLabel}`,
      '',
      '👤 *DADOS DO CLIENTE*',
      `*Nome:* ${formData.name}`,
      `*Telefone/WhatsApp:* ${formData.phone}`,
      '',
      '📍 *ENDEREÇO DE ENTREGA*',
      `*Endereço:* ${formData.address}`,
      `*Bairro:* ${formData.neighborhood}`,
      `*Cidade/UF:* ${formData.city}/${formData.state.toUpperCase()}`,
      `*Referência:* ${formData.reference || 'Não informada'}`,
      '',
      `🍱 *ITENS DO PEDIDO (${items.length} ${items.length === 1 ? 'item' : 'itens'})*`,
      '━━━━━━━━━━━━━━━━━━━━',
      lines,
      '',
      '━━━━━━━━━━━━━━━━━━━━',
      '🧾 *RESUMO DO PEDIDO*',
      ...totals,
      '',
      '📝 *OBSERVAÇÕES DO CLIENTE*',
      formData.notes || 'Nenhuma observação informada.',
      '',
      '━━━━━━━━━━━━━━━━━━━━',
      '👩‍🍳 *PRÓXIMAS AÇÕES*',
      isLocal
        ? 'Confirmar disponibilidade e prazo de entrega. Em seguida, enviar a chave Pix ou informar as formas de pagamento aceitas.'
        : 'Informar o valor do frete e o total final ao cliente. Depois, confirmar disponibilidade, prazo de entrega e enviar a chave Pix ou as formas de pagamento aceitas.',
      '',
      '_Pedido recebido pelo site oficial do Restaurante Contemporâneo._'
    ].join('\n');

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
    onOrderSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xl max-h-[92vh] bg-gradient-to-b from-[#21150e] to-[#0f0a07] border border-[#80602f] rounded-xl shadow-2xl flex flex-col overflow-hidden text-[#f8f0e4]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#f5d38b]">Finalizar Pedido</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Preencha seus dados para entrega via WhatsApp</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Seu Nome *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Maria Clara"
                className="w-full bg-[#100a07] border border-[#593720] focus:border-[#d8a84e] text-xs text-white p-3 rounded outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">WhatsApp / Telefone *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="(88) 99999-9999"
                className="w-full bg-[#100a07] border border-[#593720] focus:border-[#d8a84e] text-xs text-white p-3 rounded outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Cidade *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ibiapina"
                className="w-full bg-[#100a07] border border-[#593720] focus:border-[#d8a84e] text-xs text-white p-3 rounded outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Estado (UF) *</label>
              <input
                type="text"
                required
                maxLength={2}
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                placeholder="CE"
                className="w-full bg-[#100a07] border border-[#593720] focus:border-[#d8a84e] text-xs text-white p-3 rounded outline-none uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Rua e Número *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, Av., Nº da casa"
                className="w-full bg-[#100a07] border border-[#593720] focus:border-[#d8a84e] text-xs text-white p-3 rounded outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Bairro *</label>
              <input
                type="text"
                required
                value={formData.neighborhood}
                onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                placeholder="Centro, São Sebastião..."
                className="w-full bg-[#100a07] border border-[#593720] focus:border-[#d8a84e] text-xs text-white p-3 rounded outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Ponto de Referência</label>
            <input
              type="text"
              value={formData.reference}
              onChange={e => setFormData({ ...formData, reference: e.target.value })}
              placeholder="Ex: Próximo à praça / em frente ao mercado"
              className="w-full bg-[#100a07] border border-[#593720] focus:border-[#d8a84e] text-xs text-white p-3 rounded outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Observações do Pedido</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ex: Tirar cebola, mandar hashi extra, troco para 50..."
              className="w-full bg-[#100a07] border border-[#593720] focus:border-[#d8a84e] text-xs text-white p-3 rounded outline-none resize-none"
            />
          </div>

          {/* Resumo de frete dinâmico */}
          <div className="p-3.5 bg-[#160d09] border border-[#49301e] rounded-lg space-y-2 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal:</span>
              <span className="font-semibold text-white">{formatMoney(subtotal)}</span>
            </div>

            <div className="flex justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#d8a84e]" />
                Taxa de Entrega:
              </span>
              <span className="font-semibold text-[#f5d38b]">
                {isLocal ? formatMoney(deliveryFeeIbiapina) : 'A consultar'}
              </span>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between text-sm">
              <span className="font-bold text-white">Total Estimado:</span>
              <strong className="font-serif text-lg text-[#f5d38b]">
                {isLocal ? formatMoney(total!) : `${formatMoney(subtotal)} + frete`}
              </strong>
            </div>

            {/* Mensagem contextual de frete */}
            {isLocal ? (
              <p className="flex items-center gap-1.5 text-[11px] text-[#f5d38b] pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                Entrega em Ibiapina/CE: taxa fixa de R$ 4,00 inclusa.
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-[11px] text-amber-300 pt-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                Endereço fora de Ibiapina: o valor do frete será confirmado via WhatsApp.
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all shadow-lg shadow-green-900/30"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Pedido pelo WhatsApp</span>
          </button>
        </form>
      </div>
    </div>
  );
};
