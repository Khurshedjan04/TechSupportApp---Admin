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
import {
  inventoryAPI,
  quoteRequestsAPI,
  supportRequestsAPI,
  usersAPI,
} from "../services/api";
import {
  deleteQuoteRequest,
  setError as setQuoteError,
  setLoading as setQuoteLoading,
  setQuoteRequests,
  updateQuoteRequest,
} from "../store/slices/quoteRequestsSlice";
import {
  deleteSupportRequest,
  setError as setSupportError,
  setLoading as setSupportLoading,
  setSupportRequests,
  updateSupportRequest,
} from "../store/slices/supportRequestsSlice";
import { setUsers } from "../store/slices/usersSlice";

export default function TechnicianDashboard() {
  useAuthCheck();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  // Redux state
  const {
    quoteRequests = [],
    error: quoteError,
    loading: quoteLoading,
  } = useSelector((state) => state.quoteRequests);
  const {
    supportRequests = [],
    error: supportError,
    loading: supportLoading,
  } = useSelector((state) => state.supportRequests);
  const technicians = useSelector(
    (state) =>
      state.users?.users?.filter((user) => user.role === "technician") || []
  );
  // Local state
  const [activeTab, setActiveTab] = useState("quotes");
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newAssign, setNewAssign] = useState("");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Load functions
  const loadUsers = async () => {
    try {
      const requests = await usersAPI.getAllUsers();
      dispatch(setUsers(requests));
      console.log(requests);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadQuoteRequests = async () => {
    dispatch(setQuoteLoading(true));
    try {
      const requests = await quoteRequestsAPI.getAllQuotes();
      dispatch(setQuoteRequests(requests));
    } catch (error) {
      dispatch(setQuoteError(error.message || "Failed to load quote requests"));
    } finally {
      dispatch(setQuoteLoading(false));
    }
  };

  const loadInventoryItems = async () => {
    try {
      const response = await inventoryAPI.getAllInventoryItems();
      const items = (response.data || response).map((item) => ({
        ...item,
        minimumStock: item.minimumStock || item.minimumStock,
      }));
      setInventoryItems(items);
    } catch (err) {
      console.error("Error loading inventory items:", err);
      setError("Failed to load inventory items. Please try again.");
    } 
  };

  const loadSupportRequests = async () => {
    dispatch(setSupportLoading(true));
    try {
      const requests = await supportRequestsAPI.getAllRequests();
      dispatch(setSupportRequests(requests));
    } catch (error) {
      dispatch(
        setSupportError(error.message || "Failed to load support requests")
      );
    } finally {
      dispatch(setSupportLoading(false));
    }
  };

  // Initial data loading
  useEffect(() => {
    loadUsers();
    loadQuoteRequests();
    loadSupportRequests();
    loadInventoryItems();
  }, []);

  // Error handling with proper cleanup
  useEffect(() => {
    if (quoteError) {
      alert(quoteError); // Changed from confirm() to alert()
      dispatch(setQuoteError(null));
    }
  }, [quoteError, dispatch]);

  useEffect(() => {
    if (supportError) {
      alert(supportError); // Changed from confirm() to alert()
      dispatch(setSupportError(null));
    }
  }, [supportError, dispatch]);

  // Delete functions with proper error handling
  const deleteQuoteTicket = async (activeTicketId) => {
    if (
      !window.confirm("Are you sure you want to delete this quote request?")
    ) {
      return;
    }

    try {
      await quoteRequestsAPI.deleteQuote(activeTicketId);
      dispatch(deleteQuoteRequest(activeTicketId));
    } catch (error) {
      dispatch(
        setQuoteError(error.message || "Failed to delete quote request")
      );
    }
  };

  // Update tickets based on active tab
  useEffect(() => {
    if (activeTab === "quotes") {
      setTickets(quoteRequests);
    } else {
      setTickets(supportRequests);
    }
  }, [quoteRequests, supportRequests, activeTab]);

  // Update selected ticket state
  useEffect(() => {
    if (selectedTicket && selectedTicket._id) {
      setNewStatus(selectedTicket.status || "pending");
      setNewAssign(selectedTicket.assignedTechnic || "");
    }
  }, [selectedTicket]);

  // Helper functions
  const getPriorityColor = (priority = "medium") => {
    switch (priority.toLowerCase()) {
      case "express":
      case "critical":
        return "bg-red-100 text-red-800";
      case "standard":
      case "high":
        return "bg-orange-100 text-orange-800";
      case "sameday":
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
      case "open":
        return "bg-orange-100 text-orange-800";
      case "quoted":
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "accepted":
      case "resolved":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket?.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket?._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket?.issue?.toLowerCase().includes(searchTerm.toLowerCase());

    const priority =
      activeTab === "quotes" ? ticket?.timeline : ticket?.urgency;
    const matchesPriority =
      priorityFilter === "all" || priority?.toLowerCase() === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
    setNewStatus(ticket.status || "pending");
    setNewAssign(ticket.assignedTechnic || "");
  };

  const handleUpdateTicketStatus = async (ticketId) => {
    if (!selectedTicket) return;

    if (
      user?.role !== "admin" &&
      user?.name !==
        technicians.find((tech) => tech._id === selectedTicket.assignedTechnic)
          ?.name
    ) {
      alert("You can only update your own tickets.");
      return;
    }

    try {
      if (activeTab === "quotes") {
        await quoteRequestsAPI.updateQuotebyTech(ticketId, {
          status: newStatus,
          assignedTechnic: newAssign,
        });
        dispatch(
          updateQuoteRequest({
            _id: ticketId,
            status: newStatus,
            assignedTechnic: newAssign,
          })
        );
      } else {
        await supportRequestsAPI.updateRequestbyTechnician(ticketId, {
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
      }
      setShowTicketModal(false);
      alert("Ticket updated successfully!");
    } catch (error) {
      const errorMessage = error.message || "Failed to update ticket";
      if (activeTab === "quotes") {
        dispatch(setQuoteError(errorMessage));
      } else {
        dispatch(setSupportError(errorMessage));
      }
      console.error("Update error:", error);
    }
  };

  const handleDeleteTicket = (ticketId) => {
    if (activeTab === "quotes") {
      deleteQuoteTicket(ticketId);
    } else {
      deleteSupportRequest(ticketId);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriorityFilter("all");
  }; 
  

  // Show loading state
  if (loading || quoteLoading || supportLoading) {
    return (
      <AdminLayout title="Technician Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Technician Dashboard">
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("quotes")}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "quotes"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Quote Requests ({quoteRequests.length})
            </button>
            <button
              onClick={() => setActiveTab("support")}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "support"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Support Tickets ({supportRequests.length})
            </button>
          </nav>
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
              {activeTab === "quotes" ? (
                <>
                  <option value="express">Express</option>
                  <option value="standard">Standard</option>
                  <option value="sameday">Same Day</option>
                </>
              ) : (
                <>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </>
              )}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              <FunnelIcon className="h-4 w-4 inline mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tickets Display */}
      {activeTab === "quotes" ? (
        // Quote Requests Display
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quote Requests
            </h3>
            <div className="space-y-4">
              {filteredTickets.map((quote) => (
                <div
                  key={quote?._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {quote?.userId?.name || "Unknown User"}
                    </h4>
                    <div className="flex">
                      <p className="text-sm text-gray-500">
                        {quote?.serviceType || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500 ml-2">
                        || {quote?.timeline || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex px-5 text-black flex-1 justify-end">
                    <h1>
                      {quote?.status.charAt(0).toUpperCase() +
                        quote.status?.slice(1)}
                    </h1>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewTicket(quote)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTicket(quote?._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Ticket"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Support Tickets Display
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
                            {ticket?.userId?.name || "Unknown User"} (
                            {ticket?.userId?.accType || "N/A"})
                          </p>
                          <p className="ml-2">
                            ||{" "}
                            {ticket?.device
                              ? ticket.device.charAt(0).toUpperCase() +
                                ticket.device.slice(1)
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewTicket(ticket)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTicket(ticket?._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Ticket"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      {ticket?.issue || "No issue description"}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>
                        Created:{" "}
                        {ticket?.createdAt
                          ? new Date(ticket.createdAt).toLocaleString()
                          : "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                          ticket?.urgency
                        )}`}
                      >
                        {ticket?.urgency || "N/A"}
                      </span>
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          ticket?.status
                        )}`}
                      >
                        {ticket?.status || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 text-gray-900">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {activeTab === "quotes" ? "Quote" : "Ticket"} Details -{" "}
                  {selectedTicket._id}
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
                      {selectedTicket?.userId?.name || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      {selectedTicket?.userId?.accType || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedTicket?.userId?.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-3">
                    {activeTab === "quotes" ? "Quote" : "Ticket"} Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    {activeTab === "quotes" ? (
                      <p className="font-medium text-gray-600">
                        <span>Service Type:</span>{" "}
                        {selectedTicket?.serviceType || "N/A"}
                      </p>
                    ) : (
                      <p className="font-medium text-gray-600">
                        <span>Device:</span> {selectedTicket?.device || "N/A"}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Priority:</span>
                      <span
                        className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          activeTab === "quotes"
                            ? selectedTicket?.timeline
                            : selectedTicket?.urgency
                        )}`}
                      >
                        {activeTab === "quotes"
                          ? selectedTicket?.timeline || "N/A"
                          : selectedTicket?.urgency || "N/A"}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>
                      <span
                        className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          selectedTicket?.status
                        )}`}
                      >
                        {selectedTicket?.status || "N/A"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {activeTab === "support" && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Issue Description
                  </h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedTicket?.issue || "No issue description provided"}
                  </p>
                </div>
              )}

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Timeline
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    Created:{" "}
                    {selectedTicket?.createdAt
                      ? new Date(selectedTicket.createdAt).toLocaleString()
                      : "Unknown"}
                  </p>
                  <p>
                    Last Update:{" "}
                    {selectedTicket?.updatedAt
                      ? new Date(selectedTicket.updatedAt).toLocaleString()
                      : "Unknown"}
                  </p>
                  {selectedTicket?.estimatedCompletion && (
                    <p>Est. Completion: {selectedTicket.estimatedCompletion}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Assigned Technician
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    Assigned:{" "}
                    {newAssign
                      ? technicians.find((tech) => tech._id === newAssign)
                          ?.name || "Unknown"
                      : "No one"}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Inventory
                </label>
                <select
                  value={newAssign}
                  onChange={(e) => setNewAssign(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No one</option>
                  {inventoryItems.map((tech) => (
                    <option key={tech?._id} value={tech?._id}>
                      {tech?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
                >
                  Close
                </button>
                <button
                  onClick={() => handleUpdateTicketStatus(selectedTicket._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredTickets?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No {activeTab === "quotes" ? "quotes" : "tickets"} found!
          </p>
        </div>
      )}
    </AdminLayout>
  );
}
