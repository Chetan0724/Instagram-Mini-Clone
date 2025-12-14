import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Search, PlusSquare, Menu, LogOut, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import SearchModal from "./SearchModal";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <header className="bg-white border-b border-gray-300 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="text-xl font-semibold">
              Instagram
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setShowSearchModal(true)}
                className="text-gray-700 hover:text-gray-900"
              >
                <Search size={24} />
              </button>
              <Link to="/create" className="text-gray-700 hover:text-gray-900">
                <PlusSquare size={24} />
              </Link>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-300"
                >
                  <img
                    src={
                      user?.profileImage ||
                      `https://ui-avatars.com/api/?name=${user?.fullName}`
                    }
                    alt={user?.username}
                    className="w-full h-full object-cover"
                  />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <Link
                      to={`/${user?.username}`}
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50"
                    >
                      <User size={18} />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowSearchModal(true)}
              className="md:hidden text-gray-700"
            >
              <Search size={24} />
            </button>
          </div>
        </div>
      </header>

      {showSearchModal && (
        <SearchModal onClose={() => setShowSearchModal(false)} />
      )}
    </>
  );
};

export default Header;
