import * as React from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup } from "@/components/ui/radio-group";
import { createWorkFlow } from "@/service/reposting.service";
import { MainContext } from "@/App";
import { FlowContext } from "../Flow";
import { getOriginUrl } from "@/lib/config";
import { BusinessContext } from "@/Pages/layouts/BusinessLayout";
import { getUserLimits } from "@/service/general.service";
import WorkflowLimitDialog from "./WorkFlowLimitDialog";
import { X } from "lucide-react";

export function LinkedWorkflowDialog({ open, setOpen, ba_id, parent_id, position, node_id, edge_id, parent_data }) {
  const { token } = React.useContext(MainContext);
  const { handleCreateWorkFlow } = React.useContext(FlowContext);
  const { handleRedirectWorkflow } = React.useContext(BusinessContext);
  const fileInputRef = React.useRef(null);
  const [mode, setMode] = React.useState("ai");
  const [workflowType, setWorkflowType] = React.useState("process");
  const [name, setName] = React.useState("");
  const [dragOver, setDragOver] = React.useState(false);
  const [fileName, setFileName] = React.useState(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [limitExceeded, setLimitExceeded] = React.useState(false);

  function onSelectMode(value) {
    setMode(value);
  }

  const validateInputs = (build = false) => {
    if (build) return true;
    if (!name.trim()) {
      setError("Workflow name is required");
      return false;
    }

    if (name.trim().length < 3) {
      setError("Workflow name must be at least 3 characters");
      return false;
    }

    if (fileName) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(fileName.type)) {
        setError("Only JPG and PNG images are allowed");
        return false;
      }

      const maxSizeInMB = 2;
      if (fileName.size / 1024 / 1024 > maxSizeInMB) {
        setError("Icon must be less than 2MB");
        return false;
      }
    }

    setError("");
    return true;
  };

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  }

  function onPickFile(e) {
    const file = e.target.files?.[0];
    if (file) setFileName(file);
  }

  function resetAndClose() {
    setOpen(false);
  }

  const handleSubmit = async (redirect = false) => {
    const limits_wf = await getUserLimits(token);
    if (limits_wf && limits_wf.reach_limit) {
      setLimitExceeded(true);
      return;
    }

    if (!validateInputs(redirect ? true : false)) return;
    setLoading(true);

    const payload = {
      title: name || "",
      build_type: mode === "manual" ? 1 : 2,
      business_area_id: ba_id,
      workflow_type: workflowType,
      ...(parent_id ? { parent_workflow_id: parent_id } : {}),
      ...(fileName && { icon: fileName }),
    };

    createWorkFlow(token, payload)
      .then((res) => {
        if (res.success) {
          const { data } = res;
          if (redirect) {
            let url = `${getOriginUrl()}/chatlayer/workflow-creation/${data.uuid}?reactframe=true`;
            if (mode === "manual") {
              url = `${getOriginUrl()}/workflow/create/${data.uuid}?reactframe=true`;
            }
            handleRedirectWorkflow(url);
          } else {
            handleCreateWorkFlow(data, ba_id, parent_id, position, node_id, edge_id, parent_data);
          }
        }
      })
      .finally(() => {
        resetAndClose();
        setLoading(false);
      });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="md:max-w-4xl rounded-2xl bg-card p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader className="space-y-1 p-4 pb-0 lg:px-6 lg:pt-4">
            <DialogTitle className="text-balance text-xl text-[#111827] font-semibold">Add a {parent_id ? "Linked" : "New"} Workflow</DialogTitle>
            <DialogDescription className="sr-only">Create a new linked workflow with optional AI assistance.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 p-4 lg:p-6 lg:py-0 max-h-[50svh] md:max-h-[65svh] overflow-auto custom-scroll">
            <div className="grid gap-3 md:gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="flex flex-col md:gap-2">
                  <Label htmlFor="wf-name" className="text-[#111827] text-sm 2xl:text-base font-medium">
                    Workflow Name (optional)
                  </Label>
                  <p className="text-xs 2xl:text-sm text-muted-foreground">You can name it now or let AI suggest one later.</p>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                    <FolderIcon />
                  </span>
                  <Input
                    id="wf-name"
                    className="pl-10 lg:h-12"
                    placeholder="E.g. Customer Onboarding"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus={false}
                  />
                </div>
              </div>

              {/* Workflow Icon (Upload) */}
              <div className="space-y-3">
                <div>
                  <Label className="text-[#111827] text-sm font-medium">Add an Icon (optional)</Label>
                  <p className="text-xs text-muted-foreground">Add an image to help you recognize this workflow on your canvas.</p>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  className={cn(
                    "flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center outline-none transition",
                    "border-[#D1D5DB] bg-[#FDFEFE]",
                    dragOver && "ring-2 ring-primary"
                  )}
                  aria-label="Upload an icon"
                >
                  <div className="mb-3 rounded-full bg-[#E0F2F1] p-3 text-[#0F9482]">
                    <UploadIcon />
                  </div>
                  <p className="text-sm text-[#111827] font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-2">
                    {fileName ? `Selected: ${fileName.name}` : "SVG, PNG or JPG (max 2 MB)"}
                    {fileName && (
                      <span
                        className="inline-flex cursor-pointer rounded-full bg-muted p-1 hover:bg-red-600 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFileName(null);
                        }}
                      >
                        <X size={16} />
                      </span>
                    )}
                  </p>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:gap-6 2xl:gap-10 lg:grid-cols-2">
              <div className="space-y-3 md:space-y-4">
                <Label className="text-sm 2xl:text-base text-[#111827] font-medium">What kind of workflow is this?</Label>
                <div className="grid gap-2 md:gap-3">
                  <WorkflowTypeCard
                    title="Process"
                    description="A recurring workflow your team will use regularly — like onboarding or approvals."
                    selected={workflowType === "process"}
                    onSelect={() => setWorkflowType("process")}
                    icon={
                      <svg
                        width="17"
                        height="16"
                        viewBox="0 0 17 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#9CA3AF] group-hover:fill-[#62AAB4]"
                      >
                        <path
                          d="M12.4567 4.50088H10.6884C10.0661 4.50088 9.56338 5.00361 9.56338 5.62588C9.56338 6.24814 10.0661 6.75088 10.6884 6.75088H15.1884C15.8106 6.75088 16.3134 6.24814 16.3134 5.62588V1.12588C16.3134 0.503613 15.8106 0.00087896 15.1884 0.00087896C14.5661 0.00087896 14.0634 0.503613 14.0634 1.12588V2.92588L13.4446 2.30713C10.3685 -0.769043 5.3833 -0.769043 2.30713 2.30713C-0.769043 5.3833 -0.769043 10.3685 2.30713 13.4446C5.3833 16.5208 10.3685 16.5208 13.4446 13.4446C13.8841 13.0052 13.8841 12.2915 13.4446 11.8521C13.0052 11.4126 12.2915 11.4126 11.8521 11.8521C9.65479 14.0493 6.09346 14.0493 3.89619 11.8521C1.69893 9.65479 1.69893 6.09346 3.89619 3.89619C6.09346 1.69893 9.65479 1.69893 11.8521 3.89619L12.4567 4.50088Z"
                          fill="currentColor"
                        />
                      </svg>
                    }
                  />
                  <WorkflowTypeCard
                    title="Project"
                    description="A one-time sequence of tasks for a specific goal or deliverable."
                    selected={workflowType === "project"}
                    onSelect={() => setWorkflowType("project")}
                    icon={
                      <svg
                        width="18"
                        height="17"
                        viewBox="0 0 18 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#9CA3AF] group-hover:fill-[#62AAB4]"
                      >
                        <path
                          d="M6.46875 1.6875H11.5312C11.6859 1.6875 11.8125 1.81406 11.8125 1.96875V3.375H6.1875V1.96875C6.1875 1.81406 6.31406 1.6875 6.46875 1.6875ZM4.5 1.96875V3.375H2.25C1.00898 3.375 0 4.38398 0 5.625V9H6.75H11.25H18V5.625C18 4.38398 16.991 3.375 15.75 3.375H13.5V1.96875C13.5 0.882422 12.6176 0 11.5312 0H6.46875C5.38242 0 4.5 0.882422 4.5 1.96875ZM18 10.125H11.25V11.25C11.25 11.8723 10.7473 12.375 10.125 12.375H7.875C7.25273 12.375 6.75 11.8723 6.75 11.25V10.125H0V14.625C0 15.866 1.00898 16.875 2.25 16.875H15.75C16.991 16.875 18 15.866 18 14.625V10.125Z"
                          fill="currentColor"
                        />
                      </svg>
                    }
                  />
                </div>
              </div>

              {/* Build Mode */}
              <div className="space-y-3 md:space-y-4">
                <Label className="text-sm 2xl:text-base text-[#111827] font-medium">Choose how you'd like to build this workflow</Label>

                <WorkflowTypeCard
                  title="AI-Assisted"
                  description="Describe what you need, and AI will create the steps — and even name it for you."
                  selected={mode === "ai"}
                  onSelect={() => onSelectMode("ai")}
                  icon={
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M5.20312 15.4406L4.76016 16.4777C4.10273 16.1438 3.49805 15.7324 2.94961 15.2508L3.74766 14.4527C4.18711 14.8359 4.67578 15.1699 5.20312 15.4406ZM1.12852 9.26367H0C0.0492187 10.009 0.189844 10.7297 0.411328 11.4117L1.45898 10.9934C1.28672 10.4414 1.1707 9.86133 1.12852 9.26367ZM1.12852 8.13867C1.17773 7.47773 1.31133 6.83789 1.51875 6.23672L0.481641 5.79375C0.217969 6.53203 0.0527344 7.31953 0 8.13867H1.12852ZM1.96172 5.20312C2.23594 4.6793 2.56641 4.19063 2.94961 3.74414L2.15156 2.94609C1.66992 3.49453 1.25508 4.09922 0.924609 4.75664L1.96172 5.20312ZM13.6582 14.4527C13.1695 14.8746 12.6246 15.2367 12.0375 15.5215L12.4559 16.5691C13.1836 16.2211 13.8551 15.7746 14.4563 15.2473L13.6582 14.4527ZM3.74414 2.94961C4.23281 2.52773 4.77773 2.16563 5.36484 1.88086L4.94648 0.833203C4.21875 1.18125 3.54727 1.62773 2.94961 2.15508L3.74414 2.94961ZM15.4406 12.1992C15.1664 12.723 14.8359 13.2117 14.4527 13.6582L15.2508 14.4563C15.7324 13.9078 16.1473 13.2996 16.4777 12.6457L15.4406 12.1992ZM16.2738 9.26367C16.2246 9.92461 16.091 10.5645 15.8836 11.1656L16.9207 11.6086C17.1844 10.8668 17.3496 10.0793 17.3988 9.26016H16.2738V9.26367ZM10.9934 15.9434C10.4414 16.1191 9.86133 16.2316 9.26367 16.2738V17.4023C10.009 17.3531 10.7297 17.2125 11.4117 16.991L10.9934 15.9434ZM8.13867 16.2738C7.47773 16.2246 6.83789 16.091 6.23672 15.8836L5.79375 16.9207C6.53555 17.1844 7.32305 17.3496 8.14219 17.3988V16.2738H8.13867ZM15.9434 6.40898C16.1191 6.96094 16.2316 7.54102 16.2738 8.13867H17.4023C17.3531 7.39336 17.2125 6.67266 16.991 5.99062L15.9434 6.40898ZM2.94961 13.6582C2.52773 13.1695 2.16563 12.6246 1.88086 12.0375L0.833203 12.4559C1.18125 13.1836 1.62773 13.8551 2.15508 14.4563L2.94961 13.6582ZM9.26367 1.12852C9.92461 1.17773 10.5609 1.31133 11.1656 1.51875L11.6086 0.481641C10.8703 0.217969 10.0828 0.0527344 9.26367 0V1.12852ZM6.40898 1.45898C6.96094 1.2832 7.54102 1.1707 8.13867 1.12852V0C7.39336 0.0492187 6.67266 0.189844 5.99062 0.411328L6.40898 1.45898ZM15.2508 2.94609L14.4527 3.74414C14.8746 4.23281 15.2367 4.77773 15.525 5.36484L16.5727 4.94648C16.2246 4.21875 15.7781 3.54727 15.2508 2.94609ZM13.6582 2.94961L14.4563 2.15156C13.9078 1.66992 13.3031 1.25508 12.6457 0.924609L12.2027 1.96172C12.723 2.23594 13.2152 2.56641 13.6582 2.94961Z"
                        fill="#62AAB4"
                      />
                      <path
                        d="M8.70117 13.4824C9.24483 13.4824 9.68555 13.0417 9.68555 12.498C9.68555 11.9544 9.24483 11.5137 8.70117 11.5137C8.15752 11.5137 7.7168 11.9544 7.7168 12.498C7.7168 13.0417 8.15752 13.4824 8.70117 13.4824Z"
                        fill="#62AAB4"
                      />
                      <path
                        d="M8.97226 10.6699H8.40976C8.17773 10.6699 7.98788 10.4801 7.98788 10.248C7.98788 7.75195 10.709 8.00156 10.709 6.4582C10.709 5.75508 10.0832 5.04492 8.69101 5.04492C7.66796 5.04492 7.13359 5.38242 6.60976 6.05391C6.47265 6.22969 6.21952 6.26484 6.04023 6.13828L5.57968 5.81484C5.3828 5.67773 5.3371 5.4 5.48827 5.21016C6.23359 4.25391 7.11952 3.63867 8.69452 3.63867C10.5332 3.63867 12.1187 4.68633 12.1187 6.4582C12.1187 8.83477 9.39765 8.69063 9.39765 10.248C9.39413 10.4801 9.20429 10.6699 8.97226 10.6699Z"
                        fill="#62AAB4"
                      />
                    </svg>
                  }
                />
                <WorkflowTypeCard
                  title="Start Manually"
                  description="Build it step-by-step from a blank workflow and add tasks your way."
                  selected={mode === "manual"}
                  onSelect={() => onSelectMode("manual")}
                  icon={
                    <svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M0.84375 0C0.376172 0 0 0.376172 0 0.84375V2.53125C0 2.99883 0.376172 3.375 0.84375 3.375H2.53125C2.99883 3.375 3.375 2.99883 3.375 2.53125V0.84375C3.375 0.376172 2.99883 0 2.53125 0H0.84375ZM6.1875 0.5625C5.56523 0.5625 5.0625 1.06523 5.0625 1.6875C5.0625 2.30977 5.56523 2.8125 6.1875 2.8125H16.3125C16.9348 2.8125 17.4375 2.30977 17.4375 1.6875C17.4375 1.06523 16.9348 0.5625 16.3125 0.5625H6.1875ZM6.1875 6.1875C5.56523 6.1875 5.0625 6.69023 5.0625 7.3125C5.0625 7.93477 5.56523 8.4375 6.1875 8.4375H16.3125C16.9348 8.4375 17.4375 7.93477 17.4375 7.3125C17.4375 6.69023 16.9348 6.1875 16.3125 6.1875H6.1875ZM6.1875 11.8125C5.56523 11.8125 5.0625 12.3152 5.0625 12.9375C5.0625 13.5598 5.56523 14.0625 6.1875 14.0625H16.3125C16.9348 14.0625 17.4375 13.5598 17.4375 12.9375C17.4375 12.3152 16.9348 11.8125 16.3125 11.8125H6.1875ZM0 6.46875V8.15625C0 8.62383 0.376172 9 0.84375 9H2.53125C2.99883 9 3.375 8.62383 3.375 8.15625V6.46875C3.375 6.00117 2.99883 5.625 2.53125 5.625H0.84375C0.376172 5.625 0 6.00117 0 6.46875ZM0.84375 11.25C0.376172 11.25 0 11.6262 0 12.0938V13.7812C0 14.2488 0.376172 14.625 0.84375 14.625H2.53125C2.99883 14.625 3.375 14.2488 3.375 13.7812V12.0938C3.375 11.6262 2.99883 11.25 2.53125 11.25H0.84375Z"
                        fill="#9CA3AF"
                      />
                    </svg>
                  }
                />
              </div>
            </div>
            {error && <p className="text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium shadow-sm">{error}</p>}
          </div>
          <div>
            {loading && (
              <div className="w-full h-1 bg-gray-200 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 animate-[move_1.5s_linear_infinite]"></div>
              </div>
            )}

            <div className="border-t border-solid border-[#E5E7EB] p-4 lg:px-6 lg:py-4 rounded-b-2xl">
              <DialogFooter className="gap-2 sm:gap-3 mb-2.5 justify-between flex-row">
                <Button type="button" className="w-fit text-xs md:text-sm py-1.5 px-3" variant="ghost" onClick={resetAndClose}>
                  Cancel
                </Button>
                <Button type="button" className="w-fit text-xs md:text-sm py-1.5 px-3" variant="outline" onClick={() => handleSubmit(false)}>
                  Save as Draft
                </Button>
                <Button type="button" className="bg-[#1BA2A7] w-fit text-xs md:text-sm py-1.5 px-3" variant="default" onClick={() => handleSubmit(true)}>
                  Start Building
                </Button>
              </DialogFooter>
              <p className="block text-xs text-muted-foreground text-center">
                Draft workflows appear on your canvas and link into your chain. You can open them anytime to edit or finish building.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <WorkflowLimitDialog isOpen={limitExceeded} onOpenChange={(value) => setLimitExceeded(value)} />
    </>
  );
}

function WorkflowTypeCard({ title, description, selected, onSelect, icon }) {
  return (
    <Card
      role="radio"
      tabIndex={0}
      aria-checked={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "flex cursor-pointer items-start gap-4 rounded-xl border-2 border-solid bg-white p-4 transition group shadow-none",
        selected ? "border-[#62AAB4] bg-[#E6F3F4]" : "hover:border-[#62AAB4] hover:bg-[#E6F3F4]"
      )}
    >
      <div className="flex justify-center items-start gap-2">
        <div className={cn("rounded-full p-2", selected ? "text-[#62AAB4]" : "text-[#9CA3AF]")}>{icon}</div>
        <div className="space-y-1">
          <p className="font-medium text-[#0F172A]">{title}</p>
          <p className="text-xs md:text-sm text-muted-foreground text-pretty">{description}</p>
        </div>
      </div>
    </Card>
  );
}

function FolderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.333 4.999a1.667 1.667 0 0 1 1.667-1.666h3.333L10.833 5h4.167a1.667 1.667 0 0 1 1.667 1.667v6.666a1.667 1.667 0 0 1-1.667 1.667H5a1.667 1.667 0 0 1-1.667-1.667V4.999Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 15.5V4.5M12 4.5L8 8.5M12 4.5L16 8.5M5 12.5V18.5C5 19.0523 5.44772 19.5 6 19.5H18C18.5523 19.5 19 19.0523 19 18.5V12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default LinkedWorkflowDialog;
