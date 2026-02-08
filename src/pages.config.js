/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Activities from './pages/Activities';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminAutoModeration from './pages/AdminAutoModeration';
import AdminDashboard from './pages/AdminDashboard';
import AdminEmails from './pages/AdminEmails';
import AdminFlaggedMessages from './pages/AdminFlaggedMessages';
import AdminManagement from './pages/AdminManagement';
import AdminModerationLog from './pages/AdminModerationLog';
import AdminPhotos from './pages/AdminPhotos';
import AdminPromoCodes from './pages/AdminPromoCodes';
import AdminReports from './pages/AdminReports';
import AdminSubscriptionPlans from './pages/AdminSubscriptionPlans';
import AdminSubscriptions from './pages/AdminSubscriptions';
import AdminTickets from './pages/AdminTickets';
import AdminTransactions from './pages/AdminTransactions';
import AdminUserProfile from './pages/AdminUserProfile';
import AdminUsers from './pages/AdminUsers';
import AdminVerification from './pages/AdminVerification';
import BlockedUsers from './pages/BlockedUsers';
import ConversationDetail from './pages/ConversationDetail';
import Correspondances from './pages/Correspondances';
import EditProfile from './pages/EditProfile';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Likes from './pages/Likes';
import Messages from './pages/Messages';
import NotificationSettings from './pages/NotificationSettings';
import Notifications from './pages/Notifications';
import ProfileDetail from './pages/ProfileDetail';
import VerifyProfile from './pages/VerifyProfile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Activities": Activities,
    "AdminAnalytics": AdminAnalytics,
    "AdminAutoModeration": AdminAutoModeration,
    "AdminDashboard": AdminDashboard,
    "AdminEmails": AdminEmails,
    "AdminFlaggedMessages": AdminFlaggedMessages,
    "AdminManagement": AdminManagement,
    "AdminModerationLog": AdminModerationLog,
    "AdminPhotos": AdminPhotos,
    "AdminPromoCodes": AdminPromoCodes,
    "AdminReports": AdminReports,
    "AdminSubscriptionPlans": AdminSubscriptionPlans,
    "AdminSubscriptions": AdminSubscriptions,
    "AdminTickets": AdminTickets,
    "AdminTransactions": AdminTransactions,
    "AdminUserProfile": AdminUserProfile,
    "AdminUsers": AdminUsers,
    "AdminVerification": AdminVerification,
    "BlockedUsers": BlockedUsers,
    "ConversationDetail": ConversationDetail,
    "Correspondances": Correspondances,
    "EditProfile": EditProfile,
    "Home": Home,
    "Landing": Landing,
    "Likes": Likes,
    "Messages": Messages,
    "NotificationSettings": NotificationSettings,
    "Notifications": Notifications,
    "ProfileDetail": ProfileDetail,
    "VerifyProfile": VerifyProfile,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};