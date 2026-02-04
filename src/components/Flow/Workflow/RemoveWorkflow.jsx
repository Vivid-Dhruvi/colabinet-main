import React, { useContext } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FlowContext } from "../Flow";
import { Button } from "@/components/ui/button";

function RemoveWorkflow({ open, setOpen , wfdetails }) {
  const {  deleteWorkFlow } = useContext(FlowContext);

  const handleDeleteWorkFlow = () => {
    deleteWorkFlow(wfdetails.uuid);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => setOpen(false)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Workflow</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 relative">Are you sure you want to remove this workflow?</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleDeleteWorkFlow}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RemoveWorkflow;
