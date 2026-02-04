import React, { useContext, useEffect, useState } from "react";
import { FlowContext } from "../Flow";
import { cn } from "@/lib/utils";

function BusinessTemplate({ templateDetails, open, handleClose, handleAddMore }) {
  const { handleAddToCanvasFinal } = useContext(FlowContext);
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    if (templateDetails) {
      const template_data = [...templateDetails.data];
      let current_data = template_data[template_data.length - 1];
      if (current_data?.type === "ba") {
        current_data = {
          ...current_data,
          data: {
            ...current_data.data,
            selected: true,
            collapsed: false,
            workflows: current_data?.data?.workflows.map((wf) => {
              return {
                ...wf,
                selected: true,
                collapsed: false,
                tasks: wf.tasks.map((task) => {
                  return {
                    ...task,
                    selected: true,
                  };
                }),
              };
            }),
          },
        };
      } else if (current_data?.type === "wf") {
        current_data = {
          ...current_data,
          data: {
            ...current_data.data,
            selected: true,
            collapsed: false,
            tasks: current_data?.data?.tasks.map((task) => {
              return {
                ...task,
                selected: true,
              };
            }),
          },
        };
      }
      template_data[template_data.length - 1] = current_data;
      setSelectedOptions(template_data);
    }
  }, [templateDetails]);

  const handleSelectChange = (type, value, wf_id, ta_id, index) => {
    const currentWorkFlow = [...selectedOptions];
    if (value) {
      if (type === "ba") {
        currentWorkFlow[index] = {
          ...currentWorkFlow[index],
          data: {
            ...currentWorkFlow[index].data,
            selected: value,
          },
        };
      } else if (type === "wf") {
        currentWorkFlow[index] = {
          ...currentWorkFlow[index],
          data: {
            ...currentWorkFlow[index].data,
            selected: value,
            workflows: currentWorkFlow[index]?.data?.workflows?.map((wf) => {
              if (wf.id === wf_id) {
                return {
                  ...wf,
                  selected: value,
                };
              }
            }),
          },
        };
      } else if (type === "task") {
        currentWorkFlow[index] = {
          ...currentWorkFlow[index],
          data: {
            ...currentWorkFlow[index].data,
            selected: value,
            workflows: currentWorkFlow[index]?.data?.workflows?.map((wf) => {
              if (wf.id === wf_id) {
                return {
                  ...wf,
                  selected: value,
                  tasks: wf.tasks.map((task) => {
                    if (task.id === ta_id) {
                      return {
                        ...task,
                        selected: value,
                      };
                    }
                    return task;
                  }),
                };
              }
            }),
          },
        };
      }
    } else {
      if (type === "ba") {
        currentWorkFlow[index] = {
          ...currentWorkFlow[index],
          data: {
            ...currentWorkFlow[index].data,
            selected: value,
            workflows: currentWorkFlow[index]?.data?.workflows?.map((wf) => {
              return {
                ...wf,
                selected: value,
                tasks: wf.tasks.map((task) => {
                  return {
                    ...task,
                    selected: value,
                  };
                }),
              };
            }),
          },
        };
      } else if (type === "wf") {
        currentWorkFlow[index] = {
          ...currentWorkFlow[index],
          data: {
            ...currentWorkFlow[index].data,
            workflows: currentWorkFlow[index]?.data?.workflows?.map((wf) => {
              if (wf.id === wf_id) {
                return {
                  ...wf,
                  selected: value,
                  tasks: wf.tasks.map((task) => {
                    return {
                      ...task,
                      selected: value,
                    };
                  }),
                };
              }
            }),
          },
        };
      } else if (type === "task") {
        currentWorkFlow[index] = {
          ...currentWorkFlow[index],
          data: {
            ...currentWorkFlow[index].data,
            workflows: currentWorkFlow[index]?.data?.workflows?.map((wf) => {
              if (wf.id === wf_id) {
                return {
                  ...wf,
                  tasks: wf.tasks.map((task) => {
                    if (task.id === ta_id) {
                      return {
                        ...task,
                        selected: value,
                      };
                    }
                    return task;
                  }),
                };
              }
            }),
          },
        };
      }
    }
    setSelectedOptions(currentWorkFlow);
  };

  const handleSelectChangeWorkFlow = (type, value, ta_id, index) => {
    const currentWorkFlow = [...selectedOptions];
    if (value) {
      if (type === "ba") {
        currentWorkFlow[index] = {
          ...currentWorkFlow[index],
          data: {
            ...currentWorkFlow[index].data,
            selected: value,
          },
        };
      } else if (type === "task") {
        currentWorkFlow[index] = {
          ...currentWorkFlow[index],
          data: {
            ...currentWorkFlow[index].data,
            selected: value,
            tasks: currentWorkFlow[index]?.data?.tasks?.map((task) => {
              if (task.id === ta_id) {
                return {
                  ...task,
                  selected: value,
                };
              }
              return task;
            }),
          },
        };
      }
    } else {
      if (type === "wf") {
        currentWorkFlow[index] = {
          ...currentWorkFlow[index],
          data: {
            ...currentWorkFlow[index].data,
            selected: value,
            tasks: currentWorkFlow[index]?.data?.tasks?.map((task) => {
              return {
                ...task,
                selected: value,
              };
            }),
          },
        };
      } else if (type === "task") {
        currentWorkFlow[index] = {
          ...currentWorkFlow[index],
          data: {
            ...currentWorkFlow[index].data,
            tasks: currentWorkFlow[index]?.data?.tasks?.map((task) => {
              if (task.id === ta_id) {
                return {
                  ...task,
                  selected: value,
                };
              }
              return task;
            }),
          },
        };
      }
    }
    setSelectedOptions(currentWorkFlow);
  };

  const handleCollapase = (index, type, value, wf_id, sub_type) => {
    const currentWorkFlow = [...selectedOptions];
    if (sub_type === "ba") {
      if (type === "ba") {
        currentWorkFlow[index] = {
          ...currentWorkFlow[index],
          data: {
            ...currentWorkFlow[index].data,
            collapsed: value,
          },
        };
      } else if (type === "wf") {
        currentWorkFlow[index] = {
          ...currentWorkFlow[index],
          data: {
            ...currentWorkFlow[index].data,
            workflows: currentWorkFlow[index]?.data?.workflows?.map((wf) => {
              if (wf.id === wf_id) {
                return {
                  ...wf,
                  collapsed: value,
                };
              }
            }),
          },
        };
      }
    } else if (sub_type === "wf") {
      currentWorkFlow[index] = {
        ...currentWorkFlow[index],
        data: {
          ...currentWorkFlow[index].data,
          collapsed: value,
        },
      };
    }

    setSelectedOptions(currentWorkFlow);
  };

  const generateRandomId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = () => {
    const new_data = selectedOptions.map((sop) => {
      if (sop.type === "ba") {
        const generated_bid = generateRandomId();

        const new_wf = sop?.data?.workflows
          ?.filter((wf) => wf.selected)
          .map((wf) => {
            const generated_wid = generateRandomId();

            const new_tasks = wf.tasks
              ?.filter((task) => task.selected)
              .map((task) => {
                const generated_tid = generateRandomId();

                return {
                  ...task,
                  id: generated_tid,
                  data: {
                    ...task?.data,
                    id: generated_tid,
                  },
                };
              });

            return {
              ...wf,
              id: generated_wid,
              data: {
                ...wf.data,
                id: generated_wid,
              },
              tasks: new_tasks,
            };
          });

        sop.data = {
          ...sop.data,
          workflows: new_wf,
          id: generated_bid,
          data: {
            ...sop.data?.data,
            id: generated_bid,
          },
        };
      } else if (sop.type === "wf") {
        const tasks = sop?.data?.tasks || [];
        const generated_wid = generateRandomId();
        const new_tasks = tasks
          .filter((task) => task.selected)
          .map((task) => {
            const generated_tid = generateRandomId();
            return {
              ...task,
              id: generated_tid,
              data: {
                ...task?.data,
                id: generated_tid,
              },
            };
          });

        sop.data = {
          ...sop.data,
          id: generated_wid,
          data: {
            ...sop.data?.data,
            id: generated_wid,
          },
          tasks: new_tasks,
        };
      }

      return sop;
    });

    handleAddToCanvasFinal(new_data);
    handleClose();
  };

  const handleMore = () => {
    handleAddMore(selectedOptions);
    handleClose();
  };

  return (
    <div
      className={`fixed top-2/4 left-2/4 z-50 -translate-x-2/4 -translate-y-2/4 backdrop-blur-sm h-full w-full bg-black/10 items-center justify-center py-5 ${
        open ? "flex" : "hidden"
      }`}
    >
      <div className="bg-white shadow-xl rounded-xl p-4 pt-10 sm:pt-4 md:pt-3 sm:p-6 md:p-8  flex flex-col max-w-[92%] md:max-w-2xl w-full relative max-h-full overflow-auto hide-scroll">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 border-gray-200">{templateDetails?.template_data?.name}</h3>
        <button
          onClick={handleClose}
          type="button"
          className="p-1 absolute top-3.5 right-3.5 bg-transparent border-0 outline-none cursor-pointer text-gray-500 hover:text-gray-800 transition-all duration-300 ease-linear"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {selectedOptions &&
          selectedOptions.length > 0 &&
          selectedOptions.map((cr_data, index) =>
            cr_data.type === "ba" ? (
              <ul key={cr_data?.data.id} className="text-sm leading-none text-gray-800">
                <li className="p-2 py-3.5 relative z-[1] bg-white rounded-lg border border-solid border-gray-300 mb-4">
                  <div className="flex items-center gap-2 bg-white">
                    <span
                      className={cn("inline-block size-5", cr_data?.data?.collapsed && "rotate-180")}
                      onClick={() => handleCollapase(index, "ba", !cr_data?.data?.collapsed, null, cr_data.type)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-full">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                    <input
                      type="checkbox"
                      id={`ba_${cr_data?.data.id}`}
                      className="size-4 relative z-10"
                      checked={cr_data?.data.selected}
                      onChange={() => handleSelectChange("ba", !cr_data?.data.selected, null, null, index)}
                    />
                    <label htmlFor={`ba_${cr_data?.data.id}`}>{cr_data?.data.data.name}</label>
                  </div>
                  {cr_data?.data.workflows.length > 0 && (
                    <ul className={cn("ml-3 p-3 relative", cr_data?.data.collapsed ? "max-h-0 overflow-hidden p-0" : "max-h-[initial] overflow-[initial]")}>
                      {cr_data?.data.workflows.map((wf) => {
                        return (
                          <li key={wf.id} className="relative mt-2.5 first:mt-0">
                            <div className="flex items-center gap-2 relative bg-white">
                              <span
                                className={cn("inline-block size-5", wf?.collapsed && "rotate-180")}
                                onClick={() => handleCollapase(index, "wf", !wf?.collapsed, wf?.id, cr_data.type)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="size-full"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>
                              </span>
                              <input
                                type="checkbox"
                                checked={wf.selected}
                                id={`wf_${wf.id}`}
                                className="size-4 relative z-10"
                                onChange={() => handleSelectChange("wf", !wf.selected, wf.id, null, index)}
                              />
                              <label htmlFor={`wf_${wf.id}`}>{wf.data.title}</label>
                            </div>
                            {wf.tasks.length > 0 && (
                              <ul className={cn("ml-14 mt-2.5 relative", wf?.collapsed ? "max-h-0 overflow-hidden p-0" : "max-h-[initial] overflow-[initial]")}>
                                {wf.tasks.map((task) => (
                                  <li key={task.id} className="mt-2.5 flex items-center gap-2 mb-0.5 bg-white relative">
                                    <input
                                      type="checkbox"
                                      checked={task.selected}
                                      className="size-4 relative z-10"
                                      onChange={() => handleSelectChange("task", !task.selected, wf.id, task.id, index)}
                                    />
                                    <label className="capitalize" htmlFor={`ts_${task.id}`}>
                                      {task.data.title}
                                    </label>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              </ul>
            ) : (
              cr_data.type === "wf" && (
                <ul className="text-sm leading-none text-gray-800">
                  <li className="p-2 py-3.5 relative z-[1] bg-white rounded-lg border border-solid border-gray-300 mb-4">
                    <div className="flex items-center gap-2 relative bg-white">
                      <span
                        className={cn("inline-block size-5", cr_data?.data?.collapsed && "rotate-180")}
                        onClick={() => handleCollapase(index, "wf", !cr_data?.data?.collapsed, cr_data?.data.id, cr_data.type)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-full">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </span>
                      <input
                        type="checkbox"
                        checked={cr_data?.data.selected}
                        id={`wf_${cr_data?.data.id}`}
                        className="size-4 relative z-10"
                        onChange={() => handleSelectChangeWorkFlow("wf", !cr_data?.data.selected, null, index)}
                      />
                      <label htmlFor={`wf_${cr_data?.data?.id}`}>{cr_data?.data?.data?.title}</label>
                    </div>
                    {cr_data?.data.tasks.length > 0 && (
                      <ul
                        className={cn("ml-14 mt-2.5 relative", cr_data?.data.collapsed ? "max-h-0 overflow-hidden p-0" : "max-h-[initial] overflow-[initial]")}
                      >
                        {cr_data?.data.tasks.map((task) => {
                          return (
                            <li key={task.id} className="mt-2.5 flex items-center gap-2 mb-0.5 bg-white relative">
                              <input
                                type="checkbox"
                                checked={task.selected}
                                className="size-4 relative z-10"
                                onChange={() => handleSelectChangeWorkFlow("task", !task.selected, task.id, index)}
                              />
                              <label className="capitalize" htmlFor={`ts_${task.id}`}>
                                {task.data.title}
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                </ul>
              )
            )
          )}

        <div className="flex justify-between pt-6 bg-white">
          <button
            type="button"
            onClick={handleMore}
            className="bg-[#49B8BF] cursor-pointer text-white text-sm font-semibold px-5 py-2 rounded-md hover:bg-[#60b0b6] transition-all duration-300 ease-linear"
          >
            Add More
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[#49B8BF] cursor-pointer text-white text-sm font-semibold px-5 py-2 rounded-md hover:bg-[#60b0b6] transition-all duration-300 ease-linear"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default BusinessTemplate;
