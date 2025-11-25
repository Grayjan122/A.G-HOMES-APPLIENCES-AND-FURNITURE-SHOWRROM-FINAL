'use client';
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';
import Swal from 'sweetalert2';
import "../../css/products.css";

const ITEMS_PER_PAGE = 8;

const ProductPartsAssignment = () => {
    const [productTypeList, setProductTypeList] = useState([]);
    const [productPartsList, setProductPartsList] = useState([]);
    const [selectedProductType, setSelectedProductType] = useState(null);
    const [assignedParts, setAssignedParts] = useState([]);
    const [availableParts, setAvailableParts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Add Part Modal States
    const [showAddPartModal, setShowAddPartModal] = useState(false);
    const [newPartName, setNewPartName] = useState('');
    const [newPartDescription, setNewPartDescription] = useState('');
    const [addingPart, setAddingPart] = useState(false);
    
    // Edit Part Modal States
    const [showEditPartModal, setShowEditPartModal] = useState(false);
    const [editingPart, setEditingPart] = useState(null);
    const [editPartName, setEditPartName] = useState('');
    const [editPartDescription, setEditPartDescription] = useState('');
    const [updatingPart, setUpdatingPart] = useState(false);

    useEffect(() => {
        GetProductTypes();
        GetProductParts();
    }, []);

    useEffect(() => {
        if (selectedProductType) {
            GetAssignedParts(selectedProductType.product_type_id);
        } else {
            setAssignedParts([]);
            setAvailableParts([]);
        }
    }, [selectedProductType, productPartsList]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedProductType]);

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
                    console.warn("Failed to parse product type list:", parseError);
                    typesData = [];
                }
            }

            setProductTypeList(Array.isArray(typesData) ? typesData : []);
        } catch (error) {
            console.error("Error fetching product type list:", error);
            setProductTypeList([]);
        }
    };

    const GetProductParts = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetProductParts"
                }
            });
            setProductPartsList(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching product parts list:", error);
            setProductPartsList([]);
        }
    };

    const GetAssignedParts = async (productTypeId) => {
        if (!productTypeId) return;

        setLoading(true);
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({ product_type_id: productTypeId }),
                    operation: "GetProductTypeProductParts"
                }
            });

            let partsData = [];
            if (response.data && Array.isArray(response.data)) {
                partsData = response.data;
            } else if (typeof response.data === 'string') {
                try {
                    const parsed = JSON.parse(response.data);
                    partsData = Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    partsData = [];
                }
            }

            // Extract assigned part IDs (pp_id)
            const assignedPartIds = partsData.map(part => part.pp_id);
            setAssignedParts(partsData);

            // Filter available parts (not assigned)
            const available = productPartsList.filter(part => 
                !assignedPartIds.includes(part.pp_id)
            );
            setAvailableParts(available);
        } catch (error) {
            console.error("Error fetching assigned parts:", error);
            setAssignedParts([]);
            // If no parts assigned, all products are available
            setAvailableParts(productPartsList);
        } finally {
            setLoading(false);
        }
    };

    const handleProductTypeSelect = (productType) => {
        setSelectedProductType(productType);
        setSearchTerm('');
        setCurrentPage(1);
    };

    const assignPart = async (part) => {
        if (!selectedProductType) {
            showAlertError({
                icon: "error",
                title: "No Product Type Selected!",
                text: 'Please select a product type first.',
                button: 'Okay'
            });
            return;
        }

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({
                        product_type_id: selectedProductType.product_type_id,
                        pp_id: part.pp_id
                    }),
                    operation: "AssignProductPart"
                }
            });

            if (response.data && response.data.success !== false) {
                AlertSucces(
                    `Part "${part.parts_name}" assigned to "${selectedProductType.product_type_name}"`,
                    "success",
                    true,
                    'Okay'
                );
                // Refresh assigned parts
                GetAssignedParts(selectedProductType.product_type_id);
            } else {
                showAlertError({
                    icon: "error",
                    title: "Assignment Failed!",
                    text: response.data?.message || 'Failed to assign product part.',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error assigning product part:", error);
            showAlertError({
                icon: "error",
                title: "Error!",
                text: 'An error occurred while assigning the product part.',
                button: 'Try Again'
            });
        }
    };

    const removePart = async (part) => {
        if (!selectedProductType) return;

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({
                        product_type_id: selectedProductType.product_type_id,
                        pp_id: part.pp_id,
                        ppa_id: part.ppa_id || part.id
                    }),
                    operation: "RemoveProductPart"
                }
            });

            if (response.data && response.data.success !== false) {
                AlertSucces(
                    `Part "${part.parts_name || part.part_name}" removed from "${selectedProductType.product_type_name}"`,
                    "success",
                    true,
                    'Okay'
                );
                // Refresh assigned parts
                GetAssignedParts(selectedProductType.product_type_id);
            } else {
                showAlertError({
                    icon: "error",
                    title: "Removal Failed!",
                    text: response.data?.message || 'Failed to remove product part.',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error removing product part:", error);
            showAlertError({
                icon: "error",
                title: "Error!",
                text: 'An error occurred while removing the product part.',
                button: 'Try Again'
            });
        }
    };

    // Filter available parts based on search
    const filteredAvailableParts = useMemo(() => {
        if (!searchTerm.trim()) return availableParts;
        
        const term = searchTerm.toLowerCase();
        return availableParts.filter(part =>
            (part.parts_name && part.parts_name.toLowerCase().includes(term)) ||
            (part.parts_description && part.parts_description.toLowerCase().includes(term))
        );
    }, [availableParts, searchTerm]);

    const totalPages = Math.ceil(filteredAvailableParts.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentProducts = filteredAvailableParts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const openAddPartModal = () => {
        setNewPartName('');
        setNewPartDescription('');
        setShowAddPartModal(true);
    };

    const closeAddPartModal = () => {
        setShowAddPartModal(false);
        setNewPartName('');
        setNewPartDescription('');
    };

    const addPart = async () => {
        if (!newPartName.trim()) {
            showAlertError({
                icon: "error",
                title: "Part Name Required!",
                text: 'Please enter a part name.',
                button: 'Okay'
            });
            return;
        }

        setAddingPart(true);
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({
                        parts_name: newPartName.trim(),
                        parts_description: newPartDescription.trim()
                    }),
                    operation: "AddProductPart"
                }
            });

            let result = response.data;
            if (typeof result === 'string') {
                try {
                    result = JSON.parse(result);
                } catch (e) {
                    result = { success: false, message: 'Invalid response from server' };
                }
            }

            if (result && result.success !== false) {
                AlertSucces(
                    `Part "${newPartName}" added successfully`,
                    "success",
                    true,
                    'Okay'
                );
                closeAddPartModal();
                // Refresh parts list
                GetProductParts();
            } else {
                showAlertError({
                    icon: "error",
                    title: "Failed to Add Part!",
                    text: result?.message || 'Failed to add product part.',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error adding product part:", error);
            showAlertError({
                icon: "error",
                title: "Error!",
                text: 'An error occurred while adding the product part.',
                button: 'Try Again'
            });
        } finally {
            setAddingPart(false);
        }
    };

    const openEditPartModal = (part) => {
        setEditingPart(part);
        setEditPartName(part.parts_name || '');
        setEditPartDescription(part.parts_description || '');
        setShowEditPartModal(true);
    };

    const closeEditPartModal = () => {
        setShowEditPartModal(false);
        setEditingPart(null);
        setEditPartName('');
        setEditPartDescription('');
    };

    const updatePart = async () => {
        if (!editingPart || !editPartName.trim()) {
            showAlertError({
                icon: "error",
                title: "Part Name Required!",
                text: 'Please enter a part name.',
                button: 'Okay'
            });
            return;
        }

        setUpdatingPart(true);
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({
                        pp_id: editingPart.pp_id,
                        parts_name: editPartName.trim(),
                        parts_description: editPartDescription.trim()
                    }),
                    operation: "UpdateProductPart"
                }
            });

            let result = response.data;
            if (typeof result === 'string') {
                try {
                    result = JSON.parse(result);
                } catch (e) {
                    result = { success: false, message: 'Invalid response from server' };
                }
            }

            if (result && result.success !== false) {
                AlertSucces(
                    `Part "${editPartName}" updated successfully`,
                    "success",
                    true,
                    'Okay'
                );
                closeEditPartModal();
                // Refresh parts list
                GetProductParts();
                // Refresh assigned parts if a product type is selected
                if (selectedProductType) {
                    GetAssignedParts(selectedProductType.product_type_id);
                }
            } else {
                showAlertError({
                    icon: "error",
                    title: "Failed to Update Part!",
                    text: result?.message || 'Failed to update product part.',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error updating product part:", error);
            showAlertError({
                icon: "error",
                title: "Error!",
                text: 'An error occurred while updating the product part.',
                button: 'Try Again'
            });
        } finally {
            setUpdatingPart(false);
        }
    };

    const deletePart = async (part) => {
        // Use SweetAlert for confirmation
        const { value: confirmed } = await Swal.fire({
            title: 'Delete Part?',
            text: `Are you sure you want to delete "${part.parts_name}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel'
        });

        if (!confirmed) {
            return;
        }

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'products.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({
                        pp_id: part.pp_id
                    }),
                    operation: "DeleteProductPart"
                }
            });

            let result = response.data;
            if (typeof result === 'string') {
                try {
                    result = JSON.parse(result);
                } catch (e) {
                    result = { success: false, message: 'Invalid response from server' };
                }
            }

            if (result && result.success !== false) {
                AlertSucces(
                    `Part "${part.parts_name}" deleted successfully`,
                    "success",
                    true,
                    'Okay'
                );
                // Refresh parts list
                GetProductParts();
                // Refresh assigned parts if a product type is selected
                if (selectedProductType) {
                    GetAssignedParts(selectedProductType.product_type_id);
                }
            } else {
                showAlertError({
                    icon: "error",
                    title: "Failed to Delete Part!",
                    text: result?.message || 'Failed to delete product part.',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error deleting product part:", error);
            showAlertError({
                icon: "error",
                title: "Error!",
                text: 'An error occurred while deleting the product part.',
                button: 'Try Again'
            });
        }
    };

    return (
        <div className='customer-main'>
            <div className="row">
                <div className="col-12">
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ marginBottom: '8px', color: '#333', fontWeight: 'bold' }}>
                                    Product Parts Assignment
                                </h2>
                                <p style={{ color: '#666', margin: 0 }}>
                                    Assign product parts to product types. Select a product type to view and manage its assigned parts.
                                </p>
                            </div>
                            <button
                                onClick={openAddPartModal}
                                style={{
                                    padding: '10px 20px',
                                    background: '#0e74f0ff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#0c63d4';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#0e74f0ff';
                                }}
                            >
                                Add New Part
                            </button>
                        </div>

                        {/* Product Type Selection */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                                Select Product Type
                            </label>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                gap: '12px'
                            }}>
                                {productTypeList.map((type) => (
                                    <div
                                        key={type.product_type_id}
                                        onClick={() => handleProductTypeSelect(type)}
                                        style={{
                                            padding: '16px',
                                            border: selectedProductType?.product_type_id === type.product_type_id 
                                                ? '2px solid #0e74f0ff' 
                                                : '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            background: selectedProductType?.product_type_id === type.product_type_id 
                                                ? '#eff6ff' 
                                                : 'white',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedProductType?.product_type_id !== type.product_type_id) {
                                                e.currentTarget.style.background = '#f9fafb';
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedProductType?.product_type_id !== type.product_type_id) {
                                                e.currentTarget.style.background = 'white';
                                                e.currentTarget.style.borderColor = '#e5e7eb';
                                            }
                                        }}
                                    >
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                            {type.product_type_name}
                                        </div>
                                        {selectedProductType?.product_type_id === type.product_type_id && (
                                            <div style={{ fontSize: '12px', color: '#0e74f0ff', marginTop: '4px' }}>
                                                ✓ Selected
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* All Parts Management Section */}
                        <div style={{
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '20px',
                            marginBottom: '24px'
                        }}>
                            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                                 Manage All Parts ({productPartsList.length})
                            </h3>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {productPartsList.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '40px',
                                        color: '#6b7280',
                                        background: '#f9fafb',
                                        borderRadius: '8px'
                                    }}>
                                        No parts available. Click "Add New Part" to create one.
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '8px' }}>
                                        {productPartsList.map((part) => (
                                            <div
                                                key={part.pp_id}
                                                style={{
                                                    padding: '12px',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    background: 'white',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#f9fafb';
                                                    e.currentTarget.style.borderColor = '#d1d5db';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'white';
                                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                                }}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                                        {part.parts_name}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                        {part.parts_description || `ID: ${part.pp_id}`}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                    <button
                                                        onClick={() => openEditPartModal(part)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            background: '#0e74f0ff',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px',
                                                            fontWeight: '500'
                                                        }}
                                                        title="Edit Part"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deletePart(part)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            background: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px',
                                                            fontWeight: '500'
                                                        }}
                                                        title="Delete Part"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selected Product Type Info */}
                        {selectedProductType && (
                            <div style={{
                                padding: '16px',
                                background: '#f0f9ff',
                                borderRadius: '8px',
                                marginBottom: '24px',
                                border: '1px solid #bae6fd'
                            }}>
                                <div style={{ fontWeight: '600', marginBottom: '8px', color: '#0369a1' }}>
                                    Managing Parts for: {selectedProductType.product_type_name}
                                </div>
                                <div style={{ fontSize: '14px', color: '#075985' }}>
                                    {assignedParts.length} part(s) currently assigned
                                </div>
                            </div>
                        )}

                        {/* Two Column Layout */}
                        {selectedProductType && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                {/* Assigned Parts */}
                                <div style={{
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '20px'
                                }}>
                                    <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                                        ✅ Assigned Parts ({assignedParts.length})
                                    </h3>
                                    {loading ? (
                                        <div style={{ textAlign: 'center', padding: '40px' }}>
                                            Loading...
                                        </div>
                                    ) : assignedParts.length === 0 ? (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '40px',
                                            color: '#6b7280',
                                            background: '#f9fafb',
                                            borderRadius: '8px'
                                        }}>
                                            No parts assigned yet
                                        </div>
                                    ) : (
                                        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                            {assignedParts.map((part) => {
                                                return (
                                                    <div
                                                        key={part.ppa_id || part.id || part.pp_id}
                                                        style={{
                                                            padding: '12px',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '6px',
                                                            marginBottom: '8px',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            background: '#f9fafb'
                                                        }}
                                                    >
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                                                {part.parts_name}
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                                {part.parts_description || `ID: ${part.pp_id}`}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => removePart(part)}
                                                            style={{
                                                                padding: '6px 12px',
                                                                background: '#ef4444',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Available Parts */}
                                <div style={{
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '20px'
                                }}>
                                    <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                                        📦 Available Parts ({filteredAvailableParts.length})
                                    </h3>
                                    
                                    {/* Search */}
                                    <div style={{ marginBottom: '16px' }}>
                                        <input
                                            type="text"
                                            placeholder="Search parts..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '6px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>

                                    {loading ? (
                                        <div style={{ textAlign: 'center', padding: '40px' }}>
                                            Loading...
                                        </div>
                                    ) : filteredAvailableParts.length === 0 ? (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '40px',
                                            color: '#6b7280',
                                            background: '#f9fafb',
                                            borderRadius: '8px'
                                        }}>
                                            {searchTerm ? 'No parts found matching your search.' : 'All parts are already assigned.'}
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '16px' }}>
                                                {currentProducts.map((part) => (
                                                    <div
                                                        key={part.pp_id}
                                                        style={{
                                                            padding: '12px',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '6px',
                                                            marginBottom: '8px',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            background: 'white',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = '#f9fafb';
                                                            e.currentTarget.style.borderColor = '#d1d5db';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = 'white';
                                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                                        }}
                                                    >
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                                                {part.parts_name}
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                                {part.parts_description || `ID: ${part.pp_id}`}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                            <button
                                                                onClick={() => openEditPartModal(part)}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    background: '#0e74f0ff',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '12px',
                                                                    fontWeight: '500'
                                                                }}
                                                                title="Edit Part"
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                            <button
                                                                onClick={() => deletePart(part)}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    background: '#ef4444',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '12px',
                                                                    fontWeight: '500'
                                                                }}
                                                                title="Delete Part"
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                            <button
                                                                onClick={() => assignPart(part)}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    background: '#10b981',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '12px',
                                                                    fontWeight: '500'
                                                                }}
                                                                title="Assign to Product Type"
                                                            >
                                                                ➕ Assign
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Pagination */}
                                            {totalPages > 1 && (
                                                <CustomPagination
                                                    currentPage={currentPage}
                                                    totalPages={totalPages}
                                                    onPageChange={handlePageChange}
                                                />
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {!selectedProductType && (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px',
                                background: '#f9fafb',
                                borderRadius: '8px',
                                color: '#6b7280'
                            }}>
                                Please select a product type to manage its parts
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Part Modal */}
            <Modal show={showAddPartModal} onHide={closeAddPartModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Product Part</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                            Part Name <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={newPartName}
                            onChange={(e) => setNewPartName(e.target.value)}
                            placeholder="e.g., Size, Cover, Buttons"
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    addPart();
                                }
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                            Part Description
                        </label>
                        <textarea
                            value={newPartDescription}
                            onChange={(e) => setNewPartDescription(e.target.value)}
                            placeholder="e.g., The size of the furniture"
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '14px',
                                resize: 'vertical'
                            }}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeAddPartModal} disabled={addingPart}>
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={addPart} 
                        disabled={addingPart || !newPartName.trim()}
                        style={{ background: '#0e74f0ff', border: 'none' }}
                    >
                        {addingPart ? 'Adding...' : 'Add Part'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Part Modal */}
            <Modal show={showEditPartModal} onHide={closeEditPartModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Product Part</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                            Part Name <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={editPartName}
                            onChange={(e) => setEditPartName(e.target.value)}
                            placeholder="e.g., Size, Cover, Buttons"
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    updatePart();
                                }
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                            Part Description
                        </label>
                        <textarea
                            value={editPartDescription}
                            onChange={(e) => setEditPartDescription(e.target.value)}
                            placeholder="e.g., The size of the furniture"
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '14px',
                                resize: 'vertical'
                            }}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeEditPartModal} disabled={updatingPart}>
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={updatePart} 
                        disabled={updatingPart || !editPartName.trim()}
                        style={{ background: '#0e74f0ff', border: 'none' }}
                    >
                        {updatingPart ? 'Updating...' : 'Update Part'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ProductPartsAssignment;

