'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

function classNames(...args: any[]) {
  return args.filter(Boolean).join(' ');
}

interface FormErrors {
  name?: string;
  org?: string;
  title?: string;
  phone?: string;
  email?: string;
  diet?: string;
}

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Validation functions
  const validateName = (name: string): string | undefined => {
    const trimmed = name.trim();
    if (!trimmed) return '姓名為必填項目';
    if (trimmed.length < 1) return '姓名不能為空';
    if (trimmed.length > 50) return '姓名長度不能超過50個字元';
    // Allow Chinese characters, English letters, spaces, and common punctuation
    if (!/^[\u4e00-\u9fa5a-zA-Z\s·]+$/.test(trimmed)) {
      return '姓名只能包含中文、英文、空格和間隔號';
    }
    return undefined;
  };

  const validateOrg = (org: string): string | undefined => {
    const trimmed = org.trim();
    if (!trimmed) return '服務機構為必填項目';
    if (trimmed.length < 1) return '服務機構不能為空';
    if (trimmed.length > 100) return '服務機構長度不能超過100個字元';
    return undefined;
  };

  const validateTitle = (title: string): string | undefined => {
    const trimmed = title.trim();
    if (!trimmed) return '職稱為必填項目';
    if (trimmed.length < 1) return '職稱不能為空';
    if (trimmed.length > 50) return '職稱長度不能超過50個字元';
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    const trimmed = phone.trim().replace(/[\s\-\(\)]/g, '');
    if (!trimmed) return '電話號碼為必填項目';
    // Taiwan phone format: 09XXXXXXXX or 0X-XXXX-XXXX or similar
    if (!/^0\d{8,10}$/.test(trimmed)) {
      return '請輸入有效的台灣電話號碼（例如：0912345678）';
    }
    if (trimmed.length == 10) {
      return '電話號碼應為9-10位數字';
    }
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return '電子信箱為必填項目';
    if (trimmed.length > 254) return '電子信箱長度不能超過254個字元';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return '請輸入有效的電子信箱格式';
    }
    // Additional check for common spam patterns
    if (trimmed.includes('..') || trimmed.startsWith('.') || trimmed.endsWith('.')) {
      return '電子信箱格式不正確';
    }
    return undefined;
  };

  const validateDiet = (diet: string): string | undefined => {
    if (!diet) return '飲食習慣為必填項目';
    if (diet !== '葷' && diet !== '素') {
      return '請選擇有效的飲食習慣';
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Rate limiting: prevent spam submissions (minimum 3 seconds between submissions)
    const now = Date.now();
    if (now - lastSubmitTime < 3000) {
      alert('請稍候再試，避免重複提交');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const org = formData.get('org') as string;
    const title = formData.get('title') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const diet = formData.get('diet') as string;

    // Validate all fields
    const newErrors: FormErrors = {};
    const nameError = validateName(name);
    const orgError = validateOrg(org);
    const titleError = validateTitle(title);
    const phoneError = validatePhone(phone);
    const emailError = validateEmail(email);
    const dietError = validateDiet(diet);

    if (nameError) newErrors.name = nameError;
    if (orgError) newErrors.org = orgError;
    if (titleError) newErrors.title = titleError;
    if (phoneError) newErrors.phone = phoneError;
    if (emailError) newErrors.email = emailError;
    if (dietError) newErrors.diet = dietError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors and proceed with submission
    setErrors({});
    setLoading(true);
    setLastSubmitTime(now);

    try {
      // Create cleaned form data with trimmed values
      const cleanedFormData = new FormData();
      cleanedFormData.append('name', name.trim());
      cleanedFormData.append('org', org.trim());
      cleanedFormData.append('title', title.trim());
      cleanedFormData.append('phone', phone.trim().replace(/[\s\-\(\)]/g, ''));
      cleanedFormData.append('email', email.trim().toLowerCase());
      cleanedFormData.append('diet', diet);

      await fetch(
        'https://script.google.com/macros/s/AKfycbwr8XfETeie6wHpG59CynQa2Iz57zEeM4rz1SqLS7xXW0DZs2zcaOT_vdhoRnikPN6T/exec',
        {
          method: 'POST',
          mode: 'no-cors',
          body: cleanedFormData,
        }
      );
      setDone(true);
    } catch (err) {
      // ignore error (no-cors), but set done anyway if fetch succeeds
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-6 px-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('/02.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 背景遮罩與亮點漸層，與首頁一致 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/85 pointer-events-none" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,rgba(34,211,238,0.10),transparent_48%)]" />
      {/* 返回首頁按鈕 */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-cyan-200 hover:text-cyan-100 font-semibold transition-colors text-sm md:text-base"
        aria-label="返回首頁"
      >
        <svg
          width={22}
          height={22}
          fill="none"
          viewBox="0 0 24 24"
          className="inline-block"
        >
          <path
            d="M15 19l-7-7 7-7"
            stroke="#67e8f9"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        返回首頁
      </Link>

      {/* 主卡片 */}
      <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl px-6 py-9 md:px-10 md:py-12 flex flex-col items-center relative">
        <h1 className="text-white text-2xl md:text-3xl font-extrabold mb-8 tracking-wider text-center drop-shadow-lg">
          立即保留席位
        </h1>
        {!done ? (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="w-full flex flex-col gap-5"
            autoComplete="off"
          >
            <div>
              <label htmlFor="name" className="block mb-1 text-cyan-100 font-semibold">
                姓名 <span className="text-pink-400">*</span>
              </label>
              <input
                required
                type="text"
                id="name"
                name="name"
                maxLength={50}
                className={`w-full rounded-lg bg-white/15 text-cyan-50 px-4 py-3 focus:outline-none focus:ring-2 text-base font-medium placeholder:text-cyan-200/70 ${
                  errors.name ? 'focus:ring-red-400 ring-2 ring-red-400' : 'focus:ring-cyan-300'
                }`}
                autoComplete="off"
                onChange={() => {
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-300">{errors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="org" className="block mb-1 text-cyan-100 font-semibold">
                服務機構 <span className="text-pink-400">*</span>
              </label>
              <input
                required
                type="text"
                id="org"
                name="org"
                maxLength={100}
                className={`w-full rounded-lg bg-white/15 text-cyan-50 px-4 py-3 focus:outline-none focus:ring-2 text-base font-medium placeholder:text-cyan-200/70 ${
                  errors.org ? 'focus:ring-red-400 ring-2 ring-red-400' : 'focus:ring-cyan-300'
                }`}
                autoComplete="off"
                onChange={() => {
                  if (errors.org) {
                    setErrors((prev) => ({ ...prev, org: undefined }));
                  }
                }}
              />
              {errors.org && (
                <p className="mt-1 text-sm text-red-300">{errors.org}</p>
              )}
            </div>
            <div>
              <label htmlFor="title" className="block mb-1 text-cyan-100 font-semibold">
                職稱 <span className="text-pink-400">*</span>
              </label>
              <input
                required
                type="text"
                id="title"
                name="title"
                maxLength={50}
                className={`w-full rounded-lg bg-white/15 text-cyan-50 px-4 py-3 focus:outline-none focus:ring-2 text-base font-medium placeholder:text-cyan-200/70 ${
                  errors.title ? 'focus:ring-red-400 ring-2 ring-red-400' : 'focus:ring-cyan-300'
                }`}
                autoComplete="off"
                onChange={() => {
                  if (errors.title) {
                    setErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-300">{errors.title}</p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="block mb-1 text-cyan-100 font-semibold">
                電話號碼 <span className="text-pink-400">*</span>
              </label>
              <input
                required
                type="tel"
                id="phone"
                name="phone"
                maxLength={15}
                pattern="[0-9\s\-\(\)]+"
                className={`w-full rounded-lg bg-white/15 text-cyan-50 px-4 py-3 focus:outline-none focus:ring-2 text-base font-medium placeholder:text-cyan-200/70 ${
                  errors.phone ? 'focus:ring-red-400 ring-2 ring-red-400' : 'focus:ring-cyan-300'
                }`}
                autoComplete="off"
                placeholder="0912345678"
                onChange={() => {
                  if (errors.phone) {
                    setErrors((prev) => ({ ...prev, phone: undefined }));
                  }
                }}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-300">{errors.phone}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block mb-1 text-cyan-100 font-semibold">
                電子信箱 <span className="text-pink-400">*</span>
              </label>
              <input
                required
                type="email"
                id="email"
                name="email"
                maxLength={254}
                className={`w-full rounded-lg bg-white/15 text-cyan-50 px-4 py-3 focus:outline-none focus:ring-2 text-base font-medium placeholder:text-cyan-200/70 ${
                  errors.email ? 'focus:ring-red-400 ring-2 ring-red-400' : 'focus:ring-cyan-300'
                }`}
                autoComplete="off"
                onChange={() => {
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-300">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block mb-2 text-cyan-100 font-semibold">
                飲食習慣 <span className="text-pink-400">*</span>
              </label>
              <div className="flex gap-8">
                <label className="flex items-center gap-2 cursor-pointer text-cyan-50">
                  <input
                    required
                    type="radio"
                    name="diet"
                    value="葷"
                    className="accent-cyan-400 w-5 h-5"
                    onChange={() => {
                      if (errors.diet) {
                        setErrors((prev) => ({ ...prev, diet: undefined }));
                      }
                    }}
                  />
                  <span>葷</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-cyan-50">
                  <input
                    required
                    type="radio"
                    name="diet"
                    value="素"
                    className="accent-green-400 w-5 h-5"
                    onChange={() => {
                      if (errors.diet) {
                        setErrors((prev) => ({ ...prev, diet: undefined }));
                      }
                    }}
                  />
                  <span>素</span>
                </label>
              </div>
              {errors.diet && (
                <p className="mt-1 text-sm text-red-300">{errors.diet}</p>
              )}
            </div>

            <button
              type="submit"
              className={classNames(
                "w-full mt-3 py-3 rounded-lg text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95", 
                loading && "opacity-60 cursor-not-allowed"
              )}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle
                      className="opacity-20"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#fff"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-80"
                      fill="#fff"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  傳送中...
                </span>
              ) : (
                '確認報名'
              )}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center w-full py-16">
            <div className="bg-green-500/20 border-2 border-green-400 rounded-full p-6 mb-4">
              <svg viewBox="0 0 48 48" width={64} height={64} fill="none">
                <circle cx="24" cy="24" r="22" fill="#22c55e" opacity="0.3"/>
                <path d="M15 26l6 6 12-14" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <div className="text-green-300 text-2xl font-bold mb-2">報名成功！</div>
            <div className="text-cyan-100 text-lg font-medium text-center">我們已收到您的資料</div>
          </div>
        )}
      </div>
    </div>
  );
}
