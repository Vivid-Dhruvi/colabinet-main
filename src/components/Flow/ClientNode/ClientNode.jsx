import React, { useContext, useMemo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { FlowContext } from "../Flow";
import { cn, isUserAllow } from "@/lib/utils";
import { BusinessAreaModal } from "../BusinessArea/BussinessAreaModal";
import ClientNodeOptions from "./ClientNodeOptions";
import { EditClientDetails } from "./EditClientDetails";
import { MainContext } from "@/App";
import { BusinessContext } from "@/Pages/layouts/BusinessLayout";

function ClientNode({ data }) {
  const { user } = useContext(MainContext);
  const { handleCollapase, currentFlow } = useContext(FlowContext);
  const { selectedBusinessTemplate } = useContext(BusinessContext);

  const { value, collapsed, total_ba, total_workflow, total_task } = data;
  const [bamodel, setBaModel] = useState(false);

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const onEdgeClick = (e) => {
    e.stopPropagation();
    setBaModel(true);
  };

  const is_readOnly = useMemo(() => {
    return (currentFlow?.type === "company" || user.role_id == 17) && selectedBusinessTemplate != 'suggested' ;
  }, [user, currentFlow]);

  return (
    <>
      <div className="relative bg-white rounded-2xl p-4 pb-6 shadow-[0px_25px_50px_0px_#00000040] w-96">
        <span className="block rounded-full px-2 py-1 bg-[#6CADA0] shadow-[0px_4px_6px_0px_#0000001A,_0px_2px_4px_0px_#0000001A] text-white font-medium z-2 absolute -top-3 left-6 text-xs">
         {selectedBusinessTemplate === 'suggested' ? "AI Business Structure" : currentFlow?.type === "company" ? "Company" : "Business Templates"}
        </span>
        <div className="w-full">
          <div className="w-full flex gap-2 items-center pb-2">
            <button
              type="button"
              className="block size-5 p-0 bg-transparent border-0 outline-none cursor-pointer ml-auto"
              onClick={() => handleCollapase("client", !collapsed)}
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
            {is_readOnly && (
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
        <div className="w-full flex flex-wrap items-center gap-4 mb-4">
          {value.avatar ? (
            <img
              src={value.avatar}
              alt="avatar"
              className="size-14 object-cover object-center rounded-lg"
              onError={(e) => {
                const target = e.target;
                if (target instanceof HTMLImageElement) {
                  target.src = "/images/user.jpg";
                  target.onerror = null;
                }
              }}
            />
          ) : (
            <div className="shrink-0 size-14 bg-[#62AAB4] flex items-center justify-center rounded-lg p-1.5">
              <svg width="19" height="24" viewBox="0 0 19 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 block">
                <path
                  d="M2.78125 0C1.53906 0 0.53125 1.00781 0.53125 2.25V21.75C0.53125 22.9922 1.53906 24 2.78125 24H7.28125V20.25C7.28125 19.0078 8.28906 18 9.53125 18C10.7734 18 11.7812 19.0078 11.7812 20.25V24H16.2812C17.5234 24 18.5312 22.9922 18.5312 21.75V2.25C18.5312 1.00781 17.5234 0 16.2812 0H2.78125ZM3.53125 11.25C3.53125 10.8375 3.86875 10.5 4.28125 10.5H5.78125C6.19375 10.5 6.53125 10.8375 6.53125 11.25V12.75C6.53125 13.1625 6.19375 13.5 5.78125 13.5H4.28125C3.86875 13.5 3.53125 13.1625 3.53125 12.75V11.25ZM8.78125 10.5H10.2812C10.6938 10.5 11.0312 10.8375 11.0312 11.25V12.75C11.0312 13.1625 10.6938 13.5 10.2812 13.5H8.78125C8.36875 13.5 8.03125 13.1625 8.03125 12.75V11.25C8.03125 10.8375 8.36875 10.5 8.78125 10.5ZM12.5312 11.25C12.5312 10.8375 12.8687 10.5 13.2812 10.5H14.7812C15.1938 10.5 15.5312 10.8375 15.5312 11.25V12.75C15.5312 13.1625 15.1938 13.5 14.7812 13.5H13.2812C12.8687 13.5 12.5312 13.1625 12.5312 12.75V11.25ZM4.28125 4.5H5.78125C6.19375 4.5 6.53125 4.8375 6.53125 5.25V6.75C6.53125 7.1625 6.19375 7.5 5.78125 7.5H4.28125C3.86875 7.5 3.53125 7.1625 3.53125 6.75V5.25C3.53125 4.8375 3.86875 4.5 4.28125 4.5ZM8.03125 5.25C8.03125 4.8375 8.36875 4.5 8.78125 4.5H10.2812C10.6938 4.5 11.0312 4.8375 11.0312 5.25V6.75C11.0312 7.1625 10.6938 7.5 10.2812 7.5H8.78125C8.36875 7.5 8.03125 7.1625 8.03125 6.75V5.25ZM13.2812 4.5H14.7812C15.1938 4.5 15.5312 4.8375 15.5312 5.25V6.75C15.5312 7.1625 15.1938 7.5 14.7812 7.5H13.2812C12.8687 7.5 12.5312 7.1625 12.5312 6.75V5.25C12.5312 4.8375 12.8687 4.5 13.2812 4.5Z"
                  fill="white"
                />
              </svg>
            </div>
          )}
          <div className="w-2/4 grow flex flex-col gap-1">
            <h3 className="text-[#6B7280] font-bold text-xl leading-tight">{value?.name}</h3>
            {value.b_model && <p className="text-[#6B7280] text-sm leading-normal font-normal ellipses-2">{value.b_model}</p>}
          </div>
        </div>
        <ul className="flex justify-between gap-1.5">
          <li className="flex flex-col gap-1 text-center w-fit">
            <h4 className="text-[#4B5563] font-semibold text-lg">{total_ba || 0}</h4>
            <p className="text-[#4B5563] font-normal text-sm leading-none">Business Areas</p>
          </li>
          <li className="flex flex-col gap-1 text-center w-fit">
            <h4 className="text-[#4B5563] font-semibold text-lg">{total_workflow || 0}</h4>
            <p className="text-[#4B5563] font-normal text-sm leading-none">Workflows</p>
          </li>
          <li className="flex flex-col gap-1 text-center w-fit">
            <h4 className="text-[#4B5563] font-semibold text-lg">{total_task || 0}</h4>
            <p className="text-[#4B5563] font-normal text-sm leading-none">Tasks</p>
          </li>
        </ul>

        {is_readOnly && isUserAllow(user, "create-business-area") && (
          <button
            type="button"
            className="font-medium text-xs leading-none gap-1.5 text-white absolute left-2/4 -translate-x-2/4 -bottom-[11px] z-2 cursor-pointer flex items-center rounded-full px-3 py-1.5 bg-linear-to-r from-[#F08965] to-[#F9B295] shadow-[0px_4px_6px_0px_#0000001A,_0px_2px_4px_0px_#0000001A]"
            onClick={onEdgeClick}
          >
            <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-3 shrink-0">
              <path
                d="M6.25 1.875C6.25 1.46016 5.91484 1.125 5.5 1.125C5.08516 1.125 4.75 1.46016 4.75 1.875V5.25H1.375C0.960156 5.25 0.625 5.58516 0.625 6C0.625 6.41484 0.960156 6.75 1.375 6.75H4.75V10.125C4.75 10.5398 5.08516 10.875 5.5 10.875C5.91484 10.875 6.25 10.5398 6.25 10.125V6.75H9.625C10.0398 6.75 10.375 6.41484 10.375 6C10.375 5.58516 10.0398 5.25 9.625 5.25H6.25V1.875Z"
                fill="white"
              />
            </svg>
            <span>Add Business Area</span>
          </button>
        )}
        <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
      </div>
      <ClientNodeOptions isOpen={showOptionsModal} setIsOpen={setShowOptionsModal} setShowEditModal={setShowEditModal} />
      <EditClientDetails open={showEditModal} setIsOpen={setShowEditModal} value={value} />
      <BusinessAreaModal bamodel={bamodel} setBaModel={setBaModel} />
    </>
  );
}

export default ClientNode;
