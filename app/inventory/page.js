'use client'
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
  CubeIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../AdminLayout';
import { useState } from 'react';
import useAuthCheck from '../hooks/checkAuth';

export default function AdminInventory() {

  useAuthCheck();
  const [inventoryItems, setInventoryItems] = useState([
    {
      id: 1,
      name: 'RAM DDR4 8GB',
      category: 'Memory',
      sku: 'RAM-DDR4-8GB-001',
      quantity: 15,
      minStock: 5,
      unitPrice: 75.99,
      supplier: 'TechSupply Co.',
      location: 'Shelf A-1',
      lastRestocked: '2024-05-15',
      status: 'In Stock'
    },
    {
      id: 2,
      name: 'SSD 1TB SATA',
      category: 'Storage',
      sku: 'SSD-1TB-SATA-002',
      quantity: 8,
      minStock: 3,
      unitPrice: 129.99,
      supplier: 'StorageTech Inc.',
      location: 'Shelf B-2',
      lastRestocked: '2024-05-20',
      status: 'In Stock'
    },
    {
      id: 3,
      name: 'Power Supply 650W',
      category: 'Power',
      sku: 'PSU-650W-003',
      quantity: 2,
      minStock: 5,
      unitPrice: 89.99,
      supplier: 'PowerParts Ltd.',
      location: 'Shelf C-1',
      lastRestocked: '2024-05-10',
      status: 'Low Stock'
    },
    {
      id: 4,
      name: 'Motherboard ATX',
      category: 'Motherboard',
      sku: 'MB-ATX-004',
      quantity: 0,
      minStock: 2,
      unitPrice: 189.99,
      supplier: 'CompuBoard Corp.',
      location: 'Shelf D-1',
      lastRestocked: '2024-04-25',
      status: 'Out of Stock'
    },
    {
      id: 5,
      name: 'Graphics Card GTX',
      category: 'Graphics',
      sku: 'GPU-GTX-005',
      quantity: 3,
      minStock: 2,
      unitPrice: 299.99,
      supplier: 'GraphiCore Systems',
      location: 'Shelf E-1',
      lastRestocked: '2024-05-18',
      status: 'In Stock'
    },
    {
      id: 6,
      name: 'CPU Intel i5',
      category: 'Processor',
      sku: 'CPU-I5-006',
      quantity: 6,
      minStock: 3,
      unitPrice: 249.99,
      supplier: 'ProcessorPro Inc.',
      location: 'Shelf F-1',
      lastRestocked: '2024-05-12',
      status: 'In Stock'
    },
    {
      id: 7,
      name: 'Network Cable Cat6',
      category: 'Networking',
      sku: 'NET-CAT6-007',
      quantity: 50,
      minStock: 20,
      unitPrice: 2.99,
      supplier: 'NetworkPlus Co.',
      location: 'Shelf G-1',
      lastRestocked: '2024-05-22',
      status: 'In Stock'
    },
    {
      id: 8,
      name: 'Laptop Battery',
      category: 'Battery',
      sku: 'BAT-LAP-008',
      quantity: 1,
      minStock: 5,
      unitPrice: 59.99,
      supplier: 'BatteryWorld Inc.',
      location: 'Shelf H-1',
      lastRestocked: '2024-05-08',
      status: 'Low Stock'
    }
  ]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    sku: '',
    quantity: 0,
    minStock: 0,
    unitPrice: 0,
    supplier: '',
    location: ''
  });

  const categories = [...new Set(inventoryItems.map(item => item.category))];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'in stock': return 'bg-green-100 text-green-800';
      case 'low stock': return 'bg-yellow-100 text-yellow-800';
      case 'out of stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (quantity, minStock) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= minStock) return 'Low Stock';
    return 'In Stock';
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.sku && newItem.category) {
      const item = {
        id: inventoryItems.length + 1,
        ...newItem,
        lastRestocked: new Date().toISOString().split('T')[0],
        status: getStockStatus(newItem.quantity, newItem.minStock)
      };
      setInventoryItems([...inventoryItems, item]);
      setNewItem({
        name: '',
        category: '',
        sku: '',
        quantity: 0,
        minStock: 0,
        unitPrice: 0,
        supplier: '',
        location: ''
      });
      setShowAddItemModal(false);
    }
  };

  const handleUpdateStock = (itemId, newQuantity) => {
    setInventoryItems(inventoryItems.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            quantity: newQuantity, 
            status: getStockStatus(newQuantity, item.minStock),
            lastRestocked: new Date().toISOString().split('T')[0]
          }
        : item
    ));
  };

  const lowStockItems = inventoryItems.filter(item => item.quantity <= item.minStock && item.quantity > 0);
  const outOfStockItems = inventoryItems.filter(item => item.quantity === 0);
  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <AdminLayout title="Inventory Management">
      {/* Header Actions */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mt-4 flex justify-end w-full sm:mt-0 sm:ml-4">
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Items</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{inventoryItems.length}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Low Stock</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{lowStockItems.length}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Out of Stock</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{outOfStockItems.length}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Value</dt>
                  <dd className="text-2xl font-semibold text-gray-900">${totalValue.toFixed(2)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="mb-6 space-y-3">
          {outOfStockItems.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Out of Stock Alert
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{outOfStockItems.length} items are out of stock: {outOfStockItems.map(item => item.name).join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {lowStockItems.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Low Stock Warning
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>{lowStockItems.length} items are running low: {lowStockItems.map(item => item.name).join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
                setSearchTerm('');
                setCategoryFilter('all');
                setStatusFilter('all');
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
                SKU
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
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.supplier}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.quantity}</div>
                  <div className="text-sm text-gray-500">Min: {item.minStock}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${item.unitPrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewItem(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleUpdateStock(item.id, item.quantity + 1)}
                      className="text-green-600 hover:text-green-900"
                    >
                      <ArrowUpIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleUpdateStock(item.id, Math.max(0, item.quantity - 1))}
                      className="text-red-600 hover:text-red-900"
                    >
                      <ArrowDownIcon className="h-4 w-4" />
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
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
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Item Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedItem.name}</p>
                    <p><span className="font-medium">SKU:</span> {selectedItem.sku}</p>
                    <p><span className="font-medium">Category:</span> {selectedItem.category}</p>
                    <p><span className="font-medium">Unit Price:</span> ${selectedItem.unitPrice}</p>
                    <p><span className="font-medium">Supplier:</span> {selectedItem.supplier}</p>
                    <p><span className="font-medium">Location:</span> {selectedItem.location}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Stock Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Current Stock:</span> {selectedItem.quantity}</p>
                    <p><span className="font-medium">Minimum Stock:</span> {selectedItem.minStock}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedItem.status)}`}>
                        {selectedItem.status}
                      </span>
                    </p>
                    <p><span className="font-medium">Last Restocked:</span> {selectedItem.lastRestocked}</p>
                    <p><span className="font-medium">Total Value:</span> ${(selectedItem.quantity * selectedItem.unitPrice).toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Stock Update</h4>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleUpdateStock(selectedItem.id, selectedItem.quantity - 1)}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200"
                    disabled={selectedItem.quantity === 0}
                  >
                    -1
                  </button>
                  <span className="text-lg font-medium">{selectedItem.quantity}</span>
                  <button
                    onClick={() => handleUpdateStock(selectedItem.id, selectedItem.quantity + 1)}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm hover:bg-green-200"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => handleUpdateStock(selectedItem.id, selectedItem.quantity + 10)}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200"
                  >
                    +10
                  </button>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowItemModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
                >
                  Close
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
                  Edit Item
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
                <h3 className="text-lg font-medium text-gray-900">Add New Inventory Item</h3>
                <button
                  onClick={() => setShowAddItemModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAddItem(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU *
                    </label>
                    <input
                      type="text"
                      required
                      value={newItem.sku}
                      onChange={(e) => setNewItem({...newItem, sku: e.target.value})}
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
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem({...newItem, unitPrice: parseFloat(e.target.value)})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Quantity
                    </label>
                    <input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Stock Level
                    </label>
                    <input
                      type="number"
                      value={newItem.minStock}
                      onChange={(e) => setNewItem({...newItem, minStock: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier
                    </label>
                    <input
                      type="text"
                      value={newItem.supplier}
                      onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Storage Location
                    </label>
                    <input
                      type="text"
                      value={newItem.location}
                      onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddItemModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No inventory items found matching your criteria.</p>
        </div>
      )}
    </AdminLayout>
  );
}