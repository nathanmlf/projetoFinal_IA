import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { triggerN8nWebhook } from './lib/n8n';
import ChatWidget from './components/ChatWidget';
import {
  Package,
  PlusCircle,
  LayoutDashboard,
  Search,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Box
} from 'lucide-react';

// --- Utilitários ---

// Formata moeda para Real Brasileiro
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// --- Componentes de UI Reutilizáveis ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, type = 'default' }) => {
  const styles = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-800",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type] || styles.default}`}>
      {children}
    </span>
  );
};

// --- Componente: Página de Estoque (Listagem) ---

const StockPage = ({ products, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cálculo de totais para o dashboard rápido
  const totalItems = products.reduce((acc, curr) => acc + Number(curr.quantity), 0);
  const totalValue = products.reduce((acc, curr) => acc + (Number(curr.price) * Number(curr.quantity)), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header com Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 flex items-center space-x-4 border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total de Produtos</p>
            <h3 className="text-2xl font-bold text-gray-900">{products.length}</h3>
          </div>
        </Card>

        <Card className="p-6 flex items-center space-x-4 border-l-4 border-l-emerald-500">
          <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
            <Box size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Itens em Estoque</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalItems}</h3>
          </div>
        </Card>

        <Card className="p-6 flex items-center space-x-4 border-l-4 border-l-indigo-500">
          <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Valor em Estoque</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</h3>
          </div>
        </Card>
      </div>

      {/* Barra de Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome ou categoria..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid de Produtos */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group flex flex-col overflow-hidden">
              <div className="h-64 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                {/* Imagem do Produto ou Placeholder */}
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
                    <Package size={48} className="text-gray-300 relative z-10" />
                  </>
                )}

                <div className="absolute top-3 right-3 z-20">
                  <Badge type={product.quantity < 5 ? 'danger' : 'success'}>
                    {product.quantity < 5 ? 'Baixo Estoque' : 'Em Dia'}
                  </Badge>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{product.category}</span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1 line-clamp-1">{product.name}</h3>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
                  {product.description || "Sem descrição disponível."}
                </p>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <div>
                    <p className="text-xs text-gray-400">Preço Unitário</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-xs text-gray-400">Qtd.</p>
                    <p className="text-lg font-medium text-gray-900">{product.quantity}</p>
                  </div>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remover produto"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="inline-block p-4 bg-white rounded-full shadow-sm mb-4">
            <Package className="text-gray-400" size={48} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
          <p className="text-gray-500 mt-1">Tente ajustar sua busca ou adicione um novo item.</p>
        </div>
      )}
    </div>
  );
};

// --- Componente: Página de Cadastro (Formulário) ---

const RegisterPage = ({ onAddProduct, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    category: '',
    description: ''
  });
  const [imageFile, setImageFile] = useState(null);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Nome é obrigatório";
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = "Preço inválido";
    if (!formData.quantity || Number(formData.quantity) < 0) newErrors.quantity = "Quantidade inválida";
    if (!formData.category) newErrors.category = "Categoria é obrigatória";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onAddProduct({
      ...formData,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      imageFile // Passa o arquivo para o pai tratar o upload
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpa erro ao digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const inputClasses = (error) => `
    w-full px-4 py-2.5 rounded-lg border bg-gray-50 focus:bg-white transition-colors outline-none
    ${error
      ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
      : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}
  `;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="overflow-hidden">
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <PlusCircle className="text-blue-600" size={24} />
            Novo Produto
          </h2>
          <p className="text-gray-500 text-sm mt-1">Preencha os dados abaixo para adicionar ao inventário.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClasses(errors.name)}
              placeholder="Ex: Cadeira Ergonomica Office"
            />
            {errors.name && <span className="text-xs text-rose-500 mt-1">{errors.name}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preço */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={`${inputClasses(errors.price)} pl-10`}
                  placeholder="0,00"
                />
              </div>
              {errors.price && <span className="text-xs text-rose-500 mt-1">{errors.price}</span>}
            </div>

            {/* Quantidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade em Estoque</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className={inputClasses(errors.quantity)}
                placeholder="0"
              />
              {errors.quantity && <span className="text-xs text-rose-500 mt-1">{errors.quantity}</span>}
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={inputClasses(errors.category)}
            >
              <option value="">Selecione uma categoria</option>
              <option value="Eletrônicos">Eletrônicos</option>
              <option value="Móveis">Móveis</option>
              <option value="Vestuário">Vestuário</option>
              <option value="Alimentos">Alimentos</option>
              <option value="Outros">Outros</option>
            </select>
            {errors.category && <span className="text-xs text-rose-500 mt-1">{errors.category}</span>}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (Opcional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className={inputClasses(false)}
              placeholder="Detalhes técnicos ou observações..."
            />
          </div>

          {/* Upload de Imagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do Produto</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {imageFile ? (
                    <p className="text-sm text-gray-500 font-medium">{imageFile.name}</p>
                  ) : (
                    <>
                      <Package className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
                      <p className="text-xs text-gray-500">SVG, PNG, JPG (MAX. 2MB)</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={18} />
              Salvar Produto
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// --- Componente Principal ---

const App = () => {
  const [view, setView] = useState('stock'); // 'stock' ou 'register'
  const [notification, setNotification] = useState(null);
  const [supabaseStatus, setSupabaseStatus] = useState('checking'); // 'checking', 'connected', 'error'

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (!supabase) {
          setSupabaseStatus('missing_config');
          return;
        }
        const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
        if (error && (error.code === 'PGRST301' || error.message.includes('FetchError'))) {
          setSupabaseStatus('error');
        } else {
          setSupabaseStatus('connected');
        }
      } catch (e) {
        setSupabaseStatus('error');
      }
    };

    checkConnection();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      showNotification('Erro ao carregar produtos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Dados iniciais Mockados (para não começar vazio)
  // Estado dos produtos e loading
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleAddProduct = async (newProduct) => {
    if (!supabase) {
      showNotification('Erro: Supabase não configurado.', 'error');
      return;
    }
    try {
      let imageUrl = null;

      // 1. Upload da Imagem (se existir)
      if (newProduct.imageFile) {
        const file = newProduct.imageFile;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // 2. Salvar no Banco
      const { data, error } = await supabase.from('products').insert([
        {
          name: newProduct.name,
          category: newProduct.category,
          price: newProduct.price,
          quantity: newProduct.quantity,
          description: newProduct.description,
          image_url: imageUrl
        }
      ]).select();

      if (error) throw error;

      setProducts(prev => [data[0], ...prev]);
      setView('stock');
      showNotification('Produto cadastrado com sucesso!', 'success');

      // Trigger n8n
      triggerN8nWebhook('PRODUCT_CREATED', data[0]);
    } catch (error) {
      console.error('Erro ao adicionar:', error);
      showNotification('Erro ao salvar produto. Verifique se o Bucket existe.', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!supabase) return;
    if (window.confirm('Tem certeza que deseja remover este item?')) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;

        setProducts(prev => prev.filter(p => p.id !== id));
        showNotification('Produto removido do estoque.', 'default');

        // Trigger n8n
        triggerN8nWebhook('PRODUCT_DELETED', { id });
      } catch (error) {
        console.error('Erro ao deletar:', error);
        showNotification('Erro ao remover produto.', 'error');
      }
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex">

      {/* Sidebar de Navegação Lateral */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 text-blue-600">
            <Package size={28} strokeWidth={2.5} />
            <h1 className="text-xl font-bold tracking-tight text-gray-900">StockSys</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setView('stock')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${view === 'stock'
              ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <LayoutDashboard size={20} />
            Estoque
          </button>

          <button
            onClick={() => setView('register')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${view === 'register'
              ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <PlusCircle size={20} />
            Cadastrar Produto
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-2">Status do Sistema</p>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <span className={`w-2 h-2 rounded-full ${supabaseStatus === 'connected' ? 'bg-emerald-500' : supabaseStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
              {supabaseStatus === 'connected' ? 'Supabase Conectado' : supabaseStatus === 'checking' ? 'Verificando...' : 'Erro Conexão'}
            </div>
            {supabaseStatus === 'missing_config' && (
              <p className="text-[10px] text-red-500 mt-1">Configure o .env</p>
            )}
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto min-h-screen">

        {/* Navegação Mobile */}
        <div className="md:hidden mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-blue-600">
            <Package size={24} />
            <span className="font-bold text-gray-900">StockSys</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView('stock')} className={`p-2 rounded-lg cursor-pointer ${view === 'stock' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>
              <LayoutDashboard size={20} />
            </button>
            <button onClick={() => setView('register')} className={`p-2 rounded-lg cursor-pointer ${view === 'register' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>
              <PlusCircle size={20} />
            </button>
          </div>
        </div>

        {/* Header da Página */}
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {view === 'stock' ? 'Visão Geral do Estoque' : 'Cadastro de Produtos'}
            </h2>
            <p className="text-gray-500 mt-1">
              {view === 'stock'
                ? 'Gerencie seus produtos, visualize quantidades e valores.'
                : 'Adicione novos itens ao seu banco de dados.'}
            </p>
          </div>
          {view === 'stock' && (
            <button
              onClick={() => setView('register')}
              className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors items-center gap-2 shadow-md shadow-blue-200 cursor-pointer"
            >
              <PlusCircle size={18} />
              Novo Produto
            </button>
          )}
        </header>

        {/* Renderização Condicional das Páginas */}
        {view === 'stock' ? (
          loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <StockPage products={products} onDelete={handleDeleteProduct} />
          )
        ) : (
          <RegisterPage
            onAddProduct={handleAddProduct}
            onCancel={() => setView('stock')}
          />
        )}

      </main>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 animate-slide-up">
          <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 text-white font-medium ${notification.type === 'success' ? 'bg-gray-900' : 'bg-gray-800'
            }`}>
            {notification.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-400" /> : <AlertCircle size={20} />}
            {notification.message}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>

      {/* Chatbot Widget */}
      <ChatWidget />
    </div>
  );
};

export default App;