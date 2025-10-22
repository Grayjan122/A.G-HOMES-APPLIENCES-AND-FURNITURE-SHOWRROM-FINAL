'use client';
import React from 'react';
import "../../css/location.css";
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import CustomPagination from '@/app/Components/Pagination/pagination';
import { AlertSucces } from '@/app/Components/SweetAlert/success';
import { showAlertError } from '@/app/Components/SweetAlert/error';

const ITEMS_PER_PAGE = 8;

const BranchAdmin = () => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);

  const [message, setMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  // Pagination states
  const [currentPageBranch, setCurrentPageBranch] = useState(1);

  // Filter states for branches
  const [branchSearchFilter, setBranchSearchFilter] = useState('');

  // Modal visibility states
  const [addBranchVisible, setAddBranchVisible] = useState(true);
  const [viewBranchVisible, setViewBranchVisible] = useState(true);
  const [editBranchVisible, setEditBranchVisible] = useState(true);

  // Data arrays
  const [branchList, setBranchList] = useState([]);
  const [locationList, setLocationList] = useState([]);

  // Branch inputs
  const [branchName, setBranchName] = useState('');
  const [branchID, setBranchID] = useState('');

  // Filter branches
  const filteredBranches = useMemo(() => {
    return branchList.filter(branch => {
      if (branchSearchFilter.trim()) {
        const searchTerm = branchSearchFilter.toLowerCase();
        return branch.branch_name.toLowerCase().includes(searchTerm);
      }
      return true;
    });
  }, [branchList, branchSearchFilter]);

  // Pagination for branches
  const totalPagesBranches = Math.ceil(filteredBranches.length / ITEMS_PER_PAGE);
  const startIndexBranches = (currentPageBranch - 1) * ITEMS_PER_PAGE;
  const currentBranchItems = filteredBranches.slice(startIndexBranches, startIndexBranches + ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPageBranch(1);
  }, [branchSearchFilter]);

  const handlePageChangeBranch = (page) => {
    if (page >= 1 && page <= totalPagesBranches) {
      setCurrentPageBranch(page);
    }
  };

  useEffect(() => {
    GetBranch();
    GetLocation();
  }, []);

  // Count locations by branch
  const countLocationsByBranch = (branchId) => {
    return locationList.filter(location => location.branch_id === branchId).length;
  };

  const GetBranch = async () => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'GetDropDown.php';

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify([]),
          operation: "GetBranch"
        }
      });

      setBranchList(response.data);
    } catch (error) {
      console.error("Error fetching branch list:", error);
    }
  }

  const GetLocation = async () => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'location.php';

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify([]),
          operation: "GetLocation"
        }
      });

      setLocationList(response.data);
    } catch (error) {
      console.error("Error fetching location list:", error);
    }
  }

  const resetForm = () => {
    setBranchName('');
    setBranchID('');
    setModalTitle('');
    setMessage('');
  };

  const close_modal = () => {
    setShow(false);
    setAddBranchVisible(true);
    setViewBranchVisible(true);
    setEditBranchVisible(true);
    resetForm();
  }

  const addBranch = async () => {
    if (!branchName.trim()) {
      // setMessage('Please fill in branch name!');
      // setModalTitle('Alert ⚠️');
      // setShow(true);
      showAlertError({
        icon: "warning",
        title: "Branch Details Incomplete!",
        text: 'Please fill all the required details!',
        button: 'Try Again'
      });
      return;
    }

    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'location.php';
    const branchDetails = {
      branchName: branchName,
    }

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(branchDetails),
          operation: "AddBranch"
        }
      });

      if (response.data == 'Success') {
        GetBranch();
        close_modal();
        AlertSucces(
          "New branch is successfully added!",
          "success",
          true,
          'Okay'
        );
      } else {
        showAlertError({
          icon: "error",
          title: "Something Went Wrong!",
          text: 'Failed to add new branch!',
          button: 'Try Again'
        });
      }
    } catch (error) {
      console.error("Error adding new branch", error);
    }
  }

  const GetBranchDetails = async (branch_id) => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'location.php';
    const branchDetails = {
      branchID: branch_id
    }

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(branchDetails),
          operation: "GetBranchDetails"
        }
      });

      setBranchName(response.data[0].branch_name);
      setBranchID(response.data[0].branch_id);

    } catch (error) {
      console.error("Error fetching branch details:", error);
    }
  }

  const updateBranch = async () => {
    const baseURL = sessionStorage.getItem('baseURL');
    const url = baseURL + 'location.php';
    const branchDetails = {
      branchName: branchName,
      branchID: branchID
    }

    try {
      const response = await axios.get(url, {
        params: {
          json: JSON.stringify(branchDetails),
          operation: "UpdateBranchDetails"
        }
      });

      if (response.data == 'Success') {
        GetBranch();
        close_modal();
        AlertSucces(
          "Branch details is successfully updated!",
          "success",
          true,
          'Okay'
        );
      } else {
        showAlertError({
          icon: "error",
          title: "Something Went Wrong!",
          text: 'Failed to update branch details!',
          button: 'Try Again'
        });
      }
    } catch (error) {
      console.error("Error updating branch details:", error);
    }
  }

  const triggerModal = (operation, id, e) => {
    switch (operation) {
      case 'addBranch':
        setAddBranchVisible(false);
        break;
      case 'viewBranch':
        GetBranchDetails(id);
        setViewBranchVisible(false);
        break;
      case 'editBranch':
        GetBranchDetails(id);
        setEditBranchVisible(false);
        break;
    }
  }

  return (
    <>
      <Modal show={show} onHide={handleClose} size='sm'>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Branch Modal */}
      <Modal show={!addBranchVisible} onHide={close_modal} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Add Branch</Modal.Title>
        </Modal.Header>
        <Modal.Body className='modal-add-product-body'>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Branch Name</label>
            <input
              className='prod-name-input'
              type='text'
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={close_modal}>
            Close
          </Button>
          <Button variant="primary" onClick={addBranch}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Branch Modal */}
      <Modal show={!viewBranchVisible} onHide={close_modal} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Branch Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className='modal-add-product-body'>
          <div className='div-input-add-prod' style={{ paddingBottom: '20px' }}>
            <label className='add-prod-label'>Branch ID</label>
            <input
              className='prod-name-input'
              disabled={true}
              value={branchID}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Branch Name</label>
            <input
              className='prod-name-input'
              disabled={true}
              value={branchName}
            />
          </div>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Total Locations</label>
            <input
              className='prod-name-input'
              disabled={true}
              value={countLocationsByBranch(branchID)}
            />
          </div>
        </Modal.Body>
      </Modal>

      {/* Edit Branch Modal */}
      <Modal show={!editBranchVisible} onHide={close_modal} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Edit Branch Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className='modal-add-product-body'>
          <div className='div-input-add-prod'>
            <label className='add-prod-label'>Branch Name</label>
            <input
              className='prod-name-input'
              type='text'
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={close_modal}>
            Close
          </Button>
          <Button variant="primary" onClick={updateBranch}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>

      <div className='customer-main'>
        <div className='product-header'>
          <div className='head'>
            <h1 className='h-customer'>BRANCH MANAGEMENT</h1>
          </div>
          <div>
            <button className='add-cust-bttn' onClick={() => triggerModal('addBranch', '0')}>
              ADD BRANCH+
            </button>
          </div>
        </div>

        {/* Branch Search Filter */}
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
              Search Branches
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
                placeholder="Search branch names..."
                value={branchSearchFilter}
                onChange={(e) => setBranchSearchFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 35px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />

              {branchSearchFilter && (
                <button
                  type="button"
                  onClick={() => setBranchSearchFilter('')}
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

        {/* Branches Cards */}
        <div style={{
          padding: '20px 0',
          minHeight: '40vh'
        }}>
          {currentBranchItems && currentBranchItems.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '20px',
              padding: '0 10px'
            }}>
              {currentBranchItems.map((branch, index) => {
                const locationCount = countLocationsByBranch(branch.branch_id);

                return (
                  <div
                    key={index}
                    onClick={() => triggerModal('viewBranch', branch.branch_id)}
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
                    {/* Branch Header */}
                    <div style={{
                      height: '120px',
                      background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      color: 'white'
                    }}>
                      <div style={{
                        fontSize: '48px',
                        opacity: 0.8
                      }}>
                        🏢
                      </div>

                      {/* Location Count Badge */}
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
                        <span style={{ fontSize: '16px' }}>📍</span>
                        {locationCount}
                      </div>

                      {/* Edit Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerModal('editBranch', branch.branch_id, e);
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
                        title="Edit Branch"
                      >
                        ✏️
                      </button>
                    </div>

                    {/* Branch Information */}
                    <div style={{ padding: '25px' }}>
                      <h3 style={{
                        margin: '0 0 20px 0',
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#212529',
                        lineHeight: '1.3',
                        textAlign: 'center'
                      }}>
                        {branch.branch_name}
                      </h3>

                      {/* Branch Stats */}
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
                            {locationCount}
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: '#6c757d',
                            fontWeight: '500'
                          }}>
                            Total Locations
                          </div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#007bff',
                            marginBottom: '5px'
                          }}>
                            {branch.branch_id}
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: '#6c757d',
                            fontWeight: '500'
                          }}>
                            Branch ID
                          </div>
                        </div>
                      </div>

                      {/* Branch Status */}
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
                            backgroundColor: locationCount > 0 ? '#28a745' : '#ffc107'
                          }}></div>
                          <span style={{
                            fontSize: '13px',
                            color: '#6c757d',
                            fontWeight: '500'
                          }}>
                            {locationCount > 0 ? 'Active Branch' : 'No Locations'}
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
                🏢
              </div>
              <h3 style={{
                color: '#495057',
                marginBottom: '12px',
                fontWeight: '600',
                fontSize: '24px'
              }}>
                {branchList.length === 0 ? 'No branches available' : 'No branches match the current filters'}
              </h3>
              <p style={{
                margin: '0 0 20px 0',
                fontSize: '16px',
                maxWidth: '400px',
                lineHeight: '1.5',
                color: '#6c757d'
              }}>
                {branchList.length === 0
                  ? 'Start by creating your first branch using the "ADD BRANCH+" button above.'
                  : 'Try adjusting your search terms to see more branches.'
                }
              </p>
              {branchList.length === 0 && (
                <button
                  onClick={() => triggerModal('addBranch', '0')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#218838';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#28a745';
                  }}
                >
                  Create Your First Branch
                </button>
              )}
            </div>
          )}
        </div>

        {/* Branch Statistics Summary */}
        {currentBranchItems && currentBranchItems.length > 0 && (
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
                  {filteredBranches.length}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  fontWeight: '500'
                }}>
                  Total Branches
                </div>
              </div>

              <div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#28a745',
                  marginBottom: '5px'
                }}>
                  {filteredBranches.filter(branch =>
                    countLocationsByBranch(branch.branch_id) > 0
                  ).length}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  fontWeight: '500'
                }}>
                  Active Branches
                </div>
              </div>

              <div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#ffc107',
                  marginBottom: '5px'
                }}>
                  {filteredBranches.filter(branch =>
                    countLocationsByBranch(branch.branch_id) === 0
                  ).length}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  fontWeight: '500'
                }}>
                  Empty Branches
                </div>
              </div>

              <div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#17a2b8',
                  marginBottom: '5px'
                }}>
                  {locationList.length}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  fontWeight: '500'
                }}>
                  Total Locations
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Branch Pagination */}
        {totalPagesBranches > 1 && currentBranchItems && currentBranchItems.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px'
          }}>
            <CustomPagination
              currentPage={currentPageBranch}
              totalPages={totalPagesBranches}
              onPageChange={handlePageChangeBranch}
              color="green"
            />
          </div>
        )}
      </div>
    </>
  )
}

export default BranchAdmin;