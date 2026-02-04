import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ReactFlow, Background, useNodesState, useEdgesState, MarkerType, useReactFlow } from "@xyflow/react";
import BusinessArea from "./BusinessArea/BusinessArea";
import ClientNode from "./ClientNode/ClientNode";
import WorkflowNode from "./Workflow/WorkflowNode";
import TaskNode from "./TaskNode/TaskNode";
import UserNode from "./TaskNode/UserNode";
import BusinessTemplate from "./BusinessCategories/BusinessTemplate";
import {
  changeWorkFlowView,
  deleteWorkFlowService,
  deleteWorkFlowTask,
  saveCardCollapse,
  saveCardPosition,
  saveDraftDetails,
  updateViewPopup,
} from "@/service/general.service";
import { card_gap, filterWorkflows, filterWorkflowsTemplate, findNonOverlappingPosition, getOriginUrl } from "@/lib/config";
import { ErrorToast } from "../General/toastVarient";
import { MainContext } from "@/App";
import { cn, getCurrentColor, getRecurringStatus, getWorkflowStatus } from "@/lib/utils";
import { RearrangeConfirmationDialog } from "./ButifyModel";
import { getReportingDetails, manualChainedWorkflow } from "@/service/reposting.service";
import PreviewAiSuggestion from "./Workflow/PreviewAiSuggestion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Funnel } from "lucide-react";
import { BusinessContext } from "@/Pages/layouts/BusinessLayout";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import "@xyflow/react/dist/style.css";
import { Button } from "../ui/button";
import { format, set } from "date-fns";
import CustomTooltip from "../BusinessOverview/CustomTooltip";

export const FlowContext = createContext();

const nodeTypes = {
  business: ClientNode,
  marketing: BusinessArea,
  workflow: WorkflowNode,
  task: TaskNode,
  user: UserNode,
};

function Flow({ currentPath, setCurrnetPath, reportData, setSidebarOpen, sidebarOpen, handleGetData }) {
  const { handleShowVideo, isMobile, businessTemplate, selectedBusinessTemplate, setSelectedBusinessTemplate, handleCurrentInnerPath } =
    useContext(BusinessContext);
  const { user, token } = useContext(MainContext);
  const { setViewport, zoomIn, zoomOut } = useReactFlow();
  const flowRef = useRef(null);
  const workFlowValueRef = useRef({});

  const [overviewData, setOverviewData] = useState({});
  const [startdate, setStartDate] = useState();
  const [enddate, setEndDate] = useState();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [filterNodes, setFilterNodes] = useState([]);
  const [filterEdges, setFilterEdges] = useState([]);
  const [isFrame, setIsFrame] = useState(false);
  const [isRearrange, setIsRearrange] = useState(false);
  const [chainWorkFlow, setChainWorkflow] = useState({});
  const [isWorkFlowSidePan, setIsWorkFlowSidePan] = useState(false);
  const [currentWFDetails, setCurrentWFDetails] = useState(null);
  const [selectedWorkflowType, setSelectedWorkflowType] = useState("both");
  const [selectedWorkflowStatus, setSelectedWorkflowStatus] = useState("active");
  const [searchCanvas, setSearchCanvas] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const iframeRef = useRef(null);

  const [currentFlow, setCurrentFlow] = useState({
    type: "company",
    businessArea: [],
    suggested: false,
    unified: false,
    template_id: null,
  });

  const [mainWorkFlowDetails, setMainWorkflowDetails] = useState({
    overviewData: {},
    edges: [],
    nodes: [],
    businessArea: [],
    filterEdges: [],
    filterNodes: [],
    additional: [],
  });

  const [preSelData, setPreSelData] = useState([]);
  const [additional, setAdditional] = useState([]);
  const [selectedTemplateDetails, setSelectTemplateDetails] = useState({
    open: false,
    data: null,
  });

  useEffect(() => {
    if (isFrame) {
      iframeRef?.current?.addEventListener("load", (e) => {
        const iframe = iframeRef.current;
        const currentLink = iframe?.contentWindow?.location.href;
        handleCurrentInnerPath(currentLink);
      });
    }
  }, [isFrame]);

  const onConnect = useCallback(
    (params) => {
      const node_target = params.target;
      const node_source = params.source;
      const node_target_details = nodes.find((n) => n.id === node_target);
      const node_source_details = nodes.find((n) => n.id === node_source);

      if (!node_target_details || !node_source_details) return;

      if (
        (node_source_details.type == "workflow" && node_target_details.type == "marketing") ||
        (node_target_details.type == "workflow" && node_source_details.type == "marketing")
      ) {
        handleConnectBA(node_target_details?.data?.value, node_source_details?.data?.value);
      } else if (node_source_details.type == "workflow" && node_target_details.type == "workflow") {
        if (node_source_details.id != node_target_details.id) {
          const parent_id = node_source_details.data?.value?.id;
          const child_id = node_target_details.data?.value?.id;
          const payload = {
            parent_workflow_id: parent_id,
            workflow_id: child_id,
          };
          manualChainedWorkflow(token, payload).then((res) => {
            if (res.success) {
              const current_chained_obj = { ...chainWorkFlow };
              const chain_no = res.data.chain_no;
              const chain_positon = res.data.chain_position;

              if (chain_no && chain_positon) {
                if (!current_chained_obj[chain_no]) {
                  current_chained_obj[chain_no] = {};
                }
                const current_chain_obj = current_chained_obj[chain_no];
                current_chain_obj[chain_positon] = {
                  workflow: res.data,
                  collapsed: res.data.is_card_collapsed,
                  canvas_view: res.data.canvas_view,
                };
                setChainWorkflow({ ...current_chained_obj, [chain_no]: current_chain_obj });
              }

              let newEdges = [...edges];
              let newNodes = [...nodes];
              newEdges.push({
                id: `wwe_${parent_id}_${child_id}`,
                source: node_source_details.id,
                target: node_target_details.id,
                type: "simplebezier",
                style: { stroke: "#3B82F6", strokeWidth: 2 },
                parent: [...node_source_details.parent_edge, node_source_details.id],
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 16,
                  height: 20,
                  color: "#61757B",
                },
              });
              newNodes = newNodes.map((node) => {
                if (node.id === node_target_details.id || node?.parent?.includes(node_target_details.id)) {
                  return {
                    ...node,
                    parent: [...node_source_details.parent, node_source_details.id],
                    is_last_chain_wf: true,
                  };
                } else if (node.id === node_source_details.id) {
                  return {
                    ...node,
                    is_last_chain_wf: false,
                  };
                }
                return node;
              });

              newEdges = newEdges.filter((edge) => edge.id !== `wfe_${node_target_details.data?.value?.id}`);

              setEdges(newEdges);
              setNodes(newNodes);
            }
          });
        }
      }
    },
    [setEdges, additional, nodes, overviewData],
  );

  useEffect(() => {
    if (currentPath) {
      setIsFrame(true);
    } else {
      setIsFrame(false);
    }
  }, [currentPath]);

  useEffect(() => {
    if (user && user?.view_business_overview_popup == 0) {
      setSidebarOpen(true);
      handleShowVideo(true);
      updateViewPopup(token, {
        view_business_overview_popup: "1",
      });
    }
  }, [user]);

  useEffect(() => {
    if (reportData && user) {
      prepareDatFunction(reportData);
    }
  }, [reportData, user]);

  useEffect(() => {
    if (user && user?.view_business_overview_popup == 0) {
      setSidebarOpen(true);
      handleShowVideo(true);
      updateViewPopup(token, {
        view_business_overview_popup: "1",
      });
    }
  }, [user]);

  useEffect(() => {
    if (reportData) {
      if (selectedBusinessTemplate > 0 && Number(selectedBusinessTemplate) != isNaN) {
        const details = {
          type: "template",
          id: currentTemplate.id,
          name: currentTemplate.title,
        };

        if (user.role_id == 17) {
          handleFlowData({ business_areas: currentTemplate.business_areas, topcard: details });
        } else {
          handleFlowDataNew({
            business_areas: currentTemplate.business_areas,
            topcard: details,
          });
        }
      } else {
        handleGetData();
      }
    }
  }, [selectedWorkflowType, selectedWorkflowStatus, startdate, enddate]);

  useEffect(() => {
    if (reportData) {
      const timeoutCurrent = setTimeout(() => {
        if (selectedBusinessTemplate > 0 && Number(selectedBusinessTemplate) != isNaN) {
          const details = {
            type: "template",
            id: currentTemplate.id,
            name: currentTemplate.title,
          };

          if (user.role_id == 17) {
            handleFlowData({ business_areas: currentTemplate.business_areas, topcard: details });
          } else {
            handleFlowDataNew({
              business_areas: currentTemplate.business_areas,
              topcard: details,
            });
          }
        } else {
          handleGetData(true);
        }
      }, 300);

      return () => {
        clearTimeout(timeoutCurrent);
      };
    }
  }, [searchCanvas]);

  const prepareDatFunction = (data) => {
    const tc_details = {
      type: "non-template",
      id: user?.id || 0,
      name: user?.company_name || user?.name || "Client",
      b_model: user?.business_description || "",
      avatar: `${getOriginUrl()}/${user?.avatar}`,
      canvas_x: user?.canvas_x,
      canvas_y: user?.canvas_y,
    };
    const businessArea = data?.business_areas || [];
    handleFlowData({ business_areas: businessArea, topcard: tc_details });
    setCurrentFlow({
      type: "company",
      suggested: selectedBusinessTemplate === "suggested" ? true : false,
      unified: selectedBusinessTemplate === "unified" ? true : false,
      businessArea: businessArea.map((ba) => ({ id: ba.id, name: ba.name })),
      template_id: null,
    });
  };

  function get_pos(tasks, start_pos_x, start_pos_y, limit, init) {
    let pos = { x: start_pos_x, y: start_pos_y };
    if (tasks.length == 0) return pos;
    const cardWidth = card_gap;
    const cardHeight = 300;

    if (pos.x + cardWidth > limit) {
      pos.x = init;
      pos.y += cardHeight;
    }

    const isOverlapping = (x, y) => {
      return tasks.some((tsk) => {
        return !(x + cardWidth <= tsk.x || tsk.x + cardWidth <= x || y + cardHeight <= tsk.y || tsk.y + cardHeight <= y);
      });
    };

    while (isOverlapping(pos.x, pos.y)) {
      if (pos.x + cardWidth < limit) {
        pos.x += cardWidth;
      } else {
        pos.x = start_pos_x;
        pos.y += cardHeight;
      }
    }

    return pos;
  }

  const handleFlowData = (data) => {
    const userDetails = data.topcard;

    const g_space = 16;
    const cardsize = 384;
    const finalnode = [];
    const finalEdges = [];
    const finalfilterNodes = [];
    const finalfilterEdges = [];

    let total_workflow = data.business_areas.reduce((acc, ba) => {
      return acc + ba.workflows.length;
    }, 0);

    let total_task = data.business_areas.reduce((acc, ba) => {
      return (
        acc +
        ba.workflows.reduce((acc, wf) => {
          let task_length = wf.tasks.filter((tsk) => tsk.canvas_y != 0 || tsk.canvas_x != 0);
          task_length = task_length >= 3 ? task_length : wf.tasks.length >= 3 ? 3 : wf.tasks.length;
          return acc + task_length;
        }, 0)
      );
    }, 0);

    let total_ba = data.business_areas.length;

    let actual_task_len = data.business_areas.reduce((acc, ba) => {
      return (
        acc +
        ba.workflows.reduce((acc, wf) => {
          return acc + (getRecurringStatus(wf).status == "Active" ? wf?.tasks?.length || 0 : 0);
        }, 0)
      );
    }, 0);

    let actua_wf_len = data.business_areas.reduce((acc, ba) => {
      return acc + ba.workflows?.filter((wf) => getRecurringStatus(wf).status == "Active").length;
    }, 0);

    let task_last_pos = -((total_task - 1) * 200);
    let wf_last_pos = Math.abs(task_last_pos) > (total_workflow - 1) * 200 ? task_last_pos : -((total_workflow - 1) * 200);
    let ba_last_pos = -((Math.max(total_ba || 1, total_task, total_workflow) - 1) * 200);
    const chain_data_obj = {};

    const details = {
      client: {
        pos_x: userDetails?.canvas_x || 0,
        pos_y: userDetails?.canvas_y || 0,
        collapsed: !!userDetails?.is_card_collapsed,
        data: userDetails,
        ba_max: 0,
        workflow_max: 0,
        task_max: 0,
        businessArea: data.business_areas.map((ba) => {
          let { workflows, ...only_ba } = ba;
          ba_last_pos =
            only_ba.canvas_y >= 1 && only_ba.canvas_y <= 500 && (only_ba.canvas_y != 0 || only_ba.canvas_x != 0) && only_ba.canvas_x + card_gap > ba_last_pos
              ? only_ba.canvas_x + cardsize + g_space
              : ba_last_pos;
          return {
            id: ba.id,
            pos_x: only_ba.canvas_x,
            pos_y: only_ba.canvas_y,
            collapsed: !!only_ba.is_card_collapsed,
            data: only_ba,
            workflows: workflows.map((wf) => {
              let { tasks, ...only_wf } = wf;

              if (wf.chain_no) {
                if (!chain_data_obj[wf.chain_no]) {
                  chain_data_obj[wf.chain_no] = {};
                }
                chain_data_obj[wf.chain_no][wf.chain_position] = {
                  workflow: wf,
                  collapsed: wf.is_card_collapsed,
                  canvas_view: wf.canvas_view,
                };
              }

              let task_length = tasks.filter((tsk) => tsk.canvas_y != 0 || tsk.canvas_x != 0);
              task_length = task_length >= 3 ? task_length : tasks.length >= 3 ? 3 : tasks.length;
              const wf_initRange = task_length ? task_length * (cardsize + g_space) : cardsize + g_space;
              workFlowValueRef.current[wf.id] = wf;
              wf_last_pos =
                only_wf.canvas_y >= 250 &&
                only_wf.canvas_y <= 850 &&
                (only_wf.canvas_y != 0 || only_wf.canvas_x != 0) &&
                only_wf.canvas_x + card_gap > wf_last_pos
                  ? only_wf.canvas_x - (task_length - 1) * 200 + wf_initRange
                  : wf_last_pos;
              return {
                id: wf.id,
                pos_x: only_wf.canvas_x,
                pos_y: only_wf.canvas_y,
                collapsed: !!only_wf.is_card_collapsed,
                data: wf,
                tasks: tasks.map((task) => {
                  return {
                    id: task.id,
                    pos_x: task.canvas_x,
                    pos_y: task.canvas_y,
                    data: task,
                  };
                }),
              };
            }),
          };
        }),
      },
    };

    finalnode.push({
      id: "cdn_1",
      type: "business",
      position: { x: userDetails?.canvas_x || 0, y: userDetails?.canvas_y || 0 },
      data: {
        value: details.client.data,
        collapsed: details.client.collapsed,
        total_ba: total_ba,
        total_workflow: actua_wf_len,
        total_task: actual_task_len,
      },
    });

    let is_client_collapsed = details.client.collapsed;
    details.client.businessArea = details.client.businessArea.map((ba) => {
      let in_wf = ba.workflows;
      let current_pos_y = ba.pos_y;
      let current_pos_x = ba.pos_x;
      let range = [];
      let active_wf = 0;

      let is_ba_collapsed = ba.collapsed;
      if (in_wf.length > 0) {
        const getweorflowProcess = (wf, current_pos_y, current_pos_x) => {
          if (wf?.data?.in_draft != 1 && wf?.data?.recurring_status != 2 && wf?.data?.recurring_status != 1) {
            active_wf += 1;
          }

          let in_tasks = wf.tasks;
          let task_length = in_tasks.filter((tsk) => tsk.pos_y != 0 || tsk.pos_x != 0);
          task_length = task_length >= 3 ? task_length : in_tasks.length >= 3 ? 3 : in_tasks.length;
          let is_wf_collapsed = wf.collapsed;

          let is_display = true;
          let is_collapsed = false;
          let last_chained_workflow = 0;
          let min_wf_list = [];
          let node_list = [];
          let la_wfid = "";
          if (wf.data.chain_no) {
            const chanin_no = wf.data.chain_no;
            const chain_position = wf.data.chain_position;
            Object.keys(chain_data_obj[chanin_no]).forEach((key) => {
              if (key < chain_position) {
                const workf_l_id = chain_data_obj[chanin_no][key]?.workflow?.id;
                min_wf_list.push(key);
                node_list.push(`wfn_${workf_l_id}`);
                last_chained_workflow = key > last_chained_workflow ? key : last_chained_workflow;
                if (Number(chain_data_obj[chanin_no][key]?.canvas_view) > 1) {
                  is_display = false;
                }
                if (chain_data_obj[chanin_no][key]?.collapsed) {
                  is_collapsed = true;
                }
              }
            });
            min_wf_list = min_wf_list.sort((a, b) => a - b);
          }
          setChainWorkflow(chain_data_obj);

          let edge_list = [];
          for (let i = 0; i < min_wf_list.length - 1; i++) {
            const source = chain_data_obj[wf.data.chain_no][min_wf_list[i]]?.workflow?.id || 0;
            const target = chain_data_obj[wf.data.chain_no][min_wf_list[i + 1]]?.workflow?.id || 0;
            edge_list.push(`wwe_${source}_${target}`);
          }
          const node_edges = [];
          if (is_display) {
            let wf_edge_details = {};
            const color_obj = getCurrentColor(wf.data);
            if (wf.data.chain_no && wf.data.chain_position > 1) {
              const la_wf_details = chain_data_obj[wf?.data?.chain_no][last_chained_workflow]?.workflow;
              if (
                la_wf_details &&
                filterWorkflows(la_wf_details, selectedWorkflowType, selectedWorkflowStatus, selectedBusinessTemplate, searchCanvas, startdate, enddate) ===
                  false
              ) {
                const parent_ba = chain_data_obj[wf.data.chain_no][1]?.workflow?.id || 0;
                if (parent_ba > 0) {
                  edge_list.push(`wfe_${parent_ba}`);
                }
                la_wfid = la_wf_details?.id || 0;
                wf_edge_details = {
                  id: `wwe_${la_wfid}_${wf.id}`,
                  source: `wfn_${la_wfid}`,
                  target: `wfn_${wf.id}`,
                  parent: [`bae_${ba.id}`, `cdn_1`, ...edge_list],
                  type: "simplebezier",
                  style: { stroke: "#703d55", strokeWidth: 2 },
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 16,
                    height: 20,
                    color: "#703d55",
                  },
                };

                node_edges.push(`wwe_${la_wfid}_${wf.id}`);
              } else {
                wf_edge_details = {
                  id: `wfe_${wf.id}`,
                  source: `ban_${wf.data.business_area_id}`,
                  target: `wfn_${wf.id}`,
                  parent: [`bae_${ba.id}`, `cdn_1`, ...edge_list],
                  type: "simplebezier",
                  style: { stroke: "#703d55", strokeWidth: 2 },
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 16,
                    height: 20,
                    color: "#703d55",
                  },
                };
                node_edges.push(`wfe_${wf.id}`);
              }
            } else {
              wf_edge_details = {
                id: `wfe_${wf.id}`,
                source: `ban_${wf.data.business_area_id}`,
                target: `wfn_${wf.id}`,
                parent: [`bae_${ba.id}`, `cdn_1`, ...edge_list],
                type: "simplebezier",
                style: { stroke: color_obj.background ?? "#3B82F6", strokeWidth: 2 },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 16,
                  height: 20,
                  color: color_obj.background ?? "#3B82F6",
                },
              };
              node_edges.push(`wfe_${wf.id}`);
            }

            if (wf.data.canvas_view === 2) {
              if (in_tasks.length > 0) {
                let task_length = in_tasks.filter((tsk) => tsk.pos_y != 0 || tsk.pos_x != 0);
                task_length = task_length >= 3 ? task_length : in_tasks.length >= 3 ? 3 : in_tasks.length;
                let task_init_pos_x_pre = current_pos_x - (task_length - 1) * 200;
                let task_init_pos_x = current_pos_x - (task_length - 1) * 200;
                const end_point = task_init_pos_x + task_length * card_gap;
                let task_init_pos_y = 850;
                const filled_pos = [];
                in_tasks.forEach((tsk) => {
                  if (tsk.pos_x != 0 || tsk.pos_y != 0) {
                    filled_pos.push({ x: tsk.pos_x, y: tsk.pos_y });
                  }
                });

                in_tasks = in_tasks.map((task) => {
                  let task_pos = {};
                  if (task.pos_x == 0 && task.pos_y == 0) {
                    task_pos = get_pos(filled_pos, task_init_pos_x, task_init_pos_y, end_point, task_init_pos_x_pre);
                    filled_pos.push(task_pos);
                  } else {
                    task_pos = { x: task.pos_x, y: task.pos_y };
                  }

                  const current_pos_y = task_pos.y;
                  const current_pos_x = task_pos.x;
                  task_init_pos_x = task_pos.x + cardsize + g_space;
                  task_init_pos_y = task_pos.y;

                  const edge_details = {
                    id: `te_${task.data.id}`,
                    source: `wfn_${wf.data.id}`,
                    target: `tn_${task.data.id}`,
                    parent: [`wfe_${wf.id}`, `bae_${ba.id}`, `cdn_1`, ...edge_list],
                    type: "simplebezier",
                    style: { stroke: "#3B82F6", strokeWidth: 2 },
                    markerEnd: {
                      type: MarkerType.ArrowClosed,
                      width: 16,
                      height: 20,
                      color: "#61757B",
                    },
                  };

                  const node_details = {
                    id: `tn_${task.data.id}`,
                    type: "task",
                    parent: [`wfn_${wf.id}`, `ban_${ba.id}`, `cdn_1`, ...node_list],
                    parent_edge: [`wfe_${wf.id}`, `bae_${ba.id}`, `cdn_1`],
                    position: { x: current_pos_x, y: current_pos_y },
                    data: { value: task.data },
                  };

                  if (is_wf_collapsed || is_ba_collapsed || is_client_collapsed || is_collapsed) {
                    finalfilterEdges.push(edge_details);
                    finalfilterNodes.push(node_details);
                  } else {
                    finalEdges.push(edge_details);
                    finalnode.push(node_details);
                  }
                  task.pos_x = current_pos_x;
                  task.pos_y = current_pos_y;

                  return task;
                });
              }
            } else if (wf.data.canvas_view === 3) {
              let is_transfered_workflow = wf.data.transferred_workflow_id;
              if (is_transfered_workflow) {
                let transfer_workflow_array = [];
                let transfer_workflow_edge_id_array = [];
                let transfer_workflow_node_id_array = [];

                function recur_transefer_workflow(wfin, parent_wf_id, parent_ba_id, crpx, crpy, parent_wf, is_init = false) {
                  const parents_edge = [`wfe_${parent_wf_id}`, `bae_${parent_ba_id}`, `cdn_1`].concat(transfer_workflow_edge_id_array);
                  const edge_details = {
                    id: `wfte_${parent_wf_id}_${wfin.id}`,
                    source: is_init ? `wfn_${parent_wf_id}` : transfer_workflow_node_id_array[transfer_workflow_node_id_array.length - 1],
                    target: `wftn_${parent_wf_id}_${wfin.id}`,
                    parent: parents_edge,
                    type: "simplebezier",
                    style: { stroke: "#3B82F6", strokeWidth: 2 },
                    markerEnd: {
                      type: MarkerType.ArrowClosed,
                      width: 16,
                      height: 20,
                      color: "#61757B",
                    },
                  };

                  const transferred_task = parent_wf.tasks.find((tsk) => tsk.id == parent_wf.transferred_by_task_id);

                  const parents_node = [...node_list, `wfn_${parent_wf_id}`, `ban_${parent_ba_id}`, `cdn_1`].concat(transfer_workflow_node_id_array);
                  const node_details = {
                    id: `wftn_${parent_wf_id}_${wfin.id}`,
                    type: "workflow",
                    parent: parents_node,
                    parent_edge: parents_edge,
                    position: { x: crpx, y: crpy },
                    data: {
                      value: { ...wfin, canvas_view: 1 },
                      transfer: true,
                      parentTranseferedTask: null,
                      transferred_task,
                      node_id: `wftn_${parent_wf_id}_${wfin.id}`,
                      edge_id: [`wfte_${parent_wf_id}_${wfin.id}`],
                      transfer_data: {
                        ex_ids: transfer_workflow_array,
                        ex_edges: transfer_workflow_edge_id_array,
                        ex_nodes: transfer_workflow_node_id_array,
                        current_pos_x: crpx,
                        current_pos_y: crpy,
                        parent_wf_id: parent_wf_id,
                        parent_ba_id: parent_ba_id,
                      },
                    },
                  };

                  if (is_wf_collapsed || is_ba_collapsed || is_client_collapsed) {
                    finalfilterEdges.push(edge_details);
                    finalfilterNodes.push(node_details);
                  } else {
                    finalEdges.push(edge_details);
                    finalnode.push(node_details);
                  }

                  transfer_workflow_array.push(wfin.id);
                  transfer_workflow_edge_id_array.push(`wfte_${parent_wf_id}_${wfin.id}`);
                  transfer_workflow_node_id_array.push(`wftn_${parent_wf_id}_${wfin.id}`);

                  const next_wf = workFlowValueRef.current[wfin.transferred_workflow_id];
                  if (next_wf && wfin.transferred_workflow_id && !transfer_workflow_array.includes(next_wf.id) && next_wf.id !== parent_wf_id) {
                    recur_transefer_workflow(next_wf, parent_wf_id, parent_ba_id, crpx, crpy + 300, wfin);
                  }
                }
                if (workFlowValueRef.current[is_transfered_workflow]) {
                  recur_transefer_workflow(workFlowValueRef.current[is_transfered_workflow], wf.id, ba.id, current_pos_x, current_pos_y + 300, wf.data, true);
                }
              }
            }

            let max_chained_pos = 0;
            let is_left_filter = [];
            let hang_status = "";
            if (wf.data.chain_no) {
              Object.keys(chain_data_obj[wf.data.chain_no])?.forEach((key) => {
                if (wf?.data?.chain_position < Number(key)) {
                  const workflow_details = chain_data_obj[wf.data.chain_no][key]?.workflow;
                  if (
                    filterWorkflows(workflow_details, selectedWorkflowType, selectedWorkflowStatus, selectedBusinessTemplate, searchCanvas, startdate, enddate)
                  ) {
                    is_left_filter.push(key);
                  }
                }
                if (Number(key) > max_chained_pos) {
                  max_chained_pos = Number(key);
                }
              });

              is_left_filter = is_left_filter.sort((a, b) => a - b);
              const new_workflow_details = is_left_filter.length > 0 ? chain_data_obj[wf.data.chain_no][is_left_filter[0]]?.workflow : null;
              hang_status = new_workflow_details ? getWorkflowStatus(new_workflow_details) : "";
            }

            const wf_node_details = {
              id: `wfn_${wf.id}`,
              type: "workflow",
              parent: [`ban_${ba.id}`, `cdn_1`, ...node_list],
              parent_edge: [`bae_${ba.id}`, `cdn_1`, ...edge_list],
              position: { x: current_pos_x, y: current_pos_y },
              wf_type: wf?.data?.workflow_type,
              data: {
                value: wf.data,
                collapsed: wf.collapsed,
                transfer: false,
                node_id: `wfn_${wf.id}`,
                edge_id: node_edges,
                is_last_chain_wf: max_chained_pos > 0 ? (max_chained_pos == wf?.data?.chain_position ? true : false) : true,
                hang_status: hang_status,
                edge_connect: la_wfid ? `wwe_${la_wfid}_${wf.id}` : "",
                transfer_data: {
                  parent_ba_id: ba.id,
                  current_pos_x,
                  current_pos_y,
                },
              },
            };
            if (is_ba_collapsed || is_client_collapsed || is_collapsed) {
              finalfilterEdges.push(wf_edge_details);
              finalfilterNodes.push(wf_node_details);
            } else {
              finalEdges.push(wf_edge_details);
              finalnode.push(wf_node_details);
            }
          }

          range.push(current_pos_x);
          return {
            ...wf,
            pos_x: current_pos_x,
            pos_y: current_pos_y,
            tasks: in_tasks,
          };
        };

        const current_ba_pos = { x: ba.pos_x, y: ba.pos_y };

        if (current_ba_pos.x == 0 && current_ba_pos.y == 0) {
          in_wf = in_wf.map((wf) => {
            if (filterWorkflows(wf?.data, selectedWorkflowType, selectedWorkflowStatus, selectedBusinessTemplate, searchCanvas, startdate, enddate)) {
              return wf;
            }

            let current_pos_y = wf.pos_y;
            let current_pos_x = wf.pos_x;

            if (wf.pos_x == 0 && wf.pos_y == 0) {
              current_pos_y = 500;
              let in_tasks = wf.tasks;
              let task_length = in_tasks.filter((tsk) => tsk.pos_y != 0 || tsk.pos_x != 0);
              task_length = task_length >= 3 ? task_length : in_tasks.length >= 3 ? 3 : in_tasks.length;
              const wf_initRange = task_length ? task_length * (cardsize + g_space) : cardsize + g_space;
              current_pos_x = total_workflow > 1 ? wf_last_pos + wf_initRange / 2 - (cardsize + g_space) / 2 : 0;
              wf_last_pos += wf_initRange;
            }

            return getweorflowProcess(wf, current_pos_y, current_pos_x);
          });
        } else {
          const in_wf_old = in_wf
            .filter((wf) => wf.pos_x != 0 && wf.pos_y != 0)
            .map((wf) => {
              if (filterWorkflows(wf?.data, selectedWorkflowType, selectedWorkflowStatus, selectedBusinessTemplate, searchCanvas, startdate, enddate)) {
                return wf;
              }

              let current_pos_y = wf.pos_y;
              let current_pos_x = wf.pos_x;
              return getweorflowProcess(wf, current_pos_y, current_pos_x);
            });

          const in_wf_new = in_wf
            .filter((wf) => wf.pos_x == 0 && wf.pos_y == 0)
            .map((wf) => {
              if (filterWorkflows(wf?.data, selectedWorkflowType, selectedWorkflowStatus, selectedBusinessTemplate, searchCanvas, startdate, enddate)) {
                return wf;
              }

              const max_range = current_ba_pos.x + 200 + ((cardsize + g_space) * 3) / 2;
              const min_range = current_ba_pos.x + 200 - ((cardsize + g_space) * 3) / 2;
              const positions = findNonOverlappingPosition({ min: min_range, max: max_range }, [...finalfilterNodes, ...finalnode], cardsize, 200);
              let current_pos_y = positions.y;
              let current_pos_x = positions.x;

              return getweorflowProcess(wf, current_pos_y, current_pos_x);
            });

          in_wf = [...in_wf_old, ...in_wf_new];
        }
      } else {
        range = [ba_last_pos];
      }

      if (ba.pos_x == 0 && ba.pos_y == 0) {
        current_pos_y = 250;
        const ba_x_min = range.length ? Math.min(...range) : 0;
        const ba_x_max = range.length ? Math.max(...range) : 0;

        current_pos_x = ba_x_max < ba_last_pos ? ba_last_pos : (ba_x_max + ba_x_min) / 2;
        ba_last_pos = current_pos_x + (384 + g_space);
      }

      const edge_details = {
        id: `bae_${ba.id}`,
        source: "cdn_1",
        target: `ban_${ba.id}`,
        type: "simplebezier",
        style: { stroke: "#3B82F6", strokeWidth: 2 },
        parent: [`cdn_1`],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 20,
          color: "#61757B",
        },
      };
      const node_details = {
        id: `ban_${ba.id}`,
        type: "marketing",
        parent: [`cdn_1`],
        parent_edge: [`cdn_1`],
        position: { x: current_pos_x, y: current_pos_y },
        data: { value: ba.data, collapsed: ba.collapsed, total_wf: ba.workflows.length, active_wf: active_wf },
      };

      if (is_client_collapsed) {
        finalfilterEdges.push(edge_details);
        finalfilterNodes.push(node_details);
      } else {
        finalEdges.push(edge_details);
        finalnode.push(node_details);
      }

      return {
        ...ba,
        pos_x: current_pos_x,
        pos_y: current_pos_y,
        workflows: in_wf,
      };
    });

    if (additional) {
      for (let cr_details of additional) {
        let in_tasks = cr_details.tasks;
        if (in_tasks.length > 0) {
          in_tasks = in_tasks.map((task) => {
            finalEdges.push({
              id: `te_${task.data.id}`,
              source: `wfn_${cr_details.id}`,
              target: `tn_${task.data.id}`,
              parent: [`wfe_${cr_details.id}`, `cdn_1`],
              type: "simplebezier",
              style: { stroke: "#3B82F6", strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 16,
                height: 20,
                color: "#61757B",
              },
            });

            finalnode.push({
              id: `tn_${task.data.id}`,
              type: "task",
              parent: [`wfn_${cr_details.id}`, `cdn_1`],
              parent_edge: [`wfe_${cr_details.id}`, `cdn_1`],
              position: { x: task.pos_x, y: task.pos_y },
              data: { value: task.data, collapsed: false, canvas_x: task.pos_x, canvas_y: task.pos_y, additional: true },
            });

            const details = {
              ...task,
              pos_x: task.pos_x,
              pos_y: task.pos_y,
            };
            return details;
          });

          finalnode.push({
            id: `wfn_${cr_details.id}`,
            type: "workflow",
            parent: [`cdn_1`],
            parent_edge: [`cdn_1`],
            position: { x: cr_details.pos_x, y: cr_details.pos_y },
            wf_type: cr_details?.data?.workflow_type,
            data: {
              value: cr_details.data,
              node_id: `wfn_${cr_details.id}`,
              collapsed: false,
              canvas_x: cr_details.pos_x,
              canvas_y: cr_details.pos_y,
              additional: true,
            },
          });

          if (cr_details.wf_last_pos > wf_last_pos) {
            wf_last_pos = cr_details.wf_last_pos;
          }
        }
      }
    }

    details.client.ba_max = ba_last_pos;
    details.client.task_max = task_last_pos;
    details.client.workflow_max = wf_last_pos;

    setOverviewData(details);
    setEdges(finalEdges);
    setNodes(finalnode);
    setFilterEdges(finalfilterEdges);
    setFilterNodes(finalfilterNodes);

    if (flowRef.current) {
      const { offsetWidth } = flowRef.current;
      const xPos = offsetWidth / 2;
      setViewport({ x: xPos - parseInt(details.client.pos_x) * 0.6 - 200, y: 100, zoom: 0.6 }, { duration: 500 });
    }
    handleSavePosition(
      details?.client?.businessArea.map((ba) => {
        return {
          id: ba.id,
          canvas_x: ba.pos_x,
          canvas_y: ba.pos_y,
          workflows: ba.workflows.map((wf) => {
            return {
              id: wf.id,
              canvas_x: wf.pos_x,
              canvas_y: wf.pos_y,
              tasks: wf?.tasks?.map((task) => {
                return {
                  id: task.id,
                  canvas_x: task.pos_x,
                  canvas_y: task.pos_y,
                };
              }),
            };
          }),
        };
      }),
    );
  };

  const handleFlowDataNew = (data) => {
    let additionalFlow = [];
    const userDetails = data.topcard;
    const g_space = 16;
    const cardsize = 384;
    const finalnode = [];
    const finalEdges = [];

    let total_workflow = data.business_areas.reduce((acc, ba) => {
      return acc + ba.workflows.length;
    }, 0);
    let total_task = data.business_areas.reduce((acc, ba) => {
      return (
        acc +
        ba.workflows.reduce((acc, wf) => {
          let task_length = wf.tasks.filter((tsk) => tsk.canvas_y != 0 || tsk.canvas_x != 0);
          task_length = task_length >= 3 ? task_length : wf.tasks.length >= 3 ? 3 : wf.tasks.length;
          return acc + task_length;
        }, 0)
      );
    }, 0);
    let total_ba = data.business_areas.length;

    let actual_task_len = data.business_areas.reduce((acc, ba) => {
      return (
        acc +
        ba.workflows.reduce((acc, wf) => {
          return acc + (getRecurringStatus(wf).status == "Active" ? wf?.tasks?.length || 0 : 0);
        }, 0)
      );
    }, 0);

    let actua_wf_len = data.business_areas.reduce((acc, ba) => {
      return acc + ba.workflows?.filter((wf) => getRecurringStatus(wf).status == "Active").length;
    }, 0);

    let task_last_pos = -((total_task - 1) * 200);
    let wf_last_pos = Math.abs(task_last_pos) > (total_workflow - 1) * 200 ? task_last_pos : -((total_workflow - 1) * 200);
    let ba_last_pos = -((Math.max(total_ba || 1, total_task, total_workflow) - 1) * 200);
    const chain_data_obj = {};

    const details = {
      client: {
        pos_x: 0,
        pos_y: 0,
        collapsed: false,
        data: userDetails,
        ba_max: 0,
        workflow_max: 0,
        task_max: 0,
        businessArea: data.business_areas.map((ba) => {
          let { workflows, ...only_ba } = ba;
          ba_last_pos =
            only_ba.canvas_y >= 1 && only_ba.canvas_y <= 500 && only_ba.canvas_y != 0 && only_ba.canvas_x != 0 && only_ba.canvas_x > ba_last_pos
              ? only_ba.canvas_x + cardsize + g_space
              : ba_last_pos;
          return {
            id: ba.id,
            pos_x: only_ba.canvas_x,
            pos_y: only_ba.canvas_y,
            collapsed: false,
            data: only_ba,
            workflows: workflows.map((wf) => {
              let { tasks, ...only_wf } = wf;

              if (wf.chain_no) {
                if (!chain_data_obj[wf.chain_no]) {
                  chain_data_obj[wf.chain_no] = {};
                }
                chain_data_obj[wf.chain_no][wf.chain_position] = {
                  workflow: wf,
                  collapsed: wf.is_card_collapsed,
                  canvas_view: wf.canvas_view,
                };
              }

              let task_length = tasks.filter((tsk) => tsk.canvas_y != 0 || tsk.canvas_x != 0);
              task_length = task_length >= 3 ? task_length : tasks.length >= 3 ? 3 : tasks.length;
              const wf_initRange = task_length ? task_length * (cardsize + g_space) : cardsize + g_space;
              workFlowValueRef.current[wf.id] = wf;

              wf_last_pos =
                only_wf.canvas_y >= 250 &&
                only_wf.canvas_y <= 850 &&
                (only_wf.canvas_y != 0 || only_wf.canvas_x != 0) &&
                only_wf.canvas_x + card_gap > wf_last_pos
                  ? only_wf.canvas_x - (task_length - 1) * 200 + wf_initRange
                  : wf_last_pos;
              return {
                id: wf.id,
                pos_x: only_wf.canvas_x,
                pos_y: only_wf.canvas_y,
                collapsed: false,
                data: wf,
                tasks: tasks.map((task) => {
                  return {
                    id: task.id,
                    pos_x: task.canvas_x,
                    pos_y: task.canvas_y,
                    data: task,
                  };
                }),
              };
            }),
          };
        }),
      },
    };

    finalnode.push({
      id: "cdn_1",
      type: "business",
      position: { x: 0, y: 0 },
      data: { value: details.client.data, collapsed: false, total_ba: total_ba, total_workflow: actua_wf_len, total_task: actual_task_len },
    });

    details.client.businessArea = details.client.businessArea.map((ba) => {
      let in_wf = ba.workflows;
      let current_pos_y = ba.pos_y;
      let current_pos_x = ba.pos_x;
      let range = [];
      let active_wf = 0;

      if (in_wf.length > 0) {
        const getweorflowProcess = (wf, current_pos_y, current_pos_x) => {
          if (wf?.data?.in_draft != 1 && wf?.data?.recurring_status != 2 && wf?.data?.recurring_status != 1) {
            active_wf += 1;
          }

          let in_tasks = wf.tasks;
          let task_length = in_tasks.filter((tsk) => tsk.pos_y != 0 || tsk.pos_x != 0);
          task_length = task_length >= 3 ? task_length : in_tasks.length >= 3 ? 3 : in_tasks.length;
          let is_wf_collapsed = wf.collapsed;

          let is_display = true;
          let is_collapsed = false;
          let last_chained_workflow = 0;
          let min_wf_list = [];
          let node_list = [];
          let la_wfid = "";
          if (wf.data.chain_no) {
            const chanin_no = wf.data.chain_no;
            const chain_position = wf.data.chain_position;
            Object.keys(chain_data_obj[chanin_no]).forEach((key) => {
              if (key < chain_position) {
                const workf_l_id = chain_data_obj[chanin_no][key]?.workflow?.id;
                min_wf_list.push(key);
                node_list.push(`wfn_${workf_l_id}`);
                last_chained_workflow = key > last_chained_workflow ? key : last_chained_workflow;
                if (Number(chain_data_obj[chanin_no][key]?.canvas_view) > 1) {
                  is_display = false;
                }
                if (chain_data_obj[chanin_no][key]?.collapsed) {
                  is_collapsed = true;
                }
              }
            });
            min_wf_list = min_wf_list.sort((a, b) => a - b);
          }
          setChainWorkflow(chain_data_obj);

          let edge_list = [];
          for (let i = 0; i < min_wf_list.length - 1; i++) {
            const source = chain_data_obj[wf.data.chain_no][min_wf_list[i]]?.workflow?.id || 0;
            const target = chain_data_obj[wf.data.chain_no][min_wf_list[i + 1]]?.workflow?.id || 0;
            edge_list.push(`wwe_${source}_${target}`);
          }
          const node_edges = [];
          if (is_display) {
            let wf_edge_details = {};
            const color_obj = getCurrentColor(wf.data);
            if (wf.data.chain_no && wf.data.chain_position > 1) {
              const la_wf_details = chain_data_obj[wf?.data?.chain_no][last_chained_workflow]?.workflow;
              if (
                la_wf_details &&
                filterWorkflows(la_wf_details, selectedWorkflowType, selectedWorkflowStatus, selectedBusinessTemplate, searchCanvas, startdate, enddate) ===
                  false
              ) {
                const parent_ba = chain_data_obj[wf.data.chain_no][1]?.workflow?.id || 0;
                if (parent_ba > 0) {
                  edge_list.push(`wfe_${parent_ba}`);
                }
                la_wfid = la_wf_details?.id || 0;
                wf_edge_details = {
                  id: `wwe_${la_wfid}_${wf.id}`,
                  source: `wfn_${la_wfid}`,
                  target: `wfn_${wf.id}`,
                  parent: [`bae_${ba.id}`, `cdn_1`, ...edge_list],
                  type: "simplebezier",
                  style: { stroke: color_obj.background ?? "#3B82F6", strokeWidth: 2 },
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 16,
                    height: 20,
                    color: "#61757B",
                  },
                };

                node_edges.push(`wwe_${la_wfid}_${wf.id}`);
              }
            }

            if (wf.data.canvas_view === 2) {
              if (in_tasks.length > 0) {
                let task_length = in_tasks.filter((tsk) => tsk.pos_y != 0 || tsk.pos_x != 0);
                task_length = task_length >= 3 ? task_length : in_tasks.length >= 3 ? 3 : in_tasks.length;
                let task_init_pos_x_pre = current_pos_x - (task_length - 1) * 200;
                let task_init_pos_x = current_pos_x - (task_length - 1) * 200;
                const end_point = task_init_pos_x + task_length * card_gap;
                let task_init_pos_y = 850;
                const filled_pos = [];
                in_tasks.forEach((tsk) => {
                  if (tsk.pos_x != 0 || tsk.pos_y != 0) {
                    filled_pos.push({ x: tsk.pos_x, y: tsk.pos_y });
                  }
                });

                in_tasks = in_tasks.map((task) => {
                  let task_pos = {};
                  if (task.pos_x == 0 && task.pos_y == 0) {
                    task_pos = get_pos(filled_pos, task_init_pos_x, task_init_pos_y, end_point, task_init_pos_x_pre);
                    filled_pos.push(task_pos);
                  } else {
                    task_pos = { x: task.pos_x, y: task.pos_y };
                  }

                  const current_pos_y = task_pos.y;
                  const current_pos_x = task_pos.x;
                  task_init_pos_x = task_pos.x + cardsize + g_space;
                  task_init_pos_y = task_pos.y;

                  const edge_details = {
                    id: `te_${task.data.id}`,
                    source: `wfn_${wf.data.id}`,
                    target: `tn_${task.data.id}`,
                    parent: [`wfe_${wf.id}`, `bae_${ba.id}`, `cdn_1`, ...edge_list],
                    type: "simplebezier",
                    style: { stroke: "#3B82F6", strokeWidth: 2 },
                    markerEnd: {
                      type: MarkerType.ArrowClosed,
                      width: 16,
                      height: 20,
                      color: "#61757B",
                    },
                  };

                  const node_details = {
                    id: `tn_${task.data.id}`,
                    type: "task",
                    parent: [`wfn_${wf.id}`, `ban_${ba.id}`, `cdn_1`, ...node_list],
                    parent_edge: [`wfe_${wf.id}`, `bae_${ba.id}`, `cdn_1`],
                    position: { x: current_pos_x, y: current_pos_y },
                    data: { value: task.data },
                  };

                  finalEdges.push(edge_details);
                  finalnode.push(node_details);

                  task.pos_x = current_pos_x;
                  task.pos_y = current_pos_y;

                  return task;
                });
              }
            } else if (wf.data.canvas_view === 3) {
              let is_transfered_workflow = wf.data.transferred_workflow_id;
              if (is_transfered_workflow) {
                let transfer_workflow_array = [];
                let transfer_workflow_edge_id_array = [];
                let transfer_workflow_node_id_array = [];

                function recur_transefer_workflow(wfin, parent_wf_id, parent_ba_id, crpx, crpy, parent_wf, is_init = false) {
                  const parents_edge = [`wfe_${parent_wf_id}`, `bae_${parent_ba_id}`, `cdn_1`].concat(transfer_workflow_edge_id_array);
                  const edge_details = {
                    id: `wfte_${parent_wf_id}_${wfin.id}`,
                    source: is_init ? `wfn_${parent_wf_id}` : transfer_workflow_node_id_array[transfer_workflow_node_id_array.length - 1],
                    target: `wftn_${parent_wf_id}_${wfin.id}`,
                    parent: parents_edge,
                    type: "simplebezier",
                    style: { stroke: "#3B82F6", strokeWidth: 2 },
                    markerEnd: {
                      type: MarkerType.ArrowClosed,
                      width: 16,
                      height: 20,
                      color: "#61757B",
                    },
                  };

                  const transferred_task = parent_wf.tasks.find((tsk) => tsk.id == parent_wf.transferred_by_task_id);

                  const parents_node = [...node_list, `wfn_${parent_wf_id}`, `ban_${parent_ba_id}`, `cdn_1`].concat(transfer_workflow_node_id_array);
                  const node_details = {
                    id: `wftn_${parent_wf_id}_${wfin.id}`,
                    type: "workflow",
                    parent: parents_node,
                    parent_edge: parents_edge,
                    position: { x: crpx, y: crpy },
                    data: {
                      value: { ...wfin, canvas_view: 1 },
                      transfer: true,
                      parentTranseferedTask: null,
                      transferred_task,
                      node_id: `wftn_${parent_wf_id}_${wfin.id}`,
                      edge_id: [`wfte_${parent_wf_id}_${wfin.id}`],
                      transfer_data: {
                        ex_ids: transfer_workflow_array,
                        ex_edges: transfer_workflow_edge_id_array,
                        ex_nodes: transfer_workflow_node_id_array,
                        current_pos_x: crpx,
                        current_pos_y: crpy,
                        parent_wf_id: parent_wf_id,
                        parent_ba_id: parent_ba_id,
                      },
                    },
                  };

                  if (is_wf_collapsed || is_ba_collapsed || is_client_collapsed) {
                    finalfilterEdges.push(edge_details);
                    finalfilterNodes.push(node_details);
                  } else {
                    finalEdges.push(edge_details);
                    finalnode.push(node_details);
                  }

                  transfer_workflow_array.push(wfin.id);
                  transfer_workflow_edge_id_array.push(`wfte_${parent_wf_id}_${wfin.id}`);
                  transfer_workflow_node_id_array.push(`wftn_${parent_wf_id}_${wfin.id}`);

                  const next_wf = workFlowValueRef.current[wfin.transferred_workflow_id];
                  if (next_wf && wfin.transferred_workflow_id && !transfer_workflow_array.includes(next_wf.id) && next_wf.id !== parent_wf_id) {
                    recur_transefer_workflow(next_wf, parent_wf_id, parent_ba_id, crpx, crpy + 300, wfin);
                  }
                }
                if (workFlowValueRef.current[is_transfered_workflow]) {
                  recur_transefer_workflow(workFlowValueRef.current[is_transfered_workflow], wf.id, ba.id, current_pos_x, current_pos_y + 300, wf.data, true);
                }
              }
            }

            let max_chained_pos = 0;
            let is_left_filter = [];
            let hang_status = "";
            if (wf.data.chain_no) {
              Object.keys(chain_data_obj[wf.data.chain_no])?.forEach((key) => {
                if (wf?.data?.chain_position < Number(key)) {
                  const workflow_details = chain_data_obj[wf.data.chain_no][key]?.workflow;
                  if (
                    filterWorkflows(workflow_details, selectedWorkflowType, selectedWorkflowStatus, selectedBusinessTemplate, searchCanvas, startdate, enddate)
                  ) {
                    is_left_filter.push(key);
                  }
                }
                if (Number(key) > max_chained_pos) {
                  max_chained_pos = Number(key);
                }
              });

              is_left_filter = is_left_filter.sort((a, b) => a - b);
              const new_workflow_details = is_left_filter.length > 0 ? chain_data_obj[wf.data.chain_no][is_left_filter[0]]?.workflow : null;
              hang_status = new_workflow_details ? getWorkflowStatus(new_workflow_details) : "";
            }

            const wf_node_details = {
              id: `wfn_${wf.id}`,
              type: "workflow",
              parent: [`ban_${ba.id}`, `cdn_1`, ...node_list],
              parent_edge: [`bae_${ba.id}`, `cdn_1`, ...edge_list],
              position: { x: current_pos_x, y: current_pos_y },
              wf_type: wf?.data?.workflow_type,
              data: {
                value: wf.data,
                collapsed: wf.collapsed,
                transfer: false,
                node_id: `wfn_${wf.id}`,
                edge_id: node_edges,
                is_last_chain_wf: max_chained_pos > 0 ? (max_chained_pos == wf?.data?.chain_position ? true : false) : true,
                hang_status: hang_status,
                edge_connect: la_wfid ? `wwe_${la_wfid}_${wf.id}` : "",
                transfer_data: {
                  parent_ba_id: ba.id,
                  current_pos_x,
                  current_pos_y,
                },
              },
            };

            finalnode.push(wf_node_details);
          }

          range.push(current_pos_x);
          return {
            ...wf,
            pos_x: current_pos_x,
            pos_y: current_pos_y,
            tasks: in_tasks,
          };
        };

        const current_ba_pos = { x: ba.pos_x, y: ba.pos_y };

        if (current_ba_pos.x == 0 && current_ba_pos.y == 0) {
          in_wf = in_wf.map((wf) => {
            if (filterWorkflowsTemplate(wf?.data, selectedWorkflowType, searchCanvas)) {
              return wf;
            }

            let current_pos_y = wf.pos_y;
            let current_pos_x = wf.pos_x;

            if (wf.pos_x == 0 && wf.pos_y == 0) {
              current_pos_y = 500;
              let in_tasks = wf.tasks;
              let task_length = in_tasks.filter((tsk) => tsk.pos_y != 0 || tsk.pos_x != 0);
              task_length = task_length >= 3 ? task_length : in_tasks.length >= 3 ? 3 : in_tasks.length;
              const wf_initRange = task_length ? task_length * (cardsize + g_space) : cardsize + g_space;
              current_pos_x = total_workflow > 1 ? wf_last_pos + wf_initRange / 2 - (cardsize + g_space) / 2 : 0;
              wf_last_pos += wf_initRange;
            }

            return getweorflowProcess(wf, current_pos_y, current_pos_x);
          });
        } else {
          const in_wf_old = in_wf
            .filter((wf) => wf.pos_x != 0 && wf.pos_y != 0)
            .map((wf) => {
              if (filterWorkflowsTemplate(wf?.data, selectedWorkflowType, searchCanvas)) {
                return wf;
              }

              let current_pos_y = wf.pos_y;
              let current_pos_x = wf.pos_x;
              return getweorflowProcess(wf, current_pos_y, current_pos_x);
            });

          const in_wf_new = in_wf
            .filter((wf) => wf.pos_x == 0 && wf.pos_y == 0)
            .map((wf) => {
              if (filterWorkflowsTemplate(wf?.data, selectedWorkflowType, searchCanvas)) {
                return wf;
              }

              const max_range = current_ba_pos.x + 200 + ((cardsize + g_space) * 3) / 2;
              const min_range = current_ba_pos.x + 200 - ((cardsize + g_space) * 3) / 2;
              const positions = findNonOverlappingPosition({ min: min_range, max: max_range }, [...finalfilterNodes, ...finalnode], cardsize, 200);
              let current_pos_y = positions.y;
              let current_pos_x = positions.x;

              return getweorflowProcess(wf, current_pos_y, current_pos_x);
            });

          in_wf = [...in_wf_old, ...in_wf_new];
        }
      } else {
        range = [ba_last_pos];
      }

      if (ba.pos_x == 0 && ba.pos_y == 0) {
        current_pos_y = 250;
        const ba_x_min = range.length ? Math.min(...range) : 0;
        const ba_x_max = range.length ? Math.max(...range) : 0;

        current_pos_x = ba_x_max < ba_last_pos ? ba_last_pos : (ba_x_max + ba_x_min) / 2;
        ba_last_pos = current_pos_x + (384 + g_space);
      }

      finalEdges.push({
        id: `bae_${ba.id}`,
        source: "cdn_1",
        target: `ban_${ba.id}`,
        type: "simplebezier",
        style: { stroke: "#3B82F6", strokeWidth: 2 },
        parent: [`cdn_1`],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 20,
          color: "#61757B",
        },
      });

      finalnode.push({
        id: `ban_${ba.id}`,
        type: "marketing",
        parent: [`cdn_1`],
        parent_edge: [`cdn_1`],
        position: { x: current_pos_x, y: current_pos_y },
        data: { value: ba.data, collapsed: false },
      });

      additionalFlow = additionalFlow.concat([...in_wf]);

      return {
        ...ba,
        pos_x: current_pos_x,
        pos_y: current_pos_y,
        workflows: [],
      };
    });

    details.client.ba_max = ba_last_pos;
    details.client.task_max = task_last_pos;
    details.client.workflow_max = wf_last_pos;

    setAdditional(additionalFlow);
    setOverviewData(details);
    setEdges(finalEdges);
    setNodes(finalnode);

    const { offsetWidth } = flowRef.current;
    const xPos = offsetWidth / 2;
    setViewport({ x: xPos - 200, y: 100, zoom: 0.6 }, { duration: 500 });
  };

  const handleNodeChange = (node) => {
    if (node.length == 1 && node[0].type == "position" && !node[0].dragging && (currentFlow.type != "template" || user.role_id == 17)) {
      const current_node = nodes.find((n) => n.id == node[0].id);

      if (current_node.data?.transfer || current_node.data?.additional) return;

      let save_data = null;
      let client_data = null;
      const current_data = { ...overviewData };
      if (node[0]?.id?.includes("ba") && current_node) {
        save_data = [
          {
            canvas_x: parseInt(node[0].position.x),
            canvas_y: parseInt(node[0].position.y),
            id: current_node.data?.value?.id,
          },
        ];

        current_data.client.businessArea = current_data.client.businessArea.map((ba) => {
          const val_x = ba.id == current_node.data?.value?.id ? parseInt(node[0].position.x) : ba.pos_x;
          const val_y = ba.id == current_node.data?.value?.id ? parseInt(node[0].position.y) : ba.pos_y;
          return {
            ...ba,
            pos_x: val_x,
            pos_y: val_y,
            data: {
              ...ba.data,
              canvas_x: val_x,
              canvas_y: val_y,
            },
          };
        });
      } else if (node[0]?.id?.includes("wf") && current_node) {
        const wf_data = current_node.data.value;
        const ba_data = current_data.client.businessArea.find((ba) => ba.id == wf_data.business_area_id);
        if (ba_data) {
          save_data = [
            {
              canvas_x: ba_data.pos_x,
              canvas_y: ba_data.pos_y,
              id: ba_data.id,
              workflows: ba_data.workflows.map((wf) => {
                if (wf.id == wf_data.id) {
                  return {
                    canvas_x: parseInt(node[0].position.x),
                    canvas_y: parseInt(node[0].position.y),
                    id: wf_data.id,
                  };
                }
                return {
                  canvas_x: wf.pos_x,
                  canvas_y: wf.pos_y,
                  id: wf.id,
                };
              }),
            },
          ];
        }

        current_data.client.businessArea = current_data.client.businessArea.map((ba) => {
          return {
            ...ba,
            workflows: ba.workflows.map((wf) => {
              const val_x = wf.id == wf_data.id ? parseInt(node[0].position.x) : wf.pos_x;
              const val_y = wf.id == wf_data.id ? parseInt(node[0].position.y) : wf.pos_y;
              return {
                ...wf,
                pos_x: val_x,
                pos_y: val_y,
                data: {
                  ...wf.data,
                  canvas_x: val_x,
                  canvas_y: val_y,
                },
              };
            }),
          };
        });
      } else if (node[0]?.id?.includes("tn") && current_node) {
        const task_data = current_node.data.value;
        const wf_node = nodes.find((n) => n.id == `wfn_${task_data.workflow_id}`);
        if (!wf_node) return;
        const wf_data = wf_node.data.value;
        const ba_data = current_data.client.businessArea.find((ba) => ba.id == wf_data.business_area_id);

        if (ba_data) {
          save_data = [
            {
              canvas_x: ba_data.pos_x,
              canvas_y: ba_data.pos_y,
              id: ba_data.id,
              workflows: ba_data.workflows.map((wf) => {
                if (wf.id == wf_data.id) {
                  return {
                    canvas_x: wf.pos_x,
                    canvas_y: wf.pos_y,
                    id: wf.id,
                    tasks: wf.tasks.map((task) => {
                      if (task.id == task_data.id) {
                        return {
                          canvas_x: parseInt(node[0].position.x),
                          canvas_y: parseInt(node[0].position.y),
                          id: task_data.id,
                        };
                      }
                      return {
                        canvas_x: task.pos_x,
                        canvas_y: task.pos_y,
                        id: task.id,
                      };
                    }),
                  };
                }
                return {
                  canvas_x: wf.pos_x,
                  canvas_y: wf.pos_y,
                  id: wf.id,
                };
              }),
            },
          ];
        }

        current_data.client.businessArea = current_data.client.businessArea.map((ba) => {
          return {
            ...ba,
            workflows: ba.workflows.map((wf) => {
              return {
                ...wf,
                tasks: wf.tasks.map((task) => {
                  const val_x = task.id == task_data.id ? parseInt(node[0].position.x) : task.pos_x;
                  const val_y = task.id == task_data.id ? parseInt(node[0].position.y) : task.pos_y;
                  return {
                    ...task,
                    pos_x: val_x,
                    pos_y: val_y,
                    data: {
                      ...task.data,
                      canvas_x: val_x,
                      canvas_y: val_y,
                    },
                  };
                }),
              };
            }),
          };
        });
      } else if (node[0]?.id == "cdn_1" && current_node) {
        client_data = {
          canvas_x: parseInt(node[0].position.x),
          canvas_y: parseInt(node[0].position.y),
        };
        current_data.client.pos_x = parseInt(node[0].position.x);
        current_data.client.pos_y = parseInt(node[0].position.y);
      }

      if (save_data || client_data) {
        setOverviewData(current_data);
        handleSavePosition(save_data, client_data);
      }

      setNodes((nds) =>
        nds.map((n) =>
          n.id === node[0].id
            ? {
                ...n,
                data: { ...n.data, value: { ...n.data.value, canvas_x: node[0].position.x, canvas_y: node[0].position.y } },
              }
            : n,
        ),
      );
    }
    onNodesChange(node);
  };

  const handleSavePosition = (business_area, client) => {
    saveCardPosition(token, { business_areas: business_area || [], ...(client ? { user: client } : {}) });
  };

  const handleCollapase = (type, value, ba_id, wf_id, transfer, transfer_data, wf_details, edge_connect) => {
    const { parent_wf_id } = transfer_data || {};
    let new_id = "";
    let edge_id = "";
    let overview_data = { ...overviewData };
    if (type === "ba") {
      new_id = `ban_${ba_id}`;
      edge_id = `bae_${ba_id}`;

      const find_index = overview_data.client.businessArea.findIndex((ba) => ba.id == ba_id);
      if (find_index !== -1) {
        overview_data.client.businessArea[find_index].collapsed = value;
        overview_data.client.businessArea[find_index].data = {
          ...overview_data.client.businessArea[find_index].data,
          is_card_collapsed: value,
        };
      }
    } else if (type === "wf") {
      const current_chain_no = wf_details?.chain_no;
      const current_chain_position = wf_details?.chain_position;
      const chain_data_obj = { ...chainWorkFlow };

      if (current_chain_no && current_chain_position) {
        let chaindetails = chain_data_obj[current_chain_no];
        chaindetails[current_chain_position] = {
          ...chaindetails[current_chain_position],
          collapsed: value ? 1 : 0,
        };
        chain_data_obj[current_chain_no] = chaindetails;
        setChainWorkflow(chain_data_obj);
      }

      new_id = transfer ? `wftn_${parent_wf_id}_${wf_id}` : `wfn_${wf_id}`;
      edge_id = transfer ? `wfte_${parent_wf_id}_${wf_id}` : `wfe_${wf_id}`;

      if (!transfer) {
        const find_index = overview_data.client.businessArea.findIndex((ba) => ba.id == ba_id);
        if (find_index !== -1) {
          const wf_index = overview_data.client.businessArea[find_index].workflows.findIndex((wf) => wf.id == wf_id);
          if (wf_index !== -1) {
            overview_data.client.businessArea[find_index].workflows[wf_index].collapsed = value;
            overview_data.client.businessArea[find_index].workflows[wf_index].data = {
              ...overview_data.client.businessArea[find_index].workflows[wf_index].data,
              is_card_collapsed: value,
            };
          }
        }
      }
    } else if (type === "client") {
      new_id = `cdn_1`;
      edge_id = `cdn_1`;

      overview_data.client.collapsed = value;
      overview_data.client.data = {
        ...overview_data.client.data,
        is_card_collapsed: value,
      };
    }

    let newNode = [...nodes];
    let newEdges = [...edges];
    let filteredEdges = [...filterEdges];
    let filteredNodes = [...filterNodes];
    if (value) {
      newEdges = newEdges.filter((edge) => {
        if (!edge.parent?.includes(edge_id) || (edge_connect && !edge.parent?.includes(edge_connect))) {
          return true;
        } else {
          filteredEdges.push(edge);
        }
      });
      newNode = newNode.filter((node) => {
        if (!node.parent?.includes(new_id)) {
          return true;
        } else {
          filteredNodes.push(node);
        }
      });
    } else {
      const conconcurrent = {};
      if (type === "client") {
        overview_data.client.businessArea.map((ba) => {
          let is_ba_collapsed = ba.collapsed;
          return {
            ...ba,
            workflows: ba.workflows.map((wf) => {
              let is_wf_collapsed = is_ba_collapsed ? is_ba_collapsed : wf.collapsed;
              conconcurrent[`wfn_${wf.id}`] = is_ba_collapsed;
              return {
                ...wf,
                tasks: wf.tasks.map((task) => {
                  conconcurrent[`tn_${task.id}`] = is_wf_collapsed;
                  return task;
                }),
              };
            }),
          };
        });
      } else if (type == "ba") {
        overview_data.client.businessArea.map((ba) => {
          if (ba.id == ba_id) {
            return {
              ...ba,
              workflows: ba.workflows.map((wf) => {
                let is_wf_collapsed = wf.collapsed;
                return {
                  ...wf,
                  tasks: wf?.tasks?.map((task) => {
                    conconcurrent[`tn_${task.id}`] = is_wf_collapsed;
                    return task;
                  }),
                };
              }),
            };
          }
          return ba;
        });
      }

      filteredEdges = filteredEdges.filter((edge) => {
        if (edge.parent.includes(edge_id) || (edge_connect && edge.parent?.includes(edge_connect))) {
          if (edge.id !== edge_id) newEdges.push(edge);
        } else {
          return true;
        }
      });
      filteredNodes = filteredNodes.filter((node) => {
        if (node.parent.includes(new_id) && !conconcurrent[node.id]) {
          newNode.push(node);
        } else {
          return true;
        }
      });
    }

    newNode = newNode.map((node) => {
      if (node.id === new_id) {
        return {
          ...node,
          data: {
            ...node.data,
            collapsed: value,
          },
        };
      }
      return node;
    });

    setEdges(newEdges);
    setNodes(newNode);
    setFilterNodes(filteredNodes);
    setFilterEdges(filteredEdges);
    setOverviewData(overview_data);
    if (!transfer) {
      handleSaveCollapse(overview_data);
    }
  };

  const handleSaveCollapse = (data) => {
    const details = data?.client?.businessArea.map((ba) => {
      return {
        id: ba.id,
        is_card_collapsed: ba.collapsed,
        workflows: ba.workflows.map((wf) => {
          return {
            id: wf.id,
            is_card_collapsed: wf.collapsed,
          };
        }),
      };
    });

    saveCardCollapse(token, { business_areas: details });
  };

  const handleBaModel = (baData, type, id) => {
    const new_data = { ...overviewData };
    let finalEdges = [...edges];
    let finalnode = [...nodes];
    let saveDetails = {
      id: 0,
      canvas_x: 0,
      canvas_y: 0,
    };
    let additional_ba = 0;
    if (type === "save") {
      new_data.client.businessArea.push({
        id: baData.id,
        pos_x: new_data.client.ba_max,
        pos_y: 250,
        collapsed: false,
        data: baData,
        workflow_max: 0,
        workflow_min: 0,
        workflows: [],
      });

      finalEdges.push({
        id: `bae_${baData.id}`,
        source: "cdn_1",
        target: `ban_${baData.id}`,
        type: "simplebezier",
        style: { stroke: "#3B82F6", strokeWidth: 2 },
        parent: [`cdn_1`],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 20,
          color: "#61757B",
        },
      });

      finalnode.push({
        id: `ban_${baData.id}`,
        type: "marketing",
        parent: [`cdn_1`],
        parent_edge: [`bae_${baData.id}`],
        position: { x: new_data.client.ba_max, y: 250 },
        data: { value: baData, collapsed: false },
      });

      saveDetails = {
        id: baData.id,
        canvas_x: new_data.client.ba_max,
        canvas_y: 250,
      };

      handleSavePosition([saveDetails]);
      new_data.client.ba_max += 384 + 16;
      additional_ba += 1;
    } else if (type === "edit") {
      const index = new_data.client.businessArea.findIndex((ba) => ba.id === id);
      if (index !== -1) {
        new_data.client.businessArea[index].data = baData;
        finalnode = finalnode.map((node) => {
          if (node.id === `ban_${id}`) {
            return {
              ...node,
              data: { collapsed: false, value: baData },
            };
          }
          return node;
        });
      }
    } else if (type === "delete") {
      new_data.client.businessArea = new_data.client.businessArea.filter((ba) => ba.id !== id);
      finalEdges = finalEdges.filter((edge) => !edge.parent?.includes(`bae_${id}`) && edge.id !== `bae_${id}`);
      finalnode = finalnode.filter((node) => !node.parent?.includes(`ban_${id}`) && node.id !== `ban_${id}`);
      resetLastPos(finalnode);
      additional_ba = -1;
    }
    finalnode = finalnode.map((node) => {
      if (node.id == "cdn_1") {
        return {
          ...node,
          data: {
            ...node.data,
            total_ba: Number(node?.data?.total_ba) + additional_ba,
          },
        };
      }
      return node;
    });
    resetLastPosBA(finalnode);
    setOverviewData(new_data);
    setEdges(finalEdges);
    setNodes(finalnode);
  };

  const handleUserProfile = (udata) => {
    const new_data = { ...overviewData };
    let finalnode = [...nodes];

    new_data.client.data = {
      ...new_data.client.data,
      ...udata,
    };

    finalnode = finalnode.map((n) => {
      if (n.id === "cdn_1") {
        return {
          ...n,
          data: {
            ...n.data,
            value: {
              ...n.data.value,
              ...udata,
            },
          },
        };
      }
      return n;
    });

    setOverviewData(new_data);
    setNodes(finalnode);
  };

  const handleTemplateConfirm = (type, t_data) => {
    if (type === "company") {
      if (selectedWorkflowStatus === "active") {
        handleGetData();
      } else {
        setSelectedWorkflowStatus("active");
      }
      setAdditional(mainWorkFlowDetails.additional);
      setPreSelData([]);
      setCurrentTemplate(null);
    } else if (type === "template") {
      if (currentFlow.type === "company" && !currentFlow.suggested) {
        setMainWorkflowDetails({
          additional: additional,
        });
      }

      const details = {
        type: "template",
        id: t_data.id,
        name: t_data.title,
      };
      let ba_data = [];
      if (t_data && t_data.business_areas && t_data.business_areas.length > 0) {
        ba_data = t_data.business_areas.map((val) => ({
          id: val.id,
          name: val.name,
        }));
      }

      setCurrentTemplate(t_data);

      setCurrentFlow({
        type: "template",
        suggested: false,
        unified: false,
        businessArea: ba_data,
        template_id: t_data.id,
      });

      if (user.role_id == 17) {
        handleFlowData({ business_areas: t_data.business_areas, topcard: details });
      } else {
        handleFlowDataNew({
          business_areas: t_data.business_areas,
          topcard: details,
        });
      }
    } else if (type === "suggested") {
      if (currentFlow.type === "company" && currentFlow.suggested === false) {
        setMainWorkflowDetails({ additional: additional });
      }
      if (selectedWorkflowStatus == "all") {
        handleGetData();
      } else {
        setSelectedWorkflowStatus("all");
      }
      setAdditional([]);
      setPreSelData([]);
      setCurrentTemplate(null);
    }
  };

  const handleConnectBA = async (wf, ba) => {
    const new_data = { ...overviewData };
    const ba_id = ba.id;
    const wf_id = wf.id;

    let actual_ba_index = new_data.client.businessArea.findIndex((bat) => bat.id === ba_id);

    let workflow_index = additional.findIndex((wft) => wft.id === wf_id);
    const cr_wf = additional[workflow_index];

    new_data.client.businessArea[actual_ba_index].workflows.push({
      ...cr_wf,
      data: {
        ...wf,
        business_area_id: ba_id,
      },
    });

    if (currentFlow.type === "company") {
      await handleSave([new_data.client.businessArea[actual_ba_index]]);
      setAdditional((prev) => prev.filter((wf) => wf.id !== wf_id));
      handleGetData();
      return;
    }

    setOverviewData(new_data);

    const task_edge_list = cr_wf.tasks?.map((task) => `te_${task.id}`);
    const task_node_list = cr_wf.tasks?.map((task) => `tn_${task.id}`);

    let newEdges = [...edges];
    if (newEdges.findIndex((edge) => edge.id === `wfe_${wf_id}`) === -1) {
      newEdges.push({
        id: `wfe_${wf_id}`,
        source: `ban_${ba_id}`,
        target: `wfn_${wf_id}`,
        type: "simplebezier",
        style: { stroke: "#3B82F6", strokeWidth: 2 },
        parent: [`bae_${ba_id}`, `cdn_1`],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 20,
          color: "#61757B",
        },
      });
    }

    newEdges = newEdges.map((edg) => {
      if (task_edge_list.includes(edg.id)) {
        return {
          ...edg,
          parent: [`bae_${ba_id}`, `cdn_1`, `wfe_${wf_id}`],
        };
      }
      return edg;
    });
    setEdges(newEdges);

    setNodes((per) => {
      const newNodes = per.map((node) => {
        if (node.id === `wfn_${wf_id}`) {
          return {
            ...node,
            parent: [`ban_${ba_id}`, `cdn_1`],
            parent_edge: [`bae_${ba_id}`, `cdn_1`],
            data: {
              ...node.data,
              value: {
                ...node.data.value,
                business_area_id: ba_id,
              },
            },
          };
        } else if (task_node_list.includes(node.id)) {
          return {
            ...node,
            parent: [`ban_${ba_id}`, `cdn_1`, `wfn_${wf_id}`],
            parent_edge: [`bae_${ba_id}`, `cdn_1`, `wfe_${wf_id}`],
          };
        }
        return node;
      });
      return newNodes;
    });

    setAdditional((prev) => prev.filter((wf) => wf.id !== wf_id));
  };

  const deleteConnectedBA = (wf) => {
    const new_data = { ...overviewData };
    const wf_id = wf.id;
    const ba_id = wf.business_area_id;
    let current_wf = wf;
    const ba_index = new_data.client.businessArea.findIndex((bat) => bat.id === ba_id);
    if (ba_index !== -1) {
      const wf_index = new_data.client.businessArea[ba_index].workflows.findIndex((wft) => wft.id === wf_id);
      if (wf_index !== -1) {
        current_wf = new_data.client.businessArea[ba_index].workflows[wf_index];
        new_data.client.businessArea[ba_index].workflows = new_data.client.businessArea[ba_index].workflows.filter((wft) => wft.id !== wf_id);
        setAdditional((prev) => [...prev, current_wf]);
      }
    }
    setOverviewData(new_data);

    const task_edge_list = current_wf.tasks?.map((task) => `te_${task.id}`);
    const task_node_list = current_wf.tasks?.map((task) => `tn_${task.id}`);

    let newEdges = edges.filter((edge) => edge.id !== `wfe_${wf_id}`);
    newEdges = newEdges.map((edg) => {
      if (task_edge_list.includes(edg.id)) {
        return {
          ...edg,
          parent: [`cdn_1`, `wfn_${wf_id}`],
        };
      }
      return edg;
    });
    setEdges(newEdges);

    setNodes((per) => {
      const newNodes = per.map((node) => {
        if (node.id === `wfn_${wf_id}`) {
          return {
            ...node,
            data: {
              ...node.data,
              parent: [`cdn_1`],
              value: {
                ...node.data.value,
                business_area_id: null,
              },
            },
          };
        } else if (task_node_list.includes(node.id)) {
          return {
            ...node,
            parent: [`cdn_1`, `wfn_${wf_id}`],
          };
        }
        return node;
      });
      return newNodes;
    });
  };

  const handleAddToCanvas = (type, ba_id, wf_id) => {
    const ov_data = { ...overviewData };
    let isAvailable = false;
    let details = {
      template_data: ov_data?.client?.data,
      data: [...preSelData],
    };

    if (type === "ba") {
      preSelData.forEach((ald) => {
        if (ald.type === "ba" && ald?.data?.id === ba_id) {
          ErrorToast("Business Area already added");
          isAvailable = true;
        }
      });

      if (!isAvailable) {
        const ba_index = ov_data.client.businessArea.findIndex((ba) => ba.id === ba_id);
        if (ba_index !== -1) {
          const ba_data = ov_data.client.businessArea[ba_index];
          const wf_data = ba_data.workflows;
          const new_wf = wf_data.filter((wf) => wf.data.business_area_id);
          const new_ba = {
            ...ba_data,
            workflows: new_wf,
          };

          details.data.push({ data: new_ba, type });
        }
      }
    } else if (type === "wf") {
      preSelData.forEach((ald) => {
        if (ald.type === "wf" && ald?.data?.id === wf_id) {
          ErrorToast("Workflow already added");
          isAvailable = true;
        }
      });

      if (!isAvailable) {
        let new_wf = null;
        if (ba_id) {
          const ba_index = ov_data.client.businessArea.findIndex((ba) => ba.id === ba_id);
          if (ba_index !== -1) {
            const ba_data = ov_data.client.businessArea[ba_index];
            const wf_data = ba_data.workflows;
            new_wf = wf_data.find((wf) => wf.id === wf_id);
          }
        } else {
          new_wf = additional.find((wf) => wf.id === wf_id);
        }

        new_wf = {
          ...new_wf,
          data: {
            ...new_wf.data,
            business_area_id: null,
          },
        };

        details.data.push({ type, data: new_wf });
      }
    }

    setSelectTemplateDetails({
      open: true,
      data: details,
    });
  };

  const handleAddMore = (data) => {
    setPreSelData(data);
  };

  const handleAddToCanvasFinal = async (data) => {
    const new_data = { ...mainWorkFlowDetails.overviewData };
    const finalEdges = [...mainWorkFlowDetails.edges];
    const finalnode = [...mainWorkFlowDetails.nodes];
    const additional_pre = [];
    const current_task = [];
    const current_wf = [];
    const current_ba = [];
    new_data.client.businessArea.map((ba) => {
      current_ba.push(ba.pos_x);
      return ba.workflows.map((wf) => {
        current_wf.push(wf.pos_x);
        return wf.tasks.map((task) => {
          current_task.push(task.pos_x);
        });
      });
    });

    const draf_promise = [];

    let max_task = current_task.length > 0 ? Math.max(...current_task) + card_gap : 0;
    let max_wf = new_data.client.workflow_max;
    let max_ba = new_data.client.ba_max;

    for (let i = 0; i < data.length; i++) {
      const { type, data: item } = data[i];
      if (type === "ba") {
        const cr_details = {
          id: item.id,
          pos_x: 0,
          pos_y: 0,
          collapsed: false,
          data: { ...item.data, is_draft: true },
          workflows: item.workflows.map((wf) => {
            return {
              id: wf.id,
              pos_x: 0,
              pos_y: 0,
              collapsed: false,
              data: { ...wf.data, is_draft: true },
              task_max: 0,
              task_min: 0,
              tasks: wf?.tasks.map((task) => {
                return {
                  id: task.id,
                  pos_x: 0,
                  pos_y: 0,
                  data: { ...task.data, is_draft: true },
                };
              }),
            };
          }),
        };

        let in_wf = cr_details.workflows;
        let range = [];
        if (in_wf.length > 0) {
          in_wf = in_wf.map((wf) => {
            let in_tasks = wf.tasks;

            let task_length = in_tasks.length >= 3 ? 3 : in_tasks.length;

            const wf_initRange = in_tasks.length ? in_tasks.length * card_gap : card_gap;
            const wf_x = max_wf + wf_initRange / 2 - card_gap / 2;

            const end_point = max_wf + task_length * card_gap;
            let task_init_pos_x_pre = max_wf;
            let task_init_pos_x = max_wf;
            let task_init_pos_y = 850;
            const filled_pos = [];

            if (in_tasks.length > 0) {
              in_tasks = in_tasks.map((task) => {
                const task_pos = get_pos(filled_pos, task_init_pos_x, task_init_pos_y, end_point, task_init_pos_x_pre);
                task_init_pos_x = task_pos.x + card_gap;
                task_init_pos_y = task_pos.y;
                filled_pos.push(task_pos);

                finalEdges.push({
                  id: `te_${task.data.id}`,
                  source: `wfn_${wf.data.id}`,
                  target: `tn_${task.data.id}`,
                  parent: [`wfe_${wf.id}`, `bae_${cr_details.id}`, `cdn_1`],
                  type: "simplebezier",
                  style: { stroke: "#3B82F6", strokeWidth: 2 },
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 16,
                    height: 20,
                    color: "#61757B",
                  },
                });
                finalnode.push({
                  id: `tn_${task.data.id}`,
                  type: "task",
                  parent: [`wfn_${wf.id}`, `ban_${cr_details.id}`, `cdn_1`],
                  parent_edge: [`wfe_${wf.id}`, `bae_${cr_details.id}`, `cdn_1`],
                  position: { x: task_pos.x, y: task_pos.y },
                  data: { value: task.data, collapsed: false, canvas_x: task_pos.x, canvas_y: task_pos.y },
                });
                const details = {
                  ...task,
                  pos_x: task_pos.x,
                  pos_y: task_pos.y,
                };
                return details;
              });
            }

            finalEdges.push({
              id: `wfe_${wf.id}`,
              source: `ban_${cr_details.id}`,
              target: `wfn_${wf.id}`,
              parent: [`bae_${cr_details.id}`, `cdn_1`],
              type: "simplebezier",
              style: { stroke: "#3B82F6", strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 16,
                height: 20,
                color: "#61757B",
              },
            });

            finalnode.push({
              id: `wfn_${wf.id}`,
              type: "workflow",
              parent: [`ban_${cr_details.id}`, `cdn_1`],
              parent_edge: [`bae_${cr_details.id}`, `cdn_1`],
              position: { x: wf_x, y: 500 },
              data: {
                value: wf.data,
                collapsed: false,
                canvas_x: wf_x,
                canvas_y: 500,
                node_id: `wfn_${wf.id}`,
                edge_id: [`wfe_${wf.id}`],
              },
            });
            max_wf += wf_initRange;
            range.push(wf_x);
            return {
              ...wf,
              pos_x: wf_x,
              pos_y: 500,
              task_max: max_task,
              tasks: in_tasks,
            };
          });
        } else {
          range = [max_ba];
        }

        const ba_x_min = range.length ? Math.min(...range) : 0;
        const ba_x_max = range.length ? Math.max(...range) : 0;

        const ba_x = ba_x_max < max_ba ? max_ba : (ba_x_max + ba_x_min) / 2;
        max_ba = ba_x + card_gap;

        finalEdges.push({
          id: `bae_${cr_details.id}`,
          source: "cdn_1",
          target: `ban_${cr_details.id}`,
          type: "simplebezier",
          style: { stroke: "#3B82F6", strokeWidth: 2 },
          parent: [`cdn_1`],
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 20,
            color: "#61757B",
          },
        });

        finalnode.push({
          id: `ban_${cr_details.id}`,
          type: "marketing",
          parent: [`cdn_1`],
          parent_edge: [`cdn_1`],
          position: { x: ba_x, y: 250 },
          data: { value: cr_details.data, collapsed: false, canvas_x: ba_x, canvas_y: 250 },
        });

        cr_details.workflows = in_wf;
        cr_details.pos_x = ba_x;
        cr_details.pos_y = 250;
        new_data.client.businessArea.push(cr_details);

        draf_promise.push(cr_details);
      } else if (type === "wf") {
        const cr_details = {
          id: item.id,
          pos_x: 0,
          pos_y: 0,
          wf_last_pos: max_wf,
          collapsed: false,
          data: { ...item.data, is_draft: true },
          task_max: 0,
          task_min: 0,
          tasks: item?.tasks.map((task) => {
            return {
              id: task.id,
              pos_x: 0,
              pos_y: 0,
              data: { ...task.data, is_draft: true },
            };
          }),
        };

        let in_tasks = cr_details.tasks;
        let task_length = in_tasks.length >= 3 ? 3 : in_tasks.length;

        const wf_initRange = task_length ? task_length * card_gap : card_gap;
        const wf_x = max_wf + wf_initRange / 2 - card_gap / 2;

        const end_point = max_wf + task_length * card_gap;
        let task_init_pos_x_pre = max_wf;
        let task_init_pos_x = max_wf;
        let task_init_pos_y = 850;
        const filled_pos = [];

        if (in_tasks.length > 0) {
          const task_pos = get_pos(filled_pos, task_init_pos_x, task_init_pos_y, end_point, task_init_pos_x_pre);
          task_init_pos_x = task_pos.x + card_gap;
          task_init_pos_y = task_pos.y;
          filled_pos.push(task_pos);

          in_tasks = in_tasks.map((task) => {
            finalEdges.push({
              id: `te_${task.data.id}`,
              source: `wfn_${cr_details.id}`,
              target: `tn_${task.data.id}`,
              parent: [`wfe_${cr_details.id}`, `cdn_1`],
              type: "simplebezier",
              style: { stroke: "#3B82F6", strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 16,
                height: 20,
                color: "#61757B",
              },
            });

            finalnode.push({
              id: `tn_${task.data.id}`,
              type: "task",
              parent: [`wfn_${cr_details.id}`, `cdn_1`],
              parent_edge: [`wfe_${cr_details.id}`, `cdn_1`],
              position: { x: task_pos.x, y: task_pos.y },
              data: { value: task.data, collapsed: false, canvas_x: task_pos.x, canvas_y: task_pos.y, additional: true },
            });
            const details = {
              ...task,
              pos_x: task_pos.x,
              pos_y: task_pos.y,
            };
            return details;
          });
        }

        finalnode.push({
          id: `wfn_${cr_details.id}`,
          type: "workflow",
          parent: [`cdn_1`],
          parent_edge: [`cdn_1`],
          position: { x: wf_x, y: 500 },
          data: {
            value: cr_details.data,
            collapsed: false,
            canvas_x: wf_x,
            canvas_y: 500,
            additional: true,
            node_id: `wfn_${cr_details.id}`,
          },
        });

        max_wf += wf_initRange;
        cr_details.pos_x = wf_x;
        cr_details.pos_y = 500;
        cr_details.wf_last_pos = max_wf;
        cr_details.tasks = in_tasks;
        additional_pre.push(cr_details);
      }
    }

    new_data.client.workflow_max = max_wf;
    setOverviewData(new_data);

    setCurrentFlow({
      type: "company",
      businessArea: [...mainWorkFlowDetails.businessArea, ...(draf_promise.length ? draf_promise.map((dp) => ({ id: dp?.id, name: dp?.data?.name })) : [])],
      suggested: false,
      unified: false,
      template_id: null,
    });

    setAdditional([...mainWorkFlowDetails.additional, ...additional_pre]);
    setEdges(finalEdges);
    setNodes(finalnode);

    if (draf_promise.length) {
      await handleSave(draf_promise).then(() => {
        handleGetData();
      });
    }
  };

  const handleSave = async (data) => {
    let new_data = data.map((crd) => {
      return {
        ...crd.data,
        is_card_collapsed: 0,
        canvas_x: crd.pos_x,
        canvas_y: crd.pos_y,
        workflows: crd.workflows
          .filter((wf) => wf?.data.is_draft)
          .map((wf) => {
            return {
              ...wf.data,
              is_card_collapsed: 0,
              canvas_x: wf.pos_x,
              canvas_y: wf.pos_y,
              tasks: wf.tasks.map((task) => {
                return {
                  ...task.data,
                  canvas_x: task.pos_x,
                  canvas_y: task.pos_y,
                };
              }),
            };
          }),
      };
    });
    return await saveDraftDetails(token, { business_areas: new_data });
  };

  const removeWorkflowCanvas = (wf_id) => {
    const workFlow = additional.find((wf) => wf.id === wf_id);
    const nodes_list = [`wfn_${wf_id}`];
    const edge_list = [];
    workFlow.tasks?.forEach((element) => {
      nodes_list.push(`tn_${element.data.id}`);
      edge_list.push(`te_${element.data.id}`);
    });

    const new_nodes = nodes.filter((node) => !nodes_list.includes(node.id));
    const new_edges = edges.filter((edge) => !edge_list.includes(edge.id));
    setEdges(new_edges);
    setNodes(new_nodes);
    resetLastPos(new_nodes);
    setAdditional((per) => per.filter((wf) => wf.id !== wf_id));
  };

  const deleteWorkFlow = async (wf_id) => {
    await deleteWorkFlowService(token, wf_id)
      .then((res) => {
        if (res.success) {
          handleGetData(true);
        }
      })
      .catch((err) => {
        ErrorToast(err.message);
      });
  };

  const handleDeleteTask = async (task_id) => {
    await deleteWorkFlowTask(token, task_id).then((res) => {
      handleGetData(true);
    });
  };

  const handleReloadCanvas = async () => {
    handleGetData(true);
  };

  const handleTWC = async (wfdetails, value, transfer, transfer_data, collapsed, edge_connect) => {
    const finalnode = [];
    const finalEdges = [];
    const finalfilterNodes = [];
    const finalfilterEdges = [];
    let edge_list = [];
    let node_list = [];
    const g_space = 16;
    const cardsize = 384;
    let overview_data = { ...overviewData };
    let transfer_workflow_array = transfer_data?.ex_ids || [];

    let transfer_workflow_edge_id_array = transfer_data?.ex_edges || [];
    let transfer_workflow_node_id_array = transfer_data?.ex_nodes || [];
    let { parent_ba_id, parent_wf_id, current_pos_x, current_pos_y } = transfer_data;

    const current_chain_no = wfdetails.chain_no;
    const current_chain_position = wfdetails.chain_position;
    const chain_data_obj = { ...chainWorkFlow };

    if (current_chain_no && current_chain_position) {
      let chaindetails = chain_data_obj[current_chain_no];
      chaindetails[current_chain_position] = {
        ...chaindetails[current_chain_position],
        canvas_view: value,
      };
      chain_data_obj[current_chain_no] = chaindetails;
      setChainWorkflow(chain_data_obj);
    }

    if (value === 1) {
      let is_client_collapsed = overview_data.client.collapsed;
      overview_data.client.businessArea?.forEach((ba) => {
        const current_workflows = ba.workflows;
        let is_ba_collapsed = ba.collapsed;
        current_workflows?.forEach((wf) => {
          node_list = [];
          edge_list = [];
          const wf_details = wf.data;
          let in_tasks = wf.tasks;
          let is_wf_collapsed = wf.collapsed;
          if (wf_details.chain_no && wf_details.chain_no == current_chain_no && wf_details.chain_position > current_chain_position) {
            let current_pos_y = wf.pos_y;
            let current_pos_x = wf.pos_x;

            let is_display = true;
            let is_collapsed = false;
            let last_chained_workflow = 0;
            let min_wf_list = [];
            let la_wfid = "";

            const chanin_no = wf_details.chain_no;
            const chain_position = wf_details.chain_position;
            const current_view = chain_data_obj[chanin_no][chain_position]?.canvas_view || 0;
            Object.keys(chain_data_obj[chanin_no]).forEach((key) => {
              if (key < chain_position) {
                const workf_l_id = chain_data_obj[chanin_no][key]?.workflow?.id;
                min_wf_list.push(key);
                node_list.push(`wfn_${workf_l_id}`);
                last_chained_workflow = key > last_chained_workflow ? key : last_chained_workflow;
                if (Number(chain_data_obj[chanin_no][key]?.canvas_view) > 1) {
                  is_display = false;
                }
                if (chain_data_obj[chanin_no][key]?.collapsed) {
                  is_collapsed = true;
                }
              }
            });

            min_wf_list = min_wf_list.sort((a, b) => a - b);

            for (let i = 0; i < min_wf_list.length - 1; i++) {
              const source = chain_data_obj[wf_details.chain_no][min_wf_list[i]]?.workflow?.id || 0;
              const target = chain_data_obj[wf_details.chain_no][min_wf_list[i + 1]]?.workflow?.id || 0;
              edge_list.push(`wwe_${source}_${target}`);
            }
            const node_edges = [];

            if (is_display) {
              let wf_edge_details = null;
              if (wf_details.chain_no && wf_details.chain_position > 1) {
                const parent_ba = chain_data_obj[wf_details.chain_no][1]?.workflow?.id || 0;
                if (parent_ba > 0) {
                  edge_list.push(`wfe_${parent_ba}`);
                }
                la_wfid = chain_data_obj[wf_details.chain_no][last_chained_workflow]?.workflow?.id || 0;
                wf_edge_details = {
                  id: `wwe_${la_wfid}_${wf.id}`,
                  source: `wfn_${la_wfid}`,
                  target: `wfn_${wf.id}`,
                  parent: [`bae_${ba.id}`, `cdn_1`, ...edge_list],
                  type: "simplebezier",
                  style: { stroke: "#3B82F6", strokeWidth: 2 },
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 16,
                    height: 20,
                    color: "#61757B",
                  },
                };
                node_edges.push(`wwe_${la_wfid}_${wf.id}`);
              } else {
                wf_edge_details = {
                  id: `wfe_${wf.id}`,
                  source: `ban_${wf_details.business_area_id}`,
                  target: `wfn_${wf.id}`,
                  parent: [`bae_${ba.id}`, `cdn_1`, ...edge_list],
                  type: "simplebezier",
                  style: { stroke: "#3B82F6", strokeWidth: 2 },
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 16,
                    height: 20,
                    color: "#61757B",
                  },
                };
                node_edges.push(`wfe_${wf.id}`);
              }

              if (current_view === 2) {
                if (in_tasks.length > 0) {
                  let task_length = in_tasks.filter((tsk) => tsk.pos_y != 0 || tsk.pos_x != 0);
                  task_length = task_length >= 3 ? task_length : in_tasks.length >= 3 ? 3 : in_tasks.length;
                  let task_init_pos_x_pre = current_pos_x - (task_length - 1) * 200;
                  let task_init_pos_x = current_pos_x - (task_length - 1) * 200;
                  const end_point = task_init_pos_x + task_length * card_gap;
                  let task_init_pos_y = 850;
                  const filled_pos = [];
                  in_tasks.forEach((tsk) => {
                    if (tsk.pos_x != 0 || tsk.pos_y != 0) {
                      filled_pos.push({ x: tsk.pos_x, y: tsk.pos_y });
                    }
                  });

                  in_tasks = in_tasks.map((task) => {
                    let task_pos = {};
                    if (task.pos_x == 0 && task.pos_y == 0) {
                      task_pos = get_pos(filled_pos, task_init_pos_x, task_init_pos_y, end_point, task_init_pos_x_pre);
                      filled_pos.push(task_pos);
                    } else {
                      task_pos = { x: task.pos_x, y: task.pos_y };
                    }

                    const current_pos_y = task_pos.y;
                    const current_pos_x = task_pos.x;
                    task_init_pos_x = task_pos.x + cardsize + g_space;
                    task_init_pos_y = task_pos.y;

                    const edge_details = {
                      id: `te_${task.data.id}`,
                      source: `wfn_${wf_details.id}`,
                      target: `tn_${task.data.id}`,
                      parent: [`wfe_${wf.id}`, `bae_${ba.id}`, `cdn_1`, ...edge_list],
                      type: "simplebezier",
                      style: { stroke: "#3B82F6", strokeWidth: 2 },
                      markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 16,
                        height: 20,
                        color: "#61757B",
                      },
                    };

                    const node_details = {
                      id: `tn_${task.data.id}`,
                      type: "task",
                      parent: [`wfn_${wf.id}`, `ban_${ba.id}`, `cdn_1`, ...node_list],
                      parent_edge: [`wfe_${wf.id}`, `bae_${ba.id}`, `cdn_1`],
                      position: { x: current_pos_x, y: current_pos_y },
                      data: { value: task.data },
                    };

                    if (is_wf_collapsed || is_ba_collapsed || is_client_collapsed) {
                      finalfilterEdges.push(edge_details);
                      finalfilterNodes.push(node_details);
                    } else {
                      finalEdges.push(edge_details);
                      finalnode.push(node_details);
                    }
                    task.pos_x = current_pos_x;
                    task.pos_y = current_pos_y;

                    return task;
                  });
                }
              } else if (current_view === 3) {
                let is_transfered_workflow = wf_details.transferred_workflow_id;
                if (is_transfered_workflow) {
                  let transfer_workflow_array = [];
                  let transfer_workflow_edge_id_array = [];
                  let transfer_workflow_node_id_array = [];

                  function recur_transefer_workflow(wfin, parent_wf_id, parent_ba_id, crpx, crpy, parent_wf, is_init = false) {
                    const parents_edge = [`wfe_${parent_wf_id}`, `bae_${parent_ba_id}`, `cdn_1`].concat(transfer_workflow_edge_id_array);
                    const edge_details = {
                      id: `wfte_${parent_wf_id}_${wfin.id}`,
                      source: is_init ? `wfn_${parent_wf_id}` : transfer_workflow_node_id_array[transfer_workflow_node_id_array.length - 1],
                      target: `wftn_${parent_wf_id}_${wfin.id}`,
                      parent: parents_edge,
                      type: "simplebezier",
                      style: { stroke: "#3B82F6", strokeWidth: 2 },
                      markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 16,
                        height: 20,
                        color: "#61757B",
                      },
                    };

                    const transferred_task = parent_wf.tasks.find((tsk) => tsk.id == parent_wf.transferred_by_task_id);

                    const parents_node = [...node_list, `wfn_${parent_wf_id}`, `ban_${parent_ba_id}`, `cdn_1`].concat(transfer_workflow_node_id_array);
                    const node_details = {
                      id: `wftn_${parent_wf_id}_${wfin.id}`,
                      type: "workflow",
                      parent: parents_node,
                      parent_edge: parents_edge,
                      position: { x: crpx, y: crpy },
                      data: {
                        value: { ...wfin, canvas_view: 1 },
                        transfer: true,
                        parentTranseferedTask: null,
                        transferred_task,
                        node_id: `wftn_${parent_wf_id}_${wfin.id}`,
                        edge_id: [`wfte_${parent_wf_id}_${wfin.id}`],
                        transfer_data: {
                          ex_ids: transfer_workflow_array,
                          ex_edges: transfer_workflow_edge_id_array,
                          ex_nodes: transfer_workflow_node_id_array,
                          current_pos_x: crpx,
                          current_pos_y: crpy,
                          parent_wf_id: parent_wf_id,
                          parent_ba_id: parent_ba_id,
                        },
                      },
                    };

                    if (is_wf_collapsed || is_ba_collapsed || is_client_collapsed) {
                      finalfilterEdges.push(edge_details);
                      finalfilterNodes.push(node_details);
                    } else {
                      finalEdges.push(edge_details);
                      finalnode.push(node_details);
                    }

                    transfer_workflow_array.push(wfin.id);
                    transfer_workflow_edge_id_array.push(`wfte_${parent_wf_id}_${wfin.id}`);
                    transfer_workflow_node_id_array.push(`wftn_${parent_wf_id}_${wfin.id}`);

                    const next_wf = workFlowValueRef.current[wfin.transferred_workflow_id];
                    if (next_wf && wfin.transferred_workflow_id && !transfer_workflow_array.includes(next_wf.id) && next_wf.id !== parent_wf_id) {
                      recur_transefer_workflow(next_wf, parent_wf_id, parent_ba_id, crpx, crpy + 300, wfin);
                    }
                  }
                  if (workFlowValueRef.current[is_transfered_workflow]) {
                    recur_transefer_workflow(
                      workFlowValueRef.current[is_transfered_workflow],
                      wf.id,
                      ba.id,
                      current_pos_x,
                      current_pos_y + 300,
                      wf_details,
                      true,
                    );
                  }
                }
              }

              const wf_node_details = {
                id: `wfn_${wf.id}`,
                type: "workflow",
                parent: [`ban_${ba.id}`, `cdn_1`, ...node_list],
                parent_edge: [`bae_${ba.id}`, `cdn_1`, ...edge_list],
                position: { x: current_pos_x, y: current_pos_y },
                data: {
                  value: wf_details,
                  collapsed: wf.collapsed,
                  transfer: false,
                  node_id: `wfn_${wf.id}`,
                  edge_id: node_edges,
                  edge_connect: la_wfid ? `wwe_${la_wfid}_${wf.id}` : "",
                  transfer_data: {
                    parent_ba_id: ba.id,
                    current_pos_x,
                    current_pos_y,
                  },
                },
              };
              if (is_ba_collapsed || is_client_collapsed || is_collapsed) {
                finalfilterEdges.push(wf_edge_details);
                finalfilterNodes.push(wf_node_details);
              } else {
                finalEdges.push(wf_edge_details);
                finalnode.push(wf_node_details);
              }
            }
          }
        });
      });
    } else {
      if (edge_connect) {
        const find_parent_edge = edges.find((edge) => edge.id === edge_connect);
        const find_perent_nodes = nodes.find((node) => node.id === find_parent_edge.target);
        edge_list = [...find_parent_edge.parent, edge_connect];
        node_list = [...find_perent_nodes.parent, find_perent_nodes.id];
      }

      if (value === 2) {
        const in_tasks = wfdetails.tasks || [];
        if (in_tasks.length > 0) {
          let task_length = in_tasks.filter((tsk) => tsk.canvas_x != 0 || tsk.canvas_y != 0);
          task_length = task_length >= 3 ? task_length : in_tasks.length >= 3 ? 3 : in_tasks.length;
          let task_init_pos_x_pre = current_pos_x - (task_length - 1) * 200;
          let task_init_pos_x = current_pos_x - (task_length - 1) * 200;
          const end_point = task_init_pos_x + task_length * card_gap;
          let task_init_pos_y = 850;
          const filled_pos = [];
          in_tasks.forEach((tsk) => {
            if (tsk.canvas_x != 0 || tsk.canvas_y != 0) {
              filled_pos.push({ x: tsk.canvas_x, y: tsk.canvas_y });
            }
          });

          in_tasks.map((task) => {
            let task_pos = {};

            if (task.canvas_x == 0 && task.canvas_y == 0) {
              task_pos = get_pos(filled_pos, task_init_pos_x, task_init_pos_y, end_point, task_init_pos_x_pre);
              filled_pos.push(task_pos);
            } else {
              task_pos = { x: task.canvas_x, y: task.canvas_y };
            }

            const current_pos_y = task_pos.y;
            const current_pos_x = task_pos.x;
            task_init_pos_x = task_pos.x + card_gap;
            task_init_pos_y = task_pos.y;

            const edge_details = {
              id: `${transfer ? `tre_${parent_wf_id}_${task.id}` : `te_${task.id}`}`,
              source: `${transfer ? `wftn_${parent_wf_id}_${wfdetails.id}` : `wfn_${wfdetails.id}`}`,
              target: `${transfer ? `trn_${parent_wf_id}_${task.id}` : `tn_${task.id}`}`,
              parent: [`wfe_${transfer ? parent_wf_id : wfdetails.id}`, `bae_${parent_ba_id}`, `cdn_1`, ...edge_list].concat(transfer_workflow_edge_id_array),
              type: "simplebezier",
              style: { stroke: "#3B82F6", strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 16,
                height: 20,
                color: "#61757B",
              },
            };

            const node_details = {
              id: `${transfer ? `trn_${parent_wf_id}_${task.id}` : `tn_${task.id}`}`,
              type: "task",
              parent: [`wfn_${transfer ? parent_wf_id : wfdetails.id}`, `ban_${parent_ba_id}`, `cdn_1`, ...node_list].concat(transfer_workflow_node_id_array),
              parent_edge: [`wfe_${transfer ? parent_wf_id : wfdetails.id}`, `bae_${parent_ba_id}`, `cdn_1`, ...edge_list].concat(
                transfer_workflow_edge_id_array,
              ),
              position: { x: current_pos_x, y: current_pos_y },
              data: { value: task, transfer: transfer, canvas_x: current_pos_x, canvas_y: current_pos_y, collapsed: false },
            };

            finalEdges.push(edge_details);
            finalnode.push(node_details);
          });
        }
      } else if (value === 3) {
        let is_transfered_workflow = wfdetails.transferred_workflow_id;
        if (is_transfered_workflow) {
          function recur_transefer_workflow(wf, parent_wf_id, parent_ba_id, crpx, crpy, parent_wf, is_init = false) {
            const parents_edge = [`wfe_${parent_wf_id}`, `bae_${parent_ba_id}`, `cdn_1`, ...edge_list].concat(transfer_workflow_edge_id_array);
            const edge_details = {
              id: `wfte_${parent_wf_id}_${wf.id}`,
              source: is_init ? `wfn_${parent_wf_id}` : transfer_workflow_node_id_array[transfer_workflow_node_id_array.length - 1],
              target: `wftn_${parent_wf_id}_${wf.id}`,
              parent: parents_edge,
              type: "simplebezier",
              style: { stroke: "#3B82F6", strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 16,
                height: 20,
                color: "#61757B",
              },
            };

            const transferred_task = parent_wf.tasks.find((tsk) => tsk.id == parent_wf.transferred_by_task_id);

            const parents_node = [`wfn_${parent_wf_id}`, `ban_${parent_ba_id}`, `cdn_1`, ...node_list].concat(transfer_workflow_node_id_array);
            const node_details = {
              id: `wftn_${parent_wf_id}_${wf.id}`,
              type: "workflow",
              parent: parents_node,
              parent_edge: parents_edge,
              position: { x: crpx, y: crpy },
              data: {
                value: { ...wf, canvas_view: 1 },
                transfer: true,
                transferred_task,
                node_id: `wftn_${parent_wf_id}_${wf.id}`,
                edge_id: [`wfte_${parent_wf_id}_${wf.id}`],
                transfer_data: {
                  ex_ids: transfer_workflow_array,
                  ex_edges: transfer_workflow_edge_id_array,
                  ex_nodes: transfer_workflow_node_id_array,
                  current_pos_x: crpx,
                  current_pos_y: crpy,
                  parent_wf_id: parent_wf_id,
                  parent_ba_id: parent_ba_id,
                },
              },
            };

            finalEdges.push(edge_details);
            finalnode.push(node_details);

            transfer_workflow_array.push(wf.id);
            transfer_workflow_edge_id_array.push(`wfte_${parent_wf_id}_${wf.id}`);
            transfer_workflow_node_id_array.push(`wftn_${parent_wf_id}_${wf.id}`);

            const next_wf = workFlowValueRef.current[wf.transferred_workflow_id];
            if (wf.transferred_workflow_id && !transfer_workflow_array.includes(next_wf.id) && next_wf.id !== parent_wf_id) {
              recur_transefer_workflow(next_wf, parent_wf_id, parent_ba_id, crpx, crpy + 300, wf);
            }
          }

          recur_transefer_workflow(
            workFlowValueRef.current[is_transfered_workflow],
            parent_wf_id || wfdetails.id,
            parent_ba_id,
            current_pos_x,
            current_pos_y + 300,
            wfdetails,
            !parent_wf_id ? true : false,
          );
        }
      } else if (value === 4) {
        const in_tasks = wfdetails.tasks || [];
        if (in_tasks.length > 0) {
          const current_member_node = [];
          const current_member_node_rep = [];
          let task_length = in_tasks.filter((tsk) => tsk.canvas_x != 0 || tsk.canvas_y != 0);
          task_length = task_length >= 3 ? task_length : in_tasks.length >= 3 ? 3 : in_tasks.length;
          let task_init_pos_x_pre = current_pos_x - (task_length - 1) * 200;
          let task_init_pos_x = current_pos_x - (task_length - 1) * 200;
          const end_point = task_init_pos_x + task_length * card_gap;
          let task_init_pos_y = 850;
          const filled_pos = [];
          in_tasks.forEach((tsk) => {
            const member_details = tsk?.user_member;
            if (member_details && member_details.id && !current_member_node_rep.includes(member_details.id)) {
              current_member_node_rep.push(member_details.id);
              if (tsk.canvas_x != 0 || tsk.canvas_y != 0) {
                filled_pos.push({ x: tsk.canvas_x, y: tsk.canvas_y });
              }
            }
          });

          in_tasks.map((task) => {
            const member_details = task?.user_member;
            if (member_details && member_details.id && !current_member_node.includes(member_details.id)) {
              current_member_node.push(member_details.id);

              let task_pos = {};

              if (task.canvas_x == 0 && task.canvas_y == 0) {
                task_pos = get_pos(filled_pos, task_init_pos_x, task_init_pos_y, end_point, task_init_pos_x_pre);
              } else {
                task_pos = { x: task.canvas_x, y: task.canvas_y };
              }

              const current_pos_y = task_pos.y;
              const current_pos_x = task_pos.x;
              task_init_pos_x = task_pos.x + card_gap;
              task_init_pos_y = task_pos.y;
              filled_pos.push(task_pos);

              const edge_details = {
                id: `${transfer ? `tre_${parent_wf_id}_${task.id}` : `te_${task.id}`}`,
                source: `${transfer ? `wftn_${parent_wf_id}_${wfdetails.id}` : `wfn_${wfdetails.id}`}`,
                target: `${transfer ? `trn_${parent_wf_id}_${task.id}` : `tn_${task.id}`}`,
                parent: [`wfe_${transfer ? parent_wf_id : wfdetails.id}`, `bae_${parent_ba_id}`, `cdn_1`, ...edge_list].concat(transfer_workflow_edge_id_array),
                type: "simplebezier",
                style: { stroke: "#3B82F6", strokeWidth: 2 },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 16,
                  height: 20,
                  color: "#61757B",
                },
              };

              const node_details = {
                id: `${transfer ? `trn_${parent_wf_id}_${task.id}` : `tn_${task.id}`}`,
                type: "user",
                parent: [`wfn_${transfer ? parent_wf_id : wfdetails.id}`, `ban_${parent_ba_id}`, `cdn_1`, ...node_list].concat(transfer_workflow_node_id_array),
                parent_edge: [`wfe_${transfer ? parent_wf_id : wfdetails.id}`, `bae_${parent_ba_id}`, `cdn_1`, ...edge_list].concat(
                  transfer_workflow_edge_id_array,
                ),
                position: { x: current_pos_x, y: current_pos_y },
                data: { value: task, transfer: transfer, canvas_x: current_pos_x, canvas_y: current_pos_y, collapsed: false },
              };

              finalEdges.push(edge_details);
              finalnode.push(node_details);
            }
          });
        }
      }
    }

    if (!transfer && collapsed) {
      const find_index = overview_data.client.businessArea.findIndex((ba) => ba.id == wfdetails.business_area_id);
      if (find_index !== -1) {
        const wf_index = overview_data.client.businessArea[find_index].workflows.findIndex((wf) => wf.id == wfdetails.id);
        if (wf_index !== -1) {
          overview_data.client.businessArea[find_index].workflows[wf_index].collapsed = false;
          overview_data.client.businessArea[find_index].workflows[wf_index].data = {
            ...overview_data.client.businessArea[find_index].workflows[wf_index].data,
            is_card_collapsed: false,
          };
        }
      }
    }

    let current_node = [...nodes];
    let current_edges = [...edges];
    current_node = current_node.filter(
      (node) => !node.parent || !node.parent.includes(transfer ? `wftn_${parent_wf_id}_${wfdetails.id}` : `wfn_${wfdetails.id}`),
    );

    current_edges = current_edges.filter(
      (edge) => !edge.parent || !edge.parent.includes(transfer ? `wfte_${parent_wf_id}_${wfdetails.id}` : `wfe_${wfdetails.id}`),
    );

    if (edge_connect) {
      current_edges = current_edges.filter((edge) => !edge.parent || !edge.parent.includes(edge_connect));
    }

    current_edges = current_edges.concat(finalEdges);
    current_node = current_node.concat(finalnode);

    current_node = current_node.map((node) => {
      if ((!transfer && node.id === `wfn_${wfdetails.id}`) || (transfer && node.id === `wftn_${parent_wf_id}_${wfdetails.id}`)) {
        return {
          ...node,
          data: {
            ...node.data,
            collapsed: false,
            value: {
              ...node.data.value,
              canvas_view: value,
            },
          },
        };
      }
      return node;
    });

    setNodes(current_node);
    setEdges(current_edges);
    setFilterEdges(finalfilterEdges);
    setFilterNodes(finalfilterNodes);
    setOverviewData(overview_data);

    if ((!transfer && currentFlow.type == "company") || user.role_id == 17) {
      await changeWorkFlowView(token, wfdetails.uuid, {
        canvas_view: value,
      });
      if (collapsed) {
        handleSaveCollapse(overview_data);
      }
    }
  };

  const resetLastPos = (new_nodes) => {
    let last_position = 0;
    let node = null;
    new_nodes.forEach((nds) => {
      if (nds.type == "workflow" && last_position <= nds.position.x && nds.position.y > 250 && nds.position.y < 850) {
        last_position = nds.position.x;
        node = nds;
      }
    });

    if (last_position > 0 || node) {
      const in_task = node.data.value?.tasks || [];
      let task_length = in_task.filter((tsk) => tsk.canvas_y != 0 || tsk.canvas_x != 0);
      task_length = task_length >= 3 ? task_length : in_task.length >= 3 ? 3 : in_task.length;
      const wf_initRange = task_length ? task_length * card_gap : card_gap;
      last_position = node.position.x - (task_length - 1) * 200 + wf_initRange;
      const new_data = { ...overviewData };
      new_data.client.workflow_max = last_position;
      setOverviewData(new_data);
    }
  };

  const resetLastPosBA = (new_nodes) => {
    let last_position = 0;
    let node = null;
    new_nodes.forEach((nds) => {
      if (nds.type == "marketing" && last_position <= nds.position.x && nds.position.y > 1 && nds.position.y < 500) {
        last_position = nds.position.x;
        node = nds;
      }
    });

    if (last_position > 0 || node) {
      last_position = node.position.x + card_gap;
      const new_data = { ...overviewData };
      new_data.client.ba_max = last_position;
      setOverviewData(new_data);
    }
  };

  const handleIFrameChange = (path) => {
    setCurrnetPath(`${getOriginUrl()}/${path}`);
    setIsFrame(true);
  };

  const handleRearrangeConfirm = (data) => {
    const userDetails = data.topcard;

    const g_space = 16;
    const cardsize = 384;
    const finalnode = [];
    const finalEdges = [];
    const finalfilterNodes = [];
    const finalfilterEdges = [];

    let total_workflow = data.business_areas.reduce((acc, ba) => {
      return acc + ba.workflows.filter((wf) => !wf.chain_no || wf.chain_position <= 1).length;
    }, 0);

    let total_task = data.business_areas.reduce((acc, ba) => {
      return (
        acc +
        ba.workflows.reduce((acc, wf) => {
          if (!wf.chain_no || wf.chain_position <= 1) {
            let task_length = wf.tasks.filter((tsk) => tsk.canvas_y != 0 || tsk.canvas_x != 0);
            task_length = task_length >= 3 ? task_length : wf.tasks.length >= 3 ? 3 : wf.tasks.length;
            return acc + task_length;
          }
        }, 0)
      );
    }, 0);

    let actual_task_len = data.business_areas.reduce((acc, ba) => {
      return (
        acc +
        ba.workflows.reduce((acc, wf) => {
          return acc + (wf?.tasks?.length || 0);
        }, 0)
      );
    }, 0);

    let total_ba = data.business_areas.length;

    let task_last_pos = -((total_task - 1) * 200);
    let wf_last_pos = Math.abs(task_last_pos) > (total_workflow - 1) * 200 ? task_last_pos : -((total_workflow - 1) * 200);
    let ba_last_pos = -((Math.max(total_ba || 1, total_task, total_workflow) - 1) * 200);

    const details = {
      client: {
        pos_x: 0,
        pos_y: 0,
        collapsed: !!userDetails?.is_card_collapsed,
        data: userDetails,
        ba_max: 0,
        workflow_max: 0,
        task_max: 0,
        businessArea: data.business_areas.map((ba) => {
          let { workflows, ...only_ba } = ba;
          return {
            id: ba.id,
            pos_x: 0,
            pos_y: 0,
            collapsed: !!only_ba.is_card_collapsed,
            data: only_ba,
            workflows: workflows.map((wf) => {
              let { tasks, ...only_wf } = wf;
              return {
                id: wf.id,
                pos_x: 0,
                pos_y: 0,
                collapsed: !!only_wf.is_card_collapsed,
                data: wf,
                tasks: tasks.map((task) => {
                  return {
                    id: task.id,
                    pos_x: 0,
                    pos_y: 0,
                    data: task,
                  };
                }),
              };
            }),
          };
        }),
      },
    };

    finalnode.push({
      id: "cdn_1",
      type: "business",
      position: { x: userDetails?.canvas_x || 0, y: userDetails?.canvas_y || 0 },
      data: {
        value: details.client.data,
        collapsed: details.client.collapsed,
        total_ba: total_ba,
        total_workflow: total_workflow,
        total_task: actual_task_len,
      },
    });

    let is_client_collapsed = details.client.collapsed;
    details.client.businessArea = details.client.businessArea.map((ba) => {
      let in_wf = ba.workflows;
      let current_pos_y = ba.pos_y;
      let current_pos_x = ba.pos_x;
      let range = [];
      let active_wf = 0;

      let is_ba_collapsed = ba.collapsed;
      if (in_wf.length > 0) {
        const chain_pos = {};
        in_wf = in_wf.map((wf) => {
          if (wf?.data?.workflow_type?.toLowerCase() != selectedWorkflowType && selectedWorkflowType !== "both") return wf;
          if (selectedWorkflowStatus === "active" && getRecurringStatus(wf.data).status !== "Active") return wf;
          if (selectedWorkflowStatus === "draft" && getRecurringStatus(wf.data).status !== "Draft") return wf;
          if (selectedWorkflowStatus === "ended" && getRecurringStatus(wf).status !== "Ended") return true;
          if (selectedWorkflowStatus === "archived" && getRecurringStatus(wf).status !== "Archived") return true;

          if (wf?.data?.is_completed != 1 && wf?.data?.in_draft != 1 && wf?.data?.recurring_status != 2 && wf?.data?.recurring_status != 1) {
            active_wf += 1;
          }

          if (wf.chain_no) {
            if (!chain_pos[wf.chain_no]) {
              chain_pos[wf.chain_no] = null;
            }
          }

          let in_tasks = wf.tasks;
          let task_length = in_tasks.length >= 3 ? 3 : in_tasks.length;
          let is_wf_collapsed = wf.collapsed;
          let current_pos_y = wf.pos_y;
          let current_pos_x = wf.pos_x;

          let is_display = true;
          let is_collapsed = false;
          let last_chained_workflow = 0;
          let min_wf_list = [];
          let node_list = [];
          let la_wfid = "";
          if (wf.data.chain_no) {
            const chanin_no = wf.data.chain_no;
            const chain_position = wf.data.chain_position;
            Object.keys(chainWorkFlow[chanin_no]).forEach((key) => {
              if (key < chain_position) {
                const workf_l_id = chainWorkFlow[chanin_no][key]?.workflow?.id;
                min_wf_list.push(key);
                node_list.push(`wfn_${workf_l_id}`);
                last_chained_workflow = key > last_chained_workflow ? key : last_chained_workflow;
                if (Number(chainWorkFlow[chanin_no][key]?.canvas_view) > 1) {
                  is_display = false;
                }
                if (chainWorkFlow[chanin_no][key]?.collapsed) {
                  is_collapsed = true;
                }
              }
            });
            min_wf_list = min_wf_list.sort((a, b) => a - b);
          }

          let edge_list = [];
          for (let i = 0; i < min_wf_list.length - 1; i++) {
            const source = chainWorkFlow[wf.data.chain_no][min_wf_list[i]]?.workflow?.id || 0;
            const target = chainWorkFlow[wf.data.chain_no][min_wf_list[i + 1]]?.workflow?.id || 0;
            edge_list.push(`wwe_${source}_${target}`);
          }
          const node_edges = [];
          if (is_display) {
            const color_obj = getCurrentColor(wf.data);
            if (current_pos_y == 0 && current_pos_x == 0) {
              current_pos_y = 500 + ((wf?.data?.chain_position || 1) - 1) * 300;
              if (!wf?.data?.chain_no) {
                const wf_initRange = task_length ? task_length * (cardsize + g_space) : cardsize + g_space;
                current_pos_x = total_workflow > 1 ? wf_last_pos + wf_initRange / 2 - (cardsize + g_space) / 2 : 0;
                wf_last_pos += wf_initRange;
              } else if (wf?.data?.chain_no && wf?.data?.chain_position == 1) {
                if (!chain_pos[wf.data.chain_no]) {
                  const wf_initRange = task_length ? task_length * (cardsize + g_space) : cardsize + g_space;
                  current_pos_x = total_workflow > 1 ? wf_last_pos + wf_initRange / 2 - (cardsize + g_space) / 2 : 0;
                  chain_pos[wf.data.chain_no] = current_pos_x;
                  wf_last_pos += wf_initRange;
                } else {
                  current_pos_x = chain_pos[wf.data.chain_no];
                }
              } else if (wf?.data?.chain_no && wf?.data?.chain_position > 1) {
                if (chain_pos[wf.data.chain_no]) {
                  current_pos_x = chain_pos[wf.data.chain_no];
                } else {
                  const wf_initRange =
                    chainWorkFlow[wf.data.chain_no][1]?.workflow?.data?.tasks?.length >= 3
                      ? 3
                      : chainWorkFlow[wf.data.chain_no][1]?.workflow?.data?.tasks?.length
                        ? chainWorkFlow[wf.data.chain_no][1]?.workflow?.data?.tasks?.length * (cardsize + g_space)
                        : cardsize + g_space;
                  current_pos_x = total_workflow > 1 ? wf_last_pos + wf_initRange / 2 - (cardsize + g_space) / 2 : 0;
                  chain_pos[wf.data.chain_no] = current_pos_x;
                  wf_last_pos += wf_initRange;
                }
              }
            }
            let wf_edge_details = null;
            if (wf.data.chain_no && wf.data.chain_position > 1) {
              const la_wf_details = chainWorkFlow[wf.data.chain_no][last_chained_workflow]?.workflow;
              if (
                la_wf_details &&
                filterWorkflows(la_wf_details, selectedWorkflowType, selectedWorkflowStatus, selectedBusinessTemplate, searchCanvas, startdate, enddate) ===
                  false
              ) {
                const parent_ba = chainWorkFlow[wf.data.chain_no][1]?.workflow?.id || 0;
                if (parent_ba > 0) {
                  edge_list.push(`wfe_${parent_ba}`);
                }
                la_wfid = la_wf_details?.id || 0;

                wf_edge_details = {
                  id: `wwe_${la_wfid}_${wf.id}`,
                  source: `wfn_${la_wfid}`,
                  target: `wfn_${wf.id}`,
                  parent: [`bae_${ba.id}`, `cdn_1`, ...edge_list],
                  type: "simplebezier",
                  style: { stroke: color_obj.background ?? "#3B82F6", strokeWidth: 2 },
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 16,
                    height: 20,
                    color: "#61757B",
                  },
                };

                node_edges.push(`wwe_${la_wfid}_${wf.id}`);
              } else {
                wf_edge_details = {
                  id: `wfe_${wf.id}`,
                  source: `ban_${wf.data.business_area_id}`,
                  target: `wfn_${wf.id}`,
                  parent: [`bae_${ba.id}`, `cdn_1`, ...edge_list],
                  type: "simplebezier",
                  style: { stroke: color_obj.background ?? "#3B82F6", strokeWidth: 2 },
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 16,
                    height: 20,
                    color: "#61757B",
                  },
                };
                node_edges.push(`wfe_${wf.id}`);
              }
            } else {
              wf_edge_details = {
                id: `wfe_${wf.id}`,
                source: `ban_${wf.data.business_area_id}`,
                target: `wfn_${wf.id}`,
                parent: [`bae_${ba.id}`, `cdn_1`, ...edge_list],
                type: "simplebezier",
                style: { stroke: color_obj.background ?? "#3B82F6", strokeWidth: 2 },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 16,
                  height: 20,
                  color: "#61757B",
                },
              };
              node_edges.push(`wfe_${wf.id}`);
            }

            if (wf.data.canvas_view === 2) {
              if (in_tasks.length > 0) {
                let task_length = in_tasks.length >= 3 ? 3 : in_tasks.length;
                let task_init_pos_x_pre = current_pos_x - (task_length - 1) * 200;
                let task_init_pos_x = current_pos_x - (task_length - 1) * 200;
                const end_point = task_init_pos_x + task_length * card_gap;
                let task_init_pos_y = 850;
                const filled_pos = [];
                in_tasks.forEach((tsk) => {
                  if (tsk.pos_x != 0 || tsk.pos_y != 0) {
                    filled_pos.push({ x: tsk.pos_x, y: tsk.pos_y });
                  }
                });

                in_tasks = in_tasks.map((task) => {
                  let task_pos = {};

                  if (task.pos_x == 0 && task.pos_y == 0) {
                    task_pos = get_pos(filled_pos, task_init_pos_x, task_init_pos_y, end_point, task_init_pos_x_pre);
                    filled_pos.push(task_pos);
                  } else {
                    task_pos = { x: task.pos_x, y: task.pos_y };
                  }

                  const current_pos_y = task_pos.y;
                  const current_pos_x = task_pos.x;
                  task_init_pos_x = task_pos.x + cardsize + g_space;
                  task_init_pos_y = task_pos.y;

                  const edge_details = {
                    id: `te_${task.data.id}`,
                    source: `wfn_${wf.data.id}`,
                    target: `tn_${task.data.id}`,
                    parent: [`wfe_${wf.id}`, `bae_${ba.id}`, `cdn_1`],
                    type: "simplebezier",
                    style: { stroke: "#3B82F6", strokeWidth: 2 },
                    markerEnd: {
                      type: MarkerType.ArrowClosed,
                      width: 16,
                      height: 20,
                      color: "#61757B",
                    },
                  };

                  const node_details = {
                    id: `tn_${task.data.id}`,
                    type: "task",
                    parent: [`wfn_${wf.id}`, `ban_${ba.id}`, `cdn_1`],
                    parent_edge: [`wfe_${wf.id}`, `bae_${ba.id}`, `cdn_1`],
                    position: { x: current_pos_x, y: current_pos_y },
                    data: { value: task.data },
                  };

                  if (is_wf_collapsed || is_ba_collapsed || is_client_collapsed) {
                    finalfilterEdges.push(edge_details);
                    finalfilterNodes.push(node_details);
                  } else {
                    finalEdges.push(edge_details);
                    finalnode.push(node_details);
                  }
                  task.pos_x = current_pos_x;
                  task.pos_y = current_pos_y;

                  return task;
                });
              }
            } else if (wf.data.canvas_view === 3) {
              let is_transfered_workflow = wf.data.transferred_workflow_id;
              if (is_transfered_workflow) {
                let transfer_workflow_array = [];
                let transfer_workflow_edge_id_array = [];
                let transfer_workflow_node_id_array = [];

                function recur_transefer_workflow(wfin, parent_wf_id, parent_ba_id, crpx, crpy, parent_wf, is_init = false) {
                  const parents_edge = [`wfe_${parent_wf_id}`, `bae_${parent_ba_id}`, `cdn_1`].concat(transfer_workflow_edge_id_array);
                  const edge_details = {
                    id: `wfte_${parent_wf_id}_${wfin.id}`,
                    source: is_init ? `wfn_${parent_wf_id}` : transfer_workflow_node_id_array[transfer_workflow_node_id_array.length - 1],
                    target: `wftn_${parent_wf_id}_${wfin.id}`,
                    parent: parents_edge,
                    type: "simplebezier",
                    style: { stroke: "#3B82F6", strokeWidth: 2 },
                    markerEnd: {
                      type: MarkerType.ArrowClosed,
                      width: 16,
                      height: 20,
                      color: "#61757B",
                    },
                  };

                  const transferred_task = parent_wf.tasks.find((tsk) => tsk.id == parent_wf.transferred_by_task_id);

                  const parents_node = [`wfn_${parent_wf_id}`, `ban_${parent_ba_id}`, `cdn_1`].concat(transfer_workflow_node_id_array);
                  const node_details = {
                    id: `wftn_${parent_wf_id}_${wfin.id}`,
                    type: "workflow",
                    parent: parents_node,
                    parent_edge: parents_edge,
                    position: { x: crpx, y: crpy },
                    data: {
                      value: { ...wfin, canvas_view: 1 },
                      transfer: true,
                      parentTranseferedTask: null,
                      transferred_task,
                      node_id: `wftn_${parent_wf_id}_${wfin.id}`,
                      edge_id: [`wfte_${parent_wf_id}_${wfin.id}`],
                      transfer_data: {
                        ex_ids: transfer_workflow_array,
                        ex_edges: transfer_workflow_edge_id_array,
                        ex_nodes: transfer_workflow_node_id_array,
                        current_pos_x: crpx,
                        current_pos_y: crpy,
                        parent_wf_id: parent_wf_id,
                        parent_ba_id: parent_ba_id,
                      },
                    },
                  };

                  if (is_wf_collapsed || is_ba_collapsed || is_client_collapsed) {
                    finalfilterEdges.push(edge_details);
                    finalfilterNodes.push(node_details);
                  } else {
                    finalEdges.push(edge_details);
                    finalnode.push(node_details);
                  }

                  transfer_workflow_array.push(wfin.id);
                  transfer_workflow_edge_id_array.push(`wfte_${parent_wf_id}_${wfin.id}`);
                  transfer_workflow_node_id_array.push(`wftn_${parent_wf_id}_${wfin.id}`);

                  const next_wf = workFlowValueRef.current[wfin.transferred_workflow_id];
                  if (next_wf && wfin.transferred_workflow_id && !transfer_workflow_array.includes(next_wf.id) && next_wf.id !== parent_wf_id) {
                    recur_transefer_workflow(next_wf, parent_wf_id, parent_ba_id, crpx, crpy + 300, wfin);
                  }
                }
                if (workFlowValueRef.current[is_transfered_workflow]) {
                  recur_transefer_workflow(workFlowValueRef.current[is_transfered_workflow], wf.id, ba.id, current_pos_x, current_pos_y + 300, wf.data, true);
                }
              }
            }

            let max_chained_pos = 0;
            if (wf.data.chain_no) {
              Object.keys(chainWorkFlow[wf.data.chain_no])?.forEach((key) => {
                if (Number(key) > max_chained_pos) {
                  max_chained_pos = Number(key);
                }
              });
            }

            const wf_node_details = {
              id: `wfn_${wf.id}`,
              type: "workflow",
              parent: [`ban_${ba.id}`, `cdn_1`, ...node_list],
              parent_edge: [`bae_${ba.id}`, `cdn_1`, ...edge_list],
              position: { x: current_pos_x, y: current_pos_y },
              wf_type: wf?.data?.workflow_type,
              data: {
                value: wf.data,
                collapsed: wf.collapsed,
                transfer: false,
                node_id: `wfn_${wf.id}`,
                edge_id: node_edges,
                is_last_chain_wf: max_chained_pos > 0 ? (max_chained_pos == wf?.data?.chain_position ? true : false) : true,
                edge_connect: la_wfid ? `wwe_${la_wfid}_${wf.id}` : "",
                transfer_data: {
                  parent_ba_id: ba.id,
                  current_pos_x,
                  current_pos_y,
                },
              },
            };

            if (is_ba_collapsed || is_client_collapsed || is_collapsed) {
              finalfilterEdges.push(wf_edge_details);
              finalfilterNodes.push(wf_node_details);
            } else {
              finalEdges.push(wf_edge_details);
              finalnode.push(wf_node_details);
            }
          }

          range.push(current_pos_x);
          return {
            ...wf,
            pos_x: current_pos_x,
            pos_y: current_pos_y,
            tasks: in_tasks,
          };
        });
      } else {
        range = [ba_last_pos];
      }

      if (ba.pos_x == 0 && ba.pos_y == 0) {
        current_pos_y = 250;
        const ba_x_min = range.length ? Math.min(...range) : 0;
        const ba_x_max = range.length ? Math.max(...range) : 0;

        current_pos_x = ba_x_max < ba_last_pos ? ba_last_pos : (ba_x_max + ba_x_min) / 2;
        ba_last_pos = current_pos_x + (384 + g_space);
      }

      const edge_details = {
        id: `bae_${ba.id}`,
        source: "cdn_1",
        target: `ban_${ba.id}`,
        type: "simplebezier",
        style: { stroke: "#3B82F6", strokeWidth: 2 },
        parent: [`cdn_1`],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 20,
          color: "#61757B",
        },
      };
      const node_details = {
        id: `ban_${ba.id}`,
        type: "marketing",
        parent: [`cdn_1`],
        parent_edge: [`cdn_1`],
        position: { x: current_pos_x, y: current_pos_y },
        data: { value: ba.data, collapsed: ba.collapsed, total_wf: ba.workflows.length, active_wf: active_wf },
      };

      if (is_client_collapsed) {
        finalfilterEdges.push(edge_details);
        finalfilterNodes.push(node_details);
      } else {
        finalEdges.push(edge_details);
        finalnode.push(node_details);
      }

      return {
        ...ba,
        pos_x: current_pos_x,
        pos_y: current_pos_y,
        workflows: in_wf,
      };
    });

    if (additional) {
      for (let cr_details of additional) {
        let in_tasks = cr_details.tasks;
        if (in_tasks.length > 0) {
          in_tasks = in_tasks.map((task) => {
            finalEdges.push({
              id: `te_${task.data.id}`,
              source: `wfn_${cr_details.id}`,
              target: `tn_${task.data.id}`,
              parent: [`wfe_${cr_details.id}`, `cdn_1`],
              type: "simplebezier",
              style: { stroke: "#3B82F6", strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 16,
                height: 20,
                color: "#61757B",
              },
            });

            finalnode.push({
              id: `tn_${task.data.id}`,
              type: "task",
              parent: [`wfn_${cr_details.id}`, `cdn_1`],
              parent_edge: [`wfe_${cr_details.id}`, `cdn_1`],
              position: { x: task.pos_x, y: task.pos_y },
              data: { value: task.data, collapsed: false, canvas_x: task.pos_x, canvas_y: task.pos_y, additional: true },
            });

            const details = {
              ...task,
              pos_x: task.pos_x,
              pos_y: task.pos_y,
            };
            return details;
          });

          finalnode.push({
            id: `wfn_${cr_details.id}`,
            type: "workflow",
            parent: [`cdn_1`],
            parent_edge: [`cdn_1`],
            position: { x: cr_details.pos_x, y: cr_details.pos_y },
            wf_type: cr_details?.data?.workflow_type,
            data: {
              value: cr_details.data,
              collapsed: false,
              canvas_x: cr_details.pos_x,
              canvas_y: cr_details.pos_y,
              additional: true,
              node_id: `wfn_${cr_details.id}`,
            },
          });

          if (cr_details.wf_last_pos > wf_last_pos) {
            wf_last_pos = cr_details.wf_last_pos;
          }
        }
      }
    }

    details.client.ba_max = ba_last_pos;
    details.client.task_max = task_last_pos;
    details.client.workflow_max = wf_last_pos;

    setOverviewData(details);
    setEdges(finalEdges);
    setNodes(finalnode);
    setFilterEdges(finalfilterEdges);
    setFilterNodes(finalfilterNodes);

    const { offsetWidth } = flowRef.current;
    const xPos = offsetWidth / 2;
    setViewport({ x: xPos - 200, y: 100, zoom: 0.6 }, { duration: 500 });
    handleSavePosition(
      details?.client?.businessArea.map((ba) => {
        return {
          id: ba.id,
          canvas_x: ba.pos_x,
          canvas_y: ba.pos_y,
          workflows: ba.workflows.map((wf) => {
            return {
              id: wf.id,
              canvas_x: wf.pos_x,
              canvas_y: wf.pos_y,
              tasks: wf?.tasks?.map((task) => {
                return {
                  id: task.id,
                  canvas_x: task.pos_x,
                  canvas_y: task.pos_y,
                };
              }),
            };
          }),
        };
      }),
    );
  };

  const handleRearrange = async () => {
    const data = await getReportingDetails(token);
    const reportDataNew = data?.data;
    if (reportDataNew) {
      const tc_details = {
        type: "non-template",
        id: user?.id || 0,
        name: user?.business_name || user?.name || "Client",
        b_model: user?.business_model || "",
        avatar: `${getOriginUrl()}/${user?.avatar}`,
        canvas_x: user?.canvas_x,
        canvas_y: user?.canvas_y,
      };
      const businessArea = reportDataNew?.business_areas || [];
      handleRearrangeConfirm({ business_areas: businessArea, topcard: tc_details });
      setSelectedBusinessTemplate("0");
      setCurrentFlow({
        type: "company",
        suggested: false,
        unified: false,
        businessArea: businessArea.map((ba) => ({ id: ba.id, name: ba.name })),
        template_id: null,
      });
    }
  };

  const handleCreateWorkFlow = async (data, ba_id, parent_id, position, node_id, edge_id, parent_data) => {
    const new_data = { ...overviewData };
    let finalEdges = [...edges];
    let finalnode = [...nodes];
    let workflow_last_pos = new_data.client.workflow_max;

    let new_position_x = 0;
    let new_position_y = 0;
    let parent_edges = [];
    let parent_nodes = [];

    parent_nodes = nodes?.find((node) => node.id == node_id)?.parent || [];
    parent_edges =
      edge_id && edge_id.length > 0
        ? edges
            ?.filter((edge) => edge_id.includes(edge.id))
            .map((edge) => edge.parent)
            .flat()
        : [];

    const current_chained_obj = { ...chainWorkFlow };
    const chain_no = data.chain_no;
    const chain_positon = data.chain_position;

    if (chain_no && chain_positon) {
      if (!current_chained_obj[chain_no]) {
        current_chained_obj[chain_no] = {};
      }
      const current_chain_obj = current_chained_obj[chain_no];
      current_chain_obj[chain_positon] = { workflow: data, collapsed: false, canvas_view: 1 };
      if (chain_positon <= 2) {
        current_chain_obj[1] = { workflow: parent_data, collapsed: false, canvas_view: 1 };
      }
      setChainWorkflow({ ...current_chained_obj, [chain_no]: current_chain_obj });
    }

    let wf_edge_details = null;

    if (parent_id) {
      new_position_x = position.pos_x;
      new_position_y = position.pos_y + 300;
      wf_edge_details = {
        id: `wwe_${parent_id}_${data.id}`,
        source: `wfn_${parent_id}`,
        target: `wfn_${data.id}`,
        parent: [...(edge_id ? edge_id : []), ...(parent_edges.length > 0 ? parent_edges : [`bae_${ba_id}`, `cdn_1`])],
        type: "simplebezier",
        style: { stroke: "#3B82F6", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 20,
          color: "#61757B",
        },
      };
    } else {
      new_position_x = workflow_last_pos;
      new_position_y = 500;
      new_data.client.workflow_max = workflow_last_pos += 400;
    }

    const new_business_area = new_data.client.businessArea.map((ba) => {
      if (ba.id == ba_id) {
        ba.workflows.push({
          collapsed: false,
          data: data,
          id: data.id,
          pos_x: new_position_x,
          pos_y: new_position_y,
        });

        if (!parent_id) {
          wf_edge_details = {
            id: `wfe_${data.id}`,
            source: `ban_${ba_id}`,
            target: `wfn_${data.id}`,
            parent: [...(edge_id ? edge_id : []), ...(parent_edges.length > 0 ? parent_edges : [`bae_${ba_id}`, `cdn_1`])],
            type: "simplebezier",
            style: { stroke: "#3B82F6", strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 16,
              height: 20,
              color: "#61757B",
            },
          };
        }

        const wf_node_details = {
          id: `wfn_${data.id}`,
          type: "workflow",
          parent: [`ban_${ba_id}`, `cdn_1`, ...(node_id ? [node_id] : []), ...parent_nodes],
          parent_edge: [...(edge_id ? edge_id : []), ...(parent_edges.length > 0 ? parent_edges : [`bae_${ba_id}`, `cdn_1`])],
          position: { x: new_position_x, y: new_position_y },
          wf_type: data?.workflow_type,
          data: {
            value: data,
            collapsed: false,
            transfer: false,
            node_id: `wfn_${data.id}`,
            is_last_chain_wf: true,
            edge_id: [`wfe_${data.id}`, ...(parent_id ? [`wwe_${parent_id}_${data.id}`] : [])],
            transfer_data: {
              parent_ba_id: ba_id,
              current_pos_x: new_position_x,
              current_pos_y: new_position_y,
            },
          },
        };
        finalEdges.push(wf_edge_details);
        finalnode.push(wf_node_details);
      }
      return ba;
    });

    finalnode = finalnode.map((node) => {
      if (node.id == node_id) {
        node.data = {
          ...node.data,
          collapsed: true,
          is_last_chain_wf: false,
          value: {
            ...node.data.value,
            chain_no: chain_no,
            chain_position: 1,
          },
        };
      }
      return node;
    });

    new_data.client.businessArea = new_business_area;

    setOverviewData(new_data);
    setEdges(finalEdges);
    setNodes(finalnode);

    const { offsetWidth } = flowRef.current;
    const xPos = offsetWidth / 2;
    setViewport({ x: xPos + 200 - new_position_x, y: -250 + 80, zoom: 1 }, { duration: 500 });
    handleSavePosition(
      new_data?.client?.businessArea.map((ba) => {
        return {
          id: ba.id,
          canvas_x: ba.pos_x,
          canvas_y: ba.pos_y,
          workflows: ba.workflows.map((wf) => {
            return {
              id: wf.id,
              canvas_x: wf.pos_x,
              canvas_y: wf.pos_y,
              tasks: wf?.tasks?.map((task) => {
                return {
                  id: task.id,
                  canvas_x: task.pos_x,
                  canvas_y: task.pos_y,
                };
              }),
            };
          }),
        };
      }),
    );
  };

  const handlePreviewSuggesation = (data) => {
    setCurrentWFDetails(data);
    setIsWorkFlowSidePan(true);
  };

  useEffect(() => {
    if (selectedBusinessTemplate === "pr_0") return;
    const selectedTemplate = businessTemplate.find((temp) => temp.id === selectedBusinessTemplate);

    if (selectedBusinessTemplate !== "suggested") {
      setIsWorkFlowSidePan(false);
    }

    if (selectedTemplate) {
      handleTemplateConfirm("template", selectedTemplate);
    } else {
      if (selectedBusinessTemplate === "suggested") {
        handleTemplateConfirm("suggested");
      } else {
        handleTemplateConfirm("company");
      }
    }
  }, [selectedBusinessTemplate]);

  const handleWorkflowTypeSelect = (workflow_type) => {
    setSelectedWorkflowType(workflow_type);
  };

  const handleWorkflowStatusSelect = (workflow_type) => {
    setSelectedWorkflowStatus(workflow_type);
  };

  useEffect(() => {
    if (currentFlow?.type === "company" && currentFlow?.suggested === false && currentFlow?.unified === false) {
      setSelectedBusinessTemplate("0");
    }
  }, [currentFlow]);

  const handleSearchChange = (value) => {
    setSearchCanvas(value);
  };

  const handleOpenLinkedWorkflow = async (chain_no, chain_pos) => {
    const chained_workflow = chainWorkFlow[chain_no][chain_pos];
    const current_wf_node = nodes.find((node) => node.id == `wfn_${chained_workflow.workflow.id}`);

    if (!current_wf_node) return;
    let { parent_wf_id } = current_wf_node?.data?.transfer_data;
    const transfer = current_wf_node?.data?.transfer;

    const current_ba = nodes.find((node) => node.id == `ban_${chained_workflow.workflow.business_area_id}`);
    const current_ba_pos = current_ba.position || { x: 0, y: 0 };
    const current_ba_details = current_ba.data?.value || {};
    let finalnode = [...nodes];
    let finalEdges = [...edges];

    finalnode = finalnode.filter(
      (node) =>
        !node.parent || !node.parent.includes(transfer ? `wftn_${parent_wf_id}_${chained_workflow.workflow.id}` : `wfn_${chained_workflow.workflow.id}`),
    );

    finalEdges = finalEdges.filter(
      (edge) =>
        !edge.parent || !edge.parent.includes(transfer ? `wfte_${parent_wf_id}_${chained_workflow.workflow.id}` : `wfe_${chained_workflow.workflow.id}`),
    );

    const workflow_queue = [];
    Object.keys(chainWorkFlow[chain_no]).forEach((key) => {
      if (Number(key) > chain_pos) {
        workflow_queue.push(chainWorkFlow[chain_no][key]?.workflow);
      }
    });

    if (workflow_queue.length > 0) {
      const isAlready = nodes.some((node) => workflow_queue.map((wf) => `wfn_${wf.id}`).includes(node.id));
      if (isAlready) {
        setNodes(finalnode);
        setEdges(finalEdges);
        return;
      }
    }

    const getweorflowProcess = (wf, current_pos_y, current_pos_x) => {
      let is_display = true;
      let last_chained_workflow = 0;
      let min_wf_list = [];
      let node_list = [];
      let la_wfid = "";
      if (wf.chain_no) {
        const chanin_no = wf.chain_no;
        const chain_position = wf.chain_position;
        Object.keys(chainWorkFlow[chanin_no]).forEach((key) => {
          if (key < chain_position) {
            const workf_l_id = chainWorkFlow[chanin_no][key]?.workflow?.id;
            min_wf_list.push(key);
            node_list.push(`wfn_${workf_l_id}`);
            last_chained_workflow = key > last_chained_workflow ? key : last_chained_workflow;
            // if (Number(chainWorkFlow[chanin_no][key]?.canvas_view) > 1) {
            //   is_display = false;
            // }
            // if (chainWorkFlow[chanin_no][key]?.collapsed) {
            //   is_collapsed = true;
            // }
          }
        });
        min_wf_list = min_wf_list.sort((a, b) => a - b);
      }

      let edge_list = [];
      for (let i = 0; i < min_wf_list.length - 1; i++) {
        const source = chainWorkFlow[wf.chain_no][min_wf_list[i]]?.workflow?.id || 0;
        const target = chainWorkFlow[wf.chain_no][min_wf_list[i + 1]]?.workflow?.id || 0;
        edge_list.push(`wwe_${source}_${target}`);
      }
      const node_edges = [];
      if (is_display) {
        let wf_edge_details = {};
        const color_obj = getCurrentColor(wf);
        if (wf.chain_no && wf.chain_position > 1) {
          const la_wf_details = chainWorkFlow[wf?.chain_no][last_chained_workflow]?.workflow;
          if (
            la_wf_details &&
            filterWorkflows(la_wf_details, selectedWorkflowType, selectedWorkflowStatus, selectedBusinessTemplate, searchCanvas, startdate, enddate) === false
          ) {
            const parent_ba = chainWorkFlow[wf.chain_no][1]?.workflow?.id || 0;
            if (parent_ba > 0) {
              edge_list.push(`wfe_${parent_ba}`);
            }
            la_wfid = la_wf_details?.id || 0;
            wf_edge_details = {
              id: `wwe_${la_wfid}_${wf.id}`,
              source: `wfn_${la_wfid}`,
              target: `wfn_${wf.id}`,
              parent: [`bae_${current_ba_details.id}`, `cdn_1`, ...edge_list],
              type: "simplebezier",
              style: { stroke: "#703d55", strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 16,
                height: 20,
                color: "#703d55",
              },
            };

            node_edges.push(`wwe_${la_wfid}_${wf.id}`);
          } else {
            wf_edge_details = {
              id: `wfe_${wf.id}`,
              source: `ban_${wf.business_area_id}`,
              target: `wfn_${wf.id}`,
              parent: [`bae_${current_ba_details.id}`, `cdn_1`, ...edge_list],
              type: "simplebezier",
              style: { stroke: "#703d55", strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 16,
                height: 20,
                color: "#703d55",
              },
            };
            node_edges.push(`wfe_${wf.id}`);
          }
        } else {
          wf_edge_details = {
            id: `wfe_${wf.id}`,
            source: `ban_${wf.business_area_id}`,
            target: `wfn_${wf.id}`,
            parent: [`bae_${current_ba_details.id}`, `cdn_1`, ...edge_list],
            type: "simplebezier",
            style: { stroke: color_obj.background ?? "#3B82F6", strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 16,
              height: 20,
              color: color_obj.background ?? "#3B82F6",
            },
          };
          node_edges.push(`wfe_${wf.id}`);
        }

        let max_chained_pos = 0;
        let is_left_filter = [];
        let hang_status = "";
        if (wf.chain_no) {
          Object.keys(chainWorkFlow[wf.chain_no])?.forEach((key) => {
            if (wf?.chain_position < Number(key)) {
              const workflow_details = chainWorkFlow[wf.chain_no][key]?.workflow;
              if (filterWorkflows(workflow_details, selectedWorkflowType, selectedWorkflowStatus, selectedBusinessTemplate, searchCanvas, startdate, enddate)) {
                is_left_filter.push(key);
              }
            }
            if (Number(key) > max_chained_pos) {
              max_chained_pos = Number(key);
            }
          });

          is_left_filter = is_left_filter.sort((a, b) => a - b);
          const new_workflow_details = is_left_filter.length > 0 ? chainWorkFlow[wf.chain_no][is_left_filter[0]]?.workflow : null;
          hang_status = new_workflow_details ? getWorkflowStatus(new_workflow_details) : "";
        }

        const wf_node_details = {
          id: `wfn_${wf.id}`,
          type: "workflow",
          parent: [`ban_${current_ba_details.id}`, `cdn_1`, ...node_list],
          parent_edge: [`bae_${current_ba_details.id}`, `cdn_1`, ...edge_list],
          position: { x: current_pos_x, y: current_pos_y },
          wf_type: wf?.workflow_type,
          data: {
            value: wf,
            collapsed: wf.collapsed,
            transfer: false,
            node_id: `wfn_${wf.id}`,
            edge_id: node_edges,
            is_last_chain_wf: max_chained_pos > 0 ? (max_chained_pos == wf?.chain_position ? true : false) : true,
            hang_status: hang_status,
            edge_connect: la_wfid ? `wwe_${la_wfid}_${wf.id}` : "",
            transfer_data: {
              parent_ba_id: current_ba_details.id,
              current_pos_x,
              current_pos_y,
            },
          },
        };

        finalEdges.push(wf_edge_details);
        finalnode.push(wf_node_details);
      }
    };

    workflow_queue
      .filter((wf) => wf.canvas_x != 0 && wf.canvas_y != 0)
      .map((wf) => {
        let current_pos_y = wf.canvas_y;
        let current_pos_x = wf.canvas_x;
        return getweorflowProcess(wf, current_pos_y, current_pos_x);
      });

    workflow_queue
      .filter((wf) => wf.canvas_x == 0 && wf.canvas_y == 0)
      .map((wf) => {
        const max_range = current_ba_pos.x + 200 + (400 * 3) / 2;
        const min_range = current_ba_pos.x + 200 - (400 * 3) / 2;
        const positions = findNonOverlappingPosition({ min: min_range, max: max_range }, [...filterNodes, ...nodes], 384, 200);
        let current_pos_y = positions.y;
        let current_pos_x = positions.x;

        return getweorflowProcess(wf, current_pos_y, current_pos_x);
      });

    setEdges(finalEdges);
    setNodes(finalnode);

    await changeWorkFlowView(token, chained_workflow?.workflow?.uuid, {
      canvas_view: 1,
    });
  };

  const handleWorkFlowChange = (node_id, value) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === node_id) {
          return {
            ...node,
            data: {
              ...node.data,
              value: {
                ...node.data.value,
                workflow_type: value,
              },
            },
          };
        }
        return node;
      }),
    );
  };

  return (
    <>
      <FlowContext.Provider
        value={{
          currentFlow,
          handleBaModel,
          handleCollapase,
          handleTemplateConfirm,
          handleConnectBA,
          deleteConnectedBA,
          handleAddToCanvas,
          handleUserProfile,
          handleAddToCanvasFinal,
          deleteWorkFlow,
          removeWorkflowCanvas,
          handleDeleteTask,
          handleTWC,
          handleIFrameChange,
          handleCreateWorkFlow,
          handlePreviewSuggesation,
          handleReloadCanvas,
          handleOpenLinkedWorkflow,
          handleWorkFlowChange,
        }}
      >
        {isFrame && currentPath ? (
          <>
            {!isMobile && (
              <div className="w-full bg-white h-full">
                <iframe
                  ref={iframeRef}
                  src={currentPath}
                  title="W3Schools Free Online Web Tutorials"
                  className="w-full h-[calc(100vh_-_48px)] md:h-[calc(100vh_-_64px)]"
                ></iframe>
              </div>
            )}
          </>
        ) : (
          <>
            <div ref={flowRef} className="w-full h-full">
              <div
                className={cn(
                  "absolute bottom-36 md:bottom-28 z-10 flex flex-col gap-2 w-fit right-8 xl:right-auto",
                  sidebarOpen
                    ? "left-auto xl:left-[calc(33.333%_+_20px)] 2xl:left-[calc(25%_+_20px)] xl:bottom-4 items-end xl:items-start"
                    : "lg:left-4 lg:bottom-4 items-end lg:items-start",
                )}
              >
                <button
                  onClick={() => {
                    const { offsetWidth } = flowRef.current;
                    const xPos = offsetWidth / 2;
                    setViewport({ x: xPos - 200, y: 100, zoom: 0.6 }, { duration: 500 });
                  }}
                  className="text-sm size-7 xl:size-8 p-1 flex items-center justify-center bg-[#49b8c1] text-white rounded-sm cursor-pointer hover:bg-[#49b8c1]/90 transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M7.5 3.75H6C5.40326 3.75 4.83097 3.98705 4.40901 4.40901C3.98705 4.83097 3.75 5.40326 3.75 6V7.5M16.5 3.75H18C18.5967 3.75 19.169 3.98705 19.591 4.40901C20.0129 4.83097 20.25 5.40326 20.25 6V7.5M20.25 16.5V18C20.25 18.5967 20.0129 19.169 19.591 19.591C19.169 20.0129 18.5967 20.25 18 20.25H16.5M7.5 20.25H6C5.40326 20.25 4.83097 20.0129 4.40901 19.591C3.98705 19.169 3.75 18.5967 3.75 18V16.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => zoomIn()}
                  className="text-sm size-7 xl:size-8 p-1 flex items-center justify-center bg-[#49b8c1] text-white rounded-sm cursor-pointer hover:bg-[#49b8c1]/90 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-full">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="text-sm size-7 xl:size-8 p-1 flex items-center justify-center bg-[#49b8c1] text-white rounded-sm cursor-pointer hover:bg-[#49b8c1]/90 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-full">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                  </svg>
                </button>
                <Collapsible>
                  <CollapsibleTrigger className="cursor-pointer text-xs text-white font-medium p-2 rounded-sm bg-[linear-gradient(59.62deg,_#62AAB4_46.18%,_#F08965_94.07%)] flex items-center gap-1">
                    {/* <SlidersHorizontal className="text-white block size-full" /> */}
                    <Funnel className="text-white block size-3" />
                    Filter
                  </CollapsibleTrigger>
                  <CollapsibleContent
                    className={cn(
                      "md:fixed absolute min-w-[68dvw] sm:min-w-[80dvw] md:min-w-auto md:w-full max-w-64 lg:max-w-80 top-auto justify-between flex flex-wrap gap-2.5 2xl:gap-3 items-center md:items-stretch z-10 bg-zinc-300/12 backdrop-blur-sm p-3 rounded-md border border-solid border-zinc-200/50",
                      !sidebarOpen
                        ? "right-0 md:right-auto left-auto md:left-4 lg:left-20 xl:max-w-[750px] 2xl:max-w-3xl bottom-10 lg:bottom-4"
                        : "bottom-[calc(25%_+_8px)] lg:bottom-1/4 xl:bottom-4 max-w-64 xl:max-w-80 right-9 md:right-16 xl:right-[35dvw] 2xl:right-[48dvw]",
                    )}
                  >
                    {!currentPath && (
                      <>
                        <div className="grow md:order-4 shadow-none rounded-lg flex flex-col gap-1 z-10 transition-all duration-300 ease-linear">
                          <Label className={"text-[10px] md:text-xs text-[#878E98] font-bold tracking-tight"}>Search</Label>
                          <Input
                            placeholder="Search Workflows"
                            value={searchCanvas}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="bg-white w-full text-[10px] sm:text-xs md:text-sm text-gray-700 font-normal placeholder:text-sm placeholder:font-normal placeholder:text-[#96979D] border border-[#D1DEE1] sm:border-gray-300 sm:shadow-sm"
                          />
                        </div>

                        <div className="grow shadow-none rounded-lg flex flex-col gap-1 z-10 transition-all duration-300 ease-linear">
                          <Label className={"text-[10px] md:text-xs text-[#878E98] font-bold tracking-tight"}>Workflow Type</Label>
                          <Select onValueChange={handleWorkflowTypeSelect} value={selectedWorkflowType}>
                            <SelectTrigger
                              className="w-full flex items-center justify-between rounded-md font-medium px-2 sm:px-3 md:px-4 py-1.5 md:py-2.5 bg-white border border-[#D1DEE1] sm:border-gray-300 sm:shadow-sm text-gray-700 hover:bg-gray-50 cursor-pointer text-[10px] sm:text-xs md:text-sm"
                              aria-label="workflow-type"
                            >
                              <SelectValue placeholder="Select a Workflow Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="both">All Workflows</SelectItem>
                              <SelectItem value="project">Project</SelectItem>
                              <SelectItem value="process">Process</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {currentFlow.type != "template" && selectedBusinessTemplate !== "suggested" && (
                          <div className="grow shadow-none rounded-lg flex flex-col gap-1 z-10 transition-all duration-300 ease-linear">
                            <Label className={"text-[10px] md:text-xs text-[#878E98] font-bold tracking-tight"}>Workflow Status</Label>
                            <Select onValueChange={handleWorkflowStatusSelect} value={selectedWorkflowStatus}>
                              <SelectTrigger
                                className="w-full flex items-center justify-between rounded-md font-medium px-2 sm:px-3 md:px-4 py-1.5 md:py-2.5 bg-white border border-[#D1DEE1] sm:border-gray-300 sm:shadow-sm text-gray-700 hover:bg-gray-50 cursor-pointer text-[10px] sm:text-xs md:text-sm"
                                aria-label="workflow-type"
                              >
                                <SelectValue placeholder="Select a Workflow Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="paused">Paused</SelectItem>
                                <SelectItem value="draft">Drafts</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                                <SelectItem value="deleted">Deleted</SelectItem>
                                <SelectItem value="all">All Workflows</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="grow shadow-none rounded-lg flex flex-col gap-1 z-10 transition-all duration-300 ease-linear">
                          <Label className={"text-[10px] md:text-xs text-[#878E98] font-bold tracking-tight"}>From Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                data-empty={!startdate}
                                className="data-[empty=true]:text-muted-foreground w-full 2xl:w-56 justify-start text-left font-normal"
                              >
                                <CalendarIcon />
                                {startdate ? format(startdate, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={startdate} onSelect={setStartDate} />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="grow shadow-none rounded-lg flex flex-col gap-1 z-10 transition-all duration-300 ease-linear">
                          <Label className={"text-[10px] md:text-xs text-[#878E98] font-bold tracking-tight"}>To Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                data-empty={!enddate}
                                className="data-[empty=true]:text-muted-foreground w-full 2xl:w-56 justify-start text-left font-normal"
                              >
                                <CalendarIcon />
                                {enddate ? format(enddate, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={enddate} onSelect={setEndDate} />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {(currentFlow.type != "template" || user.role_id == 17) && (
                <button
                  onClick={() => setIsRearrange(true)}
                  title="Rearrange"
                  className={
                    "size-10 rounded-md absolute top-24 md:top-8 lg:top-4 right-8 md:right-4 left-auto z-10 flex items-center justify-center text-white shadow-[0_4px_12px_0_rgba(0,0,0,0.25)] text-sm bg-gradient-to-l from-[#fb8b65] to-[#49b8c1] cursor-pointer"
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className="">
                    <path d="M120-160v-120q0-33 23.5-56.5T200-360h40v-80q0-33 23.5-56.5T320-520h120v-80h-40q-33 0-56.5-23.5T320-680v-120q0-33 23.5-56.5T400-880h160q33 0 56.5 23.5T640-800v120q0 33-23.5 56.5T560-600h-40v80h120q33 0 56.5 23.5T720-440v80h40q33 0 56.5 23.5T840-280v120q0 33-23.5 56.5T760-80H600q-33 0-56.5-23.5T520-160v-120q0-33 23.5-56.5T600-360h40v-80H320v80h40q33 0 56.5 23.5T440-280v120q0 33-23.5 56.5T360-80H200q-33 0-56.5-23.5T120-160Zm280-520h160v-120H400v120ZM200-160h160v-120H200v120Zm400 0h160v-120H600v120ZM480-680ZM360-280Zm240 0Z" />
                  </svg>
                </button>
              )}
              <RearrangeConfirmationDialog open={isRearrange} onOpenChange={setIsRearrange} onConfirm={handleRearrange} />
              <ReactFlow
                nodeTypes={nodeTypes}
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodeChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                minZoom={0.001}
                maxZoom={2}
                className="w-full h-full"
              >
                <Background />
              </ReactFlow>
            </div>
            <BusinessTemplate
              open={selectedTemplateDetails.open}
              handleClose={() => {
                setSelectTemplateDetails({
                  open: false,
                  data: null,
                });
              }}
              templateDetails={selectedTemplateDetails.data}
              handleAddMore={handleAddMore}
            />

            <div className="fixed bottom-0 right-0 z-10 md:max-w-sm xl:max-w-[455px] w-full p-3 xl:pr-6 xl:p-4 md:block hidden">
              <div className="w-full grow flex flex-col">
                <div className="gap-2.5 w-full flex flex-wrap items-center pl-2">
                  <span className="shrink-0 bg-[#FA8B64] border border-solid border-[#FA8B64] rounded-t-sm p-2.5 py-2 text-[#FEFEFE] text-xs 2xl:text-base flex items-center w-fit font-normal">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                    Step 3
                  </span>
                  <p className="font-medium text-[#96979D] w-2/4 grow text-xs 2xl:text-sm">Dashboard – Run & Manage Your Business</p>
                </div>
                <div className="border-[#FA8B64]/90 border border-solid rounded-lg px-2 py-2 flex gap-3 bg-[#EFEBEF]">
                  <div className="size-10 shrink-0 bg-[#f6f9fb] flex items-center justify-center rounded-lg 2xl:rounded-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                      />
                    </svg>
                  </div>
                  <a className="w-1/2 grow cursor-pointer select-none text-[#A5A6AA] text-xs font-normal" href="/ai-dashboard">
                    Run workflows, track tasks, and keep your business on track — all from one place.
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </FlowContext.Provider>
      <PreviewAiSuggestion
        open={isWorkFlowSidePan}
        setOpen={setIsWorkFlowSidePan}
        workflow={currentWFDetails}
        handlePathChange={(value) => {
          setCurrnetPath(value);
          setIsFrame(true);
          setIsWorkFlowSidePan(false);
        }}
      />
      {isMobile && (
        <div className={cn("chatFlow-btns mobile_chatflow_button")}>
          <ul className="chatFlow-btn-list !bg-[#e2ebf3]">
            <li className={cn("chatFlow-btn-item", selectedBusinessTemplate === "0" && "active")}>
              <CustomTooltip content="Manage your active operations and real-time team workflows.">
                <button className="py-2.5 px-1.5 sm:px-3 sm:py-3 font-semibold" onClick={() => setSelectedBusinessTemplate("0")}>
                  Your Business
                </button>
              </CustomTooltip>
            </li>
            <li className={cn("chatFlow-btn-item", selectedBusinessTemplate === "suggested" && "active")}>
              <CustomTooltip content="Explore AI growth suggestions based on your Stage 1 Blueprint.">
                <button className="py-2.5 px-1.5 sm:px-3 sm:py-3 font-semibold" onClick={() => setSelectedBusinessTemplate("suggested")}>
                  AI Business Structure
                </button>
              </CustomTooltip>
            </li>
            <li className={cn("chatFlow-btn-item", selectedBusinessTemplate === "unified" && "active")}>
              <CustomTooltip content="Your master roadmap. Bridge live operations with AI strategic planning.">
                <button className="py-2 px-1 sm:px-3 sm:py-3" onClick={() => setSelectedBusinessTemplate("unified")}>
                  Unified View
                </button>
              </CustomTooltip>
            </li>
            {/* <li className={cn("chatFlow-btn-item relative", selectedBusinessTemplate > 0 && Number(selectedBusinessTemplate) != "isNaN" && "active")}>
              <button onClick={() => setIsOpen(!isOpen)} className="gap-2 py-2.5 px-1.5 sm:px-3 sm:py-3 font-semibold">
                Business Templates
              </button>
              {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-50">
                  {businessTemplate.map((temp) => (
                    <button
                      key={temp.id}
                      onClick={() => {
                        setSelectedBusinessTemplate(temp.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-zinc-700 hover:bg-[#62AAB4] hover:text-white first:rounded-t-lg last:rounded-b-lg transition-colors",
                        selectedBusinessTemplate === temp.id ? "bg-[#62AAB4] border-[#62AAB4] text-white" : "text-zinc-700"
                      )}
                    >
                      {temp.title}
                    </button>
                  ))}
                </div>
              )}
            </li> */}
          </ul>
        </div>
      )}
    </>
  );
}

export default Flow;
