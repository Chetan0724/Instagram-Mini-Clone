import { useState, useEffect, useCallback } from "react";
import { X, Search as SearchIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { userAPI } from "../api/endpoints";
import { debounce } from "../lib/utils";
import LoadingSpinner from "./LoadingSpinner";

const SearchModal = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const searchUsers = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const { data } = await userAPI.searchUsers(searchQuery);
        setUsers(data.data.users);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    searchUsers(query);
  }, [query, searchUsers]);

  const handleUserClick = (username) => {
    navigate(`/${username}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Search</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <SearchIcon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : users.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {users.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleUserClick(user.username)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50"
                >
                  <img
                    src={
                      user.profileImage ||
                      `https://ui-avatars.com/api/?name=${user.fullName}`
                    }
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{user.username}</div>
                    <div className="text-sm text-gray-500">{user.fullName}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="text-center py-8 text-gray-500">No users found</div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Search for users by username
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
