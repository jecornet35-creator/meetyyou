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
import AccountEmail from './pages/AccountEmail';
import AccountPassword from './pages/AccountPassword';
import Activities from './pages/Activities';
import AdminDashboard from './pages/AdminDashboard';
import AdminEmails from './pages/AdminEmails';
import AdminFlaggedMessages from './pages/AdminFlaggedMessages';
import AdminManagement from './pages/AdminManagement';
import AdminPhotos from './pages/AdminPhotos';
import AdminPromoCodes from './pages/AdminPromoCodes';
import AdminReports from './pages/AdminReports';
import AdminSubscriptions from './pages/AdminSubscriptions';
import AdminTickets from './pages/AdminTickets';
import AdminUsers from './pages/AdminUsers';
import AdminVerification from './pages/AdminVerification';
import BlockedUsers from './pages/BlockedUsers';
import Correspondances from './pages/Correspondances';
import EditProfile from './pages/EditProfile';
import Home from './pages/Home';
import Interests from './pages/Interests';
import Landing from './pages/Landing';
import Likes from './pages/Likes';
import Messages from './pages/Messages';
import NotificationSettings from './pages/NotificationSettings';
import Notifications from './pages/Notifications';
import PersonalityQuestions from './pages/PersonalityQuestions';
import Photos from './pages/Photos';
import ProfilVu from './pages/ProfilVu';
import ProfileDetail from './pages/ProfileDetail';
import ProfileVerification from './pages/ProfileVerification';
import SubscriptionPlans from './pages/SubscriptionPlans';
import Settings from './pages/Settings';


export const PAGES = {
    "AccountEmail": AccountEmail,
    "AccountPassword": AccountPassword,
    "Activities": Activities,
    "AdminDashboard": AdminDashboard,
    "AdminEmails": AdminEmails,
    "AdminFlaggedMessages": AdminFlaggedMessages,
    "AdminManagement": AdminManagement,
    "AdminPhotos": AdminPhotos,
    "AdminPromoCodes": AdminPromoCodes,
    "AdminReports": AdminReports,
    "AdminSubscriptions": AdminSubscriptions,
    "AdminTickets": AdminTickets,
    "AdminUsers": AdminUsers,
    "AdminVerification": AdminVerification,
    "BlockedUsers": BlockedUsers,
    "Correspondances": Correspondances,
    "EditProfile": EditProfile,
    "Home": Home,
    "Interests": Interests,
    "Landing": Landing,
    "Likes": Likes,
    "Messages": Messages,
    "NotificationSettings": NotificationSettings,
    "Notifications": Notifications,
    "PersonalityQuestions": PersonalityQuestions,
    "Photos": Photos,
    "ProfilVu": ProfilVu,
    "ProfileDetail": ProfileDetail,
    "ProfileVerification": ProfileVerification,
    "SubscriptionPlans": SubscriptionPlans,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};