import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Cake, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const Register = () => {
  useDocumentTitle("Create Account");
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const sameAsPhone = watch("isWhatsappSameAsPhone");

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await signUp(values);
      toast.success("Welcome! Your account has been created.");
      navigate("/");
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
          <h1 className="mt-4 font-display text-3xl font-semibold text-berry-500">Create Your Account</h1>
          <p className="mt-1 text-sm text-mauve-500">Join us to order your favorite cakes and treats.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6 sm:p-7">
          <div>
            <label className="field-label">Full Name</label>
            <input
              className="input-field"
              placeholder="Jane Doe"
              {...register("name", { required: "Full name is required" })}
            />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>

          <div>
            <label className="field-label">Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              })}
            />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>

          <div>
            <label className="field-label">Phone Number</label>
            <input
              className="input-field"
              placeholder="03XX XXXXXXX"
              {...register("phone", { required: "Phone number is required" })}
            />
            {errors.phone && <p className="field-error">{errors.phone.message}</p>}
          </div>

          <label className="flex items-center gap-2 text-sm text-berry-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-berry-500/20 text-rose-500 focus:ring-rose-300"
              {...register("isWhatsappSameAsPhone")}
            />
            My phone number is also my WhatsApp number
          </label>

          {!sameAsPhone && (
            <div>
              <label className="field-label">WhatsApp Number (optional)</label>
              <input className="input-field" placeholder="03XX XXXXXXX" {...register("whatsapp")} />
            </div>
          )}

          <div>
            <label className="field-label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input-field pr-10"
                placeholder="At least 8 characters"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "At least 8 characters" },
                })}
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
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-mauve-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-rose-600">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
