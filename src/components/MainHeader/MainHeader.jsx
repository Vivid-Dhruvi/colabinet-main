import React, { useContext, useEffect, useRef, useState } from "react";
import { getOriginUrl } from "@/lib/config";
import { cn, isUserAllow, isUserAllowAny, notallowUserToAccess } from "@/lib/utils";
import TimeCounter from "./TimeCounter";
import { LogoutDialog } from "./Logout";
import { RateChangePopup } from "./RateChangePopup";
import { addHourlyRate } from "@/service/general.service";
import { MainContext } from "@/App";
import { NotificationPopup } from "./Notification";
import { BusinessContext } from "@/Pages/layouts/BusinessLayout";
import { Button } from "../ui/button";
import { ChevronDown, X } from "lucide-react";

export const MainHeader = ({ isBusinessOverview }) => {
  const { handleProfile, handlePermission, handleBusinessOverview, handlePath, handleShowVideo } = useContext(BusinessContext);
  const { user, token } = useContext(MainContext);
  const [openProfile, setOpenProfile] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [open, setOpen] = useState(false);
  const headDropRef = useRef(null);
  const [path, setPath] = useState("");

  const { days_left = 0, percent = 0, label = "", button_text = "", is_trial = false } = user?.active_plan_status || {};

  const [showRatePopup, setShowRatePopup] = useState(false);
  const canAccessBusinessSetup = user?.role_id != 7 || !isUserAllow(user, "hide-business-setup");
  const canAccessBusinessOverview =
    user?.role_id != 7 ||
    (!isUserAllow(user, "hide-business-overview") &&
      isUserAllowAny(user, ["create-business-area", "edit-business-area", "delete-business-area", "create-workflow", "edit-workflow", "delete-workflow"]));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headDropRef.current && !headDropRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChnage = (e) => {
    const { checked, value } = e.target;
    if (!checked) return;
    if (value === "5") {
      if (user?.admin_respondent === 0) {
        setShowRatePopup(true);
      } else {
        submitDetails({
          role_id: 5,
        });
      }
    } else if (value === "2") {
      submitDetails({
        role_id: 2,
      });
    }
  };

  const submitDetails = (details) => {
    addHourlyRate(token, details).then((res) => {
      if (res.url) {
        window.location.href = res.url;
      }
    });
  };

  return (
    <header className={cn("fixed top-0 left-0 z-999999 w-full bg-white shadow-[0_4px_6px_0_rgba(0,0,0,0.1)] py-1.5 xl:py-2 h-12 md:h-16 content-center")}>
      <div className="max-w-[1730px] m-auto px-5 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <button
            className="block xl:hidden z-10 cursor-pointer outline-none rounded-lg p-1 bg-white border border-solid border-gray-200"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 sm:size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
          </button>
          <div className="block relative z-10 w-fit cursor-pointer">
            <img src="/images/app-dark-logo.png" className="max-w-24 md:max-w-24 lg:max-w-[140px] w-full mx-auto h-auto block" alt="logo" />
          </div>

          <div className="ml-6 xl:block hidden w-1/3 grow">
            <ul className="sm:flex items-center gap-2">
              {canAccessBusinessSetup && (
                <li className="leading-none">
                  <span
                    onClick={() => {
                      sessionStorage.removeItem("business-iframe-url");
                      handlePath("");
                    }}
                    className={cn(
                      "group cursor-pointer px-5 py-2 rounded-full hover:bg-[linear-gradient(59.62deg,_#62AAB4_46.18%,_#F08965_94.07%)] hover:text-white text-[#374151] shadow-none hover:shadow-[0px_0px_20px_0px_rgba(240,137,101,0.4)] border border-solid border-[#E5E7EB] flex items-center gap-2.5 text-xs xl:text-[15px] leading-normal tracking-tight font-normal transition-all duration-200 ease-in",
                      !isBusinessOverview
                        ? "shadow-[0px_0px_20px_0px_rgba(240,137,101,0.4)] bg-[linear-gradient(59.62deg,_#62AAB4_46.18%,_#F08965_94.07%)] text-white"
                        : "bg-[#F3F4F6]",
                    )}
                  >
                    <svg
                      width="14"
                      height="20"
                      viewBox="0 0 14 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={cn(
                        "size-5 text-[#8B8F9C] group-hover:text-white transition-all duration-200 ease-linear",
                        !isBusinessOverview && "text-white",
                      )}
                    >
                      <path
                        d="M4.28181 13.2746L3.43689 12.4296C3.20447 12.1972 3.12244 11.8609 3.22634 11.5492C3.30838 11.3058 3.41775 10.9886 3.549 10.6249H0.656032C0.420876 10.6249 0.202126 10.4992 0.084548 10.2941C-0.0330301 10.089 -0.0302957 9.83744 0.0900168 9.6351L1.52556 7.21518C1.88103 6.61635 2.52361 6.24994 3.21814 6.24994H5.46853C5.53416 6.14057 5.59978 6.0394 5.66541 5.94096C7.90486 2.63783 11.2408 2.52846 13.2314 2.89486C13.5486 2.95229 13.7947 3.20111 13.8549 3.5183C14.2213 5.51166 14.1092 8.84486 10.8088 11.0843C10.7131 11.1499 10.6092 11.2156 10.4998 11.2812V13.5316C10.4998 14.2261 10.1334 14.8714 9.53455 15.2242L7.11463 16.6597C6.91228 16.78 6.66072 16.7828 6.45564 16.6652C6.25056 16.5476 6.12478 16.3316 6.12478 16.0937V13.1624C5.73924 13.2964 5.40291 13.4058 5.14861 13.4878C4.84236 13.5863 4.50877 13.5015 4.27908 13.2746H4.28181ZM10.4998 7.34369C10.7899 7.34369 11.0681 7.22846 11.2732 7.02334C11.4783 6.81822 11.5935 6.54002 11.5935 6.24994C11.5935 5.95986 11.4783 5.68166 11.2732 5.47654C11.0681 5.27143 10.7899 5.15619 10.4998 5.15619C10.2097 5.15619 9.9315 5.27143 9.72638 5.47654C9.52127 5.68166 9.40603 5.95986 9.40603 6.24994C9.40603 6.54002 9.52127 6.81822 9.72638 7.02334C9.9315 7.22846 10.2097 7.34369 10.4998 7.34369Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span>Business Setup</span>
                  </span>
                </li>
              )}
              {canAccessBusinessOverview && (
                <li className="leading-none">
                  {" "}
                  <span
                    className={cn(
                      "group cursor-pointer px-5 py-2 rounded-full hover:bg-[linear-gradient(59.62deg,_#62AAB4_46.18%,_#F08965_94.07%)] hover:text-white text-[#374151] shadow-none hover:shadow-[0px_0px_20px_0px_rgba(240,137,101,0.4)] border border-solid border-[#E5E7EB] flex items-center gap-2.5 text-xs xl:text-[15px] leading-normal tracking-tight font-normal transition-all duration-200 ease-in",
                      isBusinessOverview
                        ? "shadow-[0px_0px_20px_0px_rgba(240,137,101,0.4)] bg-[linear-gradient(59.62deg,_#62AAB4_46.18%,_#F08965_94.07%)] text-white"
                        : "bg-[#F3F4F6]",
                    )}
                    onClick={() => {
                      sessionStorage.removeItem("business-iframe-url");
                      handleBusinessOverview();
                    }}
                  >
                    <svg
                      width="16"
                      height="14"
                      viewBox="0 0 16 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={cn("size-5 text-[#8B8F9C] group-hover:text-white transition-all duration-200 ease-linear", isBusinessOverview && "text-white")}
                    >
                      <path
                        d="M2.42539 6.11953L0 10.2758V2.625C0 1.65977 0.784766 0.875 1.75 0.875H4.96289C5.42773 0.875 5.87344 1.0582 6.20156 1.38633L6.92617 2.11094C7.2543 2.43906 7.7 2.62227 8.16484 2.62227H11.375C12.3402 2.62227 13.125 3.40703 13.125 4.37227V5.24727H3.9375C3.31406 5.24727 2.73984 5.57812 2.42539 6.1168V6.11953ZM3.18008 6.55977C3.33867 6.28906 3.62578 6.125 3.9375 6.125H14.875C15.1895 6.125 15.4766 6.2918 15.6324 6.56523C15.7883 6.83867 15.7883 7.17227 15.6297 7.44297L12.5672 12.693C12.4113 12.9609 12.1242 13.125 11.8125 13.125H0.875C0.560547 13.125 0.273438 12.9582 0.117578 12.6848C-0.0382812 12.4113 -0.0382813 12.0777 0.120313 11.807L3.18281 6.55703L3.18008 6.55977Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span>Business Overview</span>
                  </span>
                </li>
              )}

              <li className="leading-none">
                <button
                  onClick={() => {
                    sessionStorage.removeItem("business-iframe-url");
                    window.location.href = "/ai-dashboard";
                  }}
                  className="group cursor-pointer px-5 py-2 rounded-full bg-[#F3F4F6] hover:bg-[linear-gradient(59.62deg,_#62AAB4_46.18%,_#F08965_94.07%)] hover:text-white text-[#374151] shadow-none hover:shadow-[0px_0px_20px_0px_rgba(240,137,101,0.4)] border border-solid border-[#E5E7EB] flex items-center gap-2.5 text-xs xl:text-[15px] leading-normal tracking-tight font-normal transition-all duration-200 ease-in"
                >
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
                  <span>Dashboard</span>
                </button>
              </li>

              <div className="cursor-pointer flex flex-row gap-3 text-[#1BA0A5] text-sm ml-auto" onClick={() => handleShowVideo(true)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M10 20C12.6522 20 15.1957 18.9464 17.0711 17.0711C18.9464 15.1957 20 12.6522 20 10C20 7.34784 18.9464 4.8043 17.0711 2.92893C15.1957 1.05357 12.6522 0 10 0C7.34784 0 4.8043 1.05357 2.92893 2.92893C1.05357 4.8043 0 7.34784 0 10C0 12.6522 1.05357 15.1957 2.92893 17.0711C4.8043 18.9464 7.34784 20 10 20ZM8.4375 13.125H9.375V10.625H8.4375C7.91797 10.625 7.5 10.207 7.5 9.6875C7.5 9.16797 7.91797 8.75 8.4375 8.75H10.3125C10.832 8.75 11.25 9.16797 11.25 9.6875V13.125H11.5625C12.082 13.125 12.5 13.543 12.5 14.0625C12.5 14.582 12.082 15 11.5625 15H8.4375C7.91797 15 7.5 14.582 7.5 14.0625C7.5 13.543 7.91797 13.125 8.4375 13.125ZM10 5C10.3315 5 10.6495 5.1317 10.8839 5.36612C11.1183 5.60054 11.25 5.91848 11.25 6.25C11.25 6.58152 11.1183 6.89946 10.8839 7.13388C10.6495 7.3683 10.3315 7.5 10 7.5C9.66848 7.5 9.35054 7.3683 9.11612 7.13388C8.8817 6.89946 8.75 6.58152 8.75 6.25C8.75 5.91848 8.8817 5.60054 9.11612 5.36612C9.35054 5.1317 9.66848 5 10 5Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="underline">Learn More about this section</span>
              </div>

              {user && !notallowUserToAccess(user, [7]) && (
                <>
                  {days_left > 0 && is_trial && (
                    <li className="flex items-center gap-3 bg-[#ebf9fa] rounded-md px-3 py-1.5 shrink-0 w-fit">
                      <div className="sr_epispde_pernumber" style={{ "--percent": percent }}></div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700 font-medium">{label} Plan</span>
                        <span className="text-gray-500 text-xs font-normal">
                          {days_left} day{days_left > 1 ? "s" : ""} left
                        </span>
                      </div>
                      <a
                        href="/private-profile?tab=subscripation_tab"
                        className="cursor-pointer ml-auto bg-[#66aab2] text-white px-3 py-1 font-medium rounded-md text-sm hover:bg-[#45444a] transition"
                      >
                        {button_text}
                      </a>
                    </li>
                  )}

                  {is_trial && days_left <= 0 && (
                    <li className="flex items-center gap-3 rounded-md px-3 py-2 bg-[#ebf9fa] w-fit shrink-0 ml-10">
                      <span className="text-xs xl:text-sm text-red-600 font-normal">Trial has expired</span>
                      <a
                        href="/private-profile?tab=subscripation_tab"
                        className="cursor-pointer ml-auto bg-[#66aab2] text-white px-3 py-1 font-medium rounded-md text-sm hover:bg-[#45444a] transition"
                      >
                        Upgrade
                      </a>
                    </li>
                  )}

                  {!is_trial && days_left <= 0 && (
                    <li className="flex items-center gap-3 rounded-md px-3 py-2 bg-[#ebf9fa] w-fit shrink-0 ml-10">
                      <span className="text-xs xl:text-sm text-red-600 font-normal">Your plan has expired</span>
                      <a
                        href="/private-profile?tab=subscripation_tab"
                        className="cursor-pointer ml-auto bg-[#66aab2] text-white px-3 py-1 font-medium rounded-md text-sm hover:bg-[#45444a] transition"
                      >
                        Upgrade
                      </a>
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>
          <a href="/beta-feedback" className="bg-[#66aab2] text-white text-[12px] px-[9px] py-[5px] rounded-[5px] cursor-pointer hidden xl:block">
            Beta Feedback
          </a>

          {menuOpen && (
            <div className="xl:ml-5 mr-0 xl:static fixed top-0 shadow-2xl left-0 p-5 z-50 h-svh bg-white block xl:hidden w-64">
              <div className="flex flex-wrap items-center justify-between pb-4">
                <div className="block relative z-10 w-fit cursor-pointer">
                  <img src="/images/app-dark-logo.png" className="max-w-[90px] w-full mx-auto h-auto block" alt="logo" />
                </div>
                <Button onClick={() => setMenuOpen(!menuOpen)} className={"size-7 p-0 border border-solid border-[#ebe6e7] rounded-[10px] bg-white text-black"}>
                  <X className="size-4 block" />
                </Button>
              </div>
              <ul className="flex flex-col gap-4">
                {canAccessBusinessSetup && (
                  <li>
                    <span
                      onClick={() => {
                        sessionStorage.removeItem("business-iframe-url");
                        handlePath("");
                      }}
                      className={cn(
                        "p-1.5 px-4 rounded-lg text-zinc-50 text-sm tracking-tight font-normal cursor-pointer flex w-full items-center gap-2.5",
                        !isBusinessOverview
                          ? "bg-gradient-to-l from-[#fb8b65] to-[#49b8c1] text-zinc-100"
                          : "bg-[#F3F4F6] border border-solid border-[#E8E9ED] text-zinc-600",
                      )}
                    >
                      <svg fill="currentColor" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="size-5">
                        <path d="M477.64,38.26a4.75,4.75,0,0,0-3.55-3.66c-58.57-14.32-193.9,36.71-267.22,110a317,317,0,0,0-35.63,42.1c-22.61-2-45.22-.33-64.49,8.07C52.38,218.7,36.55,281.14,32.14,308a9.64,9.64,0,0,0,10.55,11.2L130,309.57a194.1,194.1,0,0,0,1.19,19.7,19.53,19.53,0,0,0,5.7,12L170.7,375a19.59,19.59,0,0,0,12,5.7,193.53,193.53,0,0,0,19.59,1.19l-9.58,87.2a9.65,9.65,0,0,0,11.2,10.55c26.81-4.3,89.36-20.13,113.15-74.5,8.4-19.27,10.12-41.77,8.18-64.27a317.66,317.66,0,0,0,42.21-35.64C441,232.05,491.74,99.74,477.64,38.26ZM294.07,217.93a48,48,0,1,1,67.86,0A47.95,47.95,0,0,1,294.07,217.93Z"></path>
                        <path d="M168.4,399.43c-5.48,5.49-14.27,7.63-24.85,9.46-23.77,4.05-44.76-16.49-40.49-40.52,1.63-9.11,6.45-21.88,9.45-24.88a4.37,4.37,0,0,0-3.65-7.45,60,60,0,0,0-35.13,17.12C50.22,376.69,48,464,48,464s87.36-2.22,110.87-25.75A59.69,59.69,0,0,0,176,403.09C176.37,398.91,171.28,396.42,168.4,399.43Z"></path>
                      </svg>
                      <span>Business Setup</span>
                    </span>
                  </li>
                )}
                {canAccessBusinessOverview && (
                  <li>
                    <span
                      className={cn(
                        "p-1.5 px-4 rounded-lg text-sm tracking-tight font-normal cursor-pointer flex w-full items-center gap-2.5",
                        isBusinessOverview
                          ? "bg-gradient-to-l from-[#fb8b65] to-[#49b8c1] text-zinc-100"
                          : "bg-[#F3F4F6] border border-solid border-[#E8E9ED] text-zinc-600",
                      )}
                      onClick={() => {
                        sessionStorage.removeItem("business-iframe-url");
                        handleBusinessOverview();
                      }}
                    >
                      <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="size-5">
                        <path d="M19,8H7A3,3,0,0,0,4.26,9.78L2,14.87V5A2,2,0,0,1,4,3H8a2.05,2.05,0,0,1,1.4.56L11.83,6H17A2,2,0,0,1,19,8Zm2.81,2.42A1,1,0,0,0,21,10H7a1,1,0,0,0-.91.59l-4,9A1,1,0,0,0,3,21H18a1,1,0,0,0,.95-.68l3-9A1,1,0,0,0,21.81,10.42Z"></path>
                      </svg>
                      <span>Business Overview</span>
                    </span>
                  </li>
                )}

                <li>
                  <button
                    onClick={() => {
                      sessionStorage.removeItem("business-iframe-url");
                      window.location.href = "/ai-dashboard";
                    }}
                    className={cn(
                      "p-1.5 px-4 rounded-lg text-zinc-50 text-sm tracking-tight font-normal cursor-pointer flex w-full items-center gap-2.5",
                      path === "/ai-dashboard"
                        ? "bg-gradient-to-l from-[#fb8b65] to-[#49b8c1] text-zinc-100"
                        : "bg-[#F3F4F6] border border-solid border-[#E8E9ED] text-zinc-600",
                    )}
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-5">
                      <path
                        d="M21 21H6.2C5.07989 21 4.51984 21 4.09202 20.782C3.71569 20.5903 3.40973 20.2843 3.21799 19.908C3 19.4802 3 18.9201 3 17.8V3M7 15L12 9L16 13L21 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                    <span>Dashboard</span>
                  </button>
                </li>
              </ul>
            </div>
          )}

          <NotificationPopup />
          <div className="w-fit relative" ref={headDropRef}>
            <button className="outline-none block cursor-pointer overflow-hidden rounded-full size-8 md:size-9" onClick={() => setOpenProfile(!openProfile)}>
              {user?.avatar && user?.avatar != 'images/default.png' ? (
                <img
                  src={`${getOriginUrl()}/${user?.avatar}`}
                  className="size-full block"
                  alt="profile image"
                  onError={(e) => {
                    e.target.src = "/images/user.jpg";
                  }}
                />
              ) : (
                <div className="rounded-full size-full flex justify-center items-center bg-[#007D88] text-white">
                  {user?.name[0]}
                  {user?.last_name[0]}
                </div>
              )}
            </button>
            <div className="absolute top-full right-0 pt-1">
              <div className={cn("bg-white rounded-md shadow-[0px_6px_16px_rgba(47,52,58,0.1)] w-76", openProfile ? "block" : "hidden")}>
                <div className="flex items-center gap-3 p-3 2xl:pb-4 border-b border-solid border-gray-200">
                  <div className="size-12 shrink-0 rounded-full overflow-hidden">
                    {user?.avatar && user?.avatar != 'images/default.png' ? (
                      <img
                        src={`${getOriginUrl()}/${user?.avatar}`}
                        className="block w-full h-full"
                        alt="profile-img"
                        onError={(e) => {
                          e.target.src = "/images/user.jpg";
                        }}
                      />
                    ) : (
                      <div className="rounded-full size-full flex justify-center items-center bg-[#007D88] text-white">
                        {user?.name[0]}
                        {user?.last_name[0]}
                      </div>
                    )}
                  </div>
                  <div className="w-2/4 grow flex flex-col gap-1">
                    <button type="button" className="text-sm xl:text-base font-medium text-gray-800 w-full text-left cursor-pointer flex items-center gap-2">
                      <span>
                        {user?.name} {user?.last_name}
                      </span>
                      <ChevronDown className="size-4 shrink-0" />
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 hidden">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    <p className="block break-words break-all font-normal text-sm text-gray-500 leading-none">{user?.email}</p>
                    <TimeCounter />
                  </div>
                </div>
                <ul className="border-b border-solid border-gray-200 py-1 xl:py-2">
                  <li className="px-3 leading-none">
                    <button
                      onClick={() => {
                        handleProfile();
                        setOpenProfile(false);
                      }}
                      className="w-full text-left cursor-pointer block px-1.5 py-1 rounded no-underline xl:text-base font-medium text-black hover:bg-gray-100 transition-all duration-200 ease-in"
                    >
                      Profile
                    </button>
                  </li>
                  {[7].includes(user?.role_id) && (
                    <li className="px-3 leading-none">
                      <button
                        onClick={() => {
                          handlePermission();
                          setOpenProfile(false);
                        }}
                        className="w-full text-left cursor-pointer block px-1.5 py-1 rounded no-underline xl:text-base font-medium text-black hover:bg-gray-100 transition-all duration-200 ease-in"
                      >
                        Permissions
                      </button>
                    </li>
                  )}
                </ul>
                {user?.role_id != 7 && (
                  <ul className="border-b border-solid border-gray-200 py-1 xl:py-2">
                    <li className="px-3 leading-none">
                      <h6 className="mb-1.5 block px-1.5 rounded no-underline font-medium text-xs xl:text-sm text-gray-600 transition-all duration-200 ease-in">
                        Switch Account
                      </h6>
                    </li>
                    <li className="px-3 leading-none">
                      <label className="flex items-center cursor-pointer font-medium py-1.5 px-1.5">
                        <input type="checkbox" value="2" className="sr-only peer" checked={user?.role_id == 2} onChange={handleChnage} />
                        <div className="relative w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#49B8BF] after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-200 after:border after:rounded-full after:size-3 after:transition-all peer-checked:bg-[#49B8BF]"></div>
                        <span className="ms-3 text-sm font-medium text-gray-800">Business</span>
                      </label>
                    </li>
                    <li className="px-3 leading-none">
                      <label className="flex items-center cursor-pointer font-medium py-1.5 px-1.5">
                        <input type="checkbox" value="5" className="sr-only peer" checked={user?.role_id == 5} onChange={handleChnage} />
                        <div className="relative w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#49B8BF] after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-200 after:border after:rounded-full after:size-3 after:transition-all peer-checked:bg-[#49B8BF]"></div>
                        <span className="ms-3 text-sm font-medium text-gray-800">Freelancer</span>
                      </label>
                    </li>
                  </ul>
                )}
                {user?.role_id != 7 && (
                  <ul className="border-b border-solid border-gray-200 py-1 2xl:py-2">
                    <li className="px-3 leading-none">
                      <h6 className="mb-1.5 block px-1.5 rounded no-underline font-medium text-xs xl:text-sm text-gray-600 transition-all duration-200 ease-in">
                        Manage Account
                      </h6>
                    </li>
                    <li className="px-3 leading-none">
                      <a
                        href="/private-profile?tab=billing-payments"
                        className="flex items-center gap-3 px-1.5 py-1 rounded no-underline font-medium text-xs xl:text-base text-gray-800 hover:bg-gray-100 transition-all duration-200 ease-in"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                          />
                        </svg>
                        <span>Payment methods</span>
                      </a>
                    </li>
                    <li className="px-3 leading-none">
                      <a
                        href="/private-profile?tab=subscriptions"
                        className="flex items-center gap-3 px-1.5 py-1 rounded no-underline font-medium text-xs xl:text-base text-gray-800 hover:bg-gray-100 transition-all duration-200 ease-in"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                          />
                        </svg>
                        <span>Subscriptions</span>
                      </a>
                    </li>
                    <li className="px-3 leading-none">
                      <a
                        href="/notifications"
                        className="flex items-center gap-3 px-1.5 py-1 rounded no-underline font-medium text-xs xl:text-base text-gray-800 hover:bg-gray-100 transition-all duration-200 ease-in"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <span>Task Usage</span>
                      </a>
                    </li>
                    <li className="px-3 leading-none">
                      <a
                        href="/private-profile?tab=transactions-invoices"
                        className="flex items-center gap-3 px-1.5 py-1 rounded no-underline font-medium text-xs xl:text-base text-gray-800 hover:bg-gray-100 transition-all duration-200 ease-in"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
                          />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        <span className="font-medium">Transaction & Invoices</span>
                      </a>
                    </li>
                    <li className="px-3 leading-none">
                      <a
                        href="/private-profile?tab=tools-and-integrations"
                        className="flex items-center gap-3 px-1.5 py-1 rounded no-underline font-medium text-xs xl:text-base text-gray-800 hover:bg-gray-100 transition-all duration-200 ease-in"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
                          />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        <span className="font-medium">Tools & Integrations</span>
                      </a>
                    </li>
                  </ul>
                )}

                {isUserAllowAny(user, ["manage-payouts-freelancer", "view-freelancer"]) && (
                  <ul className="border-b border-solid border-gray-200 py-1 2xl:py-2">
                    <li className="px-3 leading-none">
                      <h6 className="mb-1.5 block px-1.5 rounded no-underline font-medium text-xs xl:text-sm text-gray-600 transition-all duration-200 ease-in">
                        Freelancer
                      </h6>
                    </li>
                    {isUserAllow(user, "manage-payouts-freelancer") && (
                      <li className="px-3 leading-none">
                        <a
                          href="/dispute"
                          className="w-full cursor-pointer flex items-center gap-3 px-1.5 py-1 rounded no-underline font-medium text-xs xl:text-base text-gray-800 hover:bg-gray-100 transition-all duration-200 ease-in"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                            />
                          </svg>
                          <span className="font-medium">Freelancer Disputes</span>
                        </a>
                      </li>
                    )}
                    {isUserAllow(user, "view-freelancer") && (
                      <li className="px-3 leading-none">
                        <a
                          href="/my-task"
                          className="w-full cursor-pointer flex items-center gap-3 px-1.5 py-1 rounded no-underline font-medium text-xs xl:text-base text-gray-800 hover:bg-gray-100 transition-all duration-200 ease-in"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 640 512" className="size-5">
                            <path d="M96 128a80 80 0 1 0 0-160 80 80 0 1 0 0 160zM224 256a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm256 0a80 80 0 1 0 0-160 80 80 0 1 0 0 160zM320 512H192c-17.7 0-32-14.3-32-32v-16c0-53 43-96 96-96h32c53 0 96 43 96 96v16c0 17.7-14.3 32-32 32zM576 512H448c-17.7 0-32-14.3-32-32v-16c0-40.2-19.1-75.9-48.6-99.1C398.3 355.6 421.3 352 448 352h32c70.7 0 128 57.3 128 128v16c0 17.7-14.3 32-32 32zM64 512a64 64 0 0 1-64-64v-16c0-70.7 57.3-128 128-128h32c26.7 0 49.7 3.6 64.6 12.9C179.1 388.1 160 423.8 160 464v16c0 17.7-14.3 32-32 32H64z"></path>
                          </svg>
                          <span className="font-medium">Freelancer Engagements</span>
                        </a>
                      </li>
                    )}
                  </ul>
                )}

                <ul className="border-b border-solid border-gray-200 py-1">
                  {user?.role_id != 7 && (
                    <li className="px-3 my-1 py-1 border-b border-solid border-gray-200 leading-none">
                      <a
                        href="/beta-feedback"
                        className="flex items-center gap-3 px-1.5 py-1 rounded no-underline font-medium text-xs xl:text-base text-gray-800 hover:bg-gray-100 transition-all duration-200 ease-in"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-5"
                        >
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                          <line x1="7" y1="7" x2="7.01" y2="7"></line>
                        </svg>
                        <span className="font-medium">Raise a ticket</span>
                      </a>
                    </li>
                  )}
                  <li className="px-3 leading-none">
                    <button
                      onClick={() => setOpen(true)}
                      className="w-full cursor-pointer flex items-center gap-3 px-1.5 py-1 rounded no-underline font-medium text-xs xl:text-base text-gray-800 hover:bg-gray-100 transition-all duration-200 ease-in"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                        />
                      </svg>
                      <span className="font-medium">Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LogoutDialog open={open} setOpen={setOpen} />
      <RateChangePopup open={showRatePopup} setOpen={setShowRatePopup} submitDetails={submitDetails} />
    </header>
  );
};
