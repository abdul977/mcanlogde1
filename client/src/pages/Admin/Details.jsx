import React from "react";
import { FaUser, FaEnvelope } from "react-icons/fa";
import Navbar from "./Navbar";
import { useAuth } from "../../context/UserContext";

const Details = () => {
  const [auth, setAuth] = useAuth();
  // console.log(auth, "auth");
  const users = {
    name: auth?.user?.name,
    email: auth?.user?.email,
  };

  return (
    <div className="p-4 lg:p-8 bg-gray-50 h-full flex flex-col justify-center">
      <h2 className="text-xl lg:text-2xl font-semibold mb-6 text-gray-800">
        Admin Details
      </h2>

      <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6 space-y-4">
        <div className="flex items-center text-gray-800">
          <FaUser className="mr-3 text-blue-600 text-lg flex-shrink-0" />
          <span className="text-sm lg:text-base">
            <strong>Name:</strong> {users.name}
          </span>
        </div>

        <div className="flex items-center text-gray-800">
          <FaEnvelope className="mr-3 text-blue-600 text-lg flex-shrink-0" />
          <span className="text-sm lg:text-base break-all">
            <strong>Email:</strong> {users.email}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Details;
