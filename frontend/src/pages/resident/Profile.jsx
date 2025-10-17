import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import useAuthStore from "../../store/authStore";
import api from "../../services/api";

const Profile = () => {
  const { user: authUser, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [residentData, setResidentData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const prevImageUrlRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
    },
    // Resident specific fields
    householdSize: 1,
    propertyType: "house",
    specialRequirements: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/auth/me");
      const { user, residentProfile } = response.data.data;

      setUserData(user);
      setResidentData(residentProfile);

      // Update auth store with fresh user data including profileImage
      setUser(user);

      // Populate form data
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zipCode: user.address?.zipCode || "",
        },
        preferences: {
          emailNotifications: user.preferences?.emailNotifications ?? true,
          smsNotifications: user.preferences?.smsNotifications ?? true,
          pushNotifications: user.preferences?.pushNotifications ?? true,
        },
        householdSize: residentProfile?.householdSize || 1,
        propertyType: residentProfile?.propertyType || "house",
        specialRequirements: residentProfile?.specialRequirements || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else if (name.startsWith("preferences.")) {
      const prefField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefField]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      const response = await api.put("/auth/update-profile", formData);

      const { user, residentProfile } = response.data.data;
      setUserData(user);
      setResidentData(residentProfile);

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: {
          street: userData.address?.street || "",
          city: userData.address?.city || "",
          state: userData.address?.state || "",
          zipCode: userData.address?.zipCode || "",
        },
        preferences: {
          emailNotifications: userData.preferences?.emailNotifications ?? true,
          smsNotifications: userData.preferences?.smsNotifications ?? true,
          pushNotifications: userData.preferences?.pushNotifications ?? true,
        },
        householdSize: residentData?.householdSize || 1,
        propertyType: residentData?.propertyType || "house",
        specialRequirements: residentData?.specialRequirements || "",
      });
    }
    setImagePreview(null);
    setIsEditing(false);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Show preview using object URL (faster, less memory than base64 for large files)
    try {
      const objectUrl = URL.createObjectURL(file);
      // Revoke previous object URL if any
      if (prevImageUrlRef.current) {
        try {
          URL.revokeObjectURL(prevImageUrlRef.current);
        } catch (err) {
          /* ignore */
        }
      }
      prevImageUrlRef.current = objectUrl;
      setImagePreview(objectUrl);
    } catch (err) {
      // fallback to FileReader if createObjectURL fails
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }

    // Upload image
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await api.post("/auth/upload-profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { profileImage } = response.data.data;

      // Update local user data state
      const updatedUserData = { ...userData, profileImage };
      setUserData(updatedUserData);

      // Update auth store with the updated user data
      const updatedAuthUser = { ...authUser, profileImage };
      setUser(updatedAuthUser);

      toast.success("Profile image updated successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.response?.data?.message || "Failed to upload image");
      // revoke any created object url and clear preview
      if (prevImageUrlRef.current) {
        try {
          URL.revokeObjectURL(prevImageUrlRef.current);
        } catch (err) {
          /* ignore */
        }
        prevImageUrlRef.current = null;
      }
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const getProfileImageUrl = () => {
    if (imagePreview) return imagePreview;
    const pi = userData?.profileImage;
    if (!pi || pi === "default-avatar.png") return null;

    // Determine server origin from VITE_API_URL if available, fallback to localhost
    let serverOrigin = "http://localhost:5000";
    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
      serverOrigin = new URL(apiUrl).origin;
    } catch (err) {
      /* keep fallback */
    }

    // If backend returned full URL already, use it
    if (pi.startsWith("http://") || pi.startsWith("https://")) return pi;

    // Normalize: if it contains '/uploads/' but doesn't start with '/', ensure single slash
    if (pi.includes("/uploads/")) {
      const normalized = pi.startsWith("/") ? pi : `/${pi}`;
      return `${serverOrigin}${normalized}`;
    }

    // If it starts with '/', treat as absolute path
    if (pi.startsWith("/")) return `${serverOrigin}${pi}`;

    // If it's just a filename (no uploads segment), build path
    return `${serverOrigin}/uploads/profiles/${pi}`;
  };

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (prevImageUrlRef.current) {
        try {
          URL.revokeObjectURL(prevImageUrlRef.current);
        } catch (err) {
          /* ignore */
        }
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">
              Manage your account information
            </p>
          </div>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn-primary">
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div
                className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleImageClick}
              >
                {getProfileImageUrl() ? (
                  <img
                    src={getProfileImageUrl()}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-16 h-16"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleImageClick}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Change Profile Picture"}
            </button>
            <p className="text-xs text-gray-500">JPG, PNG or GIF (Max 5MB)</p>
          </div>

          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled={true}
                  className="input-field bg-gray-100 cursor-not-allowed"
                  title="Email cannot be changed"
                />
              </div>

              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input-field"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="label">Role</label>
                <input
                  type="text"
                  value={userData?.role?.replace("_", " ").toUpperCase()}
                  disabled={true}
                  className="input-field bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Street Address</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input-field"
                  placeholder="Enter your street address"
                />
              </div>

              <div>
                <label className="label">City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input-field"
                  placeholder="Enter Your City"
                />
              </div>

              <div>
                <label className="label">State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input-field"
                  placeholder="Enter your state"
                />
              </div>

              <div>
                <label className="label">Zip Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input-field"
                  placeholder="Enter your zip code"
                />
              </div>
            </div>
          </div>

          {/* Resident Specific Fields */}
          {userData?.role === "resident" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Household Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Household Size</label>
                  <input
                    type="number"
                    name="householdSize"
                    value={formData.householdSize}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input-field"
                    min="1"
                  />
                </div>

                <div>
                  <label className="label">Property Type</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input-field"
                  >
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="label">Special Requirements</label>
                  <textarea
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input-field"
                    rows="3"
                    placeholder="Any special waste collection requirements..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notification Preferences */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Notification Preferences
            </h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="preferences.emailNotifications"
                  checked={formData.preferences.emailNotifications}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-gray-700">Email Notifications</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="preferences.smsNotifications"
                  checked={formData.preferences.smsNotifications}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-gray-700">SMS Notifications</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="preferences.pushNotifications"
                  checked={formData.preferences.pushNotifications}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-gray-700">Push Notifications</span>
              </label>
            </div>
          </div>

          {/* Account Status */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Account Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <span className="text-gray-700">Status:</span>
                <span
                  className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                    userData?.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {userData?.status?.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center">
                <span className="text-gray-700">Email Verified:</span>
                <span
                  className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                    userData?.emailVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {userData?.emailVerified ? "Verified" : "Not Verified"}
                </span>
              </div>

              {userData?.lastLogin && (
                <div className="md:col-span-2">
                  <span className="text-gray-700">Last Login:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(userData.lastLogin).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Resident Stats */}
          {userData?.role === "resident" && residentData?.recyclingStats && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recycling Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">
                    Total Waste
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {residentData.recyclingStats.totalWasteGenerated} kg
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Recycled</p>
                  <p className="text-2xl font-bold text-green-900">
                    {residentData.recyclingStats.wasteRecycled} kg
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">
                    Recycling Rate
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {residentData.recyclingStats.recyclingRate}%
                  </p>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-sm text-emerald-600 font-medium">
                    CO2 Saved
                  </p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {residentData.recyclingStats.co2Saved} kg
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Gamification Stats */}
          {userData?.role === "resident" && residentData?.gamification && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-yellow-600 font-medium">Points</p>
                  <p className="text-3xl font-bold text-yellow-900">
                    {residentData.gamification.points}
                  </p>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-indigo-600 font-medium">Level</p>
                  <p className="text-3xl font-bold text-indigo-900">
                    {residentData.gamification.level}
                  </p>
                </div>

                <div className="bg-pink-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-pink-600 font-medium">Badges</p>
                  <p className="text-3xl font-bold text-pink-900">
                    {residentData.gamification.badges?.length || 0}
                  </p>
                </div>
              </div>

              {residentData.gamification.badges?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Earned Badges
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {residentData.gamification.badges.map((badge, index) => (
                      <div
                        key={index}
                        className="bg-white border-2 border-yellow-400 rounded-lg px-3 py-2"
                      >
                        <span className="text-2xl">{badge.icon}</span>
                        <p className="text-sm font-medium">{badge.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
