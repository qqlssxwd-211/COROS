import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { REGION_OPTIONS } from '../../lib/constants';
import type { CorosCredentials } from '../../types/coros';

export default function LoginOverlay() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState<CorosCredentials['region']>('cn');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ email, password, region });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误';
      console.error('Login error:', msg);
      setError(`登录失败：${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl">
      <form onSubmit={handleSubmit} className="w-[400px] max-w-[90vw] rounded-2xl border border-white/8 bg-[rgba(10,10,10,0.95)] p-9 text-center backdrop-blur-xl">
        <h2 className="text-xl font-medium tracking-[-0.02em]">登录 COROS 账号</h2>
        <p className="mt-1 text-sm text-[#999] font-[family-name:var(--font-text)]">连接训练数据，开启运动深度分析</p>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-6 space-y-4 text-left">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.06em] text-[#666]">邮箱</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/8 bg-white/[0.07] px-4 py-2.5 text-[0.9rem] text-white placeholder:text-[#555] outline-none transition focus:border-accent focus:bg-white/[0.10] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgba(18,18,18,0.95)] [&:-webkit-autofill]:[-webkit-text-fill-color:#fafafa] [&:-webkit-autofill]:[caret-color:#fafafa]"
              placeholder="coros@example.com" required />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.06em] text-[#666]">密码</span>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/8 bg-white/[0.07] px-4 py-2.5 text-[0.9rem] text-white placeholder:text-[#555] outline-none transition focus:border-accent focus:bg-white/[0.10] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgba(18,18,18,0.95)] [&:-webkit-autofill]:[-webkit-text-fill-color:#fafafa] [&:-webkit-autofill]:[caret-color:#fafafa]"
              placeholder="••••••••" required />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.06em] text-[#666]">地区</span>
            <select value={region} onChange={e => setRegion(e.target.value as CorosCredentials['region'])}
              className="mt-1 w-full rounded-xl border border-white/8 bg-white/[0.07] px-4 py-2.5 text-[0.9rem] text-white outline-none transition focus:border-accent focus:bg-white/[0.10]">
              {REGION_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-black">{o.label}</option>)}
            </select>
          </label>
        </div>

        <button type="submit" disabled={loading}
          className="mt-6 w-full rounded-2xl bg-accent py-3 text-sm font-semibold text-black transition hover:bg-[#22c55e] disabled:opacity-50">
          {loading ? '连接中...' : '连接 COROS'}
        </button>
      </form>
    </div>
  );
}
