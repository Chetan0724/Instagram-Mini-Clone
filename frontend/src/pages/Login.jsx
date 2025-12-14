import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../lib/validators";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result.success) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm w-full">
        <div className="bg-white border border-gray-300 rounded-lg p-8 mb-4">
          <h1 className="text-4xl font-semibold text-center mb-8">Instagram</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <input
                {...register("emailOrUsername")}
                type="text"
                placeholder="Username or email"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm focus:outline-none focus:border-gray-400"
              />
              {errors.emailOrUsername && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.emailOrUsername.message}
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 cursor-pointer hover:bg-blue-500 text-white font-semibold py-2 rounded-lg disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : "Log in"}
            </button>
          </form>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-5 text-center text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-semibold">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
