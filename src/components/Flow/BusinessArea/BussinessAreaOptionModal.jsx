import { useEffect, useRef, useCallback, useContext } from "react";
import { FlowContext } from "../Flow";
import { isUserAllow } from "@/lib/utils";

const BussinessAreaOptionModal = ({ isOpen, setIsOpen, setShowDeleteModal, setShowEditModal, user }) => {
  const modalRef = useRef(null);
  const { currentFlow } = useContext(FlowContext);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleEdit = () => {
    setShowEditModal(true);
    closeModal();
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
    closeModal();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeModal, isOpen]);

  if (!isOpen) return null;

  return (
    <div ref={modalRef} className="min-w-36 py-2 absolute right-0 top-10 bg-white border border-[#dedede] rounded-lg shadow-sm cursor-default">
      <button onClick={closeModal} className="absolute top-1 right-2 text-gray-500 hover:text-gray-700 text-sm cursor-pointer" aria-label="Close">
        ✕
      </button>

      <ul className="list-none pt-4">
        {(currentFlow.type === "company" || user.role_id == 17) && (
          <>
            {isUserAllow(user, "edit-business-area") && (
              <li className="text-xs md:text-sm text-[#49B8BF] px-4 py-0.5 hover:bg-gray-100 cursor-pointer" onClick={handleEdit}>
                Edit
              </li>
            )}
            {isUserAllow(user, "delete-business-area") && (
              <li className="text-xs md:text-sm text-red-600 px-4 py-0.5 hover:bg-red-50 cursor-pointer" onClick={handleDelete}>
                Delete
              </li>
            )}
          </>
        )}
      </ul>
    </div>
  );
};

export default BussinessAreaOptionModal;
