'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [addressFields, setAddressFields] = useState({
    street: '',
    barangay: '',
    city: '',
    province: '',
    note: ''
  });
  const sessionId = searchParams.get('session_id');

  const BASE_URL = typeof window !== 'undefined' 
    ? (window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.')
      ? `http://${window.location.hostname}/capstone-api/api/`
      : 'https://ag-home.site/backend/api/')
    : 'http://localhost/capstone-api/api/';

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

  const createOrderFromPayment = async (address) => {
      try {
        // Get customer info from sessionStorage
        const customerId = sessionStorage.getItem('customer_id');
        if (!customerId) {
          showAlertError({
            icon: 'error',
            title: 'Error',
            text: 'Customer information not found. Please contact support.',
            button: 'OK'
          });
          setLoading(false);
          return;
        }

        // Check if this is payment for an existing order
        const pendingOrderId = sessionStorage.getItem('pending_payment_order_id');
        const deliveryDetailsStr = sessionStorage.getItem('pending_payment_delivery_details');
        
        if (pendingOrderId) {
          // Get delivery details from sessionStorage
          let deliveryDetails = {};
          if (deliveryDetailsStr) {
            try {
              deliveryDetails = JSON.parse(deliveryDetailsStr);
            } catch (e) {
              console.error('Error parsing delivery details:', e);
            }
          }

          // Update existing order with payment information and delivery details
          const response = await axios.get(BASE_URL + 'orders.php', {
            params: {
              json: JSON.stringify({
                order_id: parseInt(pendingOrderId),
                stripe_session_id: sessionId,
                payment_status: 'paid',
                payment_method: 'stripe',
                delivery_address: address || deliveryDetails.delivery_address || '',
                delivery_contact_name: deliveryDetails.delivery_contact_name || '',
                delivery_contact_phone: deliveryDetails.delivery_contact_phone || '',
                delivery_notes: deliveryDetails.delivery_notes || '',
                status: 'on going' // Move to on going after payment
              }),
              operation: 'UpdateOrderPayment'
            }
          });

          if (response.data.success) {
            // Clear pending order data
            sessionStorage.removeItem('pending_payment_order_id');
            sessionStorage.removeItem('pending_payment_delivery_details');
            setOrderCreated(true);
            setOrderNumber(response.data.order_number || null);
            setLoading(false);
            AlertSucces('Payment successful!', 'Your order has been paid and confirmed. We will process your order soon.', true, 'OK');
            return;
          } else {
            showAlertError({
              icon: 'error',
              title: 'Error',
              text: response.data.message || 'Failed to update order. Please contact support.',
              button: 'OK'
            });
            setLoading(false);
            return;
          }
        }

        // If no pending order, try to get cart (fallback for old flow)
        const cartKey = `cart_${customerId}`;
        const savedCart = localStorage.getItem(cartKey);
        if (!savedCart) {
          showAlertError({
            icon: 'error',
            title: 'Error',
            text: 'Order or cart information not found. Please contact support.',
            button: 'OK'
          });
          setLoading(false);
          return;
        }

        const cartItems = JSON.parse(savedCart);
        if (cartItems.length === 0) {
          showAlertError({
            icon: 'error',
            title: 'Error',
            text: 'No items in cart.',
            button: 'OK'
          });
          setLoading(false);
          return;
        }

        // Calculate total
        const totalAmount = cartItems.reduce((sum, item) => {
          return sum + (parseFloat(item.price) * item.quantity);
        }, 0);

        // Create new order (fallback for old flow)
        const orderPayload = {
          customer_id: parseInt(customerId),
          stripe_session_id: sessionId,
          cart_items: cartItems,
          total_amount: totalAmount,
          payment_method: 'stripe',
          payment_status: 'paid',
          status: 'approved',
          delivery_address: address || '' // Include delivery address
        };
        
        // Log the payload being sent
        console.log('Payment success - Order payload being sent:', JSON.stringify(orderPayload, null, 2));
        console.log('Payment success - Delivery address:', address || 'EMPTY');
        
        const response = await axios.get(BASE_URL + 'orders.php', {
          params: {
            json: JSON.stringify(orderPayload),
            operation: 'CreateOrder'
          }
        });

        if (response.data.success) {
          setOrderCreated(true);
          setOrderNumber(response.data.order_number);
          
          // Clear cart
          localStorage.removeItem(cartKey);
          
          // Also clear guest cart if exists
          localStorage.removeItem('guest_cart');
          
          AlertSucces(
            'Order created successfully!',
            'success',
            true,
            'Great!'
          );
        } else {
          showAlertError({
            icon: 'error',
            title: 'Error Creating Order',
            text: response.data.message || 'Failed to create order. Please contact support.',
            button: 'OK'
          });
        }
      } catch (error) {
        console.error('Error creating order:', error);
        showAlertError({
          icon: 'error',
          title: 'Error',
          text: 'Failed to create order. Please contact support with your payment session ID.',
          button: 'OK'
        });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const checkAddressAndCreateOrder = async () => {
      // Get customer info from sessionStorage
      const customerId = sessionStorage.getItem('customer_id');
      if (!customerId) {
        showAlertError({
          icon: 'error',
          title: 'Error',
          text: 'Customer information not found. Please contact support.',
          button: 'OK'
        });
        setLoading(false);
        return;
      }

      // Always require address entry - show modal even if customer has saved address
      try {
        const profileResponse = await axios.get(BASE_URL + 'ecommerce_customer.php', {
          params: {
            json: JSON.stringify({ customer_id: parseInt(customerId) }),
            operation: 'GetCustomerProfile'
          }
        });
        
        // Pre-fill with saved address if available
        if (profileResponse.data.success && profileResponse.data.customer?.address) {
          const savedAddress = profileResponse.data.customer.address;
          setDeliveryAddress(savedAddress);
          
          // Try to parse saved address into fields
          const addressParts = savedAddress.split(',').map(s => s.trim());
          let note = '';
          let partsWithoutNote = addressParts.filter(part => {
            if (part.includes('(Note:') || part.includes('Note:')) {
              note = part.replace(/\(Note:|Note:|\)/g, '').trim();
              return false;
            }
            return true;
          });
          
          // Remove "Philippines" from parts
          partsWithoutNote = partsWithoutNote.filter(p => p.toLowerCase() !== 'philippines');
          
          if (partsWithoutNote.length >= 4) {
            setAddressFields({
              street: partsWithoutNote[0] || '',
              barangay: partsWithoutNote[1] || '',
              city: partsWithoutNote[2] || '',
              province: partsWithoutNote[3] || '',
              note: note
            });
          }
        }
      } catch (error) {
        console.error('Error fetching customer profile:', error);
      }
      
      // Always show address modal to confirm/update address
      setShowAddressModal(true);
      setLoading(false);
      return;
    };

    checkAddressAndCreateOrder();
  }, [sessionId, BASE_URL]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '2rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div className="spinner" style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <h2 style={{ color: '#2d3748', marginBottom: '0.5rem' }}>Processing Your Order</h2>
          <p style={{ color: '#718096' }}>Please wait while we create your order...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const handleAddressSubmit = async () => {
    // Build full address from fields
    const fullAddress = [
      addressFields.street,
      addressFields.barangay,
      addressFields.city,
      addressFields.province,
      'Philippines',
      addressFields.note ? `(Note: ${addressFields.note})` : ''
    ].filter(Boolean).join(', ');
    
    // Validate required fields
    if (!addressFields.street || !addressFields.barangay || !addressFields.city || !addressFields.province) {
      setAddressError('Please fill in all required fields (Street, Barangay, City, Province)');
      return;
    }
    
    const error = validatePhilippinesAddress(fullAddress);
    if (error) {
      setAddressError(error);
      return;
    }
    
    // Set the full address
    setDeliveryAddress(fullAddress);
    
    // Save address to customer profile
    const customerId = sessionStorage.getItem('customer_id');
    if (customerId) {
      try {
        await axios.get(BASE_URL + 'ecommerce_customer.php', {
          params: {
            json: JSON.stringify({
              customer_id: parseInt(customerId),
              address: fullAddress
            }),
            operation: 'UpdateCustomerProfile'
          }
        });
      } catch (error) {
        console.error('Error saving address:', error);
        // Continue anyway
      }
    }
    
    setShowAddressModal(false);
    setAddressError('');
    setLoading(true);
    
    // Proceed with order creation
    createOrderFromPayment(fullAddress);
  };

  // Address Modal
  if (showAddressModal) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        zIndex: 10000
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          maxWidth: '700px',
          width: '100%',
          zIndex: 10001
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Confirm Delivery Address</h2>
          <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '24px' }}>
            Please confirm or update your delivery address in the Philippines to complete your order.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#2d3748' }}>
                Street/Unit Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={addressFields.street}
                onChange={(e) => {
                  setAddressFields({ ...addressFields, street: e.target.value });
                  setAddressError('');
                }}
                placeholder="e.g., 123 Main Street, Unit 5"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#2d3748' }}>
                Barangay <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={addressFields.barangay}
                onChange={(e) => {
                  setAddressFields({ ...addressFields, barangay: e.target.value });
                  setAddressError('');
                }}
                placeholder="e.g., Barangay Poblacion"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#2d3748' }}>
                  City/Municipality <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={addressFields.city}
                  onChange={(e) => {
                    setAddressFields({ ...addressFields, city: e.target.value });
                    setAddressError('');
                  }}
                  placeholder="e.g., Cagayan de Oro"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#2d3748' }}>
                  Province <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={addressFields.province}
                  onChange={(e) => {
                    setAddressFields({ ...addressFields, province: e.target.value });
                    setAddressError('');
                  }}
                  placeholder="e.g., Misamis Oriental"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#2d3748' }}>
                Delivery Note (Optional)
              </label>
              <textarea
                value={addressFields.note}
                onChange={(e) => {
                  setAddressFields({ ...addressFields, note: e.target.value });
                  setAddressError('');
                }}
                placeholder="e.g., Near the church, 2nd floor, Gate 3, etc."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              <small style={{ 
                display: 'block', 
                color: '#718096', 
                fontSize: '0.85rem', 
                marginTop: '4px' 
              }}>
                Add any additional delivery instructions or landmarks
              </small>
            </div>

            {addressError && (
              <div style={{ 
                color: '#ef4444', 
                fontSize: '0.85rem', 
                padding: '8px',
                background: '#fee2e2',
                borderRadius: '6px',
                border: '1px solid #fecaca'
              }}>
                {addressError}
              </div>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '12px' 
          }}>
            <button
              type="button"
              onClick={() => {
                router.push('/shop/orders');
              }}
              style={{
                flex: 1,
                padding: '12px',
                background: '#e2e8f0',
                color: '#4a5568',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddressSubmit}
              disabled={!addressFields.street || !addressFields.barangay || !addressFields.city || !addressFields.province}
              style={{
                flex: 1,
                padding: '12px',
                background: (!addressFields.street || !addressFields.barangay || !addressFields.city || !addressFields.province) ? '#cbd5e0' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (!addressFields.street || !addressFields.barangay || !addressFields.city || !addressFields.province) ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '2rem',
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        textAlign: 'center',
        maxWidth: '600px',
        width: '100%'
      }}>
        {orderCreated ? (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '3rem'
            }}>
              ✓
            </div>
            <h1 style={{
              color: '#2d3748',
              marginBottom: '1rem',
              fontSize: '2rem'
            }}>
              Payment Successful!
            </h1>
            <p style={{
              color: '#718096',
              marginBottom: '1.5rem',
              fontSize: '1.1rem'
            }}>
              Thank you for your purchase. Your order has been received and is pending approval.
            </p>
            {orderNumber && (
              <div style={{
                background: '#f7fafc',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <p style={{
                  color: '#4a5568',
                  marginBottom: '0.5rem',
                  fontWeight: '600'
                }}>
                  Order Number:
                </p>
                <p style={{
                  color: '#667eea',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  fontFamily: 'monospace'
                }}>
                  {orderNumber}
                </p>
              </div>
            )}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link
                href="/shop/orders"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'all 0.3s',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                View My Orders
              </Link>
              <Link
                href="/shop"
                style={{
                  background: 'white',
                  color: '#667eea',
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  border: '2px solid #667eea',
                  transition: 'all 0.3s',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f7fafc';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                }}
              >
                Continue Shopping
              </Link>
            </div>
            <p style={{
              color: '#a0aec0',
              marginTop: '2rem',
              fontSize: '0.9rem'
            }}>
              A confirmation email has been sent to your registered address.
            </p>
          </>
        ) : (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#fed7d7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '3rem'
            }}>
              ⚠
            </div>
            <h1 style={{
              color: '#2d3748',
              marginBottom: '1rem'
            }}>
              Payment Received
            </h1>
            <p style={{
              color: '#718096',
              marginBottom: '1.5rem'
            }}>
              Your payment was successful, but we encountered an issue creating your order.
              Please contact support with your payment session ID: <strong>{sessionId}</strong>
            </p>
            <Link
              href="/shop"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                display: 'inline-block'
              }}
            >
              Return to Shop
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '2rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div className="spinner" style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <h2 style={{ color: '#2d3748', marginBottom: '0.5rem' }}>Loading...</h2>
          <p style={{ color: '#718096' }}>Please wait...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

