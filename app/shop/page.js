'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import '../css/shop.css';
import { showAlertError } from '../Components/SweetAlert/error';
import { AlertSucces } from '../Components/SweetAlert/success';

export default function ShopPage() {
  const router = useRouter();
  
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [customer, setCustomer] = useState(null);
  
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
  const checkLoginStatus = () => {
    const customerId = sessionStorage.getItem('customer_id');
    const customerName = sessionStorage.getItem('customer_name');
    if (customerId && customerName) {
      setIsLoggedIn(true);
      setCustomer({ id: customerId, name: customerName });
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
        fetchProductTypeParts()
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

  // Filter and sort products
  const filterAndSortProducts = () => {
    let filtered = products.filter(product => {
      const matchesSearch = 
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.color && product.color.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = 
        selectedCategory === 'all' || 
        product.category_id === parseInt(selectedCategory);
      
      const matchesPrice = 
        parseFloat(product.price) >= priceRange.min && 
        parseFloat(product.price) <= priceRange.max;

      const matchesProductType =
        selectedProductType === 'all' ||
        (product.product_type_id && product.product_type_id === parseInt(selectedProductType));
      
      // Check location-based availability
      let matchesLocation = true;
      if (selectedLocation !== 'all') {
        const inventory = productInventories[product.product_id];
        // If inventory data hasn't loaded yet, show all products (optimistic)
        if (inventory && Array.isArray(inventory)) {
          const locationInventory = inventory.find(inv => 
            inv.location_id === parseInt(selectedLocation)
          );
          matchesLocation = locationInventory && locationInventory.qty > 0;
        }
      }
      
      return matchesSearch && matchesCategory && matchesPrice && matchesLocation && matchesProductType;
    });

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
          name: customerData.customer_name
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

  const handleLogout = () => {
    sessionStorage.removeItem('customer_id');
    sessionStorage.removeItem('customer_name');
    sessionStorage.removeItem('customer_email');
    setIsLoggedIn(false);
    setCustomer(null);
    setCart([]);
    AlertSucces('Logged out successfully', 'success', true, 'OK');
  };

  // Cart functions - Support guest and logged-in users
  const loadCart = (customerId) => {
    const savedCart = localStorage.getItem(`cart_${customerId}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const loadGuestCart = () => {
    const savedCart = localStorage.getItem('guest_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
      console.log('🛒 Loaded guest cart:', JSON.parse(savedCart).length, 'items');
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

  const addToCart = (product) => {
    // Allow adding to cart without login
    const existingItem = cart.find(item => item.product_id === product.product_id);
    let newCart;
    
    if (existingItem) {
      newCart = cart.map(item =>
        item.product_id === product.product_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }
    
    setCart(newCart);
    
    // Save to appropriate storage
    if (isLoggedIn && customer) {
      saveCart(customer.id, newCart);
    } else {
      saveCart(null, newCart); // Guest cart
    }
    
    AlertSucces(
      "Added to cart!",
      "success",
      true,
      'Good'
    );
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
      if (customization.colorMix && customization.primaryColor && customization.secondaryColor) {
        modificationsArray.push(`Color: Mix (${customization.primaryColor} + ${customization.secondaryColor})`);
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
      description: `${customization.description} (Customized)`,
      modifications: modificationsArray.join(', '),
      price: parseFloat(selectedProduct.price),
      quantity: customization.quantity,
      isCustom: true
    };

    const newCart = [...cart, customProduct];
    setCart(newCart);
    
    // Save to appropriate storage
    if (isLoggedIn && customer) {
      saveCart(customer.id, newCart);
    } else {
      saveCart(null, newCart); // Guest cart
    }
    
    AlertSucces(
      "Custom order added to cart!",
      "success",
      true,
      'Great!'
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

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.product_id !== productId);
    setCart(newCart);
    
    // Save to appropriate storage
    if (isLoggedIn && customer) {
      saveCart(customer.id, newCart);
    } else {
      saveCart(null, newCart); // Guest cart
    }
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const newCart = cart.map(item =>
      item.product_id === productId
        ? { ...item, quantity }
        : item
    );
    
    setCart(newCart);
    
    // Save to appropriate storage
    if (isLoggedIn && customer) {
      saveCart(customer.id, newCart);
    } else {
      saveCart(null, newCart); // Guest cart
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      showAlertError({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login or create an account to proceed with checkout',
        button: 'OK'
      });
      setShowCart(false);
      setShowAuthModal(true);
      setAuthMode('login');
      return;
    }
    
    // TODO: Implement checkout process
    AlertSucces('Checkout feature coming soon!', 'info', true, 'OK');
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
              <div className="user-menu">
                <span>Welcome, {customer?.name}!</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
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
            
            <button 
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
            </button>
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
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Stores</option>
              {locations
                .filter(loc => !loc.location_name.toLowerCase().includes('warehouse'))
                .map(loc => (
                  <option key={loc.location_id} value={loc.location_id}>
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
                  <p className="product-price">₱{parseFloat(product.price).toLocaleString()}</p>
                  
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
                    <button 
                      className="add-to-cart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                    >
                      Add to Cart
                    </button>
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

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => {
          setShowAuthModal(false);
          setShowPassword(false);
          setShowConfirmPassword(false);
        }}>
          <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => {
              setShowAuthModal(false);
              setShowPassword(false);
              setShowConfirmPassword(false);
            }}>×</button>
            
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

            <div className="auth-modal-content">
              {authMode === 'login' ? (
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
                <p className="detail-price">₱{parseFloat(selectedProduct.price).toLocaleString()}</p>

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
                    ) : productInventory.length > 0 ? (
                      <table className="availability-table">
                        <thead>
                          <tr>
                            <th>Location</th>
                            <th>Stock</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productInventory.map((inv, index) => (
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
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        padding: '2rem 1rem',
                        background: '#fff3cd',
                        border: '2px solid #ffc107',
                        borderRadius: '12px',
                        color: '#856404'
                      }}>
                        <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem' }}>
                          ⚠️ No store available for this product
                        </p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#856404' }}>
                          This product is currently not available in any store.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    className="add-to-cart-btn-large"
                    onClick={() => {
                      addToCart(selectedProduct);
                      setShowProductModal(false);
                    }}
                  >
                    Add to Cart
                  </button>
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
                        onChange={() => setCustomization({...customization, colorMix: false, primaryColor: '', secondaryColor: ''})}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', color: '#495057' }}>Single Color</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="colorType"
                        checked={customization.colorMix}
                        onChange={() => setCustomization({...customization, colorMix: true, color: ''})}
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
                <div className="cart-items">
                  {cart.map(item => {
                    const itemInventory = cartItemInventories[item.product_id] || [];
                    const hasStock = itemInventory.length > 0;
                    
                    return (
                      <div key={item.product_id} className="cart-item">
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
                          </h4>
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
                          
                          {/* Store Availability */}
                          <div className="cart-item-availability">
                            {hasStock ? (
                              <div className="available-stores">
                                <span className="availability-label">📍 Available at:</span>
                                <div className="store-tags">
                                  {itemInventory.map((inv, idx) => (
                                    <span key={idx} className="store-tag">
                                      {inv.location_name} ({inv.qty})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <span className="no-stock-warning">⚠️ No store available</span>
                            )}
                          </div>
                        </div>

                        <div className="cart-item-quantity">
                          <button onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}>
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}>
                            +
                          </button>
                        </div>

                        <div className="cart-item-total">
                          ₱{(parseFloat(item.price) * item.quantity).toLocaleString()}
                        </div>

                        <button 
                          className="remove-item-btn"
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="cart-summary">
                  <div className="cart-total">
                    <span>Total:</span>
                    <span className="total-amount">₱{getCartTotal().toLocaleString()}</span>
                  </div>
                  
                  <button className="checkout-btn" onClick={handleCheckout}>
                    {isLoggedIn ? 'Proceed to Checkout' : 'Login to Checkout'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


