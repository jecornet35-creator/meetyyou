import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Bell, Settings, Heart, Users, Zap, User, Camera, Mail, Sparkles, HelpCircle, CheckCircle, Ban } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header({ user }) {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const notifications = await base44.entities.Notification.filter(
        { user_email: user.email, is_read: false }
      );
      return notifications.length;
    },
    enabled: !!currentUser,
    initialData: 0,
  });

  // Real-time subscription for notifications
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.data.user_email === currentUser.email) {
        queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
      }
    });

    return unsubscribe;
  }, [currentUser, queryClient]);
  const stats = [
    { value: '41%', label: 'Compatibilité', color: 'bg-amber-500' },
    { value: '56', label: 'Vues', color: 'bg-gray-400' },
    { value: '36', label: 'Likes', color: 'bg-gray-400' },
    { value: '9', label: 'Favoris', color: 'bg-gray-400' },
    { value: '2', label: 'Matches', color: 'bg-gray-400' },
  ];

  return (
    <header className="bg-gradient-to-r from-amber-600 to-amber-500 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & User */}
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <Heart className="w-8 h-8 fill-white" />
              <span className="font-bold text-xl hidden sm:block">Meetyyou</span>
            </Link>
            
            <div className="flex items-center gap-3 ml-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-10 h-10 rounded-full bg-white/20 overflow-hidden border-2 border-white/50 cursor-pointer hover:border-white transition-colors">
                    <img 
                      src={user?.main_photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                      alt="Mon profil"
                      className="w-full h-full object-cover"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 bg-white p-2 shadow-xl rounded-lg border-0">
                  <Link to={createPageUrl('ProfileDetail') + '?id=' + user?.id}>
                    <DropdownMenuItem className="py-3 px-4 cursor-pointer hover:bg-gray-50 rounded text-gray-700">
                      <User className="w-4 h-4 mr-3 text-gray-400" />
                      Voir le profil
                    </DropdownMenuItem>
                  </Link>
                  <Link to={createPageUrl('EditProfile')}>
                    <DropdownMenuItem className="py-3 px-4 cursor-pointer hover:bg-gray-50 rounded text-gray-700">
                      <Settings className="w-4 h-4 mr-3 text-gray-400" />
                      Modifier Mon Profil
                    </DropdownMenuItem>
                  </Link>
                  <Link to={createPageUrl('EditProfile') + '?tab=photos'}>
                    <DropdownMenuItem className="py-3 px-4 cursor-pointer hover:bg-gray-50 rounded text-gray-700">
                      <Camera className="w-4 h-4 mr-3 text-gray-400" />
                      Photos
                    </DropdownMenuItem>
                  </Link>
                  <Link to={createPageUrl('Messages')}>
                    <DropdownMenuItem className="py-3 px-4 cursor-pointer hover:bg-gray-50 rounded text-gray-700">
                      <Mail className="w-4 h-4 mr-3 text-gray-400" />
                      Correspondances
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem className="py-3 px-4 cursor-pointer hover:bg-gray-50 rounded text-gray-700">
                    <Sparkles className="w-4 h-4 mr-3 text-gray-400" />
                    Loisirs et Intérêts
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-3 px-4 cursor-pointer hover:bg-gray-50 rounded text-gray-700">
                    <HelpCircle className="w-4 h-4 mr-3 text-gray-400" />
                    Questions Sur Votre Personnalité
                  </DropdownMenuItem>
                  <Link to={createPageUrl('VerifyProfile')}>
                    <DropdownMenuItem className="py-3 px-4 cursor-pointer hover:bg-gray-50 rounded text-gray-700">
                      <CheckCircle className="w-4 h-4 mr-3 text-gray-400" />
                      Vérifiez profil
                    </DropdownMenuItem>
                  </Link>
                  <Link to={createPageUrl('BlockedUsers')}>
                    <DropdownMenuItem className="py-3 px-4 cursor-pointer hover:bg-gray-50 rounded text-gray-700">
                      <Ban className="w-4 h-4 mr-3 text-gray-400" />
                      Utilisateurs bloqués
                    </DropdownMenuItem>
                  </Link>
                  <Link to={createPageUrl('NotificationSettings')}>
                    <DropdownMenuItem className="py-3 px-4 cursor-pointer hover:bg-gray-50 rounded text-gray-700">
                      <Bell className="w-4 h-4 mr-3 text-gray-400" />
                      Préférences notifications
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="hidden md:block">
                <p className="text-sm font-medium">Bienvenue</p>
                <p className="text-xs text-white/80">Complétez vos critères</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link to={createPageUrl('Messages')}>
              <Button variant="ghost" className="text-white hover:bg-white/10 relative">
                Messages
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5">56</Badge>
              </Button>
            </Link>
            <Link to={createPageUrl('Activities')}>
              <Button variant="ghost" className="text-white hover:bg-white/10 relative">
                Profil Vu
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5">42</Badge>
              </Button>
            </Link>
            <Link to={createPageUrl('Likes')}>
              <Button variant="ghost" className="text-white hover:bg-white/10 relative">
                Like
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5">36</Badge>
              </Button>
            </Link>
          </nav>

          {/* Stats circles */}
          <div className="hidden xl:flex items-center gap-3">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center text-sm font-bold`}>
                  {stat.value}
                </div>
                <span className="text-xs text-white/70 mt-1">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-green-500 hover:bg-green-600 gap-2 hidden sm:flex">
              <Zap className="w-4 h-4" />
              Premium
            </Button>
            <Link to={createPageUrl('Notifications')}>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 min-w-[20px] h-5">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}