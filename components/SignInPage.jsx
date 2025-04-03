import React from "react";
import { signIn } from "next-auth/react";

const FullScreenLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
    </div>
  </div>
);

const SignInPage = ({ isLoading }) => {
  return (
    <>
      {isLoading && <FullScreenLoader />}

      <div className="flex flex-col justify-center items-center h-[calc(100vh-8rem)] w-full bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
          {/* App branding */}
          <div className="bg-blue-600 px-6 py-8 text-center">
            <div className="inline-block p-3 bg-white/20 rounded-full mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Code Insights</h1>
            <p className="text-blue-100 mt-1">Track your LeetCode progress</p>
          </div>

          {/* Sign in content */}
          <div className="px-6 py-8">
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
              Welcome to Code Insights
            </h2>

            <div className="mb-6">
              <button
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-3 px-4 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => signIn("google")}
              >
                <img src="/google.png" alt="Google" className="h-5 w-5 mr-2" />
                <span className="font-medium">Continue with Google</span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Account Info
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="ml-2">
                  <strong>New user?</strong> Signing in will automatically
                  create your account.
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="ml-2">
                  <strong>Returning?</strong> You'll be logged into your
                  existing account.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInPage;
