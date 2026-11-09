import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { INITIAL_PRODUCTS } from '../../data/initialProducts';
import { formatMoney } from '../../utils/formatters';
import {
  Plus, Search, Edit2, Trash2, Power, LogOut,
  ExternalLink, Upload, AlertCircle, CheckCircle, Package
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Todas');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cat: 'Sushi',
    price: '',
    desc: '',
    image_url: '',
    is_available: true
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Carrega produtos ao montar o componente (autenticação já garantida pelo ProtectedRoute)
  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    if (!supabase) {
      setProducts(INITIAL_PRODUCTS);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setProducts(data.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          cat: item.category_name,
          desc: item.description || '',
          image_url: item.image_url,
          is_available: item.is_available,
          sort_order: item.sort_order
        })));
      } else {
        // Se ainda não houver produtos na tabela, exibe os iniciais
        setProducts(INITIAL_PRODUCTS);
      }
    } catch (err: any) {
      showFeedback('error', 'Erro ao carregar pratos: ' + (err.message || ''));
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    navigate('/admin/login');
  };

  // Toggle rápido de disponibilidade (Pausar / Ativar prato)
  const handleToggleAvailability = async (product: Product) => {
    const newStatus = !(product.is_available !== false);

    // Atualiza estado local de imediato
    setProducts(prev =>
      prev.map(p => (p.name === product.name ? { ...p, is_available: newStatus } : p))
    );

    if (supabase && product.id) {
      try {
        const { error } = await supabase
          .from('products')
          .update({ is_available: newStatus })
          .eq('id', product.id);

        if (error) throw error;
        showFeedback('success', `${product.name} agora está ${newStatus ? 'disponível' : 'pausado'}.`);
      } catch (err: any) {
        showFeedback('error', 'Falha ao sincronizar: ' + err.message);
        loadProducts();
      }
    } else {
      showFeedback('success', `${product.name} marcado como ${newStatus ? 'disponível' : 'pausado'} (local).`);
    }
  };

  // Upload de Imagem para o Supabase Storage (bucket 'dishes')
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!supabase) {
      showFeedback('error', 'Configure o Supabase para fazer upload de imagens.');
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `dishes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('dishes')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('dishes')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      showFeedback('success', 'Imagem enviada com sucesso!');
    } catch (err: any) {
      showFeedback('error', 'Erro no upload: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Salvar (Criar ou Atualizar)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formData.price.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) {
      showFeedback('error', 'Informe um preço válido.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category_name: formData.cat,
      price: priceNum,
      description: formData.desc.trim(),
      image_url: formData.image_url.trim() || '/assets/pratos/combo-sushi-boat.jpg',
      is_available: formData.is_available
    };

    if (supabase) {
      try {
        if (editingProduct?.id) {
          const { error } = await supabase
            .from('products')
            .update(payload)
            .eq('id', editingProduct.id);
          if (error) throw error;
          showFeedback('success', 'Prato atualizado com sucesso!');
        } else {
          const { error } = await supabase
            .from('products')
            .insert([payload]);
          if (error) throw error;
          showFeedback('success', 'Prato adicionado com sucesso!');
        }
        await loadProducts();
      } catch (err: any) {
        showFeedback('error', 'Erro ao salvar no banco: ' + err.message);
      }
    } else {
      // Local
      if (editingProduct) {
        setProducts(prev => prev.map(p => p.name === editingProduct.name ? { ...p, ...payload, cat: payload.category_name, desc: payload.description } : p));
      } else {
        setProducts(prev => [{ ...payload, cat: payload.category_name, desc: payload.description }, ...prev]);
      }
      showFeedback('success', 'Salvo localmente.');
    }

    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Excluir Prato
  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${product.name}" do cardápio?`)) return;

    if (supabase && product.id) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', product.id);
        if (error) throw error;
        showFeedback('success', `Prato ${product.name} excluído.`);
        await loadProducts();
      } catch (err: any) {
        showFeedback('error', 'Erro ao excluir: ' + err.message);
      }
    } else {
      setProducts(prev => prev.filter(p => p.name !== product.name));
      showFeedback('success', `Prato ${product.name} excluído.`);
    }
  };

  const openNewModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      cat: 'Sushi',
      price: '',
      desc: '',
      image_url: '',
      is_available: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      cat: product.cat,
      price: String(product.price),
      desc: product.desc,
      image_url: product.image_url || '',
      is_available: product.is_available !== false
    });
    setIsModalOpen(true);
  };

  // Filtros
  const categories = ['Todas', ...Array.from(new Set(products.map(p => p.cat)))];
  const filtered = products.filter(p => {
    const matchCat = selectedCat === 'Todas' || p.cat === selectedCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const availableCount = products.filter(p => p.is_available !== false).length;
  const pausedCount = products.length - availableCount;

  return (
    <div className="min-h-screen bg-[#0c0a08] text-[#f8f0e4] flex flex-col">
      {/* Topo do Admin */}
      <header className="sticky top-0 z-40 bg-[#17100c] border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="Logo" className="w-9 h-9 rounded-full border border-[#d8a84e]" />
          <div>
            <span className="font-serif text-sm font-bold text-[#f5d38b]">Gestão do Cardápio</span>
            <span className="block text-[10px] text-zinc-400">Restaurante Contemporâneo Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-[#d8a84e] transition-colors"
          >
            <span>Ver Cardápio Público</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 border border-red-800/50 hover:bg-red-900/40 text-red-300 text-xs rounded transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Notificação / Feedback */}
      {feedback && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-slideDown ${
            feedback.type === 'success'
              ? 'bg-[#1b2b1a] text-green-300 border border-green-600/50'
              : 'bg-[#3b1512] text-red-300 border border-red-600/50'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="max-w-6xl w-full mx-auto p-6 flex-1">
        {/* Painel de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-xl bg-[#17100c] border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-400 uppercase tracking-wider">Total de Pratos</span>
              <h3 className="font-serif text-2xl font-bold text-white mt-1">{products.length}</h3>
            </div>
            <Package className="w-8 h-8 text-[#d8a84e]/60" />
          </div>

          <div className="p-5 rounded-xl bg-[#17100c] border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-400 uppercase tracking-wider">Disponíveis Hoje</span>
              <h3 className="font-serif text-2xl font-bold text-green-400 mt-1">{availableCount}</h3>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500/60" />
          </div>

          <div className="p-5 rounded-xl bg-[#17100c] border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-400 uppercase tracking-wider">Pausados / Esgotados</span>
              <h3 className="font-serif text-2xl font-bold text-red-400 mt-1">{pausedCount}</h3>
            </div>
            <Power className="w-8 h-8 text-red-500/60" />
          </div>
        </div>

        {/* Barra de Ações: Busca + Filtro + Botão Novo */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome ou ingrediente..."
                className="w-full bg-[#100a07] border border-[#593720] focus:border-[#d8a84e] text-xs text-white pl-10 pr-4 py-2.5 rounded-lg outline-none"
              />
            </div>

            <select
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value)}
              className="bg-[#100a07] border border-[#593720] text-xs text-zinc-300 py-2.5 px-3 rounded-lg outline-none"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            onClick={openNewModal}
            className="px-4 py-2.5 bg-gradient-to-r from-[#f1d18b] to-[#c7953d] text-[#1a100a] text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 shadow-lg shadow-[#d8a84e]/10"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Novo Prato</span>
          </button>
        </div>

        {/* Tabela de Pratos */}
        <div className="bg-[#17100c] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="py-20 text-center text-zinc-400 text-xs">Carregando catálogo...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 text-xs">Nenhum prato encontrado com os filtros atuais.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#120b08] text-zinc-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Prato</th>
                    <th className="py-3.5 px-4">Categoria</th>
                    <th className="py-3.5 px-4">Preço</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map(product => {
                    const isAvail = product.is_available !== false;
                    return (
                      <tr key={product.name} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={product.image_url || '/assets/pratos/combo-sushi-boat.jpg'}
                            alt={product.name}
                            className="w-11 h-11 rounded-lg object-cover bg-[#100a07] border border-white/10 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/pratos/combo-sushi-boat.jpg';
                            }}
                          />
                          <div className="min-w-0">
                            <strong className="font-serif text-sm font-semibold text-white block truncate">
                              {product.name}
                            </strong>
                            <p className="text-[11px] text-zinc-400 truncate max-w-xs">{product.desc}</p>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-zinc-300">
                          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px]">
                            {product.cat}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-bold text-[#f5d38b]">
                          {formatMoney(product.price)}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleAvailability(product)}
                            title={isAvail ? 'Clique para pausar este item' : 'Clique para ativar este item'}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                              isAvail
                                ? 'bg-green-950/60 text-green-300 border border-green-700/60 hover:bg-green-900/60'
                                : 'bg-red-950/60 text-red-300 border border-red-700/60 hover:bg-red-900/60'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isAvail ? 'bg-green-400' : 'bg-red-400'}`} />
                            <span>{isAvail ? 'Ativo' : 'Pausado'}</span>
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(product)}
                              title="Editar prato"
                              className="p-1.5 rounded hover:bg-white/10 text-zinc-300 hover:text-[#d8a84e] transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product)}
                              title="Excluir prato"
                              className="p-1.5 rounded hover:bg-red-950/50 text-zinc-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Criação / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#17100c] border border-[#80602f] rounded-xl shadow-2xl p-6 text-[#f8f0e4]">
            <h3 className="font-serif text-lg font-bold text-[#f5d38b] mb-4">
              {editingProduct ? 'Editar Prato' : 'Novo Prato'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Nome do Prato *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Combo Especial 20 Peças"
                  className="w-full bg-[#100a07] border border-[#593720] focus:border-[#d8a84e] text-xs p-2.5 rounded outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Categoria *</label>
                  <input
                    type="text"
                    required
                    value={formData.cat}
                    onChange={e => setFormData({ ...formData, cat: e.target.value })}
                    placeholder="Sushi, Temaki, Combos..."
                    className="w-full bg-[#100a07] border border-[#593720] focus:border-[#d8a84e] text-xs p-2.5 rounded outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Preço (R$) *</label>
                  <input
                    type="text"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Ex: 24,50"
                    className="w-full bg-[#100a07] border border-[#593720] focus:border-[#d8a84e] text-xs p-2.5 rounded outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1">Descrição / Ingredientes</label>
                <textarea
                  rows={2}
                  value={formData.desc}
                  onChange={e => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="Descreva os ingredientes do prato..."
                  className="w-full bg-[#100a07] border border-[#593720] focus:border-[#d8a84e] text-xs p-2.5 rounded outline-none resize-none"
                />
              </div>

              {/* Upload de Imagem */}
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Foto do Prato</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="URL da foto ou envie um arquivo"
                    className="flex-1 bg-[#100a07] border border-[#593720] focus:border-[#d8a84e] text-xs p-2.5 rounded outline-none"
                  />

                  <label className="cursor-pointer px-3 py-2.5 bg-[#21140e] border border-[#80602f] hover:border-[#d8a84e] text-xs rounded flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#d8a84e]" />
                    <span>{uploadingImage ? 'Enviando...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={formData.is_available}
                  onChange={e => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-4 h-4 accent-[#d8a84e]"
                />
                <label htmlFor="availCheck" className="text-xs text-zinc-300 cursor-pointer">
                  Prato disponível para pedidos hoje
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-700 text-xs rounded hover:bg-white/5"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#f1d18b] to-[#c7953d] text-[#1a100a] text-xs font-bold uppercase tracking-wider rounded hover:brightness-110"
                >
                  Salvar Prato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
