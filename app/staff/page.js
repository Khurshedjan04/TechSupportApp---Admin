"use client";
import { useEffect, useState } from "react";
import {
  MagnifyingGlassIcon,
  UserIcon,
  TrashIcon,
  EnvelopeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import AdminLayout from "../AdminLayout";
import useAuthCheck from "../hooks/checkAuth";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteUser,
  setError,
  setLoading,
  setUsers,
} from "../store/slices/usersSlice";
import { usersAPI } from "../services/api";

export default function AdminCustomers() {
  const dispatch = useDispatch();

  useAuthCheck();

  const { users, error, loading, stats, filters } = useSelector(
    (state) => state.users
  );

  if (error) {
    confirm(error);
    dispatch(setError(null));
  }

  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    role: "technician",
    password: "",
  });
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  const [currentUsers, setUser] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    dispatch(setLoading(true));

    try {
      const requests = await usersAPI.getAllUsers();
      dispatch(setUsers(requests));
    } catch (error) {
      dispatch(setError(error.message));
      console.log(error);
    }
  };

  const deleteAUser = async (activeUserId) => {
    try {
      const requests = await usersAPI.deleteUser(activeUserId);
      dispatch(deleteUser(activeUserId));
    } catch (error) {
      dispatch(setError(error));
    }
  };

  useEffect(() => {
    setUser(users);
  }, [users]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = currentUsers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    return (
      matchesSearch &&
      (customer.role === "admin" || customer.role === "technician")
    );
  });

  const handleAddCustomer = async () => {
    try {
      const response = await usersAPI.addAdminOrTechnician(newStaff);
      console.log("User added:", response);
      await loadUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error adding user:", error);
    }

    setNewStaff({ name: "", email: "", role: "technician", password: "" });
    setShowAddStaffModal(false);
  };

  return (
    <AdminLayout title="Customer Management">
      {/* Customer Stats */}
      <div className="flex justify-between gap-6 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500">
                    Showing Total Admins and Technicians
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {filteredCustomers.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex sm:mt-0 sm:ml-4">
          <button
            onClick={() => setShowAddStaffModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Staff
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredCustomers.map((customer) => (
            <li key={customer?._id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0"></div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </p>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <EnvelopeIcon className="h-4 w-4 mr-1" />
                        <p>{customer.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-5 text-gray-800">
                    <h1>
                      {customer.role?.charAt(0).toUpperCase() +
                        customer.role?.slice(1)}
                    </h1>
                    <button
                      onClick={() => deleteAUser(customer._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>
                      Registered:{" "}
                      {new Date(customer.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* Add Customer Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Add New Staff
                </h3>
                <button
                  onClick={() => setShowAddStaffModal(false)}
                  className="text-gray-400 hover:text-gray-600"
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

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddCustomer();
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Staff Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newStaff.name}
                      onChange={(e) =>
                        setNewStaff({ ...newStaff, name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Staff Type *
                    </label>
                    <select
                      value={newStaff.role}
                      onChange={(e) =>
                        setNewStaff({ ...newStaff, role: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="technician">Technician</option>
                      <option value="admin">Admin</option>
                      <option value="super admin">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={newStaff.email}
                      onChange={(e) =>
                        setNewStaff({
                          ...newStaff,
                          email: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={newStaff.password}
                      onChange={(e) =>
                        setNewStaff({
                          ...newStaff,
                          password: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddStaffModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                  >
                    Add Staff
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No customers found matching your criteria.
          </p>
        </div>
      )}
    </AdminLayout>
  );
}
