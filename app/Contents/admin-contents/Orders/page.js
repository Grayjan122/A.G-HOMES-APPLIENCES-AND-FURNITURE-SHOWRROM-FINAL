'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { showAlertError } from '@/app/Components/SweetAlert/error';
import { AlertSucces } from '@/app/Components/SweetAlert/success';

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showPastOrdersModal, setShowPastOrdersModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelNotes, setCancelNotes] = useState('');
  const [selectedCancelReason, setSelectedCancelReason] = useState('');
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelError, setCancelError] = useState('');
  const [pastOrders, setPastOrders] = useState([]);
  const [loadingPastOrders, setLoadingPastOrders] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pastOrdersCurrentPage, setPastOrdersCurrentPage] = useState(1);
  const [pastOrdersTotal, setPastOrdersTotal] = useState(0);
  const [approveForm, setApproveForm] = useState({
    delivery_fee: 0,
    delivery_fees_by_location: {}, // Object to store delivery fees by location: { location_id: fee }
    adjusted_total: null,
    item_prices: {}, // Object to store adjusted prices for each item: { item_id: adjusted_price }
    item_adjustment_notes: {} // Object to store adjustment notes for each item: { item_id: note }
  });
  const [locations, setLocations] = useState([]); // Store location details for display

  const BASE_URL = typeof window !== 'undefined' 
    ? (window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.')
      ? `http://${window.location.hostname}/capstone-api/api/`
      : 'https://ag-home.site/backend/api/')
    : 'http://localhost/capstone-api/api/';

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when status changes
    fetchOrders();
  }, [selectedStatus]);

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        operation: 'GetAllOrders'
      };
      
      // Build JSON parameter - fetch all orders, then paginate on frontend
      const jsonData = {
        limit: 1000, // Get more to filter, then paginate on frontend
        offset: 0
      };
      
      if (selectedStatus && selectedStatus !== 'all') {
        jsonData.status = selectedStatus;
      }
      
      params.json = JSON.stringify(jsonData);

      console.log('Fetching orders with params:', params);
      const response = await axios.get(BASE_URL + 'orders.php', { params });

      console.log('Orders API response:', response.data);

      if (response.data && response.data.success) {
        let ordersList = response.data.orders || [];
        
        // Filter out cancelled and delivered orders (they should only appear in past orders)
        ordersList = ordersList.filter(order => {
          const status = (order.status || '').toLowerCase().trim();
          return status !== 'cancelled' && status !== 'delivered';
        });
        
        // Set total for pagination
        setTotalOrders(ordersList.length);
        
        // Apply pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedOrders = ordersList.slice(startIndex, endIndex);
        
        // Only fetch full details if we have orders and it's manageable
        if (paginatedOrders.length > 0 && paginatedOrders.length <= 50) {
          // Fetch full details for each order
          const ordersWithDetails = await Promise.all(
            paginatedOrders.map(async (order) => {
              try {
                const detailResponse = await axios.get(BASE_URL + 'orders.php', {
                  params: {
                    json: JSON.stringify({ order_id: order.order_id || order.ecommerce_order_id }),
                    operation: 'GetOrderById'
                  }
                });
                return detailResponse.data && detailResponse.data.success ? detailResponse.data.order : order;
              } catch (err) {
                console.error('Error fetching order details:', err);
                return order; // Return basic order if details fail
              }
            })
          );
          setOrders(ordersWithDetails);
        } else {
          // If too many orders, just use the basic list
          setOrders(paginatedOrders);
        }
      } else {
        const errorMessage = response.data?.message || 'Failed to load orders';
        console.error('Orders API error:', errorMessage, response.data);
        showAlertError({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          button: 'OK'
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error response:', error.response?.data);
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || error.message || 'Failed to load orders. Please try again.',
        button: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPastOrders = async () => {
    try {
      setLoadingPastOrders(true);
      const params = {
        operation: 'GetAllOrders'
      };
      
      const jsonData = {
        limit: 1000, // Get more to filter, then paginate on frontend
        offset: 0
      };
      
      params.json = JSON.stringify(jsonData);

      const response = await axios.get(BASE_URL + 'orders.php', { params });

      if (response.data && response.data.success) {
        let ordersList = response.data.orders || [];
        
        // Filter to show only cancelled and delivered orders
        ordersList = ordersList.filter(order => {
          const status = (order.status || '').toLowerCase().trim();
          return status === 'cancelled' || status === 'delivered';
        });
        
        // Sort by updated_at (latest update first), then by created_at as fallback
        ordersList.sort((a, b) => {
          const dateA = new Date(a.updated_at || a.order_date || a.created_at || 0);
          const dateB = new Date(b.updated_at || b.order_date || b.created_at || 0);
          return dateB - dateA; // Descending order (newest first)
        });
        
        // Set total for pagination
        setPastOrdersTotal(ordersList.length);
        
        // Apply pagination
        const startIndex = (pastOrdersCurrentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedOrders = ordersList.slice(startIndex, endIndex);
        
        // Fetch full details if manageable
        if (paginatedOrders.length > 0 && paginatedOrders.length <= 50) {
          const ordersWithDetails = await Promise.all(
            paginatedOrders.map(async (order) => {
              try {
                const detailResponse = await axios.get(BASE_URL + 'orders.php', {
                  params: {
                    json: JSON.stringify({ order_id: order.order_id || order.ecommerce_order_id }),
                    operation: 'GetOrderById'
                  }
                });
                return detailResponse.data && detailResponse.data.success ? detailResponse.data.order : order;
              } catch (err) {
                console.error('Error fetching order details:', err);
                return order;
              }
            })
          );
          setPastOrders(ordersWithDetails);
        } else {
          setPastOrders(paginatedOrders);
        }
      }
    } catch (error) {
      console.error('Error fetching past orders:', error);
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load past orders. Please try again.',
        button: 'OK'
      });
    } finally {
      setLoadingPastOrders(false);
    }
  };

  const handleOpenPastOrders = () => {
    setPastOrdersCurrentPage(1); // Reset to first page
    setShowPastOrdersModal(true);
    fetchPastOrders();
  };

  useEffect(() => {
    if (showPastOrdersModal && pastOrdersCurrentPage) {
      fetchPastOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pastOrdersCurrentPage]);

  // Pagination helpers
  const totalPages = Math.ceil(totalOrders / itemsPerPage);
  const pastOrdersTotalPages = Math.ceil(pastOrdersTotal / itemsPerPage);
  
  const getPageNumbers = (current, total) => {
    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(1, current - Math.floor(maxPages / 2));
    let endPage = Math.min(total, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleApproveOrder = async (order) => {
    console.log('handleApproveOrder called with order:', order);
    setSelectedOrder(order);
    
        // Initialize item prices with current prices
        const itemPrices = {};
        const itemAdjustmentNotes = {};
        if (order.items && Array.isArray(order.items) && order.items.length > 0) {
          order.items.forEach((item, idx) => {
            const itemId = item.order_item_id || item.ecommerce_order_item_id || `item_${idx}`;
            itemPrices[itemId] = parseFloat(item.price || item.unit_price || 0);
            itemAdjustmentNotes[itemId] = item.price_adjustment_notes || '';
          });
        } else {
          console.warn('Order has no items array or items is empty:', order);
        }
    
    // Check if items are from different locations
    const locationIds = new Set();
    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      order.items.forEach(item => {
        if (item.source_location_id) {
          locationIds.add(item.source_location_id);
        }
      });
    }
    
    // Fetch location details if items have source_location_id
    const locationDetails = {};
    if (locationIds.size > 0) {
      try {
        const locationPromises = Array.from(locationIds).map(async (locId) => {
          try {
            const response = await axios.get(BASE_URL + 'location.php', {
              params: {
                json: JSON.stringify({ locID: locId }),
                operation: 'GetLocationDetails'
              }
            });
            return { id: locId, details: response.data[0] || {} };
          } catch (err) {
            console.error(`Error fetching location ${locId}:`, err);
            return { id: locId, details: { location_name: `Location ${locId}` } };
          }
        });
        const locationResults = await Promise.all(locationPromises);
        locationResults.forEach(({ id, details }) => {
          locationDetails[id] = details;
        });
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    }
    setLocations(locationDetails);
    
    // Group items by location and initialize delivery fees
    const deliveryFeesByLocation = {};
    if (locationIds.size > 1) {
      // Multiple locations - initialize delivery fee per location
      locationIds.forEach(locId => {
        deliveryFeesByLocation[locId] = 0;
      });
    }
    
        setApproveForm({
          delivery_fee: parseFloat(order.delivery_fee) || 0,
          delivery_fees_by_location: deliveryFeesByLocation,
          adjusted_total: null, // Will be calculated: currentSubtotal + delivery_fee
          item_prices: itemPrices, // Store current prices for each item
          item_adjustment_notes: itemAdjustmentNotes // Store adjustment notes for each item
        });
    
    console.log('Setting showApproveModal to true, selectedOrder:', order);
    setShowApproveModal(true);
  };

  const submitApproveOrder = async () => {
    // Calculate total delivery fee
    let totalDeliveryFee = parseFloat(approveForm.delivery_fee) || 0;
    
    // If items are from different locations, sum up location-based delivery fees
    if (Object.keys(approveForm.delivery_fees_by_location || {}).length > 0) {
      totalDeliveryFee = Object.values(approveForm.delivery_fees_by_location).reduce((sum, fee) => {
        return sum + (parseFloat(fee) || 0);
      }, 0);
    }
    
    // Validate delivery fee
    if (totalDeliveryFee < 0) {
      showAlertError({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Delivery fee cannot be negative',
        button: 'OK'
      });
      return;
    }

    try {
      const userId = sessionStorage.getItem('user_id') || null;
      
      // Calculate subtotal from adjusted item prices
      let adjustedSubtotal = 0;
      if (selectedOrder.items && selectedOrder.items.length > 0) {
        adjustedSubtotal = selectedOrder.items.reduce((sum, item, idx) => {
          const itemId = item.order_item_id || item.ecommerce_order_item_id || `item_${idx}`;
          const adjustedPrice = approveForm.item_prices[itemId] !== undefined 
            ? parseFloat(approveForm.item_prices[itemId]) 
            : parseFloat(item.price || item.unit_price || 0);
          return sum + (adjustedPrice * parseInt(item.quantity || 1));
        }, 0);
      } else {
        // If no items, use the order total amount
        adjustedSubtotal = parseFloat(selectedOrder.total_amount || 0);
      }
      
      // Calculate adjusted total (subtotal + delivery fee, or use adjusted_total if set)
      const adjustedTotal = approveForm.adjusted_total !== null && approveForm.adjusted_total !== '' 
        ? parseFloat(approveForm.adjusted_total) 
        : (adjustedSubtotal + totalDeliveryFee);
      
      // Prepare item prices array for backend (only include items with valid IDs and price changes)
      const itemPricesArray = (selectedOrder.items && selectedOrder.items.length > 0) ? selectedOrder.items
        .map((item, idx) => {
          const itemId = item.order_item_id || item.ecommerce_order_item_id || `item_${idx}`;
          const currentPrice = parseFloat(item.price || item.unit_price || 0);
          const adjustedPrice = approveForm.item_prices[itemId] !== undefined 
            ? parseFloat(approveForm.item_prices[itemId]) 
            : currentPrice;
          const dbItemId = item.order_item_id || item.ecommerce_order_item_id;
          
          // Only include if we have a valid database ID and the price has changed
          if (dbItemId && adjustedPrice !== currentPrice) {
            const adjustmentNote = approveForm.item_adjustment_notes[itemId] || '';
            return {
              item_id: dbItemId,
              price: adjustedPrice,
              adjustment_note: adjustmentNote.trim() || null
            };
          }
          return null;
        })
        .filter(item => item !== null) : [];
      
      // Get order ID - handle both order_id and ecommerce_order_id
      const orderId = selectedOrder.order_id || selectedOrder.ecommerce_order_id;
      
      if (!orderId) {
        showAlertError({
          icon: 'error',
          title: 'Error',
          text: 'Order ID is missing. Please refresh the page and try again.',
          button: 'OK'
        });
        return;
      }

      console.log('Approving order with data:', {
        order_id: orderId,
        delivery_fee: totalDeliveryFee,
        delivery_fees_by_location: approveForm.delivery_fees_by_location,
        adjusted_total: adjustedTotal,
        item_prices: itemPricesArray
      });

      const response = await axios.get(BASE_URL + 'orders.php', {
        params: {
          json: JSON.stringify({
            order_id: orderId,
            delivery_fee: totalDeliveryFee,
            delivery_fees_by_location: approveForm.delivery_fees_by_location, // Send location-based fees
            adjusted_total: adjustedTotal,
            item_prices: itemPricesArray, // Send adjusted item prices
            updated_by: userId ? parseInt(userId) : null
          }),
          operation: 'ApproveOrder'
        }
      });

      console.log('Approve order response:', response.data);

      if (response.data && response.data.success) {
        AlertSucces('Order approved successfully!', 'success', true, 'OK');
        setShowApproveModal(false);
        setSelectedOrder(null);
        fetchOrders();
      } else {
        const errorMessage = response.data?.message || 'Failed to approve order';
        console.error('Approve order error:', errorMessage, response.data);
        showAlertError({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          button: 'OK'
        });
      }
    } catch (error) {
      console.error('Error approving order:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to approve order. Please try again.';
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        button: 'OK'
      });
    }
  };

  const handleCancelOrder = (order) => {
    console.log('handleCancelOrder called with order:', order);
    if (!order) {
      console.error('No order provided to handleCancelOrder');
      return;
    }
    setOrderToCancel(order);
    setCancelNotes('');
    setSelectedCancelReason('');
    setCancelError('');
    setShowCancelModal(true);
    console.log('Modal should be showing now');
  };

  // Pre-defined cancellation reasons
  const cancellationReasons = [
    { value: '', label: 'Select a reason (optional)' },
    { value: 'Can\'t deliver to that area', label: 'Can\'t deliver to that area' },
    { value: 'The products are currently unavailable', label: 'The products are currently unavailable' },
    { value: 'Out of stock', label: 'Out of stock' },
    { value: 'Customize material unavailable', label: 'Customize material unavailable' },
    { value: 'Customize notes is unclear', label: 'Customize notes is unclear' },
    { value: 'Payment issue', label: 'Payment issue' },
    { value: 'Invalid address', label: 'Invalid address' },
    { value: 'Customer unresponsive', label: 'Customer unresponsive' },
    { value: 'Order duplicate', label: 'Order duplicate' },
    { value: 'Other', label: 'Other (specify below)' }
  ];

  const handleCancelReasonChange = (e) => {
    const reason = e.target.value;
    setSelectedCancelReason(reason);
    
    // If a reason is selected (and not "Other"), auto-fill the textarea
    if (reason && reason !== 'Other') {
      setCancelNotes(reason);
      if (cancelError) setCancelError('');
    } else if (reason === 'Other') {
      // Clear notes when "Other" is selected to allow custom input
      setCancelNotes('');
    } else {
      // Clear notes when no reason is selected
      setCancelNotes('');
    }
  };

  const handleConfirmCancel = async () => {
    // Validate: If "Other" is selected, notes must be provided. Otherwise, a reason must be selected.
    if (selectedCancelReason === 'Other' && !cancelNotes.trim()) {
      setCancelError('Please specify the cancellation reason.');
      return;
    }
    if (!selectedCancelReason || selectedCancelReason === '') {
      setCancelError('Please select a cancellation reason.');
      return;
    }
    
    // Determine final notes: use selected reason if not "Other", otherwise use custom notes
    const finalNotes = selectedCancelReason === 'Other' ? cancelNotes.trim() : selectedCancelReason;
    
    if (!finalNotes) {
      setCancelError('Please provide a reason for cancelling this order.');
      return;
    }
    
    setCancelError('');

    if (!orderToCancel) return;

    const orderId = orderToCancel.order_id || orderToCancel.ecommerce_order_id;
    
    try {
      const userId = sessionStorage.getItem('user_id') || null;
      const response = await axios.get(BASE_URL + 'orders.php', {
        params: {
          json: JSON.stringify({
            order_id: orderId,
            notes: finalNotes,
            updated_by: userId ? parseInt(userId) : null,
            cancelled_by: 'admin' // Track that admin cancelled this order
          }),
          operation: 'CancelOrder'
        }
      });

      if (response.data.success) {
        AlertSucces('Order cancelled successfully!', 'success', true, 'OK');
        setShowCancelModal(false);
        setCancelNotes('');
        setSelectedCancelReason('');
        setCancelError('');
        setOrderToCancel(null);
        fetchOrders();
      } else {
        showAlertError({
          icon: 'error',
          title: 'Error',
          text: response.data.message || 'Failed to cancel order',
          button: 'OK'
        });
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: 'Failed to cancel order. Please try again.',
        button: 'OK'
      });
    }
  };

  const handleUpdateStatus = async (orderId, newStatus, notes = null) => {
    try {
      const userId = sessionStorage.getItem('user_id') || null;
      const response = await axios.get(BASE_URL + 'orders.php', {
        params: {
          json: JSON.stringify({
            order_id: orderId,
            status: newStatus,
            notes: notes || `Status changed to ${newStatus}`,
            updated_by: userId ? parseInt(userId) : null
          }),
          operation: 'UpdateOrderStatus'
        }
      });

      if (response.data.success) {
        AlertSucces(`Order status updated to ${newStatus}!`, 'success', true, 'OK');
        fetchOrders();
      } else {
        showAlertError({
          icon: 'error',
          title: 'Error',
          text: response.data.message || 'Failed to update order status',
          button: 'OK'
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update order status. Please try again.',
        button: 'OK'
      });
    }
  };

  const getStatusColor = (status) => {
    // Normalize status to handle database values
    const normalizedStatus = (status || '').toLowerCase().trim();
    switch (normalizedStatus) {
      case 'pending':
        return '#f59e0b';
      case 'approved':
      case 'approve':
        return '#3b82f6';
      case 'processing':
      case 'on going':
      case 'ongoing':
        return '#8b5cf6';
      case 'shipped':
      case 'on delivery':
      case 'ondelivery':
        return '#06b6d4';
      case 'delivered':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    // Normalize status and return user-friendly label
    const normalizedStatus = (status || '').toLowerCase().trim();
    const statusLabels = {
      'pending': 'Pending',
      'approved': 'Approved',
      'approve': 'Approved',
      'processing': 'On Going',
      'on going': 'On Going',
      'ongoing': 'On Going',
      'shipped': 'On Delivery',
      'on delivery': 'On Delivery',
      'ondelivery': 'On Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusLabels[normalizedStatus] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
      }}>
        <div className="spinner" style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className='customer-main'>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '2rem'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#2d3748'
          }}>
            Orders Management
          </h1>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {/* View Past Orders Button */}
            <button
              onClick={handleOpenPastOrders}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '2px solid #667eea',
                background: 'white',
                color: '#667eea',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f7fafc';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 6px rgba(102, 126, 234, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              📋 View Past Orders
            </button>
            
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: '#718096'
          }}>
            <p style={{ fontSize: '1.2rem' }}>No orders found</p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {orders.map((order) => {
              const orderId = order.order_id || order.ecommerce_order_id;
              // Normalize status to lowercase for comparison
              const orderStatus = (order.status || '').toLowerCase().trim();
              
              // Debug: Log order status for troubleshooting
              if (!orderStatus || orderStatus === '') {
                console.log('Order has no status or empty status:', order);
              }
              
              return (
              <div
                key={orderId}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: 'white'
                }}
              >
                {/* Order Header - Clickable */}
                <div 
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowOrderDetailsModal(true);
                  }}
                  style={{
                    padding: '1.5rem',
                    background: '#f7fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#edf2f7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f7fafc';
                  }}
                >
                  <div>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: '#2d3748',
                      marginBottom: '0.25rem'
                    }}>
                      {order.order_number || `Order #${orderId}`}
                    </h3>
                    <p style={{
                      color: '#718096',
                      fontSize: '0.9rem',
                      marginBottom: '0.25rem'
                    }}>
                      Customer: {order.customer_name || 'N/A'} ({order.email || 'N/A'})
                    </p>
                    <p style={{
                      color: '#718096',
                      fontSize: '0.9rem'
                    }}>
                      {formatDate(order.created_at || order.order_date)}
                    </p>
                    <p style={{
                      color: '#718096',
                      fontSize: '0.85rem',
                      marginTop: '0.5rem',
                      fontStyle: 'italic'
                    }}>
                      👆 Click to view details
                    </p>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      backgroundColor: getStatusColor(orderStatus) + '20',
                      color: getStatusColor(orderStatus),
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                      {getStatusLabel(orderStatus)}
                    </span>
                    <span style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: '#2d3748'
                    }}>
                      ₱{parseFloat(order.total_amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div style={{ 
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  background: 'white'
                }}
                onClick={(e) => e.stopPropagation()}
                >
                    {/* Show Approve button for pending orders or orders without status */}
                    {/* Show for: pending, empty status, or any status that's not approve/on going/on delivery/delivered/cancelled */}
                    {(!orderStatus || orderStatus === '' || orderStatus === 'pending' || 
                      !['approved', 'approve', 'processing', 'on going', 'ongoing', 'shipped', 'on delivery', 'ondelivery', 'delivered', 'cancelled'].includes(orderStatus)) && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Approve button clicked for order:', order, 'Status:', orderStatus);
                          handleApproveOrder(order);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          padding: '0.875rem 1.75rem',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '1rem',
                          boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 12px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.3)';
                        }}
                      >
                        ✅ Approve Order & Add Delivery Info
                      </button>
                    )}
                    {(orderStatus === 'shipped' || orderStatus === 'on delivery' || orderStatus === 'ondelivery') && (
                      <button
                        onClick={() => handleUpdateStatus(orderId, 'delivered')}
                        style={{
                          background: '#10b981',
                          color: 'white',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.95rem'
                        }}
                      >
                        Mark as Delivered
                      </button>
                    )}
                    {['pending', 'approved', 'approve'].includes(orderStatus) && (
                      <button
                        onClick={() => handleCancelOrder(order)}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.95rem'
                        }}
                      >
                        Cancel Order
                      </button>
                    )}
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalOrders > itemsPerPage && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid #e2e8f0',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                background: currentPage === 1 ? '#f7fafc' : 'white',
                color: currentPage === 1 ? '#cbd5e0' : '#2d3748',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== 1) {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.background = '#f7fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 1) {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.background = 'white';
                }
              }}
            >
              ← Previous
            </button>

            {getPageNumbers(currentPage, totalPages).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: `2px solid ${currentPage === pageNum ? '#667eea' : '#e2e8f0'}`,
                  background: currentPage === pageNum ? '#667eea' : 'white',
                  color: currentPage === pageNum ? 'white' : '#2d3748',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  minWidth: '40px'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== pageNum) {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.background = '#f7fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== pageNum) {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.background = 'white';
                  }
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                background: currentPage === totalPages ? '#f7fafc' : 'white',
                color: currentPage === totalPages ? '#cbd5e0' : '#2d3748',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== totalPages) {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.background = '#f7fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== totalPages) {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.background = 'white';
                }
              }}
            >
              Next →
            </button>

            <div style={{
              marginLeft: '1rem',
              fontSize: '0.9rem',
              color: '#718096',
              fontWeight: '500'
            }}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalOrders)} of {totalOrders} orders
            </div>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedOrder && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowApproveModal(false);
            }
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '95vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#2d3748',
                margin: 0
              }}>
                Approve Order: {selectedOrder.order_number || `Order #${selectedOrder.order_id || selectedOrder.ecommerce_order_id}`}
              </h2>
              <button
                onClick={() => setShowApproveModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#718096',
                  padding: '0.5rem',
                  lineHeight: '1',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f7fafc';
                  e.target.style.color = '#2d3748';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#718096';
                }}
              >
                ×
              </button>
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#718096',
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#e7f3ff',
              borderRadius: '8px',
              border: '2px solid #2196F3'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: '#0d47a1', fontSize: '1rem' }}>
                📋 Review Order & Approve
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
                Review the order items below, adjust individual product prices if needed, set delivery fee, then approve. Customer will be notified and can proceed with payment after approval.
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>

              {/* Order Summary with Editable Prices */}
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#f7fafc',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0'
                }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#2d3748' }}>
                    Order Items - Adjust Prices if Needed
                  </h3>
                  {(() => {
                    // Group items by location
                    const itemsByLocation = {};
                    selectedOrder.items.forEach((item, idx) => {
                      const locId = item.source_location_id || 'no_location';
                      if (!itemsByLocation[locId]) {
                        itemsByLocation[locId] = [];
                      }
                      itemsByLocation[locId].push({ ...item, originalIdx: idx });
                    });
                    
                    const locationIds = Object.keys(itemsByLocation);
                    const hasMultipleLocations = locationIds.length > 1;
                    
                    return locationIds.map((locId) => {
                      const locationItems = itemsByLocation[locId];
                      const locationName = locId !== 'no_location' && locations[locId] 
                        ? (locations[locId].location_name || locations[locId].branch_name || `Location ${locId}`)
                        : (locId === 'no_location' ? 'No Location Specified' : `Location ${locId}`);
                      
                      return (
                        <div key={locId} style={{
                          marginBottom: hasMultipleLocations ? '1.5rem' : '0',
                          padding: hasMultipleLocations ? '1rem' : '0',
                          background: hasMultipleLocations ? '#ffffff' : 'transparent',
                          borderRadius: hasMultipleLocations ? '8px' : '0',
                          border: hasMultipleLocations ? '2px solid #cbd5e0' : 'none'
                        }}>
                          {hasMultipleLocations && (
                            <div style={{
                              marginBottom: '0.75rem',
                              paddingBottom: '0.75rem',
                              borderBottom: '2px solid #e2e8f0'
                            }}>
                              <h4 style={{
                                fontSize: '0.95rem',
                                fontWeight: '700',
                                color: '#2d3748',
                                margin: 0
                              }}>
                                📍 {locationName}
                              </h4>
                              <p style={{
                                fontSize: '0.8rem',
                                color: '#718096',
                                margin: '0.25rem 0 0 0'
                              }}>
                                {locationItems.length} item{locationItems.length !== 1 ? 's' : ''} from this location
                              </p>
                            </div>
                          )}
                          {locationItems.map((item, itemIdx) => {
                            const idx = item.originalIdx;
                    const itemId = item.order_item_id || item.ecommerce_order_item_id || `item_${idx}`;
                    const currentPrice = parseFloat(item.price || item.unit_price || 0);
                    const adjustedPrice = approveForm.item_prices[itemId] !== undefined 
                      ? parseFloat(approveForm.item_prices[itemId]) 
                      : currentPrice;
                    const quantity = parseInt(item.quantity || 1);
                    const itemTotal = adjustedPrice * quantity;
                    const priceChanged = adjustedPrice !== currentPrice;
                    
                    return (
                      <div key={idx} style={{
                        padding: '0.75rem',
                        marginBottom: '0.75rem',
                        background: 'white',
                        borderRadius: '6px',
                        border: priceChanged ? '2px solid #3b82f6' : '1px solid #e2e8f0'
                      }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2d3748', display: 'block', marginBottom: '0.25rem' }}>
                            {item.product_name || item.product_description}
                          </span>
                          {item.modifications && (
                            <span style={{ fontSize: '0.8rem', color: '#718096', display: 'block', marginBottom: '0.25rem' }}>
                              {item.modifications}
                            </span>
                          )}
                          <span style={{ fontSize: '0.85rem', color: '#718096' }}>
                            Quantity: {quantity}
                          </span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flexWrap: 'wrap'
                        }}>
                          <label style={{
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: '#4a5568',
                            minWidth: '80px'
                          }}>
                            Unit Price (₱):
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={adjustedPrice}
                            onChange={(e) => {
                              const newPrice = parseFloat(e.target.value) || 0;
                              setApproveForm({
                                ...approveForm,
                                item_prices: {
                                  ...approveForm.item_prices,
                                  [itemId]: newPrice
                                }
                              });
                            }}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '6px',
                              border: '2px solid #e2e8f0',
                              fontSize: '0.9rem',
                              width: '120px',
                              fontWeight: '600'
                            }}
                          />
                          {priceChanged && (
                            <span style={{
                              fontSize: '0.75rem',
                              color: '#3b82f6',
                              fontWeight: '600',
                              padding: '0.25rem 0.5rem',
                              background: '#dbeafe',
                              borderRadius: '4px'
                            }}>
                              Was: ₱{currentPrice.toLocaleString()}
                            </span>
                          )}
                          <div style={{
                            marginLeft: 'auto',
                            textAlign: 'right'
                          }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2d3748' }}>
                              Subtotal: ₱{itemTotal.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        {priceChanged && (
                          <div style={{
                            marginTop: '0.75rem',
                            paddingTop: '0.75rem',
                            borderTop: '1px solid #e2e8f0'
                          }}>
                            <label style={{
                              display: 'block',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              color: '#4a5568',
                              marginBottom: '0.5rem'
                            }}>
                              Adjustment Note (Optional):
                            </label>
                            <textarea
                              value={approveForm.item_adjustment_notes[itemId] || ''}
                              onChange={(e) => {
                                setApproveForm({
                                  ...approveForm,
                                  item_adjustment_notes: {
                                    ...approveForm.item_adjustment_notes,
                                    [itemId]: e.target.value
                                  }
                                });
                              }}
                              placeholder="Explain why the price was adjusted (e.g., 'Material cost increased', 'Special discount applied', etc.)"
                              rows="2"
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: '6px',
                                border: '2px solid #e2e8f0',
                                fontSize: '0.85rem',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                          })}
                        </div>
                      );
                    });
                  })()}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '2px solid #cbd5e0'
                  }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#2d3748' }}>
                      Subtotal:
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#2d3748' }}>
                      ₱{(() => {
                        if (!selectedOrder.items || selectedOrder.items.length === 0) {
                          return parseFloat(selectedOrder.total_amount || 0).toLocaleString();
                        }
                        const subtotal = selectedOrder.items.reduce((sum, item, idx) => {
                          const itemId = item.order_item_id || item.ecommerce_order_item_id || `item_${idx}`;
                          const adjustedPrice = approveForm.item_prices[itemId] !== undefined 
                            ? parseFloat(approveForm.item_prices[itemId]) 
                            : parseFloat(item.price || item.unit_price || 0);
                          return sum + (adjustedPrice * parseInt(item.quantity || 1));
                        }, 0);
                        return subtotal.toLocaleString();
                      })()}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{
                  marginTop: '1rem',
                  padding: '1.5rem',
                  background: '#fff3cd',
                  borderRadius: '8px',
                  border: '2px solid #ffc107',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, color: '#856404', fontWeight: '600' }}>
                    ⚠️ Order items are loading or not available. You can still add delivery information and approve the order.
                  </p>
                  <p style={{ margin: '0.5rem 0 0 0', color: '#856404', fontSize: '0.9rem' }}>
                    Order Total: ₱{parseFloat(selectedOrder.total_amount || 0).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Delivery Address */}
              <div style={{
                padding: '1.5rem',
                background: selectedOrder.delivery_address ? '#f7fafc' : '#fff7ed',
                borderRadius: '8px',
                border: selectedOrder.delivery_address ? '1px solid #e2e8f0' : '1px solid #fed7aa'
              }}>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#2d3748',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>📍</span>
                  Delivery Address
                </h4>
                {selectedOrder.delivery_address ? (
                  <div style={{
                    padding: '12px',
                    background: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <p style={{ 
                      fontSize: '0.95rem', 
                      color: '#2d3748', 
                      margin: 0,
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {selectedOrder.delivery_address}
                    </p>
                  </div>
                ) : (
                  <div style={{
                    padding: '12px',
                    background: '#fff7ed',
                    borderRadius: '6px',
                    border: '1px solid #fed7aa'
                  }}>
                    <p style={{ 
                      fontSize: '0.9rem', 
                      color: '#c2410c', 
                      margin: 0,
                      fontStyle: 'italic'
                    }}>
                      ⚠️ No delivery address provided
                    </p>
                  </div>
                )}
                {(selectedOrder.delivery_contact_name || selectedOrder.delivery_contact_phone || selectedOrder.delivery_notes) && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                    {selectedOrder.delivery_contact_name && (
                      <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '0.25rem' }}>
                        <strong>Contact Name:</strong> {selectedOrder.delivery_contact_name}
                      </p>
                    )}
                    {selectedOrder.delivery_contact_phone && (
                      <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '0.25rem' }}>
                        <strong>Contact Phone:</strong> {selectedOrder.delivery_contact_phone}
                      </p>
                    )}
                    {selectedOrder.delivery_notes && (
                      <p style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.25rem' }}>
                        <strong>Delivery Notes:</strong> {selectedOrder.delivery_notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Delivery Fee - Show per location if items are from different locations */}
              {(() => {
                const locationIds = Object.keys(approveForm.delivery_fees_by_location || {});
                const hasMultipleLocations = locationIds.length > 0;
                
                if (hasMultipleLocations) {
                  // Show delivery fee per location
                  return (
                    <div>
                      <label style={{
                        display: 'block',
                        fontWeight: '600',
                        color: '#2d3748',
                        marginBottom: '0.75rem'
                      }}>
                        Delivery Fee by Location (₱) <span style={{color: '#718096', fontWeight: '400', fontSize: '0.9rem'}}>(Required)</span>
                      </label>
                      <div style={{
                        padding: '1rem',
                        background: '#fff3cd',
                        borderRadius: '8px',
                        border: '2px solid #ffc107',
                        marginBottom: '0.5rem'
                      }}>
                        <p style={{
                          fontSize: '0.85rem',
                          color: '#856404',
                          margin: '0 0 0.75rem 0',
                          fontWeight: '600'
                        }}>
                          ⚠️ Items are from different locations. Add delivery fee for each location.
                        </p>
                        {locationIds.map((locId) => {
                          const locationName = locations[locId] 
                            ? (locations[locId].location_name || locations[locId].branch_name || `Location ${locId}`)
                            : `Location ${locId}`;
                          
                          return (
                            <div key={locId} style={{
                              marginBottom: '0.75rem',
                              paddingBottom: '0.75rem',
                              borderBottom: locationIds.indexOf(locId) < locationIds.length - 1 ? '1px solid #e2e8f0' : 'none'
                            }}>
                              <label style={{
                                display: 'block',
                                fontWeight: '600',
                                color: '#2d3748',
                                marginBottom: '0.5rem',
                                fontSize: '0.9rem'
                              }}>
                                📍 {locationName}
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={approveForm.delivery_fees_by_location[locId] || 0}
                                onChange={(e) => {
                                  const fee = parseFloat(e.target.value) || 0;
                                  setApproveForm({
                                    ...approveForm,
                                    delivery_fees_by_location: {
                                      ...approveForm.delivery_fees_by_location,
                                      [locId]: fee
                                    }
                                  });
                                }}
                                placeholder="Enter delivery fee for this location"
                                style={{
                                  width: '100%',
                                  padding: '0.75rem',
                                  borderRadius: '8px',
                                  border: '2px solid #e2e8f0',
                                  fontSize: '1rem'
                                }}
                              />
                            </div>
                          );
                        })}
                        <div style={{
                          marginTop: '0.75rem',
                          paddingTop: '0.75rem',
                          borderTop: '2px solid #cbd5e0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{
                            fontSize: '0.95rem',
                            fontWeight: '700',
                            color: '#2d3748'
                          }}>
                            Total Delivery Fee:
                          </span>
                          <span style={{
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: '#059669'
                          }}>
                            ₱{Object.values(approveForm.delivery_fees_by_location || {}).reduce((sum, fee) => {
                              return sum + (parseFloat(fee) || 0);
                            }, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  // Single location or no location - show single delivery fee input
                  return (
                    <div>
                      <label style={{
                        display: 'block',
                        fontWeight: '600',
                        color: '#2d3748',
                        marginBottom: '0.5rem'
                      }}>
                        Delivery Fee (₱) <span style={{color: '#718096', fontWeight: '400', fontSize: '0.9rem'}}>(Required)</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={approveForm.delivery_fee}
                        onChange={(e) => {
                          const fee = parseFloat(e.target.value) || 0;
                          setApproveForm({...approveForm, delivery_fee: fee});
                        }}
                        placeholder="Enter delivery fee (0 if no delivery)"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '2px solid #e2e8f0',
                          fontSize: '1rem'
                        }}
                      />
                      <p style={{
                        fontSize: '0.85rem',
                        color: '#718096',
                        marginTop: '0.25rem'
                      }}>
                        Add delivery fee if applicable. Set to 0 for store pickup or free delivery.
                      </p>
                    </div>
                  );
                }
              })()}

              {/* Adjusted Total (Optional) */}
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  color: '#2d3748',
                  marginBottom: '0.5rem'
                }}>
                  Final Total (₱) <span style={{color: '#718096', fontWeight: '400', fontSize: '0.9rem'}}>- Adjust price if needed (Optional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={approveForm.adjusted_total || ''}
                  onChange={(e) => {
                    const total = e.target.value === '' ? null : parseFloat(e.target.value);
                    setApproveForm({...approveForm, adjusted_total: total});
                  }}
                  placeholder="Leave empty to auto-calculate (Subtotal + Delivery Fee)"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                />
                <p style={{
                  fontSize: '0.85rem',
                  color: '#718096',
                  marginTop: '0.25rem'
                }}>
                  {(() => {
                    let adjustedSubtotal = 0;
                    if (selectedOrder.items && selectedOrder.items.length > 0) {
                      adjustedSubtotal = selectedOrder.items.reduce((sum, item, idx) => {
                        const itemId = item.order_item_id || item.ecommerce_order_item_id || `item_${idx}`;
                        const adjustedPrice = approveForm.item_prices[itemId] !== undefined 
                          ? parseFloat(approveForm.item_prices[itemId]) 
                          : parseFloat(item.price || item.unit_price || 0);
                        return sum + (adjustedPrice * parseInt(item.quantity || 1));
                      }, 0);
                    } else {
                      adjustedSubtotal = parseFloat(selectedOrder.total_amount || 0);
                    }
                    // Calculate total delivery fee
                    let totalDeliveryFee = parseFloat(approveForm.delivery_fee) || 0;
                    if (Object.keys(approveForm.delivery_fees_by_location || {}).length > 0) {
                      totalDeliveryFee = Object.values(approveForm.delivery_fees_by_location).reduce((sum, fee) => {
                        return sum + (parseFloat(fee) || 0);
                      }, 0);
                    }
                    const calculatedTotal = adjustedSubtotal + totalDeliveryFee;
                    return `Auto-calculated: ₱${calculatedTotal.toLocaleString()} (Items: ₱${adjustedSubtotal.toLocaleString()} + Delivery: ₱${totalDeliveryFee.toLocaleString()}). You can override this by entering a custom total to adjust the price further.`;
                  })()}
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '2rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowApproveModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  background: 'white',
                  color: '#718096',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitApproveOrder}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                Approve Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetailsModal && selectedOrder && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000, // Higher than past orders modal (9999) to appear on top
            padding: '1rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowOrderDetailsModal(false);
              setSelectedOrder(null);
            }
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '0',
              maxWidth: '1200px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem 2rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f7fafc',
              flexShrink: 0
            }}>
              <div>
                <h2 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: '#2d3748',
                  margin: '0 0 0.25rem 0'
                }}>
                  {selectedOrder.order_number || `Order #${selectedOrder.order_id || selectedOrder.ecommerce_order_id}`}
                </h2>
                <p style={{
                  color: '#718096',
                  fontSize: '0.9rem',
                  margin: 0
                }}>
                  Customer: {selectedOrder.customer_name || 'N/A'} ({selectedOrder.email || 'N/A'})
                </p>
              </div>
              <button
                onClick={() => {
                  setShowOrderDetailsModal(false);
                  setSelectedOrder(null);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#718096',
                  padding: '0.5rem',
                  lineHeight: '1',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e2e8f0';
                  e.target.style.color = '#2d3748';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#718096';
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div style={{
              padding: '2rem',
              overflowY: 'auto',
              flex: 1
            }}>
              {/* Order Items */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#2d3748',
                  marginBottom: '1rem'
                }}>
                  Order Items ({selectedOrder.items?.length || 0})
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {selectedOrder.items?.map((item, idx) => {
                    const currentPrice = parseFloat(item.price || item.unit_price || 0);
                    const originalPrice = parseFloat(item.original_price || 0);
                    const adjustmentNote = item.price_adjustment_notes || item.adjustment_note || item.adjustment_notes || '';
                    const priceAdjusted = (originalPrice > 0 && originalPrice !== currentPrice) || (adjustmentNote && adjustmentNote.trim() !== '');
                    
                    // Debug logging
                    if (idx === 0) {
                      console.log('Order item data:', {
                        item: item,
                        currentPrice: currentPrice,
                        originalPrice: originalPrice,
                        adjustmentNote: adjustmentNote,
                        priceAdjusted: priceAdjusted,
                        hasPriceAdjustmentNotes: !!item.price_adjustment_notes,
                        hasAdjustmentNote: !!item.adjustment_note,
                        hasAdjustmentNotes: !!item.adjustment_notes
                      });
                    }
                    
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '1rem',
                          background: priceAdjusted ? '#eff6ff' : '#f7fafc',
                          borderRadius: '8px',
                          border: priceAdjusted ? '1px solid #3b82f6' : 'none',
                          marginBottom: '0.75rem'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: priceAdjusted ? '0.75rem' : '0'
                        }}>
                          <div style={{ flex: 1 }}>
                            <p style={{
                              fontWeight: '600',
                              color: '#2d3748',
                              marginBottom: '0.25rem'
                            }}>
                              {item.product_name}
                              {(item.is_custom === 1 || item.is_custom === true || item.isCustom) && (
                                        <span style={{
                                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                          color: 'white',
                                          padding: '2px 8px',
                                          borderRadius: '12px',
                                          fontSize: '10px',
                                          marginLeft: '8px',
                                          fontWeight: '600'
                                        }}>
                                          CUSTOM
                                        </span>
                                      )}
                              {priceAdjusted && (
                                <span style={{
                                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '10px',
                                  marginLeft: '8px',
                                  fontWeight: '600'
                                }}>
                                  PRICE ADJUSTED
                                </span>
                              )}
                            </p>
                            {item.modifications && (
                              <p style={{
                                fontSize: '0.85rem',
                                color: '#718096',
                                marginBottom: '0.25rem'
                              }}>
                                {item.modifications}
                              </p>
                            )}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              flexWrap: 'wrap'
                            }}>
                              <p style={{
                                fontSize: '0.9rem',
                                color: '#718096',
                                margin: 0
                              }}>
                                Qty: {item.quantity} × ₱{currentPrice.toLocaleString()}
                              </p>
                              {originalPrice > 0 && originalPrice !== currentPrice && (
                                <span style={{
                                  fontSize: '0.8rem',
                                  color: '#3b82f6',
                                  fontWeight: '600',
                                  padding: '0.25rem 0.5rem',
                                  background: '#dbeafe',
                                  borderRadius: '4px'
                                }}>
                                  Was: ₱{originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <span style={{
                            fontWeight: '700',
                            color: '#2d3748',
                            fontSize: '1rem'
                          }}>
                            ₱{parseFloat(item.subtotal || (currentPrice * parseInt(item.quantity || 1))).toLocaleString()}
                          </span>
                        </div>
                        {adjustmentNote && adjustmentNote.trim() !== '' && (
                          <div style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem',
                            background: 'white',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0'
                          }}>
                            <p style={{
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              color: '#4a5568',
                              margin: '0 0 0.25rem 0'
                            }}>
                              📝 Price Adjustment Note:
                            </p>
                            <p style={{
                              fontSize: '0.85rem',
                              color: '#2d3748',
                              margin: 0,
                              lineHeight: '1.5',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word'
                            }}>
                              {adjustmentNote}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cancellation Information */}
              {(selectedOrder.status === 'cancelled' || selectedOrder.status === 'Cancelled') && selectedOrder.items && selectedOrder.items.length > 0 && (
                <div style={{
                  marginBottom: '1.5rem',
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  borderRadius: '12px',
                  border: '2px solid #ef4444'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ fontSize: '28px' }}>⚠️</span>
                    <h4 style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: '#dc2626',
                      margin: 0
                    }}>
                      Order Cancelled
                    </h4>
                  </div>
                  
                  {/* Get cancellation info from first item (all items should have same cancellation info) */}
                  {(() => {
                    const firstCancelledItem = selectedOrder.items.find(item => 
                      item.cancellation_notes || item.cancelled_by || item.cancelled_at
                    );
                    
                    if (!firstCancelledItem) return null;
                    
                    const cancelledBy = firstCancelledItem.cancelled_by || 'Unknown';
                    const cancellationNotes = firstCancelledItem.cancellation_notes || 'No reason provided';
                    const cancelledAt = firstCancelledItem.cancelled_at;
                    
                    return (
                      <div style={{
                        background: 'white',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #fca5a5'
                      }}>
                        <div style={{ marginBottom: '1rem' }}>
                          <p style={{
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: '#4a5568',
                            margin: '0 0 0.5rem 0'
                          }}>
                            Cancelled By:
                          </p>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.4rem 0.8rem',
                            background: cancelledBy === 'admin' 
                              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            textTransform: 'capitalize'
                          }}>
                            {cancelledBy === 'admin' ? '👤 Admin' : '👤 Customer'}
                          </span>
                        </div>
                        
                        <div style={{ marginBottom: cancelledAt ? '1rem' : '0' }}>
                          <p style={{
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: '#4a5568',
                            margin: '0 0 0.5rem 0'
                          }}>
                            Cancellation Reason:
                          </p>
                          <p style={{
                            fontSize: '0.95rem',
                            color: '#2d3748',
                            margin: 0,
                            padding: '0.75rem',
                            background: '#f7fafc',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            lineHeight: '1.6',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                          }}>
                            {cancellationNotes}
                          </p>
                        </div>
                        
                        {cancelledAt && (
                          <div>
                            <p style={{
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              color: '#4a5568',
                              margin: '0 0 0.5rem 0'
                            }}>
                              Cancelled At:
                            </p>
                            <p style={{
                              fontSize: '0.85rem',
                              color: '#718096',
                              margin: 0
                            }}>
                              {new Date(cancelledAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Order Tracking Timeline */}
              <div style={{
                marginBottom: '1.5rem',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#2d3748',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  margin: '0 0 1.5rem 0'
                }}>
                  <span style={{
                    fontSize: '1.5rem',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}>📍</span>
                  Order Tracking
                </h3>

                {/* Tracking Timeline */}
                <div style={{
                  position: 'relative',
                  paddingLeft: '2.5rem'
                }}>
                  {(() => {
                    const normalizedStatus = (selectedOrder.status || '').toLowerCase().trim();
                    const isCancelled = normalizedStatus === 'cancelled';

                    // Define all possible steps
                    const allSteps = [
                      { status: 'pending', label: 'Order Placed', icon: '📝', dateField: 'created_at' },
                      { status: 'approve', label: 'Order Approved', icon: '✅', dateField: 'approved_at' },
                      { status: 'on going', label: 'Processing', icon: '⚙️', dateField: 'updated_at' },
                      { status: 'on delivery', label: 'On Delivery', icon: '🚚', dateField: 'shipped_at' },
                      { status: 'delivered', label: 'Delivered', icon: '📦', dateField: 'delivered_at' },
                      { status: 'cancelled', label: 'Order Cancelled', icon: '❌', dateField: 'updated_at' }
                    ];

                    // If cancelled, show pending and cancelled steps
                    const stepsToShow = isCancelled
                      ? allSteps.filter(s => s.status === 'pending' || s.status === 'cancelled')
                      : allSteps.filter(s => s.status !== 'cancelled');

                    return stepsToShow.map((step, idx) => {
                      const stepStatus = step.status.toLowerCase();

                      // Determine status states
                      const isActive =
                        (stepStatus === 'pending' && normalizedStatus === 'pending') ||
                        (stepStatus === 'approve' && (normalizedStatus === 'approve' || normalizedStatus === 'approved')) ||
                        (stepStatus === 'on going' && (normalizedStatus === 'on going' || normalizedStatus === 'ongoing' || normalizedStatus === 'processing')) ||
                        (stepStatus === 'on delivery' && (normalizedStatus === 'on delivery' || normalizedStatus === 'ondelivery' || normalizedStatus === 'shipped')) ||
                        (stepStatus === 'delivered' && normalizedStatus === 'delivered') ||
                        (stepStatus === 'cancelled' && normalizedStatus === 'cancelled');

                      const isCompleted =
                        (stepStatus === 'pending' && normalizedStatus !== 'pending' && !isCancelled) ||
                        (stepStatus === 'approve' && (normalizedStatus === 'on going' || normalizedStatus === 'on delivery' || normalizedStatus === 'delivered' || normalizedStatus === 'processing')) ||
                        (stepStatus === 'on going' && (normalizedStatus === 'on delivery' || normalizedStatus === 'delivered')) ||
                        (stepStatus === 'on delivery' && normalizedStatus === 'delivered');

                      // Get timestamp for this step
                      let stepDate = null;

                      // First try to get from order object directly
                      if (selectedOrder[step.dateField]) {
                        stepDate = selectedOrder[step.dateField];
                      }
                      // Then try from history
                      else if (selectedOrder.history && selectedOrder.history.length > 0) {
                        const historyItem = selectedOrder.history.find(h => {
                          const histStatus = (h.status || '').toLowerCase();
                          return (stepStatus === 'pending' && (histStatus.includes('pending') || histStatus.includes('placed'))) ||
                            (stepStatus === 'approve' && (histStatus.includes('approve') || histStatus.includes('approved'))) ||
                            (stepStatus === 'on going' && (histStatus.includes('going') || histStatus.includes('processing') || histStatus.includes('ongoing'))) ||
                            (stepStatus === 'on delivery' && (histStatus.includes('delivery') || histStatus.includes('shipped'))) ||
                            (stepStatus === 'delivered' && histStatus.includes('delivered')) ||
                            (stepStatus === 'cancelled' && histStatus.includes('cancelled'));
                        });
                        if (historyItem && historyItem.created_at) {
                          stepDate = historyItem.created_at;
                        }
                      }

                      // Fallback: use created_at for pending, updated_at for others if no specific date
                      if (!stepDate) {
                        if (stepStatus === 'pending') {
                          stepDate = selectedOrder.created_at || selectedOrder.order_date;
                        } else if (isCompleted || isActive) {
                          stepDate = selectedOrder.updated_at;
                        }
                      }

                      // Calculate circle colors
                      const circleColor = isCancelled && stepStatus === 'cancelled'
                        ? '#ef4444'
                        : (isCompleted ? '#10b981' : (isActive ? getStatusColor(selectedOrder.status) : '#e2e8f0'));

                      // Timeline positioning
                      const circleSize = 20;
                      const circleLeft = -28;
                      const circleCenter = circleLeft + (circleSize / 2);
                      const lineWidth = 3;
                      const lineLeft = circleCenter - (lineWidth / 2);
                      const lineTop = circleSize;

                      // Calculate current step index for line coloring
                      const currentStepIndex = isCancelled ? 0 :
                        stepsToShow.findIndex(s => s.status.toLowerCase() === normalizedStatus);
                      const shouldColorLine = idx < currentStepIndex;

                      return (
                        <div
                          key={idx}
                          style={{
                            position: 'relative',
                            paddingBottom: idx < stepsToShow.length - 1 ? '2rem' : '0'
                          }}
                        >
                          {/* Vertical Line */}
                          {idx < stepsToShow.length - 1 && (
                            <div style={{
                              position: 'absolute',
                              left: `${lineLeft}px`,
                              top: `${lineTop}px`,
                              width: `${lineWidth}px`,
                              height: 'calc(100% - 4px)',
                              backgroundColor: shouldColorLine
                                ? (isCancelled ? '#ef4444' : '#10b981')
                                : '#e0e0e0',
                              zIndex: 0
                            }} />
                          )}

                          {/* Timeline Circle */}
                          <div style={{
                            position: 'absolute',
                            left: `${circleLeft}px`,
                            top: '0px',
                            width: `${circleSize}px`,
                            height: `${circleSize}px`,
                            borderRadius: '50%',
                            backgroundColor: circleColor,
                            border: '3px solid white',
                            boxShadow: `0 0 0 2px ${circleColor}`,
                            zIndex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: isCompleted || (isCancelled && stepStatus === 'cancelled') ? '0.7rem' : (isActive ? '0.5rem' : '0'),
                            fontWeight: 'bold',
                            color: 'white',
                            transition: 'all 0.3s ease'
                          }}>
                            {isCancelled && stepStatus === 'cancelled' ? '✕' : (isCompleted ? '✓' : (isActive ? '●' : ''))}
                          </div>

                          {/* Status Content */}
                          <div style={{
                            background: isCancelled && stepStatus === 'cancelled' ? '#fef2f2' : (isActive ? getStatusColor(selectedOrder.status) + '15' : (isCompleted ? '#f0fdf4' : '#ffffff')),
                            padding: '1rem',
                            borderRadius: '8px',
                            border: `2px solid ${isCancelled && stepStatus === 'cancelled' ? '#ef4444' : (isActive ? getStatusColor(selectedOrder.status) : (isCompleted ? '#10b981' : '#e2e8f0'))}`,
                            transition: 'all 0.3s ease',
                            boxShadow: isActive ? `0 4px 12px ${getStatusColor(selectedOrder.status)}30` : (isCompleted ? '0 4px 12px #10b98130' : (isCancelled && stepStatus === 'cancelled' ? '0 4px 12px #ef444430' : '0 2px 6px rgba(0,0,0,0.08)'))
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              marginBottom: stepDate ? '0.75rem' : '0',
                              flexWrap: 'wrap'
                            }}>
                              <span style={{
                                fontSize: '1.5rem',
                                filter: isActive || isCompleted ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'none'
                              }}>{step.icon}</span>
                              <span style={{
                                fontWeight: isActive ? '700' : (isCompleted ? '600' : (isCancelled && stepStatus === 'cancelled' ? '700' : '500')),
                                color: isCancelled && stepStatus === 'cancelled' ? '#ef4444' : (isActive ? getStatusColor(selectedOrder.status) : (isCompleted ? '#10b981' : '#718096')),
                                fontSize: '1rem',
                                flex: 1
                              }}>
                                {step.label}
                              </span>
                              {isActive && !isCancelled && (
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  color: getStatusColor(selectedOrder.status),
                                  background: getStatusColor(selectedOrder.status) + '20',
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  textTransform: 'uppercase'
                                }}>
                                  Current
                                </span>
                              )}
                              {isCancelled && stepStatus === 'cancelled' && (
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  color: '#ef4444',
                                  background: '#ef444420',
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  textTransform: 'uppercase'
                                }}>
                                  Cancelled
                                </span>
                              )}
                            </div>

                            {/* Date and Time Display */}
                            {stepDate && (isCompleted || isActive) && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.85rem',
                                color: isCancelled && stepStatus === 'cancelled' ? '#ef4444' : (isActive ? getStatusColor(selectedOrder.status) : (isCompleted ? '#10b981' : '#718096')),
                                fontWeight: '600',
                                paddingTop: '0.75rem',
                                borderTop: `1px solid ${isCancelled && stepStatus === 'cancelled' ? '#ef444430' : (isActive ? getStatusColor(selectedOrder.status) + '30' : (isCompleted ? '#10b98130' : '#e2e8f0'))}`
                              }}>
                                <span style={{ fontSize: '1rem' }}>🕐</span>
                                <span>{formatDate(stepDate)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Delivery Information */}
              <div style={{
                marginBottom: '1.5rem',
                padding: '1.5rem',
                background: selectedOrder.delivery_address ? '#f7fafc' : '#fff7ed',
                borderRadius: '8px',
                border: selectedOrder.delivery_address ? '1px solid #e2e8f0' : '1px solid #fed7aa'
              }}>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#2d3748',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>📍</span>
                  Delivery Address
                </h4>
                {selectedOrder.delivery_address ? (
                  <div style={{
                    padding: '12px',
                    background: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <p style={{ 
                      fontSize: '0.95rem', 
                      color: '#2d3748', 
                      margin: 0,
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {selectedOrder.delivery_address}
                    </p>
                  </div>
                ) : (
                  <div style={{
                    padding: '12px',
                    background: '#fff7ed',
                    borderRadius: '6px',
                    border: '1px solid #fed7aa'
                  }}>
                    <p style={{ 
                      fontSize: '0.9rem', 
                      color: '#c2410c', 
                      margin: 0,
                      fontStyle: 'italic'
                    }}>
                      ⚠️ No delivery address provided
                    </p>
                  </div>
                )}
                {(selectedOrder.delivery_contact_name || selectedOrder.delivery_contact_phone || selectedOrder.delivery_notes) && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                    {selectedOrder.delivery_contact_name && (
                      <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '0.25rem' }}>
                        <strong>Contact Name:</strong> {selectedOrder.delivery_contact_name}
                      </p>
                    )}
                    {selectedOrder.delivery_contact_phone && (
                      <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '0.25rem' }}>
                        <strong>Contact Phone:</strong> {selectedOrder.delivery_contact_phone}
                      </p>
                    )}
                    {selectedOrder.delivery_notes && (
                      <p style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.25rem' }}>
                        <strong>Delivery Notes:</strong> {selectedOrder.delivery_notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div style={{
                padding: '1rem',
                background: '#f7fafc',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#2d3748',
                  marginBottom: '0.75rem'
                }}>
                  Order Summary
                </h4>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: '#718096', fontSize: '0.9rem' }}>Subtotal:</span>
                  <span style={{ color: '#2d3748', fontWeight: '600' }}>
                    ₱{parseFloat(selectedOrder.total_amount || 0).toLocaleString()}
                  </span>
                </div>
                {selectedOrder.delivery_fee && parseFloat(selectedOrder.delivery_fee) > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ color: '#718096', fontSize: '0.9rem' }}>Delivery Fee:</span>
                    <span style={{ color: '#2d3748', fontWeight: '600' }}>
                      ₱{parseFloat(selectedOrder.delivery_fee).toLocaleString()}
                    </span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '2px solid #e2e8f0',
                  marginTop: '0.5rem'
                }}>
                  <span style={{ color: '#2d3748', fontWeight: '700', fontSize: '1.1rem' }}>Total:</span>
                  <span style={{ color: '#2d3748', fontWeight: '700', fontSize: '1.1rem' }}>
                    ₱{(parseFloat(selectedOrder.total_amount || 0) + parseFloat(selectedOrder.delivery_fee || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                marginTop: '1rem'
              }}>
                {(() => {
                  const orderId = selectedOrder.order_id || selectedOrder.ecommerce_order_id;
                  const orderStatus = (selectedOrder.status || '').toLowerCase().trim();
                  
                  return (
                    <>
                      {(!orderStatus || orderStatus === '' || orderStatus === 'pending' || 
                        !['approved', 'approve', 'processing', 'on going', 'ongoing', 'shipped', 'on delivery', 'ondelivery', 'delivered', 'cancelled'].includes(orderStatus)) && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleApproveOrder(selectedOrder);
                            setShowOrderDetailsModal(false);
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            padding: '0.875rem 1.75rem',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 12px rgba(16, 185, 129, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.3)';
                          }}
                        >
                          ✅ Approve Order & Add Delivery Info
                        </button>
                      )}
                      {(orderStatus === 'shipped' || orderStatus === 'on delivery' || orderStatus === 'ondelivery') && (
                        <button
                          onClick={() => {
                            handleUpdateStatus(orderId, 'delivered');
                            setShowOrderDetailsModal(false);
                          }}
                          style={{
                            background: '#10b981',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.95rem'
                          }}
                        >
                          Mark as Delivered
                        </button>
                      )}
                      {['pending', 'approved', 'approve'].includes(orderStatus) && (
                        <button
                          onClick={() => {
                            setShowOrderDetailsModal(false);
                            handleCancelOrder(selectedOrder);
                          }}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.95rem'
                          }}
                        >
                          Cancel Order
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && orderToCancel && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000
          }}
          onClick={() => setShowCancelModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '0',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e9ecef',
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '32px' }}>⚠️</span>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#dc2626' }}>
                  Cancel Order
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelNotes('');
                  setSelectedCancelReason('');
                  setCancelError('');
                  setOrderToCancel(null);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#718096',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f7fafc';
                  e.target.style.color = '#2d3748';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#718096';
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{
              padding: '20px',
              overflowY: 'auto',
              flex: 1
            }}>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#4a5568', fontWeight: '600' }}>
                  Order Number: <span style={{ color: '#2d3748' }}>{orderToCancel.order_number || orderToCancel.ecommerce_order_number || 'N/A'}</span>
                </p>
                <p style={{ margin: '0', fontSize: '0.9rem', color: '#718096' }}>
                  Customer: {orderToCancel.customer_name || 'N/A'}
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  color: '#2d3748'
                }}>
                  Cancellation Reason <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={selectedCancelReason}
                  onChange={handleCancelReasonChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${cancelError ? '#ef4444' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = cancelError ? '#ef4444' : '#667eea';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = cancelError ? '#ef4444' : '#e2e8f0';
                  }}
                >
                  {cancellationReasons.map((reason, index) => (
                    <option key={index} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
                {cancelError && (
                  <p style={{
                    margin: '8px 0 0 0',
                    fontSize: '0.85rem',
                    color: '#ef4444',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>⚠️</span> {cancelError}
                  </p>
                )}
              </div>

              {/* Show textarea only when "Other" is selected */}
              {selectedCancelReason === 'Other' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: '#2d3748'
                  }}>
                    Specify Cancellation Reason <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    value={cancelNotes}
                    onChange={(e) => {
                      setCancelNotes(e.target.value);
                      if (cancelError) setCancelError(''); // Clear error when user types
                    }}
                    placeholder="Please specify the cancellation reason..."
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      padding: '12px',
                      border: `2px solid ${cancelError ? '#ef4444' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = cancelError ? '#ef4444' : '#667eea';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = cancelError ? '#ef4444' : '#e2e8f0';
                    }}
                  />
                  {cancelError && (
                    <p style={{
                      margin: '8px 0 0 0',
                      fontSize: '0.85rem',
                      color: '#ef4444',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>⚠️</span> {cancelError}
                    </p>
                  )}
                  {!cancelError && (
                    <p style={{
                      margin: '8px 0 0 0',
                      fontSize: '0.85rem',
                      color: '#718096',
                      fontStyle: 'italic'
                    }}>
                      This note will be recorded and visible to the customer.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              background: '#f8f9fa',
              borderRadius: '0 0 12px 12px'
            }}>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelNotes('');
                  setSelectedCancelReason('');
                  setCancelError('');
                  setOrderToCancel(null);
                }}
                style={{
                  padding: '10px 24px',
                  background: 'white',
                  border: '2px solid #6c757d',
                  color: '#6c757d',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#6c757d';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.color = '#6c757d';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCancel}
                style={{
                  padding: '10px 24px',
                  background: '#ef4444',
                  border: 'none',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#dc2626';
                  e.target.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#ef4444';
                  e.target.style.opacity = '1';
                }}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Past Orders Modal */}
      {showPastOrdersModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPastOrdersModal(false);
              setPastOrders([]);
            }
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '0',
              maxWidth: '1200px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem 2rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f7fafc',
              flexShrink: 0
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#2d3748',
                margin: 0
              }}>
                📋 Past Orders (Cancelled & Completed)
              </h2>
              <button
                onClick={() => {
                  setShowPastOrdersModal(false);
                  setPastOrders([]);
                  setPastOrdersCurrentPage(1);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#718096',
                  padding: '0.5rem',
                  lineHeight: '1',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e2e8f0';
                  e.target.style.color = '#2d3748';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#718096';
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div style={{
              padding: '2rem',
              overflowY: 'auto',
              flex: 1
            }}>
              {loadingPastOrders ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '4rem 2rem'
                }}>
                  <div className="spinner" style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #667eea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <style jsx>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              ) : pastOrders.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  color: '#718096'
                }}>
                  <p style={{ fontSize: '1.2rem' }}>No past orders found</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Cancelled and completed orders will appear here
                  </p>
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                  }}>
                    {pastOrders.map((order) => {
                      const orderId = order.order_id || order.ecommerce_order_id;
                      const orderStatus = (order.status || '').toLowerCase().trim();
                      const isCancelled = orderStatus === 'cancelled';
                      
                      // Get cancellation reason from status history
                      let cancellationReason = null;
                      if (isCancelled && order.history && Array.isArray(order.history)) {
                        const cancelledHistory = order.history.find(h => 
                          (h.status || '').toLowerCase() === 'cancelled'
                        );
                        if (cancelledHistory && cancelledHistory.notes) {
                          cancellationReason = cancelledHistory.notes;
                        }
                      }
                      // Also check items for cancellation notes (fallback)
                      if (!cancellationReason && isCancelled && order.items && Array.isArray(order.items)) {
                        const cancelledItem = order.items.find(item => item.cancellation_notes);
                        if (cancelledItem && cancelledItem.cancellation_notes) {
                          cancellationReason = cancelledItem.cancellation_notes;
                        }
                      }
                      
                      return (
                        <div
                          key={orderId}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            background: 'white'
                          }}
                        >
                          {/* Order Header - Clickable */}
                          <div 
                            onClick={async () => {
                              // Fetch full order details
                              try {
                                const detailResponse = await axios.get(BASE_URL + 'orders.php', {
                                  params: {
                                    json: JSON.stringify({ order_id: orderId }),
                                    operation: 'GetOrderById'
                                  }
                                });
                                if (detailResponse.data && detailResponse.data.success) {
                                  setSelectedOrder(detailResponse.data.order);
                                  setShowOrderDetailsModal(true);
                                } else {
                                  // Fallback to basic order data
                                  setSelectedOrder(order);
                                  setShowOrderDetailsModal(true);
                                }
                              } catch (err) {
                                console.error('Error fetching order details:', err);
                                // Fallback to basic order data
                                setSelectedOrder(order);
                                setShowOrderDetailsModal(true);
                              }
                            }}
                            style={{
                              padding: '1.5rem',
                              background: '#f7fafc',
                              borderBottom: '1px solid #e2e8f0',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '1rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#edf2f7';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f7fafc';
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: '#2d3748',
                                marginBottom: '0.25rem'
                              }}>
                                {order.order_number || `Order #${orderId}`}
                              </h3>
                              <p style={{
                                color: '#718096',
                                fontSize: '0.9rem',
                                marginBottom: '0.25rem'
                              }}>
                                Customer: {order.customer_name || 'N/A'} ({order.email || 'N/A'})
                              </p>
                              <p style={{
                                color: '#718096',
                                fontSize: '0.9rem'
                              }}>
                                {formatDate(order.created_at || order.order_date)}
                              </p>
                              {isCancelled && cancellationReason && (
                                <div style={{
                                  marginTop: '0.75rem',
                                  padding: '0.75rem',
                                  background: '#fff7ed',
                                  borderRadius: '6px',
                                  border: '1px solid #fed7aa'
                                }}>
                                  <p style={{
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    color: '#c2410c',
                                    margin: '0 0 0.25rem 0'
                                  }}>
                                    ❌ Cancellation Reason:
                                  </p>
                                  <p style={{
                                    fontSize: '0.9rem',
                                    color: '#92400e',
                                    margin: 0,
                                    lineHeight: '1.5',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                  }}>
                                    {cancellationReason}
                                  </p>
                                </div>
                              )}
                              {isCancelled && !cancellationReason && (
                                <div style={{
                                  marginTop: '0.75rem',
                                  padding: '0.75rem',
                                  background: '#fff7ed',
                                  borderRadius: '6px',
                                  border: '1px solid #fed7aa'
                                }}>
                                  <p style={{
                                    fontSize: '0.85rem',
                                    color: '#c2410c',
                                    margin: 0,
                                    fontStyle: 'italic'
                                  }}>
                                    ⚠️ No cancellation reason provided
                                  </p>
                                </div>
                              )}
                              <p style={{
                                color: '#718096',
                                fontSize: '0.85rem',
                                marginTop: '0.5rem',
                                fontStyle: 'italic'
                              }}>
                                👆 Click to view details
                              </p>
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              flexWrap: 'wrap'
                            }}>
                              <span style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                backgroundColor: getStatusColor(orderStatus) + '20',
                                color: getStatusColor(orderStatus),
                                fontWeight: '600',
                                fontSize: '0.9rem'
                              }}>
                                {getStatusLabel(orderStatus)}
                              </span>
                              <span style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: '#2d3748'
                              }}>
                                ₱{parseFloat(order.total_amount || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination for Past Orders */}
                  {pastOrdersTotal > itemsPerPage && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '2rem',
                      paddingTop: '2rem',
                      borderTop: '1px solid #e2e8f0',
                      flexWrap: 'wrap'
                    }}>
                      <button
                        onClick={() => setPastOrdersCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={pastOrdersCurrentPage === 1}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: '2px solid #e2e8f0',
                          background: pastOrdersCurrentPage === 1 ? '#f7fafc' : 'white',
                          color: pastOrdersCurrentPage === 1 ? '#cbd5e0' : '#2d3748',
                          cursor: pastOrdersCurrentPage === 1 ? 'not-allowed' : 'pointer',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (pastOrdersCurrentPage !== 1) {
                            e.target.style.borderColor = '#667eea';
                            e.target.style.background = '#f7fafc';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (pastOrdersCurrentPage !== 1) {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.background = 'white';
                          }
                        }}
                      >
                        ← Previous
                      </button>

                      {getPageNumbers(pastOrdersCurrentPage, pastOrdersTotalPages).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setPastOrdersCurrentPage(pageNum)}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: `2px solid ${pastOrdersCurrentPage === pageNum ? '#667eea' : '#e2e8f0'}`,
                            background: pastOrdersCurrentPage === pageNum ? '#667eea' : 'white',
                            color: pastOrdersCurrentPage === pageNum ? 'white' : '#2d3748',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s',
                            minWidth: '40px'
                          }}
                          onMouseEnter={(e) => {
                            if (pastOrdersCurrentPage !== pageNum) {
                              e.target.style.borderColor = '#667eea';
                              e.target.style.background = '#f7fafc';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (pastOrdersCurrentPage !== pageNum) {
                              e.target.style.borderColor = '#e2e8f0';
                              e.target.style.background = 'white';
                            }
                          }}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        onClick={() => setPastOrdersCurrentPage(prev => Math.min(pastOrdersTotalPages, prev + 1))}
                        disabled={pastOrdersCurrentPage === pastOrdersTotalPages}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: '2px solid #e2e8f0',
                          background: pastOrdersCurrentPage === pastOrdersTotalPages ? '#f7fafc' : 'white',
                          color: pastOrdersCurrentPage === pastOrdersTotalPages ? '#cbd5e0' : '#2d3748',
                          cursor: pastOrdersCurrentPage === pastOrdersTotalPages ? 'not-allowed' : 'pointer',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (pastOrdersCurrentPage !== pastOrdersTotalPages) {
                            e.target.style.borderColor = '#667eea';
                            e.target.style.background = '#f7fafc';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (pastOrdersCurrentPage !== pastOrdersTotalPages) {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.background = 'white';
                          }
                        }}
                      >
                        Next →
                      </button>

                      <div style={{
                        marginLeft: '1rem',
                        fontSize: '0.9rem',
                        color: '#718096',
                        fontWeight: '500'
                      }}>
                        Showing {((pastOrdersCurrentPage - 1) * itemsPerPage) + 1} - {Math.min(pastOrdersCurrentPage * itemsPerPage, pastOrdersTotal)} of {pastOrdersTotal} orders
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

