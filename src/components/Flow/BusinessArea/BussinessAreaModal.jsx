import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloudUpload } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useContext, useEffect, useState } from "react";
import { FlowContext } from "../Flow";
import { MainContext } from "@/App";
import { createBusinessArea, updateBusinessArea } from "@/service/reposting.service";

export function BusinessAreaModal({ bamodel, setBaModel, initialName = "", id }) {
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);

  const { handleBaModel, currentFlow } = useContext(FlowContext);
  const { token } = useContext(MainContext);
  const [businessArea, setBusinessArea] = useState(initialName || "");
  const [icon, setIcon] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setBusinessArea(initialName || "");
  }, [initialName]);

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    setIcon(f);
  };

  const validateInputs = () => {
    if (!businessArea.trim()) {
      setError("Business area name is required");
      return false;
    }

    if (businessArea.trim().length < 3) {
      setError("Business area name must be at least 3 characters");
      return false;
    }

    if (icon) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(icon.type)) {
        setError("Only JPG and PNG images are allowed");
        return false;
      }

      const maxSizeInMB = 2;
      if (icon.size / 1024 / 1024 > maxSizeInMB) {
        setError("Icon must be less than 2MB");
        return false;
      }
    }

    setError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setSaving(true);

    const payload = {
      name: businessArea,
      ...(icon && { logo: icon }),
      ...(currentFlow.template_id && {
        template_id: currentFlow.template_id,
      }),
    };

    if (id) {
      updateBusinessArea(token, payload, id)
        .then((res) => {
          if (res.success) {
            handleBaModel(res.data, "edit", id);
          } else {
            setError("Failed to update business area. Please try again.");
          }
        })
        .catch((err) => {
          setError("An error occurred. Please try again.");
        })
        .finally(() => {
          setBaModel(false);
          setSaving(false);
        });
    } else {
      createBusinessArea(token, payload)
        .then((res) => {
          setBusinessArea("");
          if (res.success) {
            handleBaModel(res.data, "save");
          }
        })
        .finally(() => {
          setError("");
          setBaModel(false);
          setSaving(false);
        });
    }
  };

  return (
    <Dialog
      open={bamodel}
      onOpenChange={() => {
        setIcon(null);
        setBusinessArea("");
        setBaModel(false);
      }}
    >
      <DialogContent className="sm:max-w-md p-0 top-5 -translate-y-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-xl text-[#111827] font-semibold">{id ? "Edit" : "Add a New"} Business Area</DialogTitle>
            <DialogDescription className="text-pretty text-[#4B5563]">
              {"Business areas help you organize workflows. They can be departments, functions, or specific clients."}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="ba-name" className="text-sm">
                {"Business Area Name"}
                <span className="ml-0.5 text-destructive" aria-hidden="true">
                  *
                </span>
              </Label>
              <Input
                id="edit-business-area"
                placeholder="Eg. Marketing, Sales, Client A"
                value={businessArea}
                onChange={(e) => setBusinessArea(e.target.value)}
                className="w-full"
                autoFocus={false}
              />
              <p className="text-xs text-muted-foreground">
                {"Give this area a clear name so you can group related workflows under it."}
              </p>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm">Business Area Icon</Label>

              {/* Upload dropzone */}
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFiles(e.dataTransfer.files);
                }}
                className={cn(
                  "flex flex-col items-center justify-center rounded-md border-2 border-input border-dashed",
                  "bg-transparen text-center px-6 py-10 transition-colors",
                  dragOver && "border-primary/60 bg-secondary"
                )}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.currentTarget.querySelector < HTMLInputElement > "input[type=file]"?.click();
                  }
                }}
              >
                <CloudUpload className="h-8 w-8 text-muted-foreground mb-3" aria-hidden="true" />
                <span className="text-sm">
                  <button
                    type="button"
                    className="text-blue-600 underline underline-offset-4"
                    onClick={(e) => {
                      e.preventDefault();
                      const input = e.currentTarget.closest("label")?.querySelector('input[type="file"]');
                      input?.click();
                    }}
                  >
                    Click to upload
                  </button>{" "}
                  <span className="text-muted-foreground">or drag and drop</span>
                </span>
                <span className="mt-1 text-xs text-muted-foreground">JPG/PNG, max 2MB</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="sr-only"
                  onChange={(e) => handleFiles(e.currentTarget.files)}
                />
                {icon ? (
                  <span className="mt-3 text-xs text-muted-foreground">
                    Selected: <span className="text-foreground">{icon.name}</span>
                  </span>
                ) : null}
              </label>

              <p className="text-xs text-muted-foreground">{"An icon helps you quickly recognize this area on your canvas."}</p>
            </div>

            {/* Separator using plain Tailwind CSS */}
            <div className="w-full border-t border-gray-200" />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <DialogFooter className="px-6 pb-4 gap-2 sm:gap-3">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className={cn(!businessArea ? "bg-[#62AAB4]" : "bg-[#1BA2A7]")}
              disabled={!businessArea || saving}
            >
              {saving ? "Saving..." : "Save Business Area"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BusinessAreaModal;
