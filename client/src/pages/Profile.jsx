import React, { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart
} from "../redux/user/userSlice";

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [file, setFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    currentUser?.avatar || "/default-avatar.png"
  );
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    password: "",
  });

  // Handle input change
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setAvatarPreview(previewUrl);
    }
  };

  // Cleanup image preview (avoid memory leak)
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateSuccess(false);

    try {
      dispatch(updateUserStart());

      const data = new FormData();
      data.append("username", formData.username);
      data.append("email", formData.email);

      if (formData.password) {
        data.append("password", formData.password);
      }

      if (file) {
        data.append("avatar", file);
      }

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        body: data,
      });

      const responseData = await res.json();

      if (!res.ok || responseData.success === false) {
        dispatch(updateUserFailure(responseData.message));
        alert("Update failed: " + responseData.message);
        return;
      }

      // ✅ FIXED HERE
      dispatch(updateUserSuccess(responseData));

      setUpdateSuccess(true);

      // Update avatar if backend sends it
      if (responseData.avatar) {
        setAvatarPreview(
          responseData.avatar.startsWith("/uploads")
            ? `http://localhost:5000${responseData.avatar}`
            : responseData.avatar
        );
      }

      // Reset password field
      setFormData((prev) => ({ ...prev, password: "" }));

      alert("Profile updated successfully!");
    } catch (err) {
      dispatch(updateUserFailure(err.message));
      console.error(err);
      alert("Update failed: " + err.message);
    }
  };
  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));


    } catch (error) {
      dispatch(deleteUserFailure(error.message))

    }

  }

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();

      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }

      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };


  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* File input */}
        <input
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* Avatar */}
        <img
          onClick={() => fileRef.current.click()}
          src={avatarPreview}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />

        {/* Username */}
        <input
          type="text"
          id="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
          className="border p-3 rounded-lg"
        />

        {/* Email */}
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="border p-3 rounded-lg"
        />

        {/* Password */}
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="New Password"
          className="border p-3 rounded-lg"
        />

        {/* Button */}
        <button
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Update"}
        </button>
      </form>

      {/* Actions */}
      <div className="flex justify-between mt-5">
        <span onClick={handleDeleteUser} className="text-red-700 cursor-pointer">Delete Account</span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">Sign out</span>
      </div>

      {/* Messages */}
      <p className="text-red-700 mt-5">{error || ""}</p>
      <p className="text-green-700 mt-5">
        {updateSuccess ? "User updated successfully!" : ""}
      </p>
    </div>
  );
}
