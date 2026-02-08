import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRedirect = async () => {
      try {
        const user = await base44.auth.me();
        const roles = await base44.entities.AdminRole.filter({ user_email: user.email });
        
        if (roles.length > 0 && roles[0].is_active) {
          // L'utilisateur est un admin/modérateur actif
          if (currentPageName === 'Home' || currentPageName === 'Landing') {
            navigate(createPageUrl('AdminDashboard'));
            return;
          }
        }
      } catch (error) {
        // L'utilisateur n'est pas connecté ou une erreur s'est produite
      } finally {
        setLoading(false);
      }
    };

    checkAdminRedirect();
  }, [currentPageName, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}