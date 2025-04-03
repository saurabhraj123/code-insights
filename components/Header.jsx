import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        setIsDeleting(true);
        const email = session?.user?.email;
        if (!email) {
          alert("User email not found. Please sign in again.");
          return;
        }

        console.log(`Attempting to delete account for email: ${email}`);

        const response = await axios.delete(`/api/user/delete?email=${email}`, {
          // Add timeout to prevent hanging requests
          timeout: 10000,
        });

        console.log("Delete account response:", response);

        if (response.status === 200) {
          alert("Your account has been deleted successfully.");
          signOut({ callbackUrl: "/" });
        }
      } catch (error) {
        console.error("Error deleting account:", error);

        // More detailed error handling to help debugging
        let errorMessage = "Failed to delete account. Please try again later.";

        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Error response data:", error.response.data);
          console.error("Error response status:", error.response.status);

          if (error.response.data && error.response.data.error) {
            errorMessage = `Error: ${error.response.data.error}`;
            if (error.response.data.message) {
              errorMessage += ` - ${error.response.data.message}`;
            }
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error("Error request:", error.request);
          errorMessage =
            "No response received from server. Please check your network connection.";
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Error message:", error.message);
          errorMessage = `Error: ${error.message}`;
        }

        alert(errorMessage);
      } finally {
        setIsDeleting(false);
        setDropdownOpen(false);
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Generate initials from user name
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 bg-white shadow-sm border-b border-gray-200 z-[999]">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center px-4 py-3 max-w-7xl">
        <div className="flex justify-between w-full sm:w-auto items-center">
          <Link href="/" className="group">
            <h1 className="flex items-center justify-center">
              <div className="bg-blue-50 p-1.5 rounded-md mr-2">
                <img src="/logo.png" className="w-5 h-5" alt="Logo" />
              </div>
              <span className="font-semibold text-lg text-gray-800">
                Leetcode{" "}
                <span className="text-blue-600 font-bold">Insights</span>
              </span>
            </h1>
          </Link>

          {/* Mobile menu button */}
          <button
            className="sm:hidden focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        <nav
          className={`${
            mobileMenuOpen ? "flex" : "hidden"
          } sm:flex flex-col sm:flex-row items-center gap-1 sm:gap-3 w-full sm:w-auto mt-3 sm:mt-0`}
        >
          {isLoading ? (
            <div className="w-20 h-8 bg-gray-200 animate-pulse rounded-md"></div>
          ) : !session ? (
            <button
              onClick={() => signIn("google")}
              className="px-3 py-1.5 text-gray-700 font-medium hover:text-blue-600"
            >
              Log In
            </button>
          ) : (
            <div className="flex items-center gap-3 ml-2" ref={dropdownRef}>
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-gray-200"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`w-8 h-8 rounded-full bg-blue-600 text-white font-medium flex items-center justify-center ${
                  session.user?.image ? "hidden" : ""
                }`}
                aria-label="User profile"
              >
                {getInitials(session.user?.name)}
              </div>
              <div className="relative">
                <button
                  className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  disabled={isDeleting}
                >
                  <span className="font-medium">
                    {session.user?.name?.split(" ")[0]}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={handleDeleteAccount}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 font-medium"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete Account"}
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
