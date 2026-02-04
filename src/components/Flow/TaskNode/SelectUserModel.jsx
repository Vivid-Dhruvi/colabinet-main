import React, { useContext, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FlowContext } from "../Flow";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

function SelectUserModel({ open, setOpen, tsdetails, users }) {
  const { currentFlow, handleConnectBA } = useContext(FlowContext);
  const [selectedUser, setSelectedUser] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSelect = (e) => {
    setSelectedUser(e);
    setError("");
  };

  const handleSubmit = () => {
    if (!selectedUser) {
      setError("Business area is required.");
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => setOpen(false)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 relative">
          <Select onValueChange={handleSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select User" />
            </SelectTrigger>
            <SelectContent>
              {users.map((ba) => (
                <SelectItem value={ba.id} key={ba.id}>
                  {ba.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="absolute bottom-[-5px] left-1 text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            Submit {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SelectUserModel;
