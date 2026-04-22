import React, { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
} from "../redux/user/userSlice";
import { Link } from "react-router-dom";

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();


  const [file, setFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    currentUser?.avatar || "/default-avatar.png"
  );
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListings, setShowListings] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [showListingsError, setShowingsError] = useState(false);
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

  const handleShowListings = async () => {
    try {
      const res = await fetch(`/api/user/listings/${currentUser._id}`, {
        headers: { "Cache-Control": "no-cache" },
      });

      const data = await res.json();

      if (data.success === false) {
        setShowingsError(true);
        return;
      }

      setUserListings(data.listings);
      setShowListings(true);
    } catch (error) {
      console.error(error);
      setShowingsError(true);
    }
  };

  // Auto-fetch listings on page load so they persist on refresh
  useEffect(() => {
    if (currentUser?._id) {
      handleShowListings();
    }
  }, [currentUser?._id]);

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
        setAvatarPreview(responseData.avatar);
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



  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error.message);
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

        {/* Update Button */}
        <button
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Update"}
        </button>

        <Link
          className="bg-green-700 text-white rounded-lg p-3 uppercase text-center hover:opacity-95 disabled:opacity-80"
          to={"/create-listing"}
        >
          Create Listing
        </Link>
      </form>

      {/* Actions */}
      <div className="flex justify-between mt-5">
        <span onClick={handleDeleteUser} className="text-red-700 cursor-pointer">
          Delete Account
        </span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
          Sign out
        </span>
      </div>

      {/* Messages */}
      <p className="text-red-700 mt-5">{error || ""}</p>
      <p className="text-green-700 mt-5">
        {updateSuccess ? "User updated successfully!" : ""}
      </p>

      {/* Show Listings Button */}
      <button
        onClick={handleShowListings}
        className="text-green-700 w-full mt-4 font-semibold underline hover:opacity-80"
      >
        Show Listings
      </button>
      <p className="text-red-700 mt-2">
        {showListingsError ? "Error showing listings" : ""}
      </p>

      {/* Listings Section */}
      {userListings && userListings.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-center mb-4 text-slate-700">
            Your Listings ({userListings.length})
          </h2>

          <div className="flex flex-col gap-6">
            {userListings.map((listing) => (
              <div
                key={listing._id}
                className="border rounded-xl shadow-md bg-white overflow-hidden"
              >
                {/* Image Gallery - Vertical Column */}
                {listing.imageUrls && listing.imageUrls.length > 0 && (
                  <div className="flex flex-col gap-2 p-3 bg-gray-50 border-b">
                    {listing.imageUrls.map((url, i) => (
                      <Link
                        key={i}
                        to={`/listing/${listing._id}`}
                        className="block w-full"
                      >
                        <img
                          src={url}
                          alt={`${listing.name} image ${i + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm hover:opacity-90 transition-opacity"
                        />
                      </Link>
                    ))}
                  </div>
                )}

                {/* Listing Details */}
                <div className="p-4 flex flex-col gap-2">
                  {/* Title & Date Row */}
                  <div className="flex justify-between items-start">
                    <Link
                      to={`/listing/${listing._id}`}
                      className="text-slate-800 font-bold text-lg hover:underline truncate flex-1 mr-2"
                    >
                      {listing.name}
                    </Link>
                    <span className="text-xs text-gray-400 whitespace-nowrap mt-1">
                      {listing.createdAt
                        ? new Date(listing.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )
                        : "N/A"}
                    </span>
                  </div>

                  {/* Address */}
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    {listing.address}
                  </p>

                  {/* Description */}
                  {listing.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {listing.description}
                    </p>
                  )}

                  {/* Details Badges */}
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-1 rounded-full">
                      {listing.bedrooms} Beds
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-1 rounded-full">
                      {listing.bathrooms} Baths
                    </span>
                    <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full uppercase">
                      {listing.type}
                    </span>
                    {listing.parking && (
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                        Parking
                      </span>
                    )}
                    {listing.furnished && (
                      <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full">
                        Furnished
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-slate-800 font-bold text-base">
                      $
                      {listing.offer
                        ? listing.discountPrice?.toLocaleString()
                        : listing.regularPrice?.toLocaleString()}
                      {listing.type === "rent" && (
                        <span className="text-sm font-normal text-gray-500">
                          {" "}
                          / month
                        </span>
                      )}
                    </p>
                    {listing.offer && (
                      <p className="text-xs text-gray-400 line-through">
                        ${listing.regularPrice?.toLocaleString()}
                      </p>
                    )}
                    {listing.offer && (
                      <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                        OFFER
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-3 pt-3 border-t">
                    <Link
                      to={`/update-listing/${listing._id}`}
                      className="flex-1"
                    >
                      <button className="w-full text-sm font-semibold text-green-700 border border-green-600 rounded-lg py-2 hover:bg-green-50 transition-colors uppercase">
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => handleListingDelete(listing._id)}
                      className="flex-1 text-sm font-semibold text-red-600 border border-red-500 rounded-lg py-2 hover:bg-red-50 transition-colors uppercase"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
