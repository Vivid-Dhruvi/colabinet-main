import { cn } from "@/lib/utils";

const stages = ["Setup", "Overview", "Dashboard"];

export function StageMobile({ currentStage, handleStageChange }) {
  return (
    <div className="border-t-2 border-solid !border-zinc-200 rounded-t-2xl p-2 text-center flex flex-col items-center gap-1 z-10 bg-white">
      
      <h5 className="text-zinc-700 text-xs font-medium -tracking-wide text-center">
        Stage {currentStage + 1} of {stages.length}
      </h5>

      <ul className="flex flex-wrap items-end justify-center gap-3">
        {stages.map((stage, index) => {
          const stageNumber = index;
          const isActive = stageNumber === currentStage;
          const isCompleted = stageNumber < currentStage;

          return (
            <div key={stage} className="flex items-end gap-3" onClick={() => handleStageChange(index + 1)}>
              <li
                className={cn(
                  "p-1.5 w-fit -tracking-wider font-semibold text-[11px] border-b-2 border-solid transition-all duration-200",
                  isActive && "border-teal-600 text-zinc-700",
                  isCompleted && "border-teal-600",
                  !isActive && !isCompleted && "border-zinc-200 text-zinc-400"
                )}
              >
                {stage}
              </li>

              {index < stages.length - 1 && (
                <span className={cn("h-0.5 w-3 bg-zinc-400 shrink-0 mb-3", isCompleted && "bg-teal-600")}></span>
              )}
            </div>
          );
        })}
      </ul>
    </div>
  );
}