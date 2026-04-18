'use client';
import React from 'react';
import "../../css/inventory-css/inventory.css";

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import CustomPagination from '@/app/Components/Pagination/pagination';
import CustomInput from '@/app/Components/CustomInput/CustomInput';
import SegmentedInput from '@/app/Components/CustomInput/SegmentedInput';
import CustomModal from '@/app/Components/CustomModal/CustomModal';

import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';

const ITEMS_PER_PAGE = 9;

// Helper function to get the correct image URL
const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === 'Nothing as for now') {
        return null;
    }

    // If it's already a full URL (Cloudinary), return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // If it's a local path, return as-is (Next.js will handle it from public folder)
    return imagePath;
};

const ProductsAdmin = () => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);

    // Filter states for products
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
    const [productTypeFilter, setProductTypeFilter] = useState('');

    // Sorting states for products
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');

    const [productsVisible, setProductsVisible] = useState(true);

    const [addProductVisible, setAddProductVisible] = useState(true);
    const [viewProductVisible, setViewProductVisible] = useState(true);
    const [editProductVisible, setEditProductVisible] = useState(true);

    const [message, setMessage] = useState('');
    const [alert1, setAlert1] = useState(false);
    const [alertBG, setAlertBG] = useState('');
    const [alertVariant, setAlertVariant] = useState('');

    const [modalTitle, setModalTitle] = useState('');

    //product inputs
    const [prodName, setProdName] = useState('');
    const [i_color, setI_Color] = useState('');
    const [i_price, setI_Price] = useState('');
    const [i_description, setI_Descrition] = useState('');
    const [i_material, setI_Marterial] = useState('');
    const [dimension, setDimension] = useState('');
    const [catId, setCatID] = useState('');
    const [catName, setCatName] = useState('');
    const [dateCreated, setDateCreated] = useState('');

    //category inputs
    const [category_name, setCategory_Name] = useState('');
    const [category_description, setCategory_Description] = useState('');
    const [selectedProductTypeId, setSelectedProductTypeId] = useState('');
    const [selectedProductTypeName, setSelectedProductTypeName] = useState('');

    const [prodId, setProdId] = useState('');

    //arrays
    const [productList, setProductList] = useState([]);
    const [categoryList, setCategorytList] = useState([]);
    const [productTypeList, setProductTypeList] = useState([]);
    const [productSalesList, setProductSalesList] = useState([]);

    // Image upload states
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productImagePath, setProductImagePath] = useState('');
    const [originalProductDetails, setOriginalProductDetails] = useState(null);

    const hasChanges = useMemo(() => {
        if (!originalProductDetails) return true; // Default to allowing save

        const priceNum = i_price ? parseFloat(i_price) : 0;

        if (prodName !== originalProductDetails.prodName) return true;
        if (i_description !== originalProductDetails.i_description) return true;
        if (priceNum !== originalProductDetails.i_price) return true;
        if (selectedProductTypeId !== originalProductDetails.selectedProductTypeId) return true;
        if (selectedFile) return true; // Any new image file is a change

        return false;
    }, [prodName, i_description, i_price, selectedProductTypeId, selectedFile, originalProductDetails]);

    // Image zoom modal states
    const [showImageZoom, setShowImageZoom] = useState(false);
    const [zoomedImageUrl, setZoomedImageUrl] = useState('');

    const handleImageZoom = (imageUrl) => {
        setZoomedImageUrl(imageUrl);
        setShowImageZoom(true);
    };

    const closeImageZoom = () => {
        setShowImageZoom(false);
        setZoomedImageUrl('');
    };

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Keep original dimensions - don't resize unless EXTREMELY large
                    const maxDimension = 4000; // Much higher limit
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = (height / width) * maxDimension;
                            width = maxDimension;
                        } else {
                            width = (width / height) * maxDimension;
                            height = maxDimension;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Try with high quality first (0.95 = 95%)
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                // If still over 10MB, try slightly lower quality
                                if (blob.size > 10 * 1024 * 1024) {
                                    canvas.toBlob(
                                        (blob2) => {
                                            if (blob2) {
                                                const compressedFile = new File([blob2], file.name, {
                                                    type: 'image/jpeg',
                                                    lastModified: Date.now()
                                                });
                                                console.log(`Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                                                resolve(compressedFile);
                                            } else {
                                                reject(new Error('Compression failed'));
                                            }
                                        },
                                        'image/jpeg',
                                        0.92 // Slightly lower quality if needed
                                    );
                                } else {
                                    const compressedFile = new File([blob], file.name, {
                                        type: 'image/jpeg',
                                        lastModified: Date.now()
                                    });
                                    console.log(`Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                                    resolve(compressedFile);
                                }
                            } else {
                                reject(new Error('Compression failed'));
                            }
                        },
                        'image/jpeg',
                        0.95 // Very high quality (95%)
                    );
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check file size
            const fileSizeMB = file.size / 1024 / 1024;
            console.log(`Original file size: ${fileSizeMB.toFixed(2)}MB`);

            // Show preview immediately
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);

            // Only compress if over 9.5MB (Cloudinary limit is 10MB)
            if (fileSizeMB > 9.5) {
                try {
                    const compressedFile = await compressImage(file);
                    setSelectedFile(compressedFile);

                    setMessage(`Image optimized from ${fileSizeMB.toFixed(1)}MB to ${(compressedFile.size / 1024 / 1024).toFixed(1)}MB for upload`);
                    setAlertVariant('info');
                    setAlertBG('#5bc0de');
                    setAlert1(true);
                    setTimeout(() => setAlert1(false), 3000);
                } catch (error) {
                    console.error('Compression error:', error);
                    setSelectedFile(file); // Use original if compression fails
                }
            } else {
                setSelectedFile(file);
            }
        }
    };

    const uploadImage = async () => {
        if (!selectedFile) return null;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            console.log('Upload Response:', result);

            if (response.ok) {
                // Cloudinary returns the secure_url in the path field
                console.log('Cloudinary URL:', result.path);
                return result.path; // This is now a Cloudinary URL
            } else {
                throw new Error(result.error || result.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showAlertError({
                icon: "error",
                title: "Upload Failed!",
                text: 'Failed to upload image: ' + error.message,
                button: 'Try Again'
            });
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    // Sort function for products
    const handleSort = (field) => {
        let direction = 'asc';
        if (sortField === field && sortDirection === 'asc') {
            direction = 'desc';
        }

        setSortField(field);
        setSortDirection(direction);
        setCurrentPage(1);
    };

    // Render sort arrow for products
    const renderSortArrow = (field) => {
        if (sortField !== field) {
            return (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ opacity: 0.3, marginLeft: '5px' }}
                >
                    <path d="m7 14 5-5 5 5" />
                    <path d="m7 10 5 5 5-5" />
                </svg>
            );
        }

        return sortDirection === 'asc' ? (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ marginLeft: '5px' }}
            >
                <path d="m7 14 5-5 5 5" />
            </svg>
        ) : (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ marginLeft: '5px' }}
            >
                <path d="m7 10 5 5 5-5" />
            </svg>
        );
    };

    // Calculate total sales per product
    const productSalesMap = useMemo(() => {
        const salesMap = {};
        if (Array.isArray(productSalesList)) {
            productSalesList.forEach(sale => {
                const productId = sale.product_id;
                if (!salesMap[productId]) {
                    salesMap[productId] = {
                        totalQty: 0,
                        totalRevenue: 0
                    };
                }
                salesMap[productId].totalQty += parseInt(sale.qty) || 0;
                salesMap[productId].totalRevenue += parseFloat(sale.total_price) || 0;
            });
        }
        return salesMap;
    }, [productSalesList]);

    // Helper function to get sales for a product
    const getProductSales = (productId) => {
        return productSalesMap[productId] || { totalQty: 0, totalRevenue: 0 };
    };

    // Filter and sort products
    const filteredAndSortedProducts = useMemo(() => {
        // Ensure productList is an array
        if (!Array.isArray(productList)) {
            return [];
        }

        let filtered = productList.filter(product => {
            // Status filter
            if (statusFilter === 'active' && product.status !== 'Active') {
                return false;
            }
            if (statusFilter === 'inactive' && product.status !== 'Inactive') {
                return false;
            }

            // Category filter
            if (categoryFilter && product.category_name !== categoryFilter) {
                return false;
            }

            // Product type filter
            if (productTypeFilter) {
                const productTypeId = product.product_type_id ? product.product_type_id.toString() : '';
                if (productTypeId !== productTypeFilter) {
                    return false;
                }
            }

            // Search filter (searches in product name, description, and product type)
            if (searchFilter.trim()) {
                const searchTerm = searchFilter.toLowerCase();

                let productTypeName = '';
                if (product.product_type_id && productTypeList) {
                    const typeMatch = productTypeList.find(t => t.product_type_id?.toString() === product.product_type_id?.toString());
                    if (typeMatch && typeMatch.product_type_name) {
                        productTypeName = typeMatch.product_type_name.toLowerCase();
                    }
                }

                return (product.product_name && product.product_name.toLowerCase().includes(searchTerm)) ||
                    (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                    (productTypeName && productTypeName.includes(searchTerm));
            }

            return true;
        });

        // Apply sorting
        if (sortField) {
            filtered = [...filtered].sort((a, b) => {
                let aVal, bVal;

                // Handle sales sorting (by quantity or revenue)
                if (sortField === 'sales_qty') {
                    aVal = productSalesMap[a.product_id]?.totalQty || 0;
                    bVal = productSalesMap[b.product_id]?.totalQty || 0;
                } else if (sortField === 'sales_revenue') {
                    aVal = productSalesMap[a.product_id]?.totalRevenue || 0;
                    bVal = productSalesMap[b.product_id]?.totalRevenue || 0;
                } else if (sortField === 'price') {
                    aVal = parseFloat(a[sortField]) || 0;
                    bVal = parseFloat(b[sortField]) || 0;
                } else if (typeof a[sortField] === 'string' || (b[sortField] && typeof b[sortField] === 'string')) {
                    aVal = (a[sortField] || '').toString().toLowerCase();
                    bVal = (b[sortField] || '').toString().toLowerCase();
                } else {
                    aVal = a[sortField];
                    bVal = b[sortField];
                }

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    const compareResult = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
                    if (sortDirection === 'asc') {
                        // Ascending arrow (↑) = highest to lowest (Z-A)
                        return compareResult === 0 ? 0 : (compareResult < 0 ? 1 : -1);
                    } else {
                        // Descending arrow (↓) = lowest to highest (A-Z)
                        return compareResult === 0 ? 0 : (compareResult > 0 ? 1 : -1);
                    }
                }

                if (aVal === bVal) return 0;

                if (sortDirection === 'asc') {
                    // Ascending arrow (↑) = highest to lowest
                    return aVal < bVal ? 1 : -1;
                } else {
                    // Descending arrow (↓) = lowest to highest
                    return aVal > bVal ? 1 : -1;
                }
            });
        }

        return filtered;
    }, [productList, categoryFilter, productTypeFilter, searchFilter, statusFilter, sortField, sortDirection, productSalesMap, productTypeList]);

    // Pagination for products
    const totalPagesProducts = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);
    const startIndexProducts = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentProductItems = filteredAndSortedProducts.slice(startIndexProducts, startIndexProducts + ITEMS_PER_PAGE);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [categoryFilter, productTypeFilter, searchFilter, statusFilter, sortField, sortDirection]);

    useEffect(() => {
        if (!selectedProductTypeId) {
            return;
        }

        const selectedType = productTypeList.find(
            (type) => type.product_type_id?.toString() === selectedProductTypeId
        );

        if (selectedType) {
            const categoryIdString = selectedType.category_id ? selectedType.category_id.toString() : '';
            const categoryNameValue = getCategoryNameById(categoryIdString);
            const combinedName = `${selectedType.product_type_name || ''}${categoryNameValue ? ` (${categoryNameValue})` : ''}`;

            if (combinedName !== selectedProductTypeName) {
                setSelectedProductTypeName(combinedName);
            }

            if (categoryIdString !== catId) {
                setCatID(categoryIdString);
            }

            if (categoryNameValue !== catName) {
                setCatName(categoryNameValue);
            }
        }
    }, [selectedProductTypeId, productTypeList, categoryList, selectedProductTypeName, catId, catName]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPagesProducts) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        GetProduct();
        GetCategory();
        GetProductTypeList();
        GetProductSale();
    }, []);

    const resetForm = () => {
        setProdName('');
        // setCat('');
        setI_Color('');
        setI_Price('');
        setI_Descrition('');
        setI_Marterial('');
        setDimension('');
        setCategory_Name('');
        setCategory_Description('');
        setModalTitle('');
        setSelectedFile(null);
        setImagePreview('');
        setProductImagePath('');
        setUploadingImage(false);
        setSelectedProductTypeId('');
        setSelectedProductTypeName('');
        setCatID('');
        setCatName('');
    };

    const clearProductFilters = () => {
        setCategoryFilter('');
        setProductTypeFilter('');
        setSearchFilter('');
        setStatusFilter('all');
        setSortField('');
        setSortDirection('asc');
    };

    const removeProductFilter = (filterType) => {
        switch (filterType) {
            case 'category':
                setCategoryFilter('');
                break;
            case 'productType':
                setProductTypeFilter('');
                break;
            case 'search':
                setSearchFilter('');
                break;
            case 'status':
                setStatusFilter('all');
                break;
        }
    };

    const GetProduct = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetProduct2"
                }
            });

            console.log('📦 Products fetched:', response.data);

            // Ensure response.data is an array
            if (Array.isArray(response.data)) {
                console.log('✅ Valid array with', response.data.length, 'products');

                // Log first product's image URL for debugging
                if (response.data.length > 0) {
                    const firstProduct = response.data[0];
                    console.log('First product image URL:', firstProduct.product_preview_image);
                    console.log('First product status:', firstProduct.status);
                    console.log('getImageUrl result:', getImageUrl(firstProduct.product_preview_image));
                }

                setProductList(response.data);
            } else {
                console.error('❌ Response is not an array:', typeof response.data);
                setProductList([]);
            }
        } catch (error) {
            console.error("Error fetching product list:", error);
            setProductList([]);
        }
    }

    const GetProductSale = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetProductsSales"
                }
            });

            console.log('📦 Products Sales fetched:', response.data);
            console.log('📦 Products Sales type:', typeof response.data);

            let salesData = response.data;

            // If response is a string, try to parse it as JSON
            if (typeof salesData === 'string') {
                try {
                    salesData = JSON.parse(salesData);
                    console.log('✅ Parsed JSON string, result:', salesData);
                } catch (parseError) {
                    console.error('❌ Failed to parse JSON string:', parseError);
                    // If it's not valid JSON and contains error messages, handle it
                    if (salesData.toLowerOase().includes('error') ||
                        salesData.toLowerCase().includes('failed') ||
                        salesData.toLowerCase().includes('success') && !salesData.includes('[')) {
                        console.warn('⚠️ API returned message:', salesData);
                        setProductSalesList([]);
                        return;
                    }
                    setProductSalesList([]);
                    return;
                }
            }

            // Ensure salesData is an array
            if (Array.isArray(salesData)) {
                console.log('✅ Valid array with', salesData.length, 'product sales');

                // Log first sale for debugging
                if (salesData.length > 0) {
                    const firstSale = salesData[0];
                    console.log('First sale:', firstSale);
                }

                setProductSalesList(salesData);
            } else {
                console.error('❌ Response is not an array:', typeof salesData, salesData);
                setProductSalesList([]);
            }
        } catch (error) {
            console.error("Error fetching product sales:", error);
            setProductSalesList([]);
        }
    }

    const GetCategory = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetCategory"
                }
            });

            setCategorytList(response.data);
        } catch (error) {
            console.error("Error fetching category list:", error);
        }
    }

    const GetProductTypeList = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetProductTypes"
                }
            });

            let typesData = response.data;
            if (typeof typesData === 'string') {
                try {
                    typesData = JSON.parse(typesData);
                } catch (parseError) {
                    console.warn('Failed to parse product type list JSON:', parseError);
                }
            }

            const validTypes = Array.isArray(typesData)
                ? typesData.filter(type => type && type.product_type_id && type.product_type_name)
                : [];

            setProductTypeList(validTypes);

            if (!Array.isArray(typesData)) {
                console.warn('GetProductTypes response is not an array', response.data);
            }
        } catch (error) {
            console.error("Error fetching product type list:", error);
            setProductTypeList([]);
        }
    }

    const getCategoryNameById = (categoryId) => {
        if (!categoryId) return '';
        const match = categoryList.find(
            (category) => category.category_id?.toString() === categoryId.toString()
        );
        return match ? match.category_name : '';
    };

    const AddProduct = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const productTypeIdValue = selectedProductTypeId ? parseInt(selectedProductTypeId, 10) : null;
        const categoryIdValue = catId ? parseInt(catId, 10) : null;

        if (
            !prodName?.trim() ||
            !productTypeIdValue ||
            !categoryIdValue ||
            !i_price?.toString().trim() ||
            !i_description?.trim()
        ) {
            setMessage("Please fill in all needed details!");
            setAlertVariant('danger');
            setAlertBG('#dc7a80');
            setAlert1(true);

            setTimeout(() => {
                setAlert1(false);
            }, 3000);
            setIsSubmitting(false);
            return;
        }

        // Check for duplicate product name
        const isDuplicateName = productList.some(
            product => product.product_name?.toLowerCase() === prodName.trim().toLowerCase()
        );

        if (isDuplicateName) {
            showAlertError({
                icon: "warning",
                title: "Duplicate Name",
                text: 'This product code/name already exists in the database. Please use a unique name.',
                button: 'Got it'
            });
            setIsSubmitting(false);
            return;
        }

        try {
            // Upload image first if one is selected
            let imagePath = '/uploads/products/defualt.jpg'; // Default local placeholder (matches your filename)
            if (selectedFile) {
                imagePath = await uploadImage();
                console.log('Image path after upload:', imagePath);
                if (!imagePath) {
                    setIsSubmitting(false);
                    return; // Upload failed, don't proceed
                }
            } else {
                console.log('No image selected, using default:', imagePath);
            }

            const baseURL = sessionStorage.getItem('baseURL');
            const url = baseURL + 'products.php';
            const productDetails = {
                prodName: prodName,
                category: categoryIdValue,
                product_type_id: productTypeIdValue,
                description: i_description,
                dimension: dimension,
                material: i_material,
                color: i_color,
                price: i_price,
                product_preview_image: imagePath
            }

            console.log('Product details being sent to database:', productDetails);

            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(productDetails),
                    operation: "AddProduct"
                }
            });

            if (response.data === 'Success') {
                console.log('✅ Product saved successfully! Refreshing product list...');
                GetProduct();
                resetForm();
                close_modal();
                AlertSucces(
                    "New product is successfully added!",
                    "success",
                    true,
                    'Okay'
                );

                // Log for debugging: Check if image shows after refresh
                setTimeout(() => {
                    console.log('Product list refreshed. Check if image is visible.');
                }, 1000);
            } else {
                showAlertError({
                    icon: "error",
                    title: "Opss!",
                    text: 'Failed to add new product.',
                    button: 'Try Again'
                });
            }

        } catch (error) {
            console.error("Error adding product:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const close_modal = () => {
        handleClose();
        setAddProductVisible(true);
        setViewProductVisible(true);
        setEditProductVisible(true);
        setOriginalProductDetails(null);
        resetForm();
    }

    const GetProductDetail = async (operation, id) => {
        setProdId(id);

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        const productId = {
            product_id: id
        }
        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(productId),
                    operation: "ViewProductDetails"
                }
            });

            let productData = response.data;
            if (typeof productData === 'string') {
                try {
                    productData = JSON.parse(productData);
                } catch (parseError) {
                    console.error("Failed to parse product detail response:", parseError, productData);
                    productData = [];
                }
            }

            if (!Array.isArray(productData) || productData.length === 0) {
                console.warn("No product detail returned for ID:", id);
                return;
            }

            const product = productData[0];
            setProdName(product.product_name ?? '');
            setI_Descrition(product.description ?? '');
            setI_Marterial(product.material ?? '');
            setI_Color(product.color ?? '');
            setI_Price(product.price ? parseFloat(product.price) : 0);
            setDimension(product.dimensions ?? '');
            setCatID(product.category_id ?? '');
            setCatName(product.category_name ?? '');
            setSelectedProductTypeId(product.product_type_id ? product.product_type_id.toString() : '');
            setSelectedProductTypeName(product.product_type_name ?? '');
            setProdId(product.product_id ?? '');
            setDateCreated(product.date_created ?? '');

            // FIXED: Set the product image path
            setProductImagePath(product.product_preview_image || 'Nothing as for now');

            // Snapshot for hasChanges validation
            setOriginalProductDetails({
                prodName: product.product_name ?? '',
                i_description: product.description ?? '',
                i_price: product.price ? parseFloat(product.price) : 0,
                selectedProductTypeId: product.product_type_id ? product.product_type_id.toString() : ''
            });

        } catch (error) {
            console.error("Error fetching product details:", error);
        }
        return;
    }

    const UpdateProduct = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Upload new image if one is selected
            let imagePath = productImagePath || '/uploads/products/defualt.jpg'; // Use default if no existing image
            if (selectedFile) {
                const newImagePath = await uploadImage();
                if (newImagePath) {
                    imagePath = newImagePath;
                } else {
                    setIsSubmitting(false);
                    return;
                }
            }

            const productTypeIdValue = selectedProductTypeId ? parseInt(selectedProductTypeId, 10) : null;
            const categoryIdValue = catId ? parseInt(catId, 10) : null;

            if (!prodName?.trim() || !productTypeIdValue || !categoryIdValue || !i_price?.toString().trim() || !i_description?.trim()) {
                showAlertError({
                    icon: "warning",
                    title: "Incomplete Product Details",
                    text: 'Please provide name, product type, category, price, and description before saving.',
                    button: 'Got it'
                });
                setIsSubmitting(false);
                return;
            }

            // Check for duplicate product name (exclude current product)
            const isDuplicateName = productList.some(
                product =>
                    product.product_name?.toLowerCase() === prodName.trim().toLowerCase() &&
                    product.product_id?.toString() !== prodId?.toString()
            );

            if (isDuplicateName) {
                showAlertError({
                    icon: "warning",
                    title: "Duplicate Name",
                    text: 'This product code/name already exists in the database. Please use a unique name.',
                    button: 'Got it'
                });
                setIsSubmitting(false);
                return;
            }

            const baseURL = sessionStorage.getItem('baseURL');
            const url = baseURL + 'products.php';
            const productDetails = {
                prodName: prodName,
                category: categoryIdValue,
                product_type_id: productTypeIdValue,
                description: i_description,
                dimension: dimension,
                material: i_material,
                color: i_color,
                price: i_price,
                product_preview_image: imagePath,
                catID: categoryIdValue,
                prodId: prodId
            }

            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(productDetails),
                    operation: "UpdateProduct"
                }
            });

            if (response.data === 'Success') {
                GetProduct();
                resetForm();
                close_modal();

                AlertSucces(
                    "Product details is successfully updated!",
                    "success",
                    true,
                    'Okay'
                );

            } else {
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: 'Failed to update product details!',
                    button: 'Try Again'
                });
            }

        } catch (error) {
            console.error("Error updating product:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const ToggleProductStatus = async (productId, currentStatus) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

        const statusData = {
            prodId: productId,
            status: newStatus
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(statusData),
                    operation: "UpdateProductStatus"
                }
            });

            if (response.data === 'Success') {
                GetProduct();

                AlertSucces(
                    `Product ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully!`,
                    "success",
                    true,
                    'Okay'
                );
            } else {
                showAlertError({
                    icon: "error",
                    title: "Failed!",
                    text: 'Failed to update product status!',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error toggling product status:", error);
            showAlertError({
                icon: "error",
                title: "Error!",
                text: 'An error occurred while updating product status',
                button: 'OK'
            });
        }
    };

    const handleProductTypeChange = (productTypeId) => {
        setSelectedProductTypeId(productTypeId);

        const selectedType = productTypeList.find(
            (type) => type.product_type_id?.toString() === productTypeId
        );

        if (selectedType) {
            setSelectedProductTypeName(selectedType.product_type_name || '');
            const categoryIdString = selectedType.category_id ? selectedType.category_id.toString() : '';
            setCatID(categoryIdString);

            const categoryNameValue = getCategoryNameById(categoryIdString);
            setCatName(categoryNameValue);
        } else {
            setCatID('');
            setCatName('');
            setSelectedProductTypeName('');
        }
    };

    const triggerModal = (operation, id, e) => {
        switch (operation) {
            case 'addProduct':
                setAddProductVisible(false);
                break;
            case 'viewProduct':
                GetProductDetail(operation, id);
                setViewProductVisible(false);
                break;
            case 'editProduct':
                GetProductDetail(operation, id);
                setEditProductVisible(false);
                break;
        }
    }

    return (
        <>
            {/* Alert for actions */}
            <Alert
                variant={alertVariant}
                className='alert-inventory'
                show={alert1}
                style={{ backgroundColor: alertBG }}
            >
                {message}
            </Alert>

            {/* Modal for alerts */}
            <Modal show={show} onHide={handleClose} size='sm'>
                <Modal.Header closeButton >
                    <Modal.Title >{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body >
                    {message}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Product Modal */}
            <CustomModal
                show={!editProductVisible}
                onHide={close_modal}
                title="Product Details"
                size="lg"
                bodyClassName="modal-add-product-body"
                primaryButtonText="Save Changes"
                onPrimaryAction={UpdateProduct}
                isSubmitting={isSubmitting}
                disablePrimary={!hasChanges}
            >

                <div className='div-input-add-prod' style={{ paddingBottom: '20px' }}>
                    <CustomInput
                        label="Product ID"
                        value={prodId}
                        readOnly
                    />
                </div>

                <div className='div-input-add-prod'>
                    <label className='add-prod-label'>Product Name/Code & Type</label>
                    <SegmentedInput
                        position="right"
                        options={productTypeList.map(type => ({
                            label: `${type.product_type_name}${getCategoryNameById(type.category_id) ? ` (${getCategoryNameById(type.category_id)})` : ''}`,
                            value: type.product_type_id
                        }))}
                        selectedLabel={selectedProductTypeName || 'Select Product Type'}
                        onOptionSelect={(value, option) => {
                            setSelectedProductTypeId(value ? value.toString() : '');
                            // If the dropdown has a combined label (e.g., "Appliance (Appliance)"), show it instantly
                            setSelectedProductTypeName(option.label);
                        }}
                        inputValue={prodName}
                        onInputChange={(e) => setProdName(e.target.value)}
                        placeholder="Enter Product Code"
                        className="mb-3"
                    />
                </div>

                <div className='div-input-add-prod'>
                    <CustomInput
                        label="Category"
                        value={catName ?? ''}
                        readOnly
                        placeholder="Auto-filled based on product type"
                    />
                </div>

                <div className='div-input-add-prod'>
                    <CustomInput
                        label="Price ₱"
                        type="number"
                        step="0.01"
                        value={i_price}
                        onChange={e => setI_Price(e.target.value)}
                        onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                                setI_Price(val.toFixed(2));
                            }
                        }}
                    />
                </div>

                <div className='div-input-add-prod'>
                    <CustomInput
                        label="Description"
                        type="textarea"
                        maxLength={250}
                        value={i_description}
                        onChange={(e) => setI_Descrition(e.target.value)}
                        style={{ height: '100px' }}
                    />
                    <div style={{ textAlign: 'right', fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                        {i_description?.length || 0}/250
                    </div>
                </div>

                <div className='div-input-add-prod'>
                    <CustomInput
                        label="Date Created"
                        value={(() => {
                            if (!dateCreated) return '';
                            // Handle both YYYY-MM-DD and YYYY-MM-DD HH:mm:ss formats safely
                            const dateStr = dateCreated.split(' ')[0];
                            const parts = dateStr.split('-');
                            if (parts.length === 3) {
                                const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                                return `${months[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}, ${parts[0]}`;
                            }
                            return dateCreated;
                        })()}
                        readOnly
                    />
                </div>

                <div className='div-input-add-prod'>
                    <CustomInput
                        label="Preview Image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={uploadingImage}
                    />
                    {/* Show current image if exists */}
                    {!imagePreview && getImageUrl(productImagePath) && (
                        <div style={{ marginTop: '10px' }}>
                            <img
                                src={getImageUrl(productImagePath)}
                                alt="Current"
                                style={{
                                    // maxWidth: '200px',
                                    width: '100%',
                                    maxHeight: '400px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd'
                                }}
                            />
                            {/* <p style={{ fontSize: '12px', color: '#666' }}>Current image</p> */}
                        </div>
                    )}
                    {/* Show new preview if selected */}
                    {imagePreview && (
                        <div style={{ marginTop: '10px' }}>
                            <img
                                src={imagePreview}
                                alt="New Preview"
                                style={{
                                    width: '100%',
                                    maxHeight: '400px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd'
                                }}
                            />
                            <p style={{ fontSize: '12px', color: '#666' }}>New image preview</p>
                        </div>
                    )}
                    {uploadingImage && (
                        <div style={{ marginTop: '10px', color: '#007bff' }}>
                            Uploading image...
                        </div>
                    )}
                </div>
            </CustomModal>

            {/* Add Product Modal */}
            <CustomModal
                show={!addProductVisible}
                onHide={close_modal}
                title="ADD PRODUCT"
                size="lg"
                bodyClassName="modal-add-product-body"
                primaryButtonText="Save"
                onPrimaryAction={AddProduct}
                isSubmitting={isSubmitting}
            >
                <div className='div-input-add-prod'>
                    <label className='add-prod-label'>Product Name/Code & Type</label>
                    <SegmentedInput
                        position="right"
                        options={productTypeList.map(type => ({
                            label: `${type.product_type_name}${getCategoryNameById(type.category_id) ? ` (${getCategoryNameById(type.category_id)})` : ''}`,
                            value: type.product_type_id
                        }))}
                        selectedLabel={selectedProductTypeName || 'Select Product Type'}
                        onOptionSelect={(value, option) => {
                            setSelectedProductTypeId(value ? value.toString() : '');
                            // If the dropdown has a combined label (e.g., "Appliance (Appliance)"), show it instantly
                            setSelectedProductTypeName(option.label);
                        }}
                        inputValue={prodName}
                        onInputChange={(e) => setProdName(e.target.value)}
                        placeholder="Enter Product Code"
                        className="mb-3"
                    />
                </div>

                <div className='div-input-add-prod'>
                    <CustomInput
                        label="Category"
                        value={catName ?? ''}
                        readOnly
                        placeholder="Auto-filled based on product type"
                    />
                </div>

                <div className='div-input-add-prod'>
                    <CustomInput
                        label="Price ₱"
                        type="number"
                        step="0.01"
                        value={i_price}
                        onChange={e => setI_Price(e.target.value)}
                        onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                                setI_Price(val.toFixed(2));
                            }
                        }}
                    />
                </div>

                <div className='div-input-add-prod'>
                    <CustomInput
                        label="Description"
                        type="textarea"
                        maxLength={250}
                        value={i_description}
                        onChange={(e) => setI_Descrition(e.target.value)}
                        style={{ height: '100px' }}
                    // showCharacterCount
                    />
                    <div style={{ textAlign: 'right', fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                        {i_description?.length || 0}/250
                    </div>
                </div>



                <div className='div-input-add-prod'>
                    <CustomInput
                        label="Preview Image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={uploadingImage}
                    />
                    {imagePreview && (
                        <div style={{ marginTop: '10px' }}>
                            <img
                                src={imagePreview}
                                alt="Preview"
                                style={{
                                    // maxWidth: '200px',
                                    width: '100%',
                                    maxHeight: '400px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd'
                                }}
                            />
                        </div>
                    )}
                    {uploadingImage && (
                        <div style={{ marginTop: '10px', color: '#007bff' }}>
                            Uploading image...
                        </div>
                    )}
                </div>
            </CustomModal>

            {/* Image Zoom Modal */}
            <Modal
                show={showImageZoom}
                onHide={closeImageZoom}
                size='xl'
                centered
                style={{ zIndex: 2000 }}
            >
                <Modal.Header closeButton style={{ border: 'none', paddingBottom: 0 }}>
                    <Modal.Title>Product Image</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#000',
                    minHeight: '70vh'
                }}>
                    {zoomedImageUrl && (
                        <img
                            src={zoomedImageUrl}
                            alt="Zoomed Product"
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '80vh',
                                objectFit: 'contain',
                                borderRadius: '8px'
                            }}
                            onClick={closeImageZoom}
                        />
                    )}
                </Modal.Body>
                <Modal.Footer style={{
                    border: 'none',
                    justifyContent: 'center',
                    backgroundColor: '#000',
                    paddingTop: 0
                }}>
                    <div style={{
                        color: '#fff',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        💡 Click image or close button to exit
                    </div>
                </Modal.Footer>
            </Modal>

            <div className='customer-main'>
                <div className='customer-header'>
                    <div className='h-customer'>
                        <h1 className='h-customer'>PRODUCT MANAGEMENT</h1>
                    </div>
                    <div>
                        {/* <button className='add-cust-bttn' onClick={(e) => triggerModal('addProduct', '0', e)}>ADD PRODUCT+</button> */}
                        <Button variant="primary" onClick={(e) => triggerModal('addProduct', '0', e)}>ADD PRODUCT+</Button>
                    </div>
                </div>

                {/* Product Filters */}
                <div style={{
                    padding: '15px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    margin: '10px 0',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px',
                        alignItems: 'end'
                    }}>
                        {/* Status Filter */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Filter by Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="all">All Products</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Filter by Category
                            </label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Categories</option>
                                {categoryList.map((category) => (
                                    <option key={category.category_id} value={category.category_name}>
                                        {category.category_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Product Type Filter */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Filter by Product Type
                            </label>
                            <select
                                value={productTypeFilter}
                                onChange={(e) => setProductTypeFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">All Product Types</option>
                                {productTypeList.map((type) => {
                                    const categoryName = getCategoryNameById(type.category_id);
                                    return (
                                        <option key={type.product_type_id} value={type.product_type_id}>
                                            {type.product_type_name}{categoryName ? ` (${categoryName})` : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Search Filter */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Search Products
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 1,
                                    color: '#6c757d'
                                }}>
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.35-4.35" />
                                    </svg>
                                </div>

                                <input
                                    type="text"
                                    placeholder="Search by name or description..."
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px 8px 35px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />

                                {searchFilter && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchFilter('')}
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: '#6c757d',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title="Clear search"
                                    >
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>



                {/* Product Active Filters */}
                <div style={{
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    margin: '10px 0',
                    fontSize: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <strong>Active Filters:</strong>

                        {statusFilter !== 'all' && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '16px',
                                fontSize: '13px',
                                border: '1px solid #dee2e6'
                            }}>
                                Status: {statusFilter === 'active' ? 'Active' : 'Inactive'}
                                <button
                                    type="button"
                                    onClick={() => removeProductFilter('status')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#6c757d',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '18px',
                                        height: '18px',
                                        marginLeft: '4px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#dc3545';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#6c757d';
                                    }}
                                    title="Remove status filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {categoryFilter && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '16px',
                                fontSize: '13px',
                                border: '1px solid #dee2e6'
                            }}>
                                Category: {categoryFilter}
                                <button
                                    type="button"
                                    onClick={() => removeProductFilter('category')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#6c757d',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '18px',
                                        height: '18px',
                                        marginLeft: '4px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#dc3545';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#6c757d';
                                    }}
                                    title="Remove category filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {productTypeFilter && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '16px',
                                fontSize: '13px',
                                border: '1px solid #dee2e6'
                            }}>
                                Product Type: {productTypeList.find((t) => t.product_type_id?.toString() === productTypeFilter)?.product_type_name || productTypeFilter}
                                <button
                                    type="button"
                                    onClick={() => removeProductFilter('productType')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#6c757d',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '18px',
                                        height: '18px',
                                        marginLeft: '4px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#dc3545';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#6c757d';
                                    }}
                                    title="Remove product type filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {searchFilter && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '16px',
                                fontSize: '13px',
                                border: '1px solid #dee2e6'
                            }}>
                                Search: "{searchFilter}"
                                <button
                                    type="button"
                                    onClick={() => removeProductFilter('search')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#6c757d',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '18px',
                                        height: '18px',
                                        marginLeft: '4px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#dc3545';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#6c757d';
                                    }}
                                    title="Remove search filter"
                                >
                                    ×
                                </button>
                            </span>
                        )}

                        {!categoryFilter && !productTypeFilter && !searchFilter && statusFilter === 'all' && (
                            <span style={{ color: '#6c757d' }}>None</span>
                        )}

                        <span style={{ marginLeft: '10px', color: '#6c757d' }}>
                            ({filteredAndSortedProducts.length} of {productList.length} products shown)
                        </span>
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={clearProductFilters}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#6c757d",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "14px"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#5a6268';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#6c757d';
                            }}
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>


                {/* Products Grid - Replace the table container section */}
                <div className='products-grid-container' style={{
                    padding: '20px 0',
                    minHeight: '40vh'
                }}>
                    {currentProductItems && currentProductItems.length > 0 ? (
                        <>
                            {/* Grid Header with Sort Options */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '20px',
                                padding: '0 10px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    flexWrap: 'wrap'
                                }}>
                                    <span style={{
                                        fontWeight: '600',
                                        color: '#495057',
                                        fontSize: '16px'
                                    }}>
                                        Sort by:
                                    </span>

                                    <button
                                        onClick={() => handleSort('product_name')}
                                        style={{
                                            padding: '6px 12px',
                                            border: sortField === 'product_name' ? '2px solid #007bff' : '1px solid #ced4da',
                                            backgroundColor: sortField === 'product_name' ? '#e7f3ff' : 'white',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        Name {sortField === 'product_name' && renderSortArrow('product_name')}
                                    </button>

                                    <button
                                        onClick={() => handleSort('price')}
                                        style={{
                                            padding: '6px 12px',
                                            border: sortField === 'price' ? '2px solid #007bff' : '1px solid #ced4da',
                                            backgroundColor: sortField === 'price' ? '#e7f3ff' : 'white',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        Price {sortField === 'price' && renderSortArrow('price')}
                                    </button>

                                    <button
                                        onClick={() => handleSort('category_name')}
                                        style={{
                                            padding: '6px 12px',
                                            border: sortField === 'category_name' ? '2px solid #007bff' : '1px solid #ced4da',
                                            backgroundColor: sortField === 'category_name' ? '#e7f3ff' : 'white',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        Category {sortField === 'category_name' && renderSortArrow('category_name')}
                                    </button>

                                    <button
                                        onClick={() => handleSort('sales_qty')}
                                        style={{
                                            padding: '6px 12px',
                                            border: sortField === 'sales_qty' ? '2px solid #28a745' : '1px solid #ced4da',
                                            backgroundColor: sortField === 'sales_qty' ? '#e8f5e9' : 'white',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        Sales (Qty) {sortField === 'sales_qty' && renderSortArrow('sales_qty')}
                                    </button>

                                    <button
                                        onClick={() => handleSort('sales_revenue')}
                                        style={{
                                            padding: '6px 12px',
                                            border: sortField === 'sales_revenue' ? '2px solid #ffc107' : '1px solid #ced4da',
                                            backgroundColor: sortField === 'sales_revenue' ? '#fff8e1' : 'white',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        Revenue {sortField === 'sales_revenue' && renderSortArrow('sales_revenue')}
                                    </button>
                                </div>

                                <div style={{
                                    fontSize: '14px',
                                    color: '#6c757d',
                                    fontWeight: '500'
                                }}>
                                    Showing {currentProductItems.length} of {filteredAndSortedProducts.length} products
                                </div>
                            </div>

                            {/* Products Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                                gap: '20px',
                                padding: '0 10px'
                            }}>
                                {currentProductItems.map((product, index) => (
                                    <div
                                        key={index}
                                        onClick={(e) => triggerModal('editProduct', product.product_id, e)}
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                            border: '1px solid #e9ecef',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            position: 'relative'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                                        }}
                                    >
                                        {/* Product Image */}
                                        <div style={{
                                            height: '200px',
                                            backgroundColor: '#f8f9fa',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            {getImageUrl(product.product_preview_image) ? (
                                                <img
                                                    src={getImageUrl(product.product_preview_image)}
                                                    alt={product.product_name}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#6c757d',
                                                    fontSize: '14px'
                                                }}>
                                                    <div style={{ fontSize: '48px', marginBottom: '10px', opacity: 0.3 }}>
                                                        📦
                                                    </div>
                                                    <span>No Image</span>
                                                </div>
                                            )}

                                            {/* Category Badge */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '10px',
                                                left: '10px',
                                                backgroundColor: '#007bff',
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '500'
                                            }}>
                                                {product.category_name}
                                            </div>

                                            {/* Status Badge */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '45px',
                                                left: '10px',
                                                backgroundColor: product.status === 'Active' ? '#28a745' : '#dc3545',
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                <span style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    backgroundColor: 'white',
                                                    borderRadius: '50%',
                                                    display: 'inline-block'
                                                }}></span>
                                                {product.status || 'Active'}
                                            </div>

                                            {/* Zoom Icon Button */}
                                            {getImageUrl(product.product_preview_image) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleImageZoom(getImageUrl(product.product_preview_image));
                                                    }}
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: '10px',
                                                        right: '10px',
                                                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '40px',
                                                        height: '40px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        fontSize: '18px',
                                                        transition: 'all 0.2s ease',
                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.9)';
                                                        e.currentTarget.style.transform = 'scale(1.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                    }}
                                                    title="View full image"
                                                >
                                                    🔍
                                                </button>
                                            )}

                                            {/* Action Buttons Container */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                display: 'flex',
                                                gap: '8px'
                                            }}>
                                                {/* Toggle Status Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        ToggleProductStatus(product.product_id, product.status || 'Active');
                                                    }}
                                                    style={{
                                                        backgroundColor: product.status === 'Active' ? 'rgba(220, 53, 69, 0.9)' : 'rgba(40, 167, 69, 0.9)',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '36px',
                                                        height: '36px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        fontSize: '16px',
                                                        transition: 'all 0.2s ease',
                                                        color: 'white',
                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                    }}
                                                    title={product.status === 'Active' ? 'Deactivate Product' : 'Activate Product'}
                                                >
                                                    {product.status === 'Active' ? '🚫' : '✅'}
                                                </button>

                                                {/* Edit Action Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        triggerModal('editProduct', product.product_id, e);
                                                    }}
                                                    style={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '36px',
                                                        height: '36px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        fontSize: '16px',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#007bff';
                                                        e.currentTarget.style.color = 'white';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                                                        e.currentTarget.style.color = 'black';
                                                    }}
                                                    title="Edit Product"
                                                >
                                                    ✏️
                                                </button>
                                            </div>
                                        </div>

                                        {/* Product Information */}
                                        <div style={{
                                            padding: '20px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: 'calc(100% - 200px)'
                                        }}>
                                            <div style={{ flex: '1' }}>
                                                {/* Product Name */}
                                                <h3 style={{
                                                    margin: '0 0 10px 0',
                                                    fontSize: '18px',
                                                    fontWeight: '600',
                                                    color: '#212529',
                                                    lineHeight: '1.4'
                                                }}>
                                                    {product.product_name}
                                                </h3>
                                                {product.product_type_name && (
                                                    <div style={{
                                                        marginBottom: '10px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        color: '#3b5bcc',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '4px 10px',
                                                        backgroundColor: '#eef2ff',
                                                        borderRadius: '999px'
                                                    }}>
                                                        🪑 {product.product_type_name}
                                                    </div>
                                                )}

                                                {/* Product Description */}
                                                <p style={{
                                                    margin: '0 0 15px 0',
                                                    fontSize: '14px',
                                                    color: '#6c757d',
                                                    lineHeight: '1.5',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {product.description}
                                                </p>

                                                {/* Product Details Grid */}
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: '10px',
                                                    marginBottom: '15px'
                                                }}>
                                                    {/* <div>
                                                        <span style={{
                                                            fontSize: '12px',
                                                            color: '#6c757d',
                                                            fontWeight: '500',
                                                            display: 'block'
                                                        }}>
                                                            Color
                                                        </span>
                                                        <span style={{
                                                            fontSize: '14px',
                                                            color: '#495057',
                                                            fontWeight: '500'
                                                        }}>
                                                            {product.color}
                                                        </span>
                                                    </div> */}

                                                    {/* <div>
                                                        <span style={{
                                                            fontSize: '12px',
                                                            color: '#6c757d',
                                                            fontWeight: '500',
                                                            display: 'block'
                                                        }}>
                                                            Material
                                                        </span>
                                                        <span style={{
                                                            fontSize: '14px',
                                                            color: '#495057',
                                                            fontWeight: '500'
                                                        }}>
                                                            {product.material}
                                                        </span>
                                                    </div> */}
                                                </div>

                                                {/* Dimensions */}
                                                {/* <div style={{ marginBottom: '15px' }}>
                                                    <span style={{
                                                        fontSize: '12px',
                                                        color: '#6c757d',
                                                        fontWeight: '500',
                                                        display: 'block'
                                                    }}>
                                                        Dimensions
                                                    </span>
                                                    <span style={{
                                                        fontSize: '14px',
                                                        color: '#495057',
                                                        fontWeight: '500'
                                                    }}>
                                                        {product.dimensions}
                                                    </span>
                                                </div> */}
                                            </div>

                                            {/* Price and Sales - Fixed at bottom */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: '10px',
                                                paddingTop: '15px',
                                                borderTop: '1px solid #e9ecef',
                                                marginTop: 'auto'
                                            }}>
                                                <div>
                                                    <span style={{
                                                        fontSize: '12px',
                                                        color: '#6c757d',
                                                        fontWeight: '500',
                                                        display: 'block',
                                                        marginBottom: '4px'
                                                    }}>
                                                        Price
                                                    </span>
                                                    <span style={{
                                                        fontSize: '18px',
                                                        color: '#28a745',
                                                        fontWeight: '700'
                                                    }}>
                                                        ₱{parseFloat(product.price || 0).toLocaleString('en-US', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span style={{
                                                        fontSize: '12px',
                                                        color: '#6c757d',
                                                        fontWeight: '500',
                                                        display: 'block',
                                                        marginBottom: '4px'
                                                    }}>
                                                        Total Sales
                                                    </span>
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '2px'
                                                    }}>
                                                        <span style={{
                                                            fontSize: '18px',
                                                            color: '#495057',
                                                            fontWeight: '700'
                                                        }}>
                                                            {getProductSales(product.product_id).totalQty} {getProductSales(product.product_id).totalQty === 1 ? 'unit' : 'units'}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '12px',
                                                            color: '#28a745',
                                                            fontWeight: '500'
                                                        }}>
                                                            ₱{getProductSales(product.product_id).totalRevenue.toLocaleString('en-US', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            textAlign: 'center',
                            color: '#6c757d',
                            padding: '60px 20px',
                            minHeight: '400px'
                        }}>
                            <div style={{
                                fontSize: '64px',
                                marginBottom: '24px',
                                opacity: 0.3
                            }}>
                                📦
                            </div>
                            <h3 style={{
                                color: '#495057',
                                marginBottom: '12px',
                                fontWeight: '600',
                                fontSize: '24px'
                            }}>
                                {productList.length === 0 ? 'No products available' : 'No products match the current filters'}
                            </h3>
                            <p style={{
                                margin: '0',
                                fontSize: '16px',
                                maxWidth: '400px',
                                lineHeight: '1.5',
                                color: '#6c757d'
                            }}>
                                {productList.length === 0
                                    ? 'Start by adding your first product using the "ADD PRODUCT+" button above.'
                                    : 'Try adjusting your filters or search terms to see more products.'
                                }
                            </p>
                            {productList.length === 0 && (
                                <button
                                    onClick={(e) => triggerModal('addProduct', '0', e)}
                                    style={{
                                        marginTop: '20px',
                                        padding: '12px 24px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#0056b3';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#007bff';
                                    }}
                                >
                                    Add Your First Product
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination for Products */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '20px'
                }}>
                    <CustomPagination
                        currentPage={currentPage}
                        totalPages={totalPagesProducts}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </>
    );
};

export default ProductsAdmin;