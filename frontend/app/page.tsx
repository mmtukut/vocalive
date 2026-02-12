'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronRight, Globe } from 'lucide-react';

const SKILLS = [
  { id: 'solar', name: 'Solar Installation', name_ha: 'Sanaar koyan sola', icon: '/icons/solar.png', color: '#F59E0B' },
  { id: 'welding', name: 'Welding', name_ha: 'Walda', icon: '/icons/welding.png', color: '#EF4444' },
  { id: 'electrical', name: 'Electrical Wiring', name_ha: 'Haɗa Waya', icon: '/icons/electrical.png', color: '#3B82F6' },
  { id: 'mechanics', name: 'Auto Mechanics', name_ha: 'Injiniya Mota', icon: '/icons/mechanics.png', color: '#8B5CF6' },
  { id: 'carpentry', name: 'Carpentry', name_ha: 'Sassaƙa', icon: '/icons/carpentry.png', color: '#D97706' },
  { id: 'farming', name: 'Farming', name_ha: 'Noma', icon: '/icons/farming.png', color: '#10B981' },
];

const UI_TEXT = {
  en: {
    tagline: 'Your phone is now',
    taglineHighlight: 'a master craftsman.',
    subtitle: 'Point your camera. Learn any trade. Real-time AI coaching while your hands work.',
    selectSkill: 'Choose Your Skill',
    startCoaching: 'Start Coaching',
    poweredBy: 'Powered by Gemini 3',
  },
  ha: {
    tagline: 'Wayarka yanzu',
    taglineHighlight: 'malamin sana\'a ne.',
    subtitle: 'Nuna kyamararka. Koyi kowace sana\'a. AI tana koyar da kai cikin ainihi yayin da ka ke aiki.',
    selectSkill: 'Zaɓi Sana\'arka',
    startCoaching: 'Fara Koyo',
    poweredBy: 'Tare da Gemini 3',
  },
};

export default function Home() {
  const router = useRouter();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'ha'>('en');
  const t = UI_TEXT[language];

  const handleStart = () => {
    if (!selectedSkill) return;
    router.push(`/coach?skill=${selectedSkill}&lang=${language}`);
  };

  return (
    <main className="relative min-h-screen bg-[var(--background)] overflow-hidden selection:bg-indigo-500/30">
      {/* Ambient Glow */}
      <div className="glow-bg" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen container-premium py-12 md:py-20 safe-area-top">

        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Image src="/icons/logo.png" alt="VocaLive" width={24} height={24} className="object-contain drop-shadow-md" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white/90">VocaLive</span>
          </div>

          {/* Language Toggle */}
          <div className="lang-toggle backdrop-blur-md bg-white/5 border-white/10">
            <button
              onClick={() => setLanguage('en')}
              className={`text-sm px-4 py-2 rounded-lg transition-all ${language === 'en' ? 'active bg-white/10 text-white font-semibold' : 'text-white/40 hover:text-white/70'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ha')}
              className={`text-sm px-4 py-2 rounded-lg transition-all ${language === 'ha' ? 'active bg-white/10 text-white font-semibold' : 'text-white/40 hover:text-white/70'}`}
            >
              HA 🇳🇬
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="mb-20">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-8 text-white">
            {t.tagline}
            <br />
            <span className="shimmer-text">{t.taglineHighlight}</span>
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-md font-light">
            {t.subtitle}
          </p>
        </section>

        {/* Skill Selection */}
        <section className="flex-1 mb-10">
          <h2 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-6 ml-1">
            {t.selectSkill}
          </h2>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:gap-8">
            {SKILLS.map((skill) => {
              const isSelected = selectedSkill === skill.id;
              return (
                <button
                  key={skill.id}
                  onClick={() => setSelectedSkill(skill.id)}
                  className={`skill-card text-left relative group transition-all duration-300 ${isSelected ? 'ring-2 ring-offset-2 ring-offset-[#030712]' : 'hover:bg-white/5'}`}
                  style={{
                    '--card-color': skill.color,
                    borderColor: isSelected ? skill.color : 'rgba(255,255,255,0.08)',
                    background: isSelected ? `linear-gradient(135deg, ${skill.color}15, ${skill.color}05)` : 'rgba(255,255,255,0.03)',
                    boxShadow: isSelected ? `0 0 40px -10px ${skill.color}30` : 'none',
                  } as React.CSSProperties}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300"
                    style={{ background: `${skill.color}15` }}
                  >
                    <Image
                      src={skill.icon}
                      alt={skill.name}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <p className={`font-semibold text-[15px] mb-1 transition-colors ${isSelected ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                    {language === 'ha' ? skill.name_ha : skill.name}
                  </p>
                  <p className="text-xs text-white/40 group-hover:text-white/60 transition-colors">
                    {language === 'ha' ? skill.name : skill.name_ha}
                  </p>

                  {isSelected && (
                    <div
                      className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center animate-in zoom-in duration-200"
                      style={{ background: skill.color }}
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Start Button */}
        <section className="pb-6">
          <button
            onClick={handleStart}
            disabled={!selectedSkill}
            className={`w-full btn-primary text-xl py-5 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 ${!selectedSkill ? 'opacity-40 grayscale cursor-not-allowed transform-none' : 'hover:-translate-y-1'
              }`}
          >
            {t.startCoaching}
            <ChevronRight className="w-6 h-6 opacity-80" />
          </button>

          <p className="text-center text-xs text-white/20 mt-6 flex items-center justify-center gap-1.5 uppercase tracking-wider font-medium">
            <Globe className="w-3 h-3" />
            {t.poweredBy}
          </p>
        </section>
      </div>
    </main>
  );
}
