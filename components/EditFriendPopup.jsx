import { useRef, useState } from "react";

export default function EditFriendPopup({
  showFriendPopup,
  setShowFriendPopup,
  nameProp,
  leetcodeProp,
  handleSubmit,
}) {
  const [name, setName] = useState(nameProp);
  const [leetcode, setLeetcode] = useState(leetcodeProp);
  const [error, setError] = useState("");
  const [updateStatus, setUpdateStatus] = useState("no-change");

  const boxRef = useRef(null);
  const handlePopup = (e) => {
    if (boxRef.current && !boxRef.current.contains(e.target))
      setShowFriendPopup(false);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    setError(null);
  };

  const handleLeetcodeChange = (e) => {
    setLeetcode(e.target.value);
    setError(null);
  };

  return (
    <div
      className={`fixed inset-0 z-10 bg-gray-900 bg-opacity-50 flex justify-center items-center z-[999999999] ${
        showFriendPopup ? "" : "hidden"
      }`}
      onClick={handlePopup}
    >
      <div className="bg-white w-96 rounded-lg p-4 z-[999999999]" ref={boxRef}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800">Add Friend</h2>
          <button
            className="text-gray-500 hover:text-gray-600 focus:outline-none"
            onClick={() => setShowFriendPopup(true)}
          >
            {/* <PlusIcon className="w-6 h-6" /> */}
            {/* remove */}
            {/* <HiX className="w-6 h-6" /> */}
          </button>
        </div>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700">
            Name *
          </label>
          <input
            type="text"
            id="name"
            className="bg-gray-100 rounded-md py-1 px-2 text-gray-700 w-full"
            value={name}
            onChange={handleNameChange}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="leetcode" className="block text-gray-700">
            Leetcode *
          </label>
          <input
            type="text"
            id="leetcode"
            className="bg-gray-100 rounded-md py-1 px-2 text-gray-700 w-full"
            value={leetcode}
            placeholder="https://leetcode.com/username"
            onChange={handleLeetcodeChange}
          />
        </div>

        {error && <p className="text-red-600">{error.message}</p>}

        <div className="flex justify-center mt-4">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
            onClick={() => {
              setUpdateStatus("updating");
              handleSubmit(leetcodeProp, name, leetcode);
            }}
          >
            {updateStatus === "updating" ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
