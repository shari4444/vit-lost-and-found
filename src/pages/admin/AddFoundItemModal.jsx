import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import {
  UploadCloud,
  X,
  CheckCircle,
  AlertCircle,
  Building,
  Tag,
  Calendar
} from 'lucide-react';

export const AddFoundItemModal = ({ isOpen, onClose, onItemAdded }) => {
  const { user } = useAuth();

  const [category, setCategory] = useState('Electronics & Gadgets');
  const [colour, setColour] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Central Admin Office');
  const [dateFound, setDateFound] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const categories = [
    'Electronics & Gadgets',
    'VIT ID Card & Documents',
    'Books & Notebooks',
    'Bags & Backpacks',
    'Keys & Keychains',
    'Watches & Wearables',
    'Clothing & Accessories',
    'Water Bottles & Flasks',
    'Stationery & Calculators',
    'Sports Equipment',
    'Other Item',
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size should be under 5MB.');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setErrorMsg('');
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('Admin authorization missing.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let photoUrl = null;

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `found_${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `found_items/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('item-photos')
          .upload(filePath, photoFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.warn('Storage upload warning:', uploadError);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('item-photos')
            .getPublicUrl(filePath);

          photoUrl = publicUrlData?.publicUrl || null;
        }
      }

      const { data, error } = await supabase
        .from('found_items')
        .insert([
          {
            category,
            colour: colour.trim() || null,
            description: description.trim(),
            location: location.trim(),
            date_found: dateFound,
            photo_url: photoUrl,
            admin_id: user.id,
            status: 'Unclaimed',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setSuccessMsg(`Found item #${data.found_id} logged into custody!`);
      if (onItemAdded) onItemAdded(data);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error adding found item:', err);
      setErrorMsg(err.message || 'Failed to register found item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface border border-surface-container-high dark:border-darkcanvas-border rounded-xl max-w-xl w-full p-6 shadow-2xl text-on-surface dark:text-white space-y-4 animate-in fade-in">
        <div className="flex items-center justify-between border-b border-surface-container dark:border-darkcanvas-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center font-bold text-xs">
              +
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-primary dark:text-white">
                Log Found Item into Custody
              </h3>
              <p className="text-[11px] text-secondary dark:text-slate-400">
                PostgreSQL Relational Table: <code>found_items</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-secondary hover:text-primary dark:hover:text-white hover:bg-surface-container dark:hover:bg-darkcanvas-border"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <CheckCircle size={15} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-primary dark:text-slate-200 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 px-3 bg-surface-container-low dark:bg-darkcanvas-bg border border-surface-container-high dark:border-darkcanvas-border rounded-lg text-xs text-on-surface dark:text-white focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-primary dark:text-slate-200 uppercase tracking-wider mb-1">
                Colour
              </label>
              <input
                type="text"
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                placeholder="e.g. Silver, Black"
                className="w-full h-9 px-3 bg-surface-container-low dark:bg-darkcanvas-bg border border-surface-container-high dark:border-darkcanvas-border rounded-lg text-xs text-on-surface dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-primary dark:text-slate-200 uppercase tracking-wider mb-1">
                Storage Locker / Location *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. SEC-CAB-B4 / C-Block Office"
                className="w-full h-9 px-3 bg-surface-container-low dark:bg-darkcanvas-bg border border-surface-container-high dark:border-darkcanvas-border rounded-lg text-xs text-on-surface dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-primary dark:text-slate-200 uppercase tracking-wider mb-1">
                Intake Date *
              </label>
              <input
                type="date"
                required
                value={dateFound}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDateFound(e.target.value)}
                className="w-full h-9 px-3 bg-surface-container-low dark:bg-darkcanvas-bg border border-surface-container-high dark:border-darkcanvas-border rounded-lg text-xs text-on-surface dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-primary dark:text-slate-200 uppercase tracking-wider mb-1">
              Distinguishing Features / Notes *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Model number, scratches, engraved labels, or finder handover details..."
              className="w-full p-2.5 bg-surface-container-low dark:bg-darkcanvas-bg border border-surface-container-high dark:border-darkcanvas-border rounded-lg text-xs text-on-surface dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-primary dark:text-slate-200 uppercase tracking-wider mb-1">
              Custody Photo (Optional)
            </label>
            {photoPreview ? (
              <div className="relative w-full max-w-xs rounded-lg overflow-hidden border border-surface-container-high dark:border-darkcanvas-border">
                <img
                  src={photoPreview}
                  alt="Item"
                  className="w-full h-32 object-cover"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-black"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-3 p-3 border border-dashed border-surface-container-highest dark:border-darkcanvas-border hover:border-outline rounded-lg cursor-pointer bg-surface-container-low/50 dark:bg-darkcanvas-bg transition">
                <UploadCloud size={18} className="text-secondary dark:text-slate-400" />
                <span className="text-xs text-secondary dark:text-slate-300">
                  Click to select photo for custodial verification
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="pt-3 border-t border-surface-container dark:border-darkcanvas-border flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container dark:bg-darkcanvas-border hover:bg-surface-container-high text-xs font-semibold text-secondary dark:text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Logging...' : 'Log Found Item into Custody'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
