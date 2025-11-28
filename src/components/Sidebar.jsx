import { X, User, Settings, Phone, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/authActions";

function Sidebar({ isOpen, setIsOpen }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { label: "Profile", icon: User, route: "/profile" },
    { label: "Settings", icon: Settings, route: "/settings" },
    { label: "Contacts", icon: Phone, route: "/contacts" },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 w-72 h-full bg-white dark:bg-gray-900 p-6 z-50 shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white">Menu</h2>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="w-6 dark:text-gray-300" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-4 mb-8">
            <img
              src={user.photoURL || "/placeholder.jpg"}
              alt="user"
              className="w-12 h-12 rounded-full border border-blue-500"
            />
            <div>
              <p className="text-gray-900 dark:text-white font-semibold">
                {user.displayName || "User"}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>
        )}

        {/* Menu List */}
        <div className="space-y-2">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                navigate(item.route);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-4 p-3 rounded-lg text-left 
                hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
            >
              <item.icon className="w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-500 font-medium">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => logoutUser(navigate)}
          className="mt-10 flex items-center gap-3 justify-center w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg"
        >
          <LogOut /> Logout
        </button>
      </div>
    </>
  );
}

export default Sidebar;
