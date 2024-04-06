import React from "react";
import { signIn } from "next-auth/react";

const SignInPage = ({ isLoading }) => {
  return (
    <>
      {isLoading && (
        <div className="flex w-full">
          <FullScreenLoader />
        </div>
      )}
      <div className="flex flex-col justify-center items-center w-full bg-gray-100">
        <div className="flex flex-col items-center justify-center">
          <h3 className="mb-3">Sign in with google to continue</h3>
          <div>
            <button
              className="flex justify-center items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-100"
              onClick={() => signIn("google")}
            >
              <img src="/google.png" className="w-4 h-4 mr-2" />
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInPage;
