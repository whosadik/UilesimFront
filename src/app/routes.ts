import { createBrowserRouter } from "react-router";
import Root from "./Root";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import BrandsPage from "./pages/BrandsPage";
import BrandPage from "./pages/BrandPage";
import NewArrivalsPage from "./pages/NewArrivalsPage";
import PromotionsPage from "./pages/PromotionsPage";
import PromotionDetailPage from "./pages/PromotionDetailPage";
import ForYouPage from "./pages/ForYouPage";
import StoresPage from "./pages/StoresPage";
import GiftCardsPage from "./pages/GiftCardsPage";
import SalePage from "./pages/SalePage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import VerifyEmailPendingPage from "./pages/VerifyEmailPendingPage";
import SearchPage from "./pages/SearchPage";
import WishlistPage from "./pages/WishlistPage";
import TransactionsPage from "./pages/TransactionsPage";
import OwnedProductsPage from "./pages/OwnedProductsPage";
import RoadmapPage from "./pages/RoadmapPage";
import RoutinePage from "./pages/RoutinePage";
import RoutineHistoryPage from "./pages/RoutineHistoryPage";
import ServerErrorPage from "./pages/ServerErrorPage";
import RateLimitPage from "./pages/RateLimitPage";
import SessionExpiredPage from "./pages/SessionExpiredPage";
import NetworkErrorPage from "./pages/NetworkErrorPage";
import HelpPage from "./pages/HelpPage";
import DeliveryReturnsPage from "./pages/DeliveryReturnsPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import AboutPage from "./pages/AboutPage";
import AdminRoot from "./pages/admin/AdminRoot";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminMetricsPage from "./pages/admin/AdminMetricsPage";
import AdminExperimentsPage from "./pages/admin/AdminExperimentsPage";
import AdminAuditPage from "./pages/admin/AdminAuditPage";
import AdminCampaignsPage from "./pages/admin/AdminCampaignsPage";
import AdminCampaignDetailPage from "./pages/admin/AdminCampaignDetailPage";
import AdminCachePage from "./pages/admin/AdminCachePage";
import AdminHealthPage from "./pages/admin/AdminHealthPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "catalog", Component: CatalogPage },
      { path: "brands", Component: BrandsPage },
      { path: "brands/:brand", Component: BrandPage },
      { path: "new", Component: NewArrivalsPage },
      { path: "promotions", Component: PromotionsPage },
      { path: "promotions/:id", Component: PromotionDetailPage },
      { path: "for-you", Component: ForYouPage },
      { path: "stores", Component: StoresPage },
      { path: "gift-cards", Component: GiftCardsPage },
      { path: "sale", Component: SalePage },
      { path: "product/:id", Component: ProductPage },
      { path: "cart", Component: CartPage },
      { path: "checkout", Component: CheckoutPage },
      { path: "login", Component: LoginPage },
      { path: "register", Component: RegisterPage },
      { path: "forgot-password", Component: ForgotPasswordPage },
      { path: "reset-password", Component: ResetPasswordPage },
      { path: "verify-email", Component: VerifyEmailPage },
      { path: "verify-email-pending", Component: VerifyEmailPendingPage },
      { path: "search", Component: SearchPage },
      { path: "wishlist", Component: WishlistPage },
      { path: "me", Component: ProfilePage },
      { path: "me/transactions", Component: TransactionsPage },
      { path: "me/owned", Component: OwnedProductsPage },
      { path: "me/roadmap", Component: RoadmapPage },
      { path: "me/routine", Component: RoutinePage },
      { path: "me/routine/history", Component: RoutineHistoryPage },
      { path: "help", Component: HelpPage },
      { path: "delivery-returns", Component: DeliveryReturnsPage },
      { path: "terms", Component: TermsPage },
      { path: "privacy", Component: PrivacyPage },
      { path: "about", Component: AboutPage },
      { path: "error/500", Component: ServerErrorPage },
      { path: "error/429", Component: RateLimitPage },
      { path: "error/session-expired", Component: SessionExpiredPage },
      { path: "error/network", Component: NetworkErrorPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
  {
    path: "/admin",
    Component: AdminRoot,
    children: [
      { index: true, Component: AdminOverviewPage },
      { path: "metrics", Component: AdminMetricsPage },
      { path: "experiments", Component: AdminExperimentsPage },
      { path: "audit", Component: AdminAuditPage },
      { path: "campaigns", Component: AdminCampaignsPage },
      { path: "campaigns/:id", Component: AdminCampaignDetailPage },
      { path: "campaigns/new", Component: AdminCampaignDetailPage },
      { path: "cache", Component: AdminCachePage },
      { path: "health", Component: AdminHealthPage },
    ],
  },
]);
