import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getOriginUrl } from "@/lib/config";

export default function WorkflowLimitDialog({ isOpen, onOpenChange }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-center">
        <div className="pt-6 pb-2">
          {/* Icon Badge */}
          <div className="mx-auto mb-6 flex w-24 h-24 items-center justify-center rounded-full bg-teal-500">
            <Users className="h-12 w-12 text-white" />
          </div>

          {/* Header Section */}
          <DialogHeader className="gap-4">
            <DialogTitle className="text-2xl font-bold">You've Reached Your Workflow Limit</DialogTitle>
            <DialogDescription className="space-y-3 text-center text-sm">
              <p>You've created the maximum number of workflows allowed in your current plan.</p>
              <p>To build more workflows or expand your operations, please upgrade your plan or remove an existing one.</p>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex gap-3 pt-4">
          <a
            href={`${getOriginUrl()}/private-profile?tab=subscriptions`}
            className="w-1/2 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md text-center"
          >
            Upgrade Plan
          </a>
          <a
            href={`${getOriginUrl()}/workflow/dashboard`}
            variant="outline"
            className="py-2 px-4 rounded-md text-center w-1/2 font-semibold border border-gray-300 hover:bg-gray-100 font-[#4B5563]"
          >
            Manage Workflows
          </a>
        </div>

        {/* Tip Text */}
        <p className="text-xs text-muted-foreground pt-2">Tip: You can upgrade anytime under Billing & Plans.</p>
      </DialogContent>
    </Dialog>
  );
}
