"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "./store/slices/authSlice";
import {
  HomeIcon,
  UserGroupIcon,
  TicketIcon,
  WrenchScrewdriverIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";

export default function AdminLayout({ children, title = "Admin Dashboard" }) {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const navigation = [
    { name: "Dashboard", href: "/", icon: HomeIcon },
    { name: "Support Tickets", href: "/tickets", icon: TicketIcon },
    { name: "Customers", href: "/customers", icon: UserGroupIcon },
    { name: "Staff", href: "/staff", icon: UserGroupIcon },
    { name: "Inventory", href: "/inventory", icon: WrenchScrewdriverIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 flex z-40 md:hidden ${
          sidebarOpen ? "" : "pointer-events-none"
        }`}
      >
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-gray-800 transition transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent
            navigation={navigation}
            currentPath={router.pathname}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
          <SidebarContent
            navigation={navigation}
            currentPath={router.pathname}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 md:ml-64">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </div>
                  <input
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent"
                    placeholder="Search tickets, customers..."
                    type="search"
                  />
                </div>
              </div>
            </div>

            <div className="ml-4 flex items-center md:ml-6">
              <div className="ml-3 relative">
                <button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <span className="ml-2 text-gray-700">{user?.name}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ navigation, currentPath }) {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const router = useRouter();

  return (
    <>
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <WrenchScrewdriverIcon className="h-5 w-5 text-white" />
        </div>
        <span className="ml-3 text-white text-lg font-medium">
          Dern-Support Admin
        </span>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 bg-gray-800 space-y-1">
          {navigation.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <item.icon className="mr-3 flex-shrink-0 h-6 w-6" />
                {item.name}
              </Link>
            );
          })}
          <button
            disabled={loading}
            onClick={() => {dispatch(logout()); router.push("/login")}}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-md hover:opacity-90 transition"
          >Logout</button>
        </nav>
      </div>
    </>
  );
}
