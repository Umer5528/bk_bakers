import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Cake, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const Login = () => {
  useDocumentTitle("Log In");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ email, password }) => {
    setSubmitting(true);
    try {
      const { user } = await login(email, password);
      toast.success("Welcome back!");

      // An admin or superadmin logging in through the regular customer
      // page still belongs in the Admin Panel — this is the only login
      // form most admins will ever find, since nothing on the public
      // site links to /admin/login. A customer's own intended
      // destination (e.g. "log in to finish checkout") is preserved
      // exactly as before.
      if (user.role === "admin" || user.role === "superadmin") {
        navigate("/admin");
      } else {
        navigate(location.state?.from?.pathname || "/");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-blush-50 px-5 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-soft">
            <Cake className="h-6 w-6 text-rose-500" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold text-berry-500">Welcome Back</h1>
          <p className="mt-1 text-sm text-mauve-500">Log in to order and track your cakes.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6 sm:p-7">
          <div>
            <label className="field-label">Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>

          <div>
            <label className="field-label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input-field pr-10"
                placeholder="••••••••"
                {...register("password", { required: "Password is required" })}
              />
              <button
                type="button"
                className="btn-icon touch-target absolute right-1 top-1/2 !h-8 !w-8 -translate-y-1/2"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary touch-target w-full">
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-mauve-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-rose-600">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
