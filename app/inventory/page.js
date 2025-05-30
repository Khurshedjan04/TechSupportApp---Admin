"use client";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import AdminLayout from "../AdminLayout";
import { useState, useEffect, use } from "react";
import useAuthCheck from "../hooks/checkAuth";
import { inventoryAPI } from "../services/api"; // Adjust the import path as needed
import { useSelector } from "react-redux";

export default function AdminInventory() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  useAuthCheck('admin');

  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    quantity: 0,
    minimumStock: 0,
    price: 0,
  });

  const [itemData, setItemData] = useState({
    quantity: 0,
    minimumStock: 0,
    price: 0,
  });

  // Load inventory items on component mount
  useEffect(() => {
    loadInventoryItems();
  }, []);

  const loadInventoryItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryAPI.getAllInventoryItems();
      const items = (response.data || response).map((item) => ({
        ...item,
        minimumStock: item.minimumStock || item.minimumStock,
      }));
      setInventoryItems(items);
    } catch (err) {
      console.error("Error loading inventory items:", err);
      setError("Failed to load inventory items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(inventoryItems.map((item) => item.category))];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "in stock":
        return "bg-green-100 text-green-800";
      case "low stock":
        return "bg-yellow-100 text-yellow-800";
      case "out of stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStockStatus = (quantity, minStock) => {
    if (quantity === 0) return "Out of Stock";
    if (quantity <= minStock) return "Low Stock";
    return "In Stock";
  };

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || item.status?.toLowerCase() === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const handleAddItem = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const itemData = {
        ...newItem,
        status: getStockStatus(newItem.quantity, newItem.minimumStock),
      };
      console.log("Sending item data:", itemData);

      const response = await inventoryAPI.createInventoryItem(itemData);

      // Add the new item to the local state
      setInventoryItems([...inventoryItems, response.data || response]);

      // Reset form
      setNewItem({
        name: "",
        category: "",
        quantity: 0,
        minimumStock: 0,
        price: 0,
      });

      setShowAddItemModal(false);
    } catch (err) {
      console.error("Error adding item:", err);
      setError("Failed to add item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStock = async (itemId) => {
    if(user?.role !== "admin") {
      alert("You do not have permission to update stock.");
      return;
    }
    const item = inventoryItems.find((i) => i._id === itemId);
    if (!item) return;
    setItemData({
      quantity: item.quantity,
      minimumStock: item.minimumStock || item.minStock, // Handle naming inconsistency
      price: item.price,
    });
    setSelectedItem(item); // Set the selected item for editing
    setShowUpdateForm(true);
  };

  const handleEditItem = async (itemId, updateData) => {
    if (!itemId) {
      setError("Cannot update item: Invalid item ID.");
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      const updatedItem = {
        ...updateData,
        status: getStockStatus(updateData.quantity, updateData.minimumStock),
      };
      const response = await inventoryAPI.updateInventoryItem(
        itemId,
        updatedItem
      );
      if (!response || (!response.data && !response)) {
        throw new Error("Invalid response from API");
      }
      const updated = response.data || response;
      setInventoryItems(
        inventoryItems.map((item) =>
          item._id === itemId ? { ...item, ...updated } : item
        )
      );
      setShowUpdateForm(false); // Close the update modal
    } catch (err) {
      console.error("Error updating item:", err);
      setError("Failed to update item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      await inventoryAPI.deleteInventoryItem(itemId);

      // Remove item from local state
      setInventoryItems(inventoryItems.filter((item) => item._id !== itemId));

      if (selectedItem && selectedItem._id === itemId) {
        setShowItemModal(false);
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      setError("Failed to delete item. Please try again.");
    }
  };

  const lowStockItems = inventoryItems.filter(
    (item) => item.quantity <= item.minimumStock && item.quantity > 0
  );
  const outOfStockItems = inventoryItems.filter((item) => item.quantity === 0);
  const totalValue = inventoryItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  // Loading state
  if (loading) {
    return (
      <AdminLayout title="Inventory Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Inventory Management">
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg p-1.5 hover:bg-red-100"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mt-4 flex justify-end w-full sm:mt-0 sm:ml-4">
          <button
            onClick={loadInventoryItems}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowAddItemModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CubeIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Items
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {inventoryItems.length}
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
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Low Stock
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {inventoryItems.filter(item => item.status === "low-stock").length}
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
                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Out of Stock
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                  {inventoryItems.filter(item => item.status === "out-of-stock").length}
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
                    Total Value
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    ${totalValue.toFixed(2)}
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
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="in stock">In Stock</option>
              <option value="low stock">Low Stock</option>
              <option value="out of stock">Out of Stock</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
                setStatusFilter("all");
              }}
              className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.name}
                    </div>
                    <div className="text-sm text-gray-500">{item.sku}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.quantity}</div>
                  <div className="text-sm text-gray-500">
                    Min: {item.minimumStock}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${item.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewItem(item)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleUpdateStock(item._id)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Update Stock"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Item"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Item Detail Modal */}
      {showItemModal && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 text-black">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Item Details - {selectedItem.name}
                </h3>
                <button
                  onClick={() => setShowItemModal(false)}
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
                    Item Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedItem.name}
                    </p>
                    <p>
                      <span className="font-medium">Category:</span>{" "}
                      {selectedItem.category}
                    </p>
                    <p>
                      <span className="font-medium">Supplier:</span>{" "}
                      {selectedItem.supplier}
                    </p>
                    <p>
                      <span className="font-medium">Location:</span>{" "}
                      {selectedItem.location}
                    </p>
                    <p>
                      <span className="font-medium">Unit Price:</span> $
                      {selectedItem.price}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Stock Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Current Stock:</span>{" "}
                      {selectedItem.quantity}
                    </p>
                    <p>
                      <span className="font-medium">Minimum Stock:</span>{" "}
                      {selectedItem.minimumStock}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>
                      <span
                        className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          selectedItem.status
                        )}`}
                      >
                        {selectedItem.status}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Last Restocked:</span>{" "}
                      {selectedItem.lastRestocked}
                    </p>
                    <p>
                      <span className="font-medium">Total Value:</span> $
                      {(selectedItem.quantity * selectedItem.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Quick Stock Update
                </h4>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-medium">
                    {selectedItem.quantity}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowItemModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Add New Inventory Item
                </h3>
                <button
                  onClick={() => setShowAddItemModal(false)}
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
                  handleAddItem();
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newItem.name}
                      onChange={(e) =>
                        setNewItem({ ...newItem, name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={newItem.category}
                      onChange={(e) =>
                        setNewItem({ ...newItem, category: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                      <option value="Memory">Memory</option>
                      <option value="Storage">Storage</option>
                      <option value="Power">Power</option>
                      <option value="Motherboard">Motherboard</option>
                      <option value="Graphics">Graphics</option>
                      <option value="Processor">Processor</option>
                      <option value="Networking">Networking</option>
                      <option value="Battery">Battery</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newItem.price}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="text"
                      value={newItem.quantity}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          quantity: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Stock Level
                    </label>
                    <input
                      type="text"
                      value={newItem.minimumStock}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          minimumStock: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddItemModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Adding..." : "Add Item"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showUpdateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Update Inventory Item
                </h3>
                <button
                  onClick={() => setShowAddItemModal(false)}
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
                  const updatedData = {
                    ...itemData,
                    status: getStockStatus(
                      itemData.quantity,
                      itemData.minimumStock
                    ),
                  };
                  handleEditItem(selectedItem._id, updatedData);
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={itemData.price}
                      onChange={(e) =>
                        setItemData({
                          ...itemData,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="text"
                      value={itemData.quantity}
                      onChange={(e) =>
                        setItemData({
                          ...itemData,
                          quantity: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Stock Level
                    </label>
                    <input
                      type="text"
                      value={itemData.minimumStock}
                      onChange={(e) =>
                        setItemData({
                          ...itemData,
                          minimumStock: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowUpdateForm(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Updating..." : "Update Item"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {filteredItems.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {inventoryItems.length === 0
              ? 'No inventory items found. Click "Add Item" to get started.'
              : "No inventory items found matching your criteria."}
          </p>
        </div>
      )}
    </AdminLayout>
  );
}
