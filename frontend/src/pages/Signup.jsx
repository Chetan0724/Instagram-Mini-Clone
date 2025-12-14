import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import {
  signupSchema,
  validateFileSize,
  validateFileType,
} from "../lib/validators";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../api/endpoints";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const Signup = () => {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const username = watch("username");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      setCheckingUsername(true);
      try {
        await authAPI.checkUsername(username);
        setUsernameAvailable(true);
      } catch (error) {
        if (error.response?.status === 409) {
          setUsernameAvailable(false);
        }
      } finally {
        setCheckingUsername(false);
      }
    };

    const timer = setTimeout(checkUsername, 500);
    return () => clearTimeout(timer);
  }, [username]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateFileType(file)) {
      toast.error("Only JPG, PNG, and WEBP images are allowed");
      return;
    }

    if (!validateFileSize(file)) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data) => {
    if (usernameAvailable === false) {
      toast.error("Username is already taken");
      return;
    }

    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("fullName", data.fullName);
    if (data.bio) formData.append("bio", data.bio);
    if (imageFile) formData.append("profileImage", imageFile);

    const result = await signup(formData);
    if (result.success) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-sm w-full">
        <div className="bg-white border border-gray-300 rounded-lg p-8 mb-4">
          <h1 className="text-4xl font-semibold text-center mb-2">Instagram</h1>
          <p className="text-center text-gray-500 text-sm mb-6">
            Sign up to see photos from your friends.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="flex justify-center mb-4">
              <label className="cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera size={32} className="text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <input
                {...register("username")}
                type="text"
                placeholder="Username"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm focus:outline-none focus:border-gray-400"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.username.message}
                </p>
              )}
              {!errors.username && username && username.length >= 3 && (
                <p
                  className={`text-xs mt-1 ${
                    usernameAvailable === true
                      ? "text-green-500"
                      : usernameAvailable === false
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {checkingUsername
                    ? "Checking..."
                    : usernameAvailable === true
                    ? "Username available"
                    : usernameAvailable === false
                    ? "Username taken"
                    : ""}
                </p>
              )}
            </div>

            <div>
              <input
                {...register("email")}
                type="email"
                placeholder="Email"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm focus:outline-none focus:border-gray-400"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <input
                {...register("fullName")}
                type="text"
                placeholder="Full Name"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm focus:outline-none focus:border-gray-400"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <input
                {...register("password")}
                type="password"
                placeholder="Password"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm focus:outline-none focus:border-gray-400"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <textarea
                {...register("bio")}
                placeholder="Bio (optional)"
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm focus:outline-none focus:border-gray-400 resize-none"
              />
              {errors.bio && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.bio.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || usernameAvailable === false}
              className="w-full bg-blue-600 cursor-pointer hover:bg-blue-500 text-white font-semibold py-2 rounded-lg disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : "Sign up"}
            </button>
          </form>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-5 text-center text-sm">
          Have an account?{" "}
          <Link to="/login" className="text-primary font-semibold">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
