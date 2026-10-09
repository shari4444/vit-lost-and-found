import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Search,
  Tag,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';

export const FoundItemsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const categories = [
    'ALL',
    'Electronics & Gadgets',
    'VIT ID Card & Documents',
    'Books & Notebooks',
    'Bags & Backpacks',
    'Keys & Keychains',
    'Watches & Wearables',
    'Clothing & Accessories',
    'Water Bottles & Flasks',
    'Stationery & Calculators',
    'Other Item',
  ];

  useEffect(() => {
    fetchFoundItems();
  }, []);

  const fetchFoundItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('found_items')
        .select('*')
        .order('date_found', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching found items:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesSearch =
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.colour?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-container dark:border-darkcanvas-border">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary dark:text-slate-400">
            Custodial Inventory Catalog
          </span>
          <h1 className="font-display font-bold text-2xl text-primary dark:text-white tracking-tight mt-0.5">
            Campus Found Property Ledger
          </h1>
          <p className="text-xs text-secondary dark:text-slate-400">
            Articles secured by campus security, lab proctors, and facilities desks across Vidyalankar blocks.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface p-4 rounded-xl border border-surface-container-high dark:border-darkcanvas-border shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-3 text-secondary dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search by keywords, location (e.g. SJT 412, Library), colour..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low dark:bg-darkcanvas-bg border border-surface-container-high dark:border-darkcanvas-border rounded-lg text-xs text-on-surface dark:text-white placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-container"
          />
        </div>

        <div className="flex items-center gap-2">
          <Tag size={15} className="text-secondary shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-surface-container-low dark:bg-darkcanvas-bg border border-surface-container-high dark:border-darkcanvas-border rounded-lg px-3 py-2 text-xs text-on-surface dark:text-white font-medium focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="p-12 text-center text-secondary text-xs">
          <div className="w-6 h-6 border-2 border-primary dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading custodial inventory records...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface p-12 rounded-xl border border-surface-container-high dark:border-darkcanvas-border text-center">
          <div className="w-12 h-12 rounded-full bg-surface-container-low dark:bg-darkcanvas-border text-secondary flex items-center justify-center mx-auto mb-3">
            <Search size={22} />
          </div>
          <h3 className="text-sm font-bold text-primary dark:text-white">No items found</h3>
          <p className="text-xs text-secondary dark:text-slate-400 max-w-sm mx-auto mt-1">
            No items matched your current search parameters. Try clearing filters or submit a Lost Report.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.found_id}
              className="bg-surface-container-lowest dark:bg-darkcanvas-surface rounded-xl border border-surface-container-high dark:border-darkcanvas-border shadow-sm overflow-hidden flex flex-col hover:border-outline transition duration-150"
            >
              <div className="h-44 bg-surface-container dark:bg-darkcanvas-bg relative overflow-hidden">
                {item.photo_url ? (
                  <img
                    src={item.photo_url}
                    alt={item.category}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-secondary dark:text-slate-400">
                    <ShieldCheck size={32} className="mb-1 opacity-40" />
                    <span className="text-[11px] font-medium">Secured in Campus Custody</span>
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                      item.status === 'Unclaimed'
                        ? 'bg-amber-600 text-white'
                        : item.status === 'Matched'
                        ? 'bg-purple-700 text-white'
                        : 'bg-emerald-700 text-white'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-secondary dark:text-slate-400 mb-1">
                    <span className="font-mono font-bold text-primary dark:text-white">
                      INTAKE #{item.found_id}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar size={12} />
                      {item.date_found}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-sm text-primary dark:text-white">
                    {item.category}
                  </h3>

                  {item.colour && (
                    <p className="text-[11px] text-secondary dark:text-slate-400 mt-0.5 font-medium">
                      Colour: <span className="text-on-surface dark:text-slate-200">{item.colour}</span>
                    </p>
                  )}

                  <p className="text-xs text-on-surface-variant dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                    {item.description || 'No additional details noted.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-surface-container dark:border-darkcanvas-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-secondary dark:text-slate-400 truncate max-w-[170px]">
                    <MapPin size={13} className="shrink-0" />
                    <span className="truncate">{item.location || 'Central Admin Office'}</span>
                  </div>

                  <span className="text-[11px] font-bold text-primary dark:text-white">
                    Claim at Desk
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
