import { getRecurringStatus } from "./utils";

export const base_api_url = "https://dev.colabi.net";
export const LARAVL_APP_KEY = "base64:CApC8Tq7sGcc6Atiog1DWmu53npmhoORPvUdNhWRSpw=";

export const currentSocketUrl = () => {
  const isDev = getCurrentEnvirontment() === "development";
  if (isDev) {
    return "wss://python.colabi.net/chatlayer";
  } else {
    return "wss://api.colabi.net/chatlayer";
  }
};

export const getCurrentSocketEncodeKey = () => {
  const isDev = getCurrentEnvirontment() === "development";
  if (isDev) {
    return "base64:CApC8Tq7sGcc6Atiog1DWmu53npmhoORPvUdNhWRSpw=";
  } else {
    return "base64:voFQ8DnO7OGaG9NY3dwDxlQceNfVpj+8IByJZQPsK0U=";
  }
};

export const card_gap = 400;

export const getCurrentBaseUrl = () => {
  const isDev = getCurrentEnvirontment() === "development";
  if (isDev) {
    return base_api_url;
  } else {
    const currentUrl = window.location.href;
    const urlParts = currentUrl.split("/");
    const baseUrl = urlParts[0] + "//" + urlParts[2];
    return baseUrl;
  }
};

export const getOriginUrl = () => {
  // return base_api_url;
  const currentUrl = window.location.href;
  const urlParts = currentUrl.split("/");
  const baseUrl = urlParts[0] + "//" + urlParts[2];
  return baseUrl;
};

export const getCurrentEnvirontment = () => {
  const currentUrl = window.location.href;
  if (currentUrl.includes("app.colabi.co")) {
    return "production";
  }
  return "development";
};

export const socket_values = [
  { name: "Business Setup", value: "business-setup", type: "internal", prefix: "bs" },
  { name: "Business Overview", value: "business-overview", type: "internal", prefix: "bov" },
  { name: "General Support", value: "general-support", type: "internal", prefix: "gs" },
  { name: "AI Workforce", value: "ai-workflow", type: "internal", prefix: "aiw" },
];

export const videoLinks = {
  intro_video: "https://player.vimeo.com/video/1088678383?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0",
  business_overview: "https://player.vimeo.com/video/1088673917?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0",
  business_setup: "https://player.vimeo.com/video/1088675868?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0",
  dash_board: {
    member: "https://player.vimeo.com/video/1088696463?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0",
    non_member: "https://player.vimeo.com/video/1088682578?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0",
  },
};

export const stages = [
  {
    number: "1",
    subtitle: "Business Setup",
    title: "Build Your Business Brain – Business Setup",
    description: "This video explains how to set up the foundation your business needs to run in Colabi.",
    right_title: "Don't wait until the end to",
    right_subtitle: "see how it all works",
    video_url: "https://player.vimeo.com/video/1088675868?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0",
    image: "/images/ai-workforce-overview.jpg",
    option_videos: [
      {
        number: 2,
        sub_option: true,
        subtitle: "Business Overview",
        title: "Your Business Overview",
        description: "A clear visual view of your business areas, workflows",
        image: "/images/business_overview.png",
        video_url: "https://player.vimeo.com/video/1159574654?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0",
      },
      {
        number: 3,
        subtitle: "Dashboard",
        sub_option: true,
        title: "Your Daily Dashboard",
        description: "AI employees, freelancers, your team all working together.",
        image: "/images/dashboard.png",
        video_url: "https://player.vimeo.com/video/1159575709?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0",
      },
    ],
  },
  {
    number: "2",
    subtitle: "Business Overview",
    title: "Your Business Overview, Fully Built",
    right_title: "Workflow Learning Path ",
    right_subtitle: "see how it all works",
    description: "This video shows how your business is structured in Colabi, from areas to workflows to tasks.",
    video_url: "https://player.vimeo.com/video/1159574654?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0",
    image: "/images/ai-workforce-overview.jpg",
    option_videos: [
      {
        title: "What Is A Workflow",
        sub_option: true,
        description: "See how workflows structure work in Colabi",
        image: "/images/step-2.1.png",
        video_url: "https://player.vimeo.com/video/1160947089?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0",
      },
      {
        title: "Build Your First Workflow",
        sub_option: true,
        description: "Create a workflow and see tasks flow from start to finish",
        image: "/images/step-2.2.png",
        video_url: "https://player.vimeo.com/video/1117691815?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0",
      },
      {
        title: "Advanced Workflow Start Options",
        sub_option: true,
        description: "Control how workflows begin using triggers and events",
        image: "/images/step-2.3.png",
        video_url: "https://player.vimeo.com/video/1118028121?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0",
      },
      {
        title: "Advanced Task Features",
        sub_option: true,
        description: "Fine-tune task timing, collaboration, and completion.",
        image: "/images/step-2.4.png",
        video_url: "https://player.vimeo.com/video/1161348695?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0",
      }
    ],
  },
  {
    number: "3",
    subtitle: "Dashboard",
    title: "See How Work Runs in Colabi",
    description: "This video shows how work runs day to day in Colabi.",
    right_title: "Workflow Walkthroughs",
    right_subtitle: "See how work is managed day to day in Colabi.",
    video_url: "https://player.vimeo.com/video/1159575709?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0",
    image: "/images/ai-workforce-overview.jpg",
    member_vurl: "https://player.vimeo.com/video/1088696463?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0",
    non_member_vurl: "https://player.vimeo.com/video/1088682578?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0",
    option_videos: [
      {
        title: "Manage Your Workflows",
        sub_option: true,
        description: "Learn how to track progress, manage tasks, and keep work moving smoothly.",
        image: "/images/step-3.1.png",
        video_url: "https://player.vimeo.com/video/1159443469?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0",
      },
    ],
  },
];

export const getVideoLink = (key) => {
  switch (key) {
    case "ai_workforce":
      return "https://player.vimeo.com/video/1123401852?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0";
    case "freelancers":
      return "https://player.vimeo.com/video/1129752554?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0";
    case "team":
      return "https://player.vimeo.com/video/1159511190?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0";
    case "guest":
      return "https://player.vimeo.com/video/1159528236?autoplay=1&title=0&byline=0&portrait=0&controls=1&playsinline=0";
    default:
      return "";
  }
};

export function findNonOverlappingPosition(range, nodes, cardWidth = 400, cardHeight = 200) {
  const { min: xMin, max: xMax } = range;
  const yStart = 500; // Starting y position
  const yIncrement = cardHeight; // Vertical spacing
  const xIncrement = 20; // Horizontal step when scanning

  // Helper function to check if two rectangles overlap
  function isOverlapping(x1, y1, x2, y2) {
    return !(x1 + cardWidth < x2 || x2 + cardWidth < x1 || y1 + cardHeight < y2 || y2 + cardHeight < y1);
  }

  // Helper function to check if position overlaps with any existing node
  function hasOverlap(x, y) {
    for (let node of nodes) {
      if (isOverlapping(x, y, node.position.x, node.position.y)) {
        return true;
      }
    }
    return false;
  }

  // Try positions in a grid pattern
  let y = yStart;
  let maxAttempts = 100; // Prevent infinite loop
  let attempt = 0;

  while (attempt < maxAttempts) {
    // Scan horizontally within the range
    for (let x = xMin; x <= xMax - cardWidth; x += xIncrement) {
      if (!hasOverlap(x, y)) {
        return { x, y };
      }
    }

    // Move to next row
    y += yIncrement;
    attempt++;
  }

  // Fallback: return a random position if no perfect spot found
  const fallbackX = xMin + Math.random() * (xMax - xMin - cardWidth);
  const fallbackY = yStart + Math.random() * 200;

  return { x: fallbackX, y: fallbackY };
}

export function filterWorkflows(wf, selectedWorkflowType, selectedWorkflowStatus, selectedBusinessTemplate, searchCanvas, startdate, enddate) {
  if (wf?.workflow_type?.toLowerCase() !== selectedWorkflowType && selectedWorkflowType !== "both") {
    return true;
  } else if (selectedWorkflowStatus === "active" && getRecurringStatus(wf).status !== "Active" && getRecurringStatus(wf).status !== "Completed") {
    return true;
  } else if (selectedWorkflowStatus === "paused" && getRecurringStatus(wf).status !== "Paused") {
    return true;
  } else if (selectedWorkflowStatus === "draft" && getRecurringStatus(wf).status !== "Draft") {
    return true;
  } else if (selectedWorkflowStatus === "deleted" && getRecurringStatus(wf).status !== "Deleted") {
    return true;
  } else if (selectedWorkflowStatus === "archived" && getRecurringStatus(wf).status !== "Archived") {
    return true;
  } else if (selectedBusinessTemplate == "suggested" && (!wf?.trigger_suggestion || wf.in_draft != 1)) {
    return true;
  } else if (selectedBusinessTemplate == "0" && wf?.trigger_suggestion && wf.in_draft == 1) {
    return true;
  } else if (wf?.title?.toLowerCase().includes(searchCanvas?.toLowerCase()) == false && searchCanvas != "") {
    return true;
  } else if (startdate && new Date(wf?.created_at) < new Date(startdate)) {
    return true;
  } else if (enddate && new Date(wf?.created_at) > new Date(enddate)) {
    return true;
  }
  return false;
}

export function filterWorkflowsTemplate(wf, selectedWorkflowType, searchCanvas) {
  if (wf?.workflow_type?.toLowerCase() !== selectedWorkflowType && selectedWorkflowType !== "both") {
    return true;
  } else if (wf?.title?.toLowerCase().includes(searchCanvas?.toLowerCase()) == false && searchCanvas != "") {
    return true;
  }
  return false;
}
