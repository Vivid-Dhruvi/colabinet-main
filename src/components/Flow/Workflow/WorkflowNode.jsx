import React, { useContext, useMemo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import SearchJobModal from "./SearchJobModal";
import { FlowContext } from "../Flow";
import { cn, getCurrentColor, getRecurringStatus, isUserAllow } from "@/lib/utils";
import WorkflowOptionModal from "./WorkflowOptions";
import JoinBusineeArea from "./JoinBusineeArea";
import RemoveBusinessArea from "./RemoveBusinessArea";
import RemoveWorkflow from "./RemoveWorkflow";
import { MainContext } from "@/App";
import LinkedWorkflowDialog from "./LinkedWorkflowDialog";
import { Button } from "@/components/ui/button";
import { Eye, Folder, Settings } from "lucide-react";
import CustomTooltip from "@/components/BusinessOverview/CustomTooltip";
import { changeWorkflowType, handleWorkflowStatusChange } from "@/service/general.service";
import { BusinessContext } from "@/Pages/layouts/BusinessLayout";
import { Switch } from "@/components/ui/switch";

function WorkflowNode({ data }) {
  const [showSearchJobModal, setShowSearchJobModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectBA, setSelectBA] = useState(false);
  const [selectBARemove, setSelectBARemove] = useState(false);
  const [selectWFRemove, setSelectWFRemove] = useState(false);
  const [showLinkedWorkflow, setShowLinkedWorkflow] = useState(false);
  const {
    handleCollapase,
    handleAddToCanvas,
    removeWorkflowCanvas,
    handleTWC,
    handleIFrameChange,
    currentFlow,
    handlePreviewSuggesation,
    handleReloadCanvas,
    handleOpenLinkedWorkflow,
    handleWorkFlowChange
  } = useContext(FlowContext);
  const { selectedBusinessTemplate } = useContext(BusinessContext);

  const { user, token } = useContext(MainContext);
  const { value, collapsed, transfer, transfer_data, transferred_task, edge_connect, node_id, edge_id, is_last_chain_wf = true, hang_status } = data;

  const handleJobSelect = () => {};

  const handleAddCanvas = () => {
    handleAddToCanvas("wf", value.business_area_id || null, value.id);
    setShowOptionsModal(false);
  };

  const handleDeleteWorkFlow = () => {
    setSelectWFRemove(true);
  };

  const removeFromCanvas = () => {
    removeWorkflowCanvas(value.id);
  };

  const handleViewWorkFlow = (status) => {
    handleTWC(value, status, transfer, transfer_data, collapsed, edge_connect);
    setShowOptionsModal(false);
  };

  const recurringTypeLabels = {
    2: "Instant",
    1: "Schedule",
    3: "Recurring",
    4: "On Demand",
    5: "On Hold",
    101: "External Trigger",
  };

  const is_readOnly = useMemo(() => {
    return (currentFlow?.type === "company" || user.role_id == 17) && selectedBusinessTemplate != "suggested";
  }, [user, currentFlow]);

  const wf_status = useMemo(() => {
    return getRecurringStatus(value);
  }, [value]);

  const color_obj = getCurrentColor(value);

  const handleArciveWorkFlow = async (status) => {
    await handleWorkflowStatusChange(token, { uuid: value.uuid, status: status });
    handleReloadCanvas();
  };

  const handleOpenLinkedWorkflowBT = () => {
    handleOpenLinkedWorkflow(value.chain_no, value.chain_position);
  };

  const onChange = (type) => { 
    handleWorkFlowChange(node_id, type);
    changeWorkflowType(token, { uuid: value.uuid, workflow_type: type })
  };

  return (
    <div
      style={{ borderColor: value?.chain_no && value?.chain_position > 1 ? "#703d55" : color_obj.background }}
      className={cn(
        "flex flex-col relative bg-white rounded-2xl p-4 pb-6 shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] w-96 border-l-4 border-solid",
      )}
    >
      <span
        className={`whitespace-nowrap block rounded-full px-2 py-1 text-white font-medium z-2 absolute -top-3 left-2 text-xs bg-[#777]`}
        style={{
          backgroundColor:
            value?.trigger_suggestion && value.in_draft == 1
              ? "#FA8B64"
              : value.chain_no && value.chain_position > 1
                ? "#703d55"
                : selectedBusinessTemplate > 0
                  ? "#F08965"
                  : "#6CADA0",
        }}
      >
        {value.chain_no && value.chain_position > 1 && "Linked"} {selectedBusinessTemplate > 0 && Number(selectedBusinessTemplate) != "isNaN" ? "Template" : ""}{" "}
        Workflow {value?.trigger_suggestion && value.in_draft == 1 ? "Suggestion" : ""}
      </span>

      <Handle type="target" position={Position.Top} className="w-2" />

      {/* title collepse and options */}
      <div className="flex items-center justify-between gap-2 w-full pb-2">
        <div className="flex items-center justify-between gap-2 w-full">
          <h3 className="text-[#1F2937] font-bold text-xl leading-normal w-2/4 grow mb-1">{value?.title}</h3>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              className="block size-5 p-0 bg-transparent border-0 outline-none cursor-pointer shrink-0"
              onClick={() => handleCollapase("wf", !collapsed, value.business_area_id, value.id, transfer, transfer_data, value, edge_connect)}
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
            <button type="button" className="size-5 cursor-pointer shrink-0" onClick={() => setShowOptionsModal((prevOpen) => !prevOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Trigger and Status  */}
      {!transfer && (
        <div className="flex flex-row items-center gap-1.5">
          <p className="text-[#6B7280] text-sm leading-normal font-normal w-full">
            Trigger: {recurringTypeLabels[value.recurring_type] || "N/A"} {value.recurring_type == 3 && value.recurring}
          </p>

          {(wf_status.status != "Draft" || !value?.trigger_suggestion) && (
            <span
              className="ml-auto text-xs leading-none self-start py-2 px-2.5 rounded-full inline-flex items-center gap-2"
              style={{ backgroundColor: color_obj?.border, color: color_obj?.background }}
            >
              <span className="rounded-full block size-2" style={{ backgroundColor: color_obj?.background }}></span>
              {wf_status.status}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div
          className="capitalize flex items-center gap-2 text-xs font-semibold leading-none w-fit py-1.5  my-1"
          // style={{ background: value?.workflow_type === "project" ? "#F98A63" : "#62AAB4" }}
        >
          <div className="flex gap-2 items-center justify-center rounded-full py-1 px-2 bg-[#F98A63] text-white">
            <Folder size={12} />
            <span className="text-xs font-medium">Project</span>
          </div>
          <Switch
            checked={value?.workflow_type?.toLowerCase() == "process"}
            onCheckedChange={(checked) => onChange(checked ? "process" : "project")}
            className="data-[state=unchecked]:bg-[#62aab4] data-[state=checked]:bg-[#f98a63] cursor-pointer"
          />
          <div className="flex gap-2 items-center justify-center rounded-full py-1 px-2 bg-[#62AAB4] text-white">
            <Settings size={12} />
            <span className="text-xs font-medium">Process</span>
          </div>
        </div>
      </div>

      {transfer && (
        <ul className="w-full flex flex-col gap-2 mb-4">
          <li className="text-sm leading-none">
            <span className="text-sm leading-tight font-normal text-[#4B5563]">
              From Task: <strong className="font-medium text-[#4B5563] underline">{transferred_task?.title}</strong>
            </span>
          </li>
          <li className="text-sm leading-none">
            <span className="text-sm leading-tight font-normal text-[#4B5563]">
              Condition:{" "}
              <strong className="font-medium text-[#4B5563] underline">
                {transferred_task?.transfer_type == 0
                  ? "Allow Task Member To Transfer Workflow"
                  : `Automatic Transfer +${transferred_task?.transfer_after_days > 0 ? `${transferred_task?.transfer_after_days} Days` : ""} ${
                      transferred_task?.transfer_after_hours > 0 ? `${transferred_task?.transfer_after_hours} Hours` : ""
                    }`}
              </strong>
            </span>
          </li>
          <li className="text-sm leading-none">
            <span className="text-sm leading-tight font-normal text-[#4B5563]">
              Status:{" "}
              <strong className="font-medium text-[#DC2626]">
                {transferred_task?.is_transfer_workflow_required == 1 ? " Transfer is required" : " Transfer is not required"}
              </strong>
            </span>
          </li>
        </ul>
      )}

      <div className="flex flex-wrap justify-between items-center gap-2">
        {currentFlow.type === "template" ? (
          <div className="w-fit ml-auto">
            <button onClick={handleAddCanvas} className={"text-sm font-medium text-[#95C1CF] cursor-pointer"}>
              Add This Workflow
            </button>
          </div>
        ) : (
          <>
            {isUserAllow(user, "edit-workflow") && (
              <div className="flex gap-1.5 items-center">
                {wf_status.status != "Draft" && (
                  <div className="w-fit justify-end flex flex-col project-card-tooltip">
                    <CustomTooltip content={"View Workflow Template"}>
                      <Button
                        className={"size-6 p-1 rounded-full bg-[rgba(98,170,180,0.2)] hover:bg-[rgba(98,170,180,0.2)]"}
                        onClick={() => handleIFrameChange(`workflow/On-boarding/${value.uuid}?reactframe=true`)}
                      >
                        <Eye color="#62AAB4" />
                      </Button>
                    </CustomTooltip>
                  </div>
                )}
                <div className="w-fit justify-end flex flex-col project-card-tooltip">
                  <CustomTooltip content={"Edit Workflow Template"}>
                    <Button
                      className={"size-6 p-1 rounded-full bg-[rgba(98,170,180,0.2)] hover:bg-[rgba(98,170,180,0.2)]"}
                      onClick={() => handleIFrameChange(`chatlayer/workflow-creation/${value.uuid}?reactframe=true`)}
                    >
                      <svg width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-3">
                        <path
                          d="M8.02382 4.96898L8.24481 4.72596L7.58185 3.99691L6.3674 2.66138L5.70443 1.93232L5.48345 2.17534L5.04147 2.66138L1.14583 6.94539C0.942447 7.16906 0.793818 7.44649 0.711681 7.74972L0.0193838 10.3391C-0.0295073 10.5197 0.0154725 10.7154 0.138678 10.8487C0.261883 10.9821 0.437891 11.0316 0.602165 10.9799L2.9548 10.2186C3.23055 10.1283 3.48282 9.96485 3.68621 9.74119L7.58185 5.45717L8.02382 4.96898ZM3.12885 8.59061L2.95089 9.0788C2.87266 9.14547 2.78466 9.19493 2.69079 9.22719L1.16148 9.72183L1.61128 8.0422C1.63865 7.93682 1.68559 7.84005 1.74622 7.75617L2.19015 7.56047V8.24866C2.19015 8.43792 2.33095 8.59276 2.50305 8.59276H3.12885V8.59061ZM7.09294 0.403239L6.81133 0.715078L6.36935 1.20112L6.14641 1.44413L6.80937 2.17319L8.02382 3.50872L8.68679 4.23778L8.90777 3.99476L9.34975 3.50872L9.63332 3.19688C10.1222 2.65923 10.1222 1.78823 9.63332 1.25058L8.86475 0.403239C8.37584 -0.134413 7.5838 -0.134413 7.09489 0.403239H7.09294ZM6.16596 4.01626L3.34984 7.11314C3.22859 7.24648 3.02912 7.24648 2.90787 7.11314C2.78662 6.9798 2.78662 6.76044 2.90787 6.6271L5.72399 3.53023C5.84524 3.39689 6.04471 3.39689 6.16596 3.53023C6.28721 3.66356 6.28721 3.88293 6.16596 4.01626Z"
                          fill="#62AAB4"
                        />
                      </svg>
                    </Button>
                  </CustomTooltip>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {value?.created_at && (
                <span className="text-end leading-none text-xs font-medium text-[#4B5563]">
                  Created Date: <span>{new Date(value?.created_at).toLocaleDateString()}</span>
                </span>
              )}
              {value.in_draft == 0 && (
                <Button
                  type="button"
                  onClick={() => handleIFrameChange(`workflow/details/${value.id}?reactframe=true`)}
                  className={"justify-self-end bg-[#D2EBDC] hover:bg-[#D2EBDC] rounded-lg text-[#62B887] hover:text-[#62B887] text-xs font-bold"}
                >
                  {value?.instance} Active Instances
                </Button>
              )}
            </div>
            {value?.trigger_suggestion && value.in_draft == 1 && (
              <Button
                className={
                  "ml-auto flex items-center rounded-lg text-xs h-6 !px-2.5 !py-1.5 bg-linear-to-r from-[#F08965] to-[#F9B295] shadow-[0px_4px_6px_0px_#0000001A,_0px_2px_4px_0px_#0000001A] cursor-pointer"
                }
                onClick={() => handlePreviewSuggesation(value)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-2.5">
                  <circle cx="12" cy="2" r="2" fill="currentColor" />
                  <circle cx="2" cy="22" r="2" fill="currentColor" />
                  <circle cx="22" cy="22" r="2" fill="currentColor" />
                </svg>
                Preview AI Suggestion{" "}
              </Button>
            )}
          </>
        )}
      </div>

      <WorkflowOptionModal
        isOpen={showOptionsModal}
        setIsOpen={setShowOptionsModal}
        wfdetails={value}
        setSelectBARemove={setSelectBARemove}
        removeFromCanvas={removeFromCanvas}
        handleDeleteWorkFlow={handleDeleteWorkFlow}
        handleViewWorkFlow={handleViewWorkFlow}
        transfer={transfer}
        user={user}
        handleArciveWorkFlow={handleArciveWorkFlow}
        wf_status={wf_status}
      />
      <JoinBusineeArea open={selectBA} setOpen={setSelectBA} wfdetails={value} />
      <RemoveBusinessArea open={selectBARemove} setOpen={setSelectBARemove} wfdetails={value} />
      <RemoveWorkflow open={selectWFRemove} setOpen={setSelectWFRemove} wfdetails={value} />
      <SearchJobModal isOpen={showSearchJobModal} handleJobSelect={handleJobSelect} setIsOpen={setShowSearchJobModal} workFlowID={value.id} />
      <LinkedWorkflowDialog
        open={showLinkedWorkflow}
        setOpen={setShowLinkedWorkflow}
        ba_id={value?.business_area_id}
        parent_id={value.id}
        position={{ pos_x: transfer_data?.current_pos_x, pos_y: transfer_data?.current_pos_y }}
        node_id={node_id}
        edge_id={edge_id}
        parent_data={value}
      />

      {!transfer ? (
        is_readOnly && (is_last_chain_wf || hang_status) && isUserAllow(user, "create-workflow") ? (
          <Handle
            type="source"
            className={cn(
              "!size-auto font-medium text-xs leading-none gap-1.5 absolute -bottom-[11px] z-2 cursor-pointer flex items-center !border-0 !rounded-full px-3 py-1.5 shadow-[0px_4px_6px_0px_#0000001A,_0px_2px_4px_0px_#0000001A] text-white !bg-linear-to-r from-[#3B82F6] to-[#578ed1]",
            )}
            position={Position.Bottom}
            onClick={() => {
              hang_status ? handleOpenLinkedWorkflowBT() : setShowLinkedWorkflow((prevOpen) => !prevOpen);
            }}
          >
            {!hang_status && (
              <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-3 shrink-0">
                <path
                  d="M6.25 1.875C6.25 1.46016 5.91484 1.125 5.5 1.125C5.08516 1.125 4.75 1.46016 4.75 1.875V5.25H1.375C0.960156 5.25 0.625 5.58516 0.625 6C0.625 6.41484 0.960156 6.75 1.375 6.75H4.75V10.125C4.75 10.5398 5.08516 10.875 5.5 10.875C5.91484 10.875 6.25 10.5398 6.25 10.125V6.75H9.625C10.0398 6.75 10.375 6.41484 10.375 6C10.375 5.58516 10.0398 5.25 9.625 5.25H6.25V1.875Z"
                  fill="white"
                />
              </svg>
            )}
            {hang_status ? `Linked Workflow (${hang_status})` : "Add Linked Workflow"}
          </Handle>
        ) : (
          <Handle type="source" position={Position.Bottom} />
        )
      ) : (
        <Handle type="source" position={Position.Bottom} />
      )}
    </div>
  );
}

export default WorkflowNode;
