import React from "react";
import Link from "next/link";
// Fix the import path for react-icons
import { FaGithub, FaLinkedin, FaCode } from "react-icons/fa6";
import { SiLeetcode } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-6">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center max-w-7xl">
        <div className="mb-4 sm:mb-0 flex items-center">
          <FaCode className="h-4 w-4 text-gray-500 mr-2" />
          <p className="text-sm text-gray-500">Developed by Saurabh Raj</p>
        </div>
        <div className="flex space-x-4">
          <a
            href="https://github.com/saurabhraj123"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600"
          >
            <FaGithub className="h-5 w-5" />
          </a>
          <a
            href="https://linkedin.com/in/saurabhcu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600"
          >
            <FaLinkedin className="h-5 w-5" />
          </a>
          <a
            href="https://leetcode.com/me4saurabh4u"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600"
          >
            <SiLeetcode className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
