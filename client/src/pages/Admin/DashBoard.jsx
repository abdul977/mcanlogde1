import React from "react";
import { FaUser } from "react-icons/fa";
import Details from "./Details";
import Navbar from "./Navbar";
import MobileLayout from "../../components/Mobile/MobileLayout";

const DashBoard = () => {
  return (
    <MobileLayout
      title="Admin Details"
      subtitle="Profile & settings"
      icon={FaUser}
      navbar={Navbar}
    >
      <div className="p-4 lg:p-8">
        <Details />
      </div>
    </MobileLayout>
  );
};

export default DashBoard;
