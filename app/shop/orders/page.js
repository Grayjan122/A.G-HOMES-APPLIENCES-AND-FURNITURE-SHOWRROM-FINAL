'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { showAlertError } from '@/app/Components/SweetAlert/error';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import 'sweetalert2/dist/sweetalert2.all';
import Swal from 'sweetalert2';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archivedOrders, setArchivedOrders] = useState([]);
  const [paymentForm, setPaymentForm] = useState({
    delivery_address: '',
    delivery_contact_name: '',
    delivery_contact_phone: '',
    delivery_notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('gcash'); // 'gcash' or 'card'
  const [paymentStep, setPaymentStep] = useState('method'); // 'method', 'details', 'processing', 'success'
  const [paymentDetails, setPaymentDetails] = useState({
    gcashPaid: false,
    bankAccountNumber: '',
    bankName: '',
    cardNumber: '',
    cardHolderName: '',
    cardExpiry: '',
    cardCVV: ''
  });
  const [showPaymentProcessing, setShowPaymentProcessing] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showPaymentComplete, setShowPaymentComplete] = useState(false);
  const [paymentCompleteData, setPaymentCompleteData] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [locations, setLocations] = useState({}); // Store location details: { location_id: locationDetails }
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelNotes, setCancelNotes] = useState('');
  const [selectedCancelReason, setSelectedCancelReason] = useState('');
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelError, setCancelError] = useState('');

  const BASE_URL = typeof window !== 'undefined'
    ? (window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.')
      ? `http://${window.location.hostname}/capstone-api/api/`
      : 'https://ag-home.site/backend/api/')
    : 'http://localhost/capstone-api/api/';

  useEffect(() => {
    // Check if user is logged in
    if (typeof window !== 'undefined') {
      const id = sessionStorage.getItem('customer_id');
      if (id) {
        setIsLoggedIn(true);
        setCustomerId(id);
        fetchOrders(id);
      } else {
        setIsLoggedIn(false);
        setLoading(false);
        // Redirect to shop if not logged in
        router.push('/shop');
      }
    }
  }, [router]);

  // Auto-refresh orders for real-time tracking (silent update, no loading state)
  useEffect(() => {
    if (autoRefresh && customerId) {
      const interval = setInterval(() => {
        fetchOrdersSilent(customerId);
      }, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [autoRefresh, customerId]);

  const fetchOrders = async (cid) => {
    try {
      setLoading(true);
      const response = await axios.get(BASE_URL + 'orders.php', {
        params: {
          json: JSON.stringify({ customer_id: parseInt(cid) }),
          operation: 'GetOrdersByCustomer'
        }
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        showAlertError({
          icon: 'error',
          title: 'Error',
          text: response.data.message || 'Failed to load orders',
          button: 'OK'
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load orders. Please try again.',
        button: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  // Silent fetch for auto-refresh (no loading state, no error alerts)
  const fetchOrdersSilent = async (cid) => {
    try {
      const response = await axios.get(BASE_URL + 'orders.php', {
        params: {
          json: JSON.stringify({ customer_id: parseInt(cid) }),
          operation: 'GetOrdersByCustomer'
        }
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error silently fetching orders:', error);
      // Silent fail - don't show error to user during auto-refresh
    }
  };

  const fetchArchivedOrders = async (cid) => {
    try {
      const response = await axios.get(BASE_URL + 'orders.php', {
        params: {
          json: JSON.stringify({ customer_id: parseInt(cid) }),
          operation: 'GetOrdersByCustomer'
        }
      });

      if (response.data.success) {
        const allOrders = response.data.orders || [];
        // Filter for cancelled and delivered (completed) orders
        let archived = allOrders.filter(order => {
          const status = (order.status || '').toLowerCase().trim();
          return status === 'cancelled' || status === 'delivered';
        });
        
        // Sort by updated_at (latest update first), then by created_at as fallback
        archived.sort((a, b) => {
          const dateA = new Date(a.updated_at || a.order_date || a.created_at || 0);
          const dateB = new Date(b.updated_at || b.order_date || b.created_at || 0);
          return dateB - dateA; // Descending order (newest first)
        });
        
        // Fetch full details with history for cancelled orders (limit to 50 for performance)
        if (archived.length > 0 && archived.length <= 50) {
          const archivedWithDetails = await Promise.all(
            archived.map(async (order) => {
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
          setArchivedOrders(archivedWithDetails);
        } else {
          setArchivedOrders(archived);
        }
      } else {
        showAlertError({
          icon: 'error',
          title: 'Error',
          text: response.data.message || 'Failed to load archived orders',
          button: 'OK'
        });
      }
    } catch (error) {
      console.error('Error fetching archived orders:', error);
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load archived orders. Please try again.',
        button: 'OK'
      });
    }
  };

  const handleArchiveOpen = () => {
    if (customerId) {
      fetchArchivedOrders(customerId);
      setShowArchiveModal(true);
    }
  };

  // Filter active orders (exclude cancelled and delivered)
  const activeOrders = orders.filter(order => {
    const status = (order.status || '').toLowerCase().trim();
    return status !== 'cancelled' && status !== 'delivered';
  });

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
    const normalizedStatus = status.toLowerCase().trim();
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
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const fetchOrderLocations = async (order) => {
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
  };

  // Fetch customer profile to get contact name and phone
  const fetchCustomerProfile = async (customerId) => {
    try {
      const response = await axios.get(BASE_URL + 'ecommerce_customer.php', {
        params: {
          json: JSON.stringify({ customer_id: parseInt(customerId) }),
          operation: 'GetCustomerProfile'
        }
      });

      if (response.data.success && response.data.customer) {
        const customerData = response.data.customer;
        return {
          name: customerData.customer_name || '',
          phone: customerData.phone || '',
          email: customerData.email || ''
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      return null;
    }
  };

  const handlePayOrder = async (order) => {
    setSelectedOrder(order);
    // Fetch location details
    await fetchOrderLocations(order);
    
    // Fetch customer profile to get contact name and phone
    let customerProfile = null;
    if (customerId) {
      customerProfile = await fetchCustomerProfile(customerId);
    }
    
    // Initialize delivery form:
    // - Delivery address from order (ecommerce_order.delivery_address)
    // - Contact name and phone from customer profile
    const deliveryAddress = (order.delivery_address || '').trim();
    const contactName = (customerProfile?.name || order.delivery_contact_name || '').trim();
    const contactPhone = (customerProfile?.phone || order.delivery_contact_phone || '').trim();
    
    // Validate that required fields are available
    if (!deliveryAddress || !contactName || !contactPhone) {
      showAlertError({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Unable to proceed with payment. Please ensure your order has a delivery address and your profile has contact information. Contact support if this issue persists.',
        button: 'OK'
      });
      return;
    }

    setPaymentForm({
      delivery_address: deliveryAddress,
      delivery_contact_name: contactName,
      delivery_contact_phone: contactPhone,
      delivery_notes: (order.delivery_notes || '').trim()
    });
    // Reset payment step and details
    setPaymentStep('method');
    setPaymentDetails({
      gcashPaid: false,
      bankAccountNumber: '',
      bankName: '',
      cardNumber: '',
      cardHolderName: '',
      cardExpiry: '',
      cardCVV: ''
    });
    setShowPaymentModal(true);
  };

  const handleCancelOrder = (order) => {
    setOrderToCancel(order);
    setCancelNotes('');
    setSelectedCancelReason('');
    setCancelError('');
    setShowCancelModal(true);
  };

  // Pre-defined cancellation reasons for customers
  const customerCancellationReasons = [
    { value: '', label: 'Select a reason (optional)' },
    { value: 'It\'s pricey', label: 'It\'s pricey' },
    { value: 'I found other store', label: 'I found other store' },
    { value: 'Wrong item', label: 'Wrong item' },
    { value: 'Changed my mind', label: 'Changed my mind' },
    { value: 'No longer needed', label: 'No longer needed' },
    { value: 'Delivery time too long', label: 'Delivery time too long' },
    { value: 'Payment issue', label: 'Payment issue' },
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
      const response = await axios.get(BASE_URL + 'orders.php', {
        params: {
          json: JSON.stringify({
            order_id: orderId,
            notes: finalNotes,
            cancelled_by: 'customer' // Track that customer cancelled this order
          }),
          operation: 'CancelOrder'
        }
      });

      if (response.data.success) {
        // Close modals
        setShowCancelModal(false);
        setShowOrderModal(false);
        setCancelNotes('');
        setSelectedCancelReason('');
        setCancelError('');
        setOrderToCancel(null);
        setSelectedOrder(null);
        
        // Show success message
        await Swal.fire({
          title: "Cancelled!",
          text: "Your order has been cancelled successfully.",
          icon: "success",
          confirmButtonText: "OK"
        });
        
        // Refresh orders
        if (customerId) {
          fetchOrders(customerId);
        }
      } else {
        showAlertError({
          icon: 'error',
          title: 'Error',
          text: response.data.message || 'Failed to cancel order. Please try again.',
          button: 'OK'
        });
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || error.message || 'Failed to cancel order. Please try again.',
        button: 'OK'
      });
    }
  };

  const handleCompleteTransaction = async (order) => {
    if (!window.confirm(`Mark order ${order.order_number} as completed? This confirms you have received your order.`)) {
      return;
    }

    try {
      const response = await axios.get(BASE_URL + 'orders.php', {
        params: {
          json: JSON.stringify({
            order_id: order.order_id || order.ecommerce_order_id,
            status: 'delivered',
            notes: 'Order completed by customer'
          }),
          operation: 'UpdateOrderStatus'
        }
      });

      if (response.data.success) {
        AlertSucces('Order Completed', 'Thank you! Your order has been marked as completed.', true, 'OK');
        // Refresh orders
        if (customerId) {
          fetchOrders(customerId);
        }
      } else {
        showAlertError({
          icon: 'error',
          title: 'Error',
          text: response.data.message || 'Failed to complete order. Please try again.',
          button: 'OK'
        });
      }
    } catch (error) {
      console.error('Error completing order:', error);
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: 'Failed to complete order. Please try again.',
        button: 'OK'
      });
    }
  };

  // Handle payment method selection - move to details step
  const handlePaymentMethodSelect = () => {
    if (paymentMethod === 'gcash') {
      setPaymentStep('details'); // Show QR code for GCash
    } else {
      setPaymentStep('details'); // Show form for Card/Bank
    }
  };

  // Handle GCash payment confirmation
  const handleGCashConfirm = () => {
    setPaymentDetails({ ...paymentDetails, gcashPaid: true });
    setPaymentStep('processing');
    handleDemoPayment();
  };

  // Handle Card payment submission
  const handleCardBankSubmit = () => {
    // Validate card details
    if (!paymentDetails.cardNumber || !paymentDetails.cardHolderName || !paymentDetails.cardExpiry || !paymentDetails.cardCVV) {
      showAlertError({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill in all card details (Card Number, Holder Name, Expiry, CVV)',
        button: 'OK'
      });
      return;
    }
    setPaymentStep('processing');
    handleDemoPayment();
  };

  // Demo payment handler - simulates payment process without API keys
  const validatePhilippinesAddress = (address) => {
    if (!address || address.trim().length < 10) {
      return 'Address must be at least 10 characters long';
    }
    
    // Check for common Philippines address indicators (more lenient)
    const phIndicators = [
      'philippines', 'philippine', 'ph', 'metro manila', 'manila', 'quezon city', 'makati', 'pasig',
      'taguig', 'mandaluyong', 'san juan', 'pasay', 'paranaque', 'las pinas', 'muntinlupa',
      'marikina', 'valenzuela', 'caloocan', 'malabon', 'navotas', 'cagayan', 'davao',
      'cebu', 'iloilo', 'bacolod', 'bataan', 'bulacan', 'cavite', 'laguna',
      'pampanga', 'rizal', 'batangas', 'barangay', 'brgy', 'brgy.', 'province', 'city', 'municipality',
      'ncr', 'ncr region', 'luzon', 'visayas', 'mindanao', 'street', 'st.', 'avenue', 'ave.',
      'road', 'rd.', 'blvd', 'boulevard', 'village', 'subdivision', 'compound'
    ];
    
    const addressLower = address.toLowerCase();
    const hasPhIndicator = phIndicators.some(indicator => addressLower.includes(indicator));
    
    // More lenient: if address is reasonably long and contains common address words, accept it
    const hasCommonAddressWords = /\b(street|st|road|rd|avenue|ave|blvd|boulevard|village|subdivision|barangay|brgy|city|province)\b/i.test(address);
    
    if (!hasPhIndicator && !hasCommonAddressWords) {
      return 'Please enter a valid Philippines address (include street, barangay, city, or province)';
    }
    
    return '';
  };

  // Create delivery records (delivery, details, tracking) after payment
  const createDeliveryRecords = async (order, deliveryAddress, contactName, contactPhone, deliveryNotes = '') => {
    try {
      const invoiceId = order.order_id || order.ecommerce_order_id;
      const locationId = order.location_id || null;
      const customerEmail = order.email || null;
      const preferredDate = order.preferred_date_delivery || null;

      // Create delivery record
      const deliveryResponse = await axios.get(BASE_URL + 'delivery-management.php', {
        params: {
          json: JSON.stringify({
            invoice_id: invoiceId,
            customer_id: customerId,
            cust_name: contactName,
            email: customerEmail,
            location_id: locationId,
            notes: deliveryAddress,
            preferred_date_delivery: preferredDate,
            status: 'Pending', // Initial status for e-commerce orders
            delivery_contact_name: contactName,
            delivery_contact_phone: contactPhone
          }),
          operation: 'CreateDelivery'
        }
      });

      if (deliveryResponse.data && deliveryResponse.data.success) {
        const dtcId = deliveryResponse.data.dtc_id || deliveryResponse.data.id;

        // Create delivery details for each item
        if (order.items && order.items.length > 0) {
          for (const item of order.items) {
            await axios.get(BASE_URL + 'delivery-management.php', {
              params: {
                json: JSON.stringify({
                  dtc_id: dtcId,
                  product_id: item.product_id || null,
                  product_code: item.product_code || item.product_name || 'CUSTOMIZED',
                  product_description: item.description || item.product_description || item.name || 'Custom Product',
                  price_per_item: parseFloat(item.price || item.unit_price || 0),
                  total_qty: parseInt(item.quantity || 1),
                  modifications: item.modifications || null
                }),
                operation: 'CreateDeliveryDetail'
              }
            });
          }
        }

        // Create initial tracking entry
        const now = new Date();
        const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const time = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

        await axios.get(BASE_URL + 'delivery-management.php', {
          params: {
            json: JSON.stringify({
              dtc_id: dtcId,
              status: 'Pending',
              date: date,
              time: time,
              notes: 'Order placed and payment received. Waiting for production/processing.'
            }),
            operation: 'CreateDeliveryTracking'
          }
        });

        console.log('Delivery records created successfully for order:', invoiceId);
      } else {
        console.error('Failed to create delivery record:', deliveryResponse.data);
      }
    } catch (error) {
      console.error('Error creating delivery records:', error);
      throw error;
    }
  };

  // Prepare inventory update data for in-stock items (similar to receiveStock.js structure)
  const prepareInventoryUpdateData = async (itemsWithLocations) => {
    try {
      // Filter only in-stock items (is_made_to_order === 0)
      const inStockItems = itemsWithLocations.filter(item => 
        item.is_made_to_order === 0 || item.is_made_to_order === '0'
      );

      if (inStockItems.length === 0) {
        console.log('[prepareInventoryUpdateData] No in-stock items to update');
        return null;
      }

      // Group items by source_location_id
      const itemsByLocation = {};
      inStockItems.forEach(item => {
        const locId = item.source_location_id;
        if (locId) {
          if (!itemsByLocation[locId]) {
            itemsByLocation[locId] = [];
          }
          itemsByLocation[locId].push(item);
        }
      });

      const allInventoryUpdates = [];

      // Process each location
      for (const [locationId, locationItems] of Object.entries(itemsByLocation)) {
        try {
          // Get current inventory for this location
          const inventoryResponse = await axios.get(BASE_URL + 'inventory.php', {
            params: {
              json: JSON.stringify({
                locID: parseInt(locationId),
                stockLevel: '',
                search: ''
              }),
              operation: 'GetInventory'
            }
          });

          const currentInventory = Array.isArray(inventoryResponse.data) ? inventoryResponse.data : [];

          const oldProduct = [];
          const newProduct = [];
          const report = [];

          // Process each item for this location
          locationItems.forEach((item) => {
            // Get quantity from the original order item
            const itemQuantity = selectedOrder.items.find(oi => 
              String(oi.product_id) === String(item.product_id) &&
              (oi.source_location_id === parseInt(locationId) || oi.source_location_id == locationId)
            )?.quantity || item.quantity || 1;

            if (!item.product_id || !itemQuantity || itemQuantity <= 0) {
              console.error('[prepareInventoryUpdateData] Invalid item data:', item);
              return;
            }

            // Find matching product in current inventory
            const match = currentInventory.find(invProd =>
              String(invProd.product_id) === String(item.product_id)
            );

            if (match) {
              // Product exists - update quantity (deduct from inventory)
              const currentQty = parseInt(match.qty || 0);
              const qtyToDeduct = parseInt(itemQuantity);
              const newQty = currentQty - qtyToDeduct;
              
              if (newQty >= 0) {
                oldProduct.push({
                  product_id: parseInt(item.product_id),
                  qty: newQty
                });

                report.push({
                  prodID: parseInt(item.product_id),
                  pastBalance: currentQty,
                  qty: qtyToDeduct, // Neutral value (absolute quantity)
                  currentBalance: newQty
                });
              } else {
                console.warn(`[prepareInventoryUpdateData] Insufficient stock for product ${item.product_id}. Available: ${currentQty}, Requested: ${qtyToDeduct}`);
              }
            } else {
              // Product doesn't exist in inventory - this shouldn't happen for in-stock items
              console.warn(`[prepareInventoryUpdateData] Product ${item.product_id} not found in inventory at location ${locationId}`);
            }
          });

          // Only add if there are products to process
          if (oldProduct.length > 0 || newProduct.length > 0) {
            allInventoryUpdates.push({
              location_id: parseInt(locationId),
              updatedInventory: oldProduct,
              newInventory: newProduct,
              reportInventory: report
            });
          }
        } catch (locationError) {
          console.error(`[prepareInventoryUpdateData] Error processing location ${locationId}:`, locationError);
          // Continue with other locations even if one fails
        }
      }

      return allInventoryUpdates.length > 0 ? allInventoryUpdates : null;
    } catch (error) {
      console.error('[prepareInventoryUpdateData] Error preparing inventory data:', error);
      return null;
    }
  };

  const handleDemoPayment = async () => {
    if (!selectedOrder) return;

    // Validate delivery details - check if fields are actually filled (trim and check length)
    const address = (paymentForm.delivery_address || '').trim();
    const contactName = (paymentForm.delivery_contact_name || '').trim();
    const contactPhone = (paymentForm.delivery_contact_phone || '').trim();

    if (!address || address.length === 0 || !contactName || contactName.length === 0 || !contactPhone || contactPhone.length === 0) {
      showAlertError({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please ensure all required fields are filled (Address, Contact Name, Contact Phone). These should be automatically filled from your order and profile.',
        button: 'OK'
      });
      setPaymentStep('method');
      return;
    }

    // Validate Philippines address
    const addressError = validatePhilippinesAddress(address);
    if (addressError) {
      showAlertError({
        icon: 'warning',
        title: 'Invalid Address',
        text: addressError,
        button: 'OK'
      });
      setPaymentStep('method');
      return;
    }

    // Show payment processing modal
    setShowPaymentProcessing(true);
    setPaymentProcessing(true);

    try {
      // Simulate payment processing delay (2-3 seconds)
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Calculate total amount
      const subtotal = selectedOrder.items.reduce((sum, item) => {
        return sum + (parseFloat(item.price || item.unit_price || 0) * parseInt(item.quantity || 1));
      }, 0);
      const deliveryFee = parseFloat(selectedOrder.delivery_fee) || 0;
      const totalAmount = subtotal + deliveryFee;

      // Simulate payment API call (demo - always succeeds)
      // In real implementation, this would call the actual payment gateway
      const paymentSuccess = true; // Demo: always succeeds

      if (paymentSuccess) {
        // Get customer email
        let customerEmail = selectedOrder.email || null;
        if (!customerEmail && customerId) {
          const customerProfile = await fetchCustomerProfile(customerId);
          customerEmail = customerProfile?.email || null;
        }

        // Prepare inventory update data for in-stock items first
        // Use is_made_to_order from database (ecommerce_order_items table)
        // The database already has this information stored when order was created
        // If not set, determine based on inventory check
        const itemsWithLocations = await Promise.all((selectedOrder.items || []).map(async (item) => {
          const productId = item.product_id;
          const sourceLocationId = item.source_location_id || null;
          
          // Determine if item is made to order
          // Priority: 1. Database value, 2. Custom flag, 3. Inventory check
          // is_made_to_order: 1 = made to order, 0 = in stock
          let isMadeToOrder = 0; // Default to in stock
          
          // Check if is_made_to_order exists in database (from ecommerce_order_items table)
          if (item.is_made_to_order !== undefined && item.is_made_to_order !== null) {
            // Use database value (1 = made to order, 0 = in stock)
            isMadeToOrder = parseInt(item.is_made_to_order) === 1 ? 1 : 0;
          } else if (item.is_custom || item.isCustom) {
            // Custom items are always made to order
            isMadeToOrder = 1;
          } else {
            // If not set in database, check inventory at source location to determine
            if (sourceLocationId && productId) {
              try {
                const inventoryResponse = await axios.get(BASE_URL + 'inventory.php', {
                  params: {
                    json: JSON.stringify({ productId: productId }),
                    operation: 'GetProductInventoryByLocation'
                  },
                  timeout: 5000
                });
                
                if (Array.isArray(inventoryResponse.data)) {
                  // Find inventory at the source location
                  const locationInventory = inventoryResponse.data.find(inv => 
                    inv.location_id == sourceLocationId || 
                    String(inv.location_id) === String(sourceLocationId)
                  );
                  
                  if (locationInventory) {
                    const stockQuantity = parseInt(locationInventory.qty || 0);
                    // If no stock at source location, item is made to order
                    isMadeToOrder = stockQuantity > 0 ? 0 : 1;
                  } else {
                    // No inventory found at source location, treat as made to order
                    isMadeToOrder = 1;
                  }
                } else {
                  // No inventory data, default to made to order
                  isMadeToOrder = 1;
                }
              } catch (error) {
                console.error(`Error checking inventory for product ${productId} at location ${sourceLocationId}:`, error);
                // On error, default to made to order to be safe
                isMadeToOrder = 1;
              }
            } else {
              // No source location, default to made to order
              isMadeToOrder = 1;
            }
          }
          
          // Ensure isMadeToOrder is always 1 or 0 (never null)
          isMadeToOrder = isMadeToOrder === 1 ? 1 : 0;
          
          return {
            // Item identification
            item_id: item.ecommerce_order_item_id || item.order_item_id,
            product_id: productId,
            product_name: item.product_name || '',
            product_description: item.product_description || item.description || '',
            
            // Quantity and pricing
            quantity: parseInt(item.quantity || 1),
            price: parseFloat(item.price || item.unit_price || 0),
            unit_price: parseFloat(item.unit_price || item.price || 0),
            original_price: item.original_price ? parseFloat(item.original_price) : null,
            subtotal: parseFloat(item.subtotal || (item.price || item.unit_price || 0) * (item.quantity || 1)),
            
            // Location information
            source_location_id: sourceLocationId,
            location_name: sourceLocationId && locations[sourceLocationId] 
              ? locations[sourceLocationId].location_name 
              : (sourceLocationId ? `Location ${sourceLocationId}` : null),
            
            // Item status
            is_custom: item.is_custom || item.isCustom || false,
            is_made_to_order: isMadeToOrder, // Always 1 (made to order) or 0 (in stock)
            
            // Additional fields
            modifications: item.modifications || null,
            price_adjustment_notes: item.price_adjustment_notes || item.adjustment_notes || item.adjustment_note || null
          };
        }));

        // Separate items by made-to-order status
        const madeToOrderItems = itemsWithLocations.filter(item => item.is_made_to_order === 1);
        const inStockItems = itemsWithLocations.filter(item => item.is_made_to_order === 0);

        // Prepare inventory update data for in-stock items
        const inventoryUpdates = await prepareInventoryUpdateData(itemsWithLocations);

        // console.log(itemsWithLocations);
        // return;

       

        // Update order with payment and delivery details
        const response = await axios.get(BASE_URL + 'orders.php', {
          params: {
            json: JSON.stringify({
              order_id: selectedOrder.order_id || selectedOrder.ecommerce_order_id,
              payment_status: 'paid',
              payment_method: paymentMethod === 'gcash' ? 'gcash' : 'card',
              delivery_address: address,
              delivery_contact_name: contactName,
              delivery_contact_phone: contactPhone,
              delivery_contact_email: customerEmail,
              delivery_notes: (paymentForm.delivery_notes || '').trim(),
              status: 'on going', // Move to processing after payment
              items: itemsWithLocations, // Include all items with location information
              made_to_order_items: madeToOrderItems, // Separate array for made-to-order items
              in_stock_items: inStockItems, // Separate array for in-stock items
              inventory_updates: inventoryUpdates // Include inventory update data for in-stock items
            }),
            operation: 'UpdateOrderPayment'
          }
        });

        if (response.data.success) {

          // Close payment processing modal first
          setShowPaymentProcessing(false);
          setPaymentProcessing(false);
          
          // Show custom payment complete modal
          setPaymentCompleteData({
            amount: totalAmount,
            method: paymentMethod === 'gcash' ? 'GCash' : 'Card',
            orderNumber: selectedOrder?.order_number || 'N/A'
          });
          setShowPaymentComplete(true);

          // Close payment modal and reset state
          setShowPaymentModal(false);
          setSelectedOrder(null);
          setPaymentStep('method');
          setPaymentDetails({
            gcashPaid: false,
            bankAccountNumber: '',
            bankName: '',
            cardNumber: '',
            cardHolderName: '',
            cardExpiry: '',
            cardCVV: ''
          });

          // Refresh orders
          if (customerId) {
            fetchOrders(customerId);
          }
        } else {
          setPaymentProcessing(false);
          showAlertError({
            icon: 'error',
            title: 'Payment Error',
            text: response.data.message || 'Payment was processed but failed to update order. Please contact support.',
            button: 'OK'
          });
        }
      } else {
        // Simulated payment failure (for testing)
        setPaymentProcessing(false);
        showAlertError({
          icon: 'error',
          title: 'Payment Failed',
          text: 'Payment could not be processed. Please try again or use a different payment method.',
          button: 'OK'
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentProcessing(false);
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || error.message || 'Something went wrong. Please try again.',
        button: 'OK'
      });
    }
  };

  // Original handlePayment - handles method selection step
  const handlePayment = async () => {
    // Move to payment details step
    handlePaymentMethodSelect();
  };

  // Reset payment flow when modal closes
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentStep('method');
    setPaymentDetails({
      gcashPaid: false,
      bankAccountNumber: '',
      bankName: '',
      cardNumber: '',
      cardHolderName: '',
      cardExpiry: '',
      cardCVV: ''
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === '/uploads/products/defualt.jpg\r\n' || imagePath === '/uploads/products/defualt.jpg') {
      return '/assets/images/default-product.png';
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return imagePath;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
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

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7fafc',
      padding: '2rem 1rem'
    }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .orders-header-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .orders-back-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
          white-space: nowrap;
        }
        
        .orders-back-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(0.95);
          }
        }
        
        @media (max-width: 640px) {
          .orders-header-container {
            flex-direction: column;
            align-items: stretch;
          }
          
          .orders-back-button {
            width: 100%;
            justify-content: center;
          }
        }
        
        /* Custom Scrollbar for Modals */
        .order-modal-scroll::-webkit-scrollbar,
        .payment-modal-scroll::-webkit-scrollbar {
          width: 8px;
        }
        
        .order-modal-scroll::-webkit-scrollbar-track,
        .payment-modal-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .order-modal-scroll::-webkit-scrollbar-thumb,
        .payment-modal-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 10px;
        }
        
        .order-modal-scroll::-webkit-scrollbar-thumb:hover,
        .payment-modal-scroll::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
        
        /* Firefox scrollbar */
        .order-modal-scroll,
        .payment-modal-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #f1f1f1;
        }
      `}} />
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <div className="orders-header-container">
            <div style={{ flex: '1', minWidth: '200px' }}>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#2d3748',
                marginBottom: '0.5rem'
              }}>
                My Orders
              </h1>
              <p style={{
                color: '#718096',
                fontSize: '1rem',
                marginBottom: '0'
              }}>
                Track and manage your orders
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              {/* Auto-refresh Toggle */}
              {/* <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: autoRefresh ? '#e7f3ff' : '#f7fafc',
                borderRadius: '8px',
                border: `2px solid ${autoRefresh ? '#2196F3' : '#e2e8f0'}`,
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <span style={{
                  fontSize: '1.2rem'
                }}>
                  {autoRefresh ? '🔄' : '⏸️'}
                </span>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: autoRefresh ? '#2196F3' : '#718096'
                }}>
                  {autoRefresh ? 'Live Tracking' : 'Paused'}
                </span>
              </div> */}
              <button
                onClick={handleArchiveOpen}
                style={{
                  background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s',
                  boxShadow: '0 2px 8px rgba(108, 117, 125, 0.3)',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(108, 117, 125, 0.3)';
                }}
              >
                <span>📁</span>
                Past Orders
              </button>
              <button
                onClick={() => router.push('/shop')}
                className="orders-back-button"
              >
                <span>←</span>
                Back to Shop
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {activeOrders.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '4rem 2rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <p style={{
              fontSize: '1.2rem',
              color: '#718096',
              marginBottom: '1rem'
            }}>
              {orders.length === 0 ? 'No orders found' : 'No active orders'}
            </p>
            {orders.length > 0 && (() => {
              const archivedCount = orders.filter(o => {
                const status = (o.status || '').toLowerCase().trim();
                return status === 'cancelled' || status === 'delivered';
              }).length;
              return archivedCount > 0 ? (
                <p style={{
                  fontSize: '0.9rem',
                  color: '#a0aec0',
                  marginBottom: '1rem'
                }}>
                  You have {archivedCount} archived {archivedCount === 1 ? 'order' : 'orders'} (cancelled/completed)
                </p>
              ) : null;
            })()}
            <button
              onClick={() => router.push('/shop')}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {activeOrders.map((order) => (
              <div
                key={order.order_id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onClick={async () => {
                  setSelectedOrder(order);
                  // Fetch location details
                  await fetchOrderLocations(order);
                  setShowOrderModal(true);
                }}
              >
                {/* Order Header */}
                <div style={{
                  padding: '1.5rem',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: '#2d3748',
                      marginBottom: '0.25rem'
                    }}>
                      {order.order_number}
                    </h3>
                    <p style={{
                      color: '#718096',
                      fontSize: '0.9rem'
                    }}>
                      {formatDate(order.created_at)}
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
                      backgroundColor: getStatusColor(order.status) + '20',
                      color: getStatusColor(order.status),
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: '#2d3748'
                    }}>
                      ₱{parseFloat(order.total_amount).toLocaleString()}
                    </span>
                    {/* Action Buttons for Approved Orders */}
                    {((order.status || '').toLowerCase() === 'approved' || (order.status || '').toLowerCase() === 'approve') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePayOrder(order);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
                          transition: 'all 0.3s',
                          whiteSpace: 'nowrap'
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
                        💳 Pay Now
                      </button>
                    )}
                    {/* Cancel Button for Pending or Approved Orders */}
                    {(['pending', 'approved', 'approve'].includes((order.status || '').toLowerCase())) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelOrder(order);
                        }}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)',
                          transition: 'all 0.3s',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 12px rgba(239, 68, 68, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 6px rgba(239, 68, 68, 0.3)';
                        }}
                      >
                        ❌ Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Order card - no inline expansion, opens modal instead */}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
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
            zIndex: 9998,
            padding: '1rem',
            overflow: 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowOrderModal(false);
            }
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '80vh',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Header */}
            <div style={{
              padding: '2rem',
              paddingBottom: '1.5rem',
              borderBottom: '2px solid #e2e8f0',
              background: 'white',
              flexShrink: 0,
              position: 'relative'
            }}>
              {/* Close Button */}
              <button
                onClick={() => setShowOrderModal(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  color: '#718096',
                  padding: '0.5rem',
                  lineHeight: '1',
                  borderRadius: '4px',
                  zIndex: 10
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

              {/* Order Header */}
              <div>
                <h2 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: '#2d3748',
                  marginBottom: '0.5rem'
                }}>
                  Order Details: {selectedOrder.order_number}
                </h2>
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    backgroundColor: getStatusColor(selectedOrder.status) + '20',
                    color: getStatusColor(selectedOrder.status),
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                  <span style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#2d3748'
                  }}>
                    Total: ₱{parseFloat(selectedOrder.total_amount).toLocaleString()}
                  </span>
                  <span style={{
                    color: '#718096',
                    fontSize: '0.9rem'
                  }}>
                    {formatDate(selectedOrder.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div
              className="order-modal-scroll"
              style={{
                padding: '2rem',
                paddingTop: '2rem',
                overflowY: 'auto',
                overflowX: 'hidden',
                flex: 1,
                minHeight: 0
              }}
            >
              {/* Order Items - Grouped by Location */}
              <div style={{
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#2d3748',
                  marginBottom: '1rem'
                }}>
                  Order Items ({selectedOrder.items?.length || 0})
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem'
                }}>
                  {(() => {
                    // Group items by location
                    const itemsByLocation = {};
                    if (selectedOrder.items && selectedOrder.items.length > 0) {
                      selectedOrder.items.forEach((item, idx) => {
                        const locId = item.source_location_id || 'no_location';
                        if (!itemsByLocation[locId]) {
                          itemsByLocation[locId] = [];
                        }
                        itemsByLocation[locId].push({ ...item, originalIdx: idx });
                      });
                    }
                    
                    const locationIds = Object.keys(itemsByLocation);
                    const hasMultipleLocations = locationIds.length > 1;
                    
                    return locationIds.map((locId) => {
                      const locationItems = itemsByLocation[locId];
                      const locationName = locId !== 'no_location' && locations[locId] 
                        ? (locations[locId].location_name || locations[locId].branch_name || `Location ${locId}`)
                        : (locId === 'no_location' ? 'No Location Specified' : `Location ${locId}`);
                      
                      return (
                        <div key={locId} style={{
                          padding: hasMultipleLocations ? '1rem' : '0',
                          background: hasMultipleLocations ? '#ffffff' : 'transparent',
                          borderRadius: hasMultipleLocations ? '12px' : '0',
                          border: hasMultipleLocations ? '2px solid #cbd5e0' : 'none',
                          boxShadow: hasMultipleLocations ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                        }}>
                          {hasMultipleLocations && (
                            <div style={{
                              marginBottom: '1rem',
                              paddingBottom: '0.75rem',
                              borderBottom: '2px solid #e2e8f0'
                            }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '0.5rem'
                              }}>
                                <div>
                                  <h4 style={{
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    color: '#2d3748',
                                    margin: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                  }}>
                                    📍 {locationName}
                                  </h4>
                                  <p style={{
                                    fontSize: '0.85rem',
                                    color: '#718096',
                                    margin: '0.25rem 0 0 0'
                                  }}>
                                    {locationItems.length} item{locationItems.length !== 1 ? 's' : ''} from this location
                                  </p>
                                </div>
                                {selectedOrder.delivery_fees_by_location && selectedOrder.delivery_fees_by_location[String(locId)] !== undefined && (
                                  <div style={{
                                    textAlign: 'right'
                                  }}>
                                    <div style={{
                                      fontSize: '0.75rem',
                                      color: '#718096',
                                      marginBottom: '0.25rem'
                                    }}>
                                      Delivery Fee:
                                    </div>
                                    <div style={{
                                      fontSize: '1rem',
                                      fontWeight: '700',
                                      color: '#2d3748'
                                    }}>
                                      ₱{parseFloat(selectedOrder.delivery_fees_by_location[String(locId)] || 0).toLocaleString()}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                          }}>
                            {locationItems.map((item, itemIdx) => {
                              const idx = item.originalIdx;
                              return (
                                <div
                                  key={idx}
                                  style={{
                                    background: '#f7fafc',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'center'
                                  }}
                                >
                                  <div style={{
                                    flex: '1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem'
                                  }}>
                                    <h5 style={{
                                      fontSize: '1rem',
                                      fontWeight: '600',
                                      color: '#2d3748'
                                    }}>
                                      {item.product_name}
                                    
                                      {(item.is_made_to_order === 1 || item.is_made_to_order === '1') && (
                                        <span style={{
                                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                          color: 'white',
                                          padding: '2px 8px',
                                          borderRadius: '12px',
                                          fontSize: '10px',
                                          marginLeft: '8px',
                                          fontWeight: '600'
                                        }}>
                                          MADE TO ORDER
                                        </span>
                                      )}
                                      {(item.is_made_to_order === 0 || item.is_made_to_order === '0') && (
                                        <span style={{
                                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                          color: 'white',
                                          padding: '2px 8px',
                                          borderRadius: '12px',
                                          fontSize: '10px',
                                          marginLeft: '8px',
                                          fontWeight: '600'
                                        }}>
                                          IN STOCK
                                        </span>
                                      )}
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
                                    </h5>
                                    {item.source_location_id && locations[item.source_location_id] && (
                                      <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.85rem',
                                        color: '#4a5568',
                                        marginTop: '0.25rem'
                                      }}>
                                        <span style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '0.25rem'
                                        }}>
                                          📍 Location: <strong>{locations[item.source_location_id].location_name}</strong>
                                        </span>
                                      </div>
                                    )}
                                    {item.modifications && (
                                      <p style={{
                                        fontSize: '0.85rem',
                                        color: '#718096'
                                      }}>
                                        {item.modifications}
                                      </p>
                                    )}
                                    <div style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '0.25rem',
                                      fontSize: '0.9rem',
                                      color: '#718096'
                                    }}>
                                      <div style={{ display: 'flex', gap: '1rem' }}>
                                        <span>Qty: {item.quantity}</span>
                                        {item.original_price && parseFloat(item.original_price) !== parseFloat(item.price || item.unit_price || 0) ? (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                              <span style={{ textDecoration: 'line-through', color: '#a0aec0' }}>
                                                Original: ₱{parseFloat(item.original_price).toLocaleString()}
                                              </span>
                                              <span style={{ fontWeight: '600', color: '#2d3748' }}>
                                                Adjusted: ₱{parseFloat(item.price || item.unit_price || 0).toLocaleString()}
                                              </span>
                                              <span style={{
                                                background: '#fef3c7',
                                                color: '#92400e',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                              }}>
                                                Price Adjusted
                                              </span>
                                            </div>
                                            {item.price_adjustment_notes && (
                                              <div style={{
                                                fontSize: '0.8rem',
                                                color: '#4a5568',
                                                fontStyle: 'italic',
                                                padding: '0.5rem',
                                                background: '#f7fafc',
                                                borderRadius: '4px',
                                                border: '1px solid #e2e8f0',
                                                marginTop: '0.25rem'
                                              }}>
                                                <strong>Note:</strong> {item.price_adjustment_notes}
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <span>Price: ₱{parseFloat(item.price || item.unit_price || 0).toLocaleString()}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    color: '#2d3748'
                                  }}>
                                    ₱{parseFloat(item.subtotal || (item.price || item.unit_price || 0) * item.quantity).toLocaleString()}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Cancellation Information */}
              {((selectedOrder.status || '').toLowerCase() === 'cancelled') && selectedOrder.items && selectedOrder.items.length > 0 && (
                <div style={{
                  marginBottom: '2rem',
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
                  
                  {/* Get cancellation info from status history first, then fallback to items */}
                  {(() => {
                    // First try to get from status history
                    let cancellationNotes = null;
                    let cancelledBy = 'Unknown';
                    let cancelledAt = null;
                    
                    if (selectedOrder.history && Array.isArray(selectedOrder.history)) {
                      const cancelledHistory = selectedOrder.history.find(h => 
                        (h.status || '').toLowerCase() === 'cancelled'
                      );
                      if (cancelledHistory) {
                        cancellationNotes = cancelledHistory.notes || null;
                        cancelledAt = cancelledHistory.created_at || null;
                        cancelledBy = cancelledHistory.updated_by_name || (cancelledHistory.updated_by ? 'admin' : 'customer');
                      }
                    }
                    
                    // Fallback to items if not found in history
                    if (!cancellationNotes && selectedOrder.items && Array.isArray(selectedOrder.items)) {
                      const firstCancelledItem = selectedOrder.items.find(item => 
                        item.cancellation_notes || item.cancelled_by || item.cancelled_at
                      );
                      
                      if (firstCancelledItem) {
                        cancelledBy = firstCancelledItem.cancelled_by || cancelledBy;
                        cancellationNotes = firstCancelledItem.cancellation_notes || cancellationNotes;
                        cancelledAt = firstCancelledItem.cancelled_at || cancelledAt;
                      }
                    }
                    
                    if (!cancellationNotes && !cancelledAt) return null;
                    
                    cancellationNotes = cancellationNotes || 'No reason provided';
                    
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
                            {cancelledBy === 'admin' ? '👤 Admin' : '👤 You (Customer)'}
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
                marginBottom: '2rem',
                padding: '2rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                borderRadius: '16px',
                border: '2px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#2d3748',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    margin: 0
                  }}>
                    <span style={{
                      fontSize: '1.8rem',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }}>📍</span>
                    Order Tracking
                  </h3>

                </div>

                {/* Tracking Timeline - Based on trackRequest.js design */}
                <div style={{
                  position: 'relative',
                  paddingLeft: '2.5rem'
                }}>
                  {/* Status Steps */}
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

                    // If cancelled, only show steps up to cancellation point
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

                      // Timeline positioning - based on trackRequest.js design
                      const circleSize = 20;
                      const circleLeft = -28;
                      const circleCenter = circleLeft + (circleSize / 2); // -18px
                      const lineWidth = 3;
                      const lineLeft = circleCenter - (lineWidth / 2); // -19.5px
                      const lineTop = circleSize; // 20px (start from bottom of circle)

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
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: `2px solid ${isCancelled && stepStatus === 'cancelled' ? '#ef4444' : (isActive ? getStatusColor(selectedOrder.status) : (isCompleted ? '#10b981' : '#e2e8f0'))}`,
                            transition: 'all 0.3s ease',
                            boxShadow: isActive ? `0 4px 12px ${getStatusColor(selectedOrder.status)}30` : (isCompleted ? '0 4px 12px #10b98130' : (isCancelled && stepStatus === 'cancelled' ? '0 4px 12px #ef444430' : '0 2px 6px rgba(0,0,0,0.08)')),
                            transform: isActive ? 'translateX(4px)' : 'translateX(0)'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              marginBottom: '1rem',
                              flexWrap: 'wrap'
                            }}>
                              <span style={{
                                fontSize: '1.8rem',
                                filter: isActive || isCompleted ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'none'
                              }}>{step.icon}</span>
                              <span style={{
                                fontWeight: isActive ? '700' : (isCompleted ? '600' : (isCancelled && stepStatus === 'cancelled' ? '700' : '500')),
                                color: isCancelled && stepStatus === 'cancelled' ? '#ef4444' : (isActive ? getStatusColor(selectedOrder.status) : (isCompleted ? '#10b981' : '#718096')),
                                fontSize: '1.15rem',
                                flex: 1
                              }}>
                                {step.label}
                              </span>
                              {isActive && !isCancelled && (
                                <span style={{
                                  fontSize: '0.8rem',
                                  fontWeight: '700',
                                  color: getStatusColor(selectedOrder.status),
                                  background: getStatusColor(selectedOrder.status) + '20',
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  boxShadow: `0 2px 4px ${getStatusColor(selectedOrder.status)}20`
                                }}>
                                  Current
                                </span>
                              )}
                              {isCancelled && stepStatus === 'cancelled' && (
                                <span style={{
                                  fontSize: '0.8rem',
                                  fontWeight: '700',
                                  color: '#ef4444',
                                  background: '#ef444420',
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  boxShadow: '0 2px 4px #ef444420'
                                }}>
                                  Cancelled
                                </span>
                              )}
                              {isCompleted && !isActive && !isCancelled && (
                                <span style={{
                                  fontSize: '0.8rem',
                                  fontWeight: '700',
                                  color: '#10b981',
                                  background: '#10b98120',
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  boxShadow: '0 2px 4px #10b98120'
                                }}>
                                  Done
                                </span>
                              )}
                            </div>

                            {/* Date and Time Display */}
                            {stepDate && (isCompleted || isActive) ? (
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                marginTop: '1rem',
                                paddingTop: '1rem',
                                borderTop: `2px solid ${isCancelled && stepStatus === 'cancelled' ? '#ef444430' : (isActive ? getStatusColor(selectedOrder.status) + '30' : (isCompleted ? '#10b98130' : '#e2e8f0'))}`
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.75rem',
                                  fontSize: '0.9rem',
                                  color: isCancelled && stepStatus === 'cancelled' ? '#ef4444' : (isActive ? getStatusColor(selectedOrder.status) : (isCompleted ? '#10b981' : '#718096')),
                                  fontWeight: '600'
                                }}>
                                  <span style={{ fontSize: '1.1rem' }}>🕐</span>
                                  <span>{formatDate(stepDate)}</span>
                                </div>
                              </div>
                            ) : !isCompleted && !isActive ? (
                              <div style={{
                                fontSize: '0.85rem',
                                color: '#a0aec0',
                                fontStyle: 'italic',
                                marginTop: '1rem',
                                paddingTop: '1rem',
                                borderTop: '2px solid #e2e8f0'
                              }}>
                                Pending...
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Status History Details */}
              {selectedOrder.history && selectedOrder.history.length > 0 && (
                <div style={{
                  marginBottom: '2rem',
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#2d3748',
                    marginBottom: '1rem'
                  }}>
                    Status History
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    {selectedOrder.history.map((hist, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem',
                          background: '#f7fafc',
                          borderRadius: '6px'
                        }}
                      >
                        <div>
                          <span style={{
                            fontWeight: '600',
                            color: '#2d3748',
                            marginRight: '0.5rem'
                          }}>
                            {getStatusLabel(hist.status)}
                          </span>
                          {hist.notes && (
                            <span style={{
                              color: '#718096',
                              fontSize: '0.9rem'
                            }}>
                              - {hist.notes}
                            </span>
                          )}
                        </div>
                        <span style={{
                          color: '#a0aec0',
                          fontSize: '0.85rem'
                        }}>
                          {formatDate(hist.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: '2px solid #e2e8f0',
                flexWrap: 'wrap'
              }}>
                {((selectedOrder.status || '').toLowerCase() === 'approved' || (selectedOrder.status || '').toLowerCase() === 'approve') && (
                  <button
                    onClick={() => {
                      setShowOrderModal(false);
                      handlePayOrder(selectedOrder);
                    }}
                    style={{
                      flex: 1,
                      minWidth: '200px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      padding: '1rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '1rem',
                      boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
                      transition: 'all 0.3s'
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
                    💳 Pay Now
                  </button>
                )}
                {(['pending', 'approved', 'approve'].includes((selectedOrder.status || '').toLowerCase())) && (
                  <button
                    onClick={() => {
                      setShowOrderModal(false);
                      handleCancelOrder(selectedOrder);
                    }}
                    style={{
                      flex: 1,
                      minWidth: '200px',
                      background: '#ef4444',
                      color: 'white',
                      padding: '1rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '1rem',
                      boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 12px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 6px rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    ❌ Cancel Order
                  </button>
                )}
                {(selectedOrder.status || '').toLowerCase() === 'delivered' && (
                  <button
                    onClick={() => {
                      setShowOrderModal(false);
                      handleCompleteTransaction(selectedOrder);
                    }}
                    style={{
                      flex: 1,
                      minWidth: '200px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      padding: '1rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '1rem',
                      boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
                      transition: 'all 0.3s'
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
                    ✓ Complete Transaction
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && selectedOrder && (
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
              handleClosePaymentModal();
            }
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Header */}
            <div style={{
              padding: '2rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #e2e8f0',
              background: 'white',
              flexShrink: 0
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: '#2d3748',
                  margin: 0
                }}>
                  Complete Payment
                </h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
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
            </div>

            {/* Scrollable Content */}
            <div
              className="payment-modal-scroll"
              style={{
                padding: '2rem',
                paddingTop: '2rem',
                overflowY: 'auto',
                overflowX: 'hidden',
                flex: 1,
                minHeight: 0
              }}
            >
              {/* Payment Summary with Item Breakdown */}
              <div style={{
                padding: '1rem',
                background: '#f7fafc',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#2d3748',
                  marginBottom: '1rem'
                }}>
                  Order: {selectedOrder.order_number}
                </h3>

                {/* Item Breakdown */}
                <div style={{
                  marginBottom: '1rem'
                }}>
                  <h4 style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#4a5568',
                    marginBottom: '0.75rem'
                  }}>
                    Items:
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (() => {
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
                            padding: hasMultipleLocations ? '0.75rem' : '0',
                            background: hasMultipleLocations ? '#f7fafc' : 'transparent',
                            borderRadius: hasMultipleLocations ? '8px' : '0',
                            border: hasMultipleLocations ? '1px solid #cbd5e0' : 'none',
                            marginBottom: hasMultipleLocations ? '0.75rem' : '0'
                          }}>
                            {hasMultipleLocations && (
                              <div style={{
                                marginBottom: '0.75rem',
                                paddingBottom: '0.5rem',
                                borderBottom: '1px solid #e2e8f0'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start'
                                }}>
                                  <div>
                                    <h5 style={{
                                      fontSize: '0.9rem',
                                      fontWeight: '700',
                                      color: '#2d3748',
                                      margin: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem'
                                    }}>
                                      📍 {locationName}
                                    </h5>
                                    <p style={{
                                      fontSize: '0.75rem',
                                      color: '#718096',
                                      margin: '0.25rem 0 0 0'
                                    }}>
                                      {locationItems.length} item{locationItems.length !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                  {selectedOrder.delivery_fees_by_location && selectedOrder.delivery_fees_by_location[String(locId)] !== undefined && (
                                    <div style={{
                                      textAlign: 'right'
                                    }}>
                                      <div style={{
                                        fontSize: '0.7rem',
                                        color: '#718096',
                                        marginBottom: '0.2rem'
                                      }}>
                                        Delivery:
                                      </div>
                                      <div style={{
                                        fontSize: '0.85rem',
                                        fontWeight: '700',
                                        color: '#2d3748'
                                      }}>
                                        ₱{parseFloat(selectedOrder.delivery_fees_by_location[String(locId)] || 0).toLocaleString()}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.75rem'
                            }}>
                              {locationItems.map((item, itemIdx) => {
                                const idx = item.originalIdx;
                                const itemPrice = parseFloat(item.price || item.unit_price || 0);
                                const itemQuantity = parseInt(item.quantity || 1);
                                const itemTotal = itemPrice * itemQuantity;

                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      background: 'white',
                                      padding: '0.75rem',
                                      borderRadius: '6px',
                                      border: '1px solid #e2e8f0'
                                    }}
                                  >
                                    <div style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'flex-start',
                                      marginBottom: '0.5rem'
                                    }}>
                                      <div style={{ flex: 1 }}>
                                        <div style={{
                                          fontWeight: '600',
                                          color: '#2d3748',
                                          fontSize: '0.95rem',
                                          marginBottom: '0.25rem'
                                        }}>
                                          {item.product_name}
                                          {(item.is_custom === 1 || item.is_custom === true || item.isCustom) && (
                                            <span style={{
                                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                              color: 'white',
                                              padding: '2px 6px',
                                              borderRadius: '8px',
                                              fontSize: '9px',
                                              marginLeft: '6px',
                                              fontWeight: '600'
                                            }}>
                                              CUSTOM
                                            </span>
                                          )}
                                          {(item.is_made_to_order === 1 || item.is_made_to_order === '1') && (
                                            <span style={{
                                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                              color: 'white',
                                              padding: '2px 6px',
                                              borderRadius: '8px',
                                              fontSize: '9px',
                                              marginLeft: '6px',
                                              fontWeight: '600'
                                            }}>
                                              MADE TO ORDER
                                            </span>
                                          )}
                                          {(item.is_made_to_order === 0 || item.is_made_to_order === '0') && (
                                            <span style={{
                                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                              color: 'white',
                                              padding: '2px 6px',
                                              borderRadius: '8px',
                                              fontSize: '9px',
                                              marginLeft: '6px',
                                              fontWeight: '600'
                                            }}>
                                              IN STOCK
                                            </span>
                                          )}
                                        </div>
                                        {item.source_location_id && locations[item.source_location_id] && (
                                          <div style={{
                                            fontSize: '0.8rem',
                                            color: '#4a5568',
                                            marginTop: '0.25rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                          }}>
                                            📍 <strong>Location:</strong> {locations[item.source_location_id].location_name}
                                          </div>
                                        )}
                                        {item.modifications && (
                                          <div style={{
                                            fontSize: '0.8rem',
                                            color: '#718096',
                                            marginTop: '0.25rem'
                                          }}>
                                            {item.modifications}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      fontSize: '0.85rem',
                                      color: '#4a5568'
                                    }}>
                                      <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.25rem'
                                      }}>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                          <span>Qty: <strong>{itemQuantity}</strong></span>
                                          {item.original_price && parseFloat(item.original_price) !== itemPrice ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <span style={{ textDecoration: 'line-through', color: '#a0aec0' }}>
                                                  Original: ₱{parseFloat(item.original_price).toLocaleString()}
                                                </span>
                                                <span style={{ fontWeight: '600', color: '#2d3748' }}>
                                                  Adjusted: ₱{itemPrice.toLocaleString()}
                                                </span>
                                                <span style={{
                                                  background: '#fef3c7',
                                                  color: '#92400e',
                                                  padding: '2px 6px',
                                                  borderRadius: '4px',
                                                  fontSize: '0.7rem',
                                                  fontWeight: '600'
                                                }}>
                                                  Price Adjusted
                                                </span>
                                              </div>
                                              {item.price_adjustment_notes && (
                                                <div style={{
                                                  fontSize: '0.75rem',
                                                  color: '#4a5568',
                                                  fontStyle: 'italic',
                                                  padding: '0.4rem',
                                                  background: '#f7fafc',
                                                  borderRadius: '4px',
                                                  border: '1px solid #e2e8f0',
                                                  marginTop: '0.25rem'
                                                }}>
                                                  <strong>Note:</strong> {item.price_adjustment_notes}
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <span>Price: <strong>₱{itemPrice.toLocaleString()}</strong></span>
                                          )}
                                        </div>
                                      </div>
                                      <div style={{
                                        fontWeight: '700',
                                        color: '#2d3748',
                                        fontSize: '0.95rem'
                                      }}>
                                        Total: ₱{itemTotal.toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      });
                    })() : (
                      <div style={{
                        padding: '0.75rem',
                        background: 'white',
                        borderRadius: '6px',
                        textAlign: 'center',
                        color: '#718096',
                        fontSize: '0.9rem'
                      }}>
                        No items found
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary Totals */}
                <div style={{
                  borderTop: '2px solid #e2e8f0',
                  paddingTop: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.9rem',
                    color: '#718096'
                  }}>
                    <span>Items Subtotal:</span>
                    <span>₱{(() => {
                      const subtotal = selectedOrder.items?.reduce((sum, item) => {
                        return sum + (parseFloat(item.price || item.unit_price || 0) * parseInt(item.quantity || 1));
                      }, 0) || 0;
                      return subtotal.toLocaleString();
                    })()}</span>
                  </div>
                  {(() => {
                    // Check if items are from different locations
                    const locationIds = new Set();
                    if (selectedOrder.items && selectedOrder.items.length > 0) {
                      selectedOrder.items.forEach(item => {
                        if (item.source_location_id) {
                          locationIds.add(item.source_location_id);
                        }
                      });
                    }
                    const hasMultipleLocations = locationIds.size > 1;
                    const totalDeliveryFee = parseFloat(selectedOrder.delivery_fee || 0);
                    const deliveryFeesByLocation = selectedOrder.delivery_fees_by_location || {};
                    
                    if (totalDeliveryFee > 0) {
                      if (hasMultipleLocations && Object.keys(deliveryFeesByLocation).length > 0) {
                        // Show breakdown by location if multiple locations and delivery_fees_by_location exists
                        return (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem'
                          }}>
                            <div style={{
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              color: '#2d3748',
                              marginBottom: '0.25rem'
                            }}>
                              Delivery Fees by Location:
                            </div>
                            {Array.from(locationIds).map((locId) => {
                              const locationFee = deliveryFeesByLocation[String(locId)] || deliveryFeesByLocation[locId] || 0;
                              const locationName = locId !== 'no_location' && locations[locId] 
                                ? (locations[locId].location_name || locations[locId].branch_name || `Location ${locId}`)
                                : (locId === 'no_location' ? 'No Location Specified' : `Location ${locId}`);
                              
                              if (parseFloat(locationFee) <= 0) return null;
                              
                              return (
                                <div key={locId} style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '0.85rem',
                                  color: '#718096',
                                  paddingLeft: '0.75rem',
                                  paddingRight: '0.5rem'
                                }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem' }}>📍</span>
                                    <span>{locationName}:</span>
                                  </span>
                                  <span style={{ fontWeight: '600' }}>
                                    ₱{parseFloat(locationFee).toLocaleString()}
                                  </span>
                                </div>
                              );
                            })}
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '0.9rem',
                              color: '#2d3748',
                              fontWeight: '700',
                              marginTop: '0.25rem',
                              paddingTop: '0.5rem',
                              borderTop: '1px solid #e2e8f0'
                            }}>
                              <span>Total Delivery Fee:</span>
                              <span>₱{totalDeliveryFee.toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      } else {
                        // Single location - show simple delivery fee
                        return (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.9rem',
                            color: '#718096'
                          }}>
                            <span>Delivery Fee:</span>
                            <span>₱{totalDeliveryFee.toLocaleString()}</span>
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#2d3748',
                    marginTop: '0.5rem',
                    paddingTop: '0.5rem',
                    borderTop: '2px solid #e2e8f0'
                  }}>
                    <span>Total to Pay:</span>
                    <span>₱{(() => {
                      const subtotal = selectedOrder.items?.reduce((sum, item) => {
                        return sum + (parseFloat(item.price || item.unit_price || 0) * parseInt(item.quantity || 1));
                      }, 0) || 0;
                      const deliveryFee = parseFloat(selectedOrder.delivery_fee || 0);
                      const total = subtotal + deliveryFee;
                      return total.toLocaleString();
                    })()}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Details Form */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#2d3748',
                  marginBottom: '0.5rem'
                }}>
                  Delivery Details
                </h3>

                <div>
                  <label style={{
                    display: 'block',
                    fontWeight: '600',
                    color: '#2d3748',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem'
                  }}>
                    Delivery Address *
                  </label>
                  <textarea
                    value={paymentForm.delivery_address}
                    onChange={(e) => setPaymentForm({ ...paymentForm, delivery_address: e.target.value })}
                    placeholder="Enter complete delivery address"
                    rows="3"
                    disabled
                    readOnly
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      backgroundColor: '#f7fafc',
                      cursor: 'not-allowed',
                      color: '#4a5568'
                    }}
                    required
                  />
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#718096',
                    marginTop: '0.25rem',
                    fontStyle: 'italic'
                  }}>
                    Using delivery address from your order
                  </p>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontWeight: '600',
                    color: '#2d3748',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem'
                  }}>
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    value={paymentForm.delivery_contact_name}
                    onChange={(e) => setPaymentForm({ ...paymentForm, delivery_contact_name: e.target.value })}
                    placeholder="Enter contact name"
                    disabled
                    readOnly
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0',
                      fontSize: '1rem',
                      backgroundColor: '#f7fafc',
                      cursor: 'not-allowed',
                      color: '#4a5568'
                    }}
                    required
                  />
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#718096',
                    marginTop: '0.25rem',
                    fontStyle: 'italic'
                  }}>
                    Using your name from account profile
                  </p>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontWeight: '600',
                    color: '#2d3748',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem'
                  }}>
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    value={paymentForm.delivery_contact_phone}
                    onChange={(e) => setPaymentForm({ ...paymentForm, delivery_contact_phone: e.target.value })}
                    placeholder="Enter contact phone (e.g., 09123456789)"
                    disabled
                    readOnly
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0',
                      fontSize: '1rem',
                      backgroundColor: '#f7fafc',
                      cursor: 'not-allowed',
                      color: '#4a5568'
                    }}
                    required
                  />
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#718096',
                    marginTop: '0.25rem',
                    fontStyle: 'italic'
                  }}>
                    Using your phone from account profile
                  </p>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontWeight: '600',
                    color: '#2d3748',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem'
                  }}>
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    value={paymentForm.delivery_notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, delivery_notes: e.target.value })}
                    placeholder="Additional delivery instructions or notes"
                    rows="2"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              {/* Payment Flow Steps */}
              {paymentStep === 'method' && (
                <>
                  {/* Payment Method Selection */}
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: '#f7fafc',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0'
                  }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#2d3748',
                      marginBottom: '0.75rem'
                    }}>
                      Select Payment Method:
                    </label>
                <div style={{
                  display: 'flex',
                  gap: '1rem'
                }}>
                  <button
                    onClick={() => setPaymentMethod('gcash')}
                    type="button"
                    style={{
                      flex: 1,
                      padding: '1rem',
                      borderRadius: '8px',
                      border: `2px solid ${paymentMethod === 'gcash' ? '#0070f3' : '#e2e8f0'}`,
                      background: paymentMethod === 'gcash' ? '#e6f2ff' : 'white',
                      color: paymentMethod === 'gcash' ? '#0070f3' : '#718096',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (paymentMethod !== 'gcash') {
                        e.target.style.borderColor = '#0070f3';
                        e.target.style.background = '#f0f8ff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (paymentMethod !== 'gcash') {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.background = 'white';
                      }
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>📱</span>
                    <span>GCash</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    type="button"
                    style={{
                      flex: 1,
                      padding: '1rem',
                      borderRadius: '8px',
                      border: `2px solid ${paymentMethod === 'card' ? '#667eea' : '#e2e8f0'}`,
                      background: paymentMethod === 'card' ? '#f0f0ff' : 'white',
                      color: paymentMethod === 'card' ? '#667eea' : '#718096',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (paymentMethod !== 'card') {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.background = '#f8f9ff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (paymentMethod !== 'card') {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.background = 'white';
                      }
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>💳</span>
                    <span>Card</span>
                  </button>
                </div>
                <p style={{
                  margin: '0.75rem 0 0 0',
                  fontSize: '0.75rem',
                  color: '#718096',
                  fontStyle: 'italic',
                  textAlign: 'center'
                }}>
                  ⚠️ Demo Mode: This is a test payment. No actual charges will be made.
                </p>
              </div>

                    {/* Payment Button */}
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      marginTop: '1.5rem'
                    }}>
                      <button
                        onClick={handleClosePaymentModal}
                        style={{
                          flex: 1,
                          padding: '0.875rem',
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
                        onClick={handlePayment}
                        style={{
                          flex: 2,
                          padding: '0.875rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: paymentMethod === 'gcash' 
                            ? 'linear-gradient(135deg, #0070f3 0%, #0051cc 100%)'
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          cursor: 'pointer',
                          fontWeight: '700',
                          fontSize: '1rem',
                          boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)',
                          transition: 'all 0.2s'
                        }}
                      >
                        {paymentMethod === 'gcash' ? '📱' : '💳'} Continue to Payment
                      </button>
                    </div>
                  </>
              )}

              {/* GCash QR Code Step */}
              {paymentStep === 'details' && paymentMethod === 'gcash' && (
                <>
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, #0070f3 0%, #0051cc 100%)',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: 'white'
                  }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '700' }}>
                      Scan QR Code to Pay
                    </h3>
                    <div style={{
                      background: 'white',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      display: 'inline-block',
                      marginBottom: '1rem'
                    }}>
                      {/* Demo QR Code */}
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GCash:${selectedOrder?.order_number || 'DEMO'}-Amount:${selectedOrder ? (parseFloat(selectedOrder.items?.reduce((sum, item) => sum + (parseFloat(item.price || item.unit_price || 0) * parseInt(item.quantity || 1)), 0) || 0) + parseFloat(selectedOrder.delivery_fee || 0)).toFixed(2) : '0.00'}`}
                        alt="GCash QR Code"
                        style={{
                          width: '200px',
                          height: '200px',
                          display: 'block'
                        }}
                      />
                    </div>
                    <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>
                      Amount: ₱{selectedOrder ? (parseFloat(selectedOrder.items?.reduce((sum, item) => sum + (parseFloat(item.price || item.unit_price || 0) * parseInt(item.quantity || 1)), 0) || 0) + parseFloat(selectedOrder.delivery_fee || 0)).toLocaleString() : '0.00'}
                    </p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', opacity: 0.8 }}>
                      Open GCash app and scan this QR code
                    </p>
                  </div>

                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: '#fff3e0',
                    borderRadius: '8px',
                    border: '2px solid #ff9800'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#e65100' }}>
                      ⚠️ <strong>Demo Mode:</strong> This is a test QR code. No actual payment will be processed.
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '1.5rem'
                  }}>
                    <button
                      onClick={() => setPaymentStep('method')}
                      style={{
                        flex: 1,
                        padding: '0.875rem',
                        borderRadius: '8px',
                        border: '2px solid #e2e8f0',
                        background: 'white',
                        color: '#718096',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = '#cbd5e0';
                        e.target.style.background = '#f7fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.background = 'white';
                      }}
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleGCashConfirm}
                      style={{
                        flex: 2,
                        padding: '0.875rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '1rem',
                        boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
                        transition: 'all 0.2s'
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
                      ✓ I've Paid via GCash
                    </button>
                  </div>
                </>
              )}

              {/* Card/Bank Payment Details Step */}
              {paymentStep === 'details' && paymentMethod !== 'gcash' && (
                <>
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1.5rem',
                    background: '#f7fafc',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0'
                  }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '700', color: '#2d3748' }}>
                      Enter Payment Details
                    </h3>

                    {/* Card Payment Form */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#4a5568',
                        marginBottom: '0.5rem'
                      }}>
                        Card Number *
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                          const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                          setPaymentDetails({ ...paymentDetails, cardNumber: formatted });
                        }}
                        maxLength={19}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '2px solid #e2e8f0',
                          fontSize: '1rem'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#4a5568',
                        marginBottom: '0.5rem'
                      }}>
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={paymentDetails.cardHolderName}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cardHolderName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '2px solid #e2e8f0',
                          fontSize: '1rem'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: '#4a5568',
                          marginBottom: '0.5rem'
                        }}>
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={paymentDetails.cardExpiry}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2, 4);
                            }
                            setPaymentDetails({ ...paymentDetails, cardExpiry: value });
                          }}
                          maxLength={5}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '2px solid #e2e8f0',
                            fontSize: '1rem'
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: '#4a5568',
                          marginBottom: '0.5rem'
                        }}>
                          CVV *
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={paymentDetails.cardCVV}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                            setPaymentDetails({ ...paymentDetails, cardCVV: value });
                          }}
                          maxLength={3}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '2px solid #e2e8f0',
                            fontSize: '1rem'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{
                      padding: '1rem',
                      background: '#fff3e0',
                      borderRadius: '8px',
                      border: '2px solid #ff9800',
                      marginTop: '1rem'
                    }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#e65100' }}>
                        ⚠️ <strong>Demo Mode:</strong> This is a test payment form. No actual charges will be made.
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '1.5rem'
                  }}>
                    <button
                      onClick={() => setPaymentStep('method')}
                      style={{
                        flex: 1,
                        padding: '0.875rem',
                        borderRadius: '8px',
                        border: '2px solid #e2e8f0',
                        background: 'white',
                        color: '#718096',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = '#cbd5e0';
                        e.target.style.background = '#f7fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.background = 'white';
                      }}
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleCardBankSubmit}
                      style={{
                        flex: 2,
                        padding: '0.875rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '1rem',
                        boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 12px rgba(102, 126, 234, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 6px rgba(102, 126, 234, 0.3)';
                      }}
                    >
                      ✓ Confirm Payment
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {showArchiveModal && (
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
              setShowArchiveModal(false);
            }
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '80vh',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Header */}
            <div style={{
              padding: '2rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #e2e8f0',
              background: 'white',
              flexShrink: 0,
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: '#2d3748',
                  margin: 0
                }}>
                  Past Orders
                </h2>
                <button
                  onClick={() => setShowArchiveModal(false)}
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
              <p style={{
                color: '#718096',
                fontSize: '0.9rem',
                marginTop: '0.5rem',
                marginBottom: 0
              }}>
                Cancelled and completed orders
              </p>
            </div>

            {/* Scrollable Content */}
            <div
              className="order-modal-scroll"
              style={{
                padding: '2rem',
                paddingTop: '2rem',
                overflowY: 'auto',
                overflowX: 'hidden',
                flex: 1,
                minHeight: 0
              }}
            >
              {archivedOrders.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  color: '#718096'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '1rem', opacity: 0.3 }}>📁</div>
                  <h3 style={{ color: '#495057', marginBottom: '0.5rem' }}>No Archived Orders</h3>
                  <p style={{ margin: 0 }}>Cancelled and completed orders will appear here.</p>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem'
                }}>
                  {archivedOrders.map((order) => {
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
                        key={order.order_id}
                        onClick={() => {
                          setShowArchiveModal(false);
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                        style={{
                          background: 'white',
                          borderRadius: '12px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          border: '1px solid #e2e8f0'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{
                          padding: '1.5rem',
                          borderBottom: '1px solid #e2e8f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '1rem'
                        }}>
                          <div style={{ flex: 1 }}>
                            <h3 style={{
                              fontSize: '1.25rem',
                              fontWeight: '700',
                              color: '#2d3748',
                              marginBottom: '0.25rem'
                            }}>
                              {order.order_number}
                            </h3>
                            <p style={{
                              color: '#718096',
                              fontSize: '0.9rem'
                            }}>
                              {formatDate(order.created_at)}
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
                              backgroundColor: getStatusColor(order.status) + '20',
                              color: getStatusColor(order.status),
                              fontWeight: '600',
                              fontSize: '0.9rem'
                            }}>
                              {getStatusLabel(order.status)}
                            </span>
                            <span style={{
                              fontSize: '1.25rem',
                              fontWeight: '700',
                              color: '#2d3748'
                            }}>
                              ₱{parseFloat(order.total_amount).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal - Only show when processing */}
      {showPaymentProcessing && paymentProcessing && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '3rem',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 1.5rem',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#2d3748',
              margin: '0 0 0.5rem 0'
            }}>
              Processing Payment...
            </h3>
            <p style={{
              fontSize: '1rem',
              color: '#718096',
              margin: 0
            }}>
              {paymentMethod === 'gcash' 
                ? 'Processing your GCash payment. Please wait...'
                : 'Processing your card payment. Please wait...'
              }
            </p>
          </div>
        </div>
      )}

      {/* Custom Payment Complete Modal */}
      {showPaymentComplete && paymentCompleteData && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            animation: 'fadeIn 0.3s ease-in'
          }}
          onClick={() => {
            setShowPaymentComplete(false);
            setPaymentCompleteData(null);
          }}
        >
          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            @keyframes checkmark {
              0% { transform: scale(0); }
              50% { transform: scale(1.2); }
              100% { transform: scale(1); }
            }
            @keyframes confetti {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
            }
          `}</style>
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '24px',
              padding: '0',
              maxWidth: '500px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 25px 80px rgba(102, 126, 234, 0.4)',
              overflow: 'hidden',
              animation: 'slideUp 0.4s ease-out',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative background elements */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '150px',
              height: '150px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%'
            }} />

            {/* Content */}
            <div style={{
              padding: '3rem 2.5rem',
              position: 'relative',
              zIndex: 1
            }}>
              {/* Success Icon */}
              <div style={{
                width: '100px',
                height: '100px',
                margin: '0 auto 1.5rem',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                animation: 'checkmark 0.6s ease-out'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: 'white',
                margin: '0 0 0.5rem 0',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}>
                Payment Successful!
              </h2>

              {/* Subtitle */}
              <p style={{
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.9)',
                margin: '0 0 2rem 0'
              }}>
                Your payment has been processed successfully
              </p>

              {/* Payment Details Card */}
              <div style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  <span style={{
                    fontSize: '0.9rem',
                    color: '#718096',
                    fontWeight: '600'
                  }}>
                    Order Number:
                  </span>
                  <span style={{
                    fontSize: '1rem',
                    color: '#2d3748',
                    fontWeight: '700',
                    fontFamily: 'monospace'
                  }}>
                    {paymentCompleteData.orderNumber}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  <span style={{
                    fontSize: '0.9rem',
                    color: '#718096',
                    fontWeight: '600'
                  }}>
                    Payment Method:
                  </span>
                  <span style={{
                    fontSize: '1rem',
                    color: '#2d3748',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {paymentCompleteData.method === 'GCash' ? '📱' : '💳'} {paymentCompleteData.method}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: '1.1rem',
                    color: '#2d3748',
                    fontWeight: '700'
                  }}>
                    Total Amount:
                  </span>
                  <span style={{
                    fontSize: '1.5rem',
                    color: '#667eea',
                    fontWeight: '800'
                  }}>
                    ₱{paymentCompleteData.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowPaymentComplete(false);
                  setPaymentCompleteData(null);
                }}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'white',
                  color: '#667eea',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                }}
              >
                Continue
              </button>
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
                  Total: ₱{parseFloat(orderToCancel.total_amount || 0).toLocaleString()}
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
                  {customerCancellationReasons.map((reason, index) => (
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
                      if (cancelError) setCancelError('');
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
                      This note will be recorded and visible to the admin.
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
    </div>
  );
}

