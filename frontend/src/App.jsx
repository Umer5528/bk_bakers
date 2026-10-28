import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { OrderDraftProvider } from "./context/OrderDraftContext";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminRoute from "./components/common/AdminRoute";
import LoadingScreen from "./components/common/LoadingScreen";

import Home from "./pages/customer/Home";
import Shop from "./pages/customer/Shop";
import CategoryPage from "./pages/customer/CategoryPage";
import ProductDetails from "./pages/customer/ProductDetails";
import Checkout from "./pages/customer/Checkout";
import CustomCake from "./pages/customer/CustomCake";
import MyOrders from "./pages/customer/MyOrders";
import OrderDetails from "./pages/customer/OrderDetails";
import Profile from "./pages/customer/Profile";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import AdminLogin from "./pages/auth/AdminLogin";
import NotFound from "./pages/NotFound";

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetail"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminCustomRequests = lazy(() => import("./pages/admin/AdminCustomRequests"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const AdminGallery = lazy(() => import("./pages/admin/AdminGallery"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminPaymentAccounts = lazy(() => import("./pages/admin/AdminPaymentAccounts"));
const AdminTimeSlots = lazy(() => import("./pages/admin/AdminTimeSlots"));
const AdminAvailability = lazy(() => import("./pages/admin/AdminAvailability"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

const AdminPage = ({ children }) => (
  <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
);

function App() {
  return (
    <AuthProvider>
      <OrderDraftProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: "12px",
              background: "#3A271C",
              color: "#FFFDF9",
              fontSize: "14px",
            },
          }}
        />
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminPage><AdminDashboard /></AdminPage>} />
              <Route path="orders" element={<AdminPage><AdminOrders /></AdminPage>} />
              <Route path="orders/:orderNumber" element={<AdminPage><AdminOrderDetail /></AdminPage>} />
              <Route path="products" element={<AdminPage><AdminProducts /></AdminPage>} />
              <Route path="categories" element={<AdminPage><AdminCategories /></AdminPage>} />
              <Route path="custom-requests" element={<AdminPage><AdminCustomRequests /></AdminPage>} />
              <Route path="reviews" element={<AdminPage><AdminReviews /></AdminPage>} />
              <Route path="gallery" element={<AdminPage><AdminGallery /></AdminPage>} />
              <Route path="customers" element={<AdminPage><AdminCustomers /></AdminPage>} />
              <Route path="payment-accounts" element={<AdminPage><AdminPaymentAccounts /></AdminPage>} />
              <Route path="time-slots" element={<AdminPage><AdminTimeSlots /></AdminPage>} />
              <Route path="availability" element={<AdminPage><AdminAvailability /></AdminPage>} />
              <Route path="settings" element={<AdminPage><AdminSettings /></AdminPage>} />
            </Route>
          </Route>

          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductDetails />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/custom-cake" element={<CustomCake />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/orders/:orderNumber" element={<OrderDetails />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </OrderDraftProvider>
    </AuthProvider>
  );
}

export default App;
