import React, { useState } from 'react';
import { X, Printer } from 'lucide-react';

// Add this component to your file
export function ReceiptModal({ transaction, onClose }) {
    const handlePrint = () => {
        window.print();
    };

    if (!transaction) return null;

    return (
        <>
            <style jsx>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-area, .print-area * {
                        visibility: visible;
                    }
                    .print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                padding: '16px'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}>
                    {/* Header with buttons */}
                    <div className="no-print" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '20px 24px',
                        borderBottom: '1px solid #e5e7eb'
                    }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Receipt</h2>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={handlePrint}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 16px',
                                    background: '#7c3aed',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                <Printer size={18} />
                                Print
                            </button>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: '8px',
                                    background: '#f3f4f6',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Receipt Content */}
                    <div className="print-area" style={{ padding: '24px' }}>
                        {/* Company Header */}
                        <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '2px solid #000', paddingBottom: '16px' }}>
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>A.G Custom Furniture</h1>
                            <p style={{ margin: '4px 0', fontSize: '14px' }}>{transaction.location}</p>
                            <p style={{ margin: '4px 0', fontSize: '14px' }}>Contact: (123) 456-7890</p>
                        </div>

                        {/* Transaction Details */}
                        <div style={{ marginBottom: '20px', fontSize: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontWeight: '600' }}>Invoice #:</span>
                                <span>{transaction.invoice_id}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontWeight: '600' }}>Date:</span>
                                <span>{transaction.date}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontWeight: '600' }}>Time:</span>
                                <span>{transaction.time}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontWeight: '600' }}>Customer:</span>
                                <span>{transaction.customer?.cust_name || 'Walk-in'}</span>
                            </div>
                            {transaction.customer?.phone && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontWeight: '600' }}>Phone:</span>
                                    <span>{transaction.customer.phone}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontWeight: '600' }}>Payment:</span>
                                <span style={{ textTransform: 'capitalize' }}>{transaction.payment_method}</span>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div style={{ marginBottom: '20px', borderTop: '2px solid #000', borderBottom: '2px solid #000', paddingTop: '12px', paddingBottom: '12px' }}>
                            <table style={{ width: '100%', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <th style={{ textAlign: 'left', paddingBottom: '8px', fontWeight: '600' }}>Item</th>
                                        <th style={{ textAlign: 'center', paddingBottom: '8px', fontWeight: '600' }}>Qty</th>
                                        <th style={{ textAlign: 'right', paddingBottom: '8px', fontWeight: '600' }}>Price</th>
                                        <th style={{ textAlign: 'right', paddingBottom: '8px', fontWeight: '600' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transaction.items.map((item, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ paddingTop: '8px', paddingBottom: '8px' }}>
                                                <div style={{ fontWeight: '500' }}>{item.product_name}</div>
                                                {item.isCustom && (
                                                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                                        {item.customizationType === 'full' ? 'Full Custom' : 'Semi-Custom'}
                                                    </div>
                                                )}
                                                {item.modifications && (
                                                    <div style={{ fontSize: '11px', color: '#7c3aed', marginTop: '2px', fontStyle: 'italic' }}>
                                                        {item.modifications}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center', paddingTop: '8px', paddingBottom: '8px' }}>{item.quantity}</td>
                                            <td style={{ textAlign: 'right', paddingTop: '8px', paddingBottom: '8px' }}>₱{item.price.toLocaleString()}</td>
                                            <td style={{ textAlign: 'right', paddingTop: '8px', paddingBottom: '8px', fontWeight: '500' }}>
                                                ₱{(item.price * item.quantity).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div style={{ marginBottom: '20px', fontSize: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Subtotal:</span>
                                <span>₱{transaction.subtotal.toLocaleString()}</span>
                            </div>
                            {transaction.discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#16a34a' }}>
                                    <span>Discount:</span>
                                    <span>-₱{transaction.discount.toLocaleString()}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                                <span>Total:</span>
                                <span>₱{transaction.total.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold', color: '#7c3aed' }}>
                                <span>Amount Paid:</span>
                                <span>₱{transaction.amount_paid.toLocaleString()}</span>
                            </div>
                            {transaction.remainingBalance > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold', color: '#dc2626' }}>
                                    <span>Remaining Balance:</span>
                                    <span>₱{transaction.remainingBalance.toLocaleString()}</span>
                                </div>
                            )}
                        </div>

                        {/* Installment Details */}
                        {transaction.installment_details && (
                            <div style={{ marginBottom: '20px', padding: '16px', background: '#fff7ed', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', margin: '0 0 12px 0' }}>Installment Plan</h3>
                                <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span>Monthly Payment:</span>
                                        <span style={{ fontWeight: '600' }}>₱{transaction.installment_details.monthly_payment.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span>Duration:</span>
                                        <span style={{ fontWeight: '600' }}>{transaction.installment_details.months} months</span>
                                    </div>
                                    {transaction.installment_details.interest_rate > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span>Interest Rate:</span>
                                            <span style={{ fontWeight: '600' }}>{transaction.installment_details.interest_rate}%</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', paddingTop: '6px', borderTop: '1px solid #fed7aa' }}>
                                        <span style={{ fontWeight: '500' }}>Total with Interest:</span>
                                        <span style={{ fontWeight: '700' }}>₱{transaction.installment_details.total_with_interest.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #fed7aa' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>Payment Schedule:</div>
                                    <div style={{ fontSize: '11px', maxHeight: '150px', overflowY: 'auto' }}>
                                        {transaction.installment_details.payment_dates.map((date, index) => (
                                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', padding: '4px', background: '#fffbeb', borderRadius: '4px' }}>
                                                <span>Payment #{index + 1}: {date}</span>
                                                <span style={{ fontWeight: '600' }}>₱{transaction.installment_details.monthly_payment.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '2px solid #000', fontSize: '12px', color: '#6b7280' }}>
                            <p style={{ margin: '4px 0' }}>Thank you for your business!</p>
                            <p style={{ margin: '4px 0' }}>For inquiries, please contact us</p>
                            <p style={{ margin: '4px 0', fontStyle: 'italic' }}>This is an official receipt</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}