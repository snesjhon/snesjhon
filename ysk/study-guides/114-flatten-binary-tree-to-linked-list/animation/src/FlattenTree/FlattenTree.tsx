import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

// ── Constants ────────────────────────────────────────────────────────

const NODE_RADIUS = 24;
const FONT = "system-ui, -apple-system, sans-serif";
const MONO = "'SF Mono', 'Fira Code', 'Consolas', monospace";

const TITLE_H = 60;
const GUIDE_TOP = 520;

const C = {
  bg: "#FAFAFA",
  node: "#FFFFFF",
  border: "#334155",
  text: "#0F172A",
  edge: "#94A3B8",
  active: "#F59E0B",
  activeBg: "#FEF3C7",
  done: "#10B981",
  doneBg: "#D1FAE5",
  newEdge: "#3B82F6",
  removedEdge: "#EF4444",
  title: "#0F172A",
  sub: "#64748B",
  codeBg: "#F1F5F9",
  codeText: "#334155",
  panelBg: "#FFFFFF",
  panelBorder: "#E2E8F0",
  dimText: "#94A3B8",
};

// ── Tree positions ───────────────────────────────────────────────────

type Pos = { x: number; y: number };

// Original tree layout (top half of 1280×1000)
const POS_TREE: Record<number, Pos> = {
  1: { x: 640, y: 140 },
  2: { x: 420, y: 270 },
  5: { x: 860, y: 270 },
  3: { x: 300, y: 400 },
  4: { x: 540, y: 400 },
  6: { x: 980, y: 400 },
};

// Final flattened linked list (vertical)
const POS_LIST: Record<number, Pos> = {
  1: { x: 640, y: 95 },
  2: { x: 640, y: 170 },
  3: { x: 640, y: 245 },
  4: { x: 640, y: 320 },
  5: { x: 640, y: 395 },
  6: { x: 640, y: 470 },
};

const ALL_NODES = [1, 2, 3, 4, 5, 6];

// Original edges
type EdgeDef = { from: number; to: number; side: "L" | "R" };
const EDGES_ORIG: EdgeDef[] = [
  { from: 1, to: 2, side: "L" },
  { from: 1, to: 5, side: "R" },
  { from: 2, to: 3, side: "L" },
  { from: 2, to: 4, side: "R" },
  { from: 5, to: 6, side: "R" },
];

// Final edges (linked list)
const EDGES_FINAL: EdgeDef[] = [
  { from: 1, to: 2, side: "R" },
  { from: 2, to: 3, side: "R" },
  { from: 3, to: 4, side: "R" },
  { from: 4, to: 5, side: "R" },
  { from: 5, to: 6, side: "R" },
];

// Processing order: reverse preorder (right → left → self)
const PROCESS_ORDER = [6, 5, 4, 3, 2, 1];

// ── Timeline (540 frames @ 30fps = 18s) ──────────────────────────────

const INTRO_START = 0; // Tree entrance
const OVERVIEW_START = 70; // Algorithm overview

const STEP1_START = 120; // Step 1: lastLinked pointer
const STEP2_START = 180; // Step 2: Walk order
const STEP3_START = 250; // Step 3: Three operations (on node 4 example)

const TRACE_START = 320; // Step 4: Full trace
const FPN = 30; // frames per node during trace
// Process 6 nodes: 320 + 6*30 = 500
const FINAL_START = 500; // Transition to linked list

// ── Step progress ────────────────────────────────────────────────────

type StepDot = { label: string; color: string };
const STEPS: StepDot[] = [
  { label: "1", color: C.sub },
  { label: "2", color: C.sub },
  { label: "3", color: C.sub },
  { label: "4", color: C.done },
];

function getActiveStep(frame: number): number {
  if (frame < STEP1_START) return -1;
  if (frame < STEP2_START) return 0;
  if (frame < STEP3_START) return 1;
  if (frame < TRACE_START) return 2;
  if (frame < FINAL_START) return 3;
  return 4; // done
}

// ── Guide content per frame ──────────────────────────────────────────

type GuideContent = {
  tag: string;
  tagColor: string;
  title: string;
  description: string;
  code: string;
};

function getGuideContent(frame: number): GuideContent {
  if (frame < OVERVIEW_START) {
    return {
      tag: "OVERVIEW",
      tagColor: C.sub,
      title: "Backward Chain Building",
      description:
        "Build the flattened list from the tail backward. Visit nodes in reverse preorder (right → left → self), chaining each one to the front.",
      code: "// Process order: 6, 5, 4, 3, 2, 1\n// Chain grows: 6 → 5→6 → 4→5→6 → ...",
    };
  }
  if (frame < STEP2_START) {
    return {
      tag: "STEP 1",
      tagColor: C.sub,
      title: "The Last-Linked Pointer",
      description:
        "lastLinked tracks the head of the chain we've built so far. Before we start, there's no chain, so it's null.",
      code: "function flatten(root) {\n    let lastLinked = null;\n}",
    };
  }
  if (frame < STEP3_START) {
    // Step 2 sub-phases: highlight right, left, self
    const t = frame - STEP2_START;
    if (t < 25) {
      return {
        tag: "STEP 2",
        tagColor: C.active,
        title: "Go right first — right subtree",
        description:
          "At each junction, recurse into the right subtree first. This ensures deeper right nodes (which belong at the END of the chain) get processed first.",
        code: "function buildBackward(link) {\n    if (!link) return;\n    buildBackward(link.right);  // ← right first\n    buildBackward(link.left);\n    // process self\n}",
      };
    }
    if (t < 50) {
      return {
        tag: "STEP 2",
        tagColor: C.active,
        title: "Then go left — left subtree",
        description:
          "Next, recurse into the left subtree. Left descendants go BEFORE right ones in preorder, so they're processed after.",
        code: "function buildBackward(link) {\n    if (!link) return;\n    buildBackward(link.right);\n    buildBackward(link.left);   // ← then left\n    // process self\n}",
      };
    }
    return {
      tag: "STEP 2",
      tagColor: C.active,
      title: "Finally, process self",
      description:
        "Process the current node last. It places itself BEFORE all its descendants — exactly where preorder says it belongs.",
      code: "function buildBackward(link) {\n    if (!link) return;\n    buildBackward(link.right);\n    buildBackward(link.left);\n    // process self              // ← last\n}",
    };
  }
  if (frame < TRACE_START) {
    // Step 3 sub-phases: connect, snip, update
    const t = frame - STEP3_START;
    if (t < 25) {
      return {
        tag: "CONNECT",
        tagColor: C.newEdge,
        title: "① Connect: node.right = lastLinked",
        description:
          "Wire this node's right pointer to the chain built so far. Example: node 4's right now points to node 5 (the current chain head).",
        code: "link.right = lastLinked;  // connect to chain",
      };
    }
    if (t < 45) {
      return {
        tag: "SNIP",
        tagColor: C.removedEdge,
        title: "② Snip: node.left = null",
        description:
          "Cut the left branch. A linked list has no branching — every node only points forward via .right.",
        code: "link.left = null;         // snip left branch",
      };
    }
    return {
      tag: "UPDATE",
      tagColor: C.done,
      title: "③ Update: lastLinked = node",
      description:
        "This node is now the new head of the chain. The next node processed will point to it.",
      code: "lastLinked = link;        // new chain head",
    };
  }
  if (frame < FINAL_START) {
    // Step 4: trace — show current node being processed
    const traceFrame = frame - TRACE_START;
    const idx = Math.min(PROCESS_ORDER.length - 1, Math.floor(traceFrame / FPN));
    const val = PROCESS_ORDER[idx];
    const chain = PROCESS_ORDER.slice(0, idx + 1).reverse();
    const chainStr = chain.join(" → ");
    return {
      tag: `NODE ${val}`,
      tagColor: C.done,
      title: `Pick up node ${val} — chain: ${chainStr}`,
      description:
        `Processing node ${val}. Set ${val}.right = lastLinked, ${val}.left = null, lastLinked = ${val}. The chain grows from the tail backward.`,
      code: `// Processing node ${val}\nlink.right = lastLinked;    // connect\nlink.left  = null;          // snip\nlastLinked = link;          // update\n// Chain: ${chainStr}`,
    };
  }
  return {
    tag: "COMPLETE",
    tagColor: C.done,
    title: "Chain complete — 1 → 2 → 3 → 4 → 5 → 6",
    description:
      "Every node links via .right only. Built in O(n) time with O(h) stack space using reverse postorder DFS.",
    code: "function flatten(root) {\n    let lastLinked = null;\n    function buildBackward(link) {\n        if (!link) return;\n        buildBackward(link.right);\n        buildBackward(link.left);\n        link.right = lastLinked;\n        link.left  = null;\n        lastLinked = link;\n    }\n    buildBackward(root);\n}",
  };
}

// ── Helpers ──────────────────────────────────────────────────────────

function lerpPos(a: Pos, b: Pos, t: number): Pos {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

// ── SVG Components ───────────────────────────────────────────────────

const ArrowEdge: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  color: string; opacity: number; dashed?: boolean; strokeWidth?: number;
}> = ({ x1, y1, x2, y2, color, opacity, dashed, strokeWidth = 2.5 }) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;
  const ux = dx / len;
  const uy = dy / len;
  const sx = x1 + ux * NODE_RADIUS;
  const sy = y1 + uy * NODE_RADIUS;
  const ex = x2 - ux * NODE_RADIUS;
  const ey = y2 - uy * NODE_RADIUS;
  return (
    <line x1={sx} y1={sy} x2={ex} y2={ey}
      stroke={color} strokeWidth={strokeWidth} opacity={opacity}
      strokeDasharray={dashed ? "6 4" : undefined}
      markerEnd={`url(#arrow-${color.replace("#", "")})`} />
  );
};

const TreeNodeCircle: React.FC<{
  x: number; y: number; val: number;
  fill: string; stroke: string; scale?: number; opacity?: number;
  ring?: string;
}> = ({ x, y, val, fill, stroke, scale = 1, opacity = 1, ring }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity}>
    {ring && (
      <circle r={NODE_RADIUS + 7} fill="none" stroke={ring} strokeWidth={3}
        strokeDasharray="5 3" opacity={0.8} />
    )}
    <circle r={NODE_RADIUS} fill={fill} stroke={stroke} strokeWidth={2.5} />
    <text textAnchor="middle" dominantBaseline="central"
      fill={C.text} fontSize={17} fontWeight={700} fontFamily={FONT}>
      {val}
    </text>
  </g>
);

const SvgLabel: React.FC<{
  x: number; y: number; text: string; color: string;
  opacity: number; fontSize?: number; bold?: boolean;
}> = ({ x, y, text, color, opacity, fontSize = 12, bold }) => (
  <text x={x} y={y} fill={color} fontSize={fontSize}
    fontWeight={bold ? 700 : 500} fontFamily={FONT} opacity={opacity}
    textAnchor="middle">
    {text}
  </text>
);

// ── Guide Panel ──────────────────────────────────────────────────────

const GuidePanel: React.FC<{
  content: GuideContent;
  activeStep: number;
  opacity: number;
}> = ({ content, activeStep, opacity }) => (
  <div style={{
    position: "absolute",
    top: GUIDE_TOP,
    left: 0, right: 0, bottom: 0,
    backgroundColor: C.panelBg,
    borderTop: `2px solid ${C.panelBorder}`,
    opacity,
    display: "flex",
    flexDirection: "column",
  }}>
    {/* Step progress dots */}
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "10px 40px 0",
    }}>
      {STEPS.map((step, i) => {
        const isActive = i === activeStep;
        const isDone = i < activeStep;
        const dotColor = isDone ? C.done : isActive ? step.color : C.panelBorder;
        return (
          <React.Fragment key={i}>
            <div style={{
              width: isActive ? 28 : 22,
              height: isActive ? 28 : 22,
              borderRadius: "50%",
              backgroundColor: isDone || isActive ? dotColor : "transparent",
              border: `2px solid ${dotColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: isActive ? 13 : 11,
              fontWeight: 700,
              color: isDone || isActive ? "#fff" : C.dimText,
              fontFamily: FONT,
            }}>
              {step.label}
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                backgroundColor: isDone ? C.done : C.panelBorder,
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>

    {/* Content */}
    <div style={{
      display: "flex",
      flex: 1,
      padding: "10px 40px 16px",
      gap: 32,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 10,
          fontWeight: 800,
          color: content.tagColor,
          letterSpacing: 1.2,
          padding: "2px 8px",
          borderRadius: 4,
          backgroundColor:
            content.tagColor === C.active ? C.activeBg
            : content.tagColor === C.done ? C.doneBg
            : content.tagColor === C.newEdge ? "#DBEAFE"
            : content.tagColor === C.removedEdge ? "#FEE2E2"
            : "#F1F5F9",
          fontFamily: FONT,
          display: "inline-block",
          marginBottom: 6,
        }}>
          {content.tag}
        </div>
        <div style={{
          fontSize: 15, fontWeight: 700, color: C.text,
          fontFamily: FONT, marginBottom: 4, lineHeight: 1.3,
        }}>
          {content.title}
        </div>
        <div style={{
          fontSize: 12, color: C.sub, fontFamily: FONT, lineHeight: 1.5,
        }}>
          {content.description}
        </div>
      </div>
      <div style={{
        width: 380,
        flexShrink: 0,
        backgroundColor: C.codeBg,
        borderRadius: 8,
        padding: "10px 14px",
        display: "flex",
        alignItems: "flex-start",
      }}>
        <pre style={{
          margin: 0, fontSize: 12, lineHeight: 1.6,
          color: C.codeText, fontFamily: MONO,
          whiteSpace: "pre-wrap", wordBreak: "break-all",
        }}>
          {content.code}
        </pre>
      </div>
    </div>
  </div>
);

// ── Main Composition ─────────────────────────────────────────────────

export const FlattenTree: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─ Intro animation ───────────────────────────────────────────────

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const showTree = frame >= OVERVIEW_START;

  const nodeEntrance = (_val: number, idx: number) => {
    const delay = OVERVIEW_START + idx * 5;
    const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
    const o = interpolate(frame, [delay, delay + 8], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    return { scale: s, opacity: o };
  };

  const edgeEntrance = (idx: number) => {
    const delay = OVERVIEW_START + idx * 5 + 3;
    return interpolate(frame, [delay, delay + 12], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
  };

  // ─ Position transitions ──────────────────────────────────────────

  const tFinal = interpolate(frame, [FINAL_START, FINAL_START + 35], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  const getPos = (val: number): Pos => {
    if (frame < FINAL_START) return POS_TREE[val];
    return lerpPos(POS_TREE[val], POS_LIST[val], tFinal);
  };

  // ─ Trace state ───────────────────────────────────────────────────

  const inTrace = frame >= TRACE_START && frame < FINAL_START;
  const traceFrame = inTrace ? frame - TRACE_START : -1;
  const traceIdx = inTrace
    ? Math.min(PROCESS_ORDER.length - 1, Math.floor(traceFrame / FPN))
    : -1;
  const traceSubFrame = inTrace ? traceFrame % FPN : 0;

  // Which nodes are done processing?
  const processedNodes = new Set<number>();
  if (inTrace) {
    for (let i = 0; i < traceIdx; i++) {
      processedNodes.add(PROCESS_ORDER[i]);
    }
  }
  if (frame >= FINAL_START) {
    PROCESS_ORDER.forEach((v) => processedNodes.add(v));
  }

  const activeNode = inTrace ? PROCESS_ORDER[traceIdx] : null;

  // ─ Edge computation ──────────────────────────────────────────────

  type RenderedEdge = {
    from: number; to: number; color: string; opacity: number;
    dashed?: boolean; strokeWidth?: number;
  };

  const edges: RenderedEdge[] = [];

  if (frame < TRACE_START) {
    // Before trace: show original tree edges
    // During step 3 example (node 4): preview the connect animation
    const inStep3 = frame >= STEP3_START && frame < TRACE_START;
    const s3t = frame - STEP3_START;

    for (let i = 0; i < EDGES_ORIG.length; i++) {
      const e = EDGES_ORIG[i];
      edges.push({
        from: e.from, to: e.to,
        color: C.edge, opacity: edgeEntrance(i),
      });
    }

    // Step 3 preview: show new edge 4→5 appearing
    if (inStep3 && s3t >= 10) {
      const p = interpolate(s3t, [10, 25], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      edges.push({
        from: 4, to: 5, color: C.newEdge,
        opacity: p, strokeWidth: 3,
      });
    }
  } else if (frame < FINAL_START) {
    // During trace: build edges based on processing state
    //
    // Original edges and their fate:
    //   1→2 (L): stays, becomes chain R when node 1 is processed
    //   1→5 (R): destroyed when node 1 is processed
    //   2→3 (L): stays, becomes chain R when node 2 is processed
    //   2→4 (R): destroyed when node 2 is processed
    //   5→6 (R): stays, becomes chain when node 5 is processed
    //
    // New chain edges:
    //   4→5 (R): created when node 4 is processed
    //   3→4 (R): created when node 3 is processed

    const done = processedNodes;
    const isBeingProcessed = (v: number) => v === activeNode;

    // Edge 5→6: original, becomes chain after node 5 processed
    const e56color = done.has(5) || isBeingProcessed(5) ? C.done : C.edge;
    edges.push({ from: 5, to: 6, color: e56color, opacity: 1 });

    // Edge 4→5: NEW chain edge, appears when node 4 is processed
    if (done.has(4)) {
      edges.push({ from: 4, to: 5, color: C.done, opacity: 1 });
    } else if (isBeingProcessed(4) && traceSubFrame >= 8) {
      const p = interpolate(traceSubFrame, [8, 18], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      edges.push({ from: 4, to: 5, color: C.newEdge, opacity: p, strokeWidth: 3 });
    }

    // Edge 3→4: NEW chain edge, appears when node 3 is processed
    if (done.has(3)) {
      edges.push({ from: 3, to: 4, color: C.done, opacity: 1 });
    } else if (isBeingProcessed(3) && traceSubFrame >= 8) {
      const p = interpolate(traceSubFrame, [8, 18], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      edges.push({ from: 3, to: 4, color: C.newEdge, opacity: p, strokeWidth: 3 });
    }

    // Edge 2→4: original R, destroyed when node 2 is processed
    if (!done.has(2) && !isBeingProcessed(2)) {
      edges.push({ from: 2, to: 4, color: C.edge, opacity: 1 });
    } else if (isBeingProcessed(2)) {
      const fadeP = interpolate(traceSubFrame, [5, 18], [1, 0], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      if (fadeP > 0) {
        edges.push({ from: 2, to: 4, color: C.removedEdge, opacity: fadeP, dashed: true });
      }
    }
    // (edge 2→4 gone after node 2 done)

    // Edge 2→3: original L, becomes chain R when node 2 is processed
    if (done.has(2)) {
      edges.push({ from: 2, to: 3, color: C.done, opacity: 1 });
    } else if (isBeingProcessed(2)) {
      // Transition: starts as gray edge, turns green
      const p = interpolate(traceSubFrame, [10, 22], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      edges.push({ from: 2, to: 3, color: p > 0.5 ? C.done : C.edge, opacity: 1 });
    } else {
      edges.push({ from: 2, to: 3, color: C.edge, opacity: 1 });
    }

    // Edge 1→5: original R, destroyed when node 1 is processed
    if (!done.has(1) && !isBeingProcessed(1)) {
      edges.push({ from: 1, to: 5, color: C.edge, opacity: 1 });
    } else if (isBeingProcessed(1)) {
      const fadeP = interpolate(traceSubFrame, [5, 18], [1, 0], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      if (fadeP > 0) {
        edges.push({ from: 1, to: 5, color: C.removedEdge, opacity: fadeP, dashed: true });
      }
    }

    // Edge 1→2: original L, becomes chain R when node 1 is processed
    if (done.has(1)) {
      edges.push({ from: 1, to: 2, color: C.done, opacity: 1 });
    } else if (isBeingProcessed(1)) {
      const p = interpolate(traceSubFrame, [10, 22], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      edges.push({ from: 1, to: 2, color: p > 0.5 ? C.done : C.edge, opacity: 1 });
    } else {
      edges.push({ from: 1, to: 2, color: C.edge, opacity: 1 });
    }
  } else {
    // Final state: all chain edges, green
    for (const e of EDGES_FINAL) {
      edges.push({ from: e.from, to: e.to, color: C.done, opacity: 1 });
    }
  }

  // ─ Step 2: walk order highlights ─────────────────────────────────

  const RIGHT_SUBTREE = [5, 6];
  const LEFT_SUBTREE = [2, 3, 4];

  let walkHighlight = new Set<number>();
  if (frame >= STEP2_START && frame < STEP3_START) {
    const t = frame - STEP2_START;
    if (t < 25) walkHighlight = new Set(RIGHT_SUBTREE);
    else if (t < 50) walkHighlight = new Set(LEFT_SUBTREE);
    else walkHighlight = new Set([1]);
  }

  // ─ Step 3: example node highlight ────────────────────────────────

  let step3Node: number | null = null;
  let step3Ring: string | undefined;
  if (frame >= STEP3_START && frame < TRACE_START) {
    step3Node = 4;
    const s3t = frame - STEP3_START;
    if (s3t >= 45) step3Ring = C.done; // after update: green
    else step3Ring = C.active;
  }

  // ─ Processing order labels (appear during step 2) ────────────────

  const showOrderLabels = frame >= STEP2_START + 55 && frame < TRACE_START;
  const orderLabelOpacity = showOrderLabels
    ? interpolate(frame, [STEP2_START + 55, STEP2_START + 65], [0, 0.8], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      })
    : 0;

  // ─ Node styling ──────────────────────────────────────────────────

  const getNodeStyle = (val: number) => {
    let fill = C.node;
    let stroke = C.border;
    let ring: string | undefined;

    // Walk order highlights (step 2)
    if (walkHighlight.has(val)) {
      fill = C.activeBg;
      stroke = C.active;
    }

    // Step 3 example
    if (val === step3Node) {
      ring = step3Ring;
      const s3t = frame - STEP3_START;
      if (s3t >= 45) { fill = C.doneBg; stroke = C.done; }
      else { fill = C.activeBg; stroke = C.active; }
    }

    // Trace: active node gets ring, processed nodes turn green
    if (inTrace || frame >= FINAL_START) {
      if (processedNodes.has(val)) {
        fill = C.doneBg;
        stroke = C.done;
      }
      if (val === activeNode) {
        fill = C.activeBg;
        stroke = C.active;
        ring = C.active;
      }
    }

    // Final: all green
    if (frame >= FINAL_START) {
      fill = C.doneBg;
      stroke = C.done;
    }

    return { fill, stroke, ring };
  };

  // ─ Guide panel ───────────────────────────────────────────────────

  const guideContent = getGuideContent(frame);
  const activeStepIdx = getActiveStep(frame);
  const panelOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ─ Render ────────────────────────────────────────────────────────

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* Title */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: TITLE_H,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: titleOpacity,
      }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: C.title, fontFamily: FONT }}>
          114. Flatten Binary Tree to Linked List
        </span>
        <span style={{ fontSize: 13, color: C.sub, fontFamily: FONT, marginLeft: 16 }}>
          Backward Chain Building
        </span>
      </div>

      {/* Tree SVG */}
      {showTree && (
        <svg width={1280} height={GUIDE_TOP} style={{
          position: "absolute", top: 0, left: 0,
        }}>
          <defs>
            {[C.edge, C.done, C.newEdge, C.removedEdge, C.active].map((color) => (
              <marker key={color} id={`arrow-${color.replace("#", "")}`}
                viewBox="0 0 10 7" refX="9" refY="3.5"
                markerWidth="8" markerHeight="6" orient="auto-start-reverse">
                <polygon points="0 0, 10 3.5, 0 7" fill={color} />
              </marker>
            ))}
          </defs>

          {/* Edges */}
          {edges.map((e, i) => {
            const fp = getPos(e.from);
            const tp = getPos(e.to);
            return (
              <ArrowEdge key={`e-${i}-${e.from}-${e.to}`}
                x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y}
                color={e.color} opacity={e.opacity}
                dashed={e.dashed} strokeWidth={e.strokeWidth} />
            );
          })}

          {/* Edge labels (L/R) — visible before trace */}
          {frame >= OVERVIEW_START + 20 && frame < TRACE_START && EDGES_ORIG.map((e) => {
            const fp = POS_TREE[e.from];
            const tp = POS_TREE[e.to];
            const mx = (fp.x + tp.x) / 2;
            const my = (fp.y + tp.y) / 2;
            const lo = interpolate(frame, [OVERVIEW_START + 20, OVERVIEW_START + 35], [0, 0.5], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            });
            return (
              <SvgLabel key={`lbl-${e.from}-${e.to}`}
                x={mx + (e.side === "L" ? -14 : 14)} y={my - 8}
                text={e.side === "L" ? ".left" : ".right"}
                color={C.sub} opacity={lo} fontSize={10} />
            );
          })}

          {/* Processing order labels — appear late in step 2 */}
          {orderLabelOpacity > 0 && PROCESS_ORDER.map((val, idx) => {
            const pos = POS_TREE[val];
            return (
              <SvgLabel key={`ord-${val}`}
                x={pos.x + NODE_RADIUS + 16} y={pos.y + 4}
                text={`${idx + 1}`}
                color={C.done} opacity={orderLabelOpacity}
                fontSize={13} bold />
            );
          })}

          {/* Nodes */}
          {ALL_NODES.map((val, idx) => {
            const pos = getPos(val);
            const { scale, opacity } = nodeEntrance(val, idx);
            const style = getNodeStyle(val);
            const fs = frame >= OVERVIEW_START + 30 ? Math.max(scale, 1) : scale;
            const fo = frame >= OVERVIEW_START + 30 ? Math.max(opacity, 1) : opacity;
            return (
              <TreeNodeCircle key={val}
                x={pos.x} y={pos.y} val={val}
                fill={style.fill} stroke={style.stroke}
                scale={fs} opacity={fo} ring={style.ring} />
            );
          })}

          {/* Active node label during trace */}
          {activeNode && (
            <SvgLabel x={getPos(activeNode).x} y={getPos(activeNode).y + 44}
              text="lastLinked" color={C.active} opacity={0.85} fontSize={11} bold />
          )}

          {/* Final .right labels */}
          {frame >= FINAL_START + 15 && EDGES_FINAL.map((e) => {
            const fp = getPos(e.from);
            const tp = getPos(e.to);
            const my = (fp.y + tp.y) / 2;
            const lo = interpolate(frame, [FINAL_START + 15, FINAL_START + 30], [0, 0.6], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            });
            return (
              <SvgLabel key={`fin-${e.from}-${e.to}`}
                x={fp.x + 46} y={my}
                text=".right" color={C.done} opacity={lo} fontSize={11} />
            );
          })}
        </svg>
      )}

      {/* Guide Panel */}
      <GuidePanel
        content={guideContent}
        activeStep={activeStepIdx}
        opacity={panelOpacity}
      />
    </AbsoluteFill>
  );
};
