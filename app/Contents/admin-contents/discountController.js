'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';
import Swal from 'sweetalert2';

const DiscountController = () => {
    const [currentDiscount, setCurrentDiscount] = useState(null);
    const [allDiscounts, setAllDiscounts] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);
    
    // Form states
    const [discountType, setDiscountType] = useState('percentage');
    const [discountValue, setDiscountValue] = useState('');
    const [minPurchaseAmount, setMinPurchaseAmount] = useState('');
    const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(1);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        GetCurrentDiscount();
        GetAllDiscounts();
    }, []);

    const GetCurrentDiscount = async () => {
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'discounts.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetCurrentDiscount"
                }
            });

            let discount = response.data;
            if (typeof discount === 'string' && discount !== 'null') {
                try {
                    discount = JSON.parse(discount);
                } catch (e) {
                    discount = null;
                }
            }

            setCurrentDiscount(discount);
        } catch (error) {
            console.error("Error fetching current discount:", error);
            setCurrentDiscount(null);
        }
    };

    const GetAllDiscounts = async () => {
        setLoading(true);
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'discounts.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify([]),
                    operation: "GetAllDiscounts"
                }
            });

            let discounts = response.data;
            if (typeof discounts === 'string') {
                try {
                    discounts = JSON.parse(discounts);
                } catch (e) {
                    discounts = [];
                }
            }

            setAllDiscounts(Array.isArray(discounts) ? discounts : []);
        } catch (error) {
            console.error("Error fetching all discounts:", error);
            setAllDiscounts([]);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (discount = null) => {
        if (discount) {
            setEditingDiscount(discount);
            setDiscountType(discount.discount_type || 'percentage');
            setDiscountValue(discount.discount_value || '');
            setMinPurchaseAmount(discount.min_purchase_amount || '');
            setMaxDiscountAmount(discount.max_discount_amount || '');
            setStartDate(discount.start_date ? discount.start_date.split(' ')[0] : '');
            setEndDate(discount.end_date ? discount.end_date.split(' ')[0] : '');
            setDescription(discount.description || '');
            setIsActive(discount.is_active || 0);
        } else {
            // New discount
            setEditingDiscount(null);
            setDiscountType('percentage');
            setDiscountValue('');
            setMinPurchaseAmount('');
            setMaxDiscountAmount('');
            setStartDate('');
            setEndDate('');
            setDescription('');
            setIsActive(1);
        }
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingDiscount(null);
        setDiscountType('percentage');
        setDiscountValue('');
        setMinPurchaseAmount('');
        setMaxDiscountAmount('');
        setStartDate('');
        setEndDate('');
        setDescription('');
        setIsActive(1);
    };

    const saveDiscount = async () => {
        // Validation
        if (!discountValue || parseFloat(discountValue) <= 0) {
            showAlertError({
                icon: "error",
                title: "Invalid Discount Value!",
                text: 'Please enter a valid discount value greater than 0.',
                button: 'Okay'
            });
            return;
        }

        if (discountType === 'percentage' && parseFloat(discountValue) > 100) {
            showAlertError({
                icon: "error",
                title: "Invalid Percentage!",
                text: 'Percentage discount cannot exceed 100%.',
                button: 'Okay'
            });
            return;
        }

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            showAlertError({
                icon: "error",
                title: "Invalid Date Range!",
                text: 'Start date cannot be after end date.',
                button: 'Okay'
            });
            return;
        }

        setSaving(true);
        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'discounts.php';
        const userId = sessionStorage.getItem('user_id');

        try {
            const discountData = {
                discount_type: discountType,
                discount_value: parseFloat(discountValue),
                min_purchase_amount: parseFloat(minPurchaseAmount) || 0,
                max_discount_amount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
                start_date: startDate || null,
                end_date: endDate || null,
                description: description,
                is_active: isActive,
                created_by: userId ? parseInt(userId) : null
            };

            if (editingDiscount) {
                discountData.discount_id = editingDiscount.discount_id;
            }

            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify(discountData),
                    operation: "SetDiscount"
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
                    editingDiscount ? 'Discount updated successfully' : 'Discount created successfully',
                    "success",
                    true,
                    'Okay'
                );
                closeEditModal();
                GetCurrentDiscount();
                GetAllDiscounts();
            } else {
                showAlertError({
                    icon: "error",
                    title: "Failed!",
                    text: result?.message || 'Failed to save discount.',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error saving discount:", error);
            showAlertError({
                icon: "error",
                title: "Error!",
                text: 'An error occurred while saving the discount.',
                button: 'Try Again'
            });
        } finally {
            setSaving(false);
        }
    };

    const deactivateDiscount = async (discount) => {
        const { value: confirmed } = await Swal.fire({
            title: 'Deactivate Discount?',
            text: `Are you sure you want to deactivate this discount?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, deactivate',
            cancelButtonText: 'Cancel'
        });

        if (!confirmed) return;

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'discounts.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({ discount_id: discount.discount_id }),
                    operation: "DeactivateDiscount"
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
                    'Discount deactivated successfully',
                    "success",
                    true,
                    'Okay'
                );
                GetCurrentDiscount();
                GetAllDiscounts();
            } else {
                showAlertError({
                    icon: "error",
                    title: "Failed!",
                    text: result?.message || 'Failed to deactivate discount.',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error deactivating discount:", error);
            showAlertError({
                icon: "error",
                title: "Error!",
                text: 'An error occurred while deactivating the discount.',
                button: 'Try Again'
            });
        }
    };

    const deleteDiscount = async (discount) => {
        const { value: confirmed } = await Swal.fire({
            title: 'Delete Discount?',
            text: `Are you sure you want to delete this discount? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel'
        });

        if (!confirmed) return;

        const baseURL = sessionStorage.getItem('baseURL');
        const url = baseURL + 'discounts.php';

        try {
            const response = await axios.get(url, {
                params: {
                    json: JSON.stringify({ discount_id: discount.discount_id }),
                    operation: "DeleteDiscount"
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
                    'Discount deleted successfully',
                    "success",
                    true,
                    'Okay'
                );
                GetCurrentDiscount();
                GetAllDiscounts();
            } else {
                showAlertError({
                    icon: "error",
                    title: "Failed!",
                    text: result?.message || 'Failed to delete discount.',
                    button: 'Try Again'
                });
            }
        } catch (error) {
            console.error("Error deleting discount:", error);
            showAlertError({
                icon: "error",
                title: "Error!",
                text: 'An error occurred while deleting the discount.',
                button: 'Try Again'
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateDiscount = (amount) => {
        if (!currentDiscount) return 0;
        
        const purchaseAmount = parseFloat(amount) || 0;
        if (purchaseAmount < currentDiscount.min_purchase_amount) {
            return 0;
        }

        let discount = 0;
        if (currentDiscount.discount_type === 'percentage') {
            discount = (purchaseAmount * currentDiscount.discount_value) / 100;
            if (currentDiscount.max_discount_amount) {
                discount = Math.min(discount, currentDiscount.max_discount_amount);
            }
        } else {
            discount = currentDiscount.discount_value;
        }

        return discount;
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
                                    Ecommerce Discount Controller
                                </h2>
                                <p style={{ color: '#666', margin: 0 }}>
                                    Manage discounts for the ecommerce shop. Set current discounts and view discount history.
                                </p>
                            </div>
                            <button
                                onClick={() => openEditModal()}
                                style={{
                                    padding: '10px 20px',
                                    background: '#0e74f0ff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#0c63d4';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#0e74f0ff';
                                }}
                            >
                                Add New Discount
                            </button>
                        </div>

                        {/* Current Active Discount */}
                        <div style={{
                            background: currentDiscount ? '#f0f9ff' : '#f9fafb',
                            border: `1px solid ${currentDiscount ? '#bae6fd' : '#e5e7eb'}`,
                            borderRadius: '8px',
                            padding: '20px',
                            marginBottom: '24px'
                        }}>
                            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: currentDiscount ? '#0369a1' : '#6b7280' }}>
                                {currentDiscount ? '✅ Active Discount' : 'ℹ️ No Active Discount'}
                            </h3>
                            {currentDiscount ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Discount Type</div>
                                        <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                                            {currentDiscount.discount_type === 'percentage' ? `${currentDiscount.discount_value}%` : `₱${currentDiscount.discount_value}`}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Minimum Purchase</div>
                                        <div style={{ fontWeight: '600' }}>₱{parseFloat(currentDiscount.min_purchase_amount || 0).toLocaleString()}</div>
                                    </div>
                                    {currentDiscount.max_discount_amount && (
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Max Discount</div>
                                            <div style={{ fontWeight: '600' }}>₱{parseFloat(currentDiscount.max_discount_amount).toLocaleString()}</div>
                                        </div>
                                    )}
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Valid Period</div>
                                        <div style={{ fontWeight: '600', fontSize: '12px' }}>
                                            {currentDiscount.start_date ? formatDate(currentDiscount.start_date) : 'No start date'} - {currentDiscount.end_date ? formatDate(currentDiscount.end_date) : 'No end date'}
                                        </div>
                                    </div>
                                    {currentDiscount.description && (
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Description</div>
                                            <div style={{ fontWeight: '500' }}>{currentDiscount.description}</div>
                                        </div>
                                    )}
                                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <button
                                            onClick={() => openEditModal(currentDiscount)}
                                            style={{
                                                padding: '8px 16px',
                                                background: '#0e74f0ff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deactivateDiscount(currentDiscount)}
                                            style={{
                                                padding: '8px 16px',
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Deactivate
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ color: '#6b7280', margin: 0 }}>
                                    No active discount. Click "Add New Discount" to create one.
                                </p>
                            )}
                        </div>

                        {/* Discount History */}
                        <div style={{
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '20px'
                        }}>
                            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                                Discount History ({allDiscounts.length})
                            </h3>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    Loading...
                                </div>
                            ) : allDiscounts.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px',
                                    color: '#6b7280',
                                    background: '#f9fafb',
                                    borderRadius: '8px'
                                }}>
                                    No discount history available.
                                </div>
                            ) : (
                                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Type</th>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Value</th>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Min Purchase</th>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Period</th>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Status</th>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Created</th>
                                                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allDiscounts.map((discount) => (
                                                <tr key={discount.discount_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                    <td style={{ padding: '12px', fontSize: '14px', textTransform: 'capitalize' }}>
                                                        {discount.discount_type}
                                                    </td>
                                                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600' }}>
                                                        {discount.discount_type === 'percentage' ? `${discount.discount_value}%` : `₱${discount.discount_value}`}
                                                    </td>
                                                    <td style={{ padding: '12px', fontSize: '14px' }}>
                                                        ₱{parseFloat(discount.min_purchase_amount || 0).toLocaleString()}
                                                    </td>
                                                    <td style={{ padding: '12px', fontSize: '12px', color: '#6b7280' }}>
                                                        {discount.start_date ? formatDate(discount.start_date).split(',')[0] : 'No start'} - {discount.end_date ? formatDate(discount.end_date).split(',')[0] : 'No end'}
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <span style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                            background: discount.is_active ? '#dcfce7' : '#fee2e2',
                                                            color: discount.is_active ? '#166534' : '#991b1b'
                                                        }}>
                                                            {discount.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px', fontSize: '12px', color: '#6b7280' }}>
                                                        {formatDate(discount.created_at).split(',')[0]}
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                            <button
                                                                onClick={() => openEditModal(discount)}
                                                                style={{
                                                                    padding: '4px 8px',
                                                                    background: '#0e74f0ff',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '11px'
                                                                }}
                                                                title="Edit"
                                                            >
                                                                ✏️
                                                            </button>
                                                            {discount.is_active && (
                                                                <button
                                                                    onClick={() => deactivateDiscount(discount)}
                                                                    style={{
                                                                        padding: '4px 8px',
                                                                        background: '#f59e0b',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '11px'
                                                                    }}
                                                                    title="Deactivate"
                                                                >
                                                                    ⏸️
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => deleteDiscount(discount)}
                                                                style={{
                                                                    padding: '4px 8px',
                                                                    background: '#ef4444',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '11px'
                                                                }}
                                                                title="Delete"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit/Create Discount Modal */}
            <Modal show={showEditModal} onHide={closeEditModal} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingDiscount ? 'Edit Discount' : 'Create New Discount'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ display: 'grid', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                                Discount Type <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <select
                                value={discountType}
                                onChange={(e) => setDiscountType(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₱)</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                                Discount Value <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max={discountType === 'percentage' ? '100' : undefined}
                                value={discountValue}
                                onChange={(e) => setDiscountValue(e.target.value)}
                                placeholder={discountType === 'percentage' ? 'e.g., 10 for 10%' : 'e.g., 500 for ₱500'}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                            {discountType === 'percentage' && (
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                    Maximum: 100%
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                                Minimum Purchase Amount
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={minPurchaseAmount}
                                onChange={(e) => setMinPurchaseAmount(e.target.value)}
                                placeholder="e.g., 5000"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                Minimum order amount to qualify for discount (0 = no minimum)
                            </div>
                        </div>

                        {discountType === 'percentage' && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                                    Maximum Discount Amount (Optional)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={maxDiscountAmount}
                                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                                    placeholder="e.g., 1000"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                    Maximum discount amount (leave empty for no limit)
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                                    Start Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                                    End Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g., 10% off on orders above 5000"
                                rows={3}
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

                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#333' }}>
                                <input
                                    type="checkbox"
                                    checked={isActive === 1}
                                    onChange={(e) => setIsActive(e.target.checked ? 1 : 0)}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                Active (Only one discount can be active at a time)
                            </label>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeEditModal} disabled={saving}>
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={saveDiscount} 
                        disabled={saving || !discountValue}
                        style={{ background: '#0e74f0ff', border: 'none' }}
                    >
                        {saving ? 'Saving...' : (editingDiscount ? 'Update Discount' : 'Create Discount')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default DiscountController;

