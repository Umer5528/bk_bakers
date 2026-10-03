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

// The admin panel is a large, separate part of the app that only admins
// ever load — code-splitting it keeps the customer-facing bundle (the
// part every visitor pays for) small, and defers the admin panel's
// weight to the moment it's actually needed.
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
              <Route
                index
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <AdminDashboard />
                  </Suspense>
                }
              />
              <Route
                path="orders"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <AdminOrders />
                  </Suspense>
                }
              />
              <Route
                path="orders/:orderNumber"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <AdminOrderDetail />
                  </Suspense>
                }
              />
              <Route
                path="products"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <AdminProducts />
                  </Suspense>
                }
              />
              <Route
                path="categories"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <AdminCategories />
                  </Suspense>
                }
              />
              <Route
                path="custom-requests"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <AdminCustomRequests />
                  </Suspense>
                }
              />
              <Route
                path="reviews"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <AdminReviews />
                  </Suspense>
                }
              />
              <Route
                path="gallery"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <AdminGallery />
                  </Suspense>
                }
              />
              <Route
                path="customers"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <AdminCustomers />
                  </Suspense>
                }
              />
              <Route
                path="payment-accounts"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <AdminPaymentAccounts />
                  </Suspense>
                }
              />
              <Route
                path="time-slots"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <AdminTimeSlots />
                  </Suspense>
                }
              />
              <Route
                path="availability"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <AdminAvailability />
                  </Suspense>
                }
              />
              <Route
                path="settings"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <AdminSettings />
                  </Suspense>
                }
              />
            </Route>
          </Route>

          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductDetails />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/custom-cake" element={<CustomCake />} />
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
