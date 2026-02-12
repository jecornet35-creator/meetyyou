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
import AdminDashboard from './pages/AdminDashboard';
import AdminSubscriptions from './pages/AdminSubscriptions';
import AdminTickets from './pages/AdminTickets';
import NotificationSettings from './pages/NotificationSettings';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import EditProfile from './pages/EditProfile';
import AdminReports from './pages/AdminReports';
import AdminUsers from './pages/AdminUsers';
import Activities from './pages/Activities';
import Home from './pages/Home';
import ProfileDetail from './pages/ProfileDetail';
import Landing from './pages/Landing';
import Correspondances from './pages/Correspondances';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "AdminSubscriptions": AdminSubscriptions,
    "AdminTickets": AdminTickets,
    "NotificationSettings": NotificationSettings,
    "Notifications": Notifications,
    "Messages": Messages,
    "EditProfile": EditProfile,
    "AdminReports": AdminReports,
    "AdminUsers": AdminUsers,
    "Activities": Activities,
    "Home": Home,
    "ProfileDetail": ProfileDetail,
    "Landing": Landing,
    "Correspondances": Correspondances,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};