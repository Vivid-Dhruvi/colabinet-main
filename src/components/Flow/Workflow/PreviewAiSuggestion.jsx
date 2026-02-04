import { getOriginUrl } from "@/lib/config";
import { WorkflowPreviewPane } from "./WorkflowPreviewPane";

export function PreviewAiSuggestion({ open, setOpen, workflow, handlePathChange }) {
  const redirect = () => {
    handlePathChange(`${getOriginUrl()}/chatlayer/workflow-creation/${workflow.uuid}?build=1&reactframe=true`);
  };
  return (
    <>
      <div
        className={`pointer-events-none fixed top-16 bottom-0 right-0 z-40 flex w-full max-w-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="pointer-events-auto flex h-full w-full justify-end bg-transparent cusotme-scroll">
          <WorkflowPreviewPane onPrimaryAction={redirect} onClose={() => setOpen(false)} workflow={workflow} />
        </div>
      </div>
    </>
  );
}

export default PreviewAiSuggestion;
