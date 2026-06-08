import { useState, type FormEvent } from 'react';
import { Search, ShieldCheck, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { diplomaApi } from '../../services/api';
import type { VerifyResult } from '../../types';

export default function AdminVerify() {
  const [diplomaId, setDiplomaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!diplomaId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await diplomaApi.verify(diplomaId.trim());
      setResult(res.data);
    } catch {
      setResult({ valid: false, message: 'Doğrulama sırasında bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto w-full">
      <div className="mb-2 text-xs text-on-surface-variant font-medium">Doğrulama Merkezi</div>

      <div className="mb-10">
        <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-widest uppercase rounded-full bg-secondary/10 text-secondary border border-secondary/20">
          GÜVENLİ BLOCKCHAIN ALTYAPISI
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface mb-3">
          Diploma ID ile{' '}
          <span className="text-on-tertiary-container">Doğrulama</span>
        </h1>
        <p className="text-on-surface-variant leading-relaxed">
          Diplomaya ait <strong className="text-on-surface">Diploma ID</strong>'sini girerek
          kaydın blockchain'deki geçerliliğini anında sorgulayın.
          Diploma ID'sini geçmiş kayıtlardan veya QR kodundan öğrenebilirsiniz.
        </p>
      </div>

      <form onSubmit={handleVerify} className="bg-white rounded-2xl border border-outline-variant/40 card-shadow p-4 md:p-8 mb-8">
        <label className="block text-sm font-semibold text-on-surface mb-2">Diploma ID</label>
        <div className="relative mb-4">
          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="text"
            value={diplomaId}
            onChange={(e) => setDiplomaId(e.target.value)}
            placeholder="BC-4BDA0D6C6438"
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant/60 text-sm font-mono-code focus:outline-none focus:border-on-tertiary-container focus:ring-2 focus:ring-on-tertiary-container/10 placeholder:text-outline placeholder:font-sans transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !diplomaId.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-60"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Doğrulanıyor...</>
            : <><Search className="w-4 h-4" /> Doğrula</>}
        </button>
      </form>

      {result && (
        <div className={`rounded-2xl border p-6 mb-8 ${
          result.valid ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            {result.valid
              ? <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              : <XCircle className="w-6 h-6 text-red-600" />}
            <h3 className={`font-semibold text-lg ${result.valid ? 'text-emerald-800' : 'text-red-800'}`}>
              {result.valid ? 'Diploma Geçerli' : 'Diploma Geçersiz'}
            </h3>
          </div>
          {result.diploma && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                ['Ad Soyad', `${result.diploma.first_name} ${result.diploma.last_name}`],
                ['Öğrenci No', result.diploma.student_no],
                ['Üniversite', result.diploma.university],
                ['Bölüm', result.diploma.department],
                ['Mezuniyet Yılı', String(result.diploma.graduation_year)],
                ['Diploma ID', result.diploma.diploma_no],
              ].map(([label, value]) => (
                <div key={label}>
                  <span className="text-xs text-on-surface-variant font-medium block mb-0.5">{label}</span>
                  <span className={`font-medium text-on-surface text-xs ${label === 'Diploma ID' ? 'font-mono-code break-all' : ''}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
          {result.message && <p className="text-sm text-red-700">{result.message}</p>}
        </div>
      )}
    </div>
  );
}
