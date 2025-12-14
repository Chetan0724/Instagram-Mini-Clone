import { Link, useLocation } from "react-router";
import { Home, PlusSquare } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 z-50">
      <div className="flex items-center justify-around h-12">
        <Link
          to="/"
          className={`p-2 ${isActive("/") ? "text-black" : "text-gray-500"}`}
        >
          <Home size={24} fill={isActive("/") ? "currentColor" : "none"} />
        </Link>

        <Link
          to="/create"
          className={`p-2 ${
            isActive("/create") ? "text-black" : "text-gray-500"
          }`}
        >
          <PlusSquare size={24} />
        </Link>

        <Link to={`/${user?.username}`} className="p-2">
          <div
            className={`w-6 h-6 rounded-full overflow-hidden border-2 ${
              isActive(`/${user?.username}`)
                ? "border-black"
                : "border-gray-300"
            }`}
          >
            <img
              src={
                user?.profileImage ||
                `https://ui-avatars.com/api/?name=${user?.fullName}`
              }
              alt={user?.username}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;
