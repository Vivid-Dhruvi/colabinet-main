import React, { useContext } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FlowContext } from "../Flow";
import { Button } from "@/components/ui/button";

function RemoveBusinessArea({ open, setOpen, wfdetails }) {
  const { deleteConnectedBA } = useContext(FlowContext);

  const handleSubmit = () => {
    deleteConnectedBA(wfdetails);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => setOpen(false)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Business Area</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 relative">Are you sure you want to remove this business area?</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RemoveBusinessArea;
