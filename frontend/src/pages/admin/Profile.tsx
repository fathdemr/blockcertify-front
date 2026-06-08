import { useState, type FormEvent } from 'react';
import { User, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { userApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [infoLoading, setInfoLoading] = useState(false);
  const [infoStatus, setInfoStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [passLoading, setPassLoading] = useState(false);
  const [passStatus, setPassStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [passError, setPassError] = useState('');

  const handleInfoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setInfoLoading(true);
    setInfoStatus('idle');
    try {
      const res = await userApi.updateMe({ firstName, lastName });
      const raw = res.data.user ?? res.data;
      const fn = raw.firstName ?? raw.first_name ?? firstName;
      const ln = raw.lastName ?? raw.last_name ?? lastName;
      setUser({
        ...user!,
        firstName: fn,
        lastName: ln,
        name: `${fn} ${ln}`.trim(),
      });
      setInfoStatus('success');
    } catch {
      setInfoStatus('error');
    } finally {
      setInfoLoading(false);
    }
  };

  const handlePassSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassStatus('idle');
    if (newPassword !== confirmPassword) {
      setPassError('Yeni şifreler eşleşmiyor.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    setPassLoading(true);
    try {
      await userApi.updateMe({ password: newPassword });
      setPassStatus('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPassError('Şifre güncellenirken bir hata oluştu.');
      setPassStatus('error');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface">Profil Ayarları</h1>
        <p className="text-sm text-on-surface-variant mt-1">Hesap bilgilerinizi güncelleyin.</p>
      </div>

      {/* Avatar + info */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 card-shadow p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-on-tertiary-container flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {(user?.firstName ?? 'A').charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-on-surface text-lg">{user?.name ?? '—'}</p>
          <p className="text-sm text-on-surface-variant">{user?.email ?? '—'}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-secondary/10 text-secondary capitalize">
            {user?.role ?? 'admin'}
          </span>
        </div>
      </div>

      {/* Name update */}
      <form onSubmit={handleInfoSubmit}>
        <div className="bg-white rounded-2xl border border-outline-variant/40 card-shadow p-4 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-5 h-5 text-secondary" />
            <h2 className="font-semibold text-on-surface">Kişisel Bilgiler</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Ad</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/60 text-sm focus:outline-none focus:border-on-tertiary-container focus:ring-2 focus:ring-on-tertiary-container/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Soyad</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/60 text-sm focus:outline-none focus:border-on-tertiary-container focus:ring-2 focus:ring-on-tertiary-container/10 transition-all"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-on-surface mb-1.5">E-posta</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/40 text-sm bg-surface text-on-surface-variant cursor-not-allowed"
            />
          </div>

          {infoStatus === 'success' && (
            <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Bilgiler başarıyla güncellendi.
            </div>
          )}
          {infoStatus === 'error' && (
            <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-error-container text-error text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Güncelleme sırasında bir hata oluştu.
            </div>
          )}

          <button
            type="submit"
            disabled={infoLoading}
            className="w-full sm:w-auto px-8 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-60"
          >
            {infoLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </form>

      {/* Password update */}
      <form onSubmit={handlePassSubmit}>
        <div className="bg-white rounded-2xl border border-outline-variant/40 card-shadow p-4 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-5 h-5 text-secondary" />
            <h2 className="font-semibold text-on-surface">Şifre Değiştir</h2>
          </div>

          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Mevcut Şifre</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/60 text-sm focus:outline-none focus:border-on-tertiary-container focus:ring-2 focus:ring-on-tertiary-container/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Yeni Şifre</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/60 text-sm focus:outline-none focus:border-on-tertiary-container focus:ring-2 focus:ring-on-tertiary-container/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Yeni Şifre (Tekrar)</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/60 text-sm focus:outline-none focus:border-on-tertiary-container focus:ring-2 focus:ring-on-tertiary-container/10 transition-all"
              />
            </div>
          </div>

          {passStatus === 'success' && (
            <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Şifre başarıyla güncellendi.
            </div>
          )}
          {passError && (
            <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-error-container text-error text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {passError}
            </div>
          )}

          <button
            type="submit"
            disabled={passLoading}
            className="w-full sm:w-auto px-8 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-60"
          >
            {passLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </div>
      </form>
    </div>
  );
}
