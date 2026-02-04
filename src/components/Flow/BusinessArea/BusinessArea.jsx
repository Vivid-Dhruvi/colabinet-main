import React, { useContext, useMemo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import BussinessAreaOptionModal from "./BussinessAreaOptionModal";
import { deleteBusinessArea } from "@/service/reposting.service";
import { FlowContext } from "../Flow";
import { cn, isUserAllow, isUserAllowAny } from "@/lib/utils";
import { getOriginUrl } from "@/lib/config";
import ConfirmDeleteModal from "@/components/General/ConfirmDeleteModal";
import { MainContext } from "@/App";
import BusinessAreaModal from "./BussinessAreaModal";
import LinkedWorkflowDialog from "../Workflow/LinkedWorkflowDialog";
import { BusinessContext } from "@/Pages/layouts/BusinessLayout";

function BusinessArea({ data }) {
  const { token, user } = useContext(MainContext);
  const { value, collapsed, active_wf } = data;
  const { handleCollapase, handleBaModel, currentFlow, handleAddToCanvas } = useContext(FlowContext);
  const { selectedBusinessTemplate } = useContext(BusinessContext);

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLinkedWorkflow, setShowLinkedWorkflow] = useState(false);

  const handleDelete = () => {
    deleteBusinessArea(token, value.id)
      .then((res) => {
        if (res.success) {
          handleBaModel({}, "delete", value.id);
        }
      })
      .catch((err) => {
        console.error("Error deleting business area:", err);
      });
  };

  const handleAddCanvas = () => {
    handleAddToCanvas("ba", value.id);
    setShowOptionsModal(false);
  };

  const is_readOnly = useMemo(() => {
    return (currentFlow?.type === "company" || user.role_id == 17) && selectedBusinessTemplate != "suggested";
  }, [user, currentFlow]);

  const isThreeDotted = useMemo(() => {
    return is_readOnly && isUserAllowAny(user, ["edit-business-area", "delete-business-area"]);
  }, [is_readOnly, user]);

  return (
    <>
      <div
        className={cn(
          "relative bg-[#E5EFFF] rounded-2xl p-4 pb-6 shadow-[0px_10px_15px_0px_rgba(0,_0,_0,_0.1),0px_4px_6px_0px_rgba(0,_0,_0,_0.1)] w-96 border-l-4 border-soldi border-[#3B82F6]"
        )}
      >
        <span
          className="whitespace-nowrap block rounded-full px-2 py-1  text-white font-medium z-2 absolute -top-3 left-2 text-xs"
          style={{ backgroundColor: selectedBusinessTemplate == "suggested" ? "#FA8B64" : selectedBusinessTemplate > 0 ? "#F08965" : "#6CADA0" }}
        >
          {selectedBusinessTemplate > 0 && Number(selectedBusinessTemplate) != "isNaN" ? "Template" : ""} Business Area{" "}
          {selectedBusinessTemplate == "suggested" ? "Suggestion" : ""}
        </span>
        <Handle type="target" position={Position.Top} className="w-2" />

        <div className="flex items-center justify-between gap-2 w-full pb-2">
          <div className="flex items-start gap-2 w-full">
            <div className="w-fit grow flex flex-wrap gap-4 mb-4">
              {value?.logo ? (
                <img src={`${getOriginUrl()}/${value?.logo}`} className="size-12 object-cover object-center rounded-lg" alt="Business area logo" />
              ) : (
                <div className="shrink-0 size-12 bg-[rgba(59,130,246,0.1)] flex items-center justify-center rounded-lg p-1.5">
                  <svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 block">
                    <path
                      d="M2 6C2 5.44687 1.55313 5 1 5C0.446875 5 0 5.44687 0 6V16.5C0 17.8813 1.11875 19 2.5 19H15C15.5531 19 16 18.5531 16 18C16 17.4469 15.5531 17 15 17H2.5C2.225 17 2 16.775 2 16.5V6ZM14.7063 8.70625C15.0969 8.31563 15.0969 7.68125 14.7063 7.29063C14.3156 6.9 13.6812 6.9 13.2906 7.29063L10 10.5844L8.20625 8.79063C7.81563 8.4 7.18125 8.4 6.79063 8.79063L3.29063 12.2906C2.9 12.6812 2.9 13.3156 3.29063 13.7063C3.68125 14.0969 4.31563 14.0969 4.70625 13.7063L7.5 10.9156L9.29375 12.7094C9.68437 13.1 10.3188 13.1 10.7094 12.7094L14.7094 8.70937L14.7063 8.70625Z"
                      fill="#3B82F6"
                    />
                  </svg>
                </div>
              )}
              <div className="w-2/4 grow">
                <h3 className="text-[#1F2937] font-bold text-xl leading-normal mb-1">{value?.name}</h3>
                {/* <p className="text-[#6B7280] text-sm leading-normal font-normal">Pipeline & Conversion</p> */}
              </div>
            </div>
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                className="block size-5 p-0 bg-transparent border-0 outline-none cursor-pointer"
                onClick={() => handleCollapase("ba", !collapsed, value.id)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={cn("size-5 transition-all duration-200 ease-in", collapsed && "rotate-180")}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {isThreeDotted && (
                <button type="button" className="block size-5 cursor-pointer" onClick={() => setShowOptionsModal((prevOpen) => !prevOpen)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="w-full flex justify-between items-center pt-2 px-2">
          <p className="text-[#4B5563] font-normal text-sm leading-none">{active_wf} Active Workflows</p>
          {currentFlow.type === "template" && (
            <button onClick={handleAddCanvas} className="text-sm font-medium text-[#59A8B2] z-2 cursor-pointer">
              Add This Business Area
            </button>
          )}
        </div>
        {is_readOnly && isUserAllow(user, "create-workflow") && (
          <button
            className="font-medium text-xs leading-none gap-1.5 text-white absolute left-2/4 -translate-x-2/4 -bottom-[11px] z-2 cursor-pointer flex items-center rounded-full px-3 py-1.5 bg-linear-to-r from-[#3B82F6] to-[#60A5FA] shadow-[0px_4px_6px_0px_#0000001A,_0px_2px_4px_0px_#0000001A]"
            onClick={() => setShowLinkedWorkflow((prevOpen) => !prevOpen)}
          >
            <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-3 shrink-0">
              <path
                d="M6.25 1.875C6.25 1.46016 5.91484 1.125 5.5 1.125C5.08516 1.125 4.75 1.46016 4.75 1.875V5.25H1.375C0.960156 5.25 0.625 5.58516 0.625 6C0.625 6.41484 0.960156 6.75 1.375 6.75H4.75V10.125C4.75 10.5398 5.08516 10.875 5.5 10.875C5.91484 10.875 6.25 10.5398 6.25 10.125V6.75H9.625C10.0398 6.75 10.375 6.41484 10.375 6C10.375 5.58516 10.0398 5.25 9.625 5.25H6.25V1.875Z"
                fill="white"
              />
            </svg>
            <span>Add Workflow</span>
          </button>
        )}
        <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
      </div>

      <BussinessAreaOptionModal
        isOpen={showOptionsModal}
        setIsOpen={setShowOptionsModal}
        setShowDeleteModal={setShowDeleteModal}
        setShowEditModal={setShowEditModal}
        user={user}
      />
      <ConfirmDeleteModal isOpen={showDeleteModal} setIsOpen={setShowDeleteModal} onConfirm={handleDelete} />
      <BusinessAreaModal bamodel={showEditModal} initialName={value?.name} setBaModel={setShowEditModal} id={value?.id} />
      <LinkedWorkflowDialog open={showLinkedWorkflow} setOpen={setShowLinkedWorkflow} ba_id={value?.id} />
    </>
  );
}

export default BusinessArea;
