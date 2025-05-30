"use client";
import { useEffect, useState } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  TrashIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import AdminLayout from "../AdminLayout";
import useAuthCheck from "../hooks/checkAuth";
import { useDispatch, useSelector } from "react-redux";
import { supportRequestsAPI, usersAPI } from "../services/api";
import {
  deleteSupportRequest,
  setError,
  setLoading,
  setSupportRequests,
  updateSupportRequest,
} from "../store/slices/supportRequestsSlice";
import { setUsers } from "../store/slices/usersSlice";

export default function AdminTickets() {
  useAuthCheck('admin');
  const dispatch = useDispatch();

  const { supportRequests, error, loading, stats, filters } = useSelector(
    (state) => state.supportRequests
  );
  const technicians = useSelector((state) =>
    state.users.users.filter((user) => user.role === "technician")
  );

  useEffect(() => {
    loadUsers();
    loadSupportRequests();
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

  if (error) {
    confirm(error);
    dispatch(setError(null));
  }
  // support requests
  const [tickets, setTickets] = useState([]);

  const loadSupportRequests = async () => {
    dispatch(setLoading(true));

    try {
      const requests = await supportRequestsAPI.getAllRequests();
      dispatch(setSupportRequests(requests));
    } catch (error) {
      dispatch(setError(error));
    }
  };

  const deleteTicket = async (activeTicketId) => {
    try {
      const requests = await supportRequestsAPI.deleteRequest(activeTicketId);
      dispatch(deleteSupportRequest(activeTicketId));
    } catch (error) {
      dispatch(setError(error));
    }
  };

  useEffect(() => {
    setTickets(supportRequests);
  }, [supportRequests]);

  const [selectedTicket, setSelectedTicket] = useState({});
  const [newStatus, setNewStatus] = useState(
    selectedTicket.status || "pending"
  );

  const [newAssign, setNewAssign] = useState(
    selectedTicket.assignedTechnic || "No one"
  );

  useEffect(() => {
    if (selectedTicket && selectedTicket._id) {
      setNewStatus(selectedTicket.status || "pending");
      setNewAssign(selectedTicket.assignedTechnic || "No one");
    }
  }, [selectedTicket]);

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const getPriorityColor = (priority = "medium") => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "open":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.issue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      priorityFilter === "all" ||
      ticket.urgency.toLowerCase() === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
    setNewStatus(ticket.status);
    setNewAssign(ticket.assignedTechnic);
  };

  const handleUpdateTicketStatus = async (ticketId) => {
    try {
      await supportRequestsAPI.updateRequest(ticketId, {
        status: newStatus,
        assignedTechnic: newAssign,
      });

      dispatch(
        updateSupportRequest({
          _id: ticketId,
          status: newStatus,
          assignedTechnic: newAssign,
        })
      );

      setShowTicketModal(false);
    } catch (error) {
      dispatch(setError(error.message));
      console.log(error);
    }
  };

  return (
    <AdminLayout title="Support Tickets">
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
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
              <FunnelIcon className="h-4 w-4 inline mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredTickets.map((ticket) => (
            <li key={ticket?._id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <p>
                          {ticket?.userId.name} ({ticket?.userId.accType})
                        </p>
                        <p className="ml-2">
                          ||{" "}
                          {ticket?.device.charAt(0).toUpperCase() +
                            ticket.device?.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewTicket(ticket)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deleteTicket(ticket?._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">{ticket?.issue}</p>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>
                      Created: {new Date(ticket?.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                        ticket?.urgency
                      )}`}
                    >
                      {ticket?.urgency}
                    </span>
                    <span
                      className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        ticket?.status
                      )}`}
                    >
                      {ticket?.status}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 text-gray-900">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Ticket Details - {selectedTicket._id}
                </h3>
                <button
                  onClick={() => setShowTicketModal(false)}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Customer Information
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedTicket.userId.name}
                    </p>
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      {selectedTicket?.userId?.accType}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedTicket.userId.email}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-3">
                    Ticket Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-gray-600">
                      <span>Device:</span> {selectedTicket.device}
                    </p>
                    <p>
                      <span className="font-medium">Priority:</span>
                      <span
                        className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          selectedTicket.urgency
                        )}`}
                      >
                        {selectedTicket.urgency}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>
                      <span
                        className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          selectedTicket.status
                        )}`}
                      >
                        {selectedTicket.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Issue Description
                </h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {selectedTicket.issue}
                </p>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Timeline
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    Created:{" "}
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                  <p>
                    Last Update:{" "}
                    {new Date(selectedTicket.updatedAt).toLocaleString()}
                  </p>
                  {selectedTicket.estimatedCompletion && (
                    <p>Est. Completion: {selectedTicket.estimatedCompletion}</p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Technician
                </label>
                <select
                  value={newAssign}
                  onChange={(e) => setNewAssign(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No one</option>
                  {technicians.map((tech) => (
                    <option key={tech._id} value={tech._id}>
                      {tech.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Update Status
                </h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setNewStatus("pending")}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200"
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setNewStatus("scheduled")}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm hover:bg-green-200"
                  >
                    Scheduled
                  </button>
                  <button
                    onClick={() => setNewStatus("resolved")}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm hover:bg-purple-200"
                  >
                    Resolved
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
                >
                  Close
                </button>
                <button
                  onClick={() =>
                    handleUpdateTicketStatus(
                      selectedTicket._id,
                      newStatus,
                      newAssign
                    )
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No tickets found!</p>
        </div>
      )}
    </AdminLayout>
  );
}
