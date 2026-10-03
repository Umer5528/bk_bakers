import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import BrandLogo from "../../components/common/BrandLogo";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const AdminLogin = () => {
  useDocumentTitle("Admin Sign In");
  const { login } = useAuth();
  const navigate = useNavigate();
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
      if (user.role !== "admin" && user.role !== "superadmin") {
        toast.error("This account does not have admin access");
        return;
      }
      toast.success("Welcome back!");
      navigate("/admin");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-berry-800 px-5 sm:px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="rounded-full bg-white/95 p-2 shadow-lift">
          <BrandLogo size={56} />
        </div>
        <h1 className="mt-4 flex items-center gap-2 font-display text-2xl font-semibold text-white">
          <ShieldCheck className="h-5 w-5 text-rose-300" /> Admin Sign In
        </h1>
        <p className="mt-1 text-sm text-blush-100/70">Business management access only.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
        <div>
          <input
            type="email"
            className="input-field"
            placeholder="Admin Email"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>

        <div>
          <input
            type="password"
            className="input-field"
            placeholder="Password"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary touch-target w-full">
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
