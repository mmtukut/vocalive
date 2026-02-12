'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CameraStream from '@/components/CameraStream';

function CoachContent() {
    const searchParams = useSearchParams();
    const skill = searchParams.get('skill') || 'solar';
    const lang = (searchParams.get('lang') || 'en') as 'en' | 'ha';

    return <CameraStream skill={skill} language={lang} />;
}

export default function CoachPage() {
    return (
        <Suspense
            fallback={
                <div className="h-screen w-full bg-[var(--background)] flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
            }
        >
            <CoachContent />
        </Suspense>
    );
}
