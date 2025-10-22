'use client';
import React from 'react';
import "../../css/inventory-css/inventory.css";

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import CustomPagination from '@/app/Components/Pagination/pagination';

import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';

const ITEMS_PER_PAGE = 9;

const ProductsAdmin = () => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);

    // Filter states for products
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');

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
    const [cat, setCat] = useState('');
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

    const [prodId, setProdId] = useState('');

    //arrays
    const [productList, setProductList] = useState([]);
    const [categoryList, setCategorytList] = useState([]);

    // Image upload states
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [productImagePath, setProductImagePath] = useState('');

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
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

            if (response.ok) {
                return result.path;
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showAlertError({
                icon: "error",
                title: "Opss!",
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

    // Filter and sort products
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = productList.filter(product => {
            // Category filter
            if (categoryFilter && product.category_name !== categoryFilter) {
                return false;
            }

            // Search filter (searches in product name and description)
            if (searchFilter.trim()) {
                const searchTerm = searchFilter.toLowerCase();
                return product.product_name.toLowerCase().includes(searchTerm) ||
                    product.description.toLowerCase().includes(searchTerm);
            }

            return true;
        });

        // Apply sorting
        if (sortField) {
            filtered = [...filtered].sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];

                // Handle different data types
                if (sortField === 'price') {
                    aVal = parseFloat(aVal) || 0;
                    bVal = parseFloat(bVal) || 0;
                } else if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }

                if (sortDirection === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }

        return filtered;
    }, [productList, categoryFilter, searchFilter, sortField, sortDirection]);

    // Pagination for products
    const totalPagesProducts = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);
    const startIndexProducts = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentProductItems = filteredAndSortedProducts.slice(startIndexProducts, startIndexProducts + ITEMS_PER_PAGE);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [categoryFilter, searchFilter, sortField, sortDirection]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPagesProducts) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        GetProduct();
        GetCategory();
    }, []);

    const resetForm = () => {
        setProdName('');
        setCat('');
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
    };

    const clearProductFilters = () => {
        setCategoryFilter('');
        setSearchFilter('');
        setSortField('');
        setSortDirection('asc');
    };

    const removeProductFilter = (filterType) => {
        switch (filterType) {
            case 'category':
                setCategoryFilter('');
                break;
            case 'search':
                setSearchFilter('');
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
                    operation: "GetProduct"
                }
            });

            setProductList(response.data);
        } catch (error) {
            console.error("Error fetching product list:", error);
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

    const AddProduct = async (e) => {
        e.preventDefault();

        if (
            !prodName?.trim() ||
            !cat?.trim() ||
            !dimension?.trim() ||
            !i_color?.trim() ||
            !i_price?.toString().trim() ||
            !i_description?.trim() ||
            !i_material?.trim()
        ) {
            setMessage("Please fill in all needed details!");
            setAlertVariant('danger');
            setAlertBG('#dc7a80');
            setAlert1(true);

            setTimeout(() => {
                setAlert1(false);
            }, 3000);
            return;
        }

        // Upload image first if one is selected
        let imagePath = '/uploads/products/defualt.jpg';
        if (selectedFile) {
            imagePath = await uploadImage();
            if (!imagePath) {
                return;
            }
        }

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';
        const productDetails = {
            prodName: prodName,
            category: cat,
            description: i_description,
            dimension: dimension,
            material: i_material,
            color: i_color,
            price: i_price,
            product_preview_image: imagePath
        }

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(productDetails),
                    operation: "AddProduct"
                }
            });

            if (response.data === 'Success') {
                GetProduct();
                resetForm();
                close_modal();
                AlertSucces(
                    "New product is successfully added!",
                    "success",
                    true,
                    'Okay'
                );
                return;

            } else {

                showAlertError({
                    icon: "error",
                    title: "Opss!",
                    text: 'Failed to add new product.',
                    button: 'Try Again'
                });
                return;
            }

        } catch (error) {
            console.error("Error adding product:", error);
        }
    };

    const close_modal = () => {
        handleClose();
        setAddProductVisible(true);
        setViewProductVisible(true);
        setEditProductVisible(true);
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

            const product = response.data[0];
            setProdName(product.product_name);
            setI_Descrition(product.description);
            setI_Marterial(product.material);
            setI_Color(product.color);
            setI_Price(parseFloat(product.price));
            setDimension(product.dimensions);
            setCatID(product.category_id);
            setCatName(product.category_name);
            setCat(product.category_name);
            setProdId(product.product_id);
            setDateCreated(product.date_created);

            // FIXED: Set the product image path
            setProductImagePath(product.product_preview_image || 'Nothing as for now');

        } catch (error) {
            console.error("Error fetching product details:", error);
        }
        return;
    }

    const UpdateProduct = async (e) => {
        e.preventDefault();

        // Upload new image if one is selected
        let imagePath = productImagePath || 'Nothing as for now';
        if (selectedFile) {
            const newImagePath = await uploadImage();
            if (newImagePath) {
                imagePath = newImagePath;
            }
        }

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';
        const productDetails = {
            prodName: prodName,
            category: catId,
            description: i_description,
            dimension: dimension,
            material: i_material,
            color: i_color,
            price: i_price,
            product_preview_image: imagePath,
            catID: catId,
            prodId: prodId
        }

        try {
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
                return;
            }

        } catch (error) {
            console.error("Error updating product:", error);
        }
    };

    const category_change = (e) => {
        const selectedCategoryName = e.target.value;
        setCatName(selectedCategoryName);

        const c = categoryList.find(u => u.category_name === selectedCategoryName);
        if (c) {
            setCatID(c.category_id);
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
            <Modal show={!editProductVisible} onHide={close_modal} size='lg'>
                <Modal.Header closeButton >
                    <Modal.Title >Edit Product Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body' >
                    <div className='div-for-line'>
                        <div className='div-input-add-prod'>
                            <label className='add-prod-label'>Product Name</label>
                            <input
                                type='text'
                                className='prod-name-input'
                                value={prodName}
                                onChange={(e) => setProdName(e.target.value)}
                            />
                        </div>

                        <div className='div-input-add-prod'>
                            <label className='add-prod-label'>Category</label>
                            <select className='category-dropdown' onChange={category_change} value={catName}>
                                <option value="" disabled hidden>
                                    {cat}
                                </option>
                                {categoryList.map((cat) => (
                                    <option key={cat.category_id} value={cat.category_name}>
                                        {cat.category_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Dimension</label>
                        <input
                            type='text'
                            className='dimension-input'
                            value={dimension}
                            onChange={(e) => setDimension(e.target.value)}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Color</label>
                        <input
                            type='text'
                            className='prod-name-input1'
                            value={i_color}
                            onChange={(e) => setI_Color(e.target.value)}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Price</label>
                        <input
                            type='number'
                            className='prod-name-input1'
                            value={i_price}
                            onChange={(e) => setI_Price(e.target.value)}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Description</label>
                        <textarea
                            className='description-input'
                            value={i_description}
                            onChange={(e) => setI_Descrition(e.target.value)}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Material</label>
                        <textarea
                            className='description-input'
                            value={i_material}
                            onChange={(e) => setI_Marterial(e.target.value)}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Preview Image</label>
                        <input
                            type='file'
                            className='files-input'
                            accept="image/*"
                            onChange={handleFileSelect}
                            disabled={uploadingImage}
                        />
                        {/* Show current image if exists */}
                        {!imagePreview && productImagePath && productImagePath !== 'Nothing as for now' && (
                            <div style={{ marginTop: '10px' }}>
                                <img
                                    src={productImagePath}
                                    alt="Current"
                                    style={{
                                        // maxWidth: '200px',
                                        width: '100%',
                                        maxHeight: '200px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd'
                                    }}
                                />
                                <p style={{ fontSize: '12px', color: '#666' }}>Current image</p>
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
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={close_modal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={UpdateProduct}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Add Product Modal */}
            <Modal show={!addProductVisible} onHide={close_modal} size='lg' >
                <Modal.Header closeButton >
                    <Modal.Title >Add Product</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body' >
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Product Name</label>
                        <input
                            type="text"
                            className="prod-name-input"
                            value={prodName}
                            onChange={(e) => setProdName(e.target.value)}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Category</label>
                        <select className='category-dropdown' onChange={(e) => setCat(e.target.value)} value={cat}>
                            <option value="" disabled hidden>Select Category</option>
                            {categoryList.map((cat) => (
                                <option key={cat.category_id} value={cat.category_id}>
                                    {cat.category_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Dimensions</label>
                        <input
                            type='text'
                            className='dimension-input'
                            value={dimension}
                            onChange={e => setDimension(e.target.value)}
                        />
                    </div>

                    <div className='div-for-line'>
                        <div className='div-input-add-prod'>
                            <label className='add-prod-label'>Color</label>
                            <input
                                type='text'
                                className='prod-name-input1'
                                value={i_color}
                                onChange={(e) => setI_Color(e.target.value)}
                            />
                        </div>

                        <div className='div-input-add-prod'>
                            <label className='add-prod-label'>Price</label>
                            <input
                                type='number'
                                className='prod-name-input1'
                                value={i_price}
                                onChange={e => setI_Price(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Description</label>
                        <textarea
                            className='description-input'
                            value={i_description}
                            onChange={(e) => setI_Descrition(e.target.value)}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Material</label>
                        <textarea
                            className='description-input'
                            value={i_material}
                            onChange={(e) => setI_Marterial(e.target.value)}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Preview Image</label>
                        <input
                            type='file'
                            className='files-input'
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
                                        maxHeight: '200px',
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
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={close_modal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={AddProduct}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* View Product Modal */}
            <Modal show={!viewProductVisible} onHide={close_modal} size='lg'>
                <Modal.Header closeButton >
                    <Modal.Title >Product Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body' >
                    <div className='div-input-add-prod' style={{ paddingBottom: '20px' }}>
                        <label className='add-prod-label'>Product ID</label>
                        <input
                            className='prod-name-input'
                            disabled={true}
                            value={prodId}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Product Name</label>
                        <input
                            disabled={true}
                            className='prod-name-input'
                            value={prodName}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Category</label>
                        <select className='category-dropdown' disabled={true}>
                            <option>{catName}</option>
                        </select>
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Dimensions</label>
                        <input
                            className='dimension-input'
                            disabled={true}
                            value={dimension}
                        />
                    </div>
                    <div className='div-for-line'>
                        <div className='div-input-add-prod'>
                            <label className='add-prod-label'>Color</label>
                            <input
                                className='prod-name-input1'
                                disabled={true}
                                value={i_color}
                            />
                        </div>

                        <div className='div-input-add-prod'>
                            <label className='add-prod-label'>Price</label>
                            <input
                                type='number'
                                className='prod-name-input1'
                                disabled={true}
                                value={i_price}
                            />
                        </div>
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Description</label>
                        <textarea
                            className='description-input'
                            disabled={true}
                            value={i_description}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Material</label>
                        <textarea
                            className='description-input'
                            disabled={true}
                            value={i_material}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Date Created</label>
                        <input
                            className='dimension-input'
                            disabled={true}
                            value={dateCreated}
                        />
                    </div>

                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Preview Image</label>
                        {productImagePath && productImagePath !== 'Nothing as for now' ? (
                            <div style={{ marginTop: '10px' }}>
                                <img
                                    src={productImagePath}
                                    alt="Product"
                                    style={{
                                        // maxWidth: '300px',
                                        width: '100%',
                                        maxHeight: '300px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd'
                                    }}
                                />
                            </div>
                        ) : (
                            <div style={{
                                marginTop: '10px',
                                padding: '40px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                textAlign: 'center',
                                color: '#6c757d'
                            }}>
                                No image available
                            </div>
                        )}
                    </div>
                </Modal.Body>
            </Modal>

            <div className='customer-main'>
                <div className='customer-header'>
                    <div className='h-customer'>
                        <h1 className='h-customer'>PRODUCT MANAGEMENT</h1>
                    </div>
                    <div>
                        <button className='add-cust-bttn' onClick={(e) => triggerModal('addProduct', '0', e)}>ADD PRODUCT+</button>
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

                        {!categoryFilter && !searchFilter && (
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

                {/* Products Table */}
                {/* <div className='tableContainer' style={{ height: '40vh', overflowY: 'auto' }}>
                    {currentProductItems && currentProductItems.length > 0 ? (
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th
                                        className='t2'
                                        onClick={() => handleSort('product_name')}
                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span>PRODUCT CODE</span>
                                            {renderSortArrow('product_name')}
                                        </div>
                                    </th>
                                    <th
                                        className='t3'
                                        onClick={() => handleSort('description')}
                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span>PRODUCT DESCRIPTION</span>
                                            {renderSortArrow('description')}
                                        </div>
                                    </th>
                                    <th
                                        className='t2'
                                        onClick={() => handleSort('price')}
                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span>PRICE</span>
                                            {renderSortArrow('price')}
                                        </div>
                                    </th>
                                    <th
                                        className='t2'
                                        onClick={() => handleSort('category_name')}
                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span>CATEGORY</span>
                                            {renderSortArrow('category_name')}
                                        </div>
                                    </th>
                                    <th className='th1'>TOTAL SALE</th>
                                    <th className='th1'>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentProductItems.map((p, i) => (
                                    <tr className='table-row' key={i} onClick={(e) => triggerModal('viewProduct', p.product_id, e)}>
                                        <td className='td-name'>{p.product_name}</td>
                                        <td className='td-name'>{p.description}</td>
                                        <td className='td-name'>₱{parseFloat(p.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className='td-name'>{p.category_name}</td>
                                        <td style={{ textAlign: 'center' }}>0</td>
                                        <td>
                                            <span className='action' onClick={(e) => {
                                                e.stopPropagation();
                                                triggerModal('editProduct', p.product_id, e);
                                            }}>
                                                ✏️
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            textAlign: 'center',
                            color: '#6c757d',
                            padding: '40px 20px'
                        }}>
                            <div style={{
                                fontSize: '48px',
                                marginBottom: '20px',
                                opacity: 0.3
                            }}>
                                📦
                            </div>
                            <h4 style={{
                                color: '#495057',
                                marginBottom: '10px',
                                fontWeight: '500'
                            }}>
                                {productList.length === 0 ? 'No products available' : 'No products match the current filters'}
                            </h4>
                            <p style={{
                                margin: '0',
                                fontSize: '14px',
                                maxWidth: '300px',
                                lineHeight: '1.4'
                            }}>
                                {productList.length === 0
                                    ? 'Products will appear here once added.'
                                    : 'Try adjusting your filters to see more results.'
                                }
                            </p>
                        </div>
                    )}
                </div> */}

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
                                        onClick={(e) => triggerModal('viewProduct', product.product_id, e)}
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
                                            {product.product_preview_image && product.product_preview_image !== 'Nothing as for now' ? (
                                                <img
                                                    src={product.product_preview_image}
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

                                            {/* Edit Action Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    triggerModal('editProduct', product.product_id, e);
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '10px',
                                                    right: '10px',
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
                                                    <div>
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
                                                    </div>

                                                    <div>
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
                                                    </div>
                                                </div>

                                                {/* Dimensions */}
                                                <div style={{ marginBottom: '15px' }}>
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
                                                </div>
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
                                                    <span style={{
                                                        fontSize: '18px',
                                                        color: '#495057',
                                                        fontWeight: '700'
                                                    }}>
                                                        0
                                                    </span>
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