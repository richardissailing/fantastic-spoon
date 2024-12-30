import React from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold">
                Change Management
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button className="p-2 rounded-md hover:bg-gray-100">
              <Bell className="h-6 w-6" />
            </button>
            <div className="ml-4">
              <img
                className="h-8 w-8 rounded-full"
                src="/api/placeholder/32/32"
                alt="User"
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;