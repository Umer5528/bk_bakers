import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const Profile = () => {
  useDocumentTitle("My Profile");
  const { user, updateUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name,
      phone: user?.phone,
      whatsapp: user?.whatsapp || "",
    },
  });

  const {
    register: registerPw,
    handleSubmit: handlePwSubmit,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm();

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const { user: updated } = await authService.updateProfile(values);
      updateUser(updated);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const onChangePassword = async (values) => {
    setChangingPassword(true);
    try {
      await authService.changePassword(values);
      toast.success("Password updated");
      resetPw();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-5 py-10 sm:px-6 sm:py-12">
      <div className="mb-6 flex items-center gap-3.5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-300 font-display text-xl font-semibold text-white">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-berry-500">My Profile</h1>
          <p className="text-sm text-mauve-500">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
        <h2 className="text-sm font-semibold text-berry-600">Account Information</h2>
        <div>
          <label className="field-label">Full Name</label>
          <input className="input-field" {...register("name")} />
        </div>
        <div>
          <label className="field-label">Phone Number</label>
          <input className="input-field" {...register("phone")} />
        </div>
        <div>
          <label className="field-label">WhatsApp Number</label>
          <input className="input-field" {...register("whatsapp")} />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary touch-target">
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <form onSubmit={handlePwSubmit(onChangePassword)} className="card mt-5 space-y-4 p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-berry-600">
          <Lock className="h-4 w-4 text-rose-400" /> Change Password
        </h2>
        <div>
          <label className="field-label">Current Password</label>
          <input
            type="password"
            className="input-field"
            {...registerPw("currentPassword", { required: "Required" })}
          />
          {pwErrors.currentPassword && <p className="field-error">{pwErrors.currentPassword.message}</p>}
        </div>
        <div>
          <label className="field-label">New Password</label>
          <input
            type="password"
            className="input-field"
            {...registerPw("newPassword", {
              required: "Required",
              minLength: { value: 8, message: "At least 8 characters" },
            })}
          />
          {pwErrors.newPassword && <p className="field-error">{pwErrors.newPassword.message}</p>}
        </div>
        <button type="submit" disabled={changingPassword} className="btn-secondary touch-target">
          {changingPassword ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
