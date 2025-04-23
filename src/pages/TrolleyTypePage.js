import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Table from "../components/Table"; // Assume this Table component exists and works with react-table v7/v8 structure
import CreateTrolleyTypeModal from "../components/CreateTrolleyTypeModal"; // Assume this modal exists
import EditTrolleyTypeModal from "../components/EditTrolleyTypeModal"; // Assume this modal exists
import DeleteModal from "../components/DeleteModal"; // Assume this modal exists
import { API_BASE_URL } from "../config"; // Your API base URL config
import { showToast } from "../utils/toast"; // Your toast utility
import { ToastContainer } from "../utils/ToastContainer"; // Your toast container

// Styled components (keep as they are or adapt from your project)
const TrolleyTypeContainer = styled.div`
  padding: 16px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); /* Subtle shadow */
  display: flex;
  flex-direction: column;
  gap: 20px; /* Consistent gap */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif; /* Consistent font */
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px; /* Add some spacing below header */
  border-bottom: 1px solid #e5e7eb; /* Subtle separator */
`;

const Title = styled.h2`
  margin: 0;
  font-size: 22px; /* Slightly adjusted size */
  font-weight: 600; /* Medium weight */
  color: #1f2937; /* Darker gray */
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px; /* Consistent gap */
`;

const StyledButton = styled.button`
  padding: 8px 16px; /* Slightly adjusted padding */
  font-size: 14px; /* Slightly smaller font */
  font-weight: 500; /* Medium weight */
  color: #fff;
  background-color: #0ea5e9; /* Tailwind sky-500 */
  border: none;
  border-radius: 6px; /* Standard radius */
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  display: flex;
  align-items: center;
  gap: 6px; /* Smaller gap */

  &:hover {
    background-color: #0284c7; /* Tailwind sky-600 */
  }

  &:disabled {
    background-color: #94a3b8; /* Gray for disabled */
    cursor: not-allowed;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 16px; /* Space above pagination */
  border-top: 1px solid #e5e7eb; /* Subtle separator */
`;

const PaginationButton = styled.button`
  padding: 6px 12px; /* Adjusted padding */
  min-width: 36px; /* Slightly larger min-width */
  height: 36px;
  margin: 0 3px; /* Adjusted margin */
  border: 1px solid #d1d5db; /* Gray border */
  background-color: ${(props) => (props.active ? "#0ea5e9" : "#ffffff")};
  color: ${(props) => (props.active ? "#ffffff" : "#374151")}; /* Darker text color */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  border-radius: 6px;
  &:hover {
    background-color: ${(props) => (props.active ? "#0ea5e9" : "#f9fafb")}; /* Light gray hover */
    border-color: #9ca3af; /* Slightly darker border on hover */
    z-index: 1;
  }

  &:disabled {
    background-color: #f3f4f6; /* Lighter gray disabled background */
    color: #9ca3af; /* Lighter gray disabled text */
    border-color: #e5e7eb; /* Lighter gray disabled border */
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #ef4444; /* Red color for errors */
  background-color: #fee2e2; /* Light red background */
  border: 1px solid #fca5a5; /* Red border */
  padding: 12px;
  border-radius: 6px;
  margin: 0;
`;

const LoadingMessage = styled.p`
  color: #374151; /* Dark gray */
  padding: 12px;
  text-align: center;
`;

const NoDataMessage = styled.p`
 color: #6b7280; /* Medium gray */
 text-align: center;
 padding: 20px;
`;


// *** THE MAIN PAGE COMPONENT ***
const TrolleyTypePage = () => {
  const [trolleyTypeData, setTrolleyTypeData] = useState([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start loading initially
  const [error, setError] = useState("");
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [itemToDeleteName, setItemToDeleteName] = useState(""); // Store name for delete modal

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7); // Or get from user preference/config
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem("token");

  // Function to generate the correct display URL for images
  const generateDisplayImageUrl = (backendUrl) => {
    if (!backendUrl || typeof backendUrl !== 'string' || !backendUrl.startsWith('http')) {
        return null; // Return null if the backend URL is invalid or missing
    }
    try {
        const url = new URL(backendUrl);
        // The path from the backend is like "/trolleytype/guid.jpg"
        // We want "/uploads/trolleytype/guid.jpg"
        const newPathname = `/uploads${url.pathname}`; // Prepend /uploads/
        return `${url.origin}${newPathname}`; // Combine origin with the new path
    } catch (e) {
        console.error("Error constructing image display URL:", backendUrl, e);
        return null; // Return null if URL parsing fails
    }
  };

  // Fetching Function
  const fetchTrolleyTypes = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(""); // Clear previous errors

    if (!token) {
        setError("Authentication token not found. Please log in.");
        setIsLoading(false);
        setTrolleyTypeData([]); // Ensure data is empty
        setTotalItems(0);
        setTotalPages(1);
        return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/TrolleyType?Page=${page}&ShowMore.Take=${itemsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
             'Accept': 'application/json' // Ensure we accept JSON
          },
        }
      );

      if (!response.ok) {
          let errorText = `HTTP Error: ${response.status}`;
          try {
              // Try to parse error response from backend
              const errorData = await response.json();
              errorText = errorData.Message || errorData.title || errorText; // Use specific error messages if available
          } catch (jsonError) {
              // Ignore if response is not JSON
              errorText = await response.text() || errorText; // Use raw text if available
          }

          if (response.status === 401 || response.status === 403) {
               setError("Unauthorized or Forbidden access. Please log in again or check permissions.");
               // Optionally redirect to login: window.location.href = '/login';
          } else {
               setError(`Failed to fetch data: ${errorText}`);
          }
          // Reset state on error
          setTrolleyTypeData([]);
          setTotalItems(0);
          setTotalPages(1);
          return;
      }

      const data = await response.json();

      // Validate the structure of the response data
      if (data && Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
          const responseData = data[0];
          // Ensure the nested properties exist before accessing them
          const types = responseData.TrolleyTypes && Array.isArray(responseData.TrolleyTypes) ? responseData.TrolleyTypes : [];
          const totalCount = typeof responseData.TotalTrolleyTypeCount === 'number' ? responseData.TotalTrolleyTypeCount : 0;

          setTrolleyTypeData(types);
          setTotalItems(totalCount);
          setTotalPages(Math.ceil(totalCount / itemsPerPage) || 1); // Ensure totalPages is at least 1

           // Adjust currentPage if it's now out of bounds after a delete/change
           if (page > (Math.ceil(totalCount / itemsPerPage) || 1) && totalCount > 0) {
             setCurrentPage(Math.ceil(totalCount / itemsPerPage)); // Go to the new last page
             // No immediate refetch needed here, as useEffect will handle the state change
           }

      } else {
         // Handle unexpected or empty response structure
         console.warn("Received unexpected data structure from API:", data);
         setTrolleyTypeData([]);
         setTotalItems(0);
         setTotalPages(1);
      }

    } catch (err) {
      console.error("Error fetching trolley types:", err);
      // Provide a more user-friendly error message for network or parsing errors
      setError(err instanceof TypeError ? "Network error or failed to parse response." : "An unexpected error occurred. Please try again.");
      setTrolleyTypeData([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [token, itemsPerPage, API_BASE_URL]); // Add API_BASE_URL to dependencies

  // Initial data fetch and re-fetch on page change
  useEffect(() => {
      fetchTrolleyTypes(currentPage);
  }, [currentPage, fetchTrolleyTypes]); // Dependencies: currentPage and the memoized fetch function


  // Format Date Helper
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString(undefined, { // Use user's locale
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return '-';
    }
  };

  // Table Columns Definition
  const columns = React.useMemo(
    () => [
      { Header: "Trolley Type Name", accessor: "Name", Cell: ({value}) => value || '-' },
      {
        Header: "Image",
        accessor: "ImageUrl", // Access the raw URL from backend data
        Cell: ({ value }) => {
            // Use the helper function to generate the display URL
            const displayUrl = generateDisplayImageUrl(value);

            return (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "40px", // Ensure consistent height for the cell content area
                }}
              >
                {displayUrl ? (
                  <img
                    src={displayUrl}
                    alt="Trolley Type"
                    style={{
                      width: "50px", // Fixed width
                      height: "50px",// Fixed height
                      borderRadius: "7px",
                      objectFit: "contain", // Use contain to see the whole image without stretching
                      backgroundColor: '#f8f9fa' // Light background for transparent images
                    }}
                    // More robust error handling
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loop if placeholder fails
                      e.target.style.display = 'none'; // Hide broken image icon
                      // Optionally display placeholder text/icon within the div
                      const parent = e.target.parentNode;
                       if (parent && !parent.querySelector('.img-error-placeholder')) { // Prevent adding multiple placeholders
                          const placeholder = document.createElement('span');
                          placeholder.innerText = 'N/A';
                          placeholder.className = 'img-error-placeholder';
                          placeholder.style.fontSize = '10px';
                          placeholder.style.color = '#adb5bd';
                          placeholder.style.lineHeight = '50px'; // Vertically center if needed
                          parent.appendChild(placeholder);
                        }
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '12px', color: '#6c757d' }}>No Image</span>
                )}
              </div>
           );
        },
      },
       { Header: "Created Date", accessor: "CreatedDate", Cell: ({ value }) => formatDate(value) },
       { Header: "Created By", accessor: "CreatedBy", Cell: ({value}) => value || '-' },
       { Header: "Modified Date", accessor: "ModifiedDate", Cell: ({ value }) => formatDate(value) },
       { Header: "Modified By", accessor: "ModifiedBy", Cell: ({ value }) => value || '-' },
      {
        Header: "Actions",
        accessor: "actions", // This accessor isn't strictly necessary if using row data directly
        Cell: ({ row }) => (
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <FaEdit
              style={{ cursor: "pointer", color: "#3b82f6", fontSize: '16px' }} // Blue color
              onClick={() => handleEdit(row.original)}
              title="Edit Trolley Type"
            />
            <FaTrash
              style={{ cursor: "pointer", color: "#ef4444", fontSize: '16px' }} // Red color
              onClick={() => handleDelete(row.original.Id, row.original.Name)}
              title="Delete Trolley Type"
            />
          </div>
        ),
      },
    ],
    [] // Keep empty dependency array unless columns depend on external state/props
  );

  // Page Change Handler
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
        setCurrentPage(pageNumber);
        // Data fetching is handled by the useEffect hook watching currentPage
    }
  };

  // Generate page numbers for pagination controls
   const getPageNumbers = () => {
     const pageNumbers = [];
     const maxPagesToShow = 5; // Max direct page number buttons
     const ellipsis = '...';

     if (totalPages <= maxPagesToShow + 2) { // Show all pages if total is small
        for (let i = 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
     } else {
        // Determine start and end page numbers for the middle section
        let startPage = Math.max(2, currentPage - Math.floor((maxPagesToShow - 2) / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 3);

         // Adjust if we are near the beginning
        if (currentPage < maxPagesToShow - 1) {
             startPage = 2;
             endPage = startPage + maxPagesToShow - 3;
        }
        // Adjust if we are near the end
         if (currentPage > totalPages - (maxPagesToShow - 2)) {
             endPage = totalPages - 1;
             startPage = endPage - maxPagesToShow + 3;
         }


        pageNumbers.push(1); // Always show first page
        if (startPage > 2) {
          pageNumbers.push(ellipsis); // Ellipsis after first page
        }

        for (let i = startPage; i <= endPage; i++) {
          pageNumbers.push(i);
        }

        if (endPage < totalPages - 1) {
          pageNumbers.push(ellipsis); // Ellipsis before last page
        }
        pageNumbers.push(totalPages); // Always show last page
     }

     return pageNumbers;
   };

  // --- CRUD Operation Handlers ---

  const handleCreateTrolleyType = () => setCreateModalOpen(true);

  // Called from Create Modal on successful save
  const handleSaveTrolleyType = async () => {
    setCreateModalOpen(false);
    // Go to the first page potentially to see the newly created item? Or stay?
    // Let's stay on the current page for now, but refetch.
    // If backend sorts by newest first, might need to go to page 1 or check totalPages change.
    await fetchTrolleyTypes(currentPage);
    // Toast is likely shown inside the modal upon success
  };

  const handleEdit = (rowData) => {
    setEditData(rowData); // Set data for the modal
    setEditModalOpen(true);
  };

  // Called from Edit Modal on successful save
  const handleSaveEdit = async () => {
    setEditModalOpen(false);
    setEditData(null); // Clear edit data
    await fetchTrolleyTypes(currentPage); // Refetch data for the current page
     // Toast is likely shown inside the modal upon success
  };

  const handleDelete = (id, name) => {
    setDeleteId(id);
    setItemToDeleteName(name || "this item"); // Store name for confirmation message
    setDeleteModalOpen(true);
  };

  // Called from Delete Modal on confirmation
  const confirmDelete = async () => {
    if (!deleteId) return;
    if (!token) {
        showToast("Authentication error. Cannot delete.", "error");
        setDeleteModalOpen(false);
        return;
    }

    // Set a specific loading state for the delete operation if needed
    // setIsLoading(true); // Re-use main loader or use a dedicated one

    try {
      const response = await fetch(`${API_BASE_URL}/api/TrolleyType`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Ensure the body structure matches backend expectation (e.g., sending just ID or an object)
        // Based on the C# code, it likely expects an object from the body parameter.
        body: JSON.stringify({ Id: deleteId }),
      });

       let responseData;
       try {
          responseData = await response.json();
       } catch (e) {
           // Handle cases where response is not JSON (e.g., 204 No Content, or plain text error)
           if (response.ok) { // Assume success if status is OK and no JSON body
                responseData = { IsSuccess: true, Message: "Deleted successfully." };
           } else {
                throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
           }
       }


      if (!response.ok || !responseData.IsSuccess) {
           throw new Error(responseData?.Message || `Failed to delete trolley type. Status: ${response.status}`);
      }

      showToast(responseData.Message || "Trolley type deleted successfully!", "success");

       // After successful deletion, refetch data. Check if the current page might become empty.
       const newTotalItems = totalItems - 1;
       const newTotalPages = Math.ceil(newTotalItems / itemsPerPage) || 1;

      if (trolleyTypeData.length === 1 && currentPage > 1 && currentPage > newTotalPages) {
           // If it was the last item on a page beyond the new last page, go to the new last page
           setCurrentPage(newTotalPages);
       } else {
           // Otherwise, just refetch the current page or potentially the previous one if the current is now empty
           await fetchTrolleyTypes(currentPage);
       }
       // Note: fetchTrolleyTypes already updates totalItems and totalPages, but you could update totalItems optimistically earlier
       // setTotalItems(newTotalItems); // Optimistic update (fetch will confirm)

    } catch (error) {
      console.error("Error deleting trolley type:", error);
      showToast(`Error: ${error.message}`, "error");
    } finally {
       setDeleteId(null); // Clear delete target
       setItemToDeleteName("");
       setDeleteModalOpen(false);
       // setIsLoading(false); // Turn off loader if used
    }
  };

  // --- Render Component ---
  return (
    <TrolleyTypeContainer>
      <Header>
        <Title>Trolley Types</Title>
        <ButtonGroup>
          <StyledButton onClick={handleCreateTrolleyType} disabled={isLoading}>
            <FaPlus size={12} /> Create Trolley Type
          </StyledButton>
        </ButtonGroup>
      </Header>

      {isLoading && <LoadingMessage>Loading Trolley Types...</LoadingMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {!isLoading && !error && (
        <>
          {trolleyTypeData.length > 0 ? (
             <Table
                columns={columns}
                data={trolleyTypeData}
                // Pass any other necessary props to your Table component
            />
          ) : (
            <NoDataMessage>No trolley types found.</NoDataMessage>
          )}

          {totalItems > 0 && totalPages > 1 && (
             <PaginationContainer>
                {/* Previous Button */}
                <PaginationButton
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    title="Previous Page"
                >
                    <FaChevronLeft size={12} />
                </PaginationButton>

                {/* Page Number Buttons */}
                 {getPageNumbers().map((page, index) =>
                   typeof page === 'number' ? (
                     <PaginationButton
                       key={`page-${page}`}
                       active={currentPage === page}
                       onClick={() => handlePageChange(page)}
                       disabled={isLoading}
                     >
                       {page}
                     </PaginationButton>
                   ) : (
                     <span key={`ellipsis-${index}`} style={{ padding: '0 8px', alignSelf: 'center', color: '#9ca3af' }}>
                       {page} {/* Render ellipsis */}
                     </span>
                   )
                 )}

                 {/* Next Button */}
                <PaginationButton
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    title="Next Page"
                >
                  <FaChevronRight size={12} />
                </PaginationButton>
             </PaginationContainer>
          )}
        </>
      )}

      {/* Modal Components */}
      {isCreateModalOpen && ( // Conditionally render modal to ensure clean state on open
        <CreateTrolleyTypeModal
          isOpen={isCreateModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSave={handleSaveTrolleyType}
          apiBaseUrl={API_BASE_URL}
          token={token}
        />
      )}

      {isEditModalOpen && editData && ( // Ensure editData is present before rendering
          <EditTrolleyTypeModal
            isOpen={isEditModalOpen}
            onClose={() => { setEditModalOpen(false); setEditData(null); }} // Clear data on close
            onSave={handleSaveEdit}
            initialData={editData}
            apiBaseUrl={API_BASE_URL}
            token={token}
          />
      )}

      {isDeleteModalOpen && (
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => { setDeleteModalOpen(false); setDeleteId(null); setItemToDeleteName("");}} // Clear state on close
            onConfirm={confirmDelete}
            itemName={itemToDeleteName} // Use the stored name
            message={`Are you sure you want to delete the trolley type: "${itemToDeleteName}"?`}
          />
      )}

      <ToastContainer />
    </TrolleyTypeContainer>
  );
};

export default TrolleyTypePage;