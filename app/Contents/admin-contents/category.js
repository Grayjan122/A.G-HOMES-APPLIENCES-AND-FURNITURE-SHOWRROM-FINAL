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

const CategoryAdmin = () => {
    // Modal states
    const [show, setShow] = useState(false);
    const [addCategoryVisible, setAddCategoryVisible] = useState(true);
    const [viewCategoryVisible, setViewCategoryVisible] = useState(true);
    const [editCategoryVisible, setEditCategoryVisible] = useState(true);

    // Pagination states
    const [currentPageCategory, setCurrentPageCategory] = useState(1);

    // Filter states
    const [categorySearchFilter, setCategorySearchFilter] = useState('');

    // Alert states
    const [message, setMessage] = useState('');
    const [modalTitle, setModalTitle] = useState('');

    // Form inputs
    const [category_name, setCategory_Name] = useState('');
    const [category_description, setCategory_Description] = useState('');
    const [category_id, setCategory_Id] = useState('');

    // Data arrays
    const [productList, setProductList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);

    // Modal handlers
    const handleClose = () => setShow(false);

    // Filter categories
    const filteredCategories = useMemo(() => {
        return categoryList.filter(category => {
            if (categorySearchFilter.trim()) {
                const searchTerm = categorySearchFilter.toLowerCase();
                return category.category_name.toLowerCase().includes(searchTerm) ||
                    category.category_description.toLowerCase().includes(searchTerm);
            }
            return true;
        });
    }, [categoryList, categorySearchFilter]);

    // Pagination for categories
    const totalPagesCategories = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
    const startIndexCategories = (currentPageCategory - 1) * ITEMS_PER_PAGE;
    const currentCategoryItems = filteredCategories.slice(startIndexCategories, startIndexCategories + ITEMS_PER_PAGE);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPageCategory(1);
    }, [categorySearchFilter]);

    const handlePageChangeCategory = (page) => {
        if (page >= 1 && page <= totalPagesCategories) {
            setCurrentPageCategory(page);
        }
    };

    // Load data on component mount
    useEffect(() => {
        GetProduct();
        GetCategory();
    }, []);

    const resetForm = () => {
        setCategory_Name('');
        setCategory_Description('');
        setCategory_Id('');
        setModalTitle('');
        setMessage('');
    };

    const close_modal = () => {
        handleClose();
        setAddCategoryVisible(true);
        setViewCategoryVisible(true);
        setEditCategoryVisible(true);
        resetForm();
    };

    // API Functions
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
    };

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
            setCategoryList(response.data);
        } catch (error) {
            console.error("Error fetching category list:", error);
        }
    };

    const add_category = async (e) => {
        e.preventDefault();

        if (!category_name?.trim() || !category_description?.trim()) {
           
            showAlertError({
                icon: "warning",
                title: "Fill in required details!",
                text: 'Please fill all the required details!',
                button: 'Try Again'
            });
            return;
        }

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';
        const categoryDetails = {
            categoryName: category_name,
            categoryDescription: category_description
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(categoryDetails),
                    operation: "AddCategory"
                }
            });

            if (response.data === 'Success') {
                GetCategory();
                close_modal();
                AlertSucces(
                    "New category successfully added!",
                    "success",
                    true,
                    'Okay'
                );
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

    const GetCategoryDetail = async (category_id) => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        const categoryID = { categoryID: category_id };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(categoryID),
                    operation: "ViewCategoryDetails"
                }
            });

            setCategory_Id(response.data[0].category_id);
            setCategory_Name(response.data[0].category_name);
            setCategory_Description(response.data[0].category_description);
        } catch (error) {
            console.error("Error fetching category details:", error);
        }
    };

    const updateCategoryDetail = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        const categoryDetails = {
            catID: category_id,
            catName: category_name,
            catDescription: category_description
        };

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(categoryDetails),
                    operation: "UpdateCategory"
                }
            });

            if (response.data === 'Success') {
                GetCategory();
                resetForm();
                close_modal();
                AlertSucces(
                    "Category details successfully updated!",
                    "success",
                    true,
                    'Okay'
                );
            } else {
                showAlertError({
                    icon: "error",
                    title: "Something Went Wrong!",
                    text: 'Failed to update category details!',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error updating category details:", error);
        }
    };

    const triggerModal = (operation, id, e) => {
        switch (operation) {
            case 'addCategory':
                setAddCategoryVisible(false);
                break;
            case 'viewCategory':
                GetCategoryDetail(id);
                setViewCategoryVisible(false);
                break;
            case 'editCategory':
                GetCategoryDetail(id);
                setEditCategoryVisible(false);
                break;
        }
    };

    // Count products for a specific category
    const getProductCount = (categoryId) => {
        return productList.filter(prod => prod.category_id === categoryId).length;
    };

    return (
        <>
            {/* Alert Modal */}
            <Modal show={show} onHide={handleClose} size='sm'>
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{message}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Add Category Modal */}
            <Modal show={!addCategoryVisible} onHide={close_modal} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Add Category</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body'>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Category Name</label>
                        <input
                            type='text'
                            className='prod-name-input'
                            value={category_name}
                            onChange={(e) => setCategory_Name(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Category Description</label>
                        <textarea
                            className='description-input'
                            value={category_description}
                            onChange={(e) => setCategory_Description(e.target.value)}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={close_modal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={add_category}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* View Category Modal */}
            <Modal show={!viewCategoryVisible} onHide={close_modal} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Category Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body'>
                    <div className='div-input-add-prod' style={{ paddingBottom: '20px' }}>
                        <label className='add-prod-label'>Category ID</label>
                        <input
                            className='prod-name-input'
                            disabled={true}
                            value={category_id}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Category Name</label>
                        <input
                            className='prod-name-input'
                            disabled={true}
                            value={category_name}
                        />
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Category Description</label>
                        <textarea
                            className='description-input'
                            disabled={true}
                            value={category_description}
                        />
                    </div>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Total Products</label>
                        <input
                            className='prod-name-input'
                            disabled={true}
                            value={getProductCount(category_id)}
                        />
                    </div>
                </Modal.Body>
            </Modal>

            {/* Edit Category Modal */}
            <Modal show={!editCategoryVisible} onHide={close_modal} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Category Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-add-product-body'>
                    <div className='div-input-add-prod'>
                        <label className='add-prod-label'>Category Name</label>
                        <input
                            type='text'
                            className='prod-name-input'
                            value={category_name}
                            onChange={(e) => setCategory_Name(e.target.value)}
                        />
                    </div>
                    <div className='div-input-add-cat'>
                        <label className='add-prod-label'>Category Description</label>
                        <textarea
                            className='description-input'
                            value={category_description}
                            onChange={(e) => setCategory_Description(e.target.value)}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={close_modal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={updateCategoryDetail}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='customer-main'>
                {/* Header */}
                <div className='customer-header'>
                    <div className='h-customer'>
                        <h1 className='h-customer'>CATEGORY MANAGEMENT</h1>
                    </div>
                    <div>
                        <button
                            className='add-cust-bttn'
                            onClick={(e) => triggerModal('addCategory', '0', e)}
                        >
                            ADD CATEGORY+
                        </button>
                    </div>
                </div>

                {/* Search Filter */}
                <div style={{
                    padding: '15px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    margin: '10px 0',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>
                            Search Categories
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
                                value={categorySearchFilter}
                                onChange={(e) => setCategorySearchFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px 8px 35px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            />

                            {categorySearchFilter && (
                                <button
                                    type="button"
                                    onClick={() => setCategorySearchFilter('')}
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
                </div>

                {/* Categories Grid */}
                <div className='categories-grid-container' style={{
                    padding: '20px 0',
                    minHeight: '40vh'
                }}>
                    {currentCategoryItems && currentCategoryItems.length > 0 ? (
                        <>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                                gap: '20px',
                                padding: '0 10px'
                            }}>
                                {currentCategoryItems.map((category, index) => {
                                    const productCount = getProductCount(category.category_id);

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => triggerModal('viewCategory', category.category_id)}
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
                                            {/* Category Header */}
                                            <div style={{
                                                height: '120px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                position: 'relative',
                                                color: 'white'
                                            }}>
                                                <div style={{ fontSize: '48px', opacity: 0.8 }}>📁</div>

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
                                                    <span style={{ fontSize: '16px' }}>📦</span>
                                                    {productCount}
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        triggerModal('editCategory', category.category_id, e);
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
                                                        e.currentTarget.style.backgroundColor = '#007bff';
                                                        e.currentTarget.style.color = 'white';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                                                        e.currentTarget.style.color = '#495057';
                                                    }}
                                                    title="Edit Category"
                                                >
                                                    ✏️
                                                </button>
                                            </div>

                                            {/* Category Information */}
                                            <div style={{ padding: '25px' }}>
                                                <h3 style={{
                                                    margin: '0 0 15px 0',
                                                    fontSize: '20px',
                                                    fontWeight: '600',
                                                    color: '#212529',
                                                    lineHeight: '1.3'
                                                }}>
                                                    {category.category_name}
                                                </h3>

                                                <p style={{
                                                    margin: '0 0 20px 0',
                                                    fontSize: '15px',
                                                    color: '#6c757d',
                                                    lineHeight: '1.5',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    minHeight: '66px'
                                                }}>
                                                    {category.category_description}
                                                </p>

                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: '15px',
                                                    paddingTop: '20px',
                                                    borderTop: '1px solid #e9ecef'
                                                }}>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{
                                                            fontSize: '24px',
                                                            fontWeight: '700',
                                                            color: '#28a745',
                                                            marginBottom: '5px'
                                                        }}>
                                                            {productCount}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            color: '#6c757d',
                                                            fontWeight: '500'
                                                        }}>
                                                            Total Products
                                                        </div>
                                                    </div>

                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{
                                                            fontSize: '24px',
                                                            fontWeight: '700',
                                                            color: '#007bff',
                                                            marginBottom: '5px'
                                                        }}>
                                                            {category.category_id}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            color: '#6c757d',
                                                            fontWeight: '500'
                                                        }}>
                                                            Category ID
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{
                                                    marginTop: '20px',
                                                    padding: '10px 0',
                                                    borderTop: '1px solid #f1f3f4',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}>
                                                        <div style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '50%',
                                                            backgroundColor: productCount > 0 ? '#28a745' : '#ffc107'
                                                        }}></div>
                                                        <span style={{
                                                            fontSize: '13px',
                                                            color: '#6c757d',
                                                            fontWeight: '500'
                                                        }}>
                                                            {productCount > 0 ? 'Active Category' : 'Empty Category'}
                                                        </span>
                                                    </div>

                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: '#adb5bd',
                                                        fontStyle: 'italic'
                                                    }}>
                                                        Click to view details
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Statistics Summary */}
                            <div style={{
                                marginTop: '30px',
                                padding: '20px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '10px',
                                border: '1px solid #e9ecef'
                            }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '20px',
                                    textAlign: 'center'
                                }}>
                                    <div>
                                        <div style={{
                                            fontSize: '28px',
                                            fontWeight: '700',
                                            color: '#007bff',
                                            marginBottom: '5px'
                                        }}>
                                            {filteredCategories.length}
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: '#6c757d',
                                            fontWeight: '500'
                                        }}>
                                            Total Categories
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{
                                            fontSize: '28px',
                                            fontWeight: '700',
                                            color: '#28a745',
                                            marginBottom: '5px'
                                        }}>
                                            {filteredCategories.filter(cat => getProductCount(cat.category_id) > 0).length}
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: '#6c757d',
                                            fontWeight: '500'
                                        }}>
                                            Active Categories
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{
                                            fontSize: '28px',
                                            fontWeight: '700',
                                            color: '#ffc107',
                                            marginBottom: '5px'
                                        }}>
                                            {filteredCategories.filter(cat => getProductCount(cat.category_id) === 0).length}
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: '#6c757d',
                                            fontWeight: '500'
                                        }}>
                                            Empty Categories
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{
                                            fontSize: '28px',
                                            fontWeight: '700',
                                            color: '#17a2b8',
                                            marginBottom: '5px'
                                        }}>
                                            {productList.length}
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: '#6c757d',
                                            fontWeight: '500'
                                        }}>
                                            Total Products
                                        </div>
                                    </div>
                                </div>
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
                                📂
                            </div>
                            <h3 style={{
                                color: '#495057',
                                marginBottom: '12px',
                                fontWeight: '600',
                                fontSize: '24px'
                            }}>
                                {categoryList.length === 0 ? 'No categories available' : 'No categories match the current filters'}
                            </h3>
                            <p style={{
                                margin: '0 0 20px 0',
                                fontSize: '16px',
                                maxWidth: '400px',
                                lineHeight: '1.5',
                                color: '#6c757d'
                            }}>
                                {categoryList.length === 0
                                    ? 'Start organizing your products by creating your first category using the "ADD CATEGORY+" button above.'
                                    : 'Try adjusting your search terms to see more categories.'
                                }
                            </p>
                            {categoryList.length === 0 && (
                                <button
                                    onClick={(e) => triggerModal('addCategory', '0', e)}
                                    style={{
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
                                    Create Your First Category
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Categories Pagination */}
                {totalPagesCategories > 1 && currentCategoryItems && currentCategoryItems.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <CustomPagination
                            currentPage={currentPageCategory}
                            totalPages={totalPagesCategories}
                            onPageChange={handlePageChangeCategory}
                            color="green"
                        />
                    </div>
                )}
            </div>
        </>
    );
};

export default CategoryAdmin;