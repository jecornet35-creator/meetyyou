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
import AdminDashboard from './pages/AdminDashboard';
import AdminPhotos from './pages/AdminPhotos';
import AdminReports from './pages/AdminReports';
import AdminSubscriptions from './pages/AdminSubscriptions';
import AdminTickets from './pages/AdminTickets';
import AdminUsers from './pages/AdminUsers';
import Correspondances from './pages/Correspondances';
import EditProfile from './pages/EditProfile';
import Home from './pages/Home';
import Interests from './pages/Interests';
import Landing from './pages/Landing';
import Messages from './pages/Messages';
import NotificationSettings from './pages/NotificationSettings';
import Notifications from './pages/Notifications';
import PersonalityQuestions from './pages/PersonalityQuestions';
import ProfileDetail from './pages/ProfileDetail';
import SubscriptionPlans from './pages/SubscriptionPlans';
import Photos from './pages/Photos';
import BlockedUsers from './pages/BlockedUsers';
import AdminVerification from './pages/AdminVerification';
import ProfileVerification from './pages/ProfileVerification';


export const PAGES = {
    "Activities": Activities,
    "AdminDashboard": AdminDashboard,
    "AdminPhotos": AdminPhotos,
    "AdminReports": AdminReports,
    "AdminSubscriptions": AdminSubscriptions,
    "AdminTickets": AdminTickets,
    "AdminUsers": AdminUsers,
    "Correspondances": Correspondances,
    "EditProfile": EditProfile,
    "Home": Home,
    "Interests": Interests,
    "Landing": Landing,
    "Messages": Messages,
    "NotificationSettings": NotificationSettings,
    "Notifications": Notifications,
    "PersonalityQuestions": PersonalityQuestions,
    "ProfileDetail": ProfileDetail,
    "SubscriptionPlans": SubscriptionPlans,
    "Photos": Photos,
    "BlockedUsers": BlockedUsers,
    "AdminVerification": AdminVerification,
    "ProfileVerification": ProfileVerification,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};