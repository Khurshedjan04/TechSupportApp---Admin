"use client";
import { useEffect, useState } from "react";
import {
  MagnifyingGlassIcon,
  UserIcon,
  TrashIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import AdminLayout from "../AdminLayout";
import useAuthCheck from "../hooks/checkAuth";
import { useDispatch, useSelector } from "react-redux";
import { deleteUser, setError, setLoading, setUsers } from "../store/slices/usersSlice";
import { usersAPI } from "../services/api";

export default function AdminCustomers() {
  const dispatch = useDispatch();

  useAuthCheck();

  const { users, loading, stats, filters } = useSelector(
    (state) => state.users
  );

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
    }
  };

  const deleteAUser = async (activeUserId) => {

    try {
      const requests = await usersAPI.deleteUser(activeUserId);
      dispatch(deleteUser(activeUserId));
    } catch (error) {
      dispatch(setError(error.message));
    }
  };

  useEffect(() => {
    setUser(users);
  }, [users]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = currentUsers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) 

    return matchesSearch && customer.role !== "admin";
  });

  return (
    <AdminLayout title="Customer Management">

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Customers
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {filteredCustomers.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
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
                    <div className="flex-shrink-0">
                    </div>
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
                  <div className="flex items-center space-x-2">
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
                    <span>Registered: {new Date(customer.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
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
