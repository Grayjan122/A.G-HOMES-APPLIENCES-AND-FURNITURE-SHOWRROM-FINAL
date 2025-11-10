'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './deliveryTracking.css';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.all";
import CustomPagination from '@/app/Components/Pagination/pagination';

export default function DeliveryTracking() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ready'); // ready, onDelivery, pending
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [driverName, setDriverName] = useState('');
  const [deliveryReceipt, setDeliveryReceipt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [completedSearchTerm, setCompletedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [completedCurrentPage, setCompletedCurrentPage] = useState(1);
  const [baseURL, setBaseURL] = useState('');
  
  const itemsPerPage = 9;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = sessionStorage.getItem('baseURL') || 'http://localhost/capstone-api/api/';
      setBaseURL(url);
    }
  }, []);

  useEffect(() => {
    if (baseURL) {
      fetchDeliveries();
      fetchDeliveriesDetails();
      fetchDeliveryTracking();
    }
  }, [baseURL, activeTab]);
  const [deliveriesDetails, setDeliveriesDetails] = useState([]);
  const [deliveriesTracking, setDeliveriesTracking] = useState([]);
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(baseURL + 'delivery-management.php', {
        params: {
          operation: 'GetDeliveries',
          json: JSON.stringify([])
        }
      });
      console.log(response.data);

      if (response.data) {
        setDeliveries(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveriesDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(baseURL + 'delivery-management.php', {
        params: {
          operation: 'GetDeliveriesDetails',
          json: JSON.stringify([])
        }
      });
      console.log(response.data);

      if (response.data) {
        setDeliveriesDetails(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryTracking = async () => {
    try {
      setLoading(true);
      const response = await axios.get(baseURL + 'delivery-management.php', {
        params: {
          operation: 'GetDeliveryTracking',
          json: JSON.stringify([])
        }
      });
      console.log(response.data);

      if (response.data) {
        setDeliveriesTracking(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching delivery tracking:', error);
      setDeliveriesTracking([]);
    } finally {
      setLoading(false);
    }
  };

  // Format date and time for better readability
  const formatDateTime = (date, time) => {
    try {
      // Parse the date (format: YYYY-MM-DD)
      const [year, month, day] = date.split('-');
      const dateObj = new Date(year, month - 1, day);

      // Format date as "Month DD, YYYY"
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const formattedDate = `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;

      // Parse time (format: HH:MM)
      if (time) {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const min = minutes.padStart(2, '0');

        // Convert to 12-hour format with AM/PM
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const formattedTime = `${hour12}:${min} ${period}`;

        return {
          full: `${formattedDate} at ${formattedTime}`,
          date: formattedDate,
          time: formattedTime,
          dayOfWeek: dateObj.toLocaleDateString('en-US', { weekday: 'long' })
        };
      }

      return {
        full: formattedDate,
        date: formattedDate,
        time: '',
        dayOfWeek: dateObj.toLocaleDateString('en-US', { weekday: 'long' })
      };
    } catch (error) {
      console.error('Error formatting date/time:', error);
      return {
        full: `${date}${time ? ' at ' + time : ''}`,
        date: date,
        time: time || '',
        dayOfWeek: ''
      };
    }
  };

  // Get delivered date and time from tracking history
  const getDeliveredDateTime = (dtc_id) => {
    const tracking = deliveriesTracking.filter(t => t.dtc_id === dtc_id);
    const deliveredEntry = tracking.find(t => t.status === 'Delivered');

    if (deliveredEntry) {
      return formatDateTime(deliveredEntry.date, deliveredEntry.time);
    }

    return null;
  };

  const handleStartDelivery = (delivery) => {
    setSelectedDelivery(delivery);
    setDriverName('');
    setDeliveryReceipt('');
    setShowDriverModal(true);
  };

  const confirmStartDelivery = async () => {
    if (!driverName.trim()) {
      showAlertError({
        icon: "error",
        title: "Required Field",
        text: 'Please enter driver name',
        button: 'Okay'
      });
      return;
    }

    if (!deliveryReceipt.trim()) {
      showAlertError({
        icon: "error",
        title: "Required Field",
        text: 'Please enter delivery receipt number',
        button: 'Okay'
      });
      return;
    }

    try {
      setSubmitting(true);

      // Update delivery status to "On Delivery To Customer"
      const response = await axios.get(baseURL + 'delivery-management.php', {
        params: {
          operation: 'UpdateDeliveryStatus',
          json: JSON.stringify({
            dtc_id: selectedDelivery.dtc_id,
            status: 'On Delivery To Customer',
            driver_name: driverName.trim(),
            delivery_receipt: deliveryReceipt.trim()
          })
        }
      });

      if (response.data === 'Success') {
        // Send notification to customer
        await sendCustomerNotification(selectedDelivery, 'On Delivery To Customer');


        AlertSucces(
          "Delivery started! Customer has been notified.",
          "success",
          true,
          'Okay'
        );
        setShowDriverModal(false);
        setSelectedDelivery(null);
        setDriverName('');
        setDeliveryReceipt('');
        fetchDeliveries();
      } else {
        showAlertError({
          icon: "error",
          title: "Oppsss!",
          text: 'Failed to update delivery status',
          button: 'Okay'
        });
      }
    } catch (error) {
      console.error('Error starting delivery:', error);
      showAlertError({
        icon: "error",
        title: "Oppsss!",
        text: 'Error starting delivery. Please try again.',
        button: 'Okay'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteDelivery = async (delivery) => {
    Swal.fire({
      title: "Continue with delivery completion?",
      text: `Confirm that the delivery to ${delivery.cust_name} has been completed?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, complete delivery!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setSubmitting(true);

          // Update delivery status to "Delivered To Customer"
          const response = await axios.get(baseURL + 'delivery-management.php', {
            params: {
              operation: 'CompleteDelivery',
              json: JSON.stringify({
                dtc_id: delivery.dtc_id,
                invoice_id: delivery.invoice_id
              })
            }
          });

          if (response.data.status === 'Success' || response.data === 'Success') {
            // Send completion notification to customer with payment schedule
            await sendCustomerNotification(delivery, 'Delivered To Customer', response.data);

            AlertSucces(
              "Delivery completed successfully! Installment schedule has been activated (if applicable).",
              "success",
              true,
              'Okay'
            );
            fetchDeliveries();
          } else {
            console.log(response.data);
            showAlertError({
              icon: "error",
              title: "Oppsss!",
              text: 'Failed to complete delivery',
              button: 'Okay'
            });
          }
        } catch (error) {
          console.error('Error completing delivery:', error);
          showAlertError({
            icon: "error",
            title: "Oppsss!",
            text: 'Error completing delivery. Please try again.',
            button: 'Okay'
          });
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  const sendCustomerNotification = async (delivery, status, completionData = null) => {
    try {
      let message = '';
      let paymentSchedule = null;
      
      if (status === 'On Delivery To Customer') {
        message = `Your order (Invoice #${delivery.invoice_id}) is now on the way! Driver: ${driverName}. Please prepare to receive your items.`;
      } else {
        message = `Your order (Invoice #${delivery.invoice_id}) has been successfully delivered. Thank you for your purchase! If you didn't receive any item, please contact us immediately.`;
        
        // Extract payment schedule if it's an installment
        if (completionData && completionData.has_installment && completionData.payment_schedule) {
          paymentSchedule = completionData.payment_schedule;
        }
      }

      console.log('Sending notification:', {
        invoice_id: delivery.invoice_id,
        status: status,
        email: delivery.email,
        has_payment_schedule: paymentSchedule ? true : false
      });

      const notificationData = {
        invoice_id: delivery.invoice_id,
        message: message,
        type: status === 'On Delivery To Customer' ? 'delivery_on_way' : 'delivery_complete'
      };
      
      // Add payment schedule if available
      if (paymentSchedule) {
        notificationData.payment_schedule = paymentSchedule;
      }

      const response = await axios.get(baseURL + 'delivery-management.php', {
        params: {
          operation: 'SendCustomerNotification',
          json: JSON.stringify(notificationData)
        }
      });

      console.log('Notification response:', response.data);
      
      if (response.data !== 'Success') {
        console.error('Email notification failed:', response.data);
        showAlertError({
          icon: "warning",
          title: "Email Not Sent",
          text: 'Delivery updated successfully but email notification failed to send.',
          button: 'Okay'
        });
      } else {
        console.log('Email notification sent successfully');
      }
    } catch (error) {
      console.error('Error sending customer notification:', error);
      showAlertError({
        icon: "warning",
        title: "Email Error",
        text: 'Delivery updated but failed to send email notification. Error: ' + error.message,
        button: 'Okay'
      });
    }
  };

  const getStatusBadge = (status) => {
    const badgeStyles = {
      'Pending': { bg: '#FEF3C7', color: '#92400E', text: 'In Production' },
      'On Going': { bg: '#FEF3C7', color: '#92400E', text: 'In Production' },
      'On Delivery': { bg: '#FEF3C7', color: '#92400E', text: 'In Production' },
      'Ready for Delivery': { bg: '#E0F7FA', color: '#006E7A', text: 'Ready' },
      'On Delivery To Customer': { bg: '#EDE9FE', color: '#5B21B6', text: 'On the Way' },
      'Delivered To Customer': { bg: '#D1FAE5', color: '#065F46', text: 'Completed' }
    };

    const badge = badgeStyles[status] || { bg: '#E5E7EB', color: '#374151', text: status };
    return (
      <span style={{
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        background: badge.bg,
        color: badge.color
      }}>
        {badge.text}
      </span>
    );
  };

  // Helper functions to get related data
  const getDeliveryItems = (dtc_id) => {
    return deliveriesDetails.filter(detail => detail.dtc_id === dtc_id);
  };

  const getDeliveryTracking = (dtc_id) => {
    return deliveriesTracking.filter(track => track.dtc_id === dtc_id).sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA - dateB;
    });
  };

  const calculateTotalAmount = (dtc_id) => {
    const items = getDeliveryItems(dtc_id);
    return items.reduce((sum, item) =>
      sum + (parseFloat(item.price_per_item || 0) * parseInt(item.total_qty || 0)), 0
    );
  };

  const calculateTotalItems = (dtc_id) => {
    const items = getDeliveryItems(dtc_id);
    return items.reduce((sum, item) => sum + parseInt(item.total_qty || 0), 0);
  };

  // Reset page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  useEffect(() => {
    setCompletedCurrentPage(1);
  }, [completedSearchTerm]);

  const filteredDeliveries = deliveries.filter(delivery => {
    // First filter by active tab status (excluding completed)
    let matchesTab = false;
    if (activeTab === 'ready') {
      matchesTab = delivery.status === 'Ready for Delivery';
    } else if (activeTab === 'onDelivery') {
      matchesTab = delivery.status === 'On Delivery To Customer';
    } else if (activeTab === 'pending') {
      // "In Production" includes: Pending, On Going, and On Delivery (production/warehouse stages)
      matchesTab = delivery.status === 'Pending' || 
                   delivery.status === 'On Going' || 
                   delivery.status === 'On Delivery';
    }

    // If doesn't match tab, exclude it
    if (!matchesTab) return false;

    // Then filter by search term if there is one
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    return (
      delivery.cust_name?.toLowerCase().includes(search) ||
      delivery.invoice_id?.toString().includes(search) ||
      delivery.driver_name?.toLowerCase().includes(search)
    );
  });

  // Pagination for main deliveries
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDeliveries = filteredDeliveries.slice(startIndex, endIndex);

  // Separate filter for completed deliveries
  const completedDeliveries = deliveries.filter(delivery => {
    if (delivery.status !== 'Delivered To Customer') return false;

    if (!completedSearchTerm) return true;

    const search = completedSearchTerm.toLowerCase();
    return (
      delivery.cust_name?.toLowerCase().includes(search) ||
      delivery.invoice_id?.toString().includes(search) ||
      delivery.driver_name?.toLowerCase().includes(search)
    );
  });

  // Pagination for completed deliveries
  const completedTotalPages = Math.ceil(completedDeliveries.length / itemsPerPage);
  const completedStartIndex = (completedCurrentPage - 1) * itemsPerPage;
  const completedEndIndex = completedStartIndex + itemsPerPage;
  const paginatedCompletedDeliveries = completedDeliveries.slice(completedStartIndex, completedEndIndex);

  const getTabCount = (tab) => {
    return deliveries.filter(d => {
      if (tab === 'ready') return d.status === 'Ready for Delivery';
      if (tab === 'onDelivery') return d.status === 'On Delivery To Customer';
      if (tab === 'completed') return d.status === 'Delivered To Customer';
      if (tab === 'pending') {
        // "In Production" includes: Pending, On Going, On Delivery (customize production stages)
        return d.status === 'Pending' || d.status === 'On Going' || d.status === 'On Delivery';
      }
      return false;
    }).length;
  };

  return (
    <div className='dash-main'>
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{
            margin: '0',
            fontSize: '28px',
            color: '#2c3e50',
            fontWeight: '700'
          }}>🚚 Delivery Management</h1>
          <p style={{
            margin: '5px 0 0 0',
            color: '#7f8c8d',
            fontSize: '14px'
          }}>Track and manage customer deliveries</p>
        </div>

        <div style={{
          flex: '1',
          maxWidth: '400px',
          minWidth: '250px'
        }}>
          <input
            type="text"
            placeholder="Search by customer, invoice, or driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e1e8ed',
              borderRadius: '8px',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#42CAD6';
              e.target.style.boxShadow = '0 0 0 3px rgba(66, 202, 214, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e1e8ed';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <button
          onClick={() => setShowCompletedModal(true)}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
          }}
        >
          ✅ Completed Deliveries
          {deliveries.filter(d => d.status === 'Delivered To Customer').length > 0 && (
            <span style={{
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#10B981',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              {deliveries.filter(d => d.status === 'Delivered To Customer').length}
            </span>
          )}
        </button>
      </div>

      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        background: 'white',
        padding: '15px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        flexWrap: 'wrap'
      }}>
        {['ready', 'onDelivery', 'pending'].map((tab) => {
          const isActive = activeTab === tab;
          const labels = {
            ready: '📦 Ready for Delivery',
            onDelivery: '🚚 On Delivery',
            pending: '⏳ Pending (Production)'
          };

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: '1',
                minWidth: '180px',
                padding: '12px 20px',
                border: isActive ? '2px solid #42CAD6' : '2px solid #e1e8ed',
                background: isActive ? 'linear-gradient(135deg, #42CAD6 0%, #3AB0BC 100%)' : 'white',
                color: isActive ? 'white' : '#5a6c7d',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: isActive ? '0 4px 12px rgba(66, 202, 214, 0.3)' : 'none'
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.target.style.borderColor = '#42CAD6';
                  e.target.style.background = '#f0f8ff';
                  e.target.style.color = '#42CAD6';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.target.style.borderColor = '#e1e8ed';
                  e.target.style.background = 'white';
                  e.target.style.color = '#5a6c7d';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {labels[tab]}
              {getTabCount(tab) > 0 && (
                <span style={{
                  background: isActive ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)',
                  color: isActive ? '#42CAD6' : 'inherit',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  {getTabCount(tab)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #42CAD6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading deliveries...</p>
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '20px'
          }}>📭</div>
          <h3 style={{
            color: '#2c3e50',
            margin: '0 0 10px 0'
          }}>No deliveries found</h3>
          <p style={{
            color: '#7f8c8d',
            margin: '0'
          }}>
            {activeTab === 'ready' && 'No items are ready for delivery yet.'}
            {activeTab === 'onDelivery' && 'No deliveries are currently on the way.'}
            {activeTab === 'completed' && 'No completed deliveries.'}
            {activeTab === 'pending' && 'No items in production or transit to store.'}
          </p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {paginatedDeliveries.map((delivery) => (
            <div key={delivery.dtc_id} style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
              <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #42CAD6 0%, #3AB0BC 100%)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: '500'
                  }}>Invoice</span>
                  <span style={{
                    fontSize: '24px',
                    color: 'white',
                    fontWeight: '700'
                  }}>#{delivery.invoice_id}</span>
                </div>
                {getStatusBadge(delivery.status)}
              </div>

              <div style={{
                padding: '20px',
                flex: '1'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
                  gap: '10px'
                }}>
                  <span style={{
                    fontSize: '13px',
                    color: '#7f8c8d',
                    fontWeight: '500',
                    flexShrink: '0'
                  }}>👤 Customer:</span>
                  <span style={{
                    fontSize: '14px',
                    color: '#2c3e50',
                    fontWeight: '600',
                    textAlign: 'right',
                    wordBreak: 'break-word'
                  }}>{delivery.cust_name}</span>
                </div>

                {delivery.email && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px',
                    gap: '10px'
                  }}>
                    <span style={{
                      fontSize: '13px',
                      color: '#7f8c8d',
                      fontWeight: '500',
                      flexShrink: '0'
                    }}>📧 Email:</span>
                    <span style={{
                      fontSize: '14px',
                      color: '#2c3e50',
                      fontWeight: '600',
                      textAlign: 'right',
                      wordBreak: 'break-word'
                    }}>{delivery.email}</span>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
                  gap: '10px'
                }}>
                  <span style={{
                    fontSize: '13px',
                    color: '#7f8c8d',
                    fontWeight: '500',
                    flexShrink: '0'
                  }}>📦 Items:</span>
                  <span style={{
                    fontSize: '14px',
                    color: '#2c3e50',
                    fontWeight: '600',
                    textAlign: 'right',
                    wordBreak: 'break-word'
                  }}>
                    {calculateTotalItems(delivery.dtc_id)} item(s)
                    <button
                      onClick={() => {
                        setSelectedDelivery(delivery);
                        setShowDetailsModal(true);
                      }}
                      style={{
                        marginLeft: '8px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        background: '#42CAD6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.background = '#3AB0BC'}
                      onMouseOut={(e) => e.target.style.background = '#42CAD6'}
                    >
                      View Details
                    </button>
                  </span>
                </div>



                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
                  gap: '10px'
                }}>
                  <span style={{
                    fontSize: '13px',
                    color: '#7f8c8d',
                    fontWeight: '500',
                    flexShrink: '0'
                  }}>📍 Address:</span>
                  <span style={{
                    fontSize: '14px',
                    color: '#2c3e50',
                    fontWeight: '600',
                    textAlign: 'right',
                    wordBreak: 'break-word'
                  }}>{delivery.notes || 'N/A'}</span>
                </div>

                {delivery.preferred_date_delivery && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px',
                    gap: '10px'
                  }}>
                    <span style={{
                      fontSize: '13px',
                      color: '#7f8c8d',
                      fontWeight: '500',
                      flexShrink: '0'
                    }}>📅 Preferred Date:</span>
                    <span style={{
                      fontSize: '14px',
                      color: '#2c3e50',
                      fontWeight: '600',
                      textAlign: 'right',
                      wordBreak: 'break-word',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}>
                      <span>{formatDateTime(delivery.preferred_date_delivery, '').date}</span>
                      <span style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic' }}>
                        {formatDateTime(delivery.preferred_date_delivery, '').dayOfWeek}
                      </span>
                    </span>
                  </div>
                )}

                {delivery.driver_name && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px',
                    gap: '10px'
                  }}>
                    <span style={{
                      fontSize: '13px',
                      color: '#7f8c8d',
                      fontWeight: '500',
                      flexShrink: '0'
                    }}>🚗 Driver:</span>
                    <span style={{
                      fontSize: '14px',
                      color: '#2c3e50',
                      fontWeight: '600',
                      textAlign: 'right',
                      wordBreak: 'break-word'
                    }}>{delivery.driver_name}</span>
                  </div>
                )}

                {delivery.delivery_receipt && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px',
                    gap: '10px'
                  }}>
                    <span style={{
                      fontSize: '13px',
                      color: '#7f8c8d',
                      fontWeight: '500',
                      flexShrink: '0'
                    }}>📄 Receipt:</span>
                    <span style={{
                      fontSize: '14px',
                      color: '#2c3e50',
                      fontWeight: '600',
                      textAlign: 'right',
                      wordBreak: 'break-word'
                    }}>{delivery.delivery_receipt}</span>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
                  gap: '10px'
                }}>
                  <span style={{
                    fontSize: '13px',
                    color: '#7f8c8d',
                    fontWeight: '500',
                    flexShrink: '0'
                  }}>📋 Tracking:</span>
                  <span style={{
                    fontSize: '14px',
                    color: '#2c3e50',
                    fontWeight: '600',
                    textAlign: 'right',
                    wordBreak: 'break-word'
                  }}>
                    <button
                      onClick={() => {
                        setSelectedDelivery(delivery);
                        setShowTrackingModal(true);
                      }}
                      style={{
                        padding: '4px 12px',
                        fontSize: '12px',
                        background: '#8B5CF6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.background = '#7C3AED'}
                      onMouseOut={(e) => e.target.style.background = '#8B5CF6'}
                    >
                      View Timeline
                    </button>
                  </span>
                </div>
              </div>

              <div style={{
                padding: '15px 20px',
                background: '#f8f9fa',
                borderTop: '1px solid #e1e8ed'
              }}>
                {(delivery.status === 'Pending' || delivery.status === 'On Going') && (
                  <div style={{
                    textAlign: 'center',
                    padding: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    background: '#fff3cd',
                    color: '#856404'
                  }}>
                    {delivery.status === 'Pending' && '⏳ Waiting for production to start'}
                    {delivery.status === 'On Going' && '🔨 Item is being produced'}
                  </div>
                )}

                {delivery.status === 'Ready for Delivery' && (
                  <button
                    onClick={() => handleStartDelivery(delivery)}
                    disabled={submitting}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, #42CAD6 0%, #3AB0BC 100%)',
                      color: 'white',
                      opacity: submitting ? '0.6' : '1'
                    }}
                    onMouseOver={(e) => {
                      if (!submitting) {
                        e.target.style.background = 'linear-gradient(135deg, #3AB0BC 0%, #2E969F 100%)';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(66, 202, 214, 0.4)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!submitting) {
                        e.target.style.background = 'linear-gradient(135deg, #42CAD6 0%, #3AB0BC 100%)';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  >
                    🚚 Start Delivery
                  </button>
                )}

                {delivery.status === 'On Delivery To Customer' && (
                  <button
                    onClick={() => handleCompleteDelivery(delivery)}
                    disabled={submitting}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      color: 'white',
                      opacity: submitting ? '0.6' : '1'
                    }}
                    onMouseOver={(e) => {
                      if (!submitting) {
                        e.target.style.background = 'linear-gradient(135deg, #0e8075 0%, #2dd164 100%)';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(17, 153, 142, 0.4)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!submitting) {
                        e.target.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  >
                    ✅ Mark as Delivered
                  </button>
                )}

                {delivery.status === 'Delivered To Customer' && (
                  <div style={{
                    textAlign: 'center',
                    padding: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    background: '#d4edda',
                    color: '#155724'
                  }}>
                    {(() => {
                      const deliveredDateTime = getDeliveredDateTime(delivery.dtc_id);
                      if (deliveredDateTime) {
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div>✅ Delivered Successfully</div>
                            <div style={{ fontSize: '12px', fontWeight: '500' }}>
                              📅 {deliveredDateTime.full}
                            </div>
                            <div style={{ fontSize: '11px', fontStyle: 'italic', opacity: '0.8' }}>
                              {deliveredDateTime.dayOfWeek}
                            </div>
                          </div>
                        );
                      }
                      return '✅ Delivered Successfully';
                    })()}
                  </div>
                )}
              </div>
            </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '30px'
            }}>
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
                color="green"
              />
            </div>
          )}
        </>
      )}

      {/* Driver Name Modal */}
      {showDriverModal && (
        <div className="modal-overlay" onClick={() => !submitting && setShowDriverModal(false)} style={{
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              padding: '25px',
              borderBottom: '1px solid #e1e8ed',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #42CAD6 0%, #3AB0BC 100%)',
              borderRadius: '16px 16px 0 0'
            }}>
              <h2 style={{
                margin: '0',
                color: 'white',
                fontSize: '22px',
                fontWeight: '700'
              }}>🚚 Start Delivery</h2>
              <button
                onClick={() => setShowDriverModal(false)}
                disabled={submitting}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  color: 'white',
                  fontSize: '24px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  if (!submitting) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.transform = 'rotate(90deg)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!submitting) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'rotate(0deg)';
                  }
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '25px', overflowY: 'auto', flex: 1 }}>
              <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                borderLeft: '4px solid #42CAD6'
              }}>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#2c3e50' }}>
                  <strong>Invoice:</strong> #{selectedDelivery?.invoice_id}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#2c3e50' }}>
                  <strong>Customer:</strong> {selectedDelivery?.cust_name}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#2c3e50' }}>
                  <strong>Address:</strong> {selectedDelivery?.notes}
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="driver-name" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  fontSize: '14px'
                }}>Driver Name *</label>
                <input
                  id="driver-name"
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Enter driver's name"
                  disabled={submitting}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e8ed',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#42CAD6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(66, 202, 214, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e1e8ed';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="delivery-receipt" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  fontSize: '14px'
                }}>Delivery Receipt Number *</label>
                <input
                  id="delivery-receipt"
                  type="text"
                  value={deliveryReceipt}
                  onChange={(e) => setDeliveryReceipt(e.target.value)}
                  placeholder="Enter delivery receipt number"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e8ed',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#42CAD6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(66, 202, 214, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e1e8ed';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{
                background: '#e7f3ff',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#004085',
                borderLeft: '4px solid #0066cc'
              }}>
                ℹ️ The customer will be notified that their order is on the way.
              </div>
            </div>

            <div style={{
              padding: '20px 25px',
              borderTop: '1px solid #e1e8ed',
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowDriverModal(false)}
                disabled={submitting}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  background: '#e1e8ed',
                  color: '#5a6c7d'
                }}
                onMouseOver={(e) => {
                  if (!submitting) e.target.style.background = '#d1d8de';
                }}
                onMouseOut={(e) => {
                  if (!submitting) e.target.style.background = '#e1e8ed';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmStartDelivery}
                disabled={submitting || !driverName.trim() || !deliveryReceipt.trim()}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: (submitting || !driverName.trim() || !deliveryReceipt.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(135deg, #42CAD6 0%, #3AB0BC 100%)',
                  color: 'white',
                  opacity: (submitting || !driverName.trim() || !deliveryReceipt.trim()) ? '0.6' : '1'
                }}
                onMouseOver={(e) => {
                  if (!submitting && driverName.trim() && deliveryReceipt.trim()) {
                    e.target.style.background = 'linear-gradient(135deg, #3AB0BC 0%, #2E969F 100%)';
                    e.target.style.boxShadow = '0 4px 12px rgba(66, 202, 214, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!submitting && driverName.trim() && deliveryReceipt.trim()) {
                    e.target.style.background = 'linear-gradient(135deg, #42CAD6 0%, #3AB0BC 100%)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {submitting ? 'Processing...' : 'Start Delivery'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Details Modal */}
      {showDetailsModal && selectedDelivery && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)} style={{
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              padding: '25px',
              borderBottom: '1px solid #e1e8ed',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #42CAD6 0%, #3AB0BC 100%)',
              borderRadius: '16px 16px 0 0'
            }}>
              <h2 style={{
                margin: '0',
                color: 'white',
                fontSize: '22px',
                fontWeight: '700'
              }}>📦 Delivery Items - Invoice #{selectedDelivery.invoice_id}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'rotate(90deg)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'rotate(0deg)';
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '25px', overflowY: 'auto', flex: 1 }}>
              <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                borderLeft: '4px solid #42CAD6'
              }}>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#2c3e50' }}>
                  <strong>Customer:</strong> {selectedDelivery.cust_name}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#2c3e50' }}>
                  <strong>Address:</strong> {selectedDelivery.notes}
                </p>
                {selectedDelivery.driver_name && (
                  <p style={{ margin: '5px 0', fontSize: '14px', color: '#2c3e50' }}>
                    <strong>Driver:</strong> {selectedDelivery.driver_name}
                  </p>
                )}
                {selectedDelivery.delivery_receipt && (
                  <p style={{ margin: '5px 0', fontSize: '14px', color: '#2c3e50' }}>
                    <strong>Delivery Receipt:</strong> {selectedDelivery.delivery_receipt}
                  </p>
                )}
              </div>

              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#374151' }}>Items:</h3>
                {getDeliveryItems(selectedDelivery.dtc_id).map((item, index) => (
                  <div
                    key={item.dtcd_id}
                    style={{
                      padding: '12px',
                      background: index % 2 === 0 ? '#f9fafb' : 'white',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>
                        {item.product_code || 'CUSTOMIZED'}
                      </span>
                      <span style={{ fontWeight: '600', color: '#7c3aed' }}>
                        ₱{(parseFloat(item.price_per_item) * parseInt(item.total_qty)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                      {item.product_description}
                    </div>
                    {item.modifications && (
                      <div style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>
                        Modifications: {item.modifications}
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      Quantity: {item.total_qty} × ₱{parseFloat(item.price_per_item).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: '20px',
                padding: '12px',
                background: 'linear-gradient(135deg, #42CAD6 0%, #3AB0BC 100%)',
                borderRadius: '8px',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>

                <span style={{ fontSize: '20px', fontWeight: '700' }}>
                  ₱{calculateTotalAmount(selectedDelivery.dtc_id).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div style={{
              padding: '20px 25px',
              borderTop: '1px solid #e1e8ed',
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: '#e1e8ed',
                  color: '#5a6c7d'
                }}
                onMouseOver={(e) => e.target.style.background = '#d1d8de'}
                onMouseOut={(e) => e.target.style.background = '#e1e8ed'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Timeline Modal */}
      {showTrackingModal && selectedDelivery && (
        <div className="modal-overlay" onClick={() => setShowTrackingModal(false)} style={{
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              padding: '25px',
              borderBottom: '1px solid #e1e8ed',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #42CAD6 0%, #3AB0BC 100%)',
              borderRadius: '16px 16px 0 0'
            }}>
              <h2 style={{
                margin: '0',
                color: 'white',
                fontSize: '22px',
                fontWeight: '700'
              }}>📦 Tracking History - Invoice #{selectedDelivery.invoice_id}</h2>
              <button
                onClick={() => setShowTrackingModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'rotate(90deg)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'rotate(0deg)';
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '25px', overflowY: 'auto', flex: 1 }}>
              <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '30px',
                borderLeft: '4px solid #42CAD6'
              }}>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#2c3e50' }}>
                  <strong>Customer:</strong> {selectedDelivery.cust_name}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#2c3e50' }}>
                  <strong>Email:</strong> {selectedDelivery.email}
                </p>
                {selectedDelivery.driver_name && (
                  <p style={{ margin: '5px 0', fontSize: '14px', color: '#2c3e50' }}>
                    <strong>Driver:</strong> {selectedDelivery.driver_name}
                  </p>
                )}
                {selectedDelivery.delivery_receipt && (
                  <p style={{ margin: '5px 0', fontSize: '14px', color: '#2c3e50' }}>
                    <strong>Delivery Receipt:</strong> {selectedDelivery.delivery_receipt}
                  </p>
                )}
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#2c3e50' }}>
                  <strong>Current Status:</strong> <span style={{
                    color: selectedDelivery.status === 'Delivered' ? '#10B981' :
                      selectedDelivery.status === 'On Delivery' ? '#8B5CF6' :
                        selectedDelivery.status === 'Ready for Delivery' ? '#42CAD6' : '#F59E0B',
                    fontWeight: '700'
                  }}>{selectedDelivery.status}</span>
                </p>
              </div>

              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                Delivery Progress Tracker
              </h3>

              <div style={{ position: 'relative', paddingLeft: '40px' }}>
                {getDeliveryTracking(selectedDelivery.dtc_id).map((track, index, array) => {
                  const isLast = index === array.length - 1;
                  const isCurrent = track.status === selectedDelivery.status;

                  // Define status information with cohesive color palette
                  const statusInfo = {
                    'Pending': {
                      color: '#F59E0B',
                      bgColor: '#FEF3C7',
                      borderColor: '#F59E0B',
                      subtitle: 'Waiting for Production',
                      description: 'Item is in the production queue. This applies to customized products that need to be manufactured.'
                    },
                    'On Going': {
                      color: '#F59E0B',
                      bgColor: '#FEF3C7',
                      borderColor: '#F59E0B',
                      subtitle: 'Currently in Production',
                      description: 'Item is actively being produced by the warehouse. The customized product is being manufactured.'
                    },
                    'On Delivery': {
                      color: '#F59E0B',
                      bgColor: '#FEF3C7',
                      borderColor: '#F59E0B',
                      subtitle: 'In Transit to Store',
                      description: 'Item is being delivered from warehouse to the showroom.'
                    },
                    'Ready for Delivery': {
                      color: '#42CAD6',
                      bgColor: '#E0F7FA',
                      borderColor: '#42CAD6',
                      subtitle: 'Ready to Ship',
                      description: 'Item is ready and waiting for delivery assignment. Inventory items skip production and go directly to this status.'
                    },
                    'On Delivery To Customer': {
                      color: '#8B5CF6',
                      bgColor: '#EDE9FE',
                      borderColor: '#8B5CF6',
                      subtitle: 'On the Way to Customer',
                      description: 'Item is currently being delivered to the customer.'
                    },
                    'Delivered To Customer': {
                      color: '#10B981',
                      bgColor: '#D1FAE5',
                      borderColor: '#10B981',
                      subtitle: 'Completed',
                      description: 'Item has been successfully delivered to the customer.'
                    }
                  };

                  const info = statusInfo[track.status] || {
                    color: '#6B7280',
                    bgColor: '#F3F4F6',
                    borderColor: '#D1D5DB',
                    subtitle: track.status,
                    description: ''
                  };

                  return (
                    <div key={track.dtct_id} style={{ position: 'relative', marginBottom: isLast ? '0' : '30px' }}>
                      {/* Timeline line */}
                      {!isLast && (
                        <div style={{
                          position: 'absolute',
                          left: '-27px',
                          top: '40px',
                          width: '3px',
                          height: 'calc(100% + 15px)',
                          background: info.color
                        }} />
                      )}

                      {/* Timeline dot */}
                      <div style={{
                        position: 'absolute',
                        left: '-36px',
                        top: '8px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: info.color,
                        border: '4px solid white',
                        boxShadow: `0 0 0 3px ${info.color}`
                      }} />

                      {/* Content Box */}
                      <div style={{
                        padding: '16px 20px',
                        background: info.bgColor,
                        borderRadius: '8px',
                        border: `2px solid ${info.borderColor}`,
                        boxShadow: isCurrent ? `0 4px 12px ${info.color}33` : 'none'
                      }}>
                        {/* Status Header */}
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '700',
                          color: '#1f2937',
                          marginBottom: '4px'
                        }}>
                          {track.status}
                        </div>

                        {/* Status Subtitle */}
                        <div style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: info.color,
                          marginBottom: '8px'
                        }}>
                          Status: {info.subtitle}
                        </div>

                        {/* Date and Time */}
                        <div style={{
                          fontSize: '13px',
                          color: '#6b7280',
                          marginBottom: '4px',
                          fontWeight: '500'
                        }}>
                          📅 {formatDateTime(track.date, track.time).full}
                        </div>

                        {/* Day of Week */}
                        <div style={{
                          fontSize: '12px',
                          color: '#9ca3af',
                          fontStyle: 'italic'
                        }}>
                          {formatDateTime(track.date, track.time).dayOfWeek}
                        </div>

                        {/* Description */}
                        {info.description && (
                          <div style={{
                            fontSize: '12px',
                            color: info.color,
                            lineHeight: '1.5',
                            marginTop: '8px',
                            paddingTop: '8px',
                            borderTop: `1px solid ${info.color}33`
                          }}>
                            ℹ️ {info.description}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Future status indicator */}
                {selectedDelivery.status !== 'Delivered' && (
                  <div style={{ position: 'relative', marginTop: '30px', opacity: '0.4' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-36px',
                      top: '8px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#d1d5db',
                      border: '4px solid white',
                      boxShadow: '0 0 0 3px #d1d5db'
                    }} />

                    <div style={{
                      padding: '16px 20px',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: '2px dashed #d1d5db'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#9ca3af' }}>
                        Complete
                      </div>
                      <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
                        Awaiting final status update...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{
              padding: '20px 25px',
              borderTop: '1px solid #e1e8ed',
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowTrackingModal(false)}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: '#e1e8ed',
                  color: '#5a6c7d'
                }}
                onMouseOver={(e) => e.target.style.background = '#d1d8de'}
                onMouseOut={(e) => e.target.style.background = '#e1e8ed'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completed Deliveries Modal */}
      {showCompletedModal && (
        <div className="modal-overlay" onClick={() => setShowCompletedModal(false)} style={{
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '1200px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              padding: '25px',
              borderBottom: '1px solid #e1e8ed',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              borderRadius: '16px 16px 0 0'
            }}>
              <div>
                <h2 style={{
                  margin: '0',
                  color: 'white',
                  fontSize: '22px',
                  fontWeight: '700'
                }}>✅ Completed Deliveries</h2>
                <p style={{
                  margin: '5px 0 0 0',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '14px'
                }}>View all completed delivery records</p>
              </div>
              <button
                onClick={() => setShowCompletedModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'rotate(90deg)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'rotate(0deg)';
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '25px', borderBottom: '1px solid #e5e7eb' }}>
              <input
                type="text"
                placeholder="Search completed deliveries by customer, invoice, or driver..."
                value={completedSearchTerm}
                onChange={(e) => setCompletedSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10B981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e1e8ed';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <p style={{
                margin: '10px 0 0 0',
                color: '#6b7280',
                fontSize: '13px'
              }}>
                Showing {completedDeliveries.length} completed {completedDeliveries.length === 1 ? 'delivery' : 'deliveries'}
              </p>
            </div>

            <div style={{
              padding: '25px',
              overflowY: 'auto',
              flex: '1'
            }}>
              {completedDeliveries.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px'
                }}>
                  <div style={{
                    fontSize: '64px',
                    marginBottom: '20px'
                  }}>📭</div>
                  <h3 style={{
                    color: '#2c3e50',
                    margin: '0 0 10px 0'
                  }}>No completed deliveries found</h3>
                  <p style={{
                    color: '#7f8c8d',
                    margin: '0'
                  }}>
                    {completedSearchTerm ? 'Try a different search term' : 'Completed deliveries will appear here'}
                  </p>
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                  }}>
                    {paginatedCompletedDeliveries.map((delivery) => (
                    <div key={delivery.dtc_id} style={{
                      background: 'white',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      border: '2px solid #D1FAE5'
                    }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}>
                      <div style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <span style={{
                            fontSize: '12px',
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontWeight: '500'
                          }}>Invoice</span>
                          <span style={{
                            fontSize: '24px',
                            color: 'white',
                            fontWeight: '700'
                          }}>#{delivery.invoice_id}</span>
                        </div>
                        {getStatusBadge(delivery.status)}
                      </div>

                      <div style={{
                        padding: '20px',
                        flex: '1'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px',
                          gap: '10px'
                        }}>
                          <span style={{
                            fontSize: '13px',
                            color: '#7f8c8d',
                            fontWeight: '500',
                            flexShrink: '0'
                          }}>👤 Customer:</span>
                          <span style={{
                            fontSize: '14px',
                            color: '#2c3e50',
                            fontWeight: '600',
                            textAlign: 'right',
                            wordBreak: 'break-word'
                          }}>{delivery.cust_name}</span>
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px',
                          gap: '10px'
                        }}>
                          <span style={{
                            fontSize: '13px',
                            color: '#7f8c8d',
                            fontWeight: '500',
                            flexShrink: '0'
                          }}>💰 Amount:</span>
                          <span style={{
                            fontSize: '14px',
                            color: '#2c3e50',
                            fontWeight: '600',
                            textAlign: 'right',
                            wordBreak: 'break-word'
                          }}>₱{calculateTotalAmount(delivery.dtc_id).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        {delivery.driver_name && (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '12px',
                            gap: '10px'
                          }}>
                            <span style={{
                              fontSize: '13px',
                              color: '#7f8c8d',
                              fontWeight: '500',
                              flexShrink: '0'
                            }}>🚗 Driver:</span>
                            <span style={{
                              fontSize: '14px',
                              color: '#2c3e50',
                              fontWeight: '600',
                              textAlign: 'right',
                              wordBreak: 'break-word'
                            }}>{delivery.driver_name}</span>
                          </div>
                        )}

                        {delivery.delivery_receipt && (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '12px',
                            gap: '10px'
                          }}>
                            <span style={{
                              fontSize: '13px',
                              color: '#7f8c8d',
                              fontWeight: '500',
                              flexShrink: '0'
                            }}>📄 Receipt:</span>
                            <span style={{
                              fontSize: '14px',
                              color: '#2c3e50',
                              fontWeight: '600',
                              textAlign: 'right',
                              wordBreak: 'break-word'
                            }}>{delivery.delivery_receipt}</span>
                          </div>
                        )}

                        <div style={{
                          marginTop: '15px',
                          display: 'flex',
                          gap: '8px'
                        }}>
                          <button
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setShowDetailsModal(true);
                              setShowCompletedModal(false);
                            }}
                            style={{
                              flex: '1',
                              padding: '8px 12px',
                              fontSize: '12px',
                              background: '#42CAD6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              fontWeight: '600'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.background = '#3AB0BC';
                              e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.background = '#42CAD6';
                              e.target.style.transform = 'translateY(0)';
                            }}
                          >
                            📦 View Items
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setShowTrackingModal(true);
                              setShowCompletedModal(false);
                            }}
                            style={{
                              flex: '1',
                              padding: '8px 12px',
                              fontSize: '12px',
                              background: '#8B5CF6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              fontWeight: '600'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.background = '#7C3AED';
                              e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.background = '#8B5CF6';
                              e.target.style.transform = 'translateY(0)';
                            }}
                          >
                            📋 View Timeline
                          </button>
                        </div>
                      </div>

                      <div style={{
                        padding: '15px 20px',
                        background: '#f8f9fa',
                        borderTop: '1px solid #e1e8ed'
                      }}>
                        <div style={{
                          textAlign: 'center',
                          padding: '10px',
                          fontSize: '14px',
                          fontWeight: '600',
                          borderRadius: '8px',
                          background: '#d4edda',
                          color: '#155724'
                        }}>
                          {(() => {
                            const deliveredDateTime = getDeliveredDateTime(delivery.dtc_id);
                            if (deliveredDateTime) {
                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <div>✅ Delivered Successfully</div>
                                  <div style={{ fontSize: '12px', fontWeight: '500' }}>
                                    📅 {deliveredDateTime.full}
                                  </div>
                                  <div style={{ fontSize: '11px', fontStyle: 'italic', opacity: '0.8' }}>
                                    {deliveredDateTime.dayOfWeek}
                                  </div>
                                </div>
                              );
                            }
                            return '✅ Delivered Successfully';
                          })()}
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                  
                  {/* Pagination for Completed Deliveries */}
                  {completedTotalPages > 1 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginTop: '30px'
                    }}>
                      <CustomPagination
                        currentPage={completedCurrentPage}
                        totalPages={completedTotalPages}
                        onPageChange={(page) => setCompletedCurrentPage(page)}
                        color="green"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{
              padding: '20px 25px',
              borderTop: '1px solid #e1e8ed',
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowCompletedModal(false);
                  setCompletedSearchTerm('');
                }}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: '#e1e8ed',
                  color: '#5a6c7d'
                }}
                onMouseOver={(e) => e.target.style.background = '#d1d8de'}
                onMouseOut={(e) => e.target.style.background = '#e1e8ed'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

