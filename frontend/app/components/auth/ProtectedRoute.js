"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/app/services/auth.service';

export default function ProtectedRoute({ children }) {
    const router = useRouter();

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    // Show loading or nothing while checking authentication
    if (!authService.isAuthenticated()) {
        return null;
    }

    return children;
} 