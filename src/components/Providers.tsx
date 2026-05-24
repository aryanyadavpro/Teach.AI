'use client';

import { LanguageProvider } from '@/context/LanguageContext';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <LanguageProvider>
                {children}
            </LanguageProvider>
        </SessionProvider>
    );
}
