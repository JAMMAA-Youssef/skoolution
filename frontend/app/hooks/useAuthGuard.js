import { useEffect } from "react";
import { useRouter } from "next/navigation";
import authService from "@/app/services/auth.service";

export default function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.replace("/login");
    }
  }, [router]);
} 