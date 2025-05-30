"use client";
import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import {
  TicketIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";
import useAuthCheck from "./hooks/checkAuth";
import { useDispatch, useSelector } from "react-redux";
import {
  setError,
  setLoading,
  setSupportRequests,
} from "./store/slices/supportRequestsSlice";
import {
  setError as setQuoteError,
  setLoading as setQuoteLoading,
  setQuoteRequests,
} from "./store/slices/quoteRequestsSlice";
import { quoteRequestsAPI, supportRequestsAPI, usersAPI } from "./services/api";
import { setUsers } from "./store/slices/usersSlice";

export default function AdminDashboard() {
  useAuthCheck();
  const dispatch = useDispatch();
  // user
  const user = useSelector((state) => state.auth.user);

  // tickets
  const { supportRequests, loading, stats, filters } = useSelector(
    (state) => state.supportRequests
  );
  const { users } = useSelector((state) => state.users);

  const [tickets, setTickets] = useState([]);
  useEffect(() => {
    loadSupportRequests();
    loadQuoteRequests();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    dispatch(setLoading(true));

    try {
      const requests = await usersAPI.getAllUsers();
      dispatch(setUsers(requests));
      console.log(users);
    } catch (error) {
      console.log(error);
    }
  };

  const loadSupportRequests = async () => {
    dispatch(setLoading(true));

    try {
      const requests = await supportRequestsAPI.getAllRequests();
      dispatch(setSupportRequests(requests));
    } catch (error) {
      dispatch(setError(error.message));
    }
  };

  useEffect(() => {
    setTickets(supportRequests);
  }, [supportRequests]);

  // quotes
  const { quoteRequests } = useSelector((state) => state.quoteRequests);
  const [quotes, setquotes] = useState([]);

  const loadQuoteRequests = async () => {
    dispatch(setQuoteLoading(true));

    try {
      const requests = await quoteRequestsAPI.getAllQuotes();
      console.log("QUOTE REQUESTS:", requests);
      dispatch(setQuoteRequests(requests));
    } catch (error) {
      dispatch(setQuoteError(error.message));
    }
  };

  useEffect(() => {
    setquotes(quoteRequests);
  }, [quoteRequests]);

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "in progress":
        return "text-blue-600 bg-blue-100";
      case "open":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <AdminLayout title="Dashboard Overview">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TicketIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Tickets
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {tickets.length}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                      <span className="sr-only">Increased by</span>
                      12%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.pending}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                      <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                      <span className="sr-only">Increased by</span>3
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.reviewed}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                      <span className="sr-only">Increased by</span>5
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tickets */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Support Tickets
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {tickets.map((ticket, index) => (
                  <li key={ticket?._id}>
                    <div className="relative pb-8">
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                            <TicketIcon className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <div className="text-sm">
                              <span className="text-gray-500">
                                {ticket.userId.name}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-700">
                            <p>{ticket.issue}</p>
                            <div className="mt-2 flex space-x-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                                  ticket.urgency
                                )}`}
                              >
                                {ticket.urgency}
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  ticket.status
                                )}`}
                              >
                                {ticket.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <button className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                View all tickets
              </button>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quotes
            </h3>
            <div className="space-y-4">
              {quoteRequests.map((quote) => (
                <div
                  key={quote?._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {quote?.userId?.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {quote?.serviceType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${quote.budget}
                    </p>
                    <p className="text-sm text-gray-500">{quote.timeline}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                View full schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
