import { MainContext } from "@/App";
import { getOriginUrl, getVideoLink } from "@/lib/config";
import { cn, isUserAllow, isUserAllowAny } from "@/lib/utils";
import { changeCompleteStatus } from "@/service/reposting.service";
import { Video } from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useMemo } from "react";
import { Button } from "../ui/button";

function Roadmap({ currentPath, setCurrnetPath, handleBusinessOverview, crScoketMessage, sendExtMessage, handleCurrentInnerPath }) {
  const { token, user } = useContext(MainContext);
  const [isFrame, setIsFrame] = useState(false);
  const iframeRef = useRef(null);
  const [videoGuide, setVideoGuide] = useState({ open: false, link: "" });
  const [permissionPopup, setPermissionPopup] = useState(false);
  const [completedState, setCompletedState] = useState({
    is_business_plan_completed: false,
    is_marketing_plan_completed: false,
    is_core_team_completed: false,
    is_job_descriptions_completed: false,
    add_your_current_processes: false,
    is_ai_employee_completed: false,
    is_freelancers_completed: false,
    is_guests_completed: false,
  });

  useEffect(() => {
    if (crScoketMessage) {
      iframeRef?.current?.contentWindow?.postMessage(crScoketMessage, "*");
      sendExtMessage(null);
    }
  }, [crScoketMessage]);

  useEffect(() => {
    if (isFrame) {
      iframeRef?.current?.addEventListener("load", (e) => {
        const iframe = iframeRef.current;
        const currentLink = iframe?.contentWindow?.location.href;
        handleCurrentInnerPath(currentLink);
      });
    }
  }, [isFrame]);

  useEffect(() => {
    if (user) {
      setCompletedState({
        is_business_plan_completed: !!user.is_business_plan_completed,
        is_marketing_plan_completed: !!user.is_marketing_plan_completed,
        is_core_team_completed: !!user.is_core_team_completed,
        is_job_descriptions_completed: !!user.is_job_descriptions_completed,
        add_your_current_processes: !!user.add_your_current_processes,
        is_ai_employee_completed: !!user.is_ai_employee_completed,
        is_freelancers_completed: !!user.is_freelancers_completed,
        is_guests_completed: !!user.is_guests_completed,
      });
    }
  }, [user]);

  useEffect(() => {
    if (currentPath) {
      setIsFrame(true);
    } else {
      setIsFrame(false);
    }
  }, [currentPath]);

  const onCompleteChange = (event) => {
    const { name, checked } = event.target;
    setCompletedState((prev) => ({
      ...prev,
      [name]: checked,
    }));

    changeCompleteStatus(token, { [name]: checked ? 1 : 0 })
      .then((res) => {
        if (res.success) {
          console.log("Status updated successfully");
        } else {
          console.log("Failed to update status");
        }
      })
      .catch((error) => {
        console.error("Error updating status:", error);
      });
  };

  const handleCreateLink = (path) => {
    setCurrnetPath(path);
  };

  const handleVideoClick = (key) => {
    const link = getVideoLink(key);
    if (!link) return;
    setVideoGuide({ open: true, link });
  };

  const handleCloseVideo = () => {
    setVideoGuide({ open: false, link: "" });
  };

  const handleAddClick = (hasPermission, path) => {
    if (hasPermission) {
      handleCreateLink(path);
    } else {
      setPermissionPopup(true);
    }
  };

  const isAIWorkForceAllow = useMemo(() => {
    return isUserAllowAny(user, [
      "view-ai-employee",
      "view-ai-assistants",
      "view-ai-sales-employees",
      "view-ai-customer-service-employees",
      "create-ai-sales-employees",
      "create-ai-customer-service-employees",
      "edit-ai-sales-employees",
      "edit-ai-employee",
      "edit-ai-customer-service-employees",
      "edit-ai-assistants",
      "delete-ai-sales-employees",
      "delete-ai-customer-service-employees",
      "delete-ai-employee",
      "delete-ai-assistants",
    ]);
  }, [user]);
  const canEditTeam = useMemo(() => isUserAllowAny(user, ["view-team", "create-team", "edit-team", "delete-team"]), [user]);
  const canEditGuest = useMemo(() => isUserAllowAny(user, ["view-guest", "create-guest", "edit-guest", "delete-guest"]), [user]);
  const canViewFreelancer = useMemo(() => isUserAllow(user, "view-freelancer"), [user]);

  const isViewBusinessPlan = useMemo(() => isUserAllowAny(user, ["view-business-plan", "create-business-plan"]), [user]);
  const isViewJobDescriptions = useMemo(() => isUserAllowAny(user, ["view-job-descriptions", "manage-job-descriptions"]), [user]);
  const isViewMarketingPlan = useMemo(() => isUserAllowAny(user, ["view-marketing-plan", "manage-marketing-plan"]), [user]);
  const canCaptureProcesses = useMemo(
    () => isUserAllowAny(user, ["view-current-processes", "create-current-processes", "edit-current-processes", "delete-current-processes"]),
    [user],
  );

  const cardView = useMemo(() => {
    let count = 0;
    if (isViewBusinessPlan) count++;
    if (isViewJobDescriptions) count++;
    if (isViewMarketingPlan) count++;
    if (canCaptureProcesses) count++;
    if (isAIWorkForceAllow) count++;
    if (canEditTeam) count++;
    if (canEditGuest) count++;
    if (canViewFreelancer) count++;
    return count;
  }, [isViewBusinessPlan, isViewJobDescriptions, isViewMarketingPlan, canCaptureProcesses, isAIWorkForceAllow, canEditTeam, canEditGuest, canViewFreelancer]);

  const completeProfilePerc = useMemo(() => {
    const flags = Object.keys(completedState).filter((key) => {
      if (key === "is_business_plan_completed" && !isViewBusinessPlan) return false;
      if (key === "is_core_team_completed" && !canEditTeam) return false;
      if (key === "is_marketing_plan_completed" && !isViewMarketingPlan) return false;
      if (key === "is_job_descriptions_completed" && !isViewJobDescriptions) return false;
      if (key === "add_your_current_processes" && !canCaptureProcesses) return false;
      if (key === "is_ai_employee_completed" && !isAIWorkForceAllow) return false;
      if (key === "is_freelancers_completed" && !canViewFreelancer) return false;
      if (key === "is_guests_completed" && !canEditGuest) return false;
      return true;
    });
    const completed = flags.filter((key) => completedState[key]).length;
    return Math.round((completed / flags.length) * 100);
  }, [completedState, cardView]);

  return (
    <>
      {isFrame && currentPath ? (
        <div className="w-full bg-white h-full">
          <iframe
            ref={iframeRef}
            src={currentPath}
            title="W3Schools Free Online Web Tutorials"
            className="w-full h-[calc(100vh_-_48px)] md:h-[calc(100vh_-_64px)]"
          ></iframe>
        </div>
      ) : (
        <div className="w-full px-4 pt-6 md:px-10 2xl:px-16 overflow-auto grow h-96 pb-36 md:pb-8">
          <div className="flex items-center justify-between w-full flex-wrap md:flex-nowrap">
            <h3 className="text-xl md:text-xl lg:text-xl font-medium text-[#49B8BF]">Start Building Your Colabi Business Brain.</h3>
            <div className="mt-5 md:mt-0 flex flex-col">
              <p className="text-sm 2xl:text-base leading-none font-normal text-[#2E2F30]">
                Brain Training: <span className="text-[#EC6E43] text-lg">{completeProfilePerc}%</span> Added
              </p>
              <span className="block w-full bg-[#ffdbd1] h-2 rounded-2xl overflow-hidden relative">
                <span className={cn("block bg-[#faa282] h-full")} style={{ width: `${completeProfilePerc}%` }}></span>
              </span>
              <span className="text-xs text-[#A09EA6] font-normal">This updates as you add more business context</span>
            </div>
          </div>
          <p className="mt-1.5 text-sm text-[#85838B] font-normal">Add what you have today. Everything here is optional and can be added or improved over time.</p>
          <div className="mt-4 2xl:mt-6">
              <div className="flex gap-8 flex-wrap lg:flex-nowrap">
                <div className="w-full">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-5">
                      <span className="text-sm lg:text-base text-white p-5 py-2 ml-4 font-normal w-fit shrink-0 rounded-t-sm bg-[#FA8B64]">&gt; Step 1</span>
                      <h4 className="text-[#817F88] font-bold text-xs md:text-sm 2xl:text-lg">Business Setup – Build Your Foundation:</h4>
                    </div>
                    <div className="flex flex-row items-center gap-2 2xl:gap-3 text-[#1BA0A5] text-xs 2xl:text-sm font-normal ml-auto bg-[#1BA0A5]/5 border border-[#e5e7eb] rounded-md mb-2 py-1.5 2xl:py-2 p-3">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M10 20C12.6522 20 15.1957 18.9464 17.0711 17.0711C18.9464 15.1957 20 12.6522 20 10C20 7.34784 18.9464 4.8043 17.0711 2.92893C15.1957 1.05357 12.6522 0 10 0C7.34784 0 4.8043 1.05357 2.92893 2.92893C1.05357 4.8043 0 7.34784 0 10C0 12.6522 1.05357 15.1957 2.92893 17.0711C4.8043 18.9464 7.34784 20 10 20ZM8.4375 13.125H9.375V10.625H8.4375C7.91797 10.625 7.5 10.207 7.5 9.6875C7.5 9.16797 7.91797 8.75 8.4375 8.75H10.3125C10.832 8.75 11.25 9.16797 11.25 9.6875V13.125H11.5625C12.082 13.125 12.5 13.543 12.5 14.0625C12.5 14.582 12.082 15 11.5625 15H8.4375C7.91797 15 7.5 14.582 7.5 14.0625C7.5 13.543 7.91797 13.125 8.4375 13.125ZM10 5C10.3315 5 10.6495 5.1317 10.8839 5.36612C11.1183 5.60054 11.25 5.91848 11.25 6.25C11.25 6.58152 11.1183 6.89946 10.8839 7.13388C10.6495 7.3683 10.3315 7.5 10 7.5C9.66848 7.5 9.35054 7.3683 9.11612 7.13388C8.8817 6.89946 8.75 6.58152 8.75 6.25C8.75 5.91848 8.8817 5.60054 9.11612 5.36612C9.35054 5.1317 9.66848 5 10 5Z"
                          fill="currentColor"
                        />
                        </svg>
                        <span className="text-[#A09EA6]">You can start using colabi immediately. Everything on this page can be added later to make your Business Brain smart over time.</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 2xl:gap-6 bg-white shadow-[0px_1px_3px_0px_#0000001A,_0px_1px_2px_0px_#0000001A] rounded-xl p-4 2xl:p-6">
                      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-y-3 gap-4 max-w-[1400px] w-full mx-auto">
                        <div className="flex flex-wrap w-full gap-3 col-span-full">
                          <div className="flex justify-between items-center w-full">
                            <h3 className="text-[#FA8B64] font-semibold text-lg">Your Workforce</h3>
                            <div onClick={handleBusinessOverview} className="text-[#1BA0A5] text-sm flex items-center gap-1 cursor-pointer hover:text-[#0E7C7F] transition-colors">
                              <span>Skip setup for now and go to Business Overview</span>
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className="lucide lucide-arrow-right"
                              >
                                <path d="M5 12h14"/>
                                <path d="m12 5 7 7-7 7"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                          <div className="p-3 2xl:py-4 2xl:px-5 border border-solid border-[#DEE4E7] rounded-xl bg-[#FEFEFE] h-full transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_12px_30px_rgba(250,139,100,0.35)] hover:border-[#FA8B64]">
                            <div className="flex items-center gap-3">
                              <div className="size-8 shrink-0 bg-[#2563EB]/20 rounded-full">
                                <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-full block">
                                  <path
                                    d="M16.7869 15.6912C17.4727 15.6912 18.1304 15.4188 18.6154 14.9339C19.1003 14.4489 19.3728 13.7912 19.3728 13.1054C19.3728 12.4196 19.1003 11.7619 18.6154 11.2769C18.1304 10.792 17.4727 10.5195 16.7869 10.5195C16.1011 10.5195 15.4434 10.792 14.9584 11.2769C14.4735 11.7619 14.2011 12.4196 14.2011 13.1054C14.2011 13.7912 14.4735 14.4489 14.9584 14.9339C15.4434 15.4188 16.1011 15.6912 16.7869 15.6912ZM12.5849 17.6306C13.0135 17.6306 13.4246 17.4604 13.7277 17.1573C14.0308 16.8542 14.2011 16.4431 14.2011 16.0145C14.2011 15.5858 14.0308 15.1748 13.7277 14.8717C13.4246 14.5686 13.0135 14.3983 12.5849 14.3983C12.1563 14.3983 11.7452 14.5686 11.4421 14.8717C11.139 15.1748 10.9687 15.5858 10.9687 16.0145C10.9687 16.4431 11.139 16.8542 11.4421 17.1573C11.7452 17.4604 12.1563 17.6306 12.5849 17.6306ZM22.6051 16.0145C22.6051 16.4431 22.4348 16.8542 22.1317 17.1573C21.8286 17.4604 21.4176 17.6306 20.9889 17.6306C20.5603 17.6306 20.1492 17.4604 19.8461 17.1573C19.543 16.8542 19.3728 16.4431 19.3728 16.0145C19.3728 15.5858 19.543 15.1748 19.8461 14.8717C20.1492 14.5686 20.5603 14.3983 20.9889 14.3983C21.4176 14.3983 21.8286 14.5686 22.1317 14.8717C22.4348 15.1748 22.6051 15.5858 22.6051 16.0145ZM16.7869 16.3377C17.6442 16.3377 18.4663 16.6783 19.0725 17.2844C19.6787 17.8906 20.0192 18.7128 20.0192 19.57V23.4488H13.5546V19.57C13.5546 18.7128 13.8951 17.8906 14.5013 17.2844C15.1075 16.6783 15.9296 16.3377 16.7869 16.3377ZM12.2617 19.57C12.2617 19.122 12.3263 18.6896 12.4478 18.281L12.3379 18.29C11.7838 18.3509 11.2717 18.6141 10.8997 19.0293C10.5278 19.4444 10.3221 19.9823 10.3223 20.5397V23.4488H12.2617V19.57ZM23.2516 23.4488V20.5397C23.2516 19.9633 23.0317 19.4086 22.6367 18.9889C22.2417 18.5691 21.7013 18.3159 21.126 18.281C21.2469 18.6896 21.3122 19.122 21.3122 19.57V23.4488H23.2516Z"
                                    fill="#2563EB"
                                  />
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-[#4A4C5E] font-bold text-sm">Add Your Internal Team</h4>
                                <p className="text-[11px] text-[#BCB8C5] font-normal">Full-time and part-time team members</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant={"ghost"}
                                  className={
                                    "cursor-pointer mt-1 p-0 flex items-center gap-2 text-[#64748B] bg-[#F1F5F9] hover:bg-[#E2E8F0] h-6 rounded-md text-xs font-normal"
                                  }
                                  type="button"
                                  onClick={() => handleVideoClick("team")}
                                >
                                  <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                      d="M0.25 3C0.25 2.17266 0.922656 1.5 1.75 1.5H7.75C8.57734 1.5 9.25 2.17266 9.25 3V9C9.25 9.82734 8.57734 10.5 7.75 10.5H1.75C0.922656 10.5 0.25 9.82734 0.25 9V3ZM13.3539 2.33906C13.5977 2.47031 13.75 2.72344 13.75 3V9C13.75 9.27656 13.5977 9.52969 13.3539 9.66094C13.1102 9.79219 12.8148 9.77812 12.5828 9.62344L10.3328 8.12344L10 7.90078V7.5V4.5V4.09922L10.3328 3.87656L12.5828 2.37656C12.8125 2.22422 13.1078 2.20781 13.3539 2.33906Z"
                                      fill="#64748B"
                                    />
                                  </svg>
                                  <span className="">Video Guide</span>
                                </Button>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="checkbox"
                                    id="is_core_team_completed"
                                    name="is_core_team_completed"
                                    onChange={onCompleteChange}
                                    checked={completedState["is_core_team_completed"]}
                                  />
                                  <label htmlFor="completed-1" className="text-[10px] text-[#A09EA6] font-normal leading-none cursor-pointer">
                                    Added
                                  </label>
                                </div>
                              </div>
                              <button
                                onClick={() => handleAddClick(canEditTeam, `${getOriginUrl()}/teams?reactframe=true`)}
                                className="bg-[#71AEA3] border border-[#4B9B8B] rounded-[8px]  py-1.5  2xl:py-1.5  px-5   text-[#FEFEFE] text-sm flex items-center w-fit font-normal cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                          <div className="p-3 2xl:py-4 2xl:px-5 border border-solid border-[#DEE4E7] rounded-xl bg-[#FEFEFE] h-full transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_12px_30px_rgba(250,139,100,0.35)] hover:border-[#FA8B64]">
                            <div className="flex items-center gap-3">
                              <div className="size-8 shrink-0 bg-[#CA8A04]/20 rounded-full p-1.5">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-full block">
                                  <path
                                    d="M10.3435 9.27711C11.2008 9.27711 12.0229 9.61765 12.6291 10.2238C13.2353 10.83 13.5758 11.6522 13.5758 12.5094V13.1559C13.5758 13.4988 13.4396 13.8277 13.1971 14.0701C12.9547 14.3126 12.6258 14.4488 12.2829 14.4488H3.23238C2.88948 14.4488 2.56061 14.3126 2.31814 14.0701C2.07567 13.8277 1.93945 13.4988 1.93945 13.1559V12.5094C1.93945 11.6522 2.28 10.83 2.88618 10.2238C3.49236 9.61765 4.31451 9.27711 5.17178 9.27711H10.3435ZM12.9294 5.39832C13.1008 5.39832 13.2652 5.46643 13.3865 5.58766C13.5077 5.7089 13.5758 5.87333 13.5758 6.04478V6.69125H14.2223C14.3937 6.69125 14.5582 6.75936 14.6794 6.88059C14.8006 7.00183 14.8687 7.16626 14.8687 7.33771C14.8687 7.50917 14.8006 7.6736 14.6794 7.79483C14.5582 7.91607 14.3937 7.98418 14.2223 7.98418H13.5758V8.63064C13.5758 8.8021 13.5077 8.96653 13.3865 9.08776C13.2652 9.209 13.1008 9.27711 12.9294 9.27711C12.7579 9.27711 12.5935 9.209 12.4722 9.08776C12.351 8.96653 12.2829 8.8021 12.2829 8.63064V7.98418H11.6364C11.465 7.98418 11.3005 7.91607 11.1793 7.79483C11.0581 7.6736 10.99 7.50917 10.99 7.33771C10.99 7.16626 11.0581 7.00183 11.1793 6.88059C11.3005 6.75936 11.465 6.69125 11.6364 6.69125H12.2829V6.04478C12.2829 5.87333 12.351 5.7089 12.4722 5.58766C12.5935 5.46643 12.7579 5.39832 12.9294 5.39832ZM7.75764 1.51953C8.6149 1.51953 9.43706 1.86008 10.0432 2.46626C10.6494 3.07244 10.99 3.89459 10.99 4.75185C10.99 5.60912 10.6494 6.43127 10.0432 7.03745C9.43706 7.64363 8.6149 7.98418 7.75764 7.98418C6.90037 7.98418 6.07822 7.64363 5.47204 7.03745C4.86586 6.43127 4.52531 5.60912 4.52531 4.75185C4.52531 3.89459 4.86586 3.07244 5.47204 2.46626C6.07822 1.86008 6.90037 1.51953 7.75764 1.51953Z"
                                    fill="#CA8A04"
                                  />
                                </svg>
                              </div>
                              {/* <img src="/images/at-client.png" alt="Internal Team" className="w-8 h-8" /> */}
                              <div>
                                <h4 className="text-[#4A4C5E] font-bold text-sm">Add Guests</h4>
                                <p className="text-[11px] text-[#BCB8C5] font-normal">Collaborators with limited access</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant={"ghost"}
                                  className={
                                    "cursor-pointer mt-1 p-0 flex items-center gap-2 text-[#64748B] bg-[#F1F5F9] hover:bg-[#E2E8F0] h-6 rounded-md text-xs font-normal"
                                  }
                                  type="button"
                                  onClick={() => handleVideoClick("guest")}
                                >
                                  <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                      d="M0.25 3C0.25 2.17266 0.922656 1.5 1.75 1.5H7.75C8.57734 1.5 9.25 2.17266 9.25 3V9C9.25 9.82734 8.57734 10.5 7.75 10.5H1.75C0.922656 10.5 0.25 9.82734 0.25 9V3ZM13.3539 2.33906C13.5977 2.47031 13.75 2.72344 13.75 3V9C13.75 9.27656 13.5977 9.52969 13.3539 9.66094C13.1102 9.79219 12.8148 9.77812 12.5828 9.62344L10.3328 8.12344L10 7.90078V7.5V4.5V4.09922L10.3328 3.87656L12.5828 2.37656C12.8125 2.22422 13.1078 2.20781 13.3539 2.33906Z"
                                      fill="#64748B"
                                    />
                                  </svg>
                                  <span className="">Video Guide</span>
                                </Button>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="checkbox"
                                    id="is_guests_completed"
                                    name="is_guests_completed"
                                    onChange={onCompleteChange}
                                    checked={completedState["is_guests_completed"]}
                                  />
                                  <label htmlFor="completed-2" className="text-[10px] text-[#A09EA6] font-normal leading-none cursor-pointer">
                                    Added
                                  </label>
                                </div>
                              </div>
                              <button
                                onClick={() => handleAddClick(canEditGuest, `${getOriginUrl()}/guests?reactframe=true`)}
                                className="bg-[#71AEA3] border border-[#4B9B8B] rounded-[8px]  py-1.5  2xl:py-1.5  px-5   text-[#FEFEFE] text-sm flex items-center w-fit font-normal cursor-pointer"
                              >
                                Add{" "}
                              </button>
                            </div>
                          </div>
                          <div className="p-3 2xl:py-4 2xl:px-5 border border-solid border-[#DEE4E7] rounded-xl bg-[#FEFEFE] h-full transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_12px_30px_rgba(250,139,100,0.35)] hover:border-[#FA8B64]">
                            <div className="flex items-center gap-3">
                              <div className="size-8 shrink-0 bg-[#49B8BF]/20 rounded-full p-2">
                                <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-full block">
                                  <path
                                    d="M6.78788 7.75758C8.9303 7.75758 10.6667 6.02121 10.6667 3.87879C10.6667 1.73636 8.9303 0 6.78788 0C4.64545 0 2.90909 1.73636 2.90909 3.87879C2.90909 6.02121 4.64545 7.75758 6.78788 7.75758ZM9.69091 8.74545L8.24242 14.5455L7.27273 10.4242L8.24242 8.72727H5.33333L6.30303 10.4242L5.33333 14.5455L3.88485 8.74545C1.72424 8.84848 0 10.6152 0 12.8V14.0606C0 14.8636 0.651515 15.5152 1.45455 15.5152H12.1212C12.9242 15.5152 13.5758 14.8636 13.5758 14.0606V12.8C13.5758 10.6152 11.8515 8.84848 9.69091 8.74545Z"
                                    fill="#49B8BF"
                                  />
                                </svg>
                              </div>
                              {/* <img src="/images/at-freelancer.png" alt="Internal Team" className="w-8 h-8" /> */}

                              <div>
                                <h4 className="text-[#4A4C5E] font-bold text-sm">Add Freelancers</h4>
                                <p className="text-[11px] text-[#BCB8C5] font-normal">Hire external experts for specific tasks</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant={"ghost"}
                                  className={
                                    "cursor-pointer mt-1 p-0 flex items-center gap-2 text-[#64748B] bg-[#F1F5F9] hover:bg-[#E2E8F0] h-6 rounded-md text-xs font-normal"
                                  }
                                  type="button"
                                  onClick={() => handleVideoClick("freelancers")}
                                >
                                  <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                      d="M0.25 3C0.25 2.17266 0.922656 1.5 1.75 1.5H7.75C8.57734 1.5 9.25 2.17266 9.25 3V9C9.25 9.82734 8.57734 10.5 7.75 10.5H1.75C0.922656 10.5 0.25 9.82734 0.25 9V3ZM13.3539 2.33906C13.5977 2.47031 13.75 2.72344 13.75 3V9C13.75 9.27656 13.5977 9.52969 13.3539 9.66094C13.1102 9.79219 12.8148 9.77812 12.5828 9.62344L10.3328 8.12344L10 7.90078V7.5V4.5V4.09922L10.3328 3.87656L12.5828 2.37656C12.8125 2.22422 13.1078 2.20781 13.3539 2.33906Z"
                                      fill="#64748B"
                                    />
                                  </svg>
                                  <span className="">Video Guide</span>
                                </Button>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="checkbox"
                                    id="is_freelancers_completed"
                                    name="is_freelancers_completed"
                                    onChange={onCompleteChange}
                                    checked={completedState["is_freelancers_completed"]}
                                  />
                                  <label htmlFor="completed-2" className="text-[10px] text-[#A09EA6] font-normal leading-none cursor-pointer">
                                    Added
                                  </label>
                                </div>
                              </div>
                              <button
                                onClick={() => handleAddClick(canViewFreelancer, `${getOriginUrl()}/my-freelancer-index?reactframe=true`)}
                                className="bg-[#71AEA3] border border-[#4B9B8B] rounded-[8px]  py-1.5  2xl:py-1.5  px-5   text-[#FEFEFE] text-sm flex items-center w-fit font-normal cursor-pointer"
                              >
                                Add{" "}
                              </button>
                            </div>
                          </div>
                          <div className="p-3 2xl:py-4 2xl:px-5 border border-solid border-[#DEE4E7] rounded-xl bg-[#FEFEFE] h-full transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_12px_30px_rgba(250,139,100,0.35)] hover:border-[#FA8B64]">
                            <div className="flex items-center gap-3">
                              <div className="size-8 bg-[#9333EA]/20 rounded-full p-1.5">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-full block">
                                  <path
                                    d="M6.18106 1.29297C6.60264 1.29241 7.0133 1.427 7.35277 1.67697V13.6553C6.93058 14.0216 6.39024 14.2229 5.83132 14.2223C5.34243 14.2221 4.86597 14.0682 4.46937 13.7823C4.07277 13.4965 3.77611 13.0931 3.62138 12.6294L3.50017 12.2644C2.95583 12.1993 2.44789 11.9574 2.05428 11.5758C1.66066 11.1942 1.40311 10.694 1.32113 10.152C1.23916 9.60993 1.33728 9.05595 1.60046 8.57504C1.86364 8.09412 2.27733 7.71283 2.77807 7.48966C2.51449 7.26252 2.30304 6.98116 2.15817 6.6648C2.0133 6.34845 1.93841 6.00455 1.93863 5.65661C1.93876 5.04155 2.17266 4.44954 2.59296 4.00049C3.01326 3.55144 3.58852 3.27894 4.20223 3.23818C4.21113 2.71924 4.42352 2.22456 4.79366 1.86071C5.16379 1.49687 5.66204 1.29298 6.18106 1.29297ZM9.33257 1.29297C9.85159 1.29298 10.3498 1.49687 10.72 1.86071C11.0901 2.22456 11.3025 2.71924 11.3114 3.23818C11.9251 3.27894 12.5004 3.55144 12.9207 4.00049C13.341 4.44954 13.5749 5.04155 13.575 5.65661C13.5752 6.0045 13.5003 6.34833 13.3554 6.66463C13.2105 6.98092 12.9991 7.26223 12.7356 7.48934C13.2362 7.7126 13.6498 8.09394 13.9129 8.57486C14.1761 9.05578 14.2742 9.60973 14.1922 10.1518C14.1102 10.6938 13.8527 11.194 13.4592 11.5756C13.0656 11.9572 12.5578 12.1992 12.0135 12.2644L11.8922 12.6297C11.7375 13.0934 11.4408 13.4967 11.0442 13.7825C10.6476 14.0683 10.1712 14.2221 9.68231 14.2223C9.10049 14.2223 8.5691 14.008 8.16085 13.6553V1.67697C8.50033 1.427 8.91099 1.29241 9.33257 1.29297Z"
                                    fill="#9333EA"
                                  />
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-[#4A4C5E] font-bold text-sm">Add Your Al Workforce</h4>
                                <p className="text-[11px] text-[#BCB8C5] font-normal">AI teammates that work 24/7</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant={"ghost"}
                                  className={
                                    "cursor-pointer mt-1 p-0 flex items-center gap-2 text-[#64748B] bg-[#F1F5F9] hover:bg-[#E2E8F0] h-6 rounded-md text-xs font-normal"
                                  }
                                  type="button"
                                  onClick={() => handleVideoClick("ai_workforce")}
                                >
                                  <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                      d="M0.25 3C0.25 2.17266 0.922656 1.5 1.75 1.5H7.75C8.57734 1.5 9.25 2.17266 9.25 3V9C9.25 9.82734 8.57734 10.5 7.75 10.5H1.75C0.922656 10.5 0.25 9.82734 0.25 9V3ZM13.3539 2.33906C13.5977 2.47031 13.75 2.72344 13.75 3V9C13.75 9.27656 13.5977 9.52969 13.3539 9.66094C13.1102 9.79219 12.8148 9.77812 12.5828 9.62344L10.3328 8.12344L10 7.90078V7.5V4.5V4.09922L10.3328 3.87656L12.5828 2.37656C12.8125 2.22422 13.1078 2.20781 13.3539 2.33906Z"
                                      fill="#64748B"
                                    />
                                  </svg>
                                  <span className="">Video Guide</span>
                                </Button>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="checkbox"
                                    id="is_ai_employee_completed"
                                    name="is_ai_employee_completed"
                                    onChange={onCompleteChange}
                                    checked={completedState["is_ai_employee_completed"]}
                                  />
                                  <label htmlFor="completed-5" className="text-[10px] text-[#A09EA6] font-normal leading-none cursor-pointer">
                                    Added
                                  </label>
                                </div>
                              </div>
                              <button
                                onClick={() => handleAddClick(isAIWorkForceAllow, `${getOriginUrl()}/workforce?reactframe=true`)}
                                className="bg-[#71AEA3] border border-[#4B9B8B] rounded-[8px]  py-1.5  2xl:py-1.5  px-5   text-[#FEFEFE] text-sm flex items-center w-fit font-normal cursor-pointer"
                              >
                                Add{" "}
                              </button>
                            </div>
                          </div>
                      </div>
                    <div className="max-w-[1400px] w-full mx-auto text-[#1BA0A5] font-normal italic text-sm ml-auto">Recommended - Needed to run and assign work</div>
                      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-y-3 gap-4 max-w-[1400px] w-full mx-auto">
                        <div className="col-span-full flex flex-col">
                          <h3 className="text-[#FA8B64] font-semibold text-lg col-span-full">Your Business Blueprint (Optional)</h3>
                          <span className="text-sm col-span-full font-medium">
                            Adding your Business Blueprint unlocks personalised AI workflow suggestions in Stage 2.
                          </span>
                        </div>
                          <div className="p-3 2xl:py-4 2xl:px-5 border border-solid border-[#DEE4E7] rounded-xl bg-[#FEFEFE] h-full transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_12px_30px_rgba(250,139,100,0.35)] hover:border-[#FA8B64]">
                            <div className="flex items-center gap-3">
                              <div className="size-8 shrink-0 bg-[#49B8BF]/20 rounded-full p-1">
                                <svg width="11" height="21" viewBox="0 0 11 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-full block">
                                  <path
                                    d="M2.3002 4.09961C1.4177 4.09961 0.700195 4.81711 0.700195 5.69961V15.2996C0.700195 16.1821 1.4177 16.8996 2.3002 16.8996H8.70019C9.5827 16.8996 10.3002 16.1821 10.3002 15.2996V8.09961H7.10019C6.65769 8.09961 6.30019 7.74211 6.30019 7.29961V4.09961H2.3002ZM7.10019 4.09961V7.29961H10.3002L7.10019 4.09961ZM3.5002 10.4996H7.5002C7.72019 10.4996 7.9002 10.6796 7.9002 10.8996C7.9002 11.1196 7.72019 11.2996 7.5002 11.2996H3.5002C3.2802 11.2996 3.1002 11.1196 3.1002 10.8996C3.1002 10.6796 3.2802 10.4996 3.5002 10.4996ZM3.5002 12.0996H7.5002C7.72019 12.0996 7.9002 12.2796 7.9002 12.4996C7.9002 12.7196 7.72019 12.8996 7.5002 12.8996H3.5002C3.2802 12.8996 3.1002 12.7196 3.1002 12.4996C3.1002 12.2796 3.2802 12.0996 3.5002 12.0996ZM3.5002 13.6996H7.5002C7.72019 13.6996 7.9002 13.8796 7.9002 14.0996C7.9002 14.3196 7.72019 14.4996 7.5002 14.4996H3.5002C3.2802 14.4996 3.1002 14.3196 3.1002 14.0996C3.1002 13.8796 3.2802 13.6996 3.5002 13.6996Z"
                                    fill="#16A34A"
                                  />
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-[#4A4C5E] font-bold text-sm">Add Your Business Plan</h4>
                                <p className="text-[11px] text-[#BCB8C5] font-normal">Quickly create your business plan with AI</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  id="is_business_plan_completed"
                                  name="is_business_plan_completed"
                                  onChange={onCompleteChange}
                                  checked={completedState["is_business_plan_completed"]}
                                />
                                <label htmlFor="completed-3" className="text-[10px] text-[#A09EA6] font-normal leading-none cursor-pointer">
                                  Added
                                </label>
                              </div>
                              <button
                                onClick={() =>
                                  handleAddClick(
                                    isViewBusinessPlan,
                                    isUserAllow(user, "create-business-plan")
                                      ? `${getOriginUrl()}/chatlayer/business-plan?reactframe=true`
                                      : `${getOriginUrl()}/company-detail/create?reactframe=true`,
                                  )
                                }
                                className="bg-[#71AEA3] border border-[#4B9B8B] rounded-[8px]  py-1.5  2xl:py-1.5  px-5   text-[#FEFEFE] text-sm flex items-center w-fit font-normal cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          <div className="p-3 2xl:py-4 2xl:px-5 border border-solid border-[#DEE4E7] rounded-xl bg-[#FEFEFE] h-full transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_12px_30px_rgba(250,139,100,0.35)] hover:border-[#FA8B64]">
                            <div className="flex items-center gap-3">
                              <div className="size-8 shrink-0 bg-[#FA8B64]/20 rounded-full p-1">
                                <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-full block">
                                  <path
                                    d="M4.375 4.1875C4.375 3.66621 4.79671 3.2445 5.318 3.2445H15.682C16.2033 3.2445 16.625 3.66621 16.625 4.1875V17.7555C16.625 18.2768 16.2033 18.6985 15.682 18.6985H5.318C4.79671 18.6985 4.375 18.2768 4.375 17.7555V4.1875Z"
                                    fill="#FA8B64"
                                  />
                                  <path d="M7.875 9.625H13.125" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                                  <path d="M7.875 12.125H13.125" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                                  <path d="M11.375 6.125H13.125" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-[#4A4C5E] font-bold text-sm">Add Your Marketing Plan</h4>
                                <p className="text-[11px] text-[#BCB8C5] font-normal">Quickly create your marketing plan with AI</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  id="is_marketing_plan_completed"
                                  name="is_marketing_plan_completed"
                                  onChange={onCompleteChange}
                                  checked={completedState["is_marketing_plan_completed"]}
                                />
                                <label htmlFor="is_marketing_plan_completed" className="text-[10px] text-[#A09EA6] font-normal leading-none cursor-pointer">
                                  Added
                                </label>
                              </div>
                              <button
                                onClick={() =>
                                  handleAddClick(
                                    isViewMarketingPlan,
                                    user?.company_hash && isUserAllow(user, "manage-marketing-plan")
                                      ? `${getOriginUrl()}/chatlayer/marketing-plan/${user?.company_hash}?reactframe=true`
                                      : `${getOriginUrl()}/marketing/my-marketing-plan?reactframe=true`,
                                  )
                                }
                                className="bg-[#71AEA3] border border-[#4B9B8B] rounded-[8px]  py-1.5  2xl:py-1.5  px-5   text-[#FEFEFE] text-sm flex items-center w-fit font-normal cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          <div className="p-3 2xl:py-4 2xl:px-5 border border-solid border-[#DEE4E7] rounded-xl bg-[#FEFEFE] h-full transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_12px_30px_rgba(250,139,100,0.35)] hover:border-[#FA8B64]">
                            <div className="flex items-center gap-3">
                              <div className="size-8 shrink-0 bg-[#FA8B64]/20 rounded-full p-1">
                                <svg width="11" height="21" viewBox="0 0 11 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-full block">
                                  <path
                                    d="M1.9002 4.09961C1.2377 4.09961 0.700195 4.63711 0.700195 5.29961V15.6996C0.700195 16.3621 1.2377 16.8996 1.9002 16.8996H4.3002V14.8996C4.3002 14.2371 4.8377 13.6996 5.5002 13.6996C6.16269 13.6996 6.70019 14.2371 6.70019 14.8996V16.8996H9.10019C9.76269 16.8996 10.3002 16.3621 10.3002 15.6996V5.29961C10.3002 4.63711 9.76269 4.09961 9.10019 4.09961H1.9002ZM2.3002 10.0996C2.3002 9.87961 2.4802 9.69961 2.7002 9.69961H3.5002C3.7202 9.69961 3.9002 9.87961 3.9002 10.0996V10.8996C3.9002 11.1196 3.7202 11.2996 3.5002 11.2996H2.7002C2.4802 11.2996 2.3002 11.1196 2.3002 10.8996V10.0996ZM5.10019 9.69961H5.9002C6.12019 9.69961 6.30019 9.87961 6.30019 10.0996V10.8996C6.30019 11.1196 6.12019 11.2996 5.9002 11.2996H5.10019C4.8802 11.2996 4.7002 11.1196 4.7002 10.8996V10.0996C4.7002 9.87961 4.8802 9.69961 5.10019 9.69961ZM7.10019 10.0996C7.10019 9.87961 7.28019 9.69961 7.5002 9.69961H8.30019C8.5202 9.69961 8.70019 9.87961 8.70019 10.0996V10.8996C8.70019 11.1196 8.5202 11.2996 8.30019 11.2996H7.5002C7.28019 11.2996 7.10019 11.1196 7.10019 10.8996V10.0996ZM2.7002 6.49961H3.5002C3.7202 6.49961 3.9002 6.67961 3.9002 6.89961V7.69961C3.9002 7.91961 3.7202 8.09961 3.5002 8.09961H2.7002C2.4802 8.09961 2.3002 7.91961 2.3002 7.69961V6.89961C2.3002 6.67961 2.4802 6.49961 2.7002 6.49961ZM4.7002 6.89961C4.7002 6.67961 4.8802 6.49961 5.10019 6.49961H5.9002C6.12019 6.49961 6.30019 6.67961 6.30019 6.89961V7.69961C6.30019 7.91961 6.12019 8.09961 5.9002 8.09961H5.10019C4.8802 8.09961 4.7002 7.91961 4.7002 7.69961V6.89961ZM7.5002 6.49961H8.30019C8.5202 6.49961 8.70019 6.67961 8.70019 6.89961V7.69961C8.70019 7.91961 8.5202 8.09961 8.30019 8.09961H7.5002C7.28019 8.09961 7.10019 7.91961 7.10019 7.69961V6.89961C7.10019 6.67961 7.28019 6.49961 7.5002 6.49961Z"
                                    fill="#FA8B64"
                                  />
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-[#4A4C5E] font-bold text-sm">Build Job Descriptions</h4>
                                <p className="text-[11px] text-[#BCB8C5] font-normal">Use AI to generate roles for your team</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  id="is_job_descriptions_completed"
                                  name="is_job_descriptions_completed"
                                  onChange={onCompleteChange}
                                  checked={completedState["is_job_descriptions_completed"]}
                                />
                                <label htmlFor="completed-4" className="text-[10px] text-[#A09EA6] font-normal leading-none cursor-pointer">
                                  Added
                                </label>
                              </div>
                              <a
                                onClick={() => handleAddClick(isViewJobDescriptions, `${getOriginUrl()}/job-description/index?reactframe=true`)}
                                className="bg-[#71AEA3] border border-[#4B9B8B] rounded-[8px]  py-1.5  2xl:py-1.5  px-5   text-[#FEFEFE] text-sm flex items-center w-fit font-normal cursor-pointer"
                              >
                                Add
                              </a>
                            </div>
                          </div>
                          <div className="p-3 2xl:py-4 2xl:px-5 border border-solid border-[#DEE4E7] rounded-xl bg-[#FEFEFE] h-full transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_12px_30px_rgba(250,139,100,0.35)] hover:border-[#FA8B64]">
                            <div className="flex items-center gap-3">
                              <div className="size-8 shrink-0 bg-[#D7F1EA] rounded-full p-1.5">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-full block">
                                  <path
                                    d="M5 2.5C4.17157 2.5 3.5 3.17157 3.5 4V12C3.5 12.8284 4.17157 13.5 5 13.5H11C11.8284 13.5 12.5 12.8284 12.5 12V5.91421C12.5 5.648 12.3946 5.39286 12.2071 5.20711L9.79289 2.79289C9.60714 2.60536 9.352 2.5 9.08579 2.5H5Z"
                                    fill="#5CA28E"
                                  />
                                  <path
                                    d="M9 2.5V4.75C9 5.16421 9.33579 5.5 9.75 5.5H12.5"
                                    stroke="white"
                                    strokeWidth="0.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path d="M5.75 8.25H10.25" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
                                  <path d="M5.75 10.25H7.75" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
                                  <path d="M9.5 9V11" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
                                  <path d="M8.5 10H10.5" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-[#4A4C5E] font-bold text-sm">Add Your Current Processes</h4>
                                <p className="text-[11px] text-[#BCB8C5] font-normal">Use AI to capture how your business runs</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  id="add_your_current_processes"
                                  name="add_your_current_processes"
                                  onChange={onCompleteChange}
                                  checked={completedState["add_your_current_processes"]}
                                />
                                <label htmlFor="add_your_current_processes" className="text-[10px] text-[#A09EA6] font-normal leading-none cursor-pointer">
                                  Added
                                </label>
                              </div>
                              <button
                                onClick={() => handleAddClick(canCaptureProcesses, `${getOriginUrl()}/process?reactframe=true`)}
                                className="bg-[#71AEA3] border border-[#4B9B8B] rounded-[8px]  py-1.5  2xl:py-1.5  px-5   text-[#FEFEFE] text-sm flex items-center w-fit font-normal cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                      </div>
                  </div>
                </div>
              </div>

            <div className="grid xl:grid-cols-2 gap-y-4 gap-x-6 2xl:gap-x-8 mt-5">
              <div className="flex flex-col">
                <div className="flex items-center gap-5">
                  <div className="text-sm lg:text-base text-white p-5 py-2 ml-4 font-normal w-fit shrink-0 rounded-t-sm bg-[#FA8B64]">&gt; Step 2</div>
                  <h4 className="text-[#817F88] font-bold text-xs md:text-sm 2xl:text-lg">Business Overview – See Your Business in One View</h4>
                </div>
                <div className="grow bg-white shadow-[0px_1px_3px_0px_#0000001A,_0px_1px_2px_0px_#0000001A] p-3 2xl:p-5 rounded-xl flex flex-col">
                  <p className="text-sm text-[#B4B2BA] font-medium col-span-full mb-1 2xl:mb-5">
                    Build & view your business areas and workflows on a single visual canvas.
                  </p>
                  <div className="mt-auto border-[#72AEA2]/90 border border-solid rounded p-3 2xl:p-5 flex gap-4 2xl:gap-6 items-center">
                    <div className="size-10 2xl:size-12 bg-[#f6f9fb] flex items-center justify-center rounded-2xl">
                      <svg
                        width="16"
                        height="14"
                        viewBox="0 0 16 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={cn("size-5 text-[#8B8F9C] group-hover:text-white transition-all duration-200 ease-linear")}
                      >
                        <path
                          d="M2.42539 6.11953L0 10.2758V2.625C0 1.65977 0.784766 0.875 1.75 0.875H4.96289C5.42773 0.875 5.87344 1.0582 6.20156 1.38633L6.92617 2.11094C7.2543 2.43906 7.7 2.62227 8.16484 2.62227H11.375C12.3402 2.62227 13.125 3.40703 13.125 4.37227V5.24727H3.9375C3.31406 5.24727 2.73984 5.57812 2.42539 6.1168V6.11953ZM3.18008 6.55977C3.33867 6.28906 3.62578 6.125 3.9375 6.125H14.875C15.1895 6.125 15.4766 6.2918 15.6324 6.56523C15.7883 6.83867 15.7883 7.17227 15.6297 7.44297L12.5672 12.693C12.4113 12.9609 12.1242 13.125 11.8125 13.125H0.875C0.560547 13.125 0.273438 12.9582 0.117578 12.6848C-0.0382812 12.4113 -0.0382813 12.0777 0.120313 11.807L3.18281 6.55703L3.18008 6.55977Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <div onClick={handleBusinessOverview} className="w-[calc(100%_-_70px)] cursor-pointer">
                      <h4 className="text-[#4A4C5E] leading-4 font-bold text-[14.5px] mb-0 2xl:mb-2">Map Your Business in One View.</h4>
                      <p className="text-xs leading-4 font-light text-[#9798A1]">See your business mapped in one visual workspace</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-5">
                  <div className="text-sm lg:text-base text-white p-5 py-2 ml-4 font-normal w-fit shrink-0 rounded-t-sm bg-[#FA8B64]">&gt; Step 3</div>
                  <h4 className="text-[#817F88] font-bold text-xs md:text-sm 2xl:text-lg">Dashboard – Run & Manage Your Business</h4>
                </div>
                <div className="grow bg-white shadow-[0px_1px_3px_0px_#0000001A,_0px_1px_2px_0px_#0000001A] p-3 2xl:p-5 rounded-xl flex flex-col">
                  <p className="text-sm text-[#B4B2BA] font-medium col-span-full mb-1 2xl:mb-5">
                    Run workflows, track tasks, and collaborate with your team in real time
                  </p>
                  <div className="mt-auto border-[#72AEA2]/90 border border-solid rounded p-3 2xl:p-5 flex gap-4 2xl:gap-6 items-center">
                    <div className="size-10 2xl:size-12 bg-[#f6f9fb] flex items-center justify-center rounded-2xl">
                      <svg
                        width="14"
                        height="20"
                        viewBox="0 0 14 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-5 text-[#91959E] group-hover:text-white transition-all duration-200 ease-linear"
                      >
                        <path
                          d="M1.75 4.75C1.75 4.26602 1.35898 3.875 0.875 3.875C0.391016 3.875 0 4.26602 0 4.75V13.9375C0 15.1461 0.978906 16.125 2.1875 16.125H13.125C13.609 16.125 14 15.734 14 15.25C14 14.766 13.609 14.375 13.125 14.375H2.1875C1.94687 14.375 1.75 14.1781 1.75 13.9375V4.75ZM12.868 7.11797C13.2098 6.77617 13.2098 6.22109 12.868 5.8793C12.5262 5.5375 11.9711 5.5375 11.6293 5.8793L8.75 8.76133L7.18047 7.1918C6.83867 6.85 6.28359 6.85 5.9418 7.1918L2.8793 10.2543C2.5375 10.5961 2.5375 11.1512 2.8793 11.493C3.22109 11.8348 3.77617 11.8348 4.11797 11.493L6.5625 9.05117L8.13203 10.6207C8.47383 10.9625 9.02891 10.9625 9.3707 10.6207L12.8707 7.1207L12.868 7.11797Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <div onClick={handleBusinessOverview} className="w-[calc(100%_-_70px)] cursor-pointer">
                      <a className="text-[#4A4C5E] leading-4 font-bold text-[14.5px] mb-0 2xl:mb-2 block" href="/ai-dashboard">
                        Manage Your Business in Real Time
                      </a>
                      <p className="text-xs leading-4 font-light text-[#9798A1]">
                        Manage your business and keep everything running smoothly from one central hub
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {permissionPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[400px] max-w-[90vw] text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="size-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#4A4C5E] mb-2">Permission Denied</h3>
            <p className="text-sm text-[#85838B] mb-6">You don't have permission to access this feature. Please contact your administrator to request access.</p>
            <button
              onClick={() => setPermissionPopup(false)}
              className="bg-[#71AEA3] border border-[#4B9B8B] rounded-[8px] py-2 px-8 text-[#FEFEFE] text-sm font-medium cursor-pointer hover:bg-[#5f9e93] transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {videoGuide.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="relative w-[600px] h-[600px] lg:w-[768px] lg:h-[768px] flex flex-col">
            <button
              type="button"
              className={
                "cursor-pointer gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 outline-none absolute z-10 left-auto flex items-center justify-center text-center rounded-full p-1 size-7 bg-primary text-primary-foreground shadow-sm top-28 lg:top-36 -right-5"
              }
              onClick={handleCloseVideo}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              src={videoGuide.link}
              frameBorder="0"
              width={"100%"}
              className="size-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
}

export default Roadmap;
