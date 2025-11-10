'use client';
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';
import "../../css/products.css";

const ITEMS_PER_PAGE = 8;

const ProductTypeAdmin = () => {
    const [addProductTypeVisible, setAddProductTypeVisible] = useState(true);
    const [viewProductTypeVisible, setViewProductTypeVisible] = useState(true);
    const [editProductTypeVisible, setEditProductTypeVisible] = useState(true);
    const [showQuickCategoryModal, setShowQuickCategoryModal] = useState(true);

    const [productTypeSearchFilter, setProductTypeSearchFilter] = useState('');
    const [productTypeCategoryFilter, setProductTypeCategoryFilter] = useState('');
    const [currentPageProductType, setCurrentPageProductType] = useState(1);

    const [productTypeName, setProductTypeName] = useState('');
    const [productTypeId, setProductTypeId] = useState('');
    const [productTypeCategoryId, setProductTypeCategoryId] = useState('');

    const [quickCategoryName, setQuickCategoryName] = useState('');
    const [quickCategoryDescription, setQuickCategoryDescription] = useState('');

    const [productTypeList, setProductTypeList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [productList, setProductList] = useState([]);

    const filteredProductTypes = useMemo(() => {
        return productTypeList.filter(type => {
            if (productTypeCategoryFilter && type.category_id?.toString() !== productTypeCategoryFilter) {
                return false;
            }

            if (productTypeSearchFilter.trim()) {
                const searchTerm = productTypeSearchFilter.toLowerCase();
                const categoryName = getCategoryName(type.category_id)?.toLowerCase() || '';
                return type.product_type_name.toLowerCase().includes(searchTerm) ||
                    categoryName.includes(searchTerm);
            }
            return true;
        });
    }, [productTypeList, productTypeSearchFilter, productTypeCategoryFilter, categoryList]);

    const totalPagesProductTypes = Math.ceil(filteredProductTypes.length / ITEMS_PER_PAGE) || 1;
    const startIndexProductTypes = (currentPageProductType - 1) * ITEMS_PER_PAGE;
    const currentProductTypeItems = filteredProductTypes.slice(startIndexProductTypes, startIndexProductTypes + ITEMS_PER_PAGE);

    useEffect(() => {
        setCurrentPageProductType(1);
    }, [productTypeSearchFilter, productTypeCategoryFilter]);

    useEffect(() => {
        GetProductTypes();
        GetCategories();
        GetProducts();
    }, []);

    const handlePageChangeProductType = (page) => {
        if (page >= 1 && page <= totalPagesProductTypes) {
            setCurrentPageProductType(page);
        }
    };

    const resetForm = () => {
        setProductTypeName('');
        setProductTypeId('');
        setProductTypeCategoryId('');
    };

    const resetQuickCategoryForm = () => {
        setQuickCategoryName('');
        setQuickCategoryDescription('');
    };

    const closeAllModals = () => {
        setAddProductTypeVisible(true);
        setViewProductTypeVisible(true);
        setEditProductTypeVisible(true);
        setShowQuickCategoryModal(true);
        resetForm();
        resetQuickCategoryForm();
    };

    const GetProducts = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetProduct"
                }
            });
            setProductList(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching product list:", error);
            setProductList([]);
        }
    };

    const GetProductTypes = async () => {
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
                    console.warn("Failed to parse product type list:", parseError, typesData);
                    typesData = [];
                }
            }

            setProductTypeList(Array.isArray(typesData) ? typesData : []);
        } catch (error) {
            console.error("Error fetching product type list:", error);
            setProductTypeList([]);
        }
    };

    const GetCategories = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetCategory"
                }
            });
            setCategoryList(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching category list:", error);
            setCategoryList([]);
        }
    };

    const add_product_type = async (e) => {
        e.preventDefault();

        const categoryIdInt = productTypeCategoryId ? parseInt(productTypeCategoryId, 10) : null;

        if (!productTypeName?.trim() || !categoryIdInt) {
            showAlertError({
                icon: "warning",
                title: "Incomplete Product Type Details",
                text: 'Please provide a product type name and select a category.',
                button: 'Got it'
            });
            return;
        }

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';
        const productTypeDetails = {
            product_type_name: productTypeName,
            category_id: categoryIdInt
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(productTypeDetails),
                    operation: "AddProductType"
                }
            });

            if (response.data === 'Success') {
                GetProductTypes();
                closeAllModals();
                AlertSucces("New product type successfully added!", "success", true, 'Okay');
            } else {
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: typeof response.data === 'string' ? response.data : 'Failed to add new product type!',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error adding product type:", error);
            showAlertError({
                icon: "error",
                title: "Error",
                text: 'Unable to add product type at this time.',
                button: 'Understood'
            });
        }
    };

    const add_quick_category = async (e) => {
        e.preventDefault();

        if (!quickCategoryName?.trim() || !quickCategoryDescription?.trim()) {
            showAlertError({
                icon: "warning",
                title: "Fill in required details!",
                text: 'Please complete the category name and description.',
                button: 'Try Again'
            });
            return;
        }

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';
        const categoryDetails = {
            categoryName: quickCategoryName,
            categoryDescription: quickCategoryDescription
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(categoryDetails),
                    operation: "AddCategory"
                }
            });

            if (response.data === 'Success') {
                GetCategories();
                resetQuickCategoryForm();
                setShowQuickCategoryModal(true);
                AlertSucces("New category successfully added!", "success", true, 'Okay');
            } else {
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: 'Failed to add new category!',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error adding category:", error);
        }
    };

    const GetProductTypeDetail = async (typeId) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';
        const payload = { product_type_id: typeId };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(payload),
                    operation: "ViewProductTypeDetails"
                }
            });

            let data = response.data;
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (parseError) {
                    console.error("Failed to parse product type details:", parseError, data);
                    data = [];
                }
            }

            if (Array.isArray(data) && data.length > 0) {
                const type = data[0];
                setProductTypeId(type.product_type_id ?? '');
                setProductTypeName(type.product_type_name ?? '');
                setProductTypeCategoryId(type.category_id ? type.category_id.toString() : '');
            }
        } catch (error) {
            console.error("Error fetching product type details:", error);
        }
    };

    const updateProductTypeDetail = async () => {
        const categoryIdInt = productTypeCategoryId ? parseInt(productTypeCategoryId, 10) : null;

        if (!productTypeId || !productTypeName?.trim() || !categoryIdInt) {
            showAlertError({
                icon: "warning",
                title: "Incomplete Product Type Details",
                text: 'Please provide product type name and category before saving.',
                button: 'Got it'
            });
            return;
        }

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';
        const productTypeDetails = {
            product_type_id: parseInt(productTypeId, 10),
            product_type_name: productTypeName,
            category_id: categoryIdInt
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(productTypeDetails),
                    operation: "UpdateProductType"
                }
            });

            if (response.data === 'Success') {
                GetProductTypes();
                closeAllModals();
                AlertSucces("Product type details successfully updated!", "success", true, 'Okay');
            } else {
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: typeof response.data === 'string' ? response.data : 'Failed to update product type details!',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error updating product type details:", error);
            showAlertError({
                icon: "error",
                title: "Error",
                text: 'Unable to update product type at this time.',
                button: 'Understood'
            });
        }
    };

    const triggerModal = (operation, id) => {
        switch (operation) {
            case 'addProductType':
                resetForm();
                setAddProductTypeVisible(false);
                break;
            case 'viewProductType':
                GetProductTypeDetail(id);
                setViewProductTypeVisible(false);
                break;
            case 'editProductType':
                GetProductTypeDetail(id);
                setEditProductTypeVisible(false);
                break;
            case 'quickAddCategory':
                resetQuickCategoryForm();
                setShowQuickCategoryModal(false);
                break;
            default:
                break;
        }
    };

    const getCategoryName = (categoryId) => {
        if (!categoryId) return '';
        const match = categoryList.find(cat => cat.category_id?.toString() === categoryId.toString());
        return match ? match.category_name : '';
    };

    const getProductTypeCount = (productTypeId) => {
        const idInt = productTypeId ? parseInt(productTypeId, 10) : 0;
        return productList.filter(prod => {
            const prodTypeId = prod.product_type_id ? parseInt(prod.product_type_id, 10) : 0;
            return prodTypeId === idInt;
        }).length;
    };

    return (
        <>
            {/* Add Product Type Modal */}
            <Modal show={!addProductTypeVisible} onHide={closeAllModals} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Add Product Type</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body'>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Product Type Name</label>
                        <input
                            type='text'
                            className='prod-name-input'
                            value={productTypeName}
                            onChange={(e) => setProductTypeName(e.target.value)}
                            placeholder='e.g., Sofa Set, Office Collection'
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Linked Category</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <select
                                className='category-dropdown'
                                value={productTypeCategoryId}
                                onChange={(e) => setProductTypeCategoryId(e.target.value)}
                                style={{ flex: '1 1 260px' }}
                            >
                                <option value="" disabled hidden>Select Category</option>
                                {categoryList.map((category) => (
                                    <option key={category.category_id} value={category.category_id}>
                                        {category.category_name}
                                    </option>
                                ))}
                            </select>
                            <Button variant="outline-primary" onClick={() => triggerModal('quickAddCategory')}>
                                + Add New Category
                            </Button>
                        </div>
                        {categoryList.length === 0 && (
                            <Alert variant="warning" style={{ marginTop: '12px' }}>
                                No categories found. Please create a category first to link this product type.
                            </Alert>
                        )}
                    </div>
                    <Alert variant="info" style={{ fontSize: '13px' }}>
                        Product types allow you to group products within a category for better filtering and reporting.
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeAllModals}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={add_product_type}>
                        Save Product Type
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* View Product Type Modal */}
            <Modal show={!viewProductTypeVisible} onHide={closeAllModals} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Product Type Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body'>
                    <div className='div-input-add-prod' style={{ paddingBottom: '20px' }}>
                        <label className='add-prod-label'>Product Type ID</label>
                        <input
                            className='prod-name-input'
                            disabled={true}
                            value={productTypeId}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Product Type Name</label>
                        <input
                            className='prod-name-input'
                            disabled={true}
                            value={productTypeName}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Linked Category</label>
                        <input
                            className='prod-name-input'
                            disabled={true}
                            value={getCategoryName(productTypeCategoryId) || ''}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Total Products</label>
                        <input
                            className='prod-name-input'
                            disabled={true}
                            value={getProductTypeCount(productTypeId ? parseInt(productTypeId, 10) : 0)}
                        />
                    </div>
                </Modal.Body>
            </Modal>

            {/* Edit Product Type Modal */}
            <Modal show={!editProductTypeVisible} onHide={closeAllModals} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Product Type</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body'>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Product Type Name</label>
                        <input
                            type='text'
                            className='prod-name-input'
                            value={productTypeName}
                            onChange={(e) => setProductTypeName(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Linked Category</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <select
                                className='category-dropdown'
                                value={productTypeCategoryId}
                                onChange={(e) => setProductTypeCategoryId(e.target.value)}
                                style={{ flex: '1 1 260px' }}
                            >
                                <option value="" disabled hidden>Select Category</option>
                                {categoryList.map((category) => (
                                    <option key={category.category_id} value={category.category_id}>
                                        {category.category_name}
                                    </option>
                                ))}
                            </select>
                            <Button variant="outline-primary" onClick={() => triggerModal('quickAddCategory')}>
                                + Add New Category
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeAllModals}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={updateProductTypeDetail}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Quick Add Category Modal */}
            <Modal show={!showQuickCategoryModal} onHide={closeAllModals} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Add Category</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body'>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Category Name</label>
                        <input
                            type='text'
                            className='prod-name-input'
                            value={quickCategoryName}
                            onChange={(e) => setQuickCategoryName(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Category Description</label>
                        <textarea
                            className='description-input'
                            value={quickCategoryDescription}
                            onChange={(e) => setQuickCategoryDescription(e.target.value)}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeAllModals}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={add_quick_category}>
                        Save Category
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='customer-main'>
                <div className='customer-header'>
                    <div className='h-customer'>
                        <h1 className='h-customer'>PRODUCT TYPE MANAGEMENT</h1>
                        <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
                            Group related products under a shared category for better catalog control.
                        </p>
                    </div>
                    <div>
                        <button
                            className='add-cust-bttn'
                            style={{ backgroundColor: '#0d6efd' }}
                            onClick={() => triggerModal('addProductType')}
                        >
                            ADD PRODUCT TYPE+
                        </button>
                    </div>
                </div>

                <div style={{
                    padding: '15px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    margin: '20px 0 10px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '15px',
                        alignItems: 'end'
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Search Product Types
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
                                    placeholder="Search by product type or category..."
                                    value={productTypeSearchFilter}
                                    onChange={(e) => setProductTypeSearchFilter(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px 8px 35px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />

                                {productTypeSearchFilter && (
                                    <button
                                        type="button"
                                        onClick={() => setProductTypeSearchFilter('')}
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
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                                Filter by Category
                            </label>
                            <select
                                value={productTypeCategoryFilter}
                                onChange={(e) => setProductTypeCategoryFilter(e.target.value)}
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
                                    <option key={category.category_id} value={category.category_id}>
                                        {category.category_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{
                            padding: '12px 16px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '6px',
                            border: '1px solid #e9ecef'
                        }}>
                            <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '4px', fontWeight: 500 }}>
                                Product Type Summary
                            </div>
                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '13px', color: '#495057' }}>
                                <span><strong>{filteredProductTypes.length}</strong> shown</span>
                                <span>|</span>
                                <span><strong>{productTypeList.length}</strong> total types</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='categories-grid-container' style={{
                    padding: '20px 0',
                    minHeight: '40vh'
                }}>
                    {currentProductTypeItems && currentProductTypeItems.length > 0 ? (
                        <>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                                gap: '20px',
                                padding: '0 10px'
                            }}>
                                {currentProductTypeItems.map((type, index) => {
                                    const categoryName = getCategoryName(type.category_id);
                                    const productCount = getProductTypeCount(type.product_type_id);
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => triggerModal('viewProductType', type.product_type_id)}
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
                                            <div style={{
                                                height: '120px',
                                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                position: 'relative',
                                                color: 'white'
                                            }}>
                                                <div style={{ fontSize: '48px', opacity: 0.85 }}>🧩</div>
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '15px',
                                                    left: '15px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    color: '#495057',
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}>
                                                    <span style={{ fontSize: '16px' }}>🏷️</span>
                                                    {categoryName || 'Unassigned'}
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        triggerModal('editProductType', type.product_type_id);
                                                    }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '15px',
                                                        right: '15px',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '40px',
                                                        height: '40px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        fontSize: '16px',
                                                        transition: 'all 0.2s ease',
                                                        color: '#495057'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#0d6efd';
                                                        e.currentTarget.style.color = 'white';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                                                        e.currentTarget.style.color = '#495057';
                                                    }}
                                                    title="Edit Product Type"
                                                >
                                                    ✏️
                                                </button>
                                            </div>

                                            <div style={{ padding: '25px' }}>
                                                <h3 style={{
                                                    margin: '0 0 12px 0',
                                                    fontSize: '20px',
                                                    fontWeight: '600',
                                                    color: '#212529',
                                                    lineHeight: '1.3'
                                                }}>
                                                    {type.product_type_name}
                                                </h3>

                                                <p style={{
                                                    margin: '0 0 16px 0',
                                                    fontSize: '14px',
                                                    color: '#6c757d',
                                                    lineHeight: '1.6'
                                                }}>
                                                    Linked Category: <strong>{categoryName || 'Unassigned'}</strong>
                                                </p>

                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                                    gap: '12px',
                                                    paddingTop: '15px',
                                                    borderTop: '1px solid #e9ecef'
                                                }}>
                                                    <div style={{
                                                        textAlign: 'center',
                                                        padding: '12px',
                                                        backgroundColor: '#f8f9fa',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e9ecef'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '24px',
                                                            fontWeight: '700',
                                                            color: '#198754',
                                                            marginBottom: '4px'
                                                        }}>
                                                            {productCount}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '12px',
                                                            color: '#6c757d',
                                                            fontWeight: '500',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            Products Linked
                                                        </div>
                                                    </div>

                                                    <div style={{
                                                        textAlign: 'center',
                                                        padding: '12px',
                                                        backgroundColor: '#f8f9fa',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e9ecef'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '24px',
                                                            fontWeight: '700',
                                                            color: '#0d6efd',
                                                            marginBottom: '4px'
                                                        }}>
                                                            {categoryName ? 'Yes' : 'No'}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '12px',
                                                            color: '#6c757d',
                                                            fontWeight: '500',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            Category Assigned
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
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
                            minHeight: '300px'
                        }}>
                            <div style={{
                                fontSize: '64px',
                                marginBottom: '20px',
                                opacity: 0.3
                            }}>
                                🧩
                            </div>
                            <h3 style={{
                                color: '#495057',
                                marginBottom: '10px',
                                fontWeight: '600',
                                fontSize: '22px'
                            }}>
                                {productTypeList.length === 0 ? 'No product types yet' : 'No product types match your filters'}
                            </h3>
                            <p style={{
                                margin: '0',
                                fontSize: '14px',
                                maxWidth: '340px',
                                lineHeight: '1.5'
                            }}>
                                {productTypeList.length === 0
                                    ? 'Start by adding your first product type to categorize products more precisely.'
                                    : 'Try adjusting your search keywords or category filter to see more results.'}
                            </p>
                            {productTypeList.length === 0 && (
                                <button
                                    onClick={() => triggerModal('addProductType')}
                                    style={{
                                        marginTop: '20px',
                                        padding: '12px 24px',
                                        backgroundColor: '#0d6efd',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '15px',
                                        fontWeight: '500',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#0b5ed7';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#0d6efd';
                                    }}
                                >
                                    Create Product Type
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {totalPagesProductTypes > 1 && currentProductTypeItems && currentProductTypeItems.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', marginBottom: '30px' }}>
                        <CustomPagination
                            currentPage={currentPageProductType}
                            totalPages={totalPagesProductTypes}
                            onPageChange={handlePageChangeProductType}
                            color="blue"
                        />
                    </div>
                )}
            </div>
        </>
    );
};

export default ProductTypeAdmin;
