import React, { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { updateUser } from "../redux/user/userSlice";

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const backendUrl = "http://localhost:5000";
  const [file, setFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    currentUser.avatar?.startsWith("/uploads")
      ? `${backendUrl}${currentUser.avatar}`
      : currentUser.avatar
  );

  const [formData, setFormData] = useState({
    username: currentUser.username,
    email: currentUser.email,
    password: "",
  });

  // Handle input change
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // preview
    setAvatarPreview(URL.createObjectURL(selectedFile));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("username", formData.username);
      data.append("email", formData.email);
      if (formData.password) data.append("password", formData.password);
      if (file) data.append("avatar", file);

      const res = await axios.put(`${backendUrl}/api/user/${currentUser._id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // update redux and UI with persisted user
      dispatch(updateUser(res.data));
      if (res.data.avatar) {
        setAvatarPreview(
          res.data.avatar.startsWith("/uploads")
            ? `${backendUrl}${res.data.avatar}`
            : res.data.avatar
        );
      }
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
          onChange={handleFileChange}
        />

        <img
          onClick={() => fileRef.current.click()}
          src={avatarPreview}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />

        <input
          type="text"
          id="username"
          value={formData.username}
          onChange={handleChange}
          className="border p-3 rounded-lg"
        />

        <input
          type="text"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className="border p-3 rounded-lg"
        />

        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          className="border p-3 rounded-lg"
        />

        <button className="bg-slate-700 text-white rounded-lg p-3 uppercase">
          Update
        </button>
      </form>
    </div>
  );
}
