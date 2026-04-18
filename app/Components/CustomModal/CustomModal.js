import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

/**
 * A highly reusable custom modal component based on react-bootstrap/Modal.
 * 
 * @param {boolean} show - Controls the visibility of the modal.
 * @param {function} onHide - Function to call when the modal is closed.
 * @param {string} title - The title displayed in the modal header.
 * @param {string} size - Size of the modal ('sm', 'lg', 'xl', or default 'md').
 * @param {React.ReactNode} children - The content inside the modal body.
 * @param {string} bodyClassName - Optional CSS class for the Modal.Body.
 * @param {boolean} showFooter - Whether to display the footer. Default is true.
 * @param {string} primaryButtonText - Text for the primary action button.
 * @param {function} onPrimaryAction - Function to call on primary button click.
 * @param {boolean} disablePrimary - Completely disables the primary button if true.
 * @param {boolean} isSubmitting - Shows a spinner and disables buttons.
 * @param {string} secondaryButtonText - Text for the secondary (close) button.
 * @param {boolean} hideSecondary - Hides the secondary button if true.
 */
export default function CustomModal({
    show,
    onHide,
    title,
    size = 'md',
    children,
    bodyClassName = '',
    showFooter = true,
    primaryButtonText = 'Save',
    onPrimaryAction,
    disablePrimary = false,
    isSubmitting = false,
    secondaryButtonText = 'Close',
    hideSecondary = false
}) {
    return (
        <Modal show={show} onHide={onHide} size={size}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className={bodyClassName}>
                {children}
            </Modal.Body>
            {showFooter && (
                <Modal.Footer>
                    {!hideSecondary && (
                        <Button 
                            variant="secondary" 
                            onClick={onHide} 
                            disabled={isSubmitting}
                        >
                            {secondaryButtonText}
                        </Button>
                    )}
                    {onPrimaryAction && (
                        <Button 
                            variant="primary" 
                            onClick={onPrimaryAction} 
                            disabled={isSubmitting || disablePrimary}
                        >
                            {isSubmitting ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Saving...
                                </>
                            ) : (
                                primaryButtonText
                            )}
                        </Button>
                    )}
                </Modal.Footer>
            )}
        </Modal>
    );
}
