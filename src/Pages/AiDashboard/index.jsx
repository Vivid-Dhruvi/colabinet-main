import { MainContext } from "@/App";
import BusinessChat from "@/components/BusinessOverview/BusinessChat";
import { stages, videoLinks } from "@/lib/config";
import { notallowUserToAccess } from "@/lib/utils";
import { updateViewPopup } from "@/service/general.service";
import React, { useContext, useEffect, useState } from "react";

function AiDashBoard() {
  const current_sidebar_status = sessionStorage.getItem("sidebar-state") || 1;
  const { user, token } = useContext(MainContext);

  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = React.useState(current_sidebar_status == 1 ? true : false);
  const [guide, setGuide] = useState({
    video: user?.role_id == 7 ? videoLinks.dash_board.member : videoLinks.dash_board.non_member,
    open: false,
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (user && user?.view_dashboard_popup == 0 && !notallowUserToAccess(user, [6])) {
      setSidebarOpen(false);
      localStorage.setItem("sidebar-state", 0);
      setGuide({
        open: true,
        ...stages[2],
      });

      if (token) {
        updateViewPopup(token, {
          view_dashboard_popup: "1",
        });
      }
    }
  }, [user]);

  useEffect(() => {
    const reactRoot = document.getElementById("react_root");
    if (reactRoot) {
      reactRoot.classList.add("col-main-wrap");
    }
    return () => {
      const reactRoot = document.getElementById("react_root");
      if (reactRoot) {
        reactRoot.classList.remove("col-main-wrap");
      }
    };
  }, []);

  useEffect(() => {
    const reactRoot = document.getElementById("react_root");
    if (reactRoot) {
      if (!sidebarOpen) {
        reactRoot.classList.add("main-side-collapse", "z-10");
      } else {
        reactRoot.classList.remove("main-side-collapse", "z-10");
      }
    }
  }, [sidebarOpen]);

  const handleShowVideo = (open, number) => {
    setSidebarOpen(open);
    localStorage.setItem("sidebar-state", 1);

    let video = stages[2];
    if (number) {
      video = stages.find((stage) => stage.number === number) || stages[0];
    }

    setGuide((prev) => ({
      ...prev,
      open: open,
      ...video,
    }));
  };

  return (
    user &&
    user?.role_id != 6 && (
      <div className="clb-aside-wrapper">
        {guide.open && <span className="clb-guide-block"></span>}
        <BusinessChat
          sidebarOpen={sidebarOpen}
          setSidebarOpen={(val) => {
            setSidebarOpen(val);
            sessionStorage.setItem("sidebar-state", val == true ? 1 : 0);
          }}
          guide={guide}
          isMobile={isMobile}
          handleShowVideo={handleShowVideo}
        />
      </div>
    )
  );
}

export default AiDashBoard;
