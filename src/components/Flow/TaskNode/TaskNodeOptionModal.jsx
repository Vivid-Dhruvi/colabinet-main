import { useEffect, useRef, useCallback, useContext, useMemo } from "react";
import { FlowContext } from "../Flow";
import { MainContext } from "@/App";

const TaskNodeOptionModal = ({ isOpen, setIsOpen, setShowEditModal, setTaskDeleteModal, tsdetails }) => {
  const modalRef = useRef(null);
  const { currentFlow } = useContext(FlowContext);
  const {  user } = useContext(MainContext);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleEdit = () => {
    setShowEditModal(true);
    closeModal();
  };

  const handleDelete = () => {
    setTaskDeleteModal(true);
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

  const isEdit = useMemo(() => {
    if (currentFlow?.type === "template" && (tsdetails?.assign_to === "freelancer" || tsdetails?.assign_to === "team" || tsdetails?.assign_to === "client")) {
      return true;
    }
    return false;
  }, [tsdetails, currentFlow]);

  if (!isOpen) return null;

  return (
    <div ref={modalRef} className="min-w-36 py-2 absolute right-0 top-10 bg-white border border-[#dedede] rounded-lg shadow-sm cursor-default">
      <button onClick={closeModal} className="absolute top-1 right-2 text-gray-500 hover:text-gray-700 text-sm cursor-pointer" aria-label="Close">
        ✕
      </button>

      <ul className="list-none pt-4">
        {isEdit && (
          <li className="text-xs md:text-sm text-[#49B8BF] px-4 py-0.5 hover:bg-gray-100 cursor-pointer" onClick={handleEdit}>
            Edit
          </li>
        )}

        {(currentFlow.type !== "template" || user.role_id == 17) && <li className="text-xs md:text-sm text-red-600 px-4 py-0.5 hover:bg-red-50 cursor-pointer" onClick={handleDelete}>
          Delete
        </li>}

        {/* <li className="flex items-center gap-2 py-2 px-4">
          <input type="checkbox" className="w-4 h-4  text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
          <span className="text-xs md:text-sm text-[#747379]">Add To Chat</span>
        </li> */}
      </ul>
    </div>
  );
};

export default TaskNodeOptionModal;
