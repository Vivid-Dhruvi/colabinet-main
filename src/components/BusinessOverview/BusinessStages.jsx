import React from "react";
import { Button } from "../ui/button";
import { cn, isBusinessOverviewAccessible, isBusinessSetupAccessible, notallowUserToAccess } from "@/lib/utils";
const STAGES = [
  {
    id: 0,
    theme: "stage-one",
    label: "🧠 Stage 1",
    title: "Build Your Business Brain",
    description: "Set up the people and information Colabi needs to help run your company. Start fast, or take the guided route, it’s your choice.",
    bullets: [
      {
        icon: (
          <svg width="23" height="18" viewBox="0 0 23 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5.0625 0C5.80842 0 6.52379 0.296316 7.05124 0.823762C7.57868 1.35121 7.875 2.06658 7.875 2.8125C7.875 3.55842 7.57868 4.27379 7.05124 4.80124C6.52379 5.32868 5.80842 5.625 5.0625 5.625C4.31658 5.625 3.60121 5.32868 3.07376 4.80124C2.54632 4.27379 2.25 3.55842 2.25 2.8125C2.25 2.06658 2.54632 1.35121 3.07376 0.823762C3.60121 0.296316 4.31658 0 5.0625 0ZM18 0C18.7459 0 19.4613 0.296316 19.9887 0.823762C20.5162 1.35121 20.8125 2.06658 20.8125 2.8125C20.8125 3.55842 20.5162 4.27379 19.9887 4.80124C19.4613 5.32868 18.7459 5.625 18 5.625C17.2541 5.625 16.5387 5.32868 16.0113 4.80124C15.4838 4.27379 15.1875 3.55842 15.1875 2.8125C15.1875 2.06658 15.4838 1.35121 16.0113 0.823762C16.5387 0.296316 17.2541 0 18 0ZM0 10.5012C0 8.43047 1.68047 6.75 3.75117 6.75H5.25234C5.81133 6.75 6.34219 6.87305 6.82031 7.09102C6.77461 7.34414 6.75352 7.60781 6.75352 7.875C6.75352 9.21797 7.34414 10.4238 8.27578 11.25C8.26875 11.25 8.26172 11.25 8.25117 11.25H0.748828C0.3375 11.25 0 10.9125 0 10.5012ZM14.2488 11.25C14.2418 11.25 14.2348 11.25 14.2242 11.25C15.1594 10.4238 15.7465 9.21797 15.7465 7.875C15.7465 7.60781 15.7219 7.34766 15.6797 7.09102C16.1578 6.86953 16.6887 6.75 17.2477 6.75H18.7488C20.8195 6.75 22.5 8.43047 22.5 10.5012C22.5 10.916 22.1625 11.25 21.7512 11.25H14.2488ZM7.875 7.875C7.875 6.97989 8.23058 6.12145 8.86351 5.48851C9.49645 4.85558 10.3549 4.5 11.25 4.5C12.1451 4.5 13.0036 4.85558 13.6365 5.48851C14.2694 6.12145 14.625 6.97989 14.625 7.875C14.625 8.77011 14.2694 9.62855 13.6365 10.2615C13.0036 10.8944 12.1451 11.25 11.25 11.25C10.3549 11.25 9.49645 10.8944 8.86351 10.2615C8.23058 9.62855 7.875 8.77011 7.875 7.875ZM4.5 17.0613C4.5 14.4738 6.59883 12.375 9.18633 12.375H13.3137C15.9012 12.375 18 14.4738 18 17.0613C18 17.5781 17.5816 18 17.0613 18H5.43867C4.92188 18 4.5 17.5816 4.5 17.0613Z"
              fill="#62AAB4"
            />
          </svg>
        ),
        title: "1. Team & Partners (Quick Start)",
        text_array: ["Add your team & guests", "Add freelancers & AI employees"],
        text: "Add your people and AI teammates so Colabi knows who’s in your business. Jump straight into building workflows.",
      },
      {
        icon: (
          <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2.25 0C1.00898 0 0 1.00898 0 2.25V15.75C0 16.991 1.00898 18 2.25 18H11.25C12.491 18 13.5 16.991 13.5 15.75V5.625H9C8.37773 5.625 7.875 5.12227 7.875 4.5V0H2.25ZM9 0V4.5H13.5L9 0ZM3.9375 9H9.5625C9.87187 9 10.125 9.25313 10.125 9.5625C10.125 9.87187 9.87187 10.125 9.5625 10.125H3.9375C3.62812 10.125 3.375 9.87187 3.375 9.5625C3.375 9.25313 3.62812 9 3.9375 9ZM3.9375 11.25H9.5625C9.87187 11.25 10.125 11.5031 10.125 11.8125C10.125 12.1219 9.87187 12.375 9.5625 12.375H3.9375C3.62812 12.375 3.375 12.1219 3.375 11.8125C3.375 11.5031 3.62812 11.25 3.9375 11.25ZM3.9375 13.5H9.5625C9.87187 13.5 10.125 13.7531 10.125 14.0625C10.125 14.3719 9.87187 14.625 9.5625 14.625H3.9375C3.62812 14.625 3.375 14.3719 3.375 14.0625C3.375 13.7531 3.62812 13.5 3.9375 13.5Z"
              fill="#F08965"
            />
          </svg>
        ),
        title: "2. Business Blueprint (Unlock AI Suggestions)",
        text_array: ["Add plans, roles & processes", "Unlock smarter AI workflows"],
        text: "Add your plans and processes so Colabi understands how you operate. Unlock powerful AI-recommended workflows. Optional anytime.",
      },
    ],
    accentIcon: { label: "👋" },
    mobileTitle: "Build Your Business Brain",
    mobileBody: "Let's bring your business to life. I'll help you set up your team, AI workforce, and strategies through a quick chat.",
  },
  {
    id: 1,
    theme: "stage-two",
    label: "🧩 Stage 2",
    title: "Welcome to Stage 2-Your Visual Business Overview.",
    description: "This is where your business takes shape.  See how business areas, workflows, and tasks connect.",
    bullet_heading: "This canvas has two views:",
    bullets: [
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 18H0V0H18V18Z" stroke="#E5E7EB" />
            <path
              d="M2.25 16.875H15.75C16.991 16.875 18 15.866 18 14.625V5.625C18 4.38398 16.991 3.375 15.75 3.375H10.125C9.76992 3.375 9.43594 3.20977 9.225 2.925L8.55 2.025C8.12461 1.45898 7.45664 1.125 6.75 1.125H2.25C1.00898 1.125 0 2.13398 0 3.375V14.625C0 15.866 1.00898 16.875 2.25 16.875Z"
              fill="#62AAB4"
            />
          </svg>
        ),
        title: "Your Business",
        text_array: ["Live workflows", "Day-to-day operations"],
        text: "Your live environment. Build manually to define the workflows and logic actively running your business.",
      },
      {
        icon: (
          <svg width="21" height="18" viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8.25117 1.50117L6.92578 1.99687C6.82031 2.03555 6.75 2.1375 6.75 2.25C6.75 2.3625 6.82031 2.46445 6.92578 2.50312L8.25117 2.99883L8.74687 4.32422C8.78555 4.42969 8.8875 4.5 9 4.5C9.1125 4.5 9.21445 4.42969 9.25313 4.32422L9.74883 2.99883L11.0742 2.50312C11.1797 2.46445 11.25 2.3625 11.25 2.25C11.25 2.1375 11.1797 2.03555 11.0742 1.99687L9.74883 1.50117L9.25313 0.175781C9.21445 0.0703125 9.1125 0 9 0C8.8875 0 8.78555 0.0703125 8.74687 0.175781L8.25117 1.50117ZM1.6207 13.9008C0.963281 14.5582 0.963281 15.627 1.6207 16.2879L2.83711 17.5043C3.49453 18.1617 4.56328 18.1617 5.22422 17.5043L18.6293 4.0957C19.2867 3.43828 19.2867 2.36953 18.6293 1.70859L17.4129 0.495703C16.7555 -0.161719 15.6867 -0.161719 15.0258 0.495703L1.6207 13.9008ZM17.0367 2.90391L13.3453 6.59531L12.5262 5.77617L16.2176 2.08477L17.0367 2.90391ZM0.263672 4.12031C0.105469 4.18008 0 4.33125 0 4.5C0 4.66875 0.105469 4.81992 0.263672 4.87969L2.25 5.625L2.99531 7.61133C3.05508 7.76953 3.20625 7.875 3.375 7.875C3.54375 7.875 3.69492 7.76953 3.75469 7.61133L4.5 5.625L6.48633 4.87969C6.64453 4.81992 6.75 4.66875 6.75 4.5C6.75 4.33125 6.64453 4.18008 6.48633 4.12031L4.5 3.375L3.75469 1.38867C3.69492 1.23047 3.54375 1.125 3.375 1.125C3.20625 1.125 3.05508 1.23047 2.99531 1.38867L2.25 3.375L0.263672 4.12031ZM12.6387 13.1203C12.4805 13.1801 12.375 13.3313 12.375 13.5C12.375 13.6687 12.4805 13.8199 12.6387 13.8797L14.625 14.625L15.3703 16.6113C15.4301 16.7695 15.5813 16.875 15.75 16.875C15.9187 16.875 16.0699 16.7695 16.1297 16.6113L16.875 14.625L18.8613 13.8797C19.0195 13.8199 19.125 13.6687 19.125 13.5C19.125 13.3313 19.0195 13.1801 18.8613 13.1203L16.875 12.375L16.1297 10.3887C16.0699 10.2305 15.9187 10.125 15.75 10.125C15.5813 10.125 15.4301 10.2305 15.3703 10.3887L14.625 12.375L12.6387 13.1203Z"
              fill="#62AAB4"
            />
          </svg>
        ),
        title: "AI Business Structure",
        text_array: ["Suggested areas & workflows", "Built from your setup in Stage 1"],
        text: "Your strategic whiteboard. Chat with me to get high-level suggestions on which Business Areas and Workflows you should have.",
      },
    ],
    accentIcon: { label: "👉" },
    mobileTitle: "Design How Your Business Runs",
    mobileBody: "Meet Colabi-roo, your digital COO. He’s ready to turn your setup into a working operation by auto-creating smart workflows for your team.",
  },
  {
    id: 2,
    theme: "stage-three",
    label: "📊 Stage 3",
    title: "Your Daily Command Center",
    description: "Get a clear, real-time view of your business.  See what’s running, what needs attention, and take action quickly.",
    bullets: [
      {
        icon: (
          <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2.25 0.75V1.5H1.125C0.503906 1.5 0 2.00391 0 2.625V3.75H10.5V2.625C10.5 2.00391 9.99609 1.5 9.375 1.5H8.25V0.75C8.25 0.335156 7.91484 0 7.5 0C7.08516 0 6.75 0.335156 6.75 0.75V1.5H3.75V0.75C3.75 0.335156 3.41484 0 3 0C2.58516 0 2.25 0.335156 2.25 0.75ZM10.5 4.5H0V10.875C0 11.4961 0.503906 12 1.125 12H9.375C9.99609 12 10.5 11.4961 10.5 10.875V4.5Z"
              fill="white"
            />
          </svg>
        ),
        title: "See what's in progress",
        background: "#62AAB4",
      },
      {
        icon: (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4.5 2.45625C4.5 2.24063 4.36406 2.05078 4.19063 1.92188C3.91875 1.71797 3.75 1.43672 3.75 1.125C3.75 0.503906 4.42266 0 5.25 0C6.07734 0 6.75 0.503906 6.75 1.125C6.75 1.43672 6.58125 1.71797 6.30938 1.92188C6.13594 2.05078 6 2.24063 6 2.45625C6 2.75625 6.24375 3 6.54375 3H7.875C8.49609 3 9 3.50391 9 4.125V5.45625C9 5.75625 9.24375 6 9.54375 6C9.75938 6 9.94922 5.86406 10.0781 5.69063C10.282 5.41875 10.5633 5.25 10.875 5.25C11.4961 5.25 12 5.92266 12 6.75C12 7.57734 11.4961 8.25 10.875 8.25C10.5633 8.25 10.282 8.08125 10.0781 7.80938C9.94922 7.63594 9.75938 7.5 9.54375 7.5C9.24375 7.5 9 7.74375 9 8.04375V10.875C9 11.4961 8.49609 12 7.875 12H6.54375C6.24375 12 6 11.7562 6 11.4562C6 11.2406 6.13594 11.0508 6.30938 10.9219C6.58125 10.718 6.75 10.4367 6.75 10.125C6.75 9.50391 6.07734 9 5.25 9C4.42266 9 3.75 9.50391 3.75 10.125C3.75 10.4367 3.91875 10.718 4.19063 10.9219C4.36406 11.0508 4.5 11.2406 4.5 11.4562C4.5 11.7562 4.25625 12 3.95625 12H1.125C0.503906 12 0 11.4961 0 10.875V8.04375C0 7.74375 0.24375 7.5 0.54375 7.5C0.759375 7.5 0.949219 7.63594 1.07812 7.80938C1.28203 8.08125 1.56328 8.25 1.875 8.25C2.49609 8.25 3 7.57734 3 6.75C3 5.92266 2.49609 5.25 1.875 5.25C1.56328 5.25 1.28203 5.41875 1.07812 5.69063C0.949219 5.86406 0.759375 6 0.54375 6C0.24375 6 0 5.75625 0 5.45625V4.125C0 3.50391 0.503906 3 1.125 3H3.95625C4.25625 3 4.5 2.75625 4.5 2.45625Z"
              fill="white"
            />
          </svg>
        ),
        title: "Understand priorities",
        background: "#62AAB4",
      },
      {
        icon: (
          <svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4.87477 8.25C7.56774 8.25 9.74977 6.40312 9.74977 4.125C9.74977 1.84688 7.56774 0 4.87477 0C2.1818 0 -0.000231771 1.84688 -0.000231771 4.125C-0.000231771 5.02969 0.344299 5.86641 0.927893 6.54844C0.845862 6.76875 0.723987 6.96328 0.595081 7.12734C0.482581 7.27266 0.367737 7.38516 0.283362 7.4625C0.241174 7.5 0.206018 7.53047 0.182581 7.54922C0.170862 7.55859 0.161487 7.56562 0.156799 7.56797L0.152112 7.57266C0.0232057 7.66875 -0.0330443 7.8375 0.0185182 7.98984C0.0700807 8.14219 0.213049 8.25 0.374768 8.25C0.885706 8.25 1.40133 8.11875 1.83024 7.95703C2.04586 7.875 2.24742 7.78359 2.42321 7.68984C3.14274 8.04609 3.97946 8.25 4.87477 8.25ZM10.4998 4.125C10.4998 6.75703 8.17711 8.73984 5.42555 8.97656C5.99508 10.7203 7.88414 12 10.1248 12C11.0201 12 11.8568 11.7961 12.5787 11.4398C12.7545 11.5336 12.9537 11.625 13.1693 11.707C13.5982 11.8687 14.1138 12 14.6248 12C14.7865 12 14.9318 11.8945 14.981 11.7398C15.0302 11.5852 14.9763 11.4164 14.8451 11.3203L14.8404 11.3156C14.8357 11.3109 14.8263 11.3062 14.8146 11.2969C14.7912 11.2781 14.756 11.25 14.7138 11.2102C14.6295 11.1328 14.5146 11.0203 14.4021 10.875C14.2732 10.7109 14.1513 10.5141 14.0693 10.2961C14.6529 9.61641 14.9974 8.77969 14.9974 7.87266C14.9974 5.69766 13.0076 3.91406 10.4834 3.75937C10.4927 3.87891 10.4974 4.00078 10.4974 4.12266L10.4998 4.125Z"
              fill="white"
            />
          </svg>
        ),
        title: "Take action with AI",
        background: "#62AAB4",
      },
    ],
    helper: "Use built-in AI tools to take action directly from your dashboard.",
    accentIcon: { label: "📊" },
    mobileTitle: "Your Central Control Hub",
    mobileBody: "Ask your AI Manager for workflow and task updates, or use the Command Centre below to manually view your calendar and tools.",
  },
  {
    id: 3,
    theme: "stage-four",
    label: "📊 Workflow Chat",
    title: "Your Workflow Command Center",
    description:
      "Colabi’s Workflow AI understands this workflow, including its instances, tasks, collaborators, and progress and can help manage or act on your behalf.",
    bullets: [
      {
        icon: (
          <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2.25 0.75V1.5H1.125C0.503906 1.5 0 2.00391 0 2.625V3.75H10.5V2.625C10.5 2.00391 9.99609 1.5 9.375 1.5H8.25V0.75C8.25 0.335156 7.91484 0 7.5 0C7.08516 0 6.75 0.335156 6.75 0.75V1.5H3.75V0.75C3.75 0.335156 3.41484 0 3 0C2.58516 0 2.25 0.335156 2.25 0.75ZM10.5 4.5H0V10.875C0 11.4961 0.503906 12 1.125 12H9.375C9.99609 12 10.5 11.4961 10.5 10.875V4.5Z"
              fill="white"
            />
          </svg>
        ),
        title: "Track workflow and instance progress",
        background: "#62AAB4",
      },
      {
        icon: (
          <svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4.87477 8.25C7.56774 8.25 9.74977 6.40312 9.74977 4.125C9.74977 1.84688 7.56774 0 4.87477 0C2.1818 0 -0.000231771 1.84688 -0.000231771 4.125C-0.000231771 5.02969 0.344299 5.86641 0.927893 6.54844C0.845862 6.76875 0.723987 6.96328 0.595081 7.12734C0.482581 7.27266 0.367737 7.38516 0.283362 7.4625C0.241174 7.5 0.206018 7.53047 0.182581 7.54922C0.170862 7.55859 0.161487 7.56562 0.156799 7.56797L0.152112 7.57266C0.0232057 7.66875 -0.0330443 7.8375 0.0185182 7.98984C0.0700807 8.14219 0.213049 8.25 0.374768 8.25C0.885706 8.25 1.40133 8.11875 1.83024 7.95703C2.04586 7.875 2.24742 7.78359 2.42321 7.68984C3.14274 8.04609 3.97946 8.25 4.87477 8.25ZM10.4998 4.125C10.4998 6.75703 8.17711 8.73984 5.42555 8.97656C5.99508 10.7203 7.88414 12 10.1248 12C11.0201 12 11.8568 11.7961 12.5787 11.4398C12.7545 11.5336 12.9537 11.625 13.1693 11.707C13.5982 11.8687 14.1138 12 14.6248 12C14.7865 12 14.9318 11.8945 14.981 11.7398C15.0302 11.5852 14.9763 11.4164 14.8451 11.3203L14.8404 11.3156C14.8357 11.3109 14.8263 11.3062 14.8146 11.2969C14.7912 11.2781 14.756 11.25 14.7138 11.2102C14.6295 11.1328 14.5146 11.0203 14.4021 10.875C14.2732 10.7109 14.1513 10.5141 14.0693 10.2961C14.6529 9.61641 14.9974 8.77969 14.9974 7.87266C14.9974 5.69766 13.0076 3.91406 10.4834 3.75937C10.4927 3.87891 10.4974 4.00078 10.4974 4.12266L10.4998 4.125Z"
              fill="white"
            />
          </svg>
        ),
        title: "Start or edit workflow instances",
        background: "#62AAB4",
      },
      {
        icon: (
          <svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4.87477 8.25C7.56774 8.25 9.74977 6.40312 9.74977 4.125C9.74977 1.84688 7.56774 0 4.87477 0C2.1818 0 -0.000231771 1.84688 -0.000231771 4.125C-0.000231771 5.02969 0.344299 5.86641 0.927893 6.54844C0.845862 6.76875 0.723987 6.96328 0.595081 7.12734C0.482581 7.27266 0.367737 7.38516 0.283362 7.4625C0.241174 7.5 0.206018 7.53047 0.182581 7.54922C0.170862 7.55859 0.161487 7.56562 0.156799 7.56797L0.152112 7.57266C0.0232057 7.66875 -0.0330443 7.8375 0.0185182 7.98984C0.0700807 8.14219 0.213049 8.25 0.374768 8.25C0.885706 8.25 1.40133 8.11875 1.83024 7.95703C2.04586 7.875 2.24742 7.78359 2.42321 7.68984C3.14274 8.04609 3.97946 8.25 4.87477 8.25ZM10.4998 4.125C10.4998 6.75703 8.17711 8.73984 5.42555 8.97656C5.99508 10.7203 7.88414 12 10.1248 12C11.0201 12 11.8568 11.7961 12.5787 11.4398C12.7545 11.5336 12.9537 11.625 13.1693 11.707C13.5982 11.8687 14.1138 12 14.6248 12C14.7865 12 14.9318 11.8945 14.981 11.7398C15.0302 11.5852 14.9763 11.4164 14.8451 11.3203L14.8404 11.3156C14.8357 11.3109 14.8263 11.3062 14.8146 11.2969C14.7912 11.2781 14.756 11.25 14.7138 11.2102C14.6295 11.1328 14.5146 11.0203 14.4021 10.875C14.2732 10.7109 14.1513 10.5141 14.0693 10.2961C14.6529 9.61641 14.9974 8.77969 14.9974 7.87266C14.9974 5.69766 13.0076 3.91406 10.4834 3.75937C10.4927 3.87891 10.4974 4.00078 10.4974 4.12266L10.4998 4.125Z"
              fill="white"
            />
          </svg>
        ),
        title: "Assign, reassign, or complete tasks",
        background: "#62AAB4",
      },
      {
        icon: (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4.5 2.45625C4.5 2.24063 4.36406 2.05078 4.19063 1.92188C3.91875 1.71797 3.75 1.43672 3.75 1.125C3.75 0.503906 4.42266 0 5.25 0C6.07734 0 6.75 0.503906 6.75 1.125C6.75 1.43672 6.58125 1.71797 6.30938 1.92188C6.13594 2.05078 6 2.24063 6 2.45625C6 2.75625 6.24375 3 6.54375 3H7.875C8.49609 3 9 3.50391 9 4.125V5.45625C9 5.75625 9.24375 6 9.54375 6C9.75938 6 9.94922 5.86406 10.0781 5.69063C10.282 5.41875 10.5633 5.25 10.875 5.25C11.4961 5.25 12 5.92266 12 6.75C12 7.57734 11.4961 8.25 10.875 8.25C10.5633 8.25 10.282 8.08125 10.0781 7.80938C9.94922 7.63594 9.75938 7.5 9.54375 7.5C9.24375 7.5 9 7.74375 9 8.04375V10.875C9 11.4961 8.49609 12 7.875 12H6.54375C6.24375 12 6 11.7562 6 11.4562C6 11.2406 6.13594 11.0508 6.30938 10.9219C6.58125 10.718 6.75 10.4367 6.75 10.125C6.75 9.50391 6.07734 9 5.25 9C4.42266 9 3.75 9.50391 3.75 10.125C3.75 10.4367 3.91875 10.718 4.19063 10.9219C4.36406 11.0508 4.5 11.2406 4.5 11.4562C4.5 11.7562 4.25625 12 3.95625 12H1.125C0.503906 12 0 11.4961 0 10.875V8.04375C0 7.74375 0.24375 7.5 0.54375 7.5C0.759375 7.5 0.949219 7.63594 1.07812 7.80938C1.28203 8.08125 1.56328 8.25 1.875 8.25C2.49609 8.25 3 7.57734 3 6.75C3 5.92266 2.49609 5.25 1.875 5.25C1.56328 5.25 1.28203 5.41875 1.07812 5.69063C0.949219 5.86406 0.759375 6 0.54375 6C0.24375 6 0 5.75625 0 5.45625V4.125C0 3.50391 0.503906 3 1.125 3H3.95625C4.25625 3 4.5 2.75625 4.5 2.45625Z"
              fill="white"
            />
          </svg>
        ),
        title: "Update task instructions, outputs, or collaborators",
        background: "#62AAB4",
      },
    ],
    helper: "Your Workflow AI can also make updates and complete tasks for you.",
    accentIcon: { label: "📊" },
    mobileTitle: "Your Workflow Command Center",
    mobileBody:
      "Colabi’s Workflow AI understands this workflow, including its instances, tasks, collaborators, and progress and can help manage or act on your behalf.",
  },
];

export default function BusinessStages({ defaultStage = 0, onStageTwo, onStageThree, onWatchGuide, onChatNow, onStageOne, user, isMobile }) {
  const [currentStage, setCurrentStage] = React.useState(Math.min(Math.max(defaultStage, 0), STAGES.length - 1));

  React.useEffect(() => {
    setCurrentStage(Math.min(Math.max(defaultStage, 0), STAGES.length - 1));
  }, [defaultStage]);

  const stage = STAGES[currentStage];

  const handleNext = () => {
    if (currentStage === 0 && typeof onStageTwo === "function") {
      onStageTwo();
    }
    if (currentStage === 1 && typeof onStageThree === "function") {
      onStageThree();
    }
    if (currentStage < STAGES.length - 1) {
      setCurrentStage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStage === 1 && typeof onStageTwo === "function") {
      onStageOne();
    }
    if (currentStage === 2 && typeof onStageThree === "function") {
      onStageTwo();
    }

    if (currentStage > 0) {
      setCurrentStage((prev) => prev - 1);
    }
  };

  return (
    <div className="business-stages">
      <span className={cn("business-stages__accent", `business-stages__accent--${stage.theme}`)}>{stage.accentIcon.label}</span>

      {!notallowUserToAccess(user, [6]) && (isBusinessOverviewAccessible(user) || isBusinessSetupAccessible(user)) && (
        <span className={cn("business-stages__badge", `business-stages__badge--${stage.theme}`)}>
          <span>{stage.label}</span>
        </span>
      )}

      {isMobile ? (
        <>
          <h3 className="business-stages__title">{stage.mobileTitle}</h3>
          <p className="business-stages__description">{stage.mobileBody}</p>
        </>
      ) : (
        <>
          <h3 className="business-stages__title">{stage.title}</h3>
          <p className="business-stages__description">{stage.description}</p>
          <p className="business-stages__bullet-heading">{stage.bullet_heading}</p>
          <ul className="business-stages__list">
            {stage.bullets.map((bullet, index) => (
              <li key={index} className="business-stages__list-item">
                <span className={cn("business-stages__bullet-icon", `business-stages__bullet-icon--${stage.theme}`)}>{bullet.icon}</span>
                <div>
                  <h2 className="business-stages__bullet-header">{bullet.title}</h2>
                  <ul>
                    {bullet.text_array &&
                      bullet.text_array.map((textItem, idx) => (
                        <li key={idx} className="business-stages__bullet-point">
                          {textItem}
                        </li>
                      ))}
                  </ul>
                  {/* <span className="business-stages__bullet-text">{bullet.text}</span> */}
                </div>
              </li>
            ))}
          </ul>

          {stage.helper && <p className="business-stages__helper">{stage.helper}</p>}
          {stage.disclosure && <p className="business-stages__disclosure">{stage.disclosure}</p>}
        </>
      )}

      <div className="business-stages__actions">
        <Button className={cn("business-stages__chat-button", `business-stages__button--${stage.theme}`)} onClick={onChatNow}>
          <svg width="9" height="12" viewBox="0 0 9 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="business-stages__chat-icon">
            <path
              d="M1.71094 0.914071C1.36406 0.70079 0.928125 0.693759 0.574219 0.892978C0.220312 1.0922 0 1.4672 0 1.87501V10.125C0 10.5328 0.220312 10.9078 0.574219 11.107C0.928125 11.3063 1.36406 11.2969 1.71094 11.0859L8.46094 6.96095C8.79609 6.75704 9 6.39376 9 6.00001C9 5.60626 8.79609 5.24532 8.46094 5.03907L1.71094 0.914071Z"
              fill="white"
            />
          </svg>
          Chat Now
        </Button>
        <Button variant="ghost" className="business-stages__guide-button" onClick={onWatchGuide}>
          <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 4.5C0 3.67266 0.672656 3 1.5 3H7.5C8.32734 3 9 3.67266 9 4.5V10.5C9 11.3273 8.32734 12 7.5 12H1.5C0.672656 12 0 11.3273 0 10.5V4.5ZM13.1039 3.83906C13.3477 3.97031 13.5 4.22344 13.5 4.5V10.5C13.5 10.7766 13.3477 11.0297 13.1039 11.1609C12.8602 11.2922 12.5648 11.2781 12.3328 11.1234L10.0828 9.62344L9.75 9.40078V9V6V5.59922L10.0828 5.37656L12.3328 3.87656C12.5625 3.72422 12.8578 3.70781 13.1039 3.83906Z"
              fill="#374151"
            />
          </svg>
          Watch Guide
        </Button>
      </div>

      {!notallowUserToAccess(user, [6]) && (isBusinessOverviewAccessible(user) || isBusinessSetupAccessible(user)) && (
        <div className="business-stages__nav">
          {defaultStage > 0 && defaultStage <= 2 && (
            <button
              type="button"
              className={cn(
                "business-stages__nav-button business-stages__nav-button--prev",
                currentStage === 0 && "business-stages__nav-button--disabled-prev",
              )}
              onClick={handlePrev}
              disabled={currentStage === 0}
            >
              <svg className="business-stages__nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Previous Stage
            </button>
          )}

          {defaultStage <= 2 && (
            <div className="business-stages__nav-indicators">
              {STAGES.map((item) => (
                <span
                  key={item.id}
                  className={cn(
                    "business-stages__nav-dot",
                    currentStage === item.id
                      ? cn("business-stages__nav-dot--active", `business-stages__nav-dot--${item.theme}`)
                      : "business-stages__nav-dot--inactive",
                  )}
                />
              ))}
            </div>
          )}

          {defaultStage < 2 && defaultStage >= 0 && (
            <button
              type="button"
              className={cn(
                "business-stages__nav-button business-stages__nav-button--next",
                currentStage === STAGES.length - 1 && "business-stages__nav-button--disabled-next",
              )}
              onClick={handleNext}
              disabled={currentStage === STAGES.length - 1}
            >
              Next Stage
              <svg className="business-stages__nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      )}

      {!isMobile && defaultStage <= 2 && (
        <>
          <div className="business-stages__separator" />
          <span className="business-stages__disclosure">Want a quick look ahead?</span>
          <span className="business-stages__disclosure">Skip through the stages and return anytime.</span>
        </>
      )}
    </div>
  );
}
