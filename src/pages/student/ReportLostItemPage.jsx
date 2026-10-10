import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import {
  UploadCloud,
  FilePlus,
  AlertCircle,
  CheckCircle,
  X,
  Calendar,
  Layers,
  Palette,
  FileText
} from 'lucide-react';

export const ReportLostItemPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState('Electronics & Gadgets');
  const [colour, setColour] = useState('');
  const [description, setDescription] = useState('');
  const [dateLost, setDateLost] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
      setErrorMsg('You must be signed in as a student to submit a report.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Please provide distinguishing details or location clues.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let photoUrl = null;

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `lost_items/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('item-photos')
          .upload(filePath, photoFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.warn('Storage upload error, continuing without photo:', uploadError);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('item-photos')
            .getPublicUrl(filePath);

          photoUrl = publicUrlData?.publicUrl || null;
        }
      }

      const { data, error } = await supabase
        .from('lost_requests')
        .insert([
          {
            student_id: user.id,
            category,
            colour: colour.trim() || null,
            description: description.trim(),
            date_report: dateLost,
            photo_url: photoUrl,
            status: 'Pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setSuccessMsg(`Lost property docket #${data.request_id} successfully filed! Redirecting to tracker...`);
      setTimeout(() => {
        navigate('/student/requests');
      }, 1500);
    } catch (err) {
      console.error('Error reporting lost item:', err);
      setErrorMsg(err.message || 'Failed to file lost report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface rounded-xl border border-surface-container-high dark:border-darkcanvas-border shadow-sm p-4 sm:p-8">
        <div className="border-b border-surface-container dark:border-darkcanvas-border pb-5 mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary dark:text-slate-400">
            Official Case Filing
          </span>
          <h2 className="font-display font-bold text-xl text-primary dark:text-white mt-0.5">
            Report a Lost Belonging
          </h2>
          <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1">
            Provide details below. Vidyalankar custodial and administrative staff review submissions and cross-reference campus intake.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
            <CheckCircle size={16} className="shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-primary dark:text-slate-200 mb-1.5">
                Item Classification *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low dark:bg-darkcanvas-bg text-on-surface dark:text-white rounded-lg text-xs border border-surface-container-high dark:border-darkcanvas-border focus:outline-none focus:ring-1 focus:ring-primary-container transition"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-primary dark:text-slate-200 mb-1.5">
                Primary Colour / Shade
              </label>
              <input
                type="text"
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                placeholder="e.g. Navy Blue, Matte Black, Silver"
                className="w-full h-10 px-3 bg-surface-container-low dark:bg-darkcanvas-bg text-on-surface dark:text-white rounded-lg text-xs placeholder:text-outline border border-surface-container-high dark:border-darkcanvas-border focus:outline-none focus:ring-1 focus:ring-primary-container transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary dark:text-slate-200 mb-1.5">
              Approximate Date Misplaced *
            </label>
            <input
              type="date"
              required
              value={dateLost}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDateLost(e.target.value)}
              className="w-full h-10 px-3 bg-surface-container-low dark:bg-darkcanvas-bg text-on-surface dark:text-white rounded-lg text-xs border border-surface-container-high dark:border-darkcanvas-border focus:outline-none focus:ring-1 focus:ring-primary-container transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary dark:text-slate-200 mb-1.5">
              Detailed Description & Distinguishing Marks *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brand, model, unique stickers, contents, or location where you think you left it (e.g. SJT Lab 412, Library 2nd Floor, Canteen)..."
              className="w-full p-3 bg-surface-container-low dark:bg-darkcanvas-bg text-on-surface dark:text-white rounded-lg text-xs placeholder:text-outline border border-surface-container-high dark:border-darkcanvas-border focus:outline-none focus:ring-1 focus:ring-primary-container transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary dark:text-slate-200 mb-1.5">
              Photo Reference (Optional)
            </label>
            {photoPreview ? (
              <div className="relative w-full max-w-sm rounded-lg overflow-hidden border border-surface-container-high dark:border-darkcanvas-border">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-44 object-cover"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white hover:bg-black transition"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-surface-container-highest dark:border-darkcanvas-border hover:border-outline rounded-lg p-6 cursor-pointer bg-surface-container-low/50 dark:bg-darkcanvas-bg transition">
                <UploadCloud size={28} className="text-secondary dark:text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-primary dark:text-slate-200">
                  <span className="underline">Click to upload</span> photo
                </p>
                <p className="text-[11px] text-secondary dark:text-slate-400 mt-1">
                  PNG, JPG up to 5MB (stored securely in Supabase Storage)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="pt-4 border-t border-surface-container dark:border-darkcanvas-border flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 [&>button]:w-full sm:[&>button]:w-auto [&>button]:justify-center">
            <button
              type="button"
              onClick={() => navigate('/student/requests')}
              className="px-4 py-2.5 rounded-lg border border-surface-container-high dark:border-darkcanvas-border text-secondary dark:text-slate-300 hover:bg-surface-container dark:hover:bg-darkcanvas-border text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <FilePlus size={15} />
                  <span>Submit Lost Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
