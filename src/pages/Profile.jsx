import { User, Mail, MapPin, Calendar, Phone, ArrowLeft, Edit, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

function Profile() {
  const navigate = useNavigate();
  const { user: firebaseUser } = useAuth(); // 🔥 Firebase user

  const [editMode, setEditMode] = useState(false);

  const [user, setUser] = useState({
    name: "",
    email: "",
    gender: "",
    phone: "",
    address: "",
    dob: "",
    age: "",
  });

  // Load profile (Firebase → LocalStorage → Default)
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("userProfile"));

    if (saved) {
      setUser(saved);
    } else if (firebaseUser) {
      setUser({
        name: firebaseUser.displayName || "",
        email: firebaseUser.email || "",
        phone: "",
        address: "",
        dob: "",
        age: "",
        gender: "",
      });
    }
  }, [firebaseUser]);

  const updateField = (field, value) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  const saveProfile = () => {
    localStorage.setItem("userProfile", JSON.stringify(user));
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="max-w-3xl mx-auto mt-6 bg-white dark:bg-gray-800 rounded-2xl p-10 shadow-xl">

        {/* Top Section */}
        <div className="flex items-center justify-between border-b pb-6">
          
          <div className="flex items-center gap-6">
            <img
              src={firebaseUser?.photoURL || "/placeholder.jpg"}
              alt="user"
              className="w-24 h-24 rounded-full border-4 border-blue-500 object-cover"
            />

            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                {editMode ? "Edit Profile" : "Your Profile"}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {user.gender || "Not set"} • {user.age || "N/A"} yrs
              </p>
            </div>
          </div>

          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Edit size={18} /> Edit
            </button>
          ) : (
            <button
              onClick={saveProfile}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Save size={18} /> Save
            </button>
          )}
        </div>

        {/* Editable Content */}
        <div className="mt-8 space-y-6">
          <DetailField label="Name" value={user.name} editable={editMode} onChange={(v) => updateField("name", v)} icon={<User />} />
          <DetailField label="Email" value={user.email} editable={false} icon={<Mail />} />
          <DetailField label="Phone" value={user.phone} editable={editMode} onChange={(v) => updateField("phone", v)} icon={<Phone />} />
          <DetailField label="Address" value={user.address} editable={editMode} onChange={(v) => updateField("address", v)} icon={<MapPin />} />
          <DetailField label="Date of Birth" value={user.dob} editable={editMode} onChange={(v) => updateField("dob", v)} icon={<Calendar />} />

          {/* Age + Gender */}
          <div className="flex gap-6">
            <DetailField label="Age" value={user.age} editable={editMode} onChange={(v) => updateField("age", v)} />
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Gender</p>
              {!editMode ? (
                <p className="text-gray-800 dark:text-white">{user.gender || "Not set"}</p>
              ) : (
                <select
                  className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={user.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Component
function DetailField({ label, value, editable, onChange, icon }) {
  return (
    <div className="flex items-start gap-4">
      {icon && <div className="text-blue-500">{icon}</div>}
      <div className="flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        {!editable ? (
          <p className="font-semibold text-gray-800 dark:text-white">{value || "Not set"}</p>
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 mt-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        )}
      </div>
    </div>
  );
}

export default Profile;
