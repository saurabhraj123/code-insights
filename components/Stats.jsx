import React, { useEffect, useMemo, useState, useCallback } from "react";
import AddFriendPopup from "./AddFriendPopup";
import axios from "axios";
import { useSession } from "next-auth/react";
import { FaSort, FaSortUp, FaSortDown, FaChartLine } from "react-icons/fa6";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline"; // Add TrashIcon
import { CompareChart } from "./CompareChart";

// --- CSS (dragStyles) remains the same ---
const dragStyles = `
  .dragging-row {
    opacity: 0.6;
    background-color: #e5edff !important;
    cursor: grabbing !important;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 1000;
  }
  .drop-target {
    border-top: 2px solid #3b82f6;
  }
`;

// --- SkeletonRow remains the same ---
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-3 py-4 w-12 align-middle"></td>
    <td className="px-4 py-4 w-14 align-middle">
      <div className="h-4 w-6 bg-gray-200 rounded"></div>
    </td>
    <td className="px-6 py-4 align-middle">
      <div className="h-4 w-32 bg-gray-200 rounded"></div>
    </td>
    <td className="px-4 py-4 text-center align-middle">
      <div className="h-6 w-10 bg-gray-200 rounded-full inline-block"></div>
    </td>
    <td className="px-4 py-4 text-center align-middle">
      <div className="h-6 w-10 bg-gray-200 rounded-full inline-block"></div>
    </td>
    <td className="px-4 py-4 text-center align-middle">
      <div className="h-6 w-12 bg-gray-200 rounded-full inline-block"></div>
    </td>
  </tr>
);

export default function Stats() {
  // --- State ---
  const [expandedRow, setExpandedRow] = useState(null);
  const [showFriendPopup, setShowFriendPopup] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { data: session } = useSession();

  // Edit state
  const [editMode, setEditMode] = useState(false);
  const [friendToEdit, setFriendToEdit] = useState(null);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");

  // ***** NEW: Sorting State *****
  const [sortColumn, setSortColumn] = useState(null); // e.g., 'solvedToday', 'solvedCurrentWeek', 'totalSolved'
  const [sortDirection, setSortDirection] = useState("asc"); // 'asc' or 'desc'

  // Compare State
  const [showCompare, setShowCompare] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userToCompare, setUserToCompare] = useState(null);
  const [compareData, setCompareData] = useState(null);
  const [showCompareResults, setShowCompareResults] = useState(false);
  const [comparisonLoading, setComparisonLoading] = useState(false); // New loading state

  // Add state for bulk selection mode
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);

  // Update these constants
  const MAX_COMPARE_LIMIT = 5; // Maximum number of users that can be selected for comparison

  // Add state for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [friendToDelete, setFriendToDelete] = useState(null);

  // --- Callbacks (setupDragStyles, getStatsFromSessionStorage, isDataStale, updateFriendsInBackend, updateStats) ---
  // ... (These remain mostly unchanged) ...
  // Add drag styles to document
  const setupDragStyles = useCallback(() => {
    if (typeof window !== "undefined") {
      const existingStyle = document.getElementById("drag-drop-styles");
      if (!existingStyle) {
        const styleEl = document.createElement("style");
        styleEl.id = "drag-drop-styles";
        styleEl.textContent = dragStyles;
        document.head.appendChild(styleEl);
      }
    }
  }, []);

  useEffect(() => {
    setupDragStyles();
    return () => {
      if (typeof window !== "undefined") {
        const existingStyle = document.getElementById("drag-drop-styles");
        if (existingStyle) {
          try {
            document.head.removeChild(existingStyle);
          } catch (e) {
            /* Ignore */
          }
        }
      }
    };
  }, [setupDragStyles]);

  // Get friends from session storage
  const getStatsFromSessionStorage = useCallback(() => {
    // ... (implementation unchanged)
    if (typeof window === "undefined") return null;
    try {
      const storedFriends = sessionStorage.getItem("friends");
      if (storedFriends) {
        const data = JSON.parse(storedFriends);
        try {
          const storedData = JSON.parse(localStorage.getItem("friendsData"));
          if (storedData && storedData.timestamp) {
            setLastUpdated(new Date(storedData.timestamp));
          }
        } catch (e) {
          console.error("Failed to parse timestamp from localStorage:", e);
        }
        return data;
      }
      return null;
    } catch (e) {
      console.error("Failed to parse session storage data:", e);
      sessionStorage.removeItem("friends");
      return null;
    }
  }, []);

  // Check if data is stale
  const isDataStale = useCallback(() => {
    // ... (implementation unchanged)
    if (typeof window === "undefined") return true;
    try {
      const storedData = JSON.parse(localStorage.getItem("friendsData"));
      if (!storedData || !storedData.timestamp) return true;
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      return storedData.timestamp < oneHourAgo;
    } catch (e) {
      console.error("Failed to check data staleness:", e);
      return true;
    }
  }, []);

  // Update friends list in backend
  const updateFriendsInBackend = useCallback(
    async (updatedFriendsList) => {
      // ... (implementation unchanged)
      if (!session?.user?.email) return;
      try {
        const { email } = session.user;
        const friendsToSave = updatedFriendsList.map(({ name, leetcode }) => ({
          name,
          leetcode,
        }));
        await axios.put(`/api/user/${email}`, { friends: friendsToSave });
      } catch (err) {
        console.error("Error saving updated friends list to backend:", err);
      }
    },
    [session]
  );

  // Fetch stats for a list of friends
  const updateStats = useCallback(async (fetchedFriends, isRefreshing) => {
    // **No loading state changes here**
    try {
      if (!fetchedFriends || fetchedFriends.length === 0) return;
      const usernames = fetchedFriends
        .map((friend) => {
          /* ... url parsing ... */
          try {
            const url = new URL(friend.leetcode);
            const pathParts = url.pathname.split("/").filter(Boolean);
            return pathParts[0];
          } catch (e) {
            console.warn(
              `Invalid LeetCode URL for friend ${friend.name}: ${friend.leetcode}`
            );
            return null;
          }
        })
        .filter(Boolean);
      if (usernames.length === 0) {
        setFriends(fetchedFriends);
        return;
      }

      const { data: batchStats } = await axios.post("/api/stats/batch", {
        usernames,
        forceRefresh: isRefreshing,
      });
      const updatedFriends = fetchedFriends.map((friend) => {
        let username = null;
        try {
          const url = new URL(friend.leetcode);
          const pathParts = url.pathname.split("/").filter(Boolean);
          username = pathParts[0];
        } catch {
          /* Warned */
        }
        const stats = username ? batchStats[username] : null;
        return stats && !stats.error ? { ...friend, ...stats } : { ...friend };
      });

      setFriends(updatedFriends); // Update state with merged data
      const currentTime = new Date();
      setLastUpdated(currentTime);
      if (typeof window !== "undefined") {
        const dataWithTimestamp = {
          timestamp: currentTime.getTime(),
          friends: updatedFriends,
        };
        sessionStorage.setItem("friends", JSON.stringify(updatedFriends));
        localStorage.setItem("friendsData", JSON.stringify(dataWithTimestamp));
      }
    } catch (err) {
      console.error("Error updating stats:", err);
      setFriends(fetchedFriends);
    }
  }, []);

  // Add this new function to your existing Stats.jsx component
  // Place it near your other useCallback functions

  const ensureUserExists = useCallback(async () => {
    if (!session?.user?.email) return false;

    try {
      // Check if user exists in database
      const response = await axios.get("/api/auth/session-check");
      return true; // User exists or was just created
    } catch (error) {
      console.error("Error checking user session:", error);
      return false;
    }
  }, [session]);

  // Modify your getStats function to first check if user exists
  const getStats = useCallback(
    async (isManualRefresh = false) => {
      if (!session?.user?.email) {
        setLoading(false);
        setRefreshing(false);
        setFriends([]);
        return;
      }

      if (isManualRefresh) {
        setRefreshing(true);
        setLoading(false);
      } else {
        const cachedFriends = getStatsFromSessionStorage();
        if (!cachedFriends || cachedFriends.length === 0) {
          setLoading(true); // Initial load only
        } else if (isDataStale()) {
          setRefreshing(true); // Auto-refresh stale
          setFriends(cachedFriends);
        } else {
          setFriends(cachedFriends); // Valid cache
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      try {
        // Ensure user exists before fetching data
        const userExists = await ensureUserExists();

        const { email } = session.user;
        const { data } = await axios.get(`/api/user/${email}`);

        if (data.error) {
          console.error("Error fetching user data:", data.error);
          setFriends([]);
          setLoading(false);
          setRefreshing(false);
          return;
        }

        const friendsList = data.user.friends || [];
        if (friendsList.length > 0) {
          await updateStats(friendsList, isManualRefresh);
        } else {
          setFriends([]);
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("friends");
            localStorage.removeItem("friendsData");
          }
          setLastUpdated(null);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      session,
      getStatsFromSessionStorage,
      isDataStale,
      updateStats,
      ensureUserExists,
    ]
  );

  // Handle editing a friend
  const handleEditFriend = (friend, e) => {
    e.stopPropagation(); // Prevent row expansion when clicking edit
    setEditMode(true);
    setFriendToEdit(friend);
    setShowFriendPopup(true);
  };

  // Handle deleting a friend
  const handleDeleteFriend = (friend, e) => {
    e.stopPropagation(); // Prevent row expansion when clicking delete
    setFriendToDelete(friend);
    setShowDeleteConfirm(true);
  };

  // Confirm and perform deletion
  const confirmDeleteFriend = useCallback(async () => {
    if (!friendToDelete || !session?.user?.email) return;

    try {
      const { email } = session.user;

      // Delete the friend from backend
      await axios.delete(
        `/api/user/${email}?leetcode=${friendToDelete.leetcode}`
      );

      // Update the UI state by filtering out the deleted friend
      setFriends((prevFriends) =>
        prevFriends.filter(
          (friend) => friend.leetcode !== friendToDelete.leetcode
        )
      );

      // Also update session storage
      if (typeof window !== "undefined") {
        const storedFriends = JSON.parse(
          sessionStorage.getItem("friends") || "[]"
        );
        const updatedFriendsList = storedFriends.filter(
          (friend) => friend.leetcode !== friendToDelete.leetcode
        );

        sessionStorage.setItem("friends", JSON.stringify(updatedFriendsList));

        // Update localStorage timestamp
        try {
          const dataWithTimestamp = {
            timestamp: new Date().getTime(),
            friends: updatedFriendsList,
          };
          localStorage.setItem(
            "friendsData",
            JSON.stringify(dataWithTimestamp)
          );
        } catch (e) {
          console.error("Failed to update localStorage after deletion:", e);
        }
      }

      // Close the confirmation dialog
      setShowDeleteConfirm(false);
      setFriendToDelete(null);
    } catch (err) {
      console.error("Error deleting friend:", err);
      // Show error message (could add a toast notification system here)
    }
  }, [friendToDelete, session]);

  // Cancel deletion
  const cancelDeleteFriend = () => {
    setShowDeleteConfirm(false);
    setFriendToDelete(null);
  };

  // Handle friend popup close and refresh
  const handleFriendPopupClose = () => {
    setShowFriendPopup(false);
    setEditMode(false);
    setFriendToEdit(null);
  };

  // After a friend is added or edited
  const handleFriendUpdated = useCallback(
    (updatedFriend, isEdit = false) => {
      if (isEdit && updatedFriend) {
        // For edits, just update that specific friend in the list
        setFriends((prevFriends) =>
          prevFriends.map((friend) => {
            // Find the friend with the same leetcode URL (before edit) and replace it
            if (friend.leetcode === friendToEdit.leetcode) {
              return { ...friend, ...updatedFriend };
            }
            return friend;
          })
        );

        // Update session storage without changing order
        if (typeof window !== "undefined") {
          const storedFriends = JSON.parse(
            sessionStorage.getItem("friends") || "[]"
          );
          const updatedFriendsList = storedFriends.map((friend) => {
            if (friend.leetcode === friendToEdit.leetcode) {
              return { ...friend, ...updatedFriend };
            }
            return friend;
          });

          sessionStorage.setItem("friends", JSON.stringify(updatedFriendsList));
          updateLocalStorageTimestamp(updatedFriendsList);
        }
      } else if (updatedFriend) {
        // For new friends, add directly to the list instead of refreshing
        setFriends((prevFriends) => [...prevFriends, updatedFriend]);

        // Update session storage by appending the new friend
        if (typeof window !== "undefined") {
          const storedFriends = JSON.parse(
            sessionStorage.getItem("friends") || "[]"
          );
          const updatedFriendsList = [...storedFriends, updatedFriend];
          sessionStorage.setItem("friends", JSON.stringify(updatedFriendsList));
          updateLocalStorageTimestamp(updatedFriendsList);
        }

        // Update the timestamp to now
        setLastUpdated(new Date());
      }
    },
    [friendToEdit]
  );

  // Helper function to update localStorage timestamp
  const updateLocalStorageTimestamp = useCallback((friendsList) => {
    if (typeof window !== "undefined") {
      try {
        const dataWithTimestamp = {
          timestamp: new Date().getTime(),
          friends: friendsList,
        };
        localStorage.setItem("friendsData", JSON.stringify(dataWithTimestamp));
      } catch (e) {
        console.error("Failed to update localStorage:", e);
      }
    }
  }, []);

  // Manual refresh handler remains the same
  const handleRefresh = useCallback(() => {
    if (refreshing || loading) return;
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("friends");
    }
    getStats(true);
  }, [refreshing, loading, getStats]);

  // Initial fetch effect remains the same
  useEffect(() => {
    if (session?.user?.email) {
      // Add a slight delay before the initial fetch to allow user creation to complete
      const timer = setTimeout(() => {
        getStats(false);
      }, 500); // 500ms delay

      return () => clearTimeout(timer);
    } else if (session === null) {
      setLoading(false);
      setRefreshing(false);
      setFriends([]);
      setLastUpdated(null);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("friends");
        localStorage.removeItem("friendsData");
      }
    }
  }, [session, getStats]);

  // --- Calculate filtered AND sorted friends ---
  const sortedAndFilteredFriends = useMemo(() => {
    let currentFriends = [...friends];

    // 1. Apply global search filter
    if (searchTerm) {
      currentFriends = currentFriends.filter((friend) =>
        friend.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Apply sorting
    if (sortColumn) {
      currentFriends.sort((a, b) => {
        // Handle potentially null/undefined values for sorting, treat as 0
        const valA = a[sortColumn] ?? 0;
        const valB = b[sortColumn] ?? 0;

        if (valA < valB) {
          return sortDirection === "asc" ? -1 : 1;
        }
        if (valA > valB) {
          return sortDirection === "asc" ? 1 : -1;
        }
        return 0; // Values are equal
      });
    }

    return currentFriends;
  }, [friends, searchTerm, sortColumn, sortDirection]); // Dependencies

  // ***** FIXED: Handle Sorting Click with proper 3-state cycle *****
  const handleSort = (columnKey) => {
    // If clicking the same column, cycle through states: desc → asc → default(null)
    if (sortColumn === columnKey) {
      if (sortDirection === "desc") {
        // From desc to asc
        setSortDirection("asc");
      } else if (sortDirection === "asc") {
        // From asc to no sort (null)
        setSortColumn(null);
        setSortDirection("desc"); // Reset direction for next click
      }
    } else {
      // If clicking a new column, start with desc (highest values first)
      setSortColumn(columnKey);
      setSortDirection("desc");
    }
  };

  // --- Drag and Drop Handlers (handleDragStart, Over, Leave, Drop, End) ---
  // ... (Unchanged - Note: Drag drop reorders the *current view*) ...
  const handleDragStart = (e, index) => {
    // ... (implementation unchanged)
    if (e.target.closest("a, button, input")) {
      e.preventDefault();
      return;
    }
    const friendToDrag = sortedAndFilteredFriends[index]; // Get from the displayed list
    if (!friendToDrag) return; // Safety check
    setDraggedItem(friendToDrag); // Store the actual friend object being dragged
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", JSON.stringify(friendToDrag)); // Use the friend object
    e.currentTarget.classList.add("dragging-row");
    document.body.classList.add("dragging-active");
  };
  const handleDragOver = (e, index) => {
    /* ... unchanged ... */ e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    const targetRow = e.currentTarget;
    if (
      !targetRow ||
      targetRow.classList.contains("dragging-row") ||
      targetRow.tagName !== "TR"
    )
      return;
    document
      .querySelectorAll(".drop-target")
      .forEach((el) => el.classList.remove("drop-target"));
    targetRow.classList.add("drop-target");
  };
  const handleDragLeave = (e) => {
    /* ... unchanged ... */ e.currentTarget.classList.remove("drop-target");
  };
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();
    document.body.classList.remove("dragging-active");
    e.currentTarget.classList.remove("drop-target");
    document
      .querySelectorAll(".dragging-row")
      .forEach((el) => el.classList.remove("dragging-row"));

    if (!draggedItem) return;

    // Find original indices in the *unsorted/unfiltered* list
    const originalDraggedIndex = friends.findIndex(
      (f) => f.leetcode === draggedItem.leetcode
    );
    const originalDropTargetFriend = sortedAndFilteredFriends[dropIndex];
    const originalDropIndex = friends.findIndex(
      (f) => f.leetcode === originalDropTargetFriend?.leetcode
    );

    if (
      originalDraggedIndex === -1 ||
      originalDropIndex === -1 ||
      originalDraggedIndex === originalDropIndex
    ) {
      setDraggedItem(null);
      return; // Cannot find items in original list or no change needed
    }

    // Perform reordering on the *original* friends array
    const newFriendsOriginalOrder = [...friends];
    const [reorderedItem] = newFriendsOriginalOrder.splice(
      originalDraggedIndex,
      1
    );
    newFriendsOriginalOrder.splice(originalDropIndex, 0, reorderedItem);

    // Update the main state and backend with the new *original* order
    setFriends(newFriendsOriginalOrder);
    updateFriendsInBackend(newFriendsOriginalOrder); // Save the new original order

    // Update local/session storage with the new original order
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "friends",
        JSON.stringify(newFriendsOriginalOrder)
      );
      const currentTime = new Date();
      // setLastUpdated(currentTime); // Let getStats handle timestamp on next fetch if needed
      const dataWithTimestamp = {
        timestamp: localStorage.getItem("friendsData")
          ? JSON.parse(localStorage.getItem("friendsData")).timestamp
          : currentTime.getTime(), // Preserve existing timestamp if possible
        friends: newFriendsOriginalOrder,
      };
      localStorage.setItem("friendsData", JSON.stringify(dataWithTimestamp));
    }

    // Clear sort? Optional: You might want to clear sorting after manual reorder
    // setSortColumn(null);
    // setSortDirection('asc');

    setDraggedItem(null);
  };
  const handleDragEnd = (e) => {
    /* ... unchanged ... */ document.body.classList.remove("dragging-active");
    document.querySelectorAll(".dragging-row, .drop-target").forEach((el) => {
      el.classList.remove("dragging-row", "drop-target");
    });
    setDraggedItem(null);
  };

  // --- formatLastUpdated ---
  const formatLastUpdated = (date) => {
    if (!date) return "Unknown";

    // Format date as "Today at 2:30 PM" or "Jan 15 at 2:30 PM"
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Format the time part
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? 12 : 12; // the hour '0' should be '12'
    const timeStr = `${hours}:${
      minutes < 10 ? "0" + minutes : minutes
    } ${ampm}`;

    // Check if it's today or yesterday
    if (date >= today) {
      return `Today at ${timeStr}`;
    } else if (date >= yesterday) {
      return `Yesterday at ${timeStr}`;
    } else {
      // Format as "Jan 15 at 2:30 PM"
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${months[date.getMonth()]} ${date.getDate()} at ${timeStr}`;
    }
  };

  // --- Compare Handlers ---
  const handleCompareClick = (user) => {
    setUserToCompare(user);
    setShowCompare(true);
    setSelectedUsers([]);
  };

  const handleSelectUser = (user) => {
    if (selectedUsers.some((u) => u.leetcode === user.leetcode)) {
      setSelectedUsers(
        selectedUsers.filter((u) => u.leetcode !== user.leetcode)
      );
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCompare = async () => {
    if (selectedUsers.length === 0) return;

    try {
      setComparisonLoading(true); // Set loading to true immediately
      setShowCompare(false); // Hide the selection modal immediately
      setShowCompareResults(true); // Show the results modal with loading state

      // Get comparison data between userToCompare and selectedUsers
      const users = [userToCompare, ...selectedUsers];
      const usernames = users.map((user) => user.leetcode.split("/").pop());

      // Fetch batch stats for all selected users
      const response = await axios.post("/api/stats/compare", {
        usernames,
        metrics: ["totalSolved", "easySolved", "mediumSolved", "hardSolved"],
      });

      setCompareData({
        mainUser: userToCompare,
        compareUsers: selectedUsers,
        data: response.data,
      });
    } catch (error) {
      console.error("Failed to fetch comparison data:", error);
      // Show error message
      alert("Failed to fetch comparison data. Please try again.");
      setShowCompareResults(false);
    } finally {
      setComparisonLoading(false);
    }
  };

  const closeCompareModal = () => {
    setShowCompare(false);
    setSelectedUsers([]);
  };

  const closeCompareResultsModal = () => {
    setShowCompareResults(false);
    setCompareData(null);
  };

  // Add a new handler for toggling compare mode
  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    if (compareMode) {
      setSelectedForComparison([]);
    }
  };

  // Add a handler for selecting/deselecting users for comparison
  const toggleUserForComparison = (friend) => {
    if (selectedForComparison.some((f) => f.leetcode === friend.leetcode)) {
      // If already selected, remove it
      setSelectedForComparison(
        selectedForComparison.filter((f) => f.leetcode !== friend.leetcode)
      );
    } else {
      // If not selected, add it if not at limit (no alert, just don't add)
      if (selectedForComparison.length < MAX_COMPARE_LIMIT) {
        setSelectedForComparison([...selectedForComparison, friend]);
      }
      // If at limit, do nothing - the UI will show disabled state
    }
  };

  // Add a handler for initiating comparison of selected users
  const compareSelectedUsers = () => {
    if (selectedForComparison.length < 2) {
      alert("Please select at least 2 users to compare");
      return;
    }

    setUserToCompare(selectedForComparison[0]);
    setSelectedUsers(selectedForComparison.slice(1));
    setComparisonLoading(true);
    setShowCompareResults(true);

    // Get comparison data for all selected users
    const usernames = selectedForComparison.map((user) =>
      user.leetcode.split("/").pop()
    );

    axios
      .post("/api/stats/compare", {
        usernames,
        metrics: ["totalSolved", "easySolved", "mediumSolved", "hardSolved"],
      })
      .then((response) => {
        setCompareData({
          mainUser: selectedForComparison[0],
          compareUsers: selectedForComparison.slice(1),
          data: response.data,
        });
      })
      .catch((error) => {
        console.error("Failed to fetch comparison data:", error);
        alert("Failed to fetch comparison data. Please try again.");
        setShowCompareResults(false);
      })
      .finally(() => {
        setComparisonLoading(false);
        setCompareMode(false);
        setSelectedForComparison([]);
      });
  };

  // Add a "Select All" function with limit
  const selectAllForComparison = () => {
    // Limit to MAX_COMPARE_LIMIT users
    const maxSelectionsAllowed = MAX_COMPARE_LIMIT;

    if (
      selectedForComparison.length === sortedAndFilteredFriends.length ||
      selectedForComparison.length === maxSelectionsAllowed
    ) {
      // If all are already selected or max limit is reached, deselect all
      setSelectedForComparison([]);
    } else {
      // Otherwise select all (or up to maxSelectionsAllowed)
      const selectableItems = sortedAndFilteredFriends.slice(
        0,
        maxSelectionsAllowed
      );
      setSelectedForComparison(selectableItems);
    }
  };

  // --- Render ---
  return (
    <div className="p-4 sm:p-6 bg-gray-50 w-full">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        {/* ... (Header structure unchanged) ... */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              Dashboard
            </h2>
            {lastUpdated && !loading && (
              <p className="text-xs text-gray-500">
                Last updated: {formatLastUpdated(lastUpdated)}
              </p>
            )}
          </div>
          {/* ... (Header Buttons unchanged) ... */}
          <div className="flex space-x-2 sm:space-x-3">
            <button
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 sm:px-4 rounded-md transition duration-200 shadow-sm flex items-center text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleRefresh}
              disabled={refreshing || loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 mr-2 ${refreshing ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />{" "}
              </svg>
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            {/* Switch the order of buttons - Compare first, then Add Friend */}
            {friends.length > 1 && (
              <button
                className={`${
                  compareMode
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } text-white font-medium py-2 px-3 sm:px-4 rounded-md transition duration-200 shadow-md flex items-center text-sm`}
                onClick={toggleCompareMode}
                disabled={loading || refreshing}
              >
                <FaChartLine className="mr-2" />
                {compareMode ? "Cancel" : "Compare"}
              </button>
            )}

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 sm:px-4 rounded-md transition duration-200 shadow-md flex items-center text-sm"
              onClick={() => setShowFriendPopup(true)}
              disabled={loading || refreshing}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                {" "}
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />{" "}
              </svg>
              Add friend
            </button>
          </div>
        </div>

        {/* Compare action bar - shown when in compare mode */}
        {compareMode && (
          <div className="bg-indigo-50 p-4 mb-4 rounded-lg border border-indigo-100 flex flex-col sm:flex-row justify-between items-center">
            <div>
              <h3 className="font-medium text-indigo-800">Compare Mode</h3>
              <p className="text-sm text-indigo-600">
                Select up to {MAX_COMPARE_LIMIT} users to compare their stats
              </p>
            </div>
            <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={
                    selectedForComparison.length > 0 &&
                    (selectedForComparison.length ===
                      sortedAndFilteredFriends.length ||
                      selectedForComparison.length === MAX_COMPARE_LIMIT)
                  }
                  onChange={selectAllForComparison}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium text-indigo-800"
                >
                  Select All{" "}
                  {sortedAndFilteredFriends.length > MAX_COMPARE_LIMIT
                    ? `(max ${MAX_COMPARE_LIMIT})`
                    : ""}
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-indigo-800">
                  {selectedForComparison.length}/{MAX_COMPARE_LIMIT} selected
                </span>
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                  disabled={selectedForComparison.length < 2}
                  onClick={compareSelectedUsers}
                >
                  Compare Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Input Row */}
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Content Area: Skeleton, Empty State, or Table */}
        {loading ? (
          // Show skeleton loader whenever loading is true
          <div className="overflow-hidden bg-white shadow rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="bg-gray-700 text-white">
                    <th scope="col" className="px-3 py-4 w-12 text-center"></th>
                    <th
                      scope="col"
                      className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wider w-14"
                    >
                      #
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider"
                    >
                      Username
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-4 text-center text-sm font-semibold uppercase tracking-wider"
                    >
                      Today
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-4 text-center text-sm font-semibold uppercase tracking-wider"
                    >
                      Last 7 days
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-4 text-center text-sm font-semibold uppercase tracking-wider"
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SkeletonRow key={n} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : !loading && friends.length === 0 ? (
          // ... (Empty state JSX unchanged) ...
          <div className="bg-white shadow rounded-lg">
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-indigo-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-lg sm:text-xl text-gray-600 font-medium">
                {" "}
                No friends added yet{" "}
              </p>
              <p className="text-sm sm:text-base text-gray-500 mb-6">
                {" "}
                Add friends using their LeetCode profile URL to track their
                progress.{" "}
              </p>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-md transition duration-200 shadow-md text-sm sm:text-base"
                onClick={() => setShowFriendPopup(true)}
              >
                {" "}
                Add your first friend{" "}
              </button>
            </div>
          </div>
        ) : friends.length > 0 ? (
          // Real Table Data
          <div
            className={`overflow-hidden bg-white shadow rounded-lg transition-opacity duration-300 ${
              refreshing ? "opacity-75" : "opacity-100"
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="bg-gray-700 text-white">
                    {/* Checkbox column - only visible in compare mode */}
                    {compareMode && (
                      <th
                        scope="col"
                        className="px-3 py-4 w-12 text-center align-middle"
                      >
                        <span className="sr-only">Select</span>
                      </th>
                    )}

                    {/* Regular columns */}
                    <th
                      scope="col"
                      className="px-3 py-4 w-12 text-center align-middle"
                    ></th>
                    <th
                      scope="col"
                      className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wider w-14 align-middle"
                    >
                      #
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider align-middle"
                    >
                      Username
                    </th>

                    {/* Sortable columns */}
                    {["solvedToday", "solvedCurrentWeek", "totalSolved"].map(
                      (colKey) => {
                        const titles = {
                          solvedToday: "Today",
                          solvedCurrentWeek: "Last 7 days",
                          totalSolved: "Total",
                        };
                        return (
                          <th
                            key={colKey}
                            scope="col"
                            className="px-4 py-4 text-center text-sm font-semibold uppercase tracking-wider align-middle cursor-pointer transition-colors"
                            onClick={() => handleSort(colKey)}
                          >
                            <div className="flex items-center justify-center">
                              <div className="flex items-center justify-center">
                                {titles[colKey]}
                                {sortColumn === colKey ? (
                                  sortDirection === "asc" ? (
                                    <FaSortUp className="ml-1.5 h-3.5 w-3.5" />
                                  ) : (
                                    <FaSortDown className="ml-1.5 h-3.5 w-3.5" />
                                  )
                                ) : (
                                  <FaSort className="ml-1.5 h-3.5 w-3.5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </th>
                        );
                      }
                    )}
                  </tr>
                </thead>
                {/* ***** CHANGE: Iterate over sortedAndFilteredFriends ***** */}
                <tbody className="divide-y divide-gray-200 bg-white">
                  {sortedAndFilteredFriends.length > 0 ? (
                    sortedAndFilteredFriends.map(
                      (
                        friend,
                        index // Use sortedAndFilteredFriends
                      ) => (
                        <React.Fragment key={friend.leetcode || index}>
                          {/* ... (Table Row and Expanded Row JSX - Unchanged Content, uses 'friend') ... */}
                          {/* Make sure handleDrop uses original index mapping if drag/drop needs to affect original order */}
                          <tr
                            className={`group transition-colors duration-150 ${
                              compareMode &&
                              selectedForComparison.some(
                                (f) => f.leetcode === friend.leetcode
                              )
                                ? "bg-indigo-50"
                                : expandedRow === index
                                ? "bg-blue-50"
                                : (index % 2 === 0
                                    ? "bg-white"
                                    : "bg-gray-50") +
                                  (expandedRow !== index
                                    ? " hover:bg-gray-100"
                                    : "")
                            } cursor-pointer relative`} // Added 'relative' for positioning
                            draggable={!compareMode}
                            onDragStart={(e) =>
                              !compareMode && handleDragStart(e, index)
                            }
                            onDragOver={(e) =>
                              !compareMode && handleDragOver(e, index)
                            }
                            onDragLeave={(e) =>
                              !compareMode && handleDragLeave(e)
                            }
                            onDrop={(e) => !compareMode && handleDrop(e, index)}
                            onDragEnd={(e) => !compareMode && handleDragEnd(e)}
                            onClick={(e) => {
                              if (compareMode) {
                                // In compare mode, clicking toggles selection if not at limit or already selected
                                if (
                                  !e.target.closest("a, button, input, svg")
                                ) {
                                  // Only allow toggling if:
                                  // 1. User is already selected (allowing deselection), OR
                                  // 2. We haven't reached the selection limit yet
                                  const isSelected = selectedForComparison.some(
                                    (f) => f.leetcode === friend.leetcode
                                  );
                                  if (
                                    isSelected ||
                                    selectedForComparison.length <
                                      MAX_COMPARE_LIMIT
                                  ) {
                                    toggleUserForComparison(friend);
                                  }
                                }
                                return;
                              }

                              if (
                                document.body.classList.contains(
                                  "dragging-active"
                                ) ||
                                e.target.closest("a, button, input, svg")
                              )
                                return;

                              setExpandedRow(
                                expandedRow === index ? null : index
                              );
                            }}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                if (compareMode) {
                                  toggleUserForComparison(friend);
                                } else {
                                  setExpandedRow(
                                    expandedRow === index ? null : index
                                  );
                                }
                              }
                            }}
                            style={{
                              cursor: compareMode
                                ? selectedForComparison.some(
                                    (f) => f.leetcode === friend.leetcode
                                  ) ||
                                  selectedForComparison.length <
                                    MAX_COMPARE_LIMIT
                                  ? "pointer"
                                  : "not-allowed"
                                : "pointer", // Always make it pointer in non-compare mode
                            }}
                          >
                            {/* Checkbox - only visible in compare mode */}
                            {compareMode && (
                              <td className="px-3 py-4 w-12 text-center align-middle">
                                <input
                                  type="checkbox"
                                  checked={selectedForComparison.some(
                                    (f) => f.leetcode === friend.leetcode
                                  )}
                                  onChange={() =>
                                    toggleUserForComparison(friend)
                                  }
                                  disabled={
                                    !selectedForComparison.some(
                                      (f) => f.leetcode === friend.leetcode
                                    ) &&
                                    selectedForComparison.length >=
                                      MAX_COMPARE_LIMIT
                                  }
                                  className={`h-4 w-4 rounded border-gray-300 
                                    ${
                                      selectedForComparison.some(
                                        (f) => f.leetcode === friend.leetcode
                                      ) ||
                                      selectedForComparison.length <
                                        MAX_COMPARE_LIMIT
                                        ? "text-indigo-600 focus:ring-indigo-500"
                                        : "text-gray-300 cursor-not-allowed"
                                    }`}
                                />
                              </td>
                            )}

                            {/* Drag Handle - only visible when not in compare mode */}
                            <td className="px-3 py-4 w-12 text-center align-middle">
                              {!compareMode && (
                                <div
                                  className="text-gray-400 hover:text-gray-600 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => e.stopPropagation()}
                                  title="Drag to reorder"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                  >
                                    {" "}
                                    <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />{" "}
                                  </svg>
                                </div>
                              )}
                            </td>

                            {/* Other columns remain the same */}
                            <td className="px-4 py-4 font-medium text-gray-600 text-sm w-14 align-middle">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 align-middle">
                              <div className="flex items-center">
                                {friend.name ? (
                                  <div className="relative flex items-center group">
                                    <a
                                      href={friend.leetcode}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm font-medium text-gray-800 hover:text-blue-600 hover:underline"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {friend.name}
                                    </a>
                                    {/* Action buttons - only visible on hover */}
                                    <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex">
                                      {/* Edit button */}
                                      <button
                                        onClick={(e) =>
                                          handleEditFriend(friend, e)
                                        }
                                        className="p-1 rounded-full hover:bg-gray-100 mr-1"
                                        title="Edit friend"
                                      >
                                        <PencilIcon className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                                      </button>

                                      {/* Delete button */}
                                      <button
                                        onClick={(e) =>
                                          handleDeleteFriend(friend, e)
                                        }
                                        className="p-1 rounded-full hover:bg-gray-100"
                                        title="Delete friend"
                                      >
                                        <TrashIcon className="h-4 w-4 text-gray-500 hover:text-red-600" />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500 italic">
                                    Name missing
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center align-middle">
                              <div
                                className={`inline-flex items-center justify-center text-sm font-medium px-3 py-1 rounded-full ${
                                  friend.solvedToday > 0
                                    ? "bg-green-100 text-green-800 ring-1 ring-inset ring-green-600/20"
                                    : "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/10"
                                }`}
                              >
                                {friend.hasOwnProperty("solvedToday") &&
                                friend.solvedToday !== null ? (
                                  friend.solvedToday
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center align-middle">
                              <div
                                className={`inline-flex items-center justify-center text-sm font-medium px-3 py-1 rounded-full ${
                                  friend.solvedCurrentWeek > 0
                                    ? "bg-indigo-100 text-indigo-800 ring-1 ring-inset ring-indigo-700/10"
                                    : "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/10"
                                }`}
                              >
                                {friend.hasOwnProperty("solvedCurrentWeek") &&
                                friend.solvedCurrentWeek !== null ? (
                                  friend.solvedCurrentWeek
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center align-middle">
                              <div className="inline-flex items-center justify-center text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-500/10">
                                {friend.hasOwnProperty("totalSolved") &&
                                friend.totalSolved !== null ? (
                                  friend.totalSolved
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Expanded row remains the same */}
                          {expandedRow === index && !compareMode && (
                            <tr>
                              <td colSpan={6} className="p-0">
                                {/* ...existing expanded row content... */}
                                <div className="bg-blue-50 p-4 sm:p-6 border-l-4 border-blue-500">
                                  <h4 className="text-base font-semibold text-gray-700 mb-4">
                                    Difficulty Breakdown
                                  </h4>
                                  {friend.easySolved != null &&
                                  friend.mediumSolved != null &&
                                  friend.hardSolved != null &&
                                  friend.totalSolved > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                                      {/* ...existing code for difficulty breakdown cards... */}
                                      {/* Easy Card */}
                                      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="text-sm font-medium text-gray-600">
                                            Easy
                                          </span>
                                          <span className="text-base font-bold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
                                            {friend.easySolved}
                                          </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{
                                              width: `${
                                                (friend.easySolved /
                                                  friend.totalSolved) *
                                                100
                                              }%`,
                                            }}
                                          ></div>
                                        </div>
                                      </div>
                                      {/* Medium Card */}
                                      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="text-sm font-medium text-gray-600">
                                            Medium
                                          </span>
                                          <span className="text-base font-bold text-yellow-600 bg-yellow-50 px-2.5 py-0.5 rounded-full">
                                            {friend.mediumSolved}
                                          </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div
                                            className="bg-yellow-500 h-2 rounded-full"
                                            style={{
                                              width: `${
                                                (friend.mediumSolved /
                                                  friend.totalSolved) *
                                                100
                                              }%`,
                                            }}
                                          ></div>
                                        </div>
                                      </div>
                                      {/* Hard Card */}
                                      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="text-sm font-medium text-gray-600">
                                            Hard
                                          </span>
                                          <span className="text-base font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">
                                            {friend.hardSolved}
                                          </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div
                                            className="bg-red-500 h-2 rounded-full"
                                            style={{
                                              width: `${
                                                (friend.hardSolved /
                                                  friend.totalSolved) *
                                                100
                                              }%`,
                                            }}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500 italic">
                                      Detailed stats not available yet.
                                    </p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    )
                  ) : (
                    // Message when search term yields no results
                    <tr>
                      <td
                        colSpan={compareMode ? 6 : 5} // Reduce colspan by 1
                        className="text-center py-10 px-6 text-gray-500 italic"
                      >
                        No friends match the current search term.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* Add/Edit Friend Popup */}
        {showFriendPopup && (
          <AddFriendPopup
            showFriendPopup={showFriendPopup}
            setShowFriendPopup={handleFriendPopupClose}
            editMode={editMode}
            friendToEdit={friendToEdit}
            onFriendAdded={handleFriendUpdated}
          />
        )}

        {/* Compare User Selection Modal */}
        {showCompare && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-4">
                Compare {userToCompare.name}'s stats with others
              </h2>
              <p className="mb-4 text-gray-600">
                Select users to compare with:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {friends
                  .filter(
                    (friend) => friend.leetcode !== userToCompare.leetcode
                  )
                  .map((friend, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`compare-${index}`}
                        checked={selectedUsers.some(
                          (u) => u.leetcode === friend.leetcode
                        )}
                        onChange={() => handleSelectUser(friend)}
                        className="h-4 w-4"
                      />
                      <label htmlFor={`compare-${index}`} className="flex-1">
                        {friend.name} ({friend.leetcode.split("/").pop()})
                      </label>
                    </div>
                  ))}
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={closeCompareModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompare}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={selectedUsers.length === 0}
                >
                  Compare
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Results Modal */}
        {showCompareResults && (
          <div className="fixed inset-0 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto m-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {comparisonLoading ? (
                    "Loading comparison data..."
                  ) : (
                    <>
                      Comparison: {compareData.mainUser.name} vs{" "}
                      {compareData.compareUsers.map((u) => u.name).join(", ")}
                    </>
                  )}
                </h2>
                <button
                  onClick={closeCompareResultsModal}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {comparisonLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-lg text-gray-600">
                    Fetching comparison data...
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    This may take a few moments
                  </p>
                </div>
              ) : compareData ? (
                <div className="mt-4">
                  <CompareChart
                    mainUser={compareData.mainUser}
                    compareUsers={compareData.compareUsers}
                    data={compareData.data}
                  />
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No comparison data available</p>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={closeCompareResultsModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Delete Confirmation Modal */}
        {showDeleteConfirm && friendToDelete && (
          <div className="fixed inset-0 z-[9999] overflow-y-auto flex justify-center items-center">
            <div
              className="fixed inset-0 bg-black bg-opacity-60 transition-opacity"
              onClick={cancelDeleteFriend}
              aria-hidden="true"
            ></div>

            <div className="relative bg-white w-full max-w-md rounded-lg shadow-2xl p-6 m-4 transform transition-all z-10">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Delete Friend
              </h3>

              <p className="mb-6 text-gray-600">
                Are you sure you want to delete{" "}
                <strong>{friendToDelete.name}</strong>? This action cannot be
                undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDeleteFriend}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteFriend}
                  className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
