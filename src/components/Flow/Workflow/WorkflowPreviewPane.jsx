import { LightbulbIcon } from "lucide-react";
import React from "react";

const iconMap = {
  automation: (
    <svg className="h-4 w-4 text-[#f97316]" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 3.5V6.5M10 13.5V16.5M5.05 5.05L7.17 7.17M12.83 12.83L14.95 14.95M3.5 10H6.5M13.5 10H16.5M5.05 14.95L7.17 12.83M12.83 7.17L14.95 5.05"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  time: (
    <svg className="h-4 w-4 text-[#0ea5e9]" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="6.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 5.2V10.2L12.7 11.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  impact: (
    <svg className="h-4 w-4 text-[#6366f1]" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.2 11.6L7.5 14.9L15.8 6.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const resolveStepActor = (actor) => {
  const raw = (actor ?? "").toString().trim();
  if (!raw) {
    return { label: "AI Assistant", tone: "ai" };
  }

  const normalized = raw.toLowerCase();

  if (normalized === "user" || normalized === "you" || normalized === "human") {
    return { label: "You", tone: "user" };
  }

  if (normalized.includes("ai")) {
    return { label: "AI Assistant", tone: "ai" };
  }

  return { label: raw.replace(/\b\w/g, (char) => char.toUpperCase()), tone: "user" };
};

function StepNumber({ index, tone = "ai" }) {
  const isUser = tone === "user";
  const toneClass = isUser ? "bg-[#F08965] shadow-[0_12px_22px_rgba(249,115,22,0.3)]" : "bg-[#62AAB4] shadow-[0_12px_22px_rgba(14,165,233,0.25)]";

  return (
    <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white ${toneClass}`}>{index + 1}</span>
  );
}

function StepActor({ label, tone = "ai" }) {
  const toneClass = tone === "user" ? "text-[#F08965]" : "text-[#62AAB4]";

  return (
    <span className={`text-[13px] font-semibold ${toneClass}`}>
      <span className="text-green-500"></span>
      {label}
    </span>
  );
}

const benefits = [
  {
    text: "Save time",
    generatedBy: "ai",
    second: "Automate repetitive admin and focus on strategy",
    icon: (
      <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M24 0.25C28.4183 0.25 32 3.83172 32 8.25V24.25C32 28.6683 28.4183 32.25 24 32.25H8C3.58172 32.25 0 28.6683 0 24.25V8.25C0 3.83172 3.58172 0.25 8 0.25H24Z"
          fill="#F08965"
          fillOpacity="0.1"
        />
        <path
          d="M24 0.25C28.4183 0.25 32 3.83172 32 8.25V24.25C32 28.6683 28.4183 32.25 24 32.25H8C3.58172 32.25 0 28.6683 0 24.25V8.25C0 3.83172 3.58172 0.25 8 0.25H24Z"
          stroke="#E5E7EB"
        />
        <path d="M23 26.25H9V6.25H23V26.25Z" stroke="#E5E7EB" />

        <path
          d="M16 9C17.8565 9 19.637 9.7375 20.9497 11.0503C22.2625 12.363 23 14.1435 23 16C23 17.8565 22.2625 19.637 20.9497 20.9497C19.637 22.2625 17.8565 23 16 23C14.1435 23 12.363 22.2625 11.0503 20.9497C9.7375 19.637 9 17.8565 9 16C9 14.1435 9.7375 12.363 11.0503 11.0503C12.363 9.7375 14.1435 9 16 9ZM15.3438 12.2812V16C15.3438 16.2188 15.4531 16.4238 15.6363 16.5469L18.2613 18.2969C18.5621 18.4992 18.9695 18.4172 19.1719 18.1137C19.3742 17.8102 19.2922 17.4055 18.9887 17.2031L16.6562 15.65V12.2812C16.6562 11.9176 16.3637 11.625 16 11.625C15.6363 11.625 15.3438 11.9176 15.3438 12.2812Z"
          fill="#F08965"
        />
      </svg>
    ),
  },
  {
    text: "Delight clients",
    generatedBy: "ai",
    second: "Create a consistent, personalized experience",
    icon: (
      <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M24 0.25C28.4183 0.25 32 3.83172 32 8.25V24.25C32 28.6683 28.4183 32.25 24 32.25H8C3.58172 32.25 0 28.6683 0 24.25V8.25C0 3.83172 3.58172 0.25 8 0.25H24Z"
          fill="#62AAB4"
          fillOpacity="0.1"
        />
        <path
          d="M24 0.25C28.4183 0.25 32 3.83172 32 8.25V24.25C32 28.6683 28.4183 32.25 24 32.25H8C3.58172 32.25 0 28.6683 0 24.25V8.25C0 3.83172 3.58172 0.25 8 0.25H24Z"
          stroke="#E5E7EB"
        />
        <path d="M23 26.25H9V6.25H23V26.25Z" stroke="#E5E7EB" />
        <path d="M23 23H9V9H23V23Z" stroke="#E5E7EB" />
        <path
          d="M10.3016 17.2141L15.2426 21.827C15.4477 22.0184 15.7184 22.125 16 22.125C16.2816 22.125 16.5523 22.0184 16.7574 21.827L21.6984 17.2141C22.5297 16.4403 23 15.3547 23 14.2199V14.0614C23 12.15 21.6191 10.5203 19.7352 10.2059C18.4883 9.99807 17.2195 10.4055 16.3281 11.2969L16 11.625L15.6719 11.2969C14.7805 10.4055 13.5117 9.99807 12.2648 10.2059C10.3809 10.5203 9 12.15 9 14.0614V14.2199C9 15.3547 9.47031 16.4403 10.3016 17.2141Z"
          fill="#62AAB4"
        />
      </svg>
    ),
  },
  {
    text: "Scale smoothly",
    generatedBy: "ai",
    second: "Turn great service into repeatable systems",
    icon: (
      <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M24 0.25C28.4183 0.25 32 3.83172 32 8.25V24.25C32 28.6683 28.4183 32.25 24 32.25H8C3.58172 32.25 0 28.6683 0 24.25V8.25C0 3.83172 3.58172 0.25 8 0.25H24Z"
          fill="#3B82F6"
          fillOpacity="0.1"
        />
        <path
          d="M24 0.25C28.4183 0.25 32 3.83172 32 8.25V24.25C32 28.6683 28.4183 32.25 24 32.25H8C3.58172 32.25 0 28.6683 0 24.25V8.25C0 3.83172 3.58172 0.25 8 0.25H24Z"
          stroke="#E5E7EB"
        />
        <path d="M23 26.25H9V6.25H23V26.25Z" stroke="#E5E7EB" />

        <path
          d="M10.75 10.75C10.75 10.266 10.359 9.875 9.875 9.875C9.39102 9.875 9 10.266 9 10.75V19.9375C9 21.1461 9.97891 22.125 11.1875 22.125H22.125C22.609 22.125 23 21.734 23 21.25C23 20.766 22.609 20.375 22.125 20.375H11.1875C10.9469 20.375 10.75 20.1781 10.75 19.9375V10.75ZM21.868 13.118C22.2098 12.7762 22.2098 12.2211 21.868 11.8793C21.5262 11.5375 20.9711 11.5375 20.6293 11.8793L17.75 14.7613L16.1805 13.1918C15.8387 12.85 15.2836 12.85 14.9418 13.1918L11.8793 16.2543C11.5375 16.5961 11.5375 17.1512 11.8793 17.493C12.2211 17.8348 12.7762 17.8348 13.118 17.493L15.5625 15.0512L17.132 16.6207C17.4738 16.9625 18.0289 16.9625 18.3707 16.6207L21.8707 13.1207L21.868 13.118Z"
          fill="#3B82F6"
        />
      </svg>
    ),
  },
];

const recurringTypeLabels = {
  2: "Instant",
  1: "Schedule",
  3: "Recurring",
  4: "On Demand",
  5: "On Hold",
  101: "External Trigger",
};

export const WorkflowPreviewPane = ({ data, onPrimaryAction, onClose, workflow }) => {
  let trigger = {};
  try {
    trigger = workflow?.trigger_suggestion ? JSON.parse(workflow.trigger_suggestion) : {};
  } catch (err) {
    trigger = {};
  }

  const rawSteps = Array.isArray(trigger?.tasks) ? trigger.tasks : Array.isArray(data?.steps) ? data.steps : Array.isArray(trigger?.general_flow) ? trigger?.general_flow : [];
  const workflowSteps = rawSteps
    .map((step, index) => {
      if (!step) return null;

      const { label, tone } = resolveStepActor(step.assigned_to ?? step.actor ?? step.owner ?? "");
      const name = step.task_name ?? step.title ?? step.name ?? step.step_name ?? (typeof step === "string" ? step : "");
      const descriptionText = step.task_description ?? step.description ?? step.text ?? step.step_description ?? step.details ?? "";
      const primary = name || descriptionText;
      const secondary = name && descriptionText && descriptionText !== name ? descriptionText : "";

      if (!primary && !secondary) return null;

      return {
        id: step.id ?? `workflow-step-${index}`,
        label,
        tone,
        primary: primary || secondary,
        secondary,
      };
    })
    .filter(Boolean);

  return (
    <aside
      className="relative flex w-full max-h-svh flex-col gap-5 overflow-y-auto border-l border-[#dbe5f4] bg-[linear-gradient(180deg,_#f8fbff_0%,_#f4f5fb_100%)] px-6 pb-7 pt-6 font-['Inter',_-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] text-[#1f2937]"
      role="complementary"
    >
      <button
        type="button"
        className="cursor-pointer absolute right-[18px] top-[14px] grid h-7 w-7 place-items-center rounded-full border-0 bg-[rgba(15,23,42,0.05)] text-[20px] font-semibold leading-none text-[#334155] transition hover:bg-[rgba(15,23,42,0.08)] focus:outline-none"
        onClick={onClose}
        aria-label="Close preview"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M6.25 6.25L13.75 13.75M6.25 13.75L13.75 6.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      <div className="flex items-center gap-2 text-[13px] font-semibold text-[#be6e17]">
        <div className="grid h-5 w-5 place-items-center rounded-full" aria-hidden="true">
          ✨
        </div>
        <span className="inline-flex items-center gap-[6px]">Suggested based on your Business Setup</span>
      </div>

      <div
        className="shrink-0 relative flex flex-col gap-5 overflow-hidden rounded-[22px] border border-[#d7e5ff] bg-white px-6 pb-6 pt-6 shadow-[0_24px_40px_rgba(15,23,42,0.12)]"
        aria-label="Workflow"
      >
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="m-0 text-sm font-semibold text-[#4B5563] flex items-center gap-2 mb-1"><span className="bg-[#f68a48] p-1.5 rounded-md flex items-center justify-center size-8"><LightbulbIcon className="text-white" /></span>Workflow Suggestion:</h3>
            <h3 className="m-0 text-[19px] font-semibold leading-tight text-[#0f172a]">{workflow?.title}</h3>
          </div>

          <div>
            <h3 className="m-0 text-sm font-semibold text-[#4B5563]">Purpose:</h3>
            {workflow?.description && <p className="m-0 text-[14px] leading-[1.6] text-[#384861]">{workflow?.description}</p>}
          </div>
          {trigger?.tag_line && <p className="m-0 text-[13px] leading-[1.5] text-[#64748b]">{trigger?.tag_line}</p>}
        </div>

        {/* <ul className="m-0 flex list-none flex-wrap justify-between items-start gap-4 p-0 pt-1">
          <li className="flex items-center gap-1 text-[12px] font-medium text-[#4B5563]">
            <span className="flex h-4 w-4 items-center justify-center">
              <svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-3 shrink-0">
                <path
                  d="M8.18906 1.54528C8.32734 1.22419 8.22421 0.849187 7.94062 0.642937C7.65703 0.436687 7.27031 0.455437 7.00546 0.685124L1.00546 5.93512C0.771089 6.14137 0.686714 6.47184 0.79687 6.76247C0.907026 7.05309 1.18828 7.24997 1.49999 7.24997H4.11328L2.31093 11.4547C2.17265 11.7757 2.27578 12.1507 2.55937 12.357C2.84296 12.5632 3.22968 12.5445 3.49453 12.3148L9.49453 7.06481C9.7289 6.85856 9.81328 6.52809 9.70312 6.23747C9.59296 5.94684 9.31406 5.75231 8.99999 5.75231H6.38671L8.18906 1.54528Z"
                  fill="#F08965"
                />
              </svg>
            </span>

            <span>Automation Level {trigger?.automation_level}</span>
          </li>
          <li className="flex gap-1 text-[12px] font-medium text-[#4B5563]">
            <span className="flex h-4 w-4 items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-3 shrink-0">
                <path
                  d="M6.73438 0.5C8.32567 0.5 9.8518 1.13214 10.977 2.25736C12.1022 3.38258 12.7344 4.9087 12.7344 6.5C12.7344 8.0913 12.1022 9.61742 10.977 10.7426C9.8518 11.8679 8.32567 12.5 6.73438 12.5C5.14308 12.5 3.61695 11.8679 2.49173 10.7426C1.36652 9.61742 0.734375 8.0913 0.734375 6.5C0.734375 4.9087 1.36652 3.38258 2.49173 2.25736C3.61695 1.13214 5.14308 0.5 6.73438 0.5ZM6.17188 3.3125V6.5C6.17188 6.6875 6.26562 6.86328 6.42266 6.96875L8.67266 8.46875C8.93047 8.64219 9.27969 8.57187 9.45312 8.31172C9.62656 8.05156 9.55625 7.70469 9.29609 7.53125L7.29688 6.2V3.3125C7.29688 3.00078 7.04609 2.75 6.73438 2.75C6.42266 2.75 6.17188 3.00078 6.17188 3.3125Z"
                  fill="#62AAB4"
                />
              </svg>
            </span>
            <div className="flex flex-col gap-1">
              <span>
                Time Saved
                {trigger?.time_saved}
              </span>
              <span>(Approximately)</span>
            </div>
          </li>
          <li className="flex items-center gap-1 text-[12px] font-medium text-[#4B5563]">
            <span className="flex h-4 w-4 items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-3 shrink-0">
                <path
                  d="M2.23438 2C2.23438 1.58516 1.89922 1.25 1.48438 1.25C1.06953 1.25 0.734375 1.58516 0.734375 2V9.875C0.734375 10.9109 1.57344 11.75 2.60938 11.75H11.9844C12.3992 11.75 12.7344 11.4148 12.7344 11C12.7344 10.5852 12.3992 10.25 11.9844 10.25H2.60938C2.40313 10.25 2.23438 10.0813 2.23438 9.875V2ZM11.7641 4.02969C12.057 3.73672 12.057 3.26094 11.7641 2.96797C11.4711 2.675 10.9953 2.675 10.7023 2.96797L8.23438 5.43828L6.88906 4.09297C6.59609 3.8 6.12031 3.8 5.82734 4.09297L3.20234 6.71797C2.90938 7.01094 2.90938 7.48672 3.20234 7.77969C3.49531 8.07266 3.97109 8.07266 4.26406 7.77969L6.35938 5.68672L7.70469 7.03203C7.99766 7.325 8.47344 7.325 8.76641 7.03203L11.7664 4.03203L11.7641 4.02969Z"
                  fill="#3B82F6"
                />
              </svg>
            </span>
            <span>Impact {trigger?.impact}</span>
          </li>
        </ul> */}
      </div>

      <div className="flex flex-col gap-4" aria-label="Workflow steps">
        <h4 className="m-0 flex items-center gap-2 text-[15px] font-bold text-[#1f2937]">General Flow:</h4>
        {workflowSteps.length > 0 ? (
          <>
            <ol className="m-0 flex list-none flex-col gap-5 p-0">
              {workflowSteps.map((step, index) => (
                <li className="flex items-stretch gap-4" key={step.id}>
                  <div className="flex flex-col items-center">
                    <StepNumber index={index} tone={step.tone} />
                    {index !== workflowSteps.length - 1 && <span className="mt-1 h-full w-[2px] flex-1 rounded-full bg-[#dbeafe]" aria-hidden="true" />}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <StepActor label={step.label} tone={step.tone} />
                    <p className="m-0 text-[13px] leading-[1.55] text-[#1f2937]">{step.primary}</p>
                    {/* {step.secondary && <p className="m-0 text-[12px] leading-[1.5] text-[#64748b]">{step.secondary}</p>} */}
                  </div>
                </li>
              ))}
            </ol>
            <p className="m-0 text-[12px] leading-[1.6] text-[#64748b]">
              Each task builds on the last &mdash; creating a smooth experience your clients will love.
            </p>
          </>
        ) : (
          <p className="m-0 text-[13px] leading-[1.5] text-[#64748b]">Steps will appear here once this workflow has tasks.</p>
        )}
      </div>

      <div className="flex flex-col gap-3" aria-label="Benefits">
        <h4 className="m-0 flex items-center gap-2 text-[15px] font-bold text-[#1f2937]">How It Helps:</h4>
        <ul className="m-0 flex list-none flex-col gap-[10px] p-0">
          {trigger?.achievements?.map((achievement, index) => (
            <li className="flex items-start gap-[10px] text-[13px] text-[#1f2937]" key={index}>
              <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-[linear-gradient(135deg,_#62aab4,_#3c7f86)]" />
              <span className="text-[#4B5563] text-sm font-normal">{achievement}</span>
            </li>
          ))}
        </ul>
      </div>

      <footer className="flex flex-col gap-4 text-[13px] text-[#475569]">
        <p className="m-0 text-[#6B7280] text-sm leading-normal text-center">
          Every small improvement compounds. This workflow moves you closer to an effortless, intelligent business.
        </p>
        <div className="flex flex-col items-stretch gap-[10px]">
          <button
            type="button"
            className="cursor-pointer rounded-full border-0 bg-gradient-to-br from-[#f97316] to-[#f68a48] px-4 py-3 text-[14px] font-bold text-white shadow-[0_10px_20px_rgba(249,115,22,0.2)] transition hover:brightness-95 focus:outline-none"
            onClick={onPrimaryAction}
          >
            Build With AI
          </button>
          <p className="m-0 text-center text-[12px] leading-[1.4] text-[#6b7280]">Colabi Roo will expand this idea into a full, detailed workflow.</p>
        </div>
        <button
          type="button"
          className="cursor-pointer self-center border-0 bg-transparent p-0 text-[13px] font-semibold text-[#64748b] hover:text-[#334155] focus:outline-none"
          onClick={onClose}
        >
          Close Preview
        </button>
      </footer>
    </aside>
  );
};

export default WorkflowPreviewPane;
