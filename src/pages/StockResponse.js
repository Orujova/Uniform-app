import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaCheck,
  FaTimes,
  FaShippingFast,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Table from "../components/Table";
import { API_BASE_URL } from "../config";
import StatusFilter from "../components/StatusFilter";
import LoadingSpinner from "../components/LoadingSpinner";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 25px 30px;
  border-radius: 10px;
  width: 450px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  position: relative;
`;

const ModalInput = styled.input`
  padding: 12px;
  width: 100%;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  background-color: ${props => props.disabled ? '#e9ecef' : '#fff'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'text'};
`;

const ModalButton = styled.button`
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background-color: ${(props) => (props.disabled ? "#adb5bd" : "#0284c7")};
  border: none;
  border-radius: 6px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? "0.7" : "1")};
  transition: background-color 0.2s ease-in-out;
  margin-right: 10px;

  &:hover:not(:disabled) {
    background-color: ${(props) => (props.disabled ? "#adb5bd" : "#075985")};
  }
`;


const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;

  &:hover {
    color: #343a40;
  }
`;


const WarningMessage = styled.div`
  color: #b91c1c;
  font-size: 14px;
  margin-bottom: 15px;
  padding: 10px 15px;
  background-color: #fee2e2;
  border-left: 4px solid #ef4444;
  border-radius: 4px;
  text-align: left;
`;

const InfoSection = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: #6c757d;
  font-size: 14px;
  flex-shrink: 0;
  margin-right: 10px;
`;

const InfoValue = styled.span`
  font-weight: 600;
  color: #212529;
  font-size: 14px;
  text-align: right;
`;

const StockContainer = styled.div`
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 15px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  color: #1f2937;
  font-weight: 600;
`;

const StyledButton = styled.button`
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background-color: #6c757d;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover:not(:disabled) {
    background-color: #5a6268;
  }
   &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
   }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 25px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
`;

const PaginationButton = styled.button`
  padding: 5px 10px;
  min-width: 34px;
  height: 34px;
  margin: 0 3px;
  border: 1px solid #dee2e6;
  background-color: ${(props) => (props.active ? "#0284c7" : "#ffffff")};
  color: ${(props) => (props.active ? "#ffffff" : "#212529")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease-in-out;
  border-radius: 6px;

  &:hover:not(:disabled) {
    background-color: ${(props) => (props.active ? "#0277b5" : "#e9ecef")};
    border-color: #adb5bd;
    z-index: 2;
  }

  &:disabled {
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
    border-color: #dee2e6;
  }

  &:first-child, &:last-child {
    border-radius: 6px;
  }
`;


const ActionButton = styled.button`
  cursor: pointer;
  background-color: ${(props) =>
    props.variant === "accept" ? "#28a745" : "#dc3545"};
  color: #fff;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease;
  display: inline-flex;
  align-items: center;
  gap: 5px;

  &:hover:not(:disabled) {
    background-color: ${(props) =>
      props.variant === "accept" ? "#218838" : "#c82333"};
  }

   &:active:not(:disabled) {
       transform: scale(0.98);
   }

   &:disabled {
       opacity: 0.65;
       cursor: not-allowed;
   }
`;

const IconWrapper = styled.span`
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.color || "#6c757d"};
`;

const InfoWarningMessage = styled.div`
  color: #0c5460;
  font-size: 14px;
  margin-bottom: 15px;
  padding: 10px 15px;
  background-color: #d1ecf1;
  border-left: 4px solid #bee5eb;
  border-radius: 4px;
  text-align: left;
`;


const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
  color: #495057;
`;

const statusOptions = [
    { label: "Pending", value: "Pending" },
    { label: "Intransit", value: "Intransit" },
    { label: "Accepted", value: "Accepted" },
    { label: "Rejected", value: "Rejected" },
];

const StockResponse = () => {
    const token = localStorage.getItem("token");
    const [bgsRequestData, setBgsRequestData] = useState([]);
    const [dcStockMap, setDcStockMap] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [count, setCount] = useState(0);
    const [statusFilter, setStatusFilter] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);
    const [availableStock, setAvailableStock] = useState(0);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, [token]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        setError("");
        setBgsRequestData([]);
        setDcStockMap({});

        try {
            const [requestsResponse, dcStockResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/api/BGSStockRequest`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/api/DCStock`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (!requestsResponse.ok) {
                throw new Error(`HTTP Error fetching BGS Requests: ${requestsResponse.status}`);
            }
            if (!dcStockResponse.ok) {
                throw new Error(`HTTP Error fetching DC Stock: ${dcStockResponse.status}`);
            }

            const requestsJson = await requestsResponse.json();
            const dcStockJson = await dcStockResponse.json();

            const stockRequests = requestsJson[0]?.BGSStockRequests || [];
            const sortedRequests = [...stockRequests].sort((a, b) =>
                 (new Date(b.CreatedDate || 0)) - (new Date(a.CreatedDate || 0))
             );

            const uniformDetailsPromises = sortedRequests.map(item => {
                if (!item.UniformId) return Promise.resolve(null);
                return fetch(`${API_BASE_URL}/api/Uniform/${item.UniformId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(res => res.ok ? res.json() : null)
                   .catch(err => {
                      console.error(`Error fetching detail for Uniform ${item.UniformId}:`, err);
                      return null;
                   });
            });

            const uniformDetailsResults = await Promise.allSettled(uniformDetailsPromises);

            const combinedRequestData = sortedRequests.map((item, index) => {
                 const detailResult = uniformDetailsResults[index];
                 const uniformDetails = detailResult.status === 'fulfilled' ? detailResult.value : { UniType: 'N/A', Size: 'N/A', Gender: 'N/A' };
                 return { ...item, UniformDetails: uniformDetails || { UniType: 'N/A', Size: 'N/A', Gender: 'N/A' } };
             });
             setBgsRequestData(combinedRequestData);

            const stocks = dcStockJson[0]?.DCStocks || [];

            if (!Array.isArray(stocks)) {
                console.error("Could not extract DCStocks array from response:", dcStockJson);
            }

            const stockMap = {};
            if(Array.isArray(stocks)) {
                stocks.forEach((item) => {
                     if (item && item.UniformId != null && typeof item.StockCount === 'number') {
                         if (stockMap[item.UniformId]) {
                             stockMap[item.UniformId] += item.StockCount;
                         } else {
                             stockMap[item.UniformId] = item.StockCount;
                        }
                     } else {
                         console.warn("Skipping invalid DC stock item during map creation:", item);
                      }
                });
           }

            setDcStockMap(stockMap);


        } catch (err) {
            console.error("Error in fetchInitialData:", err);
            setError(`Failed to load data: ${err.message}. Please try refreshing.`);
            showToast("Failed to load data", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async (requestId) => {
        if (!requestId) return;
        setIsLoading(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/BGSStockRequest/reject?id=${requestId}`,
                {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}`, Accept: "*/*" },
                }
            );
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Reject failed: ${response.status} - ${errorData}`);
            }
            showToast("Request rejected successfully", "success");
            await fetchInitialData();
        } catch (err) {
            console.error("Error rejecting request:", err);
            setError(`Error rejecting request: ${err.message}`);
            showToast("Failed to reject request", "error");
        } finally {
             setIsLoading(false);
        }
    };

    const handleAccept = (requestId) => {
        const selectedItem = bgsRequestData.find((item) => item.Id === requestId);

        if (!selectedItem) {
            showToast("Could not find the selected request details.", "error");
            return;
        }
         if (selectedItem.UniformId == null) {
            showToast("Cannot accept request: Uniform ID is missing.", "error");
             return;
        }

        setSelectedRequest(selectedItem);
        setSelectedRequestId(requestId);

        const currentAvailableStock = dcStockMap[selectedItem.UniformId] || 0;
        setAvailableStock(currentAvailableStock);

        const requestedCount = selectedItem.RequestCount || 0;
        const initialCount = Math.max(0, Math.min(requestedCount, currentAvailableStock));
        setCount(initialCount);

        setModalOpen(true);
    };

    const handleCountChange = (e) => {
         const newCount = parseInt(e.target.value, 10) || 0;

         if (newCount < 0) {
             showToast("Count cannot be negative", "warning");
             setCount(0);
             return;
         }

        const requestedCount = selectedRequest?.RequestCount || 0;
        const maxAllowed = Math.min(requestedCount, availableStock);

         if (newCount > maxAllowed) {
            showToast(`Cannot accept more than ${maxAllowed} (Stock: ${availableStock}, Requested: ${requestedCount})`, "warning");
            setCount(maxAllowed);
         } else {
            setCount(newCount);
         }
    };

    const handleSubmit = async () => {
         if (!selectedRequestId) {
             showToast("Error: No request selected.", "error");
             return;
        }
         if (availableStock > 0 && count <= 0) {
             showToast("Please enter a count greater than 0 to accept.", "warning");
            return;
         }
         if (availableStock <= 0 && count > 0) {
            showToast("Cannot accept items when no stock is available.", "error");
            return;
         }

        setIsSaving(true);
         try {
             const response = await fetch(
                `${API_BASE_URL}/api/BGSStockRequest/update-count-status`,
                {
                     method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                         "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ Id: selectedRequestId, count: count }),
                }
            );

             if (!response.ok) {
                 const errorData = await response.text();
                throw new Error(`Failed to accept request: ${response.status} - ${errorData}`);
            }

            setModalOpen(false);
            showToast(`Request accepted successfully with count: ${count}`, "success");
             await fetchInitialData();
             setSelectedRequestId(null);
             setSelectedRequest(null);
             setCount(0);
            setAvailableStock(0);

         } catch (err) {
             console.error("Error during acceptance submission:", err);
             setError(`Error processing acceptance: ${err.message}`);
            showToast("Failed to accept request", "error");
         } finally {
             setIsSaving(false);
         }
     };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        const totalPages = Math.ceil(filteredStockData.length / itemsPerPage);

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
             let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
             let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

             if (endPage === totalPages) startPage = Math.max(1, totalPages - maxPagesToShow + 1);
             if (startPage === 1) endPage = Math.min(totalPages, maxPagesToShow);

            if (startPage > 1) {
                 pageNumbers.push(1);
                if (startPage > 2) pageNumbers.push('...');
            }
            for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) pageNumbers.push('...');
                 pageNumbers.push(totalPages);
            }
        }
        return pageNumbers;
    };

    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
        setCurrentPage(1);
    };

    const filteredStockData = statusFilter
        ? bgsRequestData.filter((item) => item.Status === statusFilter)
        : bgsRequestData;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStockData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStockData.length / itemsPerPage);

    const columns = React.useMemo(() => [
        { Header: "Uni. Code", accessor: "UniformCode" },
        { Header: "Uniform Name", accessor: "UniformName" },
        { Header: "Type", accessor: "UniformDetails.UniType" },
        { Header: "Size", accessor: "UniformDetails.Size" },
        { Header: "Gender", accessor: "UniformDetails.Gender" },
        { Header: "Req. Count", accessor: "RequestCount" },
        { Header: "Project", accessor: "ProjectName" },
        {
            Header: "Status",
            accessor: "Status",
            Cell: ({ value }) => {
                let color = "#6c757d";
                let icon = null;
                switch (value) {
                    case "Pending": color = "#ffc107"; break;
                    case "Intransit": color = "#17a2b8"; icon = <FaShippingFast />; break;
                    case "Accepted": color = "#28a745"; icon = <FaCheck />; break;
                    case "Rejected": color = "#dc3545"; icon = <FaTimes />; break;
                    default: break;
                }
                return (
                    <span style={{ color, fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                      {icon && <IconWrapper color={color}>{icon}</IconWrapper>}
                      {value || 'N/A'}
                    </span>
                 );
             }
        },
        {
            Header: "Actions",
            id: "actions",
            Cell: ({ row }) => {
                const { Status, Id } = row.original;
                if (Status === "Pending") {
                    return (
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            <ActionButton variant="accept" onClick={() => handleAccept(Id)} aria-label={`Accept request ${Id}`}>
                               Accept
                            </ActionButton>
                            <ActionButton variant="reject" onClick={() => handleReject(Id)} aria-label={`Reject request ${Id}`}>
                               Reject
                            </ActionButton>
                        </div>
                    );
                }
                 return <span style={{ fontSize: '12px', color: '#6c757d', textAlign: 'center', display: 'block' }}>No actions</span>;
            },
        },
    ], [bgsRequestData, dcStockMap, handleAccept, handleReject]);

    const renderModal = () => {
        if (!modalOpen || !selectedRequest) return null;

        const isStockAvailable = availableStock > 0;
        const requestedCount = selectedRequest.RequestCount || 0;
        const numericAvailableStock = Number(availableStock) || 0;
        const isRequestedMoreThanAvailable = requestedCount > numericAvailableStock;
        const maxAcceptable = Math.min(requestedCount, numericAvailableStock);

        return (
            <Modal>
                <ModalContent>
                    {isSaving && <LoadingSpinner overlay={true}/>}
                    <CloseButton onClick={() => setModalOpen(false)} disabled={isSaving}><FaTimes /></CloseButton>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#343a40', borderBottom: '1px solid #dee2e6', paddingBottom: '10px' }}>
                        Accept Uniform Request
                    </h3>

                    <InfoSection>
                        <InfoItem>
                            <InfoLabel>Uniform:</InfoLabel>
                            <InfoValue>{selectedRequest.UniformName || 'N/A'} ({selectedRequest.UniformCode || 'N/A'})</InfoValue>
                        </InfoItem>
                         <InfoItem>
                            <InfoLabel>Type/Size/Gender:</InfoLabel>
                             <InfoValue>
                                 {selectedRequest.UniformDetails?.UniType || 'N/A'} / {selectedRequest.UniformDetails?.Size || 'N/A'} / {selectedRequest.UniformDetails?.Gender || 'N/A'}
                             </InfoValue>
                         </InfoItem>
                        <InfoItem>
                            <InfoLabel>Requested Count:</InfoLabel>
                            <InfoValue>{requestedCount}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                            <InfoLabel>Available Stock (DC):</InfoLabel>
                            <InfoValue style={{ color: !isStockAvailable ? '#dc3545' : (isRequestedMoreThanAvailable ? '#ffc107' : '#28a745') }}>
                               {numericAvailableStock}
                            </InfoValue>
                        </InfoItem>
                        <InfoItem>
                            <InfoLabel>Project:</InfoLabel>
                             <InfoValue>{selectedRequest.ProjectName || 'N/A'}</InfoValue>
                        </InfoItem>
                    </InfoSection>

                     {!isStockAvailable && (
                        <WarningMessage>
                           No stock available in DC for this uniform. Cannot accept.
                        </WarningMessage>
                    )}

                     {isStockAvailable && isRequestedMoreThanAvailable && (
                         <InfoWarningMessage>
                            Requested ({requestedCount}) exceeds available stock ({numericAvailableStock}). Max {maxAcceptable} can be accepted.
                        </InfoWarningMessage>
                     )}

                     <div style={{ marginBottom: "25px" }}>
                        <Label htmlFor="acceptCount">Count to Accept:</Label>
                         <ModalInput
                             id="acceptCount"
                             type="number"
                            min="0"
                            max={maxAcceptable}
                            value={count}
                            onChange={handleCountChange}
                            disabled={!isStockAvailable || isSaving}
                            aria-describedby={!isStockAvailable ? "stockWarning" : (isRequestedMoreThanAvailable ? "stockInfoWarning" : undefined)}
                        />
                        {!isStockAvailable && <span id="stockWarning" className="sr-only">Warning: No stock available</span>}
                        {isRequestedMoreThanAvailable && <span id="stockInfoWarning" className="sr-only">Warning: Requested count exceeds available stock</span>}
                     </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: '15px', borderTop: '1px solid #dee2e6' }}>
                        <StyledButton
                            onClick={() => { setModalOpen(false); }}
                            disabled={isSaving}
                        >
                            Cancel
                        </StyledButton>
                        <ModalButton
                            onClick={handleSubmit}
                             disabled={
                                isSaving ||
                                 !isStockAvailable ||
                                 (isStockAvailable && count <= 0)
                            }
                        >
                            {isSaving ? "Saving..." : `Accept ${count} Item(s)`}
                        </ModalButton>
                    </div>
                </ModalContent>
            </Modal>
        );
    };

    return (
        <StockContainer>
            <Header>
                <Title>BGS Requests Response</Title>
                <StatusFilter
                    statusOptions={statusOptions}
                    handleStatusFilterChange={handleStatusFilterChange}
                    statusFilter={statusFilter}
                />
            </Header>

             {isLoading ? (
                 <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><LoadingSpinner /></div>
             ) : error ? (
                 <WarningMessage style={{margin: '20px 0'}}>{error}</WarningMessage>
            ) : bgsRequestData.length === 0 ? (
                 <p style={{textAlign: 'center', padding: '30px', color: '#6c757d'}}>No requests found matching the criteria.</p>
             ) : (
                 <>
                     <Table
                        columns={columns}
                        data={currentItems}
                        selectable={false}
                        editable={false}
                    />

                    {filteredStockData.length > itemsPerPage && (
                         <PaginationContainer>
                            <PaginationButton
                                 onClick={() => handlePageChange(currentPage - 1)}
                                 disabled={currentPage === 1}
                                 aria-label="Previous Page"
                             >
                                <FaChevronLeft size={12} />
                             </PaginationButton>

                            {getPageNumbers().map((page, index) =>
                                 typeof page === 'number' ? (
                                    <PaginationButton
                                         key={page}
                                         active={currentPage === page}
                                         onClick={() => handlePageChange(page)}
                                     >
                                         {page}
                                     </PaginationButton>
                                 ) : (
                                     <span key={`dots-${index}`} style={{ padding: '5px 10px', color: '#6c757d', alignSelf: 'center' }}>{page}</span>
                                 )
                             )}

                             <PaginationButton
                                 onClick={() => handlePageChange(currentPage + 1)}
                                 disabled={currentPage === totalPages}
                                 aria-label="Next Page"
                             >
                                 <FaChevronRight size={12} />
                             </PaginationButton>
                         </PaginationContainer>
                     )}
                 </>
            )}

            {renderModal()}
            <ToastContainer />
        </StockContainer>
    );
};

export default StockResponse;