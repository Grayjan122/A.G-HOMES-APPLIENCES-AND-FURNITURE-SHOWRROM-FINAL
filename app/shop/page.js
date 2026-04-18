'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import '../css/shop.css';
import { showAlertError } from '../Components/SweetAlert/error';
import { AlertSucces } from '../Components/SweetAlert/success';
import Swal from 'sweetalert2';

// Global flag to track if Google Maps script is being loaded
let googleMapsScriptLoading = false;
let googleMapsScriptLoaded = false;

// Map Picker Component
function MapPickerModal({ center, selectedLocation, onLocationSelect, onClose, initialAddress }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const [map, setMap] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(selectedLocation || center);
  const [address, setAddress] = useState(initialAddress || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if script already exists in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    
    // Load Google Maps script only if not already loaded or loading
    if (typeof window !== 'undefined') {
      if (window.google && window.google.maps) {
        // Google Maps already loaded
        googleMapsScriptLoaded = true;
        initializeMap();
      } else if (!existingScript && !googleMapsScriptLoading && !googleMapsScriptLoaded) {
        // Need to load the script
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
          setLoading(false);
          // Don't show error - just disable map functionality
          // User can still enter address manually
          return;
        }
        
        googleMapsScriptLoading = true;
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          // Check for API key errors after script loads
          if (window.google && window.google.maps) {
            googleMapsScriptLoading = false;
            googleMapsScriptLoaded = true;
            initializeMap();
          } else {
            googleMapsScriptLoading = false;
            setLoading(false);
            showAlertError({
              icon: 'error',
              title: 'Google Maps API Error',
              text: 'Invalid Google Maps API key. Please check your API key configuration. Get a valid key from https://console.cloud.google.com/google/maps-apis',
              button: 'OK'
            });
          }
        };
        script.onerror = () => {
          googleMapsScriptLoading = false;
          setLoading(false);
          showAlertError({
            icon: 'error',
            title: 'Map Loading Error',
            text: 'Failed to load Google Maps. Please check your internet connection and API key configuration.',
            button: 'OK'
          });
        };
        document.head.appendChild(script);
        
        // Listen for Google Maps errors
        window.gm_authFailure = () => {
          googleMapsScriptLoading = false;
          setLoading(false);
          showAlertError({
            icon: 'error',
            title: 'Invalid Google Maps API Key',
            text: 'The Google Maps API key is invalid or has exceeded its quota. Please check your API key at https://console.cloud.google.com/google/maps-apis',
            button: 'OK'
          });
        };
      } else if (existingScript) {
        // Script exists but not loaded yet, wait for it
        checkIntervalRef.current = setInterval(() => {
          if (window.google && window.google.maps) {
            if (checkIntervalRef.current) {
              clearInterval(checkIntervalRef.current);
              checkIntervalRef.current = null;
            }
            googleMapsScriptLoaded = true;
            initializeMap();
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
          }
          if (!window.google || !window.google.maps) {
            setLoading(false);
            showAlertError({
              icon: 'error',
              title: 'Map Loading Timeout',
              text: 'Google Maps is taking too long to load. Please refresh the page and try again.',
              button: 'OK'
            });
          }
        }, 10000);
      }
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current = null;
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current) return;
    
    if (!window.google || !window.google.maps) {
      setLoading(false);
      showAlertError({
        icon: 'error',
        title: 'Google Maps Not Available',
        text: 'Google Maps API is not loaded. Please refresh the page and try again.',
        button: 'OK'
      });
      return;
    }

    try {
      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: currentLocation,
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true
      });

      // Add marker
      const marker = new window.google.maps.Marker({
        position: currentLocation,
        map: googleMap,
        draggable: true,
        animation: window.google.maps.Animation.DROP
      });

      markerRef.current = marker;
      setMap(googleMap);

      // Geocode initial location
      geocodeLocation(currentLocation.lat, currentLocation.lng);

      // Handle map click
      googleMap.addListener('click', (e) => {
        const location = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        marker.setPosition(location);
        setCurrentLocation(location);
        geocodeLocation(location.lat, location.lng);
      });

      // Handle marker drag
      marker.addListener('dragend', (e) => {
        const location = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setCurrentLocation(location);
        geocodeLocation(location.lat, location.lng);
      });

      setLoading(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      setLoading(false);
      showAlertError({
        icon: 'error',
        title: 'Map Initialization Error',
        text: 'Failed to initialize Google Maps. Please check your API key and try again.',
        button: 'OK'
      });
    }
  };

  const geocodeLocation = (lat, lng) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setAddress(results[0].formatted_address);
        onLocationSelect({ lat, lng }, results[0].formatted_address);
      } else {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        onLocationSelect({ lat, lng }, null);
      }
    });
  };

  const handleSearch = (searchQuery) => {
    if (!window.google || !map) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        };
        map.setCenter(location);
        map.setZoom(17);
        if (markerRef.current) {
          markerRef.current.setPosition(location);
        }
        setCurrentLocation(location);
        setAddress(results[0].formatted_address);
        onLocationSelect(location, results[0].formatted_address);
      } else {
        showAlertError({
          icon: 'error',
          title: 'Location Not Found',
          text: 'Could not find the location. Please try a different search term.',
          button: 'OK'
        });
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '900px',
          width: '90%',
          maxHeight: '90vh',
          padding: '0',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>📍 Choose Your Location</h2>
          <button 
            className="modal-close" 
            onClick={onClose}
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

        <div style={{ padding: '16px', borderBottom: '1px solid #e9ecef', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Search for an address or place..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e.target.value);
                }
              }}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                if (input.value) {
                  handleSearch(input.value);
                }
              }}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Search
            </button>
          </div>
          {address && (
            <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#667eea', fontWeight: '500' }}>
              📍 {address}
            </p>
          )}
        </div>

        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {loading && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <p>Loading map...</p>
            </div>
          )}
          <div 
            ref={mapRef} 
            style={{ 
              width: '100%', 
              height: '100%',
              minHeight: '400px'
            }} 
          />
        </div>

        <div style={{
          padding: '20px',
          borderTop: '1px solid #e9ecef',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          flexShrink: 0
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
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
            onClick={() => {
              if (currentLocation) {
                onLocationSelect(currentLocation, address);
                AlertSucces('Location selected successfully!', 'success', true, 'OK');
                onClose();
              } else {
                showAlertError({
                  icon: 'warning',
                  title: 'No Location Selected',
                  text: 'Please click on the map to select a location',
                  button: 'OK'
                });
              }
            }}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
            }}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const router = useRouter();
  
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [customer, setCustomer] = useState(null);
  
  // Profile edit states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    latitude: null,
    longitude: null
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 8.4812, lng: 124.6472 }); // Cagayan de Oro default
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  
  // Check if Google Maps API key is available
  const hasGoogleMapsKey = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  }, []);
  
  // Auth form states
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    address: ''
  });
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: email, 2: code, 3: new password
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Product states
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [productTypes, setProductTypes] = useState([]);
  const [selectedProductType, setSelectedProductType] = useState('all');
  const [productTypePartsMap, setProductTypePartsMap] = useState({});
  const [currentCustomizableParts, setCurrentCustomizableParts] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [sortBy, setSortBy] = useState('name');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [productInventories, setProductInventories] = useState({});
  const [inventoriesLoading, setInventoriesLoading] = useState(false);
  
  // Product detail modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productInventory, setProductInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  
  // Shopping cart
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [cartItemInventories, setCartItemInventories] = useState({});
  const [selectedCartItems, setSelectedCartItems] = useState(new Set());
  
  // Location selection modal
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [productForLocation, setProductForLocation] = useState(null);
  const [availableLocationsForProduct, setAvailableLocationsForProduct] = useState([]);
  const [showMultipleLocationsModal, setShowMultipleLocationsModal] = useState(false);
  const [multipleLocationsConfirmed, setMultipleLocationsConfirmed] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [showCheckoutAddressModal, setShowCheckoutAddressModal] = useState(false);
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutAddressError, setCheckoutAddressError] = useState('');
  const [addressFields, setAddressFields] = useState({
    street: '',
    barangay: '',
    city: '',
    province: '',
    note: ''
  });
  
  // Discount state
  const [activeDiscount, setActiveDiscount] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Customization states
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [customizationType, setCustomizationType] = useState('');
  const [editingCartItem, setEditingCartItem] = useState(null);
  const [customization, setCustomization] = useState({
    product_name: '',
    description: '',
    size: '',
    cover: '',
    sofaArm: '',
    color: '',
    colorMix: false,
    primaryColor: '',
    secondaryColor: '',
    primaryCustomColor: '',
    secondaryCustomColor: '',
    button: '',
    otherModifications: '',
    quantity: 1,
    isCustom: false
  });

  // Base URL configuration
  const BASE_URL = useMemo(() => {
    if (typeof window === 'undefined') {
      return 'http://localhost/capstone-api/api/';
    }
    
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname.startsWith('192.168.')) {
      return `http://${hostname}/capstone-api/api/`;
    }
    
    return 'https://ag-home.site/backend/api/';
  }, []);


  // Initialize shop on mount
  useEffect(() => {
    console.log('🔗 Shop BASE_URL:', BASE_URL);
    console.log('🌐 Window available:', typeof window !== 'undefined');
    
    const init = async () => {
      try {
        if (typeof window !== 'undefined') {
          checkLoginStatus();
          // Load guest cart if not logged in
          if (!isLoggedIn) {
            loadGuestCart();
          }
        }
        await fetchInitialData();
      } catch (error) {
        console.error('❌ Shop initialization error:', error);
      }
    };
    
    init();
  }, [BASE_URL]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, selectedProductType, selectedLocation, priceRange, sortBy, showInStockOnly, productInventories]);

  // Helper function to calculate locations from items
  const calculateLocationsFromItems = (items) => {
    const locationGroups = {};
    const findAgoraMainShowroom = () => {
      const agoraLocation = locations.find(loc => {
        if (!loc.location_name) return false;
        const name = loc.location_name.toLowerCase();
        return name.includes('agora') && name.includes('main');
      });
      return agoraLocation ? agoraLocation.location_name : 'Agora Main Showroom';
    };
    const MADE_TO_ORDER_LOCATION = findAgoraMainShowroom();
    
    items.forEach((item) => {
      let locationName;
      if (item.preferred_location_name) {
        locationName = item.preferred_location_name;
      } else if (item.isCustom || item.isMadeToOrder) {
        locationName = MADE_TO_ORDER_LOCATION;
      } else {
        const inventory = cartItemInventories[item.product_id] || [];
        const storeInv = inventory.filter(inv => inv.location_type === 'store' && inv.qty > 0);
        const warehouseInv = inventory.filter(inv => inv.location_type === 'warehouse' && inv.qty > 0);
        if (storeInv.length > 0 && storeInv[0].location_name) {
          locationName = storeInv[0].location_name;
        } else if (warehouseInv.length > 0 && warehouseInv[0].location_name) {
          locationName = warehouseInv[0].location_name;
        } else {
          locationName = MADE_TO_ORDER_LOCATION;
        }
      }
      if (!locationGroups[locationName]) {
        locationGroups[locationName] = [];
      }
      locationGroups[locationName].push(item);
    });
    
    return Object.keys(locationGroups);
  };

  const availableProductTypes = useMemo(() => {
    if (selectedCategory === 'all') {
      return productTypes;
    }
    const selectedCategoryId = parseInt(selectedCategory, 10);
    return productTypes.filter(type => parseInt(type.category_id, 10) === selectedCategoryId);
  }, [productTypes, selectedCategory]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      return;
    }
    if (selectedProductType === 'all') {
      return;
    }
    const selectedCategoryId = parseInt(selectedCategory, 10);
    const selectedProductTypeId = parseInt(selectedProductType, 10);
    const existsInCategory = productTypes.some(
      type => parseInt(type.product_type_id, 10) === selectedProductTypeId && parseInt(type.category_id, 10) === selectedCategoryId
    );
    if (!existsInCategory) {
      setSelectedProductType('all');
    }
  }, [selectedCategory, selectedProductType, productTypes]);

  // Check if customer is logged in
  const checkLoginStatus = async () => {
    const customerId = sessionStorage.getItem('customer_id');
    const customerName = sessionStorage.getItem('customer_name');
    if (customerId && customerName) {
      setIsLoggedIn(true);
      
      // Fetch full customer profile to get address
      try {
        const profileResponse = await axios.get(BASE_URL + 'ecommerce_customer.php', {
          params: {
            json: JSON.stringify({ customer_id: parseInt(customerId) }),
            operation: 'GetCustomerProfile'
          }
        });
        
        if (profileResponse.data.success && profileResponse.data.customer) {
          setCustomer({
            id: customerId,
            name: customerName,
            address: profileResponse.data.customer.address || ''
          });
        } else {
          setCustomer({ id: customerId, name: customerName, address: '' });
        }
      } catch (error) {
        console.error('Error fetching customer profile:', error);
        setCustomer({ id: customerId, name: customerName, address: '' });
      }
      
      loadCart(customerId);
    }
  };

  // Fetch products, categories, and locations
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // First fetch products, categories, and locations
      const productsData = await fetchProducts();
      await Promise.all([
        fetchCategories(),
        fetchLocations(),
        fetchProductTypeParts(),
        fetchActiveDiscount()
      ]);
      
      // Stop loading here so products can be shown
      setLoading(false);
      
      // Then fetch inventories for all products in background (non-blocking)
      if (productsData && productsData.length > 0) {
        fetchAllProductInventoriesWithData(productsData).catch(err => {
          console.error('Error fetching inventories (non-critical):', err);
        });
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const url = BASE_URL + 'products.php';
      console.log('📦 Fetching products from:', url);
      
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify({}),
          operation: 'GetProduct'
        },
        timeout: 10000
      });
      
      console.log('✅ Products response:', response.data);
      
      if (Array.isArray(response.data)) {
        setProducts(response.data);

        // Derive unique product types from response
        const typeMap = new Map();
        response.data.forEach(product => {
          if (product.product_type_id && product.product_type_name) {
            if (!typeMap.has(product.product_type_id)) {
              typeMap.set(product.product_type_id, {
                product_type_id: product.product_type_id,
                product_type_name: product.product_type_name,
                category_id: product.category_id ? parseInt(product.category_id, 10) : null
              });
            }
          }
        });
        setProductTypes(Array.from(typeMap.values()));

        console.log(`✅ Loaded ${response.data.length} products`);
        return response.data; // Return products for chaining
      } else {
        setProductTypes([]);
      }
      return [];
    } catch (error) {
      console.error('❌ Error fetching products:', error.message);
      console.error('Error details:', error);
      return [];
    }
  };

  const fetchCategories = async () => {
    try {
      const url = BASE_URL + 'products.php';//dont change it i have no catgory api!!!
      console.log('📂 Fetching categories from:', url);
      
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify({}),
          operation: 'GetCategory'
        },
        timeout: 10000
      });
      
      console.log('✅ Categories response:', response.data);
      console.log('Is array?', Array.isArray(response.data));
      
      if (Array.isArray(response.data)) {
        setCategories(response.data);
        console.log(`✅ Loaded ${response.data.length} categories`);
      } else {
        console.warn('⚠️ Categories response is not an array:', typeof response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error.message);
      console.error('Error details:', error);
    }
  };

  const fetchActiveDiscount = async () => {
    try {
      const url = BASE_URL + 'discounts.php';
      console.log('💰 Fetching active discount from:', url);
      
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify([]),
          operation: 'GetCurrentDiscount'
        },
        timeout: 10000
      });
      
      console.log('✅ Discount response:', response.data);
      
      let discount = response.data;
      if (typeof discount === 'string' && discount !== 'null') {
        try {
          discount = JSON.parse(discount);
        } catch (e) {
          discount = null;
        }
      }
      
      if (discount && discount.is_active === 1) {
        // Check if discount is within date range
        const now = new Date();
        const startDate = discount.start_date ? new Date(discount.start_date) : null;
        const endDate = discount.end_date ? new Date(discount.end_date) : null;
        
        if ((!startDate || now >= startDate) && (!endDate || now <= endDate)) {
          setActiveDiscount(discount);
          console.log('✅ Active discount loaded:', discount);
        } else {
          setActiveDiscount(null);
          console.log('⚠️ Discount exists but is not within valid date range');
        }
      } else {
        setActiveDiscount(null);
        console.log('ℹ️ No active discount');
      }
    } catch (error) {
      console.error('❌ Error fetching discount:', error.message);
      setActiveDiscount(null);
    }
  };

  const fetchLocations = async () => {
    try {
      const url = BASE_URL + 'location.php';
      console.log('📍 Fetching locations from:', url);
      
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify({}),
          operation: 'GetLocation'
        },
        timeout: 10000
      });
      
      console.log('✅ Locations response:', response.data);
      console.log('Is array?', Array.isArray(response.data));
      
      if (Array.isArray(response.data)) {
        setLocations(response.data);
        console.log(`✅ Loaded ${response.data.length} locations`);
      } else {
        console.warn('⚠️ Locations response is not an array:', typeof response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching locations:', error.message);
      console.error('Error details:', error);
    }
  };

  // Helper function to check if a location is a warehouse
  const isWarehouse = (location) => {
    if (!location) return false;
    // Check by loc_type_id if available (2 = Warehouse)
    if (location.loc_type_id !== undefined && location.loc_type_id !== null) {
      return parseInt(location.loc_type_id) === 2;
    }
    // Fallback: check by name (case-insensitive)
    const name = location.location_name || '';
    return name.toLowerCase().includes('warehouse');
  };

  // Helper function to check if a location is a store (Main or Store)
  const isStore = (location) => {
    if (!location) return false;
    // Check by loc_type_id if available (1 = Main, 3 = Store)
    if (location.loc_type_id !== undefined && location.loc_type_id !== null) {
      const typeId = parseInt(location.loc_type_id);
      return typeId === 1 || typeId === 3;
    }
    // Fallback: check by name (not warehouse)
    const name = location.location_name || '';
    return !name.toLowerCase().includes('warehouse');
  };

  // Helper function to get store inventory from product inventory array
  const getStoreInventory = (inventory) => {
    if (!Array.isArray(inventory)) return [];
    return inventory.filter(inv => {
      // Try to match with locations array to get loc_type_id
      const location = locations.find(loc => 
        normalizeId(loc.location_id) === normalizeId(inv.location_id)
      );
      if (location) {
        return isStore(location);
      }
      // Fallback: check by name
      return isStore(inv);
    });
  };

  // Helper function to get warehouse inventory from product inventory array
  const getWarehouseInventory = (inventory) => {
    if (!Array.isArray(inventory)) return [];
    return inventory.filter(inv => {
      // Try to match with locations array to get loc_type_id
      const location = locations.find(loc => 
        normalizeId(loc.location_id) === normalizeId(inv.location_id)
      );
      if (location) {
        return isWarehouse(location);
      }
      // Fallback: check by name
      return isWarehouse(inv);
    });
  };

  // Helper function to check if product is available in any store
  const isAvailableInStores = (inventory) => {
    const storeInv = getStoreInventory(inventory);
    return storeInv.some(inv => inv.qty > 0);
  };

  // Helper function to check if product is available in warehouse
  const isAvailableInWarehouse = (inventory) => {
    const warehouseInv = getWarehouseInventory(inventory);
    return warehouseInv.some(inv => inv.qty > 0);
  };

  const fetchProductTypeParts = async () => {
    try {
      const url = BASE_URL + 'products.php';
      console.log('🧩 Fetching product type parts from:', url);

      const response = await axios.get(url, {
        params: {
          json: JSON.stringify({}),
          operation: 'GetProductTypeParts'
        },
        timeout: 10000
      });

      console.log('✅ Product type parts response:', response.data);

      if (Array.isArray(response.data)) {
        const map = {};
        response.data.forEach(type => {
          if (type && type.product_type_id) {
            map[type.product_type_id] = Array.isArray(type.parts) ? type.parts : [];
          }
        });
        setProductTypePartsMap(map);
      } else {
        console.warn('⚠️ Product type parts response is not an array:', typeof response.data);
        setProductTypePartsMap({});
      }
    } catch (error) {
      console.error('❌ Error fetching product type parts:', error.message);
      console.error('Error details:', error);
      setProductTypePartsMap({});
    }
  };

  // Fetch inventory for a specific product across all locations
  const fetchProductInventory = async (productId) => {
    setInventoryLoading(true);
    try {
      const url = BASE_URL + 'inventory.php';
      console.log('📊 Fetching inventory for product:', productId);
      
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify({ productId: productId }),
          operation: 'GetProductInventoryByLocation'
        },
        timeout: 10000
      });
      
      console.log('✅ Inventory response:', response.data);
      
      if (Array.isArray(response.data)) {
        setProductInventory(response.data);
        console.log(`✅ Loaded inventory for ${response.data.length} locations`);
      } else {
        console.warn('⚠️ Inventory response is not an array:', typeof response.data);
        setProductInventory([]);
      }
    } catch (error) {
      console.error('❌ Error fetching product inventory:', error.message);
      console.error('Error details:', error);
      setProductInventory([]);
    } finally {
      setInventoryLoading(false);
    }
  };

  // Fetch inventory for all products
  const fetchAllProductInventoriesWithData = async (productsData) => {
    if (!productsData || productsData.length === 0) {
      console.log('⚠️ No products to fetch inventory for');
      return;
    }
    
    setInventoriesLoading(true);
    const inventories = {};
    console.log(`📊 Fetching inventory for ${productsData.length} products...`);
    
    try {
      // Fetch inventory for all products in parallel (limited batch to avoid overwhelming server)
      const batchSize = 10;
      for (let i = 0; i < productsData.length; i += batchSize) {
        const batch = productsData.slice(i, i + batchSize);
        console.log(`  Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(productsData.length/batchSize)}: Processing products ${i+1}-${Math.min(i+batchSize, productsData.length)}`);
        
        const promises = batch.map(async (product) => {
          try {
            const url = BASE_URL + 'inventory.php';
            const response = await axios.get(url, {
              params: {
                json: JSON.stringify({ productId: product.product_id }),
                operation: 'GetProductInventoryByLocation'
              },
              timeout: 10000
            });
            
            if (Array.isArray(response.data)) {
              inventories[product.product_id] = response.data;
            }
          } catch (error) {
            console.error(`  ❌ Error fetching inventory for product ${product.product_id}:`, error.message);
            inventories[product.product_id] = [];
          }
        });
        
        await Promise.all(promises);
      }
      
      setProductInventories(inventories);
      console.log(`✅ Loaded inventory for ${Object.keys(inventories).length} products`);
    } catch (error) {
      console.error('❌ Error fetching all product inventories:', error);
    } finally {
      setInventoriesLoading(false);
    }
  };

  // Fetch inventory for all cart items
  const fetchCartItemsInventory = async () => {
    const inventories = {};
    
    for (const item of cart) {
      try {
        const url = BASE_URL + 'inventory.php';
        const response = await axios.get(url, {
          params: {
            json: JSON.stringify({ productId: item.product_id }),
            operation: 'GetProductInventoryByLocation'
          },
          timeout: 10000
        });
        
        if (Array.isArray(response.data)) {
          inventories[item.product_id] = response.data.filter(inv => inv.qty > 0);
        }
      } catch (error) {
        console.error(`❌ Error fetching inventory for product ${item.product_id}:`, error);
        inventories[item.product_id] = [];
      }
    }
    
    setCartItemInventories(inventories);
  };

  const normalizeId = (value) => {
    if (value === null || value === undefined) {
      return null;
    }
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  };

  // Filter and sort products
  const filterAndSortProducts = () => {
    const selectedCategoryId =
      selectedCategory === 'all' ? null : normalizeId(selectedCategory);
    const selectedProductTypeId =
      selectedProductType === 'all' ? null : normalizeId(selectedProductType);
    const selectedLocationId =
      selectedLocation === 'all' ? null : normalizeId(selectedLocation);
    
    // Debug logging for location filter
    if (selectedLocationId !== null) {
      console.log(`🏪 Filtering by location ID: ${selectedLocationId} (${selectedLocation})`);
      console.log(`📦 Total products: ${products.length}`);
      console.log(`📊 Inventories loaded for ${Object.keys(productInventories).length} products`);
    }

    let filtered = products.filter(product => {
      const productCategoryId = normalizeId(product.category_id);
      const productTypeId = normalizeId(product.product_type_id);

      const matchesSearch = 
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.color && product.color.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = 
        selectedCategoryId === null ||
        (productCategoryId !== null && productCategoryId === selectedCategoryId);
      
      const matchesPrice = 
        parseFloat(product.price) >= priceRange.min && 
        parseFloat(product.price) <= priceRange.max;

      const matchesProductType =
        selectedProductTypeId === null ||
        (productTypeId !== null && productTypeId === selectedProductTypeId);
      
      // Check location-based availability
      let matchesLocation = true;
      
      if (selectedLocationId !== null) {
        // If a specific location is selected, filter products that:
        // 1. Have inventory at that location, OR
        // 2. Have inventory in warehouse (can be shipped to any location)
        // Note: We only show products with actual inventory when a specific store is selected
        // Made-to-order items are only shown when "All Stores" is selected
        
        const inventory = productInventories[product.product_id] || [];
        const inventoryLoaded = productInventories.hasOwnProperty(product.product_id);
        
        if (!inventoryLoaded) {
          // Inventory not loaded yet - show product optimistically
          // Will be filtered once inventory loads
          matchesLocation = true;
        } else if (inventory.length === 0) {
          // No inventory data for this product - hide it when filtering by location
          // (Made-to-order items are only shown when "All Stores" is selected)
          matchesLocation = false;
        } else {
          // Debug: Log inventory structure for first product
          if (product.product_id === products[0]?.product_id) {
            console.log(`📦 Sample inventory for product ${product.product_id}:`, inventory);
            console.log(`📍 Available locations:`, locations.map(l => ({ id: l.location_id, name: l.location_name, type: l.loc_type_id })));
          }
          
          // Check if product has inventory at the selected location
          const hasInventoryAtLocation = inventory.some(inv => {
            if (!inv || inv.location_id === null || inv.location_id === undefined) {
              return false;
            }
            const invLocationId = normalizeId(inv.location_id);
            const selectedId = normalizeId(selectedLocationId);
            const quantity = parseInt(inv.qty, 10) || 0;
            const matches = invLocationId === selectedId && quantity > 0;
            
            return matches;
          });
          
          // Check if product is available in warehouse (can be shipped to any location)
          // Warehouse inventory should be available for any store location
          const availableInWarehouse = isAvailableInWarehouse(inventory);
          
          // Also check if inventory has any stock at all (fallback)
          const hasAnyStock = inventory.some(inv => {
            const quantity = parseInt(inv.qty, 10) || 0;
            return quantity > 0;
          });
          
          // Product matches if it has stock at the selected location OR in warehouse
          matchesLocation = hasInventoryAtLocation || availableInWarehouse;
          
          // Debug logging for first few products
          if (product.product_id === products[0]?.product_id) {
            console.log(`✅ Product ${product.product_id}: hasInventoryAtLocation=${hasInventoryAtLocation}, availableInWarehouse=${availableInWarehouse}, hasAnyStock=${hasAnyStock}, matchesLocation=${matchesLocation}`);
            console.log(`   Selected location ID: ${selectedLocationId}`);
            console.log(`   Inventory location IDs:`, inventory.map(inv => normalizeId(inv.location_id)));
          }
        }
      } else {
        // If "All Stores" is selected, show all products (including made-to-order)
        matchesLocation = true;
      }
      
      return matchesSearch && matchesCategory && matchesPrice && matchesLocation && matchesProductType;
    });
    
    // Debug: Log filter results
    if (selectedLocationId !== null) {
      console.log(`✅ Filter complete: ${filtered.length} products match location filter (out of ${products.length} total)`);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          // Sort by description (actual product name), not product_name (code)
          return a.description.localeCompare(b.description);
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'product-code': {
          const extractCodeNumber = (name) => {
            if (!name) return Number.MAX_SAFE_INTEGER;
            const match = name.match(/\d+/);
            return match ? parseInt(match[0], 10) : Number.MAX_SAFE_INTEGER;
          };
          const codeA = extractCodeNumber(a.product_name);
          const codeB = extractCodeNumber(b.product_name);
          return codeA - codeB;
        }
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  // Authentication functions
  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.get(BASE_URL + 'ecommerce_customer.php', {
        params: {
          json: JSON.stringify({
            email: authForm.email,
            password: authForm.password
          }),
          operation: 'CustomerLogin'
        }
      });

      if (response.data.success && response.data.customer) {
        const customerData = response.data.customer;
        sessionStorage.setItem('customer_id', customerData.ecommerce_customer_id);
        sessionStorage.setItem('customer_name', customerData.customer_name);
        sessionStorage.setItem('customer_email', customerData.email);
        
        setIsLoggedIn(true);
        setCustomer({
          id: customerData.ecommerce_customer_id,
          name: customerData.customer_name,
          address: customerData.address || ''
        });
        setShowAuthModal(false);
        setShowPassword(false);
        setShowConfirmPassword(false);
        
        // Merge guest cart with user cart
        mergeGuestCartWithUserCart(customerData.ecommerce_customer_id);
        
        AlertSucces('Welcome back!', 'success', true, 'OK');
      } else {
        showAlertError({
          icon: 'error',
          title: 'Login Failed',
          text: response.data.message || 'Invalid email or password',
          button: 'OK'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: 'Failed to login. Please try again.',
        button: 'OK'
      });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (authForm.password !== authForm.confirmPassword) {
      showAlertError({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match',
        button: 'OK'
      });
      return;
    }

    // Validate Philippine phone number format
    if (!/^09[0-9]{9}$/.test(authForm.phone)) {
      showAlertError({
        icon: 'error',
        title: 'Invalid Phone Number',
        text: 'Please enter a valid Philippine mobile number starting with 09 (e.g., 09123456789)',
        button: 'OK'
      });
      return;
    }

    try {
      const response = await axios.get(BASE_URL + 'ecommerce_customer.php', {
        params: {
          json: JSON.stringify({
            name: authForm.name,
            email: authForm.email,
            phone: authForm.phone,
            address: authForm.address,
            password: authForm.password
          }),
          operation: 'CustomerSignup'
        }
      });

      if (response.data.success) {
        AlertSucces('Account created successfully! Please login.', 'success', true, 'OK');
        setAuthMode('login');
        setShowPassword(false);
        setShowConfirmPassword(false);
        setAuthForm({
          email: authForm.email,
          password: '',
          confirmPassword: '',
          name: '',
          phone: '',
          address: ''
        });
      } else {
        showAlertError({
          icon: 'error',
          title: 'Signup Failed',
          text: response.data.message || 'Failed to create account',
          button: 'OK'
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create account. Please try again.',
        button: 'OK'
      });
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordEmail)) {
      showAlertError({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address',
        button: 'OK'
      });
      return;
    }

    try {
      setForgotPasswordLoading(true);
      const response = await axios.get(BASE_URL + 'ecommerce_customer.php', {
        params: {
          json: JSON.stringify({
            email: forgotPasswordEmail
          }),
          operation: 'ForgotPassword'
        }
      });

      if (response.data.success) {
        AlertSucces(
          'Verification code has been sent to your email. Please check your inbox.',
          'success',
          true,
          'OK'
        );
        setForgotPasswordStep(2);
        setResendCooldown(30); // Start 30-second cooldown
      } else {
        showAlertError({
          icon: 'error',
          title: 'Error',
          text: response.data.message || 'Failed to send verification code. Please try again.',
          button: 'OK'
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: 'Failed to send verification code. Please try again.',
        button: 'OK'
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return; // Prevent resend during cooldown

    try {
      setForgotPasswordLoading(true);
      const response = await axios.get(BASE_URL + 'ecommerce_customer.php', {
        params: {
          json: JSON.stringify({
            email: forgotPasswordEmail
          }),
          operation: 'ForgotPassword'
        }
      });

      if (response.data.success) {
        AlertSucces('Verification code has been resent to your email.', 'success', true, 'OK');
        setResendCooldown(30); // Start 30-second cooldown
        setResetCode(''); // Clear entered code
      } else {
        showAlertError({
          icon: 'error',
          title: 'Error',
          text: response.data.message || 'Failed to resend code. Please try again.',
          button: 'OK'
        });
      }
    } catch (error) {
      console.error('Resend code error:', error);
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: 'Failed to resend code. Please try again.',
        button: 'OK'
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!resetCode || resetCode.length !== 6) {
      showAlertError({
        icon: 'error',
        title: 'Invalid Code',
        text: 'Please enter a valid 6-digit verification code',
        button: 'OK'
      });
      return;
    }

    try {
      setForgotPasswordLoading(true);
      const response = await axios.get(BASE_URL + 'ecommerce_customer.php', {
        params: {
          json: JSON.stringify({
            email: forgotPasswordEmail,
            code: resetCode
          }),
          operation: 'VerifyResetCode'
        }
      });

      if (response.data.success) {
        setForgotPasswordStep(3);
      } else {
        showAlertError({
          icon: 'error',
          title: 'Invalid Code',
          text: response.data.message || 'Invalid or expired verification code',
          button: 'OK'
        });
      }
    } catch (error) {
      console.error('Verify code error:', error);
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: 'Failed to verify code. Please try again.',
        button: 'OK'
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmNewPassword) {
      showAlertError({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match',
        button: 'OK'
      });
      return;
    }

    if (newPassword.length < 6) {
      showAlertError({
        icon: 'error',
        title: 'Invalid Password',
        text: 'Password must be at least 6 characters long',
        button: 'OK'
      });
      return;
    }

    try {
      setForgotPasswordLoading(true);
      const response = await axios.get(BASE_URL + 'ecommerce_customer.php', {
        params: {
          json: JSON.stringify({
            email: forgotPasswordEmail,
            code: resetCode,
            new_password: newPassword
          }),
          operation: 'ResetPassword'
        }
      });

      if (response.data.success) {
        AlertSucces('Password reset successfully! Please login with your new password.', 'success', true, 'OK');
        setShowForgotPassword(false);
        setForgotPasswordStep(1);
        setResetCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        setForgotPasswordEmail('');
        setResendCooldown(0);
        setAuthMode('login');
      } else {
        showAlertError({
          icon: 'error',
          title: 'Error',
          text: response.data.message || 'Failed to reset password. Please try again.',
          button: 'OK'
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: 'Failed to reset password. Please try again.',
        button: 'OK'
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleLogout = () => {
    sessionStorage.removeItem('customer_id');
    sessionStorage.removeItem('customer_name');
    sessionStorage.removeItem('customer_email');
    setIsLoggedIn(false);
    setCustomer(null);
    setCart([]);
    AlertSucces('Logged out successfully', 'success', true, 'OK');
  };

  // Profile functions
  const fetchCustomerProfile = async (customerId) => {
    try {
      setProfileLoading(true);
      const response = await axios.get(BASE_URL + 'ecommerce_customer.php', {
        params: {
          json: JSON.stringify({ customer_id: parseInt(customerId) }),
          operation: 'GetCustomerProfile'
        }
      });

      if (response.data.success && response.data.customer) {
        const customerData = response.data.customer;
        setProfileForm({
          name: customerData.customer_name || '',
          email: customerData.email || '',
          phone: customerData.phone || '',
          address: customerData.address || '',
          latitude: customerData.latitude || null,
          longitude: customerData.longitude || null
        });
        // Set map center if coordinates exist
        if (customerData.latitude && customerData.longitude) {
          setMapCenter({ lat: parseFloat(customerData.latitude), lng: parseFloat(customerData.longitude) });
          setSelectedMapLocation({ lat: parseFloat(customerData.latitude), lng: parseFloat(customerData.longitude) });
        }
        setShowProfileModal(true);
      } else {
        showAlertError({
          icon: 'error',
          title: 'Error',
          text: response.data.message || 'Failed to load profile',
          button: 'OK'
        });
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load profile. Please try again.',
        button: 'OK'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleEditProfile = () => {
    if (customer?.id) {
      fetchCustomerProfile(customer.id);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!customer?.id) {
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: 'Customer ID not found',
        button: 'OK'
      });
      return;
    }

    // Validate email format
    if (!profileForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      showAlertError({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address',
        button: 'OK'
      });
      return;
    }

    // Validate Philippine phone number format if phone is provided
    if (profileForm.phone && !/^09[0-9]{9}$/.test(profileForm.phone)) {
      showAlertError({
        icon: 'error',
        title: 'Invalid Phone Number',
        text: 'Please enter a valid Philippine mobile number starting with 09 (e.g., 09123456789)',
        button: 'OK'
      });
      return;
    }

    try {
      setProfileLoading(true);
      const response = await axios.get(BASE_URL + 'ecommerce_customer.php', {
        params: {
          json: JSON.stringify({
            customer_id: parseInt(customer.id),
            name: profileForm.name,
            email: profileForm.email,
            phone: profileForm.phone,
            address: profileForm.address,
            latitude: profileForm.latitude,
            longitude: profileForm.longitude
          }),
          operation: 'UpdateCustomerProfile'
        }
      });

      if (response.data.success) {
        // Update session storage
        sessionStorage.setItem('customer_name', profileForm.name);
        sessionStorage.setItem('customer_email', profileForm.email);
        
        // Update customer state
        setCustomer({
          id: customer.id,
          name: profileForm.name
        });
        
        setShowProfileModal(false);
        AlertSucces('Profile updated successfully!', 'success', true, 'OK');
      } else {
        showAlertError({
          icon: 'error',
          title: 'Update Failed',
          text: response.data.message || 'Failed to update profile',
          button: 'OK'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update profile. Please try again.',
        button: 'OK'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Cart functions - Support guest and logged-in users
  const loadCart = (customerId) => {
    const savedCart = localStorage.getItem(`cart_${customerId}`);
    if (savedCart) {
      const cartItems = JSON.parse(savedCart);
      setCart(cartItems);
      // Select all items by default when cart loads
      setSelectedCartItems(new Set(cartItems.map(item => item.product_id)));
    }
  };

  const loadGuestCart = () => {
    const savedCart = localStorage.getItem('guest_cart');
    if (savedCart) {
      const cartItems = JSON.parse(savedCart);
      setCart(cartItems);
      // Select all items by default when cart loads
      setSelectedCartItems(new Set(cartItems.map(item => item.product_id)));
      console.log('🛒 Loaded guest cart:', cartItems.length, 'items');
    }
  };

  const saveCart = (customerId, cartItems) => {
    if (customerId) {
      localStorage.setItem(`cart_${customerId}`, JSON.stringify(cartItems));
    } else {
      // Guest cart
      localStorage.setItem('guest_cart', JSON.stringify(cartItems));
    }
  };

  const mergeGuestCartWithUserCart = (customerId) => {
    // Get guest cart
    const guestCart = localStorage.getItem('guest_cart');
    if (guestCart) {
      const guestItems = JSON.parse(guestCart);
      
      // Get user's saved cart
      const userCart = localStorage.getItem(`cart_${customerId}`);
      let userItems = userCart ? JSON.parse(userCart) : [];
      
      // Merge carts - add guest items to user cart
      guestItems.forEach(guestItem => {
        const existingItem = userItems.find(item => item.product_id === guestItem.product_id);
        if (existingItem) {
          // Increase quantity if item already exists
          existingItem.quantity += guestItem.quantity;
        } else {
          // Add new item
          userItems.push(guestItem);
        }
      });
      
      // Save merged cart
      localStorage.setItem(`cart_${customerId}`, JSON.stringify(userItems));
      // Clear guest cart
      localStorage.removeItem('guest_cart');
      // Update state
      setCart(userItems);
      
      console.log('🔄 Merged guest cart with user cart:', userItems.length, 'items');
    }
  };

  // Helper function to get stock quantity for a product at a specific location
  const getStockQuantityAtLocation = (productId, locationId) => {
    if (!productId || !locationId) return 0;
    
    const inventory = productInventories[productId] || [];
    if (!Array.isArray(inventory) || inventory.length === 0) return 0;
    
    // Find inventory entry for this location
    const locationInv = inventory.find(inv => {
      const invLocationId = normalizeId(inv.location_id);
      const targetLocationId = normalizeId(locationId);
      return invLocationId === targetLocationId;
    });
    
    return locationInv ? parseInt(locationInv.qty || 0) : 0;
  };

  // Get available locations for a product (stores with stock + warehouse)
  const getAvailableLocationsForProduct = (product) => {
    const inventory = productInventories[product.product_id] || [];
    const inventoryLoaded = productInventories.hasOwnProperty(product.product_id);
    
    if (!inventoryLoaded || inventory.length === 0) {
      return []; // No inventory data or made-to-order
    }
    
    const availableLocations = [];
    const seenLocationIds = new Set(); // Track seen location IDs to avoid duplicates
    
    // Get store inventory (locations with stock)
    const storeInv = getStoreInventory(inventory);
    storeInv.forEach(inv => {
      if (inv.qty > 0 && inv.location_id) {
        const locationId = normalizeId(inv.location_id);
        // Skip if we've already added this location
        if (!seenLocationIds.has(locationId)) {
          const location = locations.find(loc => normalizeId(loc.location_id) === locationId);
          if (location) {
            seenLocationIds.add(locationId);
            availableLocations.push({
              location_id: location.location_id,
              location_name: location.location_name,
              quantity: inv.qty,
              type: 'store',
              address: location.address || ''
            });
          }
        }
      }
    });
    
    // Get warehouse inventory (can ship to any location)
    const warehouseInv = getWarehouseInventory(inventory);
    if (warehouseInv.some(inv => inv.qty > 0)) {
      warehouseInv.forEach(inv => {
        if (inv.qty > 0 && inv.location_id) {
          const locationId = normalizeId(inv.location_id);
          // Skip if we've already added this location (shouldn't happen, but safety check)
          if (!seenLocationIds.has(locationId)) {
            const location = locations.find(loc => normalizeId(loc.location_id) === locationId);
            if (location) {
              seenLocationIds.add(locationId);
              availableLocations.push({
                location_id: location.location_id,
                location_name: location.location_name,
                quantity: inv.qty,
                type: 'warehouse',
                address: location.address || ''
              });
            }
          }
        }
      });
    }
    
    return availableLocations;
  };

  const addToCart = (product, preferredLocationId = null, preferredLocationName = null) => {
    // Allow adding to cart without login
    // Check if product is out of stock - mark as made to order
    const inventory = productInventories[product.product_id] || [];
    const availableInStores = isAvailableInStores(inventory);
    const availableInWarehouse = isAvailableInWarehouse(inventory);
    const hasAnyStock = availableInStores || availableInWarehouse;
    const inventoryLoaded = productInventories.hasOwnProperty(product.product_id);
    
    // Mark as made to order if out of stock (but not if it's already a custom product)
    const isMadeToOrder = inventoryLoaded && !hasAnyStock && !product.isCustom;
    
    // Get available locations for this product
    const availableLocations = getAvailableLocationsForProduct(product);
    
    // For made-to-order items (custom or out of stock), assign to "Agora Main Showroom"
    const MADE_TO_ORDER_LOCATION_NAME = 'Agora Main Showroom';
    let selectedLocationId = preferredLocationId;
    let selectedLocationName = preferredLocationName;
    
    // If location ID is provided but name is not, look it up
    if (selectedLocationId && !selectedLocationName) {
      // Try both string and number comparison for location_id
      const foundLocation = locations.find(loc => 
        loc.location_id == selectedLocationId || 
        String(loc.location_id) === String(selectedLocationId)
      );
      if (foundLocation) {
        selectedLocationName = foundLocation.location_name;
      } else {
        // Try to find in availableLocations
        const foundInAvailable = availableLocations.find(loc => 
          loc.location_id == selectedLocationId || 
          String(loc.location_id) === String(selectedLocationId)
        );
        if (foundInAvailable) {
          selectedLocationName = foundInAvailable.location_name;
        }
      }
    }
    
    // Debug logging
    if (preferredLocationId) {
      console.log('📍 addToCart - Location selected:', {
        preferredLocationId,
        preferredLocationName,
        selectedLocationId,
        selectedLocationName,
        productId: product.product_id,
        productName: product.product_name || product.description,
        locationsCount: locations.length,
        availableLocationsCount: availableLocations.length
      });
    }
    
    if (isMadeToOrder || product.isCustom) {
      // Find "Agora Main Showroom" in locations
      const agoraLocation = locations.find(loc => 
        loc.location_name && loc.location_name.toLowerCase().includes('agora') &&
        loc.location_name.toLowerCase().includes('main')
      );
      
      if (agoraLocation) {
        selectedLocationId = agoraLocation.location_id;
        selectedLocationName = agoraLocation.location_name;
      } else {
        // Fallback: use the location name string
        selectedLocationName = MADE_TO_ORDER_LOCATION_NAME;
        // Try to find any location with "Agora" in the name
        const anyAgoraLocation = locations.find(loc => 
          loc.location_name && loc.location_name.toLowerCase().includes('agora')
        );
        if (anyAgoraLocation) {
          selectedLocationId = anyAgoraLocation.location_id;
          selectedLocationName = anyAgoraLocation.location_name;
        }
      }
    } else {
      // If product is available at multiple locations and no preferred location is set, show location selection modal
      if (availableLocations.length > 1 && !preferredLocationId) {
        setProductForLocation(product);
        setAvailableLocationsForProduct(availableLocations);
        setShowLocationModal(true);
        return; // Don't add to cart yet, wait for location selection
      }
      
      // If only one location or warehouse, auto-select it
      if (!selectedLocationId && availableLocations.length === 1) {
        selectedLocationId = availableLocations[0].location_id;
        selectedLocationName = availableLocations[0].location_name;
      } else if (!selectedLocationId && availableLocations.length > 0) {
        // If multiple locations but preferredLocationId not provided, use the first one (warehouse preferred)
        const warehouse = availableLocations.find(loc => loc.type === 'warehouse');
        if (warehouse) {
          selectedLocationId = warehouse.location_id;
          selectedLocationName = warehouse.location_name;
        } else {
          selectedLocationId = availableLocations[0].location_id;
          selectedLocationName = availableLocations[0].location_name;
        }
      }
    }
    
    // For regular products (not custom), check if same product_id exists with same location
    const existingItem = cart.find(item => 
      item.product_id === product.product_id && 
      !item.isCustom && 
      !product.isCustom &&
      (item.preferred_location_id === selectedLocationId || (!item.preferred_location_id && !selectedLocationId))
    );
    let newCart;
    
    if (existingItem && !product.isCustom) {
      // Check inventory limit for in-stock items (not made-to-order)
      const currentQuantity = existingItem.quantity;
      const isMadeToOrderItem = isMadeToOrder || existingItem.isMadeToOrder;
      
      if (!isMadeToOrderItem && selectedLocationId) {
        const availableStock = getStockQuantityAtLocation(product.product_id, selectedLocationId);
        const newQuantity = currentQuantity + 1;
        
        if (newQuantity > availableStock) {
          showAlertError({
            icon: "warning",
            title: "Stock Limit Reached",
            text: `You can only add up to ${availableStock} unit(s) of this product from ${selectedLocationName || 'this location'}. You currently have ${currentQuantity} in your cart.`,
            button: 'OK'
          });
          return; // Don't add more
        }
      }
      
      newCart = cart.map(item =>
        item.product_id === product.product_id && 
        !item.isCustom &&
        (item.preferred_location_id === selectedLocationId || (!item.preferred_location_id && !selectedLocationId))
          ? { 
              ...item, 
              quantity: item.quantity + 1, 
              isMadeToOrder: isMadeToOrder || item.isMadeToOrder,
              preferred_location_id: selectedLocationId || item.preferred_location_id,
              preferred_location_name: selectedLocationName || item.preferred_location_name
            }
          : item
      );
    } else {
      // Check inventory limit for new in-stock items (not made-to-order)
      const isMadeToOrderItem = isMadeToOrder || product.isCustom || false;
      
      if (!isMadeToOrderItem && selectedLocationId) {
        const availableStock = getStockQuantityAtLocation(product.product_id, selectedLocationId);
        if (availableStock <= 0) {
          showAlertError({
            icon: "warning",
            title: "Out of Stock",
            text: `This product is currently out of stock at ${selectedLocationName || 'this location'}.`,
            button: 'OK'
          });
          return; // Don't add to cart
        }
      }
      
      const newCartItem = { 
        ...product, 
        quantity: 1,
        isMadeToOrder: isMadeToOrderItem, // Custom items are always made to order
        preferred_location_id: selectedLocationId || null,
        preferred_location_name: selectedLocationName || null
      };
      
      // Debug logging for new cart item
      console.log('🛒 Creating new cart item:', {
        productId: newCartItem.product_id,
        productName: newCartItem.product_name || newCartItem.description,
        preferred_location_id: newCartItem.preferred_location_id,
        preferred_location_name: newCartItem.preferred_location_name
      });
      
      newCart = [...cart, newCartItem];
    }
    
    setCart(newCart);
    
    // Automatically select newly added item(s)
    const newSelected = new Set(selectedCartItems);
    if (existingItem && !product.isCustom) {
      // Item already exists, keep selection as is
    } else {
      // New item added, select it
      const addedItem = newCart.find(item => 
        item.product_id === product.product_id && 
        (!existingItem || product.isCustom) &&
        (item.preferred_location_id === selectedLocationId || (!item.preferred_location_id && !selectedLocationId))
      );
      if (addedItem) {
        newSelected.add(addedItem.product_id);
      }
    }
    setSelectedCartItems(newSelected);
    
    // Save to appropriate storage
    if (isLoggedIn && customer) {
      saveCart(customer.id, newCart);
    } else {
      saveCart(null, newCart); // Guest cart
    }
    
    // Show appropriate message
    if (selectedLocationName) {
      AlertSucces(
        `Product added to cart from ${selectedLocationName}!`,
        "success",
        true,
        'OK'
      );
    } else if (isMadeToOrder) {
      AlertSucces(
        "Added to cart (Made to Order)! This item is out of stock and will be made to order for you. ⏱️ Please note: Made-to-order items typically take 7-14 days to be finished and delivered.",
        "success",
        false,
        'OK'
      );
    } else if (product.isCustom) {
      AlertSucces(
        "Custom order added to cart! Your customized item has been added and will be made to order. ⏱️ Please note: Made-to-order items typically take 7-14 days to be finished and delivered.",
        "success",
        false,
        'OK'
      );
    } else {
      AlertSucces(
        "Added to cart!",
        "success",
        false,
        'OK'
      );
    }
  };
  
  // Handle location selection from modal
  const handleLocationSelected = (locationId, locationName) => {
    if (productForLocation) {
      // Check if this is a cart item update
      if (productForLocation._isCartUpdate) {
        handleCartItemLocationUpdate(locationId, locationName);
      } else {
        // New product being added to cart - pass both location ID and name
        addToCart(productForLocation, locationId, locationName);
        setShowLocationModal(false);
        setProductForLocation(null);
        setAvailableLocationsForProduct([]);
      }
    }
  };
  
  // Update preferred location for a cart item
  const updateCartItemLocation = (productId) => {
    const item = cart.find(i => i.product_id === productId);
    if (!item) return;
    
    const availableLocations = getAvailableLocationsForProduct(item);
    
    if (availableLocations.length > 0) {
      // Store the productId so we know which cart item to update
      setProductForLocation({ ...item, _isCartUpdate: true, _productId: productId });
      setAvailableLocationsForProduct(availableLocations);
      setShowLocationModal(true);
    }
  };
  
  // Handle location selection for cart item update
  const handleCartItemLocationUpdate = (locationId, locationName) => {
    if (productForLocation && productForLocation._isCartUpdate) {
      const productId = productForLocation._productId;
      const newCart = cart.map(item => 
        item.product_id === productId
          ? { ...item, preferred_location_id: locationId, preferred_location_name: locationName }
          : item
      );
      setCart(newCart);
      
      // Save cart
      if (isLoggedIn && customer) {
        saveCart(customer.id, newCart);
      } else {
        saveCart(null, newCart); // Guest cart
      }
      
      setShowLocationModal(false);
      setProductForLocation(null);
      setAvailableLocationsForProduct([]);
      
      AlertSucces('Preferred location updated!', 'success', true, 'OK');
    }
  };

  // Customization functions
  const openCustomizationModal = (product) => {
    const partsForType = productTypePartsMap[product.product_type_id] || [];
    setCurrentCustomizableParts(partsForType);
    setSelectedProduct(product);
    setCustomization({
      product_name: product.product_name,
      description: product.description,
      size: '',
      cover: '',
      sofaArm: '',
      color: '',
      colorMix: false,
      primaryColor: '',
      secondaryColor: '',
      primaryCustomColor: '',
      secondaryCustomColor: '',
      button: '',
      otherModifications: '',
      quantity: 1,
      isCustom: true
    });
    setShowCustomizationModal(true);
  };

  const closeCustomizationModal = () => {
    setShowCustomizationModal(false);
    setSelectedProduct(null);
    setEditingCartItem(null);
    setCurrentCustomizableParts([]);
    setCustomization({
      product_name: '',
      description: '',
      size: '',
      cover: '',
      sofaArm: '',
      color: '',
      colorMix: false,
      primaryColor: '',
      secondaryColor: '',
      primaryCustomColor: '',
      secondaryCustomColor: '',
      button: '',
      otherModifications: '',
      quantity: 1,
      isCustom: false
    });
  };

  const isPartEnabled = (partName) => {
    return currentCustomizableParts.some(
      (part) => (part.parts_name || '').toLowerCase() === partName.toLowerCase()
    );
  };

  const getPartModifications = (partName) => {
    const match = currentCustomizableParts.find(
      (part) => (part.parts_name || '').toLowerCase() === partName.toLowerCase()
    );
    return match && Array.isArray(match.modifications) ? match.modifications : [];
  };

  const addCustomizedToCart = () => {
    // Build modifications string from selected options
    let modificationsArray = [];
    
    if (isPartEnabled('Size') && customization.size) {
      modificationsArray.push(`Size: ${customization.size}`);
    }
    if (isPartEnabled('Cover') && customization.cover) {
      modificationsArray.push(`Cover: ${customization.cover}`);
    }
    if (isPartEnabled('Sofa Arm') && customization.sofaArm) {
      modificationsArray.push(`Sofa Arm: ${customization.sofaArm}`);
    }
    if (isPartEnabled('Buttons') && customization.button) {
      modificationsArray.push(`Buttons: ${customization.button}`);
    }
    if (isPartEnabled('Color')) {
      if (customization.colorMix) {
        const primaryBlend =
          (customization.primaryCustomColor && customization.primaryCustomColor.trim()) ||
          customization.primaryColor;
        const secondaryBlend =
          (customization.secondaryCustomColor && customization.secondaryCustomColor.trim()) ||
          customization.secondaryColor;

        if (primaryBlend && secondaryBlend) {
          modificationsArray.push(`Color: Mix (${primaryBlend} + ${secondaryBlend})`);
        }
      } else if (customization.color) {
        modificationsArray.push(`Color: ${customization.color}`);
      }
    }
    if (customization.otherModifications.trim()) {
      modificationsArray.push(`Other: ${customization.otherModifications}`);
    }

    // Validate that at least one modification is selected
    if (modificationsArray.length === 0) {
      showAlertError({
        icon: "error",
        title: "Customization Required",
        text: 'Please select at least one customization option or provide other modifications',
        button: 'OK'
      });
      return;
    }

    const customProduct = {
      ...selectedProduct,
      product_id: `custom_${Date.now()}`,
      product_name: customization.product_name,
      description: `${customization.description} (Customized - Made to Order)`,
      modifications: modificationsArray.join(', '),
      price: parseFloat(selectedProduct.price),
      quantity: customization.quantity,
      isCustom: true,
      isMadeToOrder: true // Customized items are always made to order
    };

    const newCart = [...cart, customProduct];
    setCart(newCart);
    
    // Automatically select newly added custom item
    const newSelected = new Set(selectedCartItems);
    newSelected.add(customProduct.product_id);
    setSelectedCartItems(newSelected);
    
    // Save to appropriate storage
    if (isLoggedIn && customer) {
      saveCart(customer.id, newCart);
    } else {
      saveCart(null, newCart); // Guest cart
    }
    
    AlertSucces(
      "Custom order added to cart! Your customized item has been added and will be made to order.",
      "success",
      false,
      'OK'
    );

    closeCustomizationModal();
  };

  const sizeOptions = useMemo(() => getPartModifications('Size'), [currentCustomizableParts]);
  const coverOptions = useMemo(() => getPartModifications('Cover'), [currentCustomizableParts]);
  const sofaArmOptions = useMemo(() => getPartModifications('Sofa Arm'), [currentCustomizableParts]);
  const buttonOptions = useMemo(() => {
    const mods = getPartModifications('Buttons');
    if (mods.length > 0) {
      return mods;
    }
    return [
      { pm_id: 'with_button', parts_modifications_name: 'With Button', pm_descriptions: '' },
      { pm_id: 'without_button', parts_modifications_name: 'Without Button', pm_descriptions: '' }
    ];
  }, [currentCustomizableParts]);
  const sizePartEnabled = isPartEnabled('Size');
  const coverPartEnabled = isPartEnabled('Cover');
  const sofaArmPartEnabled = isPartEnabled('Sofa Arm');
  const buttonsPartEnabled = isPartEnabled('Buttons');
  const colorPartEnabled = isPartEnabled('Color');

  const removeFromCart = (productId, locationId = null) => {
    // If locationId is provided, only remove items with matching product_id AND location_id
    // Otherwise, remove all items with that product_id (backward compatibility)
    const newCart = cart.filter(item => {
      if (locationId !== null) {
        // Remove only if both product_id and location_id match
        return !(item.product_id === productId && 
                 (item.preferred_location_id == locationId || 
                  String(item.preferred_location_id) === String(locationId)));
      } else {
        // Backward compatibility: remove all items with this product_id
        return item.product_id !== productId;
      }
    });
    setCart(newCart);
    
    // Remove from selected items only if this specific item was selected
    // (We can't easily check which specific item was selected, so we'll keep it simple)
    // If all items of this product are removed, remove from selection
    const hasRemainingItems = newCart.some(item => item.product_id === productId);
    if (!hasRemainingItems) {
      const newSelected = new Set(selectedCartItems);
      newSelected.delete(productId);
      setSelectedCartItems(newSelected);
    }
    
    // Save to appropriate storage
    if (isLoggedIn && customer) {
      saveCart(customer.id, newCart);
    } else {
      saveCart(null, newCart); // Guest cart
    }
  };

  const updateCartQuantity = (productId, quantity, locationId = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, locationId);
      return;
    }
    
    // Find the cart item to update
    const itemToUpdate = cart.find(item => {
      if (locationId !== null) {
        return item.product_id === productId && 
               (item.preferred_location_id == locationId || 
                String(item.preferred_location_id) === String(locationId));
      } else {
        return item.product_id === productId;
      }
    });
    
    // Check inventory limit for in-stock items (not made-to-order)
    if (itemToUpdate && !itemToUpdate.isMadeToOrder && !itemToUpdate.isCustom && locationId) {
      const availableStock = getStockQuantityAtLocation(productId, locationId);
      if (quantity > availableStock) {
        showAlertError({
          icon: "warning",
          title: "Stock Limit Reached",
          text: `You can only add up to ${availableStock} unit(s) of this product from ${itemToUpdate.preferred_location_name || 'this location'}.`,
          button: 'OK'
        });
        // Cap the quantity at available stock
        quantity = availableStock;
      }
    }
    
    // If locationId is provided, only update items with matching product_id AND location_id
    // Otherwise, update all items with that product_id (backward compatibility)
    const newCart = cart.map(item => {
      if (locationId !== null) {
        // Update only if both product_id and location_id match
        if (item.product_id === productId && 
            (item.preferred_location_id == locationId || 
             String(item.preferred_location_id) === String(locationId))) {
          return { ...item, quantity };
        }
        return item;
      } else {
        // Backward compatibility: update first item with this product_id
        if (item.product_id === productId) {
          return { ...item, quantity };
        }
        return item;
      }
    });
    
    setCart(newCart);
    
    // Save to appropriate storage
    if (isLoggedIn && customer) {
      saveCart(customer.id, newCart);
    } else {
      saveCart(null, newCart); // Guest cart
    }
  };

  // Calculate discounted price for a single product
  // Always show discount on product cards when active discount exists
  const calculateDiscountedPrice = (originalPrice) => {
    if (!activeDiscount || !originalPrice) {
      return { originalPrice, discountedPrice: originalPrice, discountAmount: 0, qualifies: false };
    }

    const price = parseFloat(originalPrice);
    const minPurchase = parseFloat(activeDiscount.min_purchase_amount || 0);

    // Check if product price meets minimum purchase requirement (0 means no minimum)
    const qualifies = minPurchase === 0 || price >= minPurchase;
    
    let discountAmount = 0;
    let discountedPrice = price;

    if (qualifies) {
      // Calculate discount if product qualifies
      if (activeDiscount.discount_type === 'percentage') {
        discountAmount = (price * parseFloat(activeDiscount.discount_value)) / 100;
        // Apply max discount cap if set
        if (activeDiscount.max_discount_amount) {
          discountAmount = Math.min(discountAmount, parseFloat(activeDiscount.max_discount_amount));
        }
      } else {
        // Fixed amount discount
        discountAmount = parseFloat(activeDiscount.discount_value);
      }
      discountedPrice = Math.max(0, price - discountAmount);
    }

    return {
      originalPrice: price,
      discountedPrice: discountedPrice,
      discountAmount: discountAmount,
      qualifies: qualifies
    };
  };

  // Calculate discounted price for cart total
  const calculateCartDiscount = (cartTotal) => {
    if (!activeDiscount || !cartTotal || cartTotal <= 0) {
      return { cartTotal, discountAmount: 0, finalTotal: cartTotal };
    }

    const total = parseFloat(cartTotal);
    const minPurchase = parseFloat(activeDiscount.min_purchase_amount || 0);

    // Check if meets minimum purchase requirement
    if (total < minPurchase) {
      return { cartTotal: total, discountAmount: 0, finalTotal: total };
    }

    let discountAmount = 0;

    if (activeDiscount.discount_type === 'percentage') {
      discountAmount = (total * parseFloat(activeDiscount.discount_value)) / 100;
      // Apply max discount cap if set
      if (activeDiscount.max_discount_amount) {
        discountAmount = Math.min(discountAmount, parseFloat(activeDiscount.max_discount_amount));
      }
    } else {
      // Fixed amount discount
      discountAmount = parseFloat(activeDiscount.discount_value);
    }

    const finalTotal = Math.max(0, total - discountAmount);

    return {
      cartTotal: total,
      discountAmount: discountAmount,
      finalTotal: finalTotal
    };
  };

  const getCartTotal = () => {
    const subtotal = cart
      .filter(item => selectedCartItems.has(item.product_id))
      .reduce((total, item) => {
        // Use discounted price if available, otherwise use original price
        const priceInfo = calculateDiscountedPrice(item.price);
        return total + (priceInfo.discountedPrice * item.quantity);
      }, 0);
    
    // Apply cart-level discount if applicable
    const discountInfo = calculateCartDiscount(subtotal);
    return discountInfo.finalTotal;
  };

  const getCartSubtotal = () => {
    return cart
      .filter(item => selectedCartItems.has(item.product_id))
      .reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const getCartDiscountAmount = () => {
    const subtotal = getCartSubtotal();
    const discountInfo = calculateCartDiscount(subtotal);
    return discountInfo.discountAmount;
  };

  // Cart item selection functions
  const toggleCartItemSelection = (productId) => {
    const newSelected = new Set(selectedCartItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedCartItems(newSelected);
  };

  const selectAllCartItems = () => {
    setSelectedCartItems(new Set(cart.map(item => item.product_id)));
  };

  const deselectAllCartItems = () => {
    setSelectedCartItems(new Set());
  };

  // Select/deselect all items in a specific location
  const selectLocationItems = (locationItems) => {
    const newSelected = new Set(selectedCartItems);
    locationItems.forEach(item => {
      newSelected.add(item.product_id);
    });
    setSelectedCartItems(newSelected);
  };

  const deselectLocationItems = (locationItems) => {
    const newSelected = new Set(selectedCartItems);
    locationItems.forEach(item => {
      newSelected.delete(item.product_id);
    });
    setSelectedCartItems(newSelected);
  };

  // Check if all items in a location are selected
  const areAllLocationItemsSelected = (locationItems) => {
    return locationItems.length > 0 && locationItems.every(item => selectedCartItems.has(item.product_id));
  };

  const getSelectedItemsCount = () => {
    return selectedCartItems.size;
  };

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

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      showAlertError({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login or create an account to submit an order request',
        button: 'OK'
      });
      setShowCart(false);
      setShowAuthModal(true);
      setAuthMode('login');
      return;
    }

    // Always require address entry - show modal even if customer has saved address
    if (!checkoutAddress || checkoutAddress.trim() === '') {
      // Get customer's saved address to pre-fill the modal
      const customerId = sessionStorage.getItem('customer_id');
      if (customerId) {
        try {
          const profileResponse = await axios.get(BASE_URL + 'ecommerce_customer.php', {
            params: {
              json: JSON.stringify({ customer_id: parseInt(customerId) }),
              operation: 'GetCustomerProfile'
            }
          });
          
          if (profileResponse.data.success && profileResponse.data.customer?.address) {
            // Pre-fill with saved address but still show modal
            const savedAddress = profileResponse.data.customer.address;
            setCheckoutAddress(savedAddress);
            
            // Try to parse saved address into fields (basic parsing)
            // This is a simple parser - can be improved
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
      }
      
      // Always show address modal to confirm/update address
      setShowCheckoutAddressModal(true);
      return;
    }
    
    // Validate address before proceeding
    const addressError = validatePhilippinesAddress(checkoutAddress);
    if (addressError) {
      setCheckoutAddressError(addressError);
      setShowCheckoutAddressModal(true);
      return;
    }

    // Proceed with checkout
    proceedWithCheckout(checkoutAddress);
  };

  const proceedWithCheckout = async (address) => {
    // Store address in state to ensure it's available for multiple locations confirmation
    if (address && address.trim()) {
      setCheckoutAddress(address.trim());
    }
    
    // Get only selected items
    const selectedItems = cart.filter(item => selectedCartItems.has(item.product_id));

    if (selectedItems.length === 0) {
      showAlertError({
        icon: 'info',
        title: 'No Items Selected',
        text: 'Please select at least one item to place an order.',
        button: 'OK'
      });
      return;
    }

    // Check if any selected items are made-to-order
    const hasMadeToOrderItems = selectedItems.some(item => item.isMadeToOrder || item.isCustom);
    
    // Show made-to-order notice if applicable
    if (hasMadeToOrderItems) {
      const madeToOrderCount = selectedItems.filter(item => item.isMadeToOrder || item.isCustom).length;
      const itemText = madeToOrderCount === 1 ? 'item' : 'items';
      const result = await Swal.fire({
        icon: 'info',
        title: 'Made-to-Order Items',
        html: `<div style="text-align: left; padding: 10px;">
          <p style="margin-bottom: 10px;">You have <strong>${madeToOrderCount} made-to-order ${itemText}</strong> in your order.</p>
          <p style="margin-bottom: 0; color: #4a5568;">
            <strong>⏱️ Processing Time:</strong> Made-to-order items typically take <strong>7-14 days</strong> to be finished and delivered.
          </p>
        </div>`,
        showCancelButton: true,
        confirmButtonText: 'Continue Checkout',
        cancelButtonText: 'Review Cart',
        confirmButtonColor: '#667eea',
        cancelButtonColor: '#718096'
      });
      
      if (!result.isConfirmed) {
        return; // User chose to review cart
      }
    }

    // Check if selected items are from multiple locations
    const selectedLocations = calculateLocationsFromItems(selectedItems);
    const hasMultipleLocations = selectedLocations.length > 1;

    // If multiple locations and not confirmed, show modal and pause checkout
    if (hasMultipleLocations && !multipleLocationsConfirmed) {
      setPendingCheckout(true);
      setShowMultipleLocationsModal(true);
      return;
    }

    // Proceed with checkout
    try {
      // Find "Agora Main Showroom" location
      const findAgoraMainShowroom = () => {
        const agoraLocation = locations.find(loc => {
          if (!loc.location_name) return false;
          const name = loc.location_name.toLowerCase();
          return name.includes('agora') && name.includes('main');
        });
        return agoraLocation ? agoraLocation.location_name : 'Agora Main Showroom';
      };
      const MADE_TO_ORDER_LOCATION = findAgoraMainShowroom();
      const agoraLocation = locations.find(loc => {
        if (!loc.location_name) return false;
        const name = loc.location_name.toLowerCase();
        return name.includes('agora') && name.includes('main');
      });
      const MADE_TO_ORDER_LOCATION_ID = agoraLocation ? agoraLocation.location_id : null;
      
      // Separate items into made-to-order and regular items
      // Made-to-order items take time, while items with stock can be delivered ASAP
      const madeToOrderItems = selectedItems.filter(item => item.isCustom || item.isMadeToOrder);
      const regularItems = selectedItems.filter(item => !item.isCustom && !item.isMadeToOrder);
      
      // Group regular items by location (including Agora Main Showroom if they have stock)
      const regularItemsByLocation = {};
      regularItems.forEach(item => {
        const locId = item.preferred_location_id || 'no_location';
        if (!regularItemsByLocation[locId]) {
          regularItemsByLocation[locId] = [];
        }
        regularItemsByLocation[locId].push(item);
      });

      // Prepare orders to create
      const ordersToCreate = [];
      
      // 1. Create one order for all made-to-order items (takes time - 7-14 days)
      // This is separate from regular items even if they're from Agora Main Showroom
      if (madeToOrderItems.length > 0) {
        const madeToOrderTotal = madeToOrderItems.reduce((sum, item) => {
          return sum + (parseFloat(item.price) * item.quantity);
        }, 0);
        
        const madeToOrderCartItems = madeToOrderItems.map(item => ({
          ...item,
          source_location_id: MADE_TO_ORDER_LOCATION_ID || null,
          is_made_to_order: 1 // All made-to-order items are marked as made to order
        }));
        
        ordersToCreate.push({
          type: 'made-to-order',
          locationId: 'made-to-order',
          locationName: MADE_TO_ORDER_LOCATION,
          items: madeToOrderItems,
          cartItems: madeToOrderCartItems,
          totalAmount: madeToOrderTotal
        });
      }
      
      // 2. Create separate orders for regular items grouped by location
      // Regular items from Agora Main Showroom (in stock) can be delivered ASAP
      // They are separate from made-to-order items
      const regularLocationIds = Object.keys(regularItemsByLocation);
      regularLocationIds.forEach(locId => {
        const locationItems = regularItemsByLocation[locId];
        const totalAmount = locationItems.reduce((sum, item) => {
          return sum + (parseFloat(item.price) * item.quantity);
        }, 0);
        
        const cartItemsWithLocation = locationItems.map(item => ({
          ...item,
          source_location_id: item.preferred_location_id || null,
          is_made_to_order: item.isMadeToOrder ? 1 : 0 // Set based on item's made-to-order status
        }));
        
        // Determine if this is from Agora Main Showroom (for display purposes)
        const isAgoraLocation = locationItems[0]?.preferred_location_name?.toLowerCase().includes('agora') && 
                                locationItems[0]?.preferred_location_name?.toLowerCase().includes('main');
        
        ordersToCreate.push({
          type: 'regular',
          locationId: locId,
          locationName: locationItems[0]?.preferred_location_name || 'Unknown Location',
          items: locationItems,
          cartItems: cartItemsWithLocation,
          totalAmount: totalAmount,
          isAgoraLocation: isAgoraLocation
        });
      });

      // Get final address to use (passed as parameter)
      const finalAddress = (address && address.trim()) || '';
      
      // Log address for debugging
      console.log('📍 Sending delivery address to backend:', finalAddress);
      console.log('📍 Address length:', finalAddress.length);
      console.log('📍 Address is empty?', finalAddress === '');
      
      if (!finalAddress || finalAddress.trim() === '') {
        console.error('⚠️ WARNING: Delivery address is empty! This should not happen after validation.');
      }
      
      // Create all orders
      const orderPromises = ordersToCreate.map(async (orderData) => {
        const orderPayload = {
          customer_id: customer?.id || null,
          cart_items: orderData.cartItems,
          total_amount: orderData.totalAmount,
          payment_status: 'pending', // No payment yet
          payment_method: 'pending',
          status: 'pending', // Order is pending admin approval
          delivery_address: finalAddress // Include delivery address
        };
        
        // Log the payload being sent
        console.log('📦 Order payload being sent:', JSON.stringify(orderPayload, null, 2));
        console.log('📦 Delivery address in payload:', orderPayload.delivery_address);
        
        const response = await axios.get(BASE_URL + 'orders.php', {
          params: {
            json: JSON.stringify(orderPayload),
            operation: 'CreateOrder'
          }
        });

        return {
          type: orderData.type,
          locationId: orderData.locationId,
          locationName: orderData.locationName,
          locationItems: orderData.items,
          response: response
        };
      });

      // Wait for all orders to be created
      const orderResults = await Promise.all(orderPromises);
      
      // Check if all orders were successful
      const allSuccessful = orderResults.every(result => result.response.data.success);
      const failedOrders = orderResults.filter(result => !result.response.data.success);

      if (allSuccessful) {
        // Reset multiple locations confirmation
        setMultipleLocationsConfirmed(false);
        // Remove selected items from cart after successful order creation
        const remainingItems = cart.filter(item => !selectedCartItems.has(item.product_id));
        setCart(remainingItems);
        setSelectedCartItems(new Set(remainingItems.map(item => item.product_id)));
        
        if (isLoggedIn && customer) {
          saveCart(customer.id, remainingItems);
        } else {
          saveCart(null, remainingItems);
        }
        
        // Close cart modal
        setShowCart(false);
        
        // Show success message
        const orderCount = orderResults.length;
        const madeToOrderCount = orderResults.filter(r => r.type === 'made-to-order').length;
        const regularCount = orderResults.filter(r => r.type === 'regular').length;
        
        let message = `Order Request${orderCount > 1 ? 's' : ''} Submitted Successfully! `;
        
        if (madeToOrderCount > 0 && regularCount > 0) {
          message += `You have submitted ${orderCount} separate ${orderCount > 1 ? 'orders' : 'order'}: ${madeToOrderCount} made-to-order order${madeToOrderCount > 1 ? 's' : ''} and ${regularCount} regular order${regularCount > 1 ? 's' : ''} (grouped by location). `;
        } else if (madeToOrderCount > 0) {
          message += `You have submitted ${madeToOrderCount} made-to-order order${madeToOrderCount > 1 ? 's' : ''}. `;
        } else if (regularCount > 1) {
          message += `You have submitted ${regularCount} separate orders (one for each location). `;
        }
        
        message += `Your order request${orderCount > 1 ? 's are' : ' is'} pending admin review. The admin will review your order${orderCount > 1 ? 's' : ''}, adjust pricing if needed, add delivery fees, and approve ${orderCount > 1 ? 'them' : 'it'}. You will be notified once your order${orderCount > 1 ? 's are' : ' is'} approved and ready for payment.`;
        
        AlertSucces(
          message,
          "success",
          false,
          'OK'
        );
        
        // Clear checkout address after successful order
        setCheckoutAddress('');
        setCheckoutAddressError('');
        
        // Optionally redirect to orders page
        setTimeout(() => {
          router.push('/shop/orders');
        }, 2000);
      } else {
        // Some orders failed
        const errorMessages = failedOrders.map(result => {
          return result.response.data.message || 'Unknown error';
        }).join('; ');
        
        showAlertError({
          icon: 'error',
          title: 'Checkout Partially Failed',
          text: `Some orders were created successfully, but ${failedOrders.length} order${failedOrders.length > 1 ? 's' : ''} failed: ${errorMessages}. Please check your orders page and try again for the failed items.`,
          button: 'OK'
        });
        
        // Still remove successfully created items from cart
        const itemsToRemove = new Set();
        orderResults
          .filter(result => result.response.data.success)
          .forEach(result => {
            result.locationItems.forEach(item => {
              itemsToRemove.add(item.product_id);
            });
          });
        
        const remainingItems = cart.filter(item => !itemsToRemove.has(item.product_id));
        setCart(remainingItems);
        setSelectedCartItems(new Set(remainingItems.map(item => item.product_id)));
        
        if (isLoggedIn && customer) {
          saveCart(customer.id, remainingItems);
        } else {
          saveCart(null, remainingItems);
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showAlertError({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Something went wrong. Please try again.',
        button: 'OK'
      });
    }
  };

  // Product detail modal
  const viewProductDetails = async (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
    setProductInventory([]); // Clear previous inventory data
    await fetchProductInventory(product.product_id);
  };

  // Get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === '/uploads/products/defualt.jpg\r\n' || imagePath === '/uploads/products/defualt.jpg') {
      return '/assets/images/default-product.png';
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    return imagePath;
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="shop-container">
        {/* Header */}
        <header className="shop-header">
        <div className="header-content">
          <div className="logo-section">
            <Image src="/assets/images/AG.png" width={70} height={70} alt="Logo" className="shop-logo" />
            <h1>A.G Home Appliance & Furnitures Showroom</h1>
          </div>
          
          <div className="header-actions">
            <button 
              className="cart-button" 
              onClick={() => {
                setShowCart(true);
                if (cart.length > 0) {
                  fetchCartItemsInventory();
                }
              }}
            >
              🛒 Cart ({cart.length})
            </button>
            
            {isLoggedIn ? (
              <>
                <button 
                  onClick={() => router.push('/shop/orders')}
                  className="orders-button"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '2px solid rgba(255, 255, 255, 0.8)',
                    color: 'white',
                    padding: '0.65rem 1.35rem',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#667eea';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  📦 My Orders
                </button>
                <div className="user-menu">
                  <span>Welcome, {customer?.name}!</span>
                  <button 
                    onClick={handleEditProfile}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      transition: 'all 0.3s',
                      marginRight: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.1)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                    }}
                  >
                    ✏️ Edit Profile
                  </button>
                  <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
              </>
            ) : (
              <button 
                onClick={() => {
                  setShowAuthModal(true);
                  setAuthMode('login');
                }}
                className="login-btn"
              >
                Login / Sign Up
              </button>
            )}
            
            {/* <button 
              onClick={() => router.push('/')}
              className="staff-login-link"
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                marginLeft: '10px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.1)';
                e.target.style.borderColor = 'rgba(255,255,255,0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
            >
              👤 Staff Login
            </button> */}
          </div>
        </div>
        </header>

        {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Category:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedProductType('all');
              }}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Product Type:</label>
            <select 
              value={selectedProductType}
              onChange={(e) => setSelectedProductType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Product Types</option>
              {availableProductTypes.map(type => (
                <option
                  key={type.product_type_id}
                  value={type.product_type_id}
                >
                  {type.product_type_name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Store Location: {inventoriesLoading && <span style={{fontSize: '0.8rem', color: '#667eea'}}>(loading...)</span>}</label>
            <select 
              value={selectedLocation} 
              onChange={(e) => {
                console.log('🏪 Store location changed:', e.target.value);
                setSelectedLocation(e.target.value);
              }}
              className="filter-select"
            >
              <option value="all">All Stores</option>
              {locations
                .filter(loc => !loc.location_name.toLowerCase().includes('warehouse'))
                .map((loc, locIndex) => (
                  <option key={`location-${loc.location_id}-${locIndex}`} value={loc.location_id}>
                    {loc.location_name}
                  </option>
                ))
              }
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="name">Decription (A-Z)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
              <option value="product-code">Product Code (A.G-# Asc)</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range:</label>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: parseFloat(e.target.value) || 0 })}
                className="price-input"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: parseFloat(e.target.value) || 100000 })}
                className="price-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Discount Banner */}
      {activeDiscount && (
        <div className="discount-banner" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px 24px',
          margin: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <div className="discount-banner-content" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1, minWidth: '250px' }}>
            <span style={{ fontSize: '2.5rem', lineHeight: '1' }}>🎉</span>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ 
                fontSize: '1.4rem', 
                fontWeight: '700', 
                lineHeight: '1.3',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'baseline',
                gap: '8px'
              }}>
                <span>
                  {activeDiscount.discount_type === 'percentage' 
                    ? `${parseFloat(activeDiscount.discount_value).toFixed(2)}% OFF` 
                    : `₱${parseFloat(activeDiscount.discount_value).toLocaleString()} OFF`}
                </span>
                {activeDiscount.min_purchase_amount > 0 && (
                  <span style={{ fontSize: '1rem', fontWeight: '500', whiteSpace: 'nowrap' }}>
                    on orders over ₱{parseFloat(activeDiscount.min_purchase_amount).toLocaleString()}
                  </span>
                )}
              </div>
              {activeDiscount.description && (
                <div style={{ 
                  fontSize: '0.95rem', 
                  opacity: 0.95,
                  lineHeight: '1.4',
                  marginTop: '4px'
                }}>
                  {activeDiscount.description}
                </div>
              )}
              {(activeDiscount.start_date || activeDiscount.end_date) && (
                <div style={{ 
                  fontSize: '0.85rem', 
                  opacity: 0.9, 
                  marginTop: '4px',
                  lineHeight: '1.4'
                }}>
                  {activeDiscount.start_date && `Valid from ${new Date(activeDiscount.start_date).toLocaleDateString()}`}
                  {activeDiscount.start_date && activeDiscount.end_date && ' until '}
                  {activeDiscount.end_date && `${new Date(activeDiscount.end_date).toLocaleDateString()}`}
                </div>
              )}
            </div>
          </div>
          {activeDiscount.max_discount_amount && activeDiscount.discount_type === 'percentage' && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              alignSelf: 'flex-start'
            }}>
              Max discount: ₱{parseFloat(activeDiscount.max_discount_amount).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Products Grid */}
      <div className="products-section">
        <div className="products-header">
          {/* <h2>Our Products ({filteredProducts.length})</h2> */}
          {inventoriesLoading && selectedLocation !== 'all' && (
            <p style={{fontSize: '0.9rem', color: '#667eea', margin: '0.5rem 0'}}>
              ⏳ Loading inventory data for location filter...
            </p>
          )}
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="no-products">
            <p>No products found matching your criteria</p>
            {selectedLocation !== 'all' && inventoriesLoading && (
              <p style={{fontSize: '0.9rem', color: '#667eea'}}>
                Please wait while we check inventory availability...
              </p>
            )}
          </div>
        ) : (
          <div className="products-grid">
            {currentProducts.map(product => (
              <div 
                key={product.product_id} 
                className="product-card"
                onClick={() => viewProductDetails(product)}
                style={{ cursor: 'pointer' }}
              >
                <div className="product-image">
                  <Image
                    src={getImageUrl(product.product_preview_image)}
                    alt={product.product_name}
                    width={250}
                    height={250}
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = '/assets/images/default-product.png';
                    }}
                  />
                </div>
                
                <div className="product-info">
                  <h3>{product.product_name}</h3>
                  <p className="product-description">{product.description}</p>
                  {product.product_type_name && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        background: '#f0f4ff',
                        color: '#3b5bcc',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 600,
                        marginBottom: '8px'
                      }}
                    >
                      🪑 {product.product_type_name}
                    </span>
                  )}
                  <div style={{ marginTop: '12px', marginBottom: '8px' }}>
                    {(() => {
                      const priceInfo = calculateDiscountedPrice(product.price);
                      const showDiscount = activeDiscount && priceInfo.qualifies && priceInfo.discountAmount > 0;
                      
                      return (
                        <>
                          {showDiscount ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
                                <span style={{ 
                                  textDecoration: 'line-through', 
                                  color: '#9ca3af', 
                                  fontSize: '0.9rem',
                                  fontWeight: '500'
                                }}>
                                  ₱{priceInfo.originalPrice.toLocaleString()}
                                </span>
                                <span style={{
                                  background: '#ef4444',
                                  color: 'white',
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: '700',
                                  whiteSpace: 'nowrap',
                                  lineHeight: '1.2'
                                }}>
                                  {activeDiscount.discount_type === 'percentage' 
                                    ? `-${activeDiscount.discount_value}%` 
                                    : `-₱${activeDiscount.discount_value}`}
                                </span>
                              </div>
                              <span style={{ 
                                color: '#ef4444', 
                                fontWeight: '700',
                                fontSize: '1.2rem',
                                lineHeight: '1.2'
                              }}>
                                ₱{priceInfo.discountedPrice.toLocaleString()}
                              </span>
                            </div>
                          ) : activeDiscount && !priceInfo.qualifies && activeDiscount.min_purchase_amount > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                              <span style={{ 
                                textDecoration: 'line-through', 
                                color: '#9ca3af', 
                                fontSize: '0.9rem',
                                fontWeight: '500'
                              }}>
                                ₱{priceInfo.originalPrice.toLocaleString()}
                              </span>
                              <span style={{ 
                                color: '#374151', 
                                fontWeight: '600',
                                fontSize: '1.1rem'
                              }}>
                                ₱{priceInfo.originalPrice.toLocaleString()}
                              </span>
                              <span style={{
                                fontSize: '0.65rem',
                                color: '#f59e0b',
                                fontStyle: 'italic',
                                marginTop: '2px'
                              }}>
                                Min: ₱{parseFloat(activeDiscount.min_purchase_amount).toLocaleString()} for discount
                              </span>
                            </div>
                          ) : (
                            <p className="product-price" style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
                              ₱{parseFloat(product.price).toLocaleString()}
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  
                  <div className="product-actions">
                    <button 
                      className="view-details-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        viewProductDetails(product);
                      }}
                    >
                      View Details
                    </button>
                    {(() => {
                      const inventory = productInventories[product.product_id] || [];
                      const availableInStores = isAvailableInStores(inventory);
                      const availableInWarehouse = isAvailableInWarehouse(inventory);
                      const hasAnyStock = availableInStores || availableInWarehouse;
                      const inventoryLoaded = productInventories.hasOwnProperty(product.product_id);
                      
                      // Always allow adding to cart - out of stock items can be made to order
                      let buttonText = 'Add to Cart';
                      let buttonTitle = 'Add to cart';
                      
                      if (inventoryLoaded) {
                        if (!hasAnyStock) {
                          buttonText = 'Request Made-to-Order';
                          buttonTitle = 'This item is out of stock but can be made to order';
                        } else if (availableInWarehouse && !availableInStores) {
                          buttonText = 'Request from Warehouse';
                          buttonTitle = 'Available in warehouse - will be requested';
                        }
                      }
                      
                      return (
                        <button 
                          className="add-to-cart-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          title={buttonTitle}
                        >
                          {buttonText}
                        </button>
                      );
                    })()}
                    {/* <button 
                      className="customize-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCustomizationModal(product);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        marginTop: '5px',
                        width: '100%'
                      }}
                    >
                      🎨 Customize
                    </button> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="shop-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About A.G Homes</h3>
            <p>
            Upgrade your home today! A.G Homes Appliance and Furniture Showroom offers unbeatable prices with flexible cash or installment payment plans. 
            Drop by a store near you and enjoy exciting deals!
            </p>
          </div>

          <div className="footer-section">
            <h3>Contact Us</h3>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>09956598673</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <span>AllYouNeedisAG@gmail.com</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>Gaabucayan Street Agora Lapasan, Cagayan de Oro, Philippines</span>
              </div>
            </div>
          </div>

          <div className="footer-section">
            <h3>Business Hours</h3>
            <div className="business-hours">
              <div className="hours-item">
                <span className="day">Monday - Saturday</span>
                <span className="time">8:00 AM - 6:00 PM</span>
              </div>
              <div className="hours-item">
                <span className="day">Sunday</span>
                <span className="time">9:00 AM - 5:30 PM</span>
              </div>
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#cbd5e0' }}>
              Visit us today and experience quality home appliances and furniture at affordable prices.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} A.G Homes Appliance & Furnitures Showroom. All rights reserved.</p>
        </div>
      </footer>

      {/* Checkout Address Modal */}
      {showCheckoutAddressModal && (
        <div className="modal-overlay" onClick={() => {
          setShowCheckoutAddressModal(false);
          setCheckoutAddressError('');
          setAddressFields({
            street: '',
            barangay: '',
            city: '',
            province: '',
            postalCode: ''
          });
        }} style={{ zIndex: 10000 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            maxWidth: '700px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            zIndex: 10001
          }}>
            <button className="modal-close" onClick={() => {
              setShowCheckoutAddressModal(false);
              setCheckoutAddressError('');
              setAddressFields({
                street: '',
                barangay: '',
                city: '',
                province: '',
                postalCode: ''
              });
            }}>×</button>
            
            <div style={{ padding: '24px' }}>
              <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Confirm Delivery Address</h2>
              <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '24px' }}>
                Please confirm or update your delivery address in the Philippines to complete your order.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#2d3748' }}>
                    Street/Unit Number <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={addressFields.street}
                    onChange={(e) => {
                      setAddressFields({ ...addressFields, street: e.target.value });
                      setCheckoutAddressError('');
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

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#2d3748' }}>
                    Barangay <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={addressFields.barangay}
                    onChange={(e) => {
                      setAddressFields({ ...addressFields, barangay: e.target.value });
                      setCheckoutAddressError('');
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
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#2d3748' }}>
                      City/Municipality <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={addressFields.city}
                      onChange={(e) => {
                        setAddressFields({ ...addressFields, city: e.target.value });
                        setCheckoutAddressError('');
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

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#2d3748' }}>
                      Province <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={addressFields.province}
                      onChange={(e) => {
                        setAddressFields({ ...addressFields, province: e.target.value });
                        setCheckoutAddressError('');
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

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#2d3748' }}>
                    Delivery Note (Optional)
                  </label>
                  <textarea
                    value={addressFields.note}
                    onChange={(e) => {
                      setAddressFields({ ...addressFields, note: e.target.value });
                      setCheckoutAddressError('');
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

                {checkoutAddressError && (
                  <div style={{ 
                    color: '#ef4444', 
                    fontSize: '0.85rem', 
                    marginTop: '-8px',
                    padding: '8px',
                    background: '#fee2e2',
                    borderRadius: '6px',
                    border: '1px solid #fecaca'
                  }}>
                    {checkoutAddressError}
                  </div>
                )}
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                marginTop: '24px' 
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCheckoutAddressModal(false);
                    setCheckoutAddress('');
                    setCheckoutAddressError('');
                    setAddressFields({
                      street: '',
                      barangay: '',
                      city: '',
                      province: '',
                      note: ''
                    });
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
                  onClick={async () => {
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
                      setCheckoutAddressError('Please fill in all required fields (Street, Barangay, City, Province)');
                      return;
                    }
                    
                    const error = validatePhilippinesAddress(fullAddress);
                    if (error) {
                      setCheckoutAddressError(error);
                      return;
                    }
                    
                    // Set the full address in state first
                    setCheckoutAddress(fullAddress);
                    
                    // Optionally save address to profile
                    const customerId = sessionStorage.getItem('customer_id');
                    if (customerId && customer) {
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
                        // Update local customer state
                        setCustomer({ ...customer, address: fullAddress });
                      } catch (error) {
                        console.error('Error saving address:', error);
                        // Continue anyway
                      }
                    }
                    
                    // Close modal first
                    setShowCheckoutAddressModal(false);
                    setCheckoutAddressError('');
                    
                    // Use setTimeout to ensure state is updated before proceeding
                    setTimeout(() => {
                      proceedWithCheckout(fullAddress);
                    }, 50);
                  }}
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
                  Continue Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => {
          setShowAuthModal(false);
          setShowPassword(false);
          setShowConfirmPassword(false);
          setShowForgotPassword(false);
          setForgotPasswordStep(1);
          setForgotPasswordEmail('');
          setResetCode('');
          setResendCooldown(0);
        }}>
          <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => {
              setShowAuthModal(false);
              setShowPassword(false);
              setShowConfirmPassword(false);
              setShowForgotPassword(false);
              setForgotPasswordStep(1);
              setForgotPasswordEmail('');
              setResetCode('');
              setResendCooldown(0);
            }}>×</button>
            
            {!showForgotPassword && (
              <div className="auth-tabs">
                <button 
                  className={authMode === 'login' ? 'active' : ''}
                  onClick={() => {
                    setAuthMode('login');
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                  }}
                >
                  Login
                </button>
                <button 
                  className={authMode === 'signup' ? 'active' : ''}
                  onClick={() => {
                    setAuthMode('signup');
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                  }}
                >
                  Sign Up
                </button>
              </div>
            )}

            <div className="auth-modal-content">
              {showForgotPassword ? (
                <div className="auth-form">
                  {/* Step Indicator */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '1.5rem',
                    position: 'relative'
                  }}>
                    <div style={{
                      flex: 1,
                      textAlign: 'center',
                      position: 'relative',
                      zIndex: 2
                    }}>
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: forgotPasswordStep >= 1 ? '#667eea' : '#e2e8f0',
                        color: forgotPasswordStep >= 1 ? 'white' : '#9ca3af',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 5px',
                        fontWeight: 'bold'
                      }}>
                        {forgotPasswordStep > 1 ? '✓' : '1'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: forgotPasswordStep >= 1 ? '#667eea' : '#9ca3af' }}>
                        Email
                      </div>
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      left: '15%',
                      right: '15%',
                      height: '2px',
                      background: forgotPasswordStep >= 2 ? '#667eea' : '#e2e8f0',
                      zIndex: 1
                    }}></div>
                    <div style={{
                      flex: 1,
                      textAlign: 'center',
                      position: 'relative',
                      zIndex: 2
                    }}>
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: forgotPasswordStep >= 2 ? '#667eea' : '#e2e8f0',
                        color: forgotPasswordStep >= 2 ? 'white' : '#9ca3af',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 5px',
                        fontWeight: 'bold'
                      }}>
                        {forgotPasswordStep > 2 ? '✓' : '2'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: forgotPasswordStep >= 2 ? '#667eea' : '#9ca3af' }}>
                        Code
                      </div>
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      left: '50%',
                      right: '15%',
                      height: '2px',
                      background: forgotPasswordStep >= 3 ? '#667eea' : '#e2e8f0',
                      zIndex: 1
                    }}></div>
                    <div style={{
                      flex: 1,
                      textAlign: 'center',
                      position: 'relative',
                      zIndex: 2
                    }}>
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: forgotPasswordStep >= 3 ? '#667eea' : '#e2e8f0',
                        color: forgotPasswordStep >= 3 ? 'white' : '#9ca3af',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 5px',
                        fontWeight: 'bold'
                      }}>
                        3
                      </div>
                      <div style={{ fontSize: '0.75rem', color: forgotPasswordStep >= 3 ? '#667eea' : '#9ca3af' }}>
                        Password
                      </div>
                    </div>
                  </div>

                  {/* Step 1: Enter Email */}
                  {forgotPasswordStep === 1 && (
                    <form onSubmit={handleForgotPassword}>
                      <h2>Reset Password</h2>
                      <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '1.5rem' }}>
                        Enter your email address and we'll send you a verification code.
                      </p>
                      
                      <div className="form-group">
                        <label>Email:</label>
                        <input
                          type="email"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          required
                          placeholder="Enter your email"
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                        <button 
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(false);
                            setForgotPasswordStep(1);
                            setForgotPasswordEmail('');
                            setResetCode('');
                            setResendCooldown(0);
                          }}
                          className="submit-btn"
                          style={{ 
                            background: '#e2e8f0',
                            color: '#4a5568',
                            flex: 1
                          }}
                          disabled={forgotPasswordLoading}
                        >
                          Back to Login
                        </button>
                        <button 
                          type="submit" 
                          className="submit-btn"
                          style={{ flex: 1 }}
                          disabled={forgotPasswordLoading}
                        >
                          {forgotPasswordLoading ? 'Sending...' : 'Send Code'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Step 2: Enter Verification Code */}
                  {forgotPasswordStep === 2 && (
                    <form onSubmit={handleVerifyCode}>
                      <h2>Enter Verification Code</h2>
                      <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '1.5rem' }}>
                        We've sent a 6-digit verification code to <strong>{forgotPasswordEmail}</strong>
                      </p>
                      
                      <div className="form-group">
                        <label>Verification Code:</label>
                        <input
                          type="text"
                          value={resetCode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                            setResetCode(value);
                          }}
                          required
                          placeholder="Enter 6-digit code"
                          maxLength="6"
                          style={{
                            fontSize: '24px',
                            letterSpacing: '8px',
                            textAlign: 'center',
                            fontWeight: 'bold'
                          }}
                        />
                      </div>

                      <div style={{ 
                        textAlign: 'center', 
                        marginTop: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <button
                          type="button"
                          onClick={handleResendCode}
                          disabled={resendCooldown > 0 || forgotPasswordLoading}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: resendCooldown > 0 ? '#9ca3af' : '#667eea',
                            cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                            textDecoration: 'underline',
                            fontSize: '0.9rem'
                          }}
                        >
                          {resendCooldown > 0 
                            ? `Resend code in ${resendCooldown}s` 
                            : 'Resend code'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                        <button 
                          type="button"
                          onClick={() => {
                            setForgotPasswordStep(1);
                            setResetCode('');
                            setResendCooldown(0);
                          }}
                          className="submit-btn"
                          style={{ 
                            background: '#e2e8f0',
                            color: '#4a5568',
                            flex: 1
                          }}
                          disabled={forgotPasswordLoading}
                        >
                          Back
                        </button>
                        <button 
                          type="submit" 
                          className="submit-btn"
                          style={{ flex: 1 }}
                          disabled={forgotPasswordLoading || resetCode.length !== 6}
                        >
                          {forgotPasswordLoading ? 'Verifying...' : 'Verify Code'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Step 3: Set New Password */}
                  {forgotPasswordStep === 3 && (
                    <form onSubmit={handleResetPassword}>
                      <h2>Set New Password</h2>
                      <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '1.5rem' }}>
                        Enter your new password below.
                      </p>
                      
                      <div className="form-group">
                        <label>Email:</label>
                        <input
                          type="email"
                          value={forgotPasswordEmail}
                          disabled
                          style={{ background: '#f7fafc', cursor: 'not-allowed' }}
                        />
                      </div>

                      <div className="form-group">
                        <label>New Password:</label>
                        <div className="password-input-wrapper">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder="Enter new password"
                            minLength="6"
                          />
                          <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? '👁️' : '👁️‍🗨️'}
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Confirm New Password:</label>
                        <div className="password-input-wrapper">
                          <input
                            type={showConfirmNewPassword ? "text" : "password"}
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                            placeholder="Confirm new password"
                            minLength="6"
                          />
                          <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                          >
                            {showConfirmNewPassword ? '👁️' : '👁️‍🗨️'}
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                        <button 
                          type="button"
                          onClick={() => {
                            setForgotPasswordStep(2);
                            setNewPassword('');
                            setConfirmNewPassword('');
                          }}
                          className="submit-btn"
                          style={{ 
                            background: '#e2e8f0',
                            color: '#4a5568',
                            flex: 1
                          }}
                          disabled={forgotPasswordLoading}
                        >
                          Back
                        </button>
                        <button 
                          type="submit" 
                          className="submit-btn"
                          style={{ flex: 1 }}
                          disabled={forgotPasswordLoading}
                        >
                          {forgotPasswordLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : authMode === 'login' ? (
              <form onSubmit={handleLogin} className="auth-form">
                <h2>Login to Your Account</h2>
                
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password:</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setForgotPasswordEmail(authForm.email);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#667eea',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      textDecoration: 'underline',
                      padding: 0
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button type="submit" className="submit-btn">Login</button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="auth-form">
                <h2>Create New Account</h2>
                
                <div className="form-group">
                  <label>Full Name:</label>
                  <input
                    type="text"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number (PH):</label>
                  <input
                    type="tel"
                    value={authForm.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setAuthForm({ ...authForm, phone: value });
                    }}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="09XX XXX XXXX"
                    pattern="09[0-9]{9}"
                    title="Must start with 09 and be 11 digits (e.g., 09123456789)"
                    maxLength="11"
                    required
                  />
                  <small style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.25rem', display: 'block' }}>
                    Format: 09XX XXX XXXX
                  </small>
                </div>

                <div className="form-group">
                  <label>Address:</label>
                  <textarea
                    value={authForm.address}
                    onChange={(e) => setAuthForm({ ...authForm, address: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password:</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm Password:</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={authForm.confirmPassword}
                      onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <button type="submit" className="submit-btn">Sign Up</button>
              </form>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowProfileModal(false)}>×</button>
            
            <div className="auth-modal-content">
              <form onSubmit={handleUpdateProfile} className="auth-form">
                <h2>Edit Profile</h2>
                
                <div className="form-group">
                  <label>Full Name:</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                    disabled={profileLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value.trim() })}
                    required
                    disabled={profileLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number (PH):</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setProfileForm({ ...profileForm, phone: value });
                    }}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="09XX XXX XXXX"
                    pattern="09[0-9]{9}"
                    title="Must start with 09 and be 11 digits (e.g., 09123456789)"
                    maxLength="11"
                    disabled={profileLoading}
                  />
                  <small style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.25rem', display: 'block' }}>
                    Format: 09XX XXX XXXX
                  </small>
                </div>

                <div className="form-group">
                  <label>Address:</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <textarea
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      disabled={profileLoading}
                      rows="4"
                      style={{ flex: 1 }}
                    />
                    {hasGoogleMapsKey && (
                      <button
                        type="button"
                        onClick={() => setShowMapPicker(true)}
                        disabled={profileLoading}
                        style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                          height: 'fit-content'
                        }}
                        onMouseEnter={(e) => {
                          if (!profileLoading) {
                            e.target.style.opacity = '0.9';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.opacity = '1';
                        }}
                      >
                        📍 Choose on Map
                      </button>
                    )}
                  </div>
                  {profileForm.latitude && profileForm.longitude && (
                    <small style={{ fontSize: '0.85rem', color: '#667eea', display: 'block', marginTop: '4px' }}>
                      ✓ Location selected: {profileForm.latitude.toFixed(6)}, {profileForm.longitude.toFixed(6)}
                    </small>
                  )}
                  {!hasGoogleMapsKey && (
                    <small style={{ fontSize: '0.85rem', color: '#718096', display: 'block', marginTop: '4px', fontStyle: 'italic' }}>
                      {/* 💡 Tip: Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable map location picker */}
                    </small>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={profileLoading}
                >
                  {profileLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Map Picker Modal */}
      {showMapPicker && (
        <MapPickerModal
          center={mapCenter}
          selectedLocation={selectedMapLocation}
          onLocationSelect={(location, address) => {
            setSelectedMapLocation(location);
            setProfileForm({
              ...profileForm,
              latitude: location.lat,
              longitude: location.lng,
              address: address || profileForm.address
            });
            setMapCenter(location);
          }}
          onClose={() => setShowMapPicker(false)}
          initialAddress={profileForm.address}
        />
      )}

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content product-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowProductModal(false)}>×</button>
            
            <div className="product-detail-content">
              <div className="product-detail-image">
                <Image
                  src={getImageUrl(selectedProduct.product_preview_image)}
                  alt={selectedProduct.product_name}
                  width={400}
                  height={400}
                  style={{ objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.src = '/assets/images/default-product.png';
                  }}
                />
              </div>

              <div className="product-detail-info">
                <h2>{selectedProduct.product_name}</h2>
                {(() => {
                  const priceInfo = calculateDiscountedPrice(selectedProduct.price);
                  const hasDiscount = priceInfo.discountAmount > 0;
                  
                  return (
                    <div>
                      {hasDiscount ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <p className="detail-price" style={{ 
                              textDecoration: 'line-through', 
                              color: '#9ca3af', 
                              fontSize: '1.2rem',
                              margin: 0
                            }}>
                              ₱{priceInfo.originalPrice.toLocaleString()}
                            </p>
                            <span style={{
                              background: '#ef4444',
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              fontWeight: '600'
                            }}>
                              {activeDiscount.discount_type === 'percentage' 
                                ? `-${activeDiscount.discount_value}%` 
                                : `-₱${activeDiscount.discount_value}`}
                            </span>
                          </div>
                          <p className="detail-price" style={{ 
                            color: '#ef4444', 
                            fontWeight: '700',
                            fontSize: '1.5rem',
                            margin: 0
                          }}>
                            ₱{priceInfo.discountedPrice.toLocaleString()}
                          </p>
                          {activeDiscount.description && (
                            <p style={{ 
                              fontSize: '0.9rem', 
                              color: '#059669',
                              margin: 0,
                              fontStyle: 'italic'
                            }}>
                              💰 {activeDiscount.description}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="detail-price">₱{parseFloat(selectedProduct.price).toLocaleString()}</p>
                      )}
                    </div>
                  );
                })()}

                {selectedProduct.product_type_name && (
                  <div
                    style={{
                      background: '#f0f4ff',
                      border: '1px solid #c3d0ff',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 600,
                      color: '#3b5bcc',
                      marginBottom: '16px'
                    }}
                  >
                    🪑 Product Type: {selectedProduct.product_type_name}
                  </div>
                )}
                
                <div className="detail-section">
                  <h3>Description</h3>
                  <p>{selectedProduct.description}</p>
                </div>

                <div className="detail-section">
                  <h3>Availability by Location</h3>
                  <div className="location-availability">
                    {inventoryLoading ? (
                      <p style={{ textAlign: 'center', padding: '1rem', color: '#667eea' }}>
                        Loading availability...
                      </p>
                    ) : productInventory.length > 0 ? (() => {
                      // Separate store and warehouse inventory
                      const storeInv = getStoreInventory(productInventory);
                      const warehouseInv = getWarehouseInventory(productInventory);
                      const availableInStores = isAvailableInStores(productInventory);
                      const availableInWarehouse = isAvailableInWarehouse(productInventory);
                      
                      return (
                        <div>
                          {storeInv.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: '600', color: '#495057' }}>
                                📍 Store Availability
                              </h4>
                              <table className="availability-table">
                                <thead>
                                  <tr>
                                    <th>Location</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {storeInv.map((inv, index) => (
                                    <tr key={index}>
                                      <td>{inv.location_name || 'Unknown'}</td>
                                      <td>{inv.qty}</td>
                                      <td>
                                        <span className={`stock-status ${inv.qty > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                          {inv.qty > 0 ? '✓ In Stock' : '✗ Out of Stock'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          
                          {warehouseInv.length > 0 && (
                            <div>
                              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: '600', color: '#495057' }}>
                                🏭 Warehouse Availability
                              </h4>
                              <table className="availability-table">
                                <thead>
                                  <tr>
                                    <th>Location</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {warehouseInv.map((inv, index) => (
                                    <tr key={index}>
                                      <td>{inv.location_name || 'Unknown'}</td>
                                      <td>{inv.qty}</td>
                                      <td>
                                        <span className={`stock-status ${inv.qty > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                          {inv.qty > 0 ? '✓ In Stock' : '✗ Out of Stock'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {!availableInStores && availableInWarehouse && (
                                <div style={{
                                  marginTop: '1rem',
                                  padding: '1rem',
                                  background: '#e7f3ff',
                                  border: '2px solid #2196F3',
                                  borderRadius: '8px',
                                  color: '#0d47a1'
                                }}>
                                  <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>
                                    ℹ️ Available in Warehouse
                                  </p>
                                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#1565c0' }}>
                                    This product is not available in stores but can be requested from the warehouse. Your order will be processed and delivered.
                                  </p>
                                </div>
                              )}
                              {!availableInStores && !availableInWarehouse && (
                                <div style={{
                                  marginTop: '1rem',
                                  padding: '1rem',
                                  background: '#fff3e0',
                                  border: '2px solid #ff9800',
                                  borderRadius: '8px',
                                  color: '#e65100'
                                }}>
                                  <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>
                                    🔨 Made to Order Available
                                  </p>
                                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#ef6c00' }}>
                                    This product is out of stock, but you can request it as a made-to-order item. Your order will be custom-made for you.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {!availableInStores && !availableInWarehouse && (
                            <div style={{
                              textAlign: 'center',
                              padding: '2rem 1rem',
                              background: '#e7f3ff',
                              border: '2px solid #2196F3',
                              borderRadius: '12px',
                              color: '#0d47a1'
                            }}>
                              <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem' }}>
                                🔨 Made to Order Available
                              </p>
                              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#1565c0' }}>
                                This product is currently out of stock, but you can request it as a made-to-order item. Your order will be custom-made for you.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })() : (
                      <div style={{
                        textAlign: 'center',
                        padding: '2rem 1rem',
                        background: '#fff3cd',
                        border: '2px solid #ffc107',
                        borderRadius: '12px',
                        color: '#856404'
                      }}>
                        <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem' }}>
                          ⚠️ Product Currently Unavailable
                        </p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#856404' }}>
                          This product is currently out of stock or unavailable in any store branch locations. You can order it through made to order.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {(() => {
                    // Always allow adding to cart - out of stock items can be made to order
                    const inventoryLoaded = !inventoryLoading && productInventory.length >= 0;
                    const availableInStores = inventoryLoaded ? isAvailableInStores(productInventory) : false;
                    const availableInWarehouse = inventoryLoaded ? isAvailableInWarehouse(productInventory) : false;
                    const hasAnyStock = availableInStores || availableInWarehouse;
                    
                    let buttonText = 'Add to Cart';
                    let buttonTitle = 'Add to cart';
                    
                    if (inventoryLoaded) {
                      if (!hasAnyStock) {
                        buttonText = 'Request Made-to-Order';
                        buttonTitle = 'This item is out of stock but can be made to order';
                      } else if (availableInWarehouse && !availableInStores) {
                        buttonText = 'Request from Warehouse';
                        buttonTitle = 'Available in warehouse - will be requested';
                      }
                    }
                    
                    return (
                      <button 
                        className="add-to-cart-btn-large"
                        onClick={() => {
                          addToCart(selectedProduct);
                          setShowProductModal(false);
                        }}
                        title={buttonTitle}
                      >
                        {buttonText}
                      </button>
                    );
                  })()}
                  <button 
                    className="customize-btn-large"
                    onClick={() => {
                      openCustomizationModal(selectedProduct);
                      setShowProductModal(false);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      flex: '1',
                      minWidth: '150px'
                    }}
                  >
                    🎨 Customize Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customization Modal */}
      {showCustomizationModal && (
        <div className="modal-overlay" onClick={closeCustomizationModal}>
          <div className="modal-content customization-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeCustomizationModal}>×</button>
            
            <h2>🎨 Customize Your Item</h2>
            
            <div className="customization-form" style={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden', padding: '4px' }}>
              {/* Product Info */}
              <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '24px', borderLeft: '4px solid #667eea' }}>
                <div style={{ fontWeight: '600', color: '#495057', marginBottom: '4px' }}>Product:</div>
                <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: selectedProduct?.product_type_name ? '6px' : '0' }}>
                  {customization.product_name}
                </div>
                {selectedProduct?.product_type_name && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      background: '#eef2ff',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#4a55a2'
                    }}
                  >
                    🪑 {selectedProduct.product_type_name}
                  </div>
                )}
              </div>

              {/* Size Selection */}
              {sizePartEnabled && sizeOptions.length > 0 && (
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#495057', fontSize: '14px' }}>
                    📏 Size
                  </label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {sizeOptions.map((option) => {
                      const value = option.parts_modifications_name;
                      const isSelected = customization.size === value;
                      return (
                        <label
                          key={value}
                          style={{
                            flex: '1',
                            minWidth: '120px',
                            padding: '14px 16px',
                            border: `2px solid ${isSelected ? '#667eea' : '#e9ecef'}`,
                            borderRadius: '10px',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#f0f4ff' : 'white',
                            transition: 'all 0.2s',
                            textAlign: 'center',
                            fontWeight: isSelected ? '600' : '500',
                            color: isSelected ? '#667eea' : '#495057',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#667eea';
                              e.currentTarget.style.backgroundColor = '#f8f9ff';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#e9ecef';
                              e.currentTarget.style.backgroundColor = 'white';
                            }
                          }}
                        >
                          <input
                            type="radio"
                            name="size"
                            value={value}
                            checked={isSelected}
                            onChange={(e) => setCustomization({ ...customization, size: e.target.value })}
                            style={{ display: 'none' }}
                          />
                          <span>{value}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sofa Arm Selection */}
              {sofaArmPartEnabled && sofaArmOptions.length > 0 && (
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#495057', fontSize: '14px' }}>
                    🛋️ Sofa Arm
                  </label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {sofaArmOptions.map((option) => {
                      const value = option.parts_modifications_name;
                      const isSelected = customization.sofaArm === value;
                      return (
                        <label
                          key={value}
                          style={{
                            flex: '1',
                            minWidth: '140px',
                            padding: '14px 16px',
                            border: `2px solid ${isSelected ? '#667eea' : '#e9ecef'}`,
                            borderRadius: '10px',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#f0f4ff' : 'white',
                            transition: 'all 0.2s',
                            textAlign: 'center',
                            fontWeight: isSelected ? '600' : '500',
                            color: isSelected ? '#667eea' : '#495057',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#667eea';
                              e.currentTarget.style.backgroundColor = '#f8f9ff';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#e9ecef';
                              e.currentTarget.style.backgroundColor = 'white';
                            }
                          }}
                        >
                          <input
                            type="radio"
                            name="sofaArm"
                            value={value}
                            checked={isSelected}
                            onChange={(e) => setCustomization({ ...customization, sofaArm: e.target.value })}
                            style={{ display: 'none' }}
                          />
                          <span>{value}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cover Material Selection */}
              {coverPartEnabled && coverOptions.length > 0 && (
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#495057', fontSize: '14px' }}>
                    🪑 Cover Material
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                    {coverOptions.map((option) => {
                      const value = option.parts_modifications_name;
                      const isSelected = customization.cover === value;
                      return (
                        <label
                          key={value}
                          style={{
                            padding: '12px 14px',
                            border: `2px solid ${isSelected ? '#667eea' : '#e9ecef'}`,
                            borderRadius: '10px',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#f0f4ff' : 'white',
                            transition: 'all 0.2s',
                            textAlign: 'center',
                            fontWeight: isSelected ? '600' : '500',
                            color: isSelected ? '#667eea' : '#495057',
                            fontSize: '13px'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#667eea';
                              e.currentTarget.style.backgroundColor = '#f8f9ff';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#e9ecef';
                              e.currentTarget.style.backgroundColor = 'white';
                            }
                          }}
                        >
                          <input
                            type="radio"
                            name="cover"
                            value={value}
                            checked={isSelected}
                            onChange={(e) => setCustomization({ ...customization, cover: e.target.value })}
                            style={{ display: 'none' }}
                          />
                          <span>{value}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {colorPartEnabled && (
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057', fontSize: '14px' }}>
                    🎨 Color Options
                  </label>
                  
                  {/* Color Type Toggle */}
                  <div style={{ marginBottom: '12px', display: 'flex', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="colorType"
                        checked={!customization.colorMix}
                        onChange={() => setCustomization({
                          ...customization,
                          colorMix: false,
                          primaryColor: '',
                          secondaryColor: '',
                          primaryCustomColor: '',
                          secondaryCustomColor: ''
                        })}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', color: '#495057' }}>Single Color</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="colorType"
                        checked={customization.colorMix}
                        onChange={() => setCustomization({
                          ...customization,
                          colorMix: true,
                          color: '',
                          primaryColor: '',
                          secondaryColor: '',
                          primaryCustomColor: '',
                          secondaryCustomColor: ''
                        })}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', color: '#495057' }}>Mix Colors</span>
                    </label>
                  </div>

                  {/* Single Color Selection */}
                  {!customization.colorMix && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
                      {['Black', 'White', 'Brown', 'Gray', 'Beige', 'Navy Blue', 'Red', 'Green', 'Custom Color'].map((color) => (
                        <label
                          key={color}
                          style={{
                            padding: '12px 10px',
                            border: `2px solid ${customization.color === color ? '#667eea' : '#e9ecef'}`,
                            borderRadius: '10px',
                            cursor: 'pointer',
                            backgroundColor: customization.color === color ? '#f0f4ff' : 'white',
                            transition: 'all 0.2s',
                            textAlign: 'center',
                            fontWeight: customization.color === color ? '600' : '500',
                            color: customization.color === color ? '#667eea' : '#495057',
                            fontSize: '13px'
                          }}
                          onMouseEnter={(e) => {
                            if (customization.color !== color) {
                              e.currentTarget.style.borderColor = '#667eea';
                              e.currentTarget.style.backgroundColor = '#f8f9ff';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (customization.color !== color) {
                              e.currentTarget.style.borderColor = '#e9ecef';
                              e.currentTarget.style.backgroundColor = 'white';
                            }
                          }}
                        >
                          <input
                            type="radio"
                            name="color"
                            value={color}
                            checked={customization.color === color}
                            onChange={(e) => setCustomization({...customization, color: e.target.value})}
                            style={{ display: 'none' }}
                          />
                          <span>{color}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Mix Colors Selection */}
                  {customization.colorMix && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: '600', color: '#495057' }}>Primary Color</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px' }}>
                          {['Black', 'White', 'Brown', 'Gray', 'Beige', 'Navy Blue', 'Red'].map((color) => (
                            <label
                              key={color}
                              style={{
                                padding: '10px 8px',
                                border: `2px solid ${customization.primaryColor === color ? '#667eea' : '#e9ecef'}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                backgroundColor: customization.primaryColor === color ? '#f0f4ff' : 'white',
                                transition: 'all 0.2s',
                                textAlign: 'center',
                                fontWeight: customization.primaryColor === color ? '600' : '500',
                                color: customization.primaryColor === color ? '#667eea' : '#495057',
                                fontSize: '12px'
                              }}
                              onMouseEnter={(e) => {
                                if (customization.primaryColor !== color) {
                                  e.currentTarget.style.borderColor = '#667eea';
                                  e.currentTarget.style.backgroundColor = '#f8f9ff';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (customization.primaryColor !== color) {
                                  e.currentTarget.style.borderColor = '#e9ecef';
                                  e.currentTarget.style.backgroundColor = 'white';
                                }
                              }}
                            >
                              <input
                                type="radio"
                                name="primaryColor"
                                value={color}
                                checked={customization.primaryColor === color}
                                onChange={(e) => setCustomization({...customization, primaryColor: e.target.value})}
                                style={{ display: 'none' }}
                              />
                              <span>{color}</span>
                            </label>
                          ))}
                        </div>
                        <div style={{ marginTop: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: '#495057' }}>
                            Other primary color
                          </label>
                          <input
                            type="text"
                            value={customization.primaryCustomColor}
                            onChange={(e) => setCustomization({
                              ...customization,
                              primaryCustomColor: e.target.value
                            })}
                            placeholder="Type a custom primary color"
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '2px solid #e9ecef',
                              borderRadius: '8px',
                              fontSize: '13px'
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: '600', color: '#495057' }}>Secondary Color</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px' }}>
                          {['Black', 'White', 'Brown', 'Gray', 'Beige', 'Navy Blue', 'Red'].map((color) => (
                            <label
                              key={color}
                              style={{
                                padding: '10px 8px',
                                border: `2px solid ${customization.secondaryColor === color ? '#667eea' : '#e9ecef'}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                backgroundColor: customization.secondaryColor === color ? '#f0f4ff' : 'white',
                                transition: 'all 0.2s',
                                textAlign: 'center',
                                fontWeight: customization.secondaryColor === color ? '600' : '500',
                                color: customization.secondaryColor === color ? '#667eea' : '#495057',
                                fontSize: '12px'
                              }}
                              onMouseEnter={(e) => {
                                if (customization.secondaryColor !== color) {
                                  e.currentTarget.style.borderColor = '#667eea';
                                  e.currentTarget.style.backgroundColor = '#f8f9ff';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (customization.secondaryColor !== color) {
                                  e.currentTarget.style.borderColor = '#e9ecef';
                                  e.currentTarget.style.backgroundColor = 'white';
                                }
                              }}
                            >
                              <input
                                type="radio"
                                name="secondaryColor"
                                value={color}
                                checked={customization.secondaryColor === color}
                                onChange={(e) => setCustomization({...customization, secondaryColor: e.target.value})}
                                style={{ display: 'none' }}
                              />
                              <span>{color}</span>
                            </label>
                          ))}
                        </div>
                        <div style={{ marginTop: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: '#495057' }}>
                            Other secondary color
                          </label>
                          <input
                            type="text"
                            value={customization.secondaryCustomColor}
                            onChange={(e) => setCustomization({
                              ...customization,
                              secondaryCustomColor: e.target.value
                            })}
                            placeholder="Type a custom secondary color"
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '2px solid #e9ecef',
                              borderRadius: '8px',
                              fontSize: '13px'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Button Selection */}
              {buttonsPartEnabled && buttonOptions.length > 0 && (
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#495057', fontSize: '14px' }}>
                    🔘 Buttons
                  </label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {buttonOptions.map((option) => {
                      const value = option.parts_modifications_name;
                      const isSelected = customization.button === value;
                      return (
                        <label
                          key={value}
                          style={{
                            flex: '1',
                            minWidth: '140px',
                            padding: '14px 16px',
                            border: `2px solid ${isSelected ? '#667eea' : '#e9ecef'}`,
                            borderRadius: '10px',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#f0f4ff' : 'white',
                            transition: 'all 0.2s',
                            textAlign: 'center',
                            fontWeight: isSelected ? '600' : '500',
                            color: isSelected ? '#667eea' : '#495057',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#667eea';
                              e.currentTarget.style.backgroundColor = '#f8f9ff';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#e9ecef';
                              e.currentTarget.style.backgroundColor = 'white';
                            }
                          }}
                        >
                          <input
                            type="radio"
                            name="button"
                            value={value}
                            checked={isSelected}
                            onChange={(e) => setCustomization({ ...customization, button: e.target.value })}
                            style={{ display: 'none' }}
                          />
                          <span>{value}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Other Modifications */}
              <div className="form-group" style={{ marginBottom: '20px', paddingRight: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057', fontSize: '14px' }}>
                  ✏️ Other Modifications (Optional)
                </label>
                <textarea
                  value={customization.otherModifications}
                  onChange={(e) => setCustomization({...customization, otherModifications: e.target.value})}
                  placeholder="Describe any additional modifications or special requests..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Quantity */}
              <div className="form-row" style={{ marginBottom: '20px', paddingRight: '30px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#495057', fontSize: '14px' }}>
                    📦 Quantity
                  </label>
                  <input
                    type="number"
                    value={customization.quantity}
                    onChange={(e) => setCustomization({...customization, quantity: parseInt(e.target.value) || 1})}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #e9ecef' }}>
                <button 
                  className="cancel-btn"
                  onClick={closeCustomizationModal}
                  style={{
                    padding: '12px 24px',
                    border: '2px solid #6c757d',
                    background: 'white',
                    color: '#6c757d',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="add-custom-btn"
                  onClick={addCustomizedToCart}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 32px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                >
                  ✅ Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Modal */}
      {showCart && (
        <div className="modal-overlay" onClick={() => setShowCart(false)}>
          <div className="modal-content cart-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCart(false)}>×</button>
            
            <h2>Shopping Cart</h2>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                {/* Selection Controls */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#495057' }}>
                      {getSelectedItemsCount()} of {cart.length} items selected
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={selectAllCartItems}
                      style={{
                        padding: '6px 12px',
                        background: 'white',
                        border: '1px solid #667eea',
                        color: '#667eea',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#667eea';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'white';
                        e.target.style.color = '#667eea';
                      }}
                    >
                      Select All
                    </button>
                    <button
                      onClick={deselectAllCartItems}
                      style={{
                        padding: '6px 12px',
                        background: 'white',
                        border: '1px solid #6c757d',
                        color: '#6c757d',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
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
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="cart-items">
                  {(() => {
                    // Separate items into made-to-order and regular items
                    const madeToOrderItems = [];
                    const regularItems = [];
                    
                    cart.forEach((item, cartIndex) => {
                      if (item.isCustom || item.isMadeToOrder) {
                        madeToOrderItems.push({ ...item, cartIndex });
                      } else {
                        regularItems.push({ ...item, cartIndex });
                      }
                    });
                    
                    // Find "Agora Main Showroom" location from locations array
                    const findAgoraMainShowroom = () => {
                      const agoraLocation = locations.find(loc => {
                        if (!loc.location_name) return false;
                        const name = loc.location_name.toLowerCase();
                        return name.includes('agora') && name.includes('main');
                      });
                      return agoraLocation ? agoraLocation.location_name : 'Agora Main Showroom';
                    };
                    
                    const MADE_TO_ORDER_LOCATION = findAgoraMainShowroom();
                    
                    // Group made-to-order items by location
                    // Made-to-order items are ALWAYS from Agora Main Showroom, regardless of preferred_location_name
                    const madeToOrderGroups = {};
                    madeToOrderItems.forEach((item) => {
                      // Made-to-order items are always fulfilled at Agora Main Showroom
                      const locationName = MADE_TO_ORDER_LOCATION;
                      
                      if (!madeToOrderGroups[locationName]) {
                        madeToOrderGroups[locationName] = [];
                      }
                      
                      madeToOrderGroups[locationName].push(item);
                    });
                    
                    // Group regular items by location (use location_id as key to ensure proper separation)
                    const regularGroups = {};
                    regularItems.forEach((item) => {
                      // Use location_id as the primary key to ensure items from different locations are separated
                      const locationKey = item.preferred_location_id || 'no_location';
                      let locationName;
                      
                      // Debug logging
                      console.log('🔍 Grouping item:', {
                        productId: item.product_id,
                        productName: item.product_name || item.description,
                        preferred_location_id: item.preferred_location_id,
                        preferred_location_name: item.preferred_location_name
                      });
                      
                      if (item.preferred_location_name) {
                        locationName = item.preferred_location_name;
                      } else {
                        // If no preferred location, check if it has inventory
                        const inventory = cartItemInventories[item.product_id] || [];
                        const storeInv = getStoreInventory(inventory);
                        const warehouseInv = getWarehouseInventory(inventory);
                        
                        if (storeInv.length > 0 && storeInv[0].location_name) {
                          locationName = storeInv[0].location_name;
                        } else if (warehouseInv.length > 0 && warehouseInv[0].location_name) {
                          locationName = warehouseInv[0].location_name;
                        } else {
                          // No inventory info - treat as made-to-order (will be fulfilled at Agora)
                          locationName = MADE_TO_ORDER_LOCATION;
                        }
                      }
                      
                      // Use locationKey (location_id) as the key to ensure proper separation
                      if (!regularGroups[locationKey]) {
                        regularGroups[locationKey] = {
                          locationId: locationKey,
                          locationName: locationName,
                          items: []
                        };
                      }
                      
                      regularGroups[locationKey].items.push(item);
                    });
                    
                    // Sort locations alphabetically for each group
                    const sortLocations = (locations) => {
                      return Object.keys(locations).sort((a, b) => {
                        const aIsAgora = a.toLowerCase().includes('agora') && a.toLowerCase().includes('main');
                        const bIsAgora = b.toLowerCase().includes('agora') && b.toLowerCase().includes('main');
                        
                        if (aIsAgora) return -1;
                        if (bIsAgora) return 1;
                        return a.localeCompare(b);
                      });
                    };
                    
                    // Sort regular groups by location name
                    const sortRegularGroups = (groups) => {
                      return Object.keys(groups).sort((a, b) => {
                        const aName = groups[a].locationName || '';
                        const bName = groups[b].locationName || '';
                        const aIsAgora = aName.toLowerCase().includes('agora') && aName.toLowerCase().includes('main');
                        const bIsAgora = bName.toLowerCase().includes('agora') && bName.toLowerCase().includes('main');
                        
                        if (aIsAgora) return -1;
                        if (bIsAgora) return 1;
                        return aName.localeCompare(bName);
                      });
                    };
                    
                    const sortedMadeToOrderLocations = sortLocations(madeToOrderGroups);
                    const sortedRegularLocationKeys = sortRegularGroups(regularGroups);
                    
                    // Check if cart has items from different locations
                    const allLocationNames = [
                      ...sortedMadeToOrderLocations.map(loc => {
                        const items = madeToOrderGroups[loc];
                        return items && items.length > 0 ? (items[0].preferred_location_name || loc) : loc;
                      }),
                      ...sortedRegularLocationKeys.map(key => regularGroups[key].locationName)
                    ];
                    const uniqueLocations = [...new Set(allLocationNames)];
                    const hasMultipleLocations = uniqueLocations.length > 1;
                    
                    // Helper function to render location group
                    const renderLocationGroup = (locationName, locationItems, isMadeToOrder = false, locationId = null) => {
                      const showMadeToOrderBadge = isMadeToOrder;
                      
                      // Check if all items in this location are selected
                      const allSelected = areAllLocationItemsSelected(locationItems);
                      const selectedCount = locationItems.filter(item => selectedCartItems.has(item.product_id)).length;
                      
                      // Use locationId in key to ensure uniqueness, fallback to locationName if no ID
                      const uniqueKey = locationId 
                        ? `location-group-${locationId}-${isMadeToOrder ? 'mto' : 'reg'}` 
                        : `location-group-${locationName}-${isMadeToOrder ? 'mto' : 'reg'}-${Date.now()}`;
                      
                      return (
                        <div key={uniqueKey} style={{ marginBottom: '24px' }}>
                          {/* Location Header */}
                          <div style={{
                            padding: '12px 16px',
                            background: showMadeToOrderBadge 
                              ? 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)'
                              : 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                            borderRadius: '8px',
                            marginBottom: '12px',
                            border: `2px solid ${showMadeToOrderBadge ? '#ff9800' : '#4caf50'}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '12px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                              <span style={{ fontSize: '20px' }}>
                                {showMadeToOrderBadge ? '🔨' : '📍'}
                              </span>
                              <h3 style={{
                                margin: 0,
                                fontSize: '1rem',
                                fontWeight: '700',
                                color: showMadeToOrderBadge ? '#e65100' : '#2e7d32'
                              }}>
                                {locationName}
                              </h3>
                              {showMadeToOrderBadge && (
                                <span style={{
                                  padding: '2px 8px',
                                  background: '#ff9800',
                                  color: 'white',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600'
                                }}>
                                  Made to Order
                                </span>
                              )}
                            </div>
                            
                            {/* Location selection buttons */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {allSelected ? (
                                <button
                                  onClick={() => deselectLocationItems(locationItems)}
                                  style={{
                                    padding: '6px 12px',
                                    background: 'white',
                                    border: '2px solid #6c757d',
                                    color: '#6c757d',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
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
                                  Deselect All
                                </button>
                              ) : (
                                <button
                                  onClick={() => selectLocationItems(locationItems)}
                                  style={{
                                    padding: '6px 12px',
                                    background: 'white',
                                    border: '2px solid #667eea',
                                    color: '#667eea',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.background = '#667eea';
                                    e.target.style.color = 'white';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = 'white';
                                    e.target.style.color = '#667eea';
                                  }}
                                >
                                  Select All
                                </button>
                              )}
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                              <span style={{
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: showMadeToOrderBadge ? '#e65100' : '#2e7d32'
                              }}>
                                {selectedCount > 0 ? `${selectedCount}/${locationItems.length} selected` : `${locationItems.length} ${locationItems.length === 1 ? 'item' : 'items'}`}
                              </span>
                              <span style={{
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                color: showMadeToOrderBadge ? '#bf360c' : '#1b5e20'
                              }}>
                                Subtotal: ₱{locationItems.reduce((sum, item) => 
                                  sum + (parseFloat(item.price) * item.quantity), 0
                                ).toLocaleString()}
                              </span>
                              {selectedCount > 0 && (
                                <span style={{
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  color: showMadeToOrderBadge ? '#d84315' : '#2e7d32'
                                }}>
                                  Selected: ₱{locationItems
                                    .filter(item => selectedCartItems.has(item.product_id))
                                    .reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)
                                    .toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Items in this location */}
                          {locationItems.map((item) => {
                            const isSelected = selectedCartItems.has(item.product_id);
                            const itemInventory = cartItemInventories[item.product_id] || [];
                            const hasStock = itemInventory.length > 0;
                            const uniqueKey = `cart-item-${item.cartIndex}`;
                            
                            return (
                              <div 
                                key={uniqueKey}
                                className="cart-item"
                                style={{
                                  opacity: isSelected ? 1 : 0.6,
                                  border: isSelected ? '2px solid #667eea' : '2px solid transparent',
                                  borderRadius: '8px',
                                  padding: '12px',
                                  transition: 'all 0.2s',
                                  marginBottom: '12px'
                                }}
                              >
                                {/* Checkbox */}
                                <div style={{ marginRight: '12px' }}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleCartItemSelection(item.product_id)}
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      cursor: 'pointer',
                                      accentColor: '#667eea'
                                    }}
                                  />
                                </div>
                                <Image
                                  src={getImageUrl(item.product_preview_image)}
                                  alt={item.product_name}
                                  width={80}
                                  height={80}
                                  className="cart-item-image"
                                />
                                
                                <div className="cart-item-info">
                                  <h4>
                                    {item.product_name}
                                    {item.isCustom && (
                                      <span style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '10px',
                                        marginLeft: '8px',
                                        fontWeight: '600'
                                      }}>
                                        🎨 CUSTOM
                                      </span>
                                    )}
                                    {!item.isCustom && item.isMadeToOrder && (
                                      <span style={{
                                        background: '#fff3e0',
                                        color: '#e65100',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '10px',
                                        marginLeft: '8px',
                                        fontWeight: '600',
                                        border: '1px solid #ff9800'
                                      }}>
                                        🔨 MADE TO ORDER
                                      </span>
                                    )}
                                  </h4>
                                  {(item.isCustom || item.isMadeToOrder) && (
                                    <p style={{
                                      fontSize: '11px',
                                      color: '#e65100',
                                      margin: '4px 0 0 0',
                                      fontStyle: 'italic',
                                      fontWeight: '500'
                                    }}>
                                      ⏱️ Processing: 7-14 days to finish and deliver
                                    </p>
                                  )}
                                  <p className="cart-item-price">₱{parseFloat(item.price).toLocaleString()}</p>
                                  
                                  {/* Customization Details */}
                                  {item.isCustom && item.modifications && (
                                    <div className="customization-details" style={{
                                      background: '#f8f9fa',
                                      padding: '8px',
                                      borderRadius: '6px',
                                      margin: '8px 0',
                                      border: '1px solid #e9ecef'
                                    }}>
                                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '600', color: '#667eea' }}>
                                        Modifications:
                                      </p>
                                      <p style={{ margin: '0', fontSize: '11px', color: '#495057' }}>
                                        {item.modifications}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Location info - show for regular items */}
                                  {!(item.isCustom || item.isMadeToOrder) && item.preferred_location_name && (
                                    <div className="cart-item-availability">
                                      <div className="available-stores">
                                        <span className="availability-label" style={{ 
                                          color: '#4caf50', 
                                          fontWeight: '600',
                                          fontSize: '0.85rem'
                                        }}>
                                          📍 Location: {item.preferred_location_name}
                                        </span>
                                        {(() => {
                                          const availableLocations = getAvailableLocationsForProduct(item);
                                          if (availableLocations.length > 1) {
                                            return (
                                              <button
                                                onClick={() => updateCartItemLocation(item.product_id)}
                                                style={{
                                                  padding: '4px 8px',
                                                  background: 'transparent',
                                                  border: '1px solid #667eea',
                                                  color: '#667eea',
                                                  borderRadius: '4px',
                                                  cursor: 'pointer',
                                                  fontSize: '0.75rem',
                                                  fontWeight: '600',
                                                  marginTop: '4px',
                                                  transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                  e.target.style.background = '#667eea';
                                                  e.target.style.color = 'white';
                                                }}
                                                onMouseLeave={(e) => {
                                                  e.target.style.background = 'transparent';
                                                  e.target.style.color = '#667eea';
                                                }}
                                              >
                                                Change Location
                                              </button>
                                            );
                                          }
                                          return null;
                                        })()}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Show fulfillment info for made-to-order items */}
                                  {(item.isCustom || item.isMadeToOrder) && (
                                    <div className="cart-item-availability">
                                      <div className="available-stores">
                                        <span className="availability-label" style={{ 
                                          color: '#ff9800', 
                                          fontWeight: '600',
                                          fontSize: '0.85rem'
                                        }}>
                                          🔨 Made to Order
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#ef6c00', marginTop: '4px', display: 'block' }}>
                                          {item.isCustom 
                                            ? 'Customized item - will be fulfilled at Agora Main Showroom before delivery' 
                                            : 'Out of stock - will be made to order and fulfilled at Agora Main Showroom before delivery'}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="cart-item-quantity">
                                  <button onClick={() => updateCartQuantity(item.product_id, item.quantity - 1, item.preferred_location_id)}>
                                    -
                                  </button>
                                  <span>{item.quantity}</span>
                                  <button onClick={() => updateCartQuantity(item.product_id, item.quantity + 1, item.preferred_location_id)}>
                                    +
                                  </button>
                                </div>

                                <div className="cart-item-total">
                                  ₱{(parseFloat(item.price) * item.quantity).toLocaleString()}
                                </div>

                                <button 
                                  className="remove-item-btn"
                                  onClick={() => removeFromCart(item.product_id, item.preferred_location_id)}
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    };
                    
                    return (
                      <>
                        {/* Made-to-Order Items Section */}
                        {sortedMadeToOrderLocations.length > 0 && (
                          <div style={{ marginBottom: '32px' }}>
                            <div style={{
                              padding: '12px 16px',
                              background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                              borderRadius: '8px',
                              marginBottom: '16px',
                              border: '2px solid #ff9800',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <span style={{ fontSize: '24px' }}>🔨</span>
                              <h2 style={{
                                margin: 0,
                                fontSize: '1.2rem',
                                fontWeight: '700',
                                color: '#e65100'
                              }}>
                                Made-to-Order Items
                              </h2>
                              <span style={{
                                padding: '4px 12px',
                                background: '#ff9800',
                                color: 'white',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                {madeToOrderItems.length} {madeToOrderItems.length === 1 ? 'item' : 'items'}
                              </span>
                            </div>
                            
                            {sortedMadeToOrderLocations.map((locationName) => {
                              const locationItems = madeToOrderGroups[locationName];
                              return renderLocationGroup(locationName, locationItems, true, 'made-to-order');
                            })}
                          </div>
                        )}
                        
                        {/* Regular Items Section */}
                        {sortedRegularLocationKeys.length > 0 && (
                          <div>
                            {sortedMadeToOrderLocations.length > 0 && (
                              <div style={{
                                padding: '12px 16px',
                                background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                border: '2px solid #4caf50',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <span style={{ fontSize: '24px' }}>📍</span>
                                <h2 style={{
                                  margin: 0,
                                  fontSize: '1.2rem',
                                  fontWeight: '700',
                                  color: '#2e7d32'
                                }}>
                                  Regular Items
                                </h2>
                                <span style={{
                                  padding: '4px 12px',
                                  background: '#4caf50',
                                  color: 'white',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600'
                                }}>
                                  {regularItems.length} {regularItems.length === 1 ? 'item' : 'items'}
                                </span>
                              </div>
                            )}
                            
                            {sortedRegularLocationKeys.map((locationKey) => {
                              const locationGroup = regularGroups[locationKey];
                              const locationName = locationGroup.locationName;
                              const locationItems = locationGroup.items;
                              return renderLocationGroup(locationName, locationItems, false, locationKey);
                            })}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                <div className="cart-summary">
                  <div className="cart-total">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Subtotal ({getSelectedItemsCount()} items):</span>
                        <span>₱{getCartSubtotal().toLocaleString()}</span>
                      </div>
                      {activeDiscount && getCartDiscountAmount() > 0 && (
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          color: '#059669',
                          fontWeight: '600'
                        }}>
                          <span>
                            Discount 
                            {activeDiscount.discount_type === 'percentage' 
                              ? ` (${activeDiscount.discount_value}%)` 
                              : ` (₱${activeDiscount.discount_value})`}
                            :
                          </span>
                          <span>-₱{getCartDiscountAmount().toLocaleString()}</span>
                        </div>
                      )}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderTop: '2px solid #e5e7eb',
                        paddingTop: '8px',
                        marginTop: '4px',
                        fontSize: '1.1rem',
                        fontWeight: '700'
                      }}>
                        <span>Estimated Total:</span>
                        <span className="total-amount" style={{ color: '#ef4444' }}>
                          ₱{getCartTotal().toLocaleString()}
                        </span>
                      </div>
                      {activeDiscount && activeDiscount.description && (
                        <p style={{ 
                          fontSize: '0.85rem', 
                          color: '#059669',
                          margin: 0,
                          fontStyle: 'italic',
                          textAlign: 'center'
                        }}>
                          💰 {activeDiscount.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {getSelectedItemsCount() === 0 && (
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#ff9800',
                      margin: '0.5rem 0',
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      ⚠️ Please select at least one item to place an order
                    </p>
                  )}
                  <p style={{
                    fontSize: '0.85rem',
                    color: '#718096',
                    margin: '0.5rem 0',
                    fontStyle: 'italic',
                    textAlign: 'center'
                  }}>
                    Note: Final price may be adjusted by admin (delivery fees, discounts, etc.)
                  </p>
                  
                  <button 
                    className="checkout-btn" 
                    onClick={handleCheckout}
                    disabled={getSelectedItemsCount() === 0}
                    style={{
                      opacity: getSelectedItemsCount() === 0 ? 0.5 : 1,
                      cursor: getSelectedItemsCount() === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isLoggedIn ? `Submit Order Request (${getSelectedItemsCount()} items)` : 'Login to Request Order'}
                  </button>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#718096',
                    marginTop: '0.5rem',
                    textAlign: 'center'
                  }}>
                    No payment required yet. Payment will be requested after admin approval.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Multiple Locations Warning Modal */}
      {showMultipleLocationsModal && (() => {
        // Calculate locations for the modal - use selected items if pending checkout, otherwise all cart items
        const itemsToCheck = pendingCheckout 
          ? cart.filter(item => selectedCartItems.has(item.product_id))
          : cart;
        
        const locationGroups = {};
        const findAgoraMainShowroom = () => {
          const agoraLocation = locations.find(loc => {
            if (!loc.location_name) return false;
            const name = loc.location_name.toLowerCase();
            return name.includes('agora') && name.includes('main');
          });
          return agoraLocation ? agoraLocation.location_name : 'Agora Main Showroom';
        };
        const MADE_TO_ORDER_LOCATION = findAgoraMainShowroom();
        
        itemsToCheck.forEach((item) => {
          let locationName;
          // Made-to-order items are ALWAYS from Agora Main Showroom
          if (item.isCustom || item.isMadeToOrder) {
            locationName = MADE_TO_ORDER_LOCATION;
          } else if (item.preferred_location_name) {
            locationName = item.preferred_location_name;
          } else {
            const inventory = cartItemInventories[item.product_id] || [];
            const storeInv = inventory.filter(inv => inv.location_type === 'store' && inv.qty > 0);
            const warehouseInv = inventory.filter(inv => inv.location_type === 'warehouse' && inv.qty > 0);
            if (storeInv.length > 0 && storeInv[0].location_name) {
              locationName = storeInv[0].location_name;
            } else if (warehouseInv.length > 0 && warehouseInv[0].location_name) {
              locationName = warehouseInv[0].location_name;
            } else {
              locationName = MADE_TO_ORDER_LOCATION;
            }
          }
          if (!locationGroups[locationName]) {
            locationGroups[locationName] = [];
          }
          locationGroups[locationName].push(item);
        });
        
        const sortedLocations = Object.keys(locationGroups || {}).sort((a, b) => {
          const aIsAgora = a.toLowerCase().includes('agora') && a.toLowerCase().includes('main');
          const bIsAgora = b.toLowerCase().includes('agora') && b.toLowerCase().includes('main');
          if (aIsAgora) return -1;
          if (bIsAgora) return 1;
          return a.localeCompare(b);
        });
        
        // Safety check - ensure sortedLocations is always an array
        if (!Array.isArray(sortedLocations)) {
          console.error('sortedLocations is not an array:', sortedLocations);
          return null;
        }
        
        return (
          <div className="modal-overlay" onClick={() => {
            // Only allow closing if not pending checkout
            if (!pendingCheckout) {
              setShowMultipleLocationsModal(false);
            }
          }}>
            <div 
              className="modal-content" 
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '600px',
                width: '90%',
                padding: '0',
                display: 'flex',
                flexDirection: 'column',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
              }}
            >
              {/* Modal Header */}
              <div style={{
                padding: '20px',
                borderBottom: '1px solid #e9ecef',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                borderRadius: '12px 12px 0 0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '32px' }}>⚠️</span>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#e65100' }}>
                    Multiple Locations Detected
                  </h2>
                </div>
                <button 
                  className="modal-close" 
                  onClick={() => setShowMultipleLocationsModal(false)}
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
                maxHeight: '70vh'
              }}>
                <p style={{
                  margin: '0 0 16px 0',
                  fontSize: '1rem',
                  color: '#2d3748',
                  lineHeight: '1.6'
                }}>
                  {pendingCheckout ? (
                    <>
                      Your selected items for checkout are from <strong>{sortedLocations.length} different location{sortedLocations.length > 1 ? 's' : ''}</strong>.
                      <br /><br />
                      <strong>Note:</strong> Items from different locations will be split into <strong>{sortedLocations.length} separate order{sortedLocations.length > 1 ? 's' : ''}</strong> (one for each location). Each order will be processed and delivered independently.
                    </>
                  ) : (
                    <>
                      Your cart contains items from <strong>{sortedLocations.length} different location{sortedLocations.length > 1 ? 's' : ''}</strong>.
                      <br /><br />
                      <strong>Note:</strong> Items from different locations will be split into <strong>{sortedLocations.length} separate order{sortedLocations.length > 1 ? 's' : ''}</strong> (one for each location) when you checkout. Each order will be processed and delivered independently.
                    </>
                  )}
                </p>
                
                <div style={{
                  padding: '12px',
                  background: '#fff3e0',
                  border: '2px solid #ff9800',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <p style={{
                    margin: '0 0 8px 0',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#e65100'
                  }}>
                    ⚠️ Important Information:
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    color: '#bf360c',
                    lineHeight: '1.5'
                  }}>
                    Delivery fees may vary for each location and will be calculated separately for each order. 
                    The admin will review each order separately and set the appropriate delivery fees based on the location it's coming from.
                  </p>
                </div>

                <div style={{
                  marginTop: '20px'
                }}>
                  <p style={{
                    margin: '0 0 12px 0',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: '#2d3748'
                  }}>
                    📍 Locations in your cart:
                  </p>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {sortedLocations.map((locationName, index) => {
                      const locationItems = locationGroups[locationName];
                      return (
                        <div 
                          key={locationName}
                          style={{
                            padding: '12px',
                            background: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            borderRadius: '6px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <span style={{
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              color: '#2d3748'
                            }}>
                              {index + 1}. {locationName}
                            </span>
                            <p style={{
                              margin: '4px 0 0 0',
                              fontSize: '0.8rem',
                              color: '#6c757d'
                            }}>
                              {locationItems.length} {locationItems.length === 1 ? 'item' : 'items'}
                            </p>
                          </div>
                          <span style={{
                            fontSize: '0.85rem',
                            color: '#6c757d',
                            fontStyle: 'italic'
                          }}>
                            Separate delivery fee
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
                {pendingCheckout ? (
                  <>
                    <button
                      onClick={() => {
                        setShowMultipleLocationsModal(false);
                        setPendingCheckout(false);
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
                      onClick={async () => {
                        setMultipleLocationsConfirmed(true);
                        setShowMultipleLocationsModal(false);
                        setPendingCheckout(false);
                        // Wait a bit for state to update, then proceed with checkout
                        await new Promise(resolve => setTimeout(resolve, 200));
                        // Proceed with checkout directly without calling handleCheckout again
                        // to avoid duplicate modal
                        const selectedItems = cart.filter(item => selectedCartItems.has(item.product_id));
                        if (selectedItems.length === 0) return;
                        
                        try {
                          // Find "Agora Main Showroom" location
                          const findAgoraMainShowroom = () => {
                            const agoraLocation = locations.find(loc => {
                              if (!loc.location_name) return false;
                              const name = loc.location_name.toLowerCase();
                              return name.includes('agora') && name.includes('main');
                            });
                            return agoraLocation ? agoraLocation.location_name : 'Agora Main Showroom';
                          };
                          const MADE_TO_ORDER_LOCATION = findAgoraMainShowroom();
                          const agoraLocation = locations.find(loc => {
                            if (!loc.location_name) return false;
                            const name = loc.location_name.toLowerCase();
                            return name.includes('agora') && name.includes('main');
                          });
                          const MADE_TO_ORDER_LOCATION_ID = agoraLocation ? agoraLocation.location_id : null;
                          
                          // Separate items into made-to-order and regular items
                          // Made-to-order items take time, while items with stock can be delivered ASAP
                          const madeToOrderItems = selectedItems.filter(item => item.isCustom || item.isMadeToOrder);
                          const regularItems = selectedItems.filter(item => !item.isCustom && !item.isMadeToOrder);
                          
                          // Group regular items by location (including Agora Main Showroom if they have stock)
                          const regularItemsByLocation = {};
                          regularItems.forEach(item => {
                            const locId = item.preferred_location_id || 'no_location';
                            if (!regularItemsByLocation[locId]) {
                              regularItemsByLocation[locId] = [];
                            }
                            regularItemsByLocation[locId].push(item);
                          });

                          // Prepare orders to create
                          const ordersToCreate = [];
                          
                          // 1. Create one order for all made-to-order items (takes time - 7-14 days)
                          // This is separate from regular items even if they're from Agora Main Showroom
                          if (madeToOrderItems.length > 0) {
                            const madeToOrderTotal = madeToOrderItems.reduce((sum, item) => {
                              return sum + (parseFloat(item.price) * item.quantity);
                            }, 0);
                            
                            const madeToOrderCartItems = madeToOrderItems.map(item => ({
                              ...item,
                              source_location_id: MADE_TO_ORDER_LOCATION_ID || null,
                              is_made_to_order: 1 // All made-to-order items are marked as made to order
                            }));
                            
                            ordersToCreate.push({
                              type: 'made-to-order',
                              locationId: 'made-to-order',
                              locationName: MADE_TO_ORDER_LOCATION,
                              items: madeToOrderItems,
                              cartItems: madeToOrderCartItems,
                              totalAmount: madeToOrderTotal
                            });
                          }
                          
                          // 2. Create separate orders for regular items grouped by location
                          // Regular items from Agora Main Showroom (in stock) can be delivered ASAP
                          // They are separate from made-to-order items
                          const regularLocationIds = Object.keys(regularItemsByLocation);
                          regularLocationIds.forEach(locId => {
                            const locationItems = regularItemsByLocation[locId];
                            const totalAmount = locationItems.reduce((sum, item) => {
                              return sum + (parseFloat(item.price) * item.quantity);
                            }, 0);
                            
                            const cartItemsWithLocation = locationItems.map(item => ({
                              ...item,
                              source_location_id: item.preferred_location_id || null,
                              is_made_to_order: item.isMadeToOrder ? 1 : 0 // Set based on item's made-to-order status
                            }));
                            
                            // Determine if this is from Agora Main Showroom (for display purposes)
                            const isAgoraLocation = locationItems[0]?.preferred_location_name?.toLowerCase().includes('agora') && 
                                                    locationItems[0]?.preferred_location_name?.toLowerCase().includes('main');
                            
                            ordersToCreate.push({
                              type: 'regular',
                              locationId: locId,
                              locationName: locationItems[0]?.preferred_location_name || 'Unknown Location',
                              items: locationItems,
                              cartItems: cartItemsWithLocation,
                              totalAmount: totalAmount,
                              isAgoraLocation: isAgoraLocation
                            });
                          });

                          // Get delivery address from checkoutAddress state, or fetch from customer profile
                          let finalAddress = (checkoutAddress && checkoutAddress.trim()) || '';
                          
                          // If address is not in state, try to get it from customer profile
                          if (!finalAddress && customer?.id) {
                            try {
                              const profileResponse = await axios.get(BASE_URL + 'ecommerce_customer.php', {
                                params: {
                                  json: JSON.stringify({ customer_id: parseInt(customer.id) }),
                                  operation: 'GetCustomerProfile'
                                }
                              });
                              
                              if (profileResponse.data.success && profileResponse.data.customer?.address) {
                                finalAddress = profileResponse.data.customer.address.trim();
                                setCheckoutAddress(finalAddress);
                                console.log('📍 [Multiple Locations] Fetched address from customer profile:', finalAddress);
                              }
                            } catch (error) {
                              console.error('Error fetching customer address:', error);
                            }
                          }
                          
                          // Log address for debugging
                          console.log('📍 [Multiple Locations] Sending delivery address to backend:', finalAddress);
                          console.log('📍 [Multiple Locations] Address length:', finalAddress.length);
                          
                          if (!finalAddress || finalAddress.trim() === '') {
                            console.error('⚠️ WARNING: Delivery address is empty in multiple locations flow!');
                            showAlertError({
                              icon: 'warning',
                              title: 'Address Required',
                              text: 'Please provide a delivery address before checkout.',
                              button: 'OK'
                            });
                            return;
                          }

                          // Create all orders
                          const orderPromises = ordersToCreate.map(async (orderData) => {
                            const response = await axios.get(BASE_URL + 'orders.php', {
                              params: {
                                json: JSON.stringify({
                                  customer_id: customer?.id || null,
                                  cart_items: orderData.cartItems,
                                  total_amount: orderData.totalAmount,
                                  payment_status: 'pending',
                                  payment_method: 'pending',
                                  status: 'pending',
                                  delivery_address: finalAddress // Include delivery address
                                }),
                                operation: 'CreateOrder'
                              }
                            });

                            return {
                              type: orderData.type,
                              locationId: orderData.locationId,
                              locationName: orderData.locationName,
                              locationItems: orderData.items,
                              response: response
                            };
                          });

                          // Wait for all orders to be created
                          const orderResults = await Promise.all(orderPromises);
                          
                          // Check if all orders were successful
                          const allSuccessful = orderResults.every(result => result.response.data.success);
                          const failedOrders = orderResults.filter(result => !result.response.data.success);

                          if (allSuccessful) {
                            setMultipleLocationsConfirmed(false);
                            const remainingItems = cart.filter(item => !selectedCartItems.has(item.product_id));
                            setCart(remainingItems);
                            setSelectedCartItems(new Set(remainingItems.map(item => item.product_id)));
                            
                            if (isLoggedIn && customer) {
                              saveCart(customer.id, remainingItems);
                            } else {
                              saveCart(null, remainingItems);
                            }
                            
                            setShowCart(false);
                            
                            const orderCount = orderResults.length;
                            const madeToOrderCount = orderResults.filter(r => r.type === 'made-to-order').length;
                            const regularCount = orderResults.filter(r => r.type === 'regular').length;
                            
                            let message = `Order Request${orderCount > 1 ? 's' : ''} Submitted Successfully! `;
                            
                            if (madeToOrderCount > 0 && regularCount > 0) {
                              message += `You have submitted ${orderCount} separate ${orderCount > 1 ? 'orders' : 'order'}: ${madeToOrderCount} made-to-order order${madeToOrderCount > 1 ? 's' : ''} and ${regularCount} regular order${regularCount > 1 ? 's' : ''} (grouped by location). `;
                            } else if (madeToOrderCount > 0) {
                              message += `You have submitted ${madeToOrderCount} made-to-order order${madeToOrderCount > 1 ? 's' : ''}. `;
                            } else if (regularCount > 1) {
                              message += `You have submitted ${regularCount} separate orders (one for each location). `;
                            }
                            
                            message += `Your order request${orderCount > 1 ? 's are' : ' is'} pending admin review. The admin will review your order${orderCount > 1 ? 's' : ''}, adjust pricing if needed, add delivery fees, and approve ${orderCount > 1 ? 'them' : 'it'}. You will be notified once your order${orderCount > 1 ? 's are' : ' is'} approved and ready for payment.`;
                            
                            AlertSucces(
                              message,
                              "success",
                              false,
                              'OK'
                            );
                            
                            setTimeout(() => {
                              router.push('/shop/orders');
                            }, 2000);
                          } else {
                            // Some orders failed
                            const errorMessages = failedOrders.map(result => {
                              return result.response.data.message || 'Unknown error';
                            }).join('; ');
                            
                            showAlertError({
                              icon: 'error',
                              title: 'Checkout Partially Failed',
                              text: `Some orders were created successfully, but ${failedOrders.length} order${failedOrders.length > 1 ? 's' : ''} failed: ${errorMessages}. Please check your orders page and try again for the failed items.`,
                              button: 'OK'
                            });
                            
                            // Still remove successfully created items from cart
                            const itemsToRemove = new Set();
                            orderResults
                              .filter(result => result.response.data.success)
                              .forEach(result => {
                                result.locationItems.forEach(item => {
                                  itemsToRemove.add(item.product_id);
                                });
                              });
                            
                            const remainingItems = cart.filter(item => !itemsToRemove.has(item.product_id));
                            setCart(remainingItems);
                            setSelectedCartItems(new Set(remainingItems.map(item => item.product_id)));
                            
                            if (isLoggedIn && customer) {
                              saveCart(customer.id, remainingItems);
                            } else {
                              saveCart(null, remainingItems);
                            }
                          }
                        } catch (error) {
                          console.error('Checkout error:', error);
                          showAlertError({
                            icon: 'error',
                            title: 'Checkout Error',
                            text: error.response?.data?.message || error.message || 'An error occurred during checkout. Please try again.',
                            button: 'OK'
                          });
                        }
                      }}
                      style={{
                        padding: '10px 24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.opacity = '0.9';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.opacity = '1';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      Continue Checkout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowMultipleLocationsModal(false)}
                    style={{
                      padding: '10px 24px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      color: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = '0.9';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = '1';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    I Understand
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Location Selection Modal */}
      {showLocationModal && productForLocation && availableLocationsForProduct.length > 0 && (
        <div className="modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              padding: '0',
              display: 'flex',
              flexDirection: 'column',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#2d3748' }}>
                📍 Select Preferred Location
              </h2>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowLocationModal(false);
                  setProductForLocation(null);
                  setAvailableLocationsForProduct([]);
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

            {/* Modal Body - Scrollable */}
            <div style={{
              padding: '20px',
              overflowY: 'auto',
              flex: 1,
              minHeight: 0
            }}>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#4a5568', fontWeight: '600' }}>
                  Product: {productForLocation.description || productForLocation.product_name}
                </p>
                <p style={{ margin: '0', fontSize: '0.85rem', color: '#718096' }}>
                  Choose your preferred location to potentially reduce delivery fees:
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {availableLocationsForProduct.map((location, index) => (
                  <button
                    key={`${location.location_id}_${location.type}_${index}`}
                    onClick={() => handleLocationSelected(location.location_id, location.location_name)}
                    style={{
                      padding: '16px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      background: 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#667eea';
                      e.currentTarget.style.background = '#f7f9fc';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e9ecef';
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '20px' }}>
                          {location.type === 'warehouse' ? '🏭' : '📍'}
                        </span>
                        <span style={{ 
                          fontSize: '1rem', 
                          fontWeight: '600', 
                          color: location.type === 'warehouse' ? '#2196F3' : '#4caf50'
                        }}>
                          {location.location_name}
                        </span>
                        {location.type === 'warehouse' && (
                          <span style={{
                            padding: '2px 8px',
                            background: '#e3f2fd',
                            color: '#1976d2',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            Warehouse
                          </span>
                        )}
                      </div>
                      {location.address && (
                        <p style={{ 
                          margin: '4px 0 0 0', 
                          fontSize: '0.85rem', 
                          color: '#718096',
                          lineHeight: '1.4'
                        }}>
                          {location.address}
                        </p>
                      )}
                      <p style={{ 
                        margin: '4px 0 0 0', 
                        fontSize: '0.8rem', 
                        color: '#4caf50',
                        fontWeight: '600'
                      }}>
                        Stock: {location.quantity} available
                      </p>
                      {location.type === 'warehouse' && (
                        <p style={{ 
                          margin: '4px 0 0 0', 
                          fontSize: '0.75rem', 
                          color: '#ff9800',
                          fontWeight: '500'
                        }}>
                          ⚠️ May have higher delivery fee
                        </p>
                      )}
                    </div>
                    <span style={{ 
                      fontSize: '24px', 
                      color: '#667eea',
                      marginLeft: '12px'
                    }}>
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'flex-end',
              flexShrink: 0
            }}>
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  setProductForLocation(null);
                  setAvailableLocationsForProduct([]);
                }}
                style={{
                  padding: '10px 20px',
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


