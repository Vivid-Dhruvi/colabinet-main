import { useEffect, useRef, useCallback, useContext } from "react";
import { FlowContext } from "../Flow";
import { isUserAllow } from "@/lib/utils";

const WorkflowOptionModal = ({
  isOpen,
  setIsOpen,
  wfdetails,
  setSelectBARemove,
  removeFromCanvas,
  handleDeleteWorkFlow,
  handleViewWorkFlow,
  transfer,
  user,
  wf_status,
  handleArciveWorkFlow,
}) => {
  const modalRef = useRef(null);
  const { currentFlow } = useContext(FlowContext);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

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
    <div
      ref={modalRef}
      className="min-w-36 py-2 absolute right-0 top-10 z-10 bg-white border border-solid border-[#dedede] rounded-lg shadow-sm cursor-default"
    >
      <button
        onClick={closeModal}
        className="absolute top-1 right-2 text-gray-500 hover:text-gray-700 text-sm cursor-pointer"
        aria-label="Close"
      >
        ✕
      </button>

      <ul className="list-none pt-4">
        {wfdetails.chain_no && !transfer && (
          <li
            className="text-xs md:text-sm text-[#49B8BF] px-4 py-0.5 hover:bg-gray-100 cursor-pointer"
            onClick={() => handleViewWorkFlow(1)}
          >
            View Linked Workflow
          </li>
        )}
        <li
          onClick={() => handleViewWorkFlow(3)}
          className="text-xs md:text-sm text-[#49B8BF] px-4 py-0.5 hover:bg-gray-100 cursor-pointer"
        >
          View Transferred Workflows
        </li>
        <li
          className="text-xs md:text-sm text-[#49B8BF] px-4 py-0.5 hover:bg-gray-100 cursor-pointer"
          onClick={() => handleViewWorkFlow(2)}
        >
          View Workflow Tasks
        </li>

        <li
          onClick={() => handleViewWorkFlow(4)}
          className="text-xs md:text-sm text-[#49B8BF] px-4 py-0.5 hover:bg-gray-100 cursor-pointer"
        >
          View Workflow Users
        </li>

        {currentFlow.type === "company" && !wfdetails.is_draft && (
          <a
            href={`/workflow/discussion/${wfdetails.uuid}`}
            className="text-xs md:text-sm text-[#49B8BF] px-4 py-0.5 hover:bg-gray-100 cursor-pointer block"
            target="_blank"
            rel="noreferrer"
          >
            Workflow Discussions
          </a>
        )}

        {currentFlow.type === "template" ? (
          wfdetails.business_area_id && (
            <li
              className="text-xs md:text-sm text-[#49B8BF] px-4 py-0.5 hover:bg-gray-100 cursor-pointer"
              onClick={() => setSelectBARemove(true)}
            >
              Remove Business Area
            </li>
          )
        ) : wfdetails.is_draft ? (
          <li
            className="text-xs md:text-sm text-[#49B8BF] px-4 py-0.5 hover:bg-gray-100 cursor-pointer"
            onClick={removeFromCanvas}
          >
            Remove from canvas
          </li>
        ) : (
          <>
            <li
              className="text-xs md:text-sm text-[#f98a63] px-4 py-0.5 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleArciveWorkFlow(wf_status.status == "Archived" ? "unarchive" : "archive")}
            >
              {wf_status.status == "Archived" ? "Unarchive" : "Archive"} Workflow
            </li>
            {wf_status.status != "Active" && isUserAllow(user, "delete-workflow") && (
              <li
                className="text-xs md:text-sm text-red-600 px-4 py-0.5 hover:bg-gray-100 cursor-pointer"
                onClick={handleDeleteWorkFlow}
              >
                Delete
              </li>
            )}
          </>
        )}
      </ul>
    </div>
  );
};

export default WorkflowOptionModal;
