import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { UserPlusIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import addFriendSchema from "@/utils/addFriendValidator";
import Spinner from "./Spinner";

export default function AddFriendPopup({
  showFriendPopup,
  setShowFriendPopup,
  editMode = false,
  friendToEdit = null,
  onFriendAdded,
}) {
  const [name, setName] = useState("");
  const [leetcode, setLeetcode] = useState("");
  const [addInProgress, setAddInProgress] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const modalRef = useRef(null);
  const initialFocusRef = useRef(null);
  const { data: session } = useSession();

  // Set form values when editing
  useEffect(() => {
    if (editMode && friendToEdit) {
      setName(friendToEdit.name || "");
      setLeetcode(friendToEdit.leetcode || "");
    } else {
      setName("");
      setLeetcode("");
    }
  }, [editMode, friendToEdit]);

  // Focus the first input when modal opens
  useEffect(() => {
    if (showFriendPopup && initialFocusRef.current) {
      initialFocusRef.current.focus();
    }
  }, [showFriendPopup]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && showFriendPopup) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showFriendPopup]);

  const extractUsername = (url) => {
    // If input is just a username (no URL)
    if (
      !url.includes("leetcode.com") &&
      !url.includes("/") &&
      url.trim().length > 0
    ) {
      return url.trim();
    }

    // Handle various URL formats
    const patterns = [
      /https?:\/\/(?:www\.)?leetcode\.com\/([^/]+)\/?$/, // https://leetcode.com/username/
      /https?:\/\/(?:www\.)?leetcode\.com\/u\/([^/]+)\/?$/, // https://leetcode.com/u/username/
      /(?:www\.)?leetcode\.com\/([^/]+)\/?$/, // leetcode.com/username/
      /(?:www\.)?leetcode\.com\/u\/([^/]+)\/?$/, // leetcode.com/u/username/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  const closeModal = () => {
    setShowFriendPopup(false);
    // Reset form state when closing
    setError("");
    setFieldErrors({});
  };

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeModal();
    }
  };

  const validateFields = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = "Name is required";
    }

    if (!leetcode.trim()) {
      errors.leetcode = "LeetCode username or URL is required";
    } else if (!extractUsername(leetcode)) {
      errors.leetcode = "Invalid LeetCode username or URL format";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) {
      return;
    }

    setAddInProgress(true);

    try {
      // Extract username for validation
      const username = extractUsername(leetcode);

      // Normalize the LeetCode URL
      const normalizedLeetcodeUrl = `https://leetcode.com/${username}`;

      const friend = { name, leetcode: normalizedLeetcodeUrl };

      const { email } = session.user;

      try {
        if (editMode && friendToEdit) {
          // In edit mode, we need to delete the old entry first, then add the updated one
          await axios.delete(
            `/api/user/${email}?leetcode=${friendToEdit.leetcode}`
          );
        }

        // Add the friend (both for new and after deletion for edit)
        const res = await axios.put(`/api/user/${email}`, {
          friend: friend,
        });

        if (res.status === 404) {
          setError({ message: res.data });
          setAddInProgress(false);
          return;
        }
      } catch (apiError) {
        // Handle case for "already exist" only if we're not in edit mode
        if (
          !editMode &&
          apiError.response?.data &&
          typeof apiError.response.data === "string" &&
          apiError.response.data.toLowerCase().includes("already exist")
        ) {
          // Continue with getting stats, but show a warning
          setError({
            message:
              "Note: This friend was previously added. Refreshing their stats.",
          });
        } else {
          // For other errors, stop processing
          throw apiError;
        }
      }

      // Attempt to get stats regardless of whether the user was just added or already existed
      try {
        const { data: stats } = await axios.get(
          `/api/stats/leetcode/${username}`
        );

        // Create updated friend object with stats
        const updatedFriend = { ...friend, ...stats };

        // Don't modify session storage directly - let parent component handle it
        // Instead, just pass the updated friend to the callback

        // If we have a callback for friend added/edited, call it
        if (typeof onFriendAdded === "function") {
          // Pass the updated friend and edit flag
          onFriendAdded(updatedFriend, editMode);
        }

        // Close the modal after successful update
        setTimeout(() => closeModal(), 1500);
      } catch (statsError) {
        setError({
          message:
            "Could not fetch LeetCode statistics for this user. Please verify the username.",
        });
        setAddInProgress(false);
        return;
      }
    } catch (err) {
      const msg = err.response?.data ? err.response.data : err.message;
      if (typeof msg === "string") setError({ message: msg });
      else setError({ message: "Something went wrong" });
      console.error("Error adding friend:", err);
      setAddInProgress(false);
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (fieldErrors.name) {
      setFieldErrors({ ...fieldErrors, name: "" });
    }
    setError("");
  };

  const handleLeetcodeChange = (e) => {
    setLeetcode(e.target.value);
    if (fieldErrors.leetcode) {
      setFieldErrors({ ...fieldErrors, leetcode: "" });
    }
    setError("");
  };

  if (!showFriendPopup) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto flex justify-center items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 transition-opacity"
        onClick={handleOutsideClick}
        aria-hidden="true"
      ></div>

      {/* Modal content */}
      <div
        className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-lg shadow-2xl p-6 m-4 transform transition-all z-10"
        ref={modalRef}
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            id="modal-title"
            className="text-xl font-bold text-gray-800 dark:text-white"
          >
            {editMode ? "Edit Friend" : "Add Friend"}
          </h2>
          <button
            type="button"
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              ref={initialFocusRef}
              className={`w-full px-4 py-2 border rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.name
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              value={name}
              onChange={handleNameChange}
              placeholder="Enter friend's name"
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
            />
            {fieldErrors.name && (
              <p id="name-error" className="mt-1 text-sm text-red-500">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="mb-5">
            <label
              htmlFor="leetcode"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              LeetCode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="leetcode"
              className={`w-full px-4 py-2 border rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fieldErrors.leetcode
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              value={leetcode}
              onChange={handleLeetcodeChange}
              placeholder="Username or URL (e.g., username or leetcode.com/username)"
              aria-invalid={!!fieldErrors.leetcode}
              aria-describedby={
                fieldErrors.leetcode ? "leetcode-error" : undefined
              }
            />
            {fieldErrors.leetcode && (
              <p id="leetcode-error" className="mt-1 text-sm text-red-500">
                {fieldErrors.leetcode}
              </p>
            )}
          </div>

          {error && (
            <div
              className="mb-5 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
              role="alert"
            >
              <p>{error.message}</p>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 mr-3 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              disabled={addInProgress}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`inline-flex items-center px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white font-medium transition-colors ${
                addInProgress ? "opacity-75 cursor-not-allowed" : ""
              }`}
              disabled={addInProgress}
            >
              {editMode ? (
                <>
                  <PencilSquareIcon className="w-5 h-5 mr-2" />
                  <span>Update Friend</span>
                </>
              ) : (
                <>
                  <UserPlusIcon className="w-5 h-5 mr-2" />
                  <span>Add Friend</span>
                </>
              )}
              {addInProgress && (
                <div className="ml-2">
                  <Spinner />
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
