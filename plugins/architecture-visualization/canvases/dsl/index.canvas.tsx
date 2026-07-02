import { type MouseEvent as ReactMouseEvent, type RefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Banner,
  Button,
  Select,
  Stack,
  ZoomableViewport,
  useCanvasAction,
  useSendToChat,
  useCanvasState,
  useCanvasTargetFilePath,
  useHostTheme,
} from "qoder/canvas";

interface DiagramElementStyle {
  shape?: string;
  background?: string;
  color?: string;
  stroke?: string;
  strokeWidth?: number;
  border?: string;
  dashed?: boolean;
  opacity?: number;
  fontSize?: number;
  width?: number;
  height?: number;
  icon?: string;
  iconPosition?: string;
  metadata?: boolean;
  description?: boolean;
}

interface DiagramPerspective {
  name: string;
  description?: string;
  value?: string;
  url?: string;
}

interface DiagramRelationshipStyle {
  color?: string;
  dashed?: boolean;
  style?: string;
  opacity?: number;
  thickness?: number;
  fontSize?: number;
  width?: number;
  position?: number;
  routing?: string;
  jump?: boolean;
  metadata?: boolean;
  description?: boolean;
}

interface DiagramGroupStyle {
  background?: string;
  color?: string;
  stroke?: string;
  strokeWidth?: number;
  border?: string;
  dashed?: boolean;
  opacity?: number;
  fontSize?: number;
}

interface DiagramElement {
  id: string;
  name: string;
  kind: string;
  description?: string;
  metadata?: string;
  technology?: string;
  instances?: string;
  group?: string;
  url?: string;
  tags?: string[];
  perspectives?: DiagramPerspective[];
  perspectiveStyles?: Record<string, DiagramElementStyle>;
  style?: DiagramElementStyle;
}

interface DiagramRelationship {
  id: string;
  modelRelationshipId?: string;
  sourceId: string;
  destinationId: string;
  description?: string;
  technology?: string;
  order?: string;
  response?: boolean;
  tags?: string[];
  url?: string;
  perspectives?: DiagramPerspective[];
  perspectiveStyles?: Record<string, DiagramRelationshipStyle>;
  style?: DiagramRelationshipStyle;
}

interface DiagramGraphLayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DiagramRoutedEdge {
  id: string;
  path?: string;
  labelX?: number;
  labelY?: number;
  lines?: string[];
  points?: Array<{ x: number; y: number }>;
}

interface DiagramEdgeRoute {
  id: string;
  edge: DiagramRoutedEdge;
  relationship?: DiagramRelationship;
  points: Array<{ x: number; y: number }>;
  routing: "Direct" | "Curved" | "Orthogonal";
}

interface DiagramLayout {
  width: number;
  height: number;
  nodes: DiagramGraphLayoutNode[];
  edges?: DiagramRoutedEdge[];
}

interface DiagramGroup {
  name: string;
  label?: string;
  elementIds: string[];
  style?: DiagramGroupStyle;
}

interface DiagramGroupBounds extends DiagramGroup {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DiagramBoundary {
  id: string;
  name: string;
  kind: string;
  elementIds: string[];
  parentId?: string;
  style?: DiagramGroupStyle;
}

interface DiagramBoundaryBounds extends DiagramBoundary {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DiagramImage {
  content: string;
  contentType?: string;
  elementId?: string;
}

interface DiagramAnimationStep {
  order: number;
  elements?: string[];
  relationships?: string[];
}

type DiagramMetadataSymbols =
  | "SquareBrackets"
  | "RoundBrackets"
  | "CurlyBrackets"
  | "AngleBrackets"
  | "DoubleAngleBrackets"
  | "None";

interface DiagramTerminology {
  enterprise?: string;
  person?: string;
  softwareSystem?: string;
  container?: string;
  component?: string;
  deploymentNode?: string;
  infrastructureNode?: string;
  relationship?: string;
}

interface DiagramBranding {
  logo?: string;
  font?: {
    name?: string;
    url?: string;
  };
}

interface DiagramConfiguration {
  branding?: DiagramBranding;
  metadataSymbols?: DiagramMetadataSymbols;
  terminology?: DiagramTerminology;
  viewSortOrder?: "Default" | "Type" | "Key";
  properties?: Record<string, string>;
}

interface DiagramView {
  key: string;
  type: string;
  title?: string;
  description?: string;
  properties?: Record<string, string>;
  elements: DiagramElement[];
  relationships: DiagramRelationship[];
  groups?: DiagramGroup[];
  boundaries?: DiagramBoundary[];
  renderLayout?: DiagramLayout;
  graphLayout?: DiagramLayout;
  image?: DiagramImage;
  animations?: DiagramAnimationStep[];
}

interface StructurizrViewerData {
  schemaVersion: number;
  sourcePath: string;
  updatedAt?: string;
  workspace?: {
    name: string;
    description?: string;
  };
  selectedViewKey?: string;
  configuration?: DiagramConfiguration;
  perspectiveNames?: string[];
  views?: DiagramView[];
  warnings?: string[];
  error?: string;
}

interface DiagramTooltipRow {
  label: string;
  value: string;
}

interface DiagramTooltipState {
  x: number;
  y: number;
  title: string;
  subtitle?: string;
  description?: string;
  tags?: string[];
  rows?: DiagramTooltipRow[];
}

type DiagramTooltipContent = Omit<DiagramTooltipState, "x" | "y">;

interface DiagramMetadataLine {
  key: string;
  text: string;
  fontSize: number;
  fontWeight?: number;
}

const DATA_KEY = "aicoding.formatViewer.dsl";
const EMPTY_DATA: StructurizrViewerData = {
  schemaVersion: 1,
  sourcePath: "",
  views: [],
};
const FONT_FAMILY = "Tahoma, Verdana, Helvetica, Arial, sans-serif";
const TOOLTIP_WIDTH = 320;
const DEFAULT_ELEMENT_WIDTH = 450;
const DEFAULT_ELEMENT_HEIGHT = 300;
const DEFAULT_DIAGRAM_FONT_SIZE = 26;
type IconPosition = "top" | "bottom" | "left" | "right";

export default function StructurizrFormatViewer() {
  const { tokens } = useHostTheme();
  const dispatch = useCanvasAction();
  const targetFilePath = useCanvasTargetFilePath();
  const [data] = useCanvasState<StructurizrViewerData>(DATA_KEY, EMPTY_DATA);
  const [selectedViewKey, setSelectedViewKey] = useState("");
  const [selectedAnimationStep, setSelectedAnimationStep] = useState("all");
  const [selectedPerspective, setSelectedPerspective] = useState("none");
  const requestedTargetRef = useRef<string | undefined>(undefined);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById("root");
    const previous = {
      htmlHeight: html.style.height,
      htmlOverflow: html.style.overflow,
      bodyHeight: body.style.height,
      bodyOverflow: body.style.overflow,
      rootHeight: root?.style.height,
      rootOverflow: root?.style.overflow,
    };

    html.style.height = "100%";
    html.style.overflow = "hidden";
    body.style.height = "100%";
    body.style.overflow = "hidden";
    if (root) {
      root.style.height = "100%";
      root.style.overflow = "hidden";
    }
    window.scrollTo(0, 0);

    return () => {
      html.style.height = previous.htmlHeight;
      html.style.overflow = previous.htmlOverflow;
      body.style.height = previous.bodyHeight;
      body.style.overflow = previous.bodyOverflow;
      if (root) {
        root.style.height = previous.rootHeight ?? "";
        root.style.overflow = previous.rootOverflow ?? "";
      }
    };
  }, []);

  const runParser = useCallback((target: string) => {
    requestedTargetRef.current = target;
    dispatch({
      type: "aicoding.canvas.runScript",
      script: "scripts/index.mjs",
      args: { targetFilePath: target },
    });
  }, [dispatch]);

  useEffect(() => {
    if (!targetFilePath || requestedTargetRef.current === targetFilePath) {
      return;
    }
    runParser(targetFilePath);
  }, [runParser, targetFilePath]);

  const isCurrentTarget = !!targetFilePath && data.sourcePath === targetFilePath;
  const views = useMemo(() => isCurrentTarget ? data.views ?? [] : [], [data.views, isCurrentTarget]);
  const warnings = isCurrentTarget ? data.warnings ?? [] : [];

  useEffect(() => {
    if (!isCurrentTarget) {
      setSelectedViewKey("");
      return;
    }
    const keys = new Set(views.map(item => item.key));
    setSelectedViewKey(current => {
      if (current && keys.has(current)) {
        return current;
      }
      if (data.selectedViewKey && keys.has(data.selectedViewKey)) {
        return data.selectedViewKey;
      }
      return views[0]?.key ?? "";
    });
  }, [data.selectedViewKey, data.sourcePath, data.updatedAt, isCurrentTarget, views]);

  const view = useMemo(() => {
    if (!isCurrentTarget || views.length === 0) {
      return undefined;
    }
    return views.find(item => item.key === selectedViewKey)
      ?? views.find(item => item.key === data.selectedViewKey)
      ?? views[0];
  }, [data.selectedViewKey, isCurrentTarget, selectedViewKey, views]);
  const renderedView = useMemo(
    () => view ? applyPerspective(applyAnimationStep(view, selectedAnimationStep), selectedPerspective) : undefined,
    [selectedAnimationStep, selectedPerspective, view],
  );

  useEffect(() => {
    if (!view?.animations?.length) {
      setSelectedAnimationStep("all");
      return;
    }
    const orders = new Set(view.animations.map(step => String(step.order)));
    setSelectedAnimationStep(current => current === "all" || orders.has(current) ? current : "all");
  }, [data.updatedAt, view]);

  useEffect(() => {
    const perspectiveNames = new Set(data.perspectiveNames ?? []);
    setSelectedPerspective(current => current === "none" || perspectiveNames.has(current) ? current : "none");
  }, [data.perspectiveNames, data.updatedAt]);

  return (
    <Stack
      style={{
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: tokens.bg.editor,
        color: tokens.text.primary,
      }}
    >
      {data.error && isCurrentTarget ? (
        <StructurizrErrorPanel error={data.error} targetFilePath={targetFilePath} />
      ) : null}

      {targetFilePath && !isCurrentTarget && !data.error ? (
        <Banner tone="info">Loading {fileName(targetFilePath)}</Banner>
      ) : null}

      {isCurrentTarget && view && renderedView ? (
        <>
          <StructurizrViewToolbar
            view={renderedView}
            views={views}
            selectedViewKey={view.key}
            onSelectedViewKeyChange={setSelectedViewKey}
            selectedAnimationStep={selectedAnimationStep}
            onSelectedAnimationStepChange={setSelectedAnimationStep}
            perspectiveNames={data.perspectiveNames ?? []}
            selectedPerspective={selectedPerspective}
            onSelectedPerspectiveChange={setSelectedPerspective}
          />
          {warnings.length > 0 ? (
            <Banner tone="warning">{warningSummary(warnings)}</Banner>
          ) : null}
          <div style={{ flex: "1 1 auto", minHeight: 0, overflow: "hidden" }}>
            {isImageView(renderedView) ? (
              <ImageViewCanvas view={renderedView} height="100%" />
            ) : (
              <DiagramSvg view={renderedView} height="100%" configuration={data.configuration} />
            )}
          </div>
        </>
      ) : !data.error ? (
        <Banner tone="info">{targetFilePath ? "Rendering Structurizr view..." : "Open a Structurizr DSL file"}</Banner>
      ) : null}
    </Stack>
  );
}

function StructurizrViewToolbar({
  view,
  views,
  selectedViewKey,
  onSelectedViewKeyChange,
  selectedAnimationStep,
  onSelectedAnimationStepChange,
  perspectiveNames,
  selectedPerspective,
  onSelectedPerspectiveChange,
}: {
  view: DiagramView;
  views: DiagramView[];
  selectedViewKey: string;
  onSelectedViewKeyChange: (key: string) => void;
  selectedAnimationStep: string;
  onSelectedAnimationStepChange: (step: string) => void;
  perspectiveNames: string[];
  selectedPerspective: string;
  onSelectedPerspectiveChange: (perspective: string) => void;
}) {
  const { tokens } = useHostTheme();
  const hasAnimations = !!view.animations?.length;
  const hasPerspectives = perspectiveNames.length > 0;
  if (views.length <= 1 && !hasAnimations && !hasPerspectives) {
    return null;
  }

  return (
    <div
      style={{
        boxSizing: "border-box",
        minHeight: 42,
        flex: "0 0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "8px 12px 6px",
        borderBottom: `1px solid ${tokens.stroke.tertiary}`,
        background: tokens.bg.editor,
      }}
    >
      {views.length > 1 ? (
        <Select<string>
          value={selectedViewKey}
          onChange={onSelectedViewKeyChange}
          options={views.map(item => ({
            value: item.key,
            label: formatViewOptionLabel(item),
          }))}
          style={{ width: "min(560px, calc(100vw - 190px))" }}
        />
      ) : null}
      {hasAnimations ? (
        <Select<string>
          value={selectedAnimationStep}
          onChange={onSelectedAnimationStepChange}
          options={[
            { value: "all", label: "All steps" },
            ...(view.animations ?? []).map(step => ({
              value: String(step.order),
              label: `Step ${step.order}`,
            })),
          ]}
          style={{ width: 128 }}
        />
      ) : null}
      {hasPerspectives ? (
        <Select<string>
          value={selectedPerspective}
          onChange={onSelectedPerspectiveChange}
          options={[
            { value: "none", label: "No perspective" },
            ...perspectiveNames.map(name => ({
              value: name,
              label: name,
            })),
          ]}
          style={{ width: 180 }}
        />
      ) : null}
      <span
        aria-hidden="true"
        style={{
          color: tokens.text.tertiary,
          fontSize: 12,
          lineHeight: "18px",
          whiteSpace: "nowrap",
        }}
      >
        {isImageView(view) ? "Image" : `${view.elements.length} nodes / ${view.relationships.length} edges`}
      </span>
    </div>
  );
}

function ImageViewCanvas({ view, height }: { view: DiagramView; height: string }) {
  const { tokens } = useHostTheme();
  const content = view.image?.content || "";
  const contentType = view.image?.contentType || "";
  const isBitmap = isImageContent(content, contentType);

  if (!content) {
    return <Banner tone="info">No image content</Banner>;
  }

  return (
    <ZoomableViewport
      resetKey={`${view.key}:${content.length}`}
      style={{ height }}
      contentStyle={{
        minWidth: "100%",
        minHeight: "100%",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: tokens.bg.editor,
        padding: 0,
        boxSizing: "border-box",
      }}
    >
      {isBitmap ? (
        <img
          src={content}
          alt={view.title || view.key}
          style={{
            display: "block",
            maxWidth: "100%",
            height: "auto",
            background: tokens.bg.editor,
          }}
        />
      ) : (
        <pre
          style={{
            margin: 0,
            padding: 24,
            minWidth: 640,
            minHeight: 420,
            boxSizing: "border-box",
            color: tokens.text.primary,
            background: tokens.bg.editor,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: 13,
            lineHeight: "20px",
            whiteSpace: "pre-wrap",
          }}
        >
          {content}
        </pre>
      )}
    </ZoomableViewport>
  );
}

function applyAnimationStep(view: DiagramView, selectedStep: string): DiagramView {
  if (selectedStep === "all" || !view.animations?.length || isImageView(view)) {
    return view;
  }

  const selectedOrder = Number(selectedStep);
  if (!Number.isFinite(selectedOrder)) {
    return view;
  }

  const steps = view.animations
    .filter(step => step.order <= selectedOrder)
    .sort((left, right) => left.order - right.order);
  const elementIds = new Set<string>();
  const explicitRelationshipIds = new Set<string>();

  for (const step of steps) {
    for (const id of step.elements ?? []) {
      elementIds.add(id);
    }
    for (const id of step.relationships ?? []) {
      explicitRelationshipIds.add(id);
      explicitRelationshipIds.add(baseRelationshipId(id));
    }
  }

  if (elementIds.size === 0 && explicitRelationshipIds.size === 0) {
    return view;
  }

  const relationships = view.relationships.filter(relationship => {
    const isExplicit = relationshipMatchesAnyId(relationship, explicitRelationshipIds);
    return isExplicit || (elementIds.has(relationship.sourceId) && elementIds.has(relationship.destinationId));
  });
  for (const relationship of relationships) {
    const isExplicit = relationshipMatchesAnyId(relationship, explicitRelationshipIds);
    if (isExplicit) {
      elementIds.add(relationship.sourceId);
      elementIds.add(relationship.destinationId);
    }
  }
  const elements = view.elements.filter(element => elementIds.has(element.id));
  const relationshipIds = new Set<string>();
  for (const relationship of relationships) {
    relationshipIds.add(relationship.id);
    relationshipIds.add(baseRelationshipId(relationship.id));
  }

  return {
    ...view,
    elements,
    relationships,
    renderLayout: filterDiagramLayout(view.renderLayout, elementIds, relationshipIds),
    graphLayout: filterDiagramLayout(view.graphLayout, elementIds, relationshipIds),
  };
}

function relationshipMatchesAnyId(relationship: DiagramRelationship, ids: ReadonlySet<string>): boolean {
  return relationshipIdVariants(relationship).some(id => ids.has(id));
}

function relationshipIdVariants(relationship: DiagramRelationship): string[] {
  return [
    relationship.id,
    baseRelationshipId(relationship.id),
    relationship.modelRelationshipId,
    relationship.modelRelationshipId ? baseRelationshipId(relationship.modelRelationshipId) : undefined,
  ].filter((id): id is string => !!id);
}

function applyPerspective(view: DiagramView, selectedPerspective: string): DiagramView {
  if (selectedPerspective === "none" || isImageView(view)) {
    return view;
  }
  return {
    ...view,
    elements: view.elements.map(element => {
      const perspective = elementPerspective(element, selectedPerspective);
      return {
        ...element,
        style: perspective
          ? mergeElementStyle(element.style, element.perspectiveStyles?.[selectedPerspective])
          : { ...(element.style ?? {}), opacity: Math.min(clampNumber(element.style?.opacity, 0, 100, 100), 10) },
      };
    }),
    relationships: view.relationships.map(relationship => {
      const perspective = relationshipPerspective(relationship, selectedPerspective);
      return {
        ...relationship,
        style: perspective
          ? mergeRelationshipStyle(relationship.style, relationship.perspectiveStyles?.[selectedPerspective])
          : { ...(relationship.style ?? {}), opacity: Math.min(clampNumber(relationship.style?.opacity, 0, 100, 100), 10) },
      };
    }),
  };
}

function elementPerspective(element: DiagramElement, selectedPerspective: string): DiagramPerspective | undefined {
  return element.perspectives?.find(perspective => perspective.name === selectedPerspective);
}

function relationshipPerspective(relationship: DiagramRelationship, selectedPerspective: string): DiagramPerspective | undefined {
  return relationship.perspectives?.find(perspective => perspective.name === selectedPerspective);
}

function mergeElementStyle(
  base: DiagramElementStyle | undefined,
  perspectiveStyle: DiagramElementStyle | undefined,
): DiagramElementStyle | undefined {
  return perspectiveStyle ? { ...(base ?? {}), ...perspectiveStyle } : base;
}

function mergeRelationshipStyle(
  base: DiagramRelationshipStyle | undefined,
  perspectiveStyle: DiagramRelationshipStyle | undefined,
): DiagramRelationshipStyle | undefined {
  return perspectiveStyle ? { ...(base ?? {}), ...perspectiveStyle } : base;
}

function filterDiagramLayout(
  layout: DiagramLayout | undefined,
  elementIds: ReadonlySet<string>,
  relationshipIds: ReadonlySet<string>,
): DiagramLayout | undefined {
  if (!layout) {
    return undefined;
  }
  return {
    ...layout,
    nodes: layout.nodes.filter(node => elementIds.has(node.id)),
    edges: layout.edges?.filter(edge => (
      relationshipIds.has(edge.id) || relationshipIds.has(baseRelationshipId(edge.id))
    )),
  };
}

function StructurizrErrorPanel({ error, targetFilePath }: { error: string; targetFilePath?: string }) {
  const { tokens } = useHostTheme();
  const sendToChat = useSendToChat();
  const [detailsVisible, setDetailsVisible] = useState(false);
  const summary = firstErrorLine(error);

  const askAgent = useCallback(() => {
    void sendToChat(buildAskAgentPrompt(error, targetFilePath), {
      submit: false,
      newChat: false,
    });
  }, [error, sendToChat, targetFilePath]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        boxSizing: "border-box",
        color: tokens.text.primary,
      }}
    >
      <div style={{ width: "min(1080px, 100%)" }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 18, fontWeight: 600, lineHeight: "28px" }}>
            Structurizr DSL preview failed
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
            <Button variant="primary" onClick={askAgent}>Ask Agent</Button>
            <Button variant="secondary" onClick={() => setDetailsVisible(value => !value)}>
              {detailsVisible ? "Hide Details" : "Show Details"}
            </Button>
          </div>
        </div>

        {detailsVisible ? (
          <div
            role="alert"
            style={{
              border: `1px solid ${tokens.status.dangerBorder}`,
              background: tokens.status.dangerBg,
              color: tokens.status.danger,
              borderRadius: 8,
              padding: 18,
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              Something went wrong
            </div>
            <div style={{ fontSize: 14, lineHeight: "22px", marginBottom: 12, color: tokens.text.primary }}>
              {summary}
            </div>
            <details open>
              <summary style={{ cursor: "pointer", fontWeight: 600, marginBottom: 10 }}>
                Error details
              </summary>
              <pre
                style={{
                  margin: 0,
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontSize: 13,
                  lineHeight: "20px",
                  color: tokens.status.danger,
                }}
              >
                {error}
              </pre>
            </details>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DiagramSvg({
  view,
  height = "100vh",
  configuration,
}: {
  view: DiagramView;
  height?: string;
  configuration?: DiagramConfiguration;
}) {
  const { tokens } = useHostTheme();
  const [tooltip, setTooltip] = useState<DiagramTooltipState>();
  const [viewportRef, viewportSize] = useElementSize<HTMLDivElement>();
  const layout = view.renderLayout ?? view.graphLayout ?? buildFallbackLayout(view);
  const elementsById = new Map(view.elements.map(element => [element.id, element]));
  const relationshipsById = new Map(view.relationships.map(relationship => [relationship.id, relationship]));
  const edgeRoutes: DiagramEdgeRoute[] = (layout.edges ?? []).map(edge => {
    const relationship = relationshipsById.get(edge.id) ?? relationshipsById.get(baseRelationshipId(edge.id));
    return {
      id: edge.id,
      edge,
      relationship,
      routing: normalizeRelationshipRouting(relationship?.style?.routing),
      points: relationshipRoutePoints(edge, relationship),
    };
  });
  const groupBounds = buildGroupBounds(view.groups, layout.nodes);
  const boundaryBounds = buildBoundaryBounds(view.boundaries, layout.nodes);
  const hiddenBoundaryNodeIds = new Set((view.boundaries ?? []).map(boundary => boundary.id));
  const frameBounds = [...boundaryBounds, ...groupBounds];
  const brandingLogo = configuration?.branding?.logo;
  const diagramMetadata = buildDiagramMetadata(view, configuration);
  const diagramMetadataHeight = diagramMetadata.length > 0 ? 16 + diagramMetadata.length * 22 : 0;
  const diagramMetadataWidth = diagramMetadata.length > 0
    ? 48 + Math.max(...diagramMetadata.map(line => Math.ceil(line.text.length * line.fontSize * 0.58)))
    : 0;
  const canvasWidth = Math.max(640, layout.width, diagramMetadataWidth, ...frameBounds.map(frame => frame.x + frame.width + 24));
  const contentHeight = Math.max(420, layout.height, ...frameBounds.map(frame => frame.y + frame.height + 24));
  const footerHeight = Math.max(diagramMetadataHeight, brandingLogo ? 66 : 0);
  const canvasHeight = contentHeight + footerHeight;
  const viewBoxWidth = Math.max(320, canvasWidth);
  const viewBoxHeight = Math.max(240, canvasHeight);
  const initialZoom = fitInitialZoom(viewBoxWidth, viewBoxHeight, viewportSize.width, viewportSize.height);
  const contentWidth = Math.max(canvasWidth, viewportSize.width || 0);
  const showTooltip = useCallback((event: ReactMouseEvent, content: DiagramTooltipContent) => {
    setTooltip({
      ...content,
      ...tooltipPosition(event),
    });
  }, []);
  const moveTooltip = useCallback((event: ReactMouseEvent) => {
    setTooltip(current => current ? { ...current, ...tooltipPosition(event) } : current);
  }, []);
  const hideTooltip = useCallback(() => setTooltip(undefined), []);

  return (
    <div ref={viewportRef as React.RefObject<HTMLDivElement>} style={{ position: "relative", height }}>
      <ZoomableViewport
        resetKey={`${view.key}:${canvasWidth}:${canvasHeight}`}
        initialZoom={initialZoom}
        minZoom={0.1}
        style={{ height: "100%" }}
        contentStyle={{
          width: contentWidth,
          minWidth: canvasWidth,
          minHeight: canvasHeight,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          background: tokens.bg.editor,
          padding: 0,
          boxSizing: "border-box",
        }}
      >
        <svg
          width={canvasWidth}
          height={canvasHeight}
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          role="img"
          aria-label={view.title || view.key}
          style={{
            minWidth: 640,
            minHeight: 420,
            display: "block",
            background: tokens.bg.editor,
            color: tokens.text.primary,
          }}
          onMouseLeave={hideTooltip}
        >
          <rect x={0} y={0} width={viewBoxWidth} height={viewBoxHeight} fill={tokens.bg.editor} />
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="currentColor" />
            </marker>
          </defs>
          {boundaryBounds.map(boundary => (
            <DiagramBoundaryFrame key={`boundary:${boundary.id}`} frame={boundary} configuration={configuration} />
          ))}
          {groupBounds.map(group => (
            <DiagramBoundaryFrame key={`group:${group.name}`} frame={group} />
          ))}
          {edgeRoutes.map(edgeRoute => {
            const { edge, relationship } = edgeRoute;
            const color = relationship?.style?.color || tokens.text.secondary;
            const strokeWidth = clampNumber(relationship?.style?.thickness, 1, 10, 2);
            const fontSize = clampNumber(relationship?.style?.fontSize, 14, 40, DEFAULT_DIAGRAM_FONT_SIZE);
            const labelPoint = edgeLabelPoint(edgeRoute.points, relationship);
            const labelX = edge.labelX ?? labelPoint?.x;
            const labelY = edge.labelY ?? labelPoint?.y;
            const labelLines = relationship
              ? relationshipLabelLines(relationship, relationshipLabelWidth(relationship), fontSize, configuration)
              : (edge.lines ?? []).slice(0, 4);
            const path = relationshipPath(edgeRoute, edgeRoutes, strokeWidth);
            return (
              <g
                key={edge.id}
                color={color}
                opacity={normalizeOpacity(relationship?.style?.opacity)}
                style={{ cursor: relationship ? "help" : undefined }}
                onMouseEnter={relationship ? event => showTooltip(event, relationshipTooltipContent(relationship, elementsById, configuration)) : undefined}
                onMouseMove={relationship ? moveTooltip : undefined}
                onMouseLeave={relationship ? hideTooltip : undefined}
              >
                {relationship ? (
                  <path
                    d={path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={Math.max(14, strokeWidth + 10)}
                    pointerEvents="stroke"
                  />
                ) : null}
                <path
                  d={path}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray={relationshipDashArray(relationship?.style, strokeWidth)}
                  markerEnd="url(#arrow)"
                />
                {labelLines.length > 0 && labelX !== undefined && labelY !== undefined ? (
                  <text
                    x={labelX}
                    y={labelY}
                    fill={color}
                    fontFamily={FONT_FAMILY}
                    fontSize={fontSize}
                    textAnchor="middle"
                  >
                    {labelLines.map((line, index) => (
                      <tspan key={index} x={labelX} dy={index === 0 ? 0 : Math.round(fontSize * 1.18)}>{line}</tspan>
                    ))}
                  </text>
                ) : null}
              </g>
            );
          })}
          {layout.nodes.map(node => {
            if (hiddenBoundaryNodeIds.has(node.id)) {
              return null;
            }
            const element = elementsById.get(node.id);
            if (!element) {
              return null;
            }
            return (
              <g
                key={node.id}
                style={{ cursor: "help" }}
                onMouseEnter={event => showTooltip(event, elementTooltipContent(element, configuration))}
                onMouseMove={moveTooltip}
                onMouseLeave={hideTooltip}
              >
                <ElementNode node={node} element={element} configuration={configuration} />
              </g>
            );
          })}
          {diagramMetadata.length > 0 ? (
            <DiagramMetadataBlock lines={diagramMetadata} x={20} y={contentHeight + 10} />
          ) : null}
          {brandingLogo ? (
            <DiagramBrandingLogo logo={brandingLogo} x={Math.max(20, canvasWidth - 180)} y={contentHeight + 10} />
          ) : null}
        </svg>
      </ZoomableViewport>
      <DiagramHoverTooltip tooltip={tooltip} />
    </div>
  );
}

function DiagramBrandingLogo({ logo, x, y }: { logo: string; x: number; y: number }) {
  return (
    <image
      href={logo}
      x={x}
      y={y}
      width={160}
      height={48}
      preserveAspectRatio="xMaxYMid meet"
      opacity={0.92}
      pointerEvents="none"
    />
  );
}

function DiagramMetadataBlock({ lines, x, y }: { lines: DiagramMetadataLine[]; x: number; y: number }) {
  const { tokens } = useHostTheme();
  if (lines.length === 0) {
    return null;
  }
  return (
    <g aria-label="Diagram metadata">
      {lines.map((line, index) => (
        <text
          key={line.key}
          x={x}
          y={y + index * 22}
          fill={index === 0 ? tokens.text.primary : tokens.text.secondary}
          fontFamily={FONT_FAMILY}
          fontSize={line.fontSize}
          fontWeight={line.fontWeight}
        >
          {line.text}
        </text>
      ))}
    </g>
  );
}

function DiagramHoverTooltip({ tooltip }: { tooltip?: DiagramTooltipState }) {
  const { tokens } = useHostTheme();
  if (!tooltip) {
    return null;
  }

  return (
    <div
      role="tooltip"
      style={{
        position: "fixed",
        left: tooltip.x,
        top: tooltip.y,
        zIndex: 1000,
        width: TOOLTIP_WIDTH,
        maxWidth: "calc(100vw - 24px)",
        boxSizing: "border-box",
        pointerEvents: "none",
        padding: "10px 12px",
        borderRadius: 6,
        border: `1px solid ${tokens.stroke.secondary}`,
        background: tokens.bg.elevated,
        color: tokens.text.primary,
        boxShadow: "0 10px 28px rgba(0, 0, 0, 0.22)",
        fontFamily: FONT_FAMILY,
        fontSize: 12,
        lineHeight: "18px",
        maxHeight: "calc(100vh - 24px)",
        overflow: "hidden",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 13, lineHeight: "19px", wordBreak: "break-word" }}>
        {tooltip.title}
      </div>
      {tooltip.subtitle ? (
        <div style={{ marginTop: 2, color: tokens.text.secondary, wordBreak: "break-word" }}>
          {tooltip.subtitle}
        </div>
      ) : null}
      {tooltip.description ? (
        <div style={{ marginTop: 8, color: tokens.text.primary, wordBreak: "break-word" }}>
          {tooltip.description}
        </div>
      ) : null}
      {tooltip.rows?.length ? (
        <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "72px 1fr", columnGap: 8, rowGap: 3 }}>
          {tooltip.rows.map(row => (
            <div key={`${row.label}:${row.value}`} style={{ display: "contents" }}>
              <span style={{ color: tokens.text.tertiary }}>{row.label}</span>
              <span style={{ color: tokens.text.secondary, wordBreak: "break-word" }}>{row.value}</span>
            </div>
          ))}
        </div>
      ) : null}
      {tooltip.tags?.length ? (
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
          {tooltip.tags.map(tag => (
            <span
              key={tag}
              style={{
                border: `1px solid ${tokens.stroke.tertiary}`,
                borderRadius: 4,
                padding: "1px 5px",
                color: tokens.text.secondary,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function useElementSize<T extends HTMLElement>(): [RefObject<T | null>, { width: number; height: number }] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const update = () => {
      setSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    update();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}

function fitInitialZoom(contentWidth: number, contentHeight: number, viewportWidth: number, viewportHeight: number): number {
  if (contentWidth <= 0 || contentHeight <= 0 || viewportWidth <= 0 || viewportHeight <= 0) {
    return 1;
  }
  const widthZoom = Math.max(0.1, (viewportWidth - 24) / contentWidth);
  const heightZoom = Math.max(0.1, (viewportHeight - 24) / contentHeight);
  const fitZoom = Math.min(widthZoom, heightZoom);
  return Math.min(1, fitZoom);
}

function tooltipPosition(event: ReactMouseEvent): Pick<DiagramTooltipState, "x" | "y"> {
  const viewportWidth = typeof window === "undefined" ? 1280 : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 720 : window.innerHeight;
  const x = Math.max(12, Math.min(event.clientX + 14, viewportWidth - TOOLTIP_WIDTH - 12));
  const yOffset = event.clientY > viewportHeight - 240 ? -180 : 16;
  const y = Math.max(12, Math.min(event.clientY + yOffset, viewportHeight - 24));
  return { x, y };
}

function buildDiagramMetadata(view: DiagramView, configuration?: DiagramConfiguration): DiagramMetadataLine[] {
  const lines: DiagramMetadataLine[] = [];
  if (viewPropertyEquals(view, configuration, "structurizr.title", "true")) {
    lines.push({
      key: "title",
      text: diagramTitle(view),
      fontSize: 20,
      fontWeight: 700,
    });
  }
  if (view.description && viewPropertyEquals(view, configuration, "structurizr.description", "true")) {
    lines.push({
      key: "description",
      text: view.description,
      fontSize: 14,
    });
  }
  return lines;
}

function diagramTitle(view: DiagramView): string {
  return view.title || formatViewType(view.type);
}

function viewPropertyEquals(
  view: DiagramView,
  configuration: DiagramConfiguration | undefined,
  name: string,
  defaultValue: string,
): boolean {
  return viewProperty(view, configuration, name, defaultValue).toLowerCase() === "true";
}

function viewProperty(
  view: DiagramView,
  configuration: DiagramConfiguration | undefined,
  name: string,
  defaultValue: string,
): string {
  return view.properties?.[name] ?? configuration?.properties?.[name] ?? defaultValue;
}

function elementTooltipContent(element: DiagramElement, configuration?: DiagramConfiguration): DiagramTooltipContent {
  return {
    title: element.name,
    subtitle: elementMetadataLabel(element, configuration) || element.kind,
    description: element.description,
    tags: element.tags?.filter(tag => tag && tag !== "Element"),
    rows: compactTooltipRows([
      { label: "ID", value: element.id },
      { label: "Group", value: element.group },
      { label: "URL", value: element.url },
    ]),
  };
}

function relationshipTooltipContent(
  relationship: DiagramRelationship,
  elementsById: ReadonlyMap<string, DiagramElement>,
  configuration?: DiagramConfiguration,
): DiagramTooltipContent {
  const source = elementsById.get(relationship.sourceId);
  const destination = elementsById.get(relationship.destinationId);
  const sourceName = source?.name ?? relationship.sourceId;
  const destinationName = destination?.name ?? relationship.destinationId;
  return {
    title: relationship.description || terminologyForRelationship(configuration),
    subtitle: `${sourceName} -> ${destinationName}`,
    tags: relationship.tags?.filter(Boolean),
    rows: compactTooltipRows([
      { label: "Technology", value: relationship.technology },
      { label: "Order", value: relationship.order },
      { label: "Response", value: relationship.response ? "true" : undefined },
      { label: "URL", value: relationship.url },
      { label: "ID", value: relationship.id },
    ]),
  };
}

function compactTooltipRows(rows: Array<{ label: string; value?: string }>): DiagramTooltipRow[] {
  return rows.filter((row): row is DiagramTooltipRow => typeof row.value === "string" && row.value.length > 0);
}

function DiagramBoundaryFrame({
  frame,
  configuration,
}: {
  frame: DiagramGroupBounds | DiagramBoundaryBounds;
  configuration?: DiagramConfiguration;
}) {
  const { tokens } = useHostTheme();
  const style = frame.style;
  const hasFill = !!style?.background && style.background.toLowerCase() !== "none";
  const stroke = style?.stroke
    || strokeColorFromBorder(style?.border)
    || (hasFill ? strokeForFill(style.background || "", tokens.stroke.secondary) : tokens.stroke.secondary);
  const color = hasFill ? stroke : style?.color || stroke;
  const strokeWidth = clampNumber(style?.strokeWidth, 1, 8, 1.5);
  const fontSize = clampNumber(style?.fontSize, 14, 40, DEFAULT_DIAGRAM_FONT_SIZE);
  const metadataFontSize = Math.max(10, Math.round(fontSize * 0.75));
  const label = "label" in frame ? frame.label || frame.name : frame.name;
  const labelLines = wrapLabel(label, Math.max(96, frame.width - 24), fontSize).slice(0, 2);
  const metadata = "id" in frame && "kind" in frame ? boundaryMetadataLabel(frame as DiagramBoundary, configuration) : undefined;
  const metadataLines = metadata ? wrapLabel(metadata, Math.max(96, frame.width - 24), metadataFontSize).slice(0, 2) : [];

  return (
    <g opacity={normalizeOpacity(style?.opacity)}>
      <rect
        x={frame.x}
        y={frame.y}
        width={frame.width}
        height={frame.height}
        rx={4}
        fill={hasFill ? style?.background : "none"}
        fillOpacity={hasFill ? 0.08 : undefined}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={style?.dashed || borderIsDashed(style?.border) ? "8 6" : undefined}
      />
      {labelLines.length > 0 ? (
        <text
          x={frame.x + 12}
          y={frame.y + Math.max(18, fontSize + 6)}
          fill={color}
          fontFamily={FONT_FAMILY}
          fontSize={fontSize}
          fontWeight={700}
        >
          {labelLines.map((line, index) => (
            <tspan key={index} x={frame.x + 12} dy={index === 0 ? 0 : Math.round(fontSize * 1.16)}>{line}</tspan>
          ))}
          {metadataLines.map((line, index) => (
            <tspan
              key={`metadata:${index}`}
              x={frame.x + 12}
              dy={index === 0 ? Math.round(metadataFontSize * 1.35) : Math.round(metadataFontSize * 1.16)}
              fontSize={metadataFontSize}
              fontWeight={400}
            >
              {line}
            </tspan>
          ))}
        </text>
      ) : null}
    </g>
  );
}

function buildBoundaryBounds(
  boundaries: DiagramBoundary[] | undefined,
  nodes: DiagramGraphLayoutNode[],
): DiagramBoundaryBounds[] {
  if (!boundaries?.length || nodes.length === 0) {
    return [];
  }
  const nodesById = new Map(nodes.map(node => [node.id, node]));
  const bounds: DiagramBoundaryBounds[] = [];
  for (const boundary of boundaries) {
    const boundaryNode = nodesById.get(boundary.id);
    if (boundaryNode) {
      bounds.push({ ...boundary, ...boundaryNode });
      continue;
    }
    const boundaryNodes = boundary.elementIds.map(id => nodesById.get(id)).filter((node): node is DiagramGraphLayoutNode => !!node);
    if (boundaryNodes.length === 0) {
      continue;
    }
    const box = paddedNodeBounds(boundaryNodes, { top: 84, right: 34, bottom: 34, left: 34 });
    bounds.push({ ...boundary, ...box });
  }
  return bounds.sort((left, right) => (right.width * right.height) - (left.width * left.height));
}

function buildGroupBounds(
  groups: DiagramGroup[] | undefined,
  nodes: DiagramGraphLayoutNode[],
): DiagramGroupBounds[] {
  if (!groups?.length || nodes.length === 0) {
    return [];
  }
  const nodesById = new Map(nodes.map(node => [node.id, node]));
  const bounds: DiagramGroupBounds[] = [];
  for (const group of groups) {
    const groupNodes = group.elementIds.map(id => nodesById.get(id)).filter((node): node is DiagramGraphLayoutNode => !!node);
    if (groupNodes.length === 0) {
      continue;
    }
    bounds.push({
      ...group,
      ...paddedNodeBounds(groupNodes, { top: 56, right: 32, bottom: 32, left: 32 }),
    });
  }

  return bounds.sort((left, right) => (right.width * right.height) - (left.width * left.height));
}

function paddedNodeBounds(
  nodes: DiagramGraphLayoutNode[],
  padding: { top: number; right: number; bottom: number; left: number },
): { x: number; y: number; width: number; height: number } {
  const minX = Math.min(...nodes.map(node => node.x));
  const minY = Math.min(...nodes.map(node => node.y));
  const maxX = Math.max(...nodes.map(node => node.x + node.width));
  const maxY = Math.max(...nodes.map(node => node.y + node.height));
  const x = Math.max(8, minX - padding.left);
  const y = Math.max(8, minY - padding.top);
  const right = maxX + padding.right;
  const bottom = maxY + padding.bottom;
  return {
    x,
    y,
    width: Math.max(96, right - x),
    height: Math.max(72, bottom - y),
  };
}

function ElementNode({
  node,
  element,
  configuration,
}: {
  node: DiagramGraphLayoutNode;
  element: DiagramElement;
  configuration?: DiagramConfiguration;
}) {
  const { tokens } = useHostTheme();
  const fill = element.style?.background || tokens.bg.elevated;
  const stroke = element.style?.stroke || strokeColorFromBorder(element.style?.border) || strokeForFill(fill, tokens.stroke.secondary);
  const textColor = element.style?.color || tokens.text.primary;
  const shape = normalizeShape(element.style?.shape, element.kind);
  const strokeWidth = clampNumber(element.style?.strokeWidth, 1, 10, 2);
  const fontSize = clampNumber(element.style?.fontSize, 14, 40, DEFAULT_DIAGRAM_FONT_SIZE);
  const metaFontSize = Math.max(12, Math.round(fontSize * 0.7));
  const descriptionFontSize = Math.max(12, Math.round(fontSize * 0.88));
  const icon = normalizeIcon(element.style?.icon);
  const iconPosition = normalizeIconPosition(element.style?.iconPosition);
  const labelBounds = elementLabelBounds(node, shape, !!icon, iconPosition);
  const nameLines = wrapLabel(element.name, Math.max(80, labelBounds.width - 24), fontSize);
  const showMetadata = element.style?.metadata !== false;
  const showDescription = element.style?.description !== false;
  const meta = elementMetadataLabel(element, configuration);
  const metaLines = showMetadata && meta ? wrapLabel(meta, Math.max(80, labelBounds.width - 24), metaFontSize).slice(0, 2) : [];
  const descriptionLines = showDescription && element.description ? wrapLabel(element.description, Math.max(80, labelBounds.width - 30), descriptionFontSize).slice(0, 4) : [];
  const dashed = element.style?.dashed || borderIsDashed(element.style?.border);
  const opacity = normalizeOpacity(element.style?.opacity);

  return (
    <g opacity={opacity}>
      <ElementShape node={node} shape={shape} fill={fill} stroke={stroke} strokeWidth={strokeWidth} dashed={dashed} />
      {icon ? <ElementIcon href={icon} node={node} shape={shape} position={iconPosition} opacity={opacity} /> : null}
      <ElementLabel
        bounds={labelBounds}
        nameLines={nameLines}
        metaLines={metaLines}
        descriptionLines={descriptionLines}
        fill={textColor}
        fontSize={fontSize}
        metaFontSize={metaFontSize}
        descriptionFontSize={descriptionFontSize}
      />
    </g>
  );
}

function ElementShape({
  node,
  shape,
  fill,
  stroke,
  strokeWidth,
  dashed,
}: {
  node: DiagramGraphLayoutNode;
  shape: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  dashed: boolean;
}) {
  const dash = dashed ? "8 6" : undefined;

  if (shape === "person") {
    const bodyY = node.y + node.height * 0.39;
    const bodyHeight = node.height - node.height * 0.39;
    const headRadius = Math.min(node.width * 0.22, node.height * 0.22);
    const headCx = node.x + node.width / 2;
    const headCy = node.y + Math.max(headRadius + strokeWidth / 2, node.height * 0.22);
    const armTop = bodyY + bodyHeight * 0.5;
    const armBottom = node.y + node.height - strokeWidth / 2;
    return (
      <g>
        <circle
          cx={headCx}
          cy={headCy}
          r={headRadius}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={dash}
        />
        <rect
          x={node.x}
          y={bodyY}
          width={node.width}
          height={bodyHeight}
          rx={Math.min(70, bodyHeight * 0.32)}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={dash}
        />
        <line
          x1={node.x + node.width / 5}
          y1={armTop}
          x2={node.x + node.width / 5}
          y2={armBottom}
          stroke={stroke}
          strokeWidth={Math.max(1, strokeWidth * 0.55)}
          strokeDasharray={dash}
        />
        <line
          x1={node.x + node.width - node.width / 5}
          y1={armTop}
          x2={node.x + node.width - node.width / 5}
          y2={armBottom}
          stroke={stroke}
          strokeWidth={Math.max(1, strokeWidth * 0.55)}
          strokeDasharray={dash}
        />
      </g>
    );
  }

  if (shape === "robot") {
    const bodyY = node.y + node.height * 0.42;
    const bodyHeight = node.height - node.height * 0.42;
    const headWidth = node.width * 0.46;
    const headHeight = node.height * 0.28;
    const earWidth = node.width * 0.64;
    const earHeight = Math.max(6, node.height * 0.07);
    const headX = node.x + (node.width - headWidth) / 2;
    const headY = node.y + node.height * 0.08;
    const armTop = bodyY + bodyHeight * 0.48;
    const armBottom = node.y + node.height - strokeWidth / 2;
    return (
      <g>
        <rect x={node.x + (node.width - earWidth) / 2} y={headY + headHeight * 0.35} width={earWidth} height={earHeight} rx={earHeight / 2} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
        <rect x={headX} y={headY} width={headWidth} height={headHeight} rx={Math.min(18, headHeight * 0.28)} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
        <rect x={node.x} y={bodyY} width={node.width} height={bodyHeight} rx={Math.min(30, bodyHeight * 0.18)} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
        <line x1={node.x + node.width / 5} y1={armTop} x2={node.x + node.width / 5} y2={armBottom} stroke={stroke} strokeWidth={Math.max(1, strokeWidth * 0.55)} strokeDasharray={dash} />
        <line x1={node.x + node.width - node.width / 5} y1={armTop} x2={node.x + node.width - node.width / 5} y2={armBottom} stroke={stroke} strokeWidth={Math.max(1, strokeWidth * 0.55)} strokeDasharray={dash} />
      </g>
    );
  }

  if (shape === "cylinder") {
    const inset = Math.min(14, node.width * 0.08);
    const ry = Math.min(18, node.height * 0.16);
    const topY = node.y + ry;
    const bottomY = node.y + node.height - ry;
    return (
      <g>
        <ellipse cx={node.x + node.width / 2} cy={topY} rx={node.width / 2 - inset} ry={ry} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
        <rect x={node.x + inset} y={topY} width={node.width - inset * 2} height={Math.max(1, bottomY - topY)} fill={fill} />
        <line x1={node.x + inset} y1={topY} x2={node.x + inset} y2={bottomY} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
        <line x1={node.x + node.width - inset} y1={topY} x2={node.x + node.width - inset} y2={bottomY} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
        <ellipse cx={node.x + node.width / 2} cy={bottomY} rx={node.width / 2 - inset} ry={ry} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
      </g>
    );
  }

  if (shape === "bucket") {
    const ry = Math.min(60, Math.max(20, node.height * 0.24));
    const topRy = ry / 2;
    const inset = node.width / 10;
    const topY = node.y + topRy;
    const bottomY = node.y + node.height - topRy;
    const bottomWidth = node.width - inset * 2;
    const d = [
      `M ${node.x} ${topY}`,
      `a ${node.width / 2} ${topRy} 0 0 0 ${node.width} 0`,
      `a ${node.width / 2} ${topRy} 0 0 0 ${-node.width} 0`,
      `l ${inset} ${Math.max(1, bottomY - topY)}`,
      `a ${bottomWidth / 2} ${ry} 0 0 0 ${bottomWidth} 0`,
      `l ${inset} ${-Math.max(1, bottomY - topY)}`,
    ].join(" ");
    return <path d={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />;
  }

  if (shape === "pipe") {
    const rx = Math.min(18, node.width * 0.08);
    const leftX = node.x + rx;
    const rightX = node.x + node.width - rx;
    return (
      <g>
        <path
          d={`M ${leftX} ${node.y} L ${rightX} ${node.y} A ${rx} ${node.height / 2} 0 0 1 ${rightX} ${node.y + node.height} L ${leftX} ${node.y + node.height} A ${rx} ${node.height / 2} 0 0 1 ${leftX} ${node.y} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={dash}
        />
        <ellipse cx={leftX} cy={node.y + node.height / 2} rx={rx} ry={node.height / 2} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
      </g>
    );
  }

  if (shape === "diamond") {
    const points = [
      `${node.x + node.width / 2},${node.y}`,
      `${node.x + node.width},${node.y + node.height / 2}`,
      `${node.x + node.width / 2},${node.y + node.height}`,
      `${node.x},${node.y + node.height / 2}`,
    ].join(" ");
    return <polygon points={points} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />;
  }

  if (shape === "hexagon") {
    const inset = node.width * 0.18;
    const points = [
      `${node.x + inset},${node.y}`,
      `${node.x + node.width - inset},${node.y}`,
      `${node.x + node.width},${node.y + node.height / 2}`,
      `${node.x + node.width - inset},${node.y + node.height}`,
      `${node.x + inset},${node.y + node.height}`,
      `${node.x},${node.y + node.height / 2}`,
    ].join(" ");
    return <polygon points={points} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />;
  }

  if (shape === "folder") {
    const tabWidth = Math.min(node.width * 0.38, 88);
    const tabHeight = Math.min(node.height * 0.22, 22);
    const r = Math.min(10, node.height * 0.12);
    const d = [
      `M ${node.x} ${node.y + tabHeight}`,
      `L ${node.x + tabWidth * 0.18} ${node.y + tabHeight}`,
      `L ${node.x + tabWidth * 0.28} ${node.y}`,
      `L ${node.x + tabWidth} ${node.y}`,
      `L ${node.x + tabWidth * 1.14} ${node.y + tabHeight}`,
      `L ${node.x + node.width - r} ${node.y + tabHeight}`,
      `Q ${node.x + node.width} ${node.y + tabHeight} ${node.x + node.width} ${node.y + tabHeight + r}`,
      `L ${node.x + node.width} ${node.y + node.height - r}`,
      `Q ${node.x + node.width} ${node.y + node.height} ${node.x + node.width - r} ${node.y + node.height}`,
      `L ${node.x + r} ${node.y + node.height}`,
      `Q ${node.x} ${node.y + node.height} ${node.x} ${node.y + node.height - r}`,
      "Z",
    ].join(" ");
    return <path d={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />;
  }

  if (shape === "webbrowser" || shape === "window" || shape === "terminal" || shape === "shell") {
    const headerHeight = Math.min(28, Math.max(18, node.height * 0.2));
    return (
      <g>
        <rect x={node.x} y={node.y} width={node.width} height={node.height} rx={8} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
        <line x1={node.x} y1={node.y + headerHeight} x2={node.x + node.width} y2={node.y + headerHeight} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
        {shape === "webbrowser" ? (
          <g fill={stroke}>
            <circle cx={node.x + 14} cy={node.y + headerHeight / 2} r={3} />
            <circle cx={node.x + 25} cy={node.y + headerHeight / 2} r={3} />
            <circle cx={node.x + 36} cy={node.y + headerHeight / 2} r={3} />
          </g>
        ) : null}
        {shape === "terminal" || shape === "shell" ? (
          <path d={`M ${node.x + 14} ${node.y + headerHeight + 22} L ${node.x + 26} ${node.y + headerHeight + 30} L ${node.x + 14} ${node.y + headerHeight + 38} M ${node.x + 34} ${node.y + headerHeight + 38} L ${node.x + 58} ${node.y + headerHeight + 38}`} fill="none" stroke={stroke} strokeWidth={Math.max(1, strokeWidth * 0.8)} strokeLinecap="round" strokeLinejoin="round" />
        ) : null}
      </g>
    );
  }

  if (shape === "mobileportrait" || shape === "mobilelandscape") {
    const portrait = shape === "mobileportrait";
    const padX = portrait ? node.width * 0.18 : node.width * 0.06;
    const padY = portrait ? node.height * 0.06 : node.height * 0.18;
    const x = node.x + padX;
    const y = node.y + padY;
    const width = node.width - padX * 2;
    const height = node.height - padY * 2;
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} rx={Math.min(18, Math.min(width, height) * 0.12)} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} />
        <line x1={x + width * 0.38} y1={y + height * 0.08} x2={x + width * 0.62} y2={y + height * 0.08} stroke={stroke} strokeWidth={Math.max(1, strokeWidth * 0.7)} strokeLinecap="round" />
        <circle cx={x + width / 2} cy={y + height * 0.92} r={Math.max(2, Math.min(width, height) * 0.025)} fill="none" stroke={stroke} strokeWidth={Math.max(1, strokeWidth * 0.7)} />
      </g>
    );
  }

  if (shape === "circle") {
    const radius = Math.min(node.width, node.height) / 2;
    return (
      <circle
        cx={node.x + node.width / 2}
        cy={node.y + node.height / 2}
        r={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
    );
  }

  if (shape === "ellipse") {
    return (
      <ellipse
        cx={node.x + node.width / 2}
        cy={node.y + node.height / 2}
        rx={node.width / 2}
        ry={node.height / 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
    );
  }

  const radius = shape === "rounded" ? Math.min(20, node.height / 4) : 4;
  return (
    <g>
      <rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        rx={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      {shape === "component" ? (
        <g stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dash} fill={fill}>
          <rect x={node.x + 10} y={node.y + 12} width={18} height={12} rx={2} />
          <rect x={node.x + 10} y={node.y + 30} width={18} height={12} rx={2} />
        </g>
      ) : null}
    </g>
  );
}

function ElementLabel({
  bounds,
  nameLines,
  metaLines,
  descriptionLines,
  fill,
  fontSize,
  metaFontSize,
  descriptionFontSize,
}: {
  bounds: { x: number; y: number; width: number; height: number };
  nameLines: string[];
  metaLines: string[];
  descriptionLines: string[];
  fill: string;
  fontSize: number;
  metaFontSize: number;
  descriptionFontSize: number;
}) {
  const centerX = bounds.x + bounds.width / 2;
  const lineHeight = Math.round(fontSize * 1.14);
  const metaLineHeight = Math.round(metaFontSize * 1.18);
  const descriptionLineHeight = Math.round(descriptionFontSize * 1.18);
  const name = nameLines.slice(0, 3);
  const meta = metaLines.slice(0, 2);
  const description = descriptionLines.slice(0, 4);
  const totalHeight = name.length * lineHeight
    + (meta.length > 0 ? 6 + meta.length * metaLineHeight : 0)
    + (description.length > 0 ? 12 + description.length * descriptionLineHeight : 0);
  const startY = bounds.y + Math.max(fontSize, (bounds.height - totalHeight) / 2 + fontSize);
  const metaY = startY + name.length * lineHeight + 6;
  const descriptionY = metaY + (meta.length > 0 ? meta.length * metaLineHeight + 10 : 2);

  return (
    <g>
      <text x={centerX} y={startY} fill={fill} fontFamily={FONT_FAMILY} fontSize={fontSize} fontWeight={700} textAnchor="middle">
        {name.map((line, index) => (
          <tspan key={index} x={centerX} dy={index === 0 ? 0 : lineHeight}>{line}</tspan>
        ))}
      </text>
      {meta.length > 0 ? (
        <text x={centerX} y={startY + name.length * lineHeight + 6} fill={fill} fontFamily={FONT_FAMILY} fontSize={metaFontSize} textAnchor="middle">
          {meta.map((line, index) => (
            <tspan key={index} x={centerX} dy={index === 0 ? 0 : metaLineHeight}>{line}</tspan>
          ))}
        </text>
      ) : null}
      {description.length > 0 ? (
        <text x={centerX} y={descriptionY} fill={fill} fontFamily={FONT_FAMILY} fontSize={descriptionFontSize} textAnchor="middle">
          {description.map((line, index) => (
            <tspan key={index} x={centerX} dy={index === 0 ? 0 : descriptionLineHeight}>{line}</tspan>
          ))}
        </text>
      ) : null}
    </g>
  );
}

function ElementIcon({
  href,
  node,
  shape,
  position,
  opacity,
}: {
  href: string;
  node: DiagramGraphLayoutNode;
  shape: string;
  position: IconPosition;
  opacity: number;
}) {
  const box = elementIconBounds(node, shape, position);
  return (
    <image
      href={href}
      x={box.x}
      y={box.y}
      width={box.size}
      height={box.size}
      opacity={opacity}
      preserveAspectRatio="xMidYMid meet"
    />
  );
}

function elementBodyBounds(node: DiagramGraphLayoutNode, shape: string): { x: number; y: number; width: number; height: number } {
  if (shape === "person" || shape === "robot") {
    const y = node.y + node.height * 0.39;
    return { x: node.x, y, width: node.width, height: node.height - node.height * 0.39 };
  }
  return { x: node.x, y: node.y, width: node.width, height: node.height };
}

function elementIconBounds(node: DiagramGraphLayoutNode, shape: string, position: IconPosition): { x: number; y: number; size: number } {
  const body = elementBodyBounds(node, shape);
  const sideSize = Math.max(24, Math.min(80, body.width * 0.26, body.height * 0.55));
  const stackSize = Math.max(24, Math.min(72, body.width * 0.32, body.height * 0.28));
  if (position === "left") {
    return {
      x: body.x + 14,
      y: body.y + (body.height - sideSize) / 2,
      size: sideSize,
    };
  }
  if (position === "right") {
    return {
      x: body.x + body.width - sideSize - 14,
      y: body.y + (body.height - sideSize) / 2,
      size: sideSize,
    };
  }
  if (position === "top") {
    return {
      x: body.x + (body.width - stackSize) / 2,
      y: body.y + 14,
      size: stackSize,
    };
  }
  return {
    x: body.x + (body.width - stackSize) / 2,
    y: body.y + body.height - stackSize - 14,
    size: stackSize,
  };
}

function elementLabelBounds(
  node: DiagramGraphLayoutNode,
  shape: string,
  hasIcon: boolean,
  position: IconPosition,
): { x: number; y: number; width: number; height: number } {
  const body = elementBodyBounds(node, shape);
  if (!hasIcon) {
    return body;
  }
  const icon = elementIconBounds(node, shape, position);
  const gap = 14;
  if (position === "left") {
    const x = icon.x + icon.size + gap;
    return { x, y: body.y, width: Math.max(80, body.x + body.width - x - gap), height: body.height };
  }
  if (position === "right") {
    return { x: body.x + gap, y: body.y, width: Math.max(80, icon.x - body.x - gap * 2), height: body.height };
  }
  if (position === "top") {
    const y = icon.y + icon.size + gap;
    return { x: body.x + gap, y, width: Math.max(80, body.width - gap * 2), height: Math.max(40, body.y + body.height - y - gap) };
  }
  return { x: body.x + gap, y: body.y + gap, width: Math.max(80, body.width - gap * 2), height: Math.max(40, icon.y - body.y - gap * 2) };
}

function buildFallbackLayout(view: DiagramView): DiagramLayout {
  const width = 960;
  const hiddenBoundaryNodeIds = new Set((view.boundaries ?? []).map(boundary => boundary.id));
  const visibleElements = view.elements.filter(element => !hiddenBoundaryNodeIds.has(element.id));
  if (view.boundaries?.length) {
    return buildBoundaryAwareFallbackLayout(view, visibleElements, width);
  }
  const sizes = visibleElements.map(fallbackNodeSize);
  const maxNodeWidth = Math.max(176, ...sizes.map(size => size.width));
  const maxNodeHeight = Math.max(84, ...sizes.map(size => size.height));
  const columnWidth = Math.max(220, maxNodeWidth + 44);
  const rowHeight = Math.max(140, maxNodeHeight + 56);
  const columns = Math.max(1, Math.floor(width / columnWidth));
  const nodes = visibleElements.map((element, index) => {
    const size = sizes[index] ?? { width: 176, height: 84 };
    return {
      id: element.id,
      x: 48 + (index % columns) * columnWidth,
      y: 48 + Math.floor(index / columns) * rowHeight,
      width: size.width,
      height: size.height,
    };
  });
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const edges = view.relationships.flatMap(relationship => {
    const source = nodeMap.get(relationship.sourceId);
    const target = nodeMap.get(relationship.destinationId);
    if (!source || !target) {
      return [];
    }
    return [{
      id: relationship.id,
      points: [
        { x: source.x + source.width, y: source.y + source.height / 2 },
        { x: target.x, y: target.y + target.height / 2 },
      ],
      }];
  });
  const height = Math.max(420, 96 + Math.ceil(visibleElements.length / columns) * rowHeight);
  return { width, height, nodes, edges };
}

function buildBoundaryAwareFallbackLayout(
  view: DiagramView,
  visibleElements: DiagramElement[],
  minWidth: number,
): DiagramLayout {
  const sizes = new Map(visibleElements.map(element => [element.id, fallbackNodeSize(element)]));
  const maxNodeWidth = Math.max(176, ...visibleElements.map(element => sizes.get(element.id)?.width ?? 176));
  const maxNodeHeight = Math.max(84, ...visibleElements.map(element => sizes.get(element.id)?.height ?? 84));
  const columnWidth = Math.max(260, maxNodeWidth + 120);
  const rowHeight = Math.max(160, maxNodeHeight + 96);
  const visibleIds = new Set(visibleElements.map(element => element.id));
  const levels = deploymentNodeLevels(visibleElements, view.relationships);
  const levelRows = new Map<number, number>();
  const nodes = visibleElements.map((element) => {
    const size = sizes.get(element.id) ?? { width: 176, height: 84 };
    const level = levels.get(element.id) ?? 0;
    const row = levelRows.get(level) ?? 0;
    levelRows.set(level, row + 1);
    return {
      id: element.id,
      x: 56 + level * columnWidth,
      y: 56 + row * rowHeight,
      width: size.width,
      height: size.height,
    };
  });
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const edges = view.relationships.flatMap(relationship => {
    if (!visibleIds.has(relationship.sourceId) || !visibleIds.has(relationship.destinationId)) {
      return [];
    }
    const source = nodeMap.get(relationship.sourceId);
    const target = nodeMap.get(relationship.destinationId);
    if (!source || !target) {
      return [];
    }
    const sourcePoint = { x: source.x + source.width, y: source.y + source.height / 2 };
    const targetPoint = { x: target.x, y: target.y + target.height / 2 };
    const midX = sourcePoint.x <= targetPoint.x
      ? sourcePoint.x + Math.max(36, (targetPoint.x - sourcePoint.x) / 2)
      : source.x + source.width / 2;
    return [{
      id: relationship.id,
      points: sourcePoint.x <= targetPoint.x
        ? [
          sourcePoint,
          { x: midX, y: sourcePoint.y },
          { x: midX, y: targetPoint.y },
          targetPoint,
        ]
        : [
          { x: source.x + source.width / 2, y: source.y + source.height / 2 },
          { x: target.x + target.width / 2, y: target.y + target.height / 2 },
        ],
    }];
  });
  const right = Math.max(0, ...nodes.map(node => node.x + node.width));
  const bottom = Math.max(0, ...nodes.map(node => node.y + node.height));
  return {
    width: Math.max(minWidth, right + 96),
    height: Math.max(420, bottom + 96),
    nodes,
    edges,
  };
}

function deploymentNodeLevels(elements: DiagramElement[], relationships: DiagramRelationship[]): Map<string, number> {
  const visibleIds = new Set(elements.map(element => element.id));
  const outgoing = new Map<string, string[]>();
  const indegree = new Map(elements.map(element => [element.id, 0]));
  for (const relationship of relationships) {
    if (!visibleIds.has(relationship.sourceId) || !visibleIds.has(relationship.destinationId)) {
      continue;
    }
    const targets = outgoing.get(relationship.sourceId) ?? [];
    targets.push(relationship.destinationId);
    outgoing.set(relationship.sourceId, targets);
    indegree.set(relationship.destinationId, (indegree.get(relationship.destinationId) ?? 0) + 1);
  }

  const levels = new Map(elements.map(element => [element.id, 0]));
  const queue = elements.filter(element => (indegree.get(element.id) ?? 0) === 0).map(element => element.id);
  const visited = new Set<string>();
  while (queue.length > 0) {
    const id = queue.shift();
    if (!id) {
      continue;
    }
    visited.add(id);
    for (const targetId of outgoing.get(id) ?? []) {
      levels.set(targetId, Math.max(levels.get(targetId) ?? 0, (levels.get(id) ?? 0) + 1));
      const nextIndegree = (indegree.get(targetId) ?? 0) - 1;
      indegree.set(targetId, nextIndegree);
      if (nextIndegree === 0) {
        queue.push(targetId);
      }
    }
  }

  for (const element of elements) {
    if (!visited.has(element.id)) {
      levels.set(element.id, 0);
    }
  }
  return levels;
}

function fallbackNodeSize(element: DiagramElement): { width: number; height: number } {
  return {
    width: clampNumber(element.style?.width, 80, 1600, DEFAULT_ELEMENT_WIDTH),
    height: clampNumber(element.style?.height, 60, 1200, DEFAULT_ELEMENT_HEIGHT),
  };
}

function pointsToPath(points: Array<{ x: number; y: number }> | undefined): string {
  if (!points || points.length === 0) {
    return "";
  }
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function relationshipRoutePoints(edge: DiagramRoutedEdge, relationship: DiagramRelationship | undefined): Array<{ x: number; y: number }> {
  const points = edge.points ?? [];
  if (normalizeRelationshipRouting(relationship?.style?.routing) === "Orthogonal" && points.length >= 2) {
    return orthogonalPoints(points);
  }
  return points;
}

function relationshipPath(edgeRoute: DiagramEdgeRoute, allRoutes: DiagramEdgeRoute[], strokeWidth: number): string {
  const { edge, relationship, points, routing } = edgeRoute;
  if (routing === "Curved" && points.length >= 3) {
    return curvedPath(points);
  }
  if (relationship?.style?.jump === true && points.length >= 2) {
    const jumpSize = Math.max(6, strokeWidth * 5);
    const jumps = relationshipJumpIntersections(edgeRoute, allRoutes, jumpSize);
    if (jumps.length > 0) {
      return jumpOverPath(points, jumps, jumpSize);
    }
  }
  return points.length > 0 ? pointsToPath(points) : edge.path || "";
}

function curvedPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) {
    return "";
  }
  if (points.length < 3) {
    return pointsToPath(points);
  }
  const commands = [`M ${points[0]!.x} ${points[0]!.y}`];
  for (let index = 1; index < points.length; index += 1) {
    const point = points[index]!;
    if (index < points.length - 1) {
      const next = points[index + 1]!;
      commands.push(`Q ${point.x} ${point.y} ${(point.x + next.x) / 2} ${(point.y + next.y) / 2}`);
    } else {
      commands.push(`L ${point.x} ${point.y}`);
    }
  }
  return commands.join(" ");
}

function orthogonalPoints(points: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
  if (points.length !== 2) {
    return points;
  }
  const [start, end] = points;
  if (!start || !end) {
    return points;
  }
  if (Math.abs(start.x - end.x) > Math.abs(start.y - end.y)) {
    const midX = start.x + (end.x - start.x) / 2;
    return [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end];
  }
  const midY = start.y + (end.y - start.y) / 2;
  return [start, { x: start.x, y: midY }, { x: end.x, y: midY }, end];
}

function normalizeRelationshipRouting(routing: string | undefined): "Direct" | "Curved" | "Orthogonal" {
  const value = String(routing ?? "Direct").toLowerCase();
  if (value === "curved") {
    return "Curved";
  }
  if (value === "orthogonal") {
    return "Orthogonal";
  }
  return "Direct";
}

function edgeLabelPoint(points: Array<{ x: number; y: number }>, relationship?: DiagramRelationship): { x: number; y: number } | undefined {
  if (points.length === 0) {
    return undefined;
  }
  return pointAtPolylineFraction(points, clampNumber(relationship?.style?.position, 0, 100, 50) / 100);
}

function pointAtPolylineFraction(points: Array<{ x: number; y: number }>, fraction: number): { x: number; y: number } {
  if (points.length === 0) {
    return { x: 0, y: 0 };
  }
  if (points.length === 1) {
    return points[0]!;
  }
  const segments: Array<{ start: { x: number; y: number }; end: { x: number; y: number }; length: number }> = [];
  let totalLength = 0;
  for (let index = 0; index + 1 < points.length; index += 1) {
    const start = points[index]!;
    const end = points[index + 1]!;
    const length = Math.hypot(end.x - start.x, end.y - start.y);
    segments.push({ start, end, length });
    totalLength += length;
  }
  if (totalLength <= 0) {
    return points[0]!;
  }
  let remaining = totalLength * Math.max(0, Math.min(1, fraction));
  for (const segment of segments) {
    if (remaining <= segment.length) {
      const t = segment.length === 0 ? 0 : remaining / segment.length;
      return {
        x: segment.start.x + (segment.end.x - segment.start.x) * t,
        y: segment.start.y + (segment.end.y - segment.start.y) * t,
      };
    }
    remaining -= segment.length;
  }
  return points[points.length - 1]!;
}

interface RouteSegment {
  index: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
  length: number;
}

interface JumpIntersection {
  segmentIndex: number;
  segmentDistance: number;
  point: { x: number; y: number };
}

function relationshipJumpIntersections(
  edgeRoute: DiagramEdgeRoute,
  allRoutes: DiagramEdgeRoute[],
  jumpSize: number,
): JumpIntersection[] {
  if (edgeRoute.routing === "Curved") {
    return [];
  }
  const ownSegments = routeSegments(edgeRoute.points);
  if (ownSegments.length === 0) {
    return [];
  }
  const jumps: JumpIntersection[] = [];
  for (const ownSegment of ownSegments) {
    if (ownSegment.length < jumpSize * 2 + 4) {
      continue;
    }
    for (const otherRoute of allRoutes) {
      if (otherRoute.id === edgeRoute.id || otherRoute.routing === "Curved") {
        continue;
      }
      for (const otherSegment of routeSegments(otherRoute.points)) {
        if (segmentsShareEndpoint(ownSegment, otherSegment)) {
          continue;
        }
        const intersection = segmentIntersection(ownSegment, otherSegment);
        if (!intersection) {
          continue;
        }
        const distance = pointDistance(ownSegment.start, intersection);
        if (distance < jumpSize + 2 || ownSegment.length - distance < jumpSize + 2) {
          continue;
        }
        if (jumps.some(jump => jump.segmentIndex === ownSegment.index && pointDistance(jump.point, intersection) < 3)) {
          continue;
        }
        jumps.push({
          segmentIndex: ownSegment.index,
          segmentDistance: distance,
          point: intersection,
        });
      }
    }
  }
  return jumps.sort((left, right) =>
    left.segmentIndex === right.segmentIndex
      ? left.segmentDistance - right.segmentDistance
      : left.segmentIndex - right.segmentIndex
  );
}

function jumpOverPath(
  points: Array<{ x: number; y: number }>,
  jumps: JumpIntersection[],
  jumpSize: number,
): string {
  const segments = routeSegments(points);
  if (segments.length === 0) {
    return pointsToPath(points);
  }
  const commands = [`M ${segments[0]!.start.x} ${segments[0]!.start.y}`];
  for (const segment of segments) {
    let cursorDistance = 0;
    const segmentJumps = jumps.filter(jump => jump.segmentIndex === segment.index);
    for (const jump of segmentJumps) {
      const startDistance = Math.max(0, jump.segmentDistance - jumpSize);
      const endDistance = Math.min(segment.length, jump.segmentDistance + jumpSize);
      if (startDistance <= cursorDistance + 2 || endDistance >= segment.length - 1) {
        continue;
      }
      const jumpStart = pointAlongSegment(segment, startDistance);
      const jumpEnd = pointAlongSegment(segment, endDistance);
      const control = jumpControlPoint(segment, jump.point, jumpSize);
      commands.push(`L ${jumpStart.x} ${jumpStart.y}`);
      commands.push(`Q ${control.x} ${control.y} ${jumpEnd.x} ${jumpEnd.y}`);
      cursorDistance = endDistance;
    }
    commands.push(`L ${segment.end.x} ${segment.end.y}`);
  }
  return commands.join(" ");
}

function routeSegments(points: Array<{ x: number; y: number }>): RouteSegment[] {
  const segments: RouteSegment[] = [];
  for (let index = 0; index + 1 < points.length; index += 1) {
    const start = points[index]!;
    const end = points[index + 1]!;
    const length = pointDistance(start, end);
    if (length <= 0) {
      continue;
    }
    segments.push({ index, start, end, length });
  }
  return segments;
}

function segmentIntersection(left: RouteSegment, right: RouteSegment): { x: number; y: number } | undefined {
  const leftDx = left.end.x - left.start.x;
  const leftDy = left.end.y - left.start.y;
  const rightDx = right.end.x - right.start.x;
  const rightDy = right.end.y - right.start.y;
  const denominator = leftDx * rightDy - leftDy * rightDx;
  if (Math.abs(denominator) < 0.0001) {
    return undefined;
  }
  const dx = right.start.x - left.start.x;
  const dy = right.start.y - left.start.y;
  const leftT = (dx * rightDy - dy * rightDx) / denominator;
  const rightT = (dx * leftDy - dy * leftDx) / denominator;
  if (leftT <= 0.02 || leftT >= 0.98 || rightT <= 0.02 || rightT >= 0.98) {
    return undefined;
  }
  return {
    x: left.start.x + leftT * leftDx,
    y: left.start.y + leftT * leftDy,
  };
}

function pointAlongSegment(segment: RouteSegment, distance: number): { x: number; y: number } {
  const t = segment.length === 0 ? 0 : Math.max(0, Math.min(1, distance / segment.length));
  return {
    x: segment.start.x + (segment.end.x - segment.start.x) * t,
    y: segment.start.y + (segment.end.y - segment.start.y) * t,
  };
}

function jumpControlPoint(
  segment: RouteSegment,
  point: { x: number; y: number },
  jumpSize: number,
): { x: number; y: number } {
  const ux = (segment.end.x - segment.start.x) / segment.length;
  const uy = (segment.end.y - segment.start.y) / segment.length;
  return {
    x: point.x - uy * jumpSize,
    y: point.y + ux * jumpSize,
  };
}

function segmentsShareEndpoint(left: RouteSegment, right: RouteSegment): boolean {
  return pointDistance(left.start, right.start) < 2
    || pointDistance(left.start, right.end) < 2
    || pointDistance(left.end, right.start) < 2
    || pointDistance(left.end, right.end) < 2;
}

function pointDistance(left: { x: number; y: number }, right: { x: number; y: number }): number {
  return Math.hypot(right.x - left.x, right.y - left.y);
}

function relationshipLabelWidth(relationship: DiagramRelationship): number {
  return clampNumber(relationship.style?.width, 80, 800, 220);
}

function boundaryMetadataLabel(boundary: DiagramBoundary, configuration?: DiagramConfiguration): string | undefined {
  const metadata = boundaryMetadataText(boundary, configuration);
  return metadata ? formatMetadata(metadata, configuration) : undefined;
}

function boundaryMetadataText(boundary: DiagramBoundary, configuration?: DiagramConfiguration): string | undefined {
  if (boundary.kind === "Enterprise") {
    return configuration?.terminology?.enterprise || "Enterprise";
  }
  if (!boundary.kind || boundary.kind === "Boundary") {
    return undefined;
  }
  return terminologyForElementKind(boundary.kind, configuration);
}

function relationshipDashArray(style: DiagramRelationshipStyle | undefined, thickness: number): string | undefined {
  const lineStyle = normalizeRelationshipLineStyle(style);
  if (lineStyle === "Dashed") {
    return `${thickness * 4} ${thickness * 4}`;
  }
  if (lineStyle === "Dotted") {
    return `${thickness} ${thickness * 2}`;
  }
  return undefined;
}

function normalizeRelationshipLineStyle(style: DiagramRelationshipStyle | undefined): "Solid" | "Dashed" | "Dotted" {
  const value = String(style?.style ?? "").toLowerCase();
  if (value === "solid") {
    return "Solid";
  }
  if (value === "dotted") {
    return "Dotted";
  }
  if (value === "dashed") {
    return "Dashed";
  }
  return style?.dashed === false ? "Solid" : "Dashed";
}

function baseRelationshipId(id: string): string {
  return id.split(":", 1)[0] || id;
}

function elementMetadataLabel(element: DiagramElement, configuration?: DiagramConfiguration): string | undefined {
  const metadata = elementMetadataText(element, configuration);
  return metadata ? formatMetadata(metadata, configuration) : undefined;
}

function elementMetadataText(element: DiagramElement, configuration?: DiagramConfiguration): string | undefined {
  if (element.kind === "Custom" || element.tags?.includes("Custom")) {
    return element.metadata || element.technology || undefined;
  }

  const terminology = terminologyForElementKind(element.kind, configuration);
  const metadata = element.technology ? `${terminology}: ${element.technology}` : terminology;
  return element.instances ? `${metadata} x${element.instances}` : metadata;
}

function relationshipMetadataLabel(relationship: DiagramRelationship, configuration?: DiagramConfiguration): string | undefined {
  return relationship.technology ? formatMetadata(relationship.technology, configuration) : undefined;
}

function formatMetadata(value: string, configuration?: DiagramConfiguration): string {
  switch (configuration?.metadataSymbols ?? "SquareBrackets") {
    case "RoundBrackets":
      return `(${value})`;
    case "CurlyBrackets":
      return `{${value}}`;
    case "AngleBrackets":
      return `<${value}>`;
    case "DoubleAngleBrackets":
      return `<<${value}>>`;
    case "None":
      return value;
    case "SquareBrackets":
    default:
      return `[${value}]`;
  }
}

function terminologyForElementKind(kind: string, configuration?: DiagramConfiguration): string {
  const terminology = configuration?.terminology;
  switch (kind) {
    case "Enterprise":
      return terminology?.enterprise || "Enterprise";
    case "Person":
      return terminology?.person || "Person";
    case "Software System":
    case "Software System Instance":
      return terminology?.softwareSystem || "Software System";
    case "Container":
    case "Container Instance":
      return terminology?.container || "Container";
    case "Component":
      return terminology?.component || "Component";
    case "Deployment Node":
      return terminology?.deploymentNode || "Deployment Node";
    case "Infrastructure Node":
      return terminology?.infrastructureNode || "Infrastructure Node";
    default:
      return kind || "Element";
  }
}

function terminologyForRelationship(configuration?: DiagramConfiguration): string {
  return configuration?.terminology?.relationship || "Relationship";
}

function relationshipLabelLines(
  relationship: DiagramRelationship,
  maxWidth: number,
  fontSize: number,
  configuration?: DiagramConfiguration,
): string[] {
  const lines: string[] = [];
  const showDescription = relationship.style?.description !== false;
  const showMetadata = relationship.style?.metadata !== false;
  const description = showDescription
    ? relationship.order
      ? relationship.description
        ? `${relationship.order}. ${relationship.description}`
        : relationship.order
      : relationship.description
    : relationship.order;
  if (description) {
    lines.push(...wrapLabel(description, maxWidth, fontSize));
  }
  const metadata = relationshipMetadataLabel(relationship, configuration);
  if (showMetadata && metadata) {
    lines.push(...wrapLabel(metadata, maxWidth, Math.max(10, fontSize - 1)));
  }
  return lines.slice(0, 4);
}

function wrapLabel(value: string, maxWidth: number, fontSize: number): string[] {
  const words = String(value).split(/\s+/).filter(Boolean);
  const maxChars = Math.max(8, Math.floor(maxWidth / (fontSize * 0.58)));
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
    } else {
      if (current) {
        lines.push(current);
      }
      current = word;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines.length > 0 ? lines : [String(value)];
}

function normalizeShape(shape: string | undefined, kind: string): string {
  const value = String(shape || kind || "box").toLowerCase().replace(/[^a-z]/g, "");
  switch (value) {
    case "person":
      return "person";
    case "robot":
      return "robot";
    case "softwaresystem":
    case "softwaresysteminstance":
    case "deploymentnode":
    case "rounded":
    case "roundedbox":
      return "rounded";
    case "cylinder":
      return "cylinder";
    case "bucket":
      return "bucket";
    case "pipe":
      return "pipe";
    case "component":
      return "component";
    case "circle":
      return "circle";
    case "ellipse":
      return "ellipse";
    case "hexagon":
      return "hexagon";
    case "diamond":
      return "diamond";
    case "folder":
      return "folder";
    case "webbrowser":
      return "webbrowser";
    case "window":
      return "window";
    case "terminal":
      return "terminal";
    case "shell":
      return "shell";
    case "mobiledeviceportrait":
    case "mobileportrait":
      return "mobileportrait";
    case "mobiledevicelandscape":
    case "mobilelandscape":
      return "mobilelandscape";
    default:
      return "box";
  }
}

function normalizeIcon(icon: string | undefined): string | undefined {
  if (typeof icon !== "string") {
    return undefined;
  }
  const trimmed = icon.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeIconPosition(position: string | undefined): IconPosition {
  switch (String(position || "bottom").toLowerCase()) {
    case "top":
      return "top";
    case "left":
      return "left";
    case "right":
      return "right";
    default:
      return "bottom";
  }
}

function normalizeOpacity(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 1;
  }
  if (value > 1) {
    return Math.max(0, Math.min(1, value / 100));
  }
  return Math.max(0, Math.min(1, value));
}

function clampNumber(value: number | undefined, min: number, max: number, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, value));
}

function strokeColorFromBorder(border: string | undefined): string | undefined {
  if (!border || !/^#[0-9a-f]{3,8}$/iu.test(border)) {
    return undefined;
  }
  return border;
}

function borderIsDashed(border: string | undefined): boolean {
  return /^(dashed|dotted)$/iu.test(border || "");
}

function strokeForFill(fill: string, fallback: string): string {
  if (!/^#[0-9a-f]{6}$/iu.test(fill)) {
    return fallback;
  }
  const red = Number.parseInt(fill.slice(1, 3), 16);
  const green = Number.parseInt(fill.slice(3, 5), 16);
  const blue = Number.parseInt(fill.slice(5, 7), 16);
  const shade = (channel: number) => Math.max(0, Math.floor(channel * 0.72));
  return `#${shade(red).toString(16).padStart(2, "0")}${shade(green).toString(16).padStart(2, "0")}${shade(blue).toString(16).padStart(2, "0")}`;
}

function firstErrorLine(error: string): string {
  return error.split(/\r?\n/).find(line => line.trim())?.trim() || "Unknown Structurizr DSL preview error.";
}

function warningSummary(warnings: string[]): string {
  const [first, ...rest] = warnings;
  return rest.length > 0 ? `${first} (+${rest.length} more)` : first ?? "";
}

function isImageView(view: DiagramView): boolean {
  return view.type === "image" && !!view.image;
}

function isImageContent(content: string, contentType: string): boolean {
  return content.startsWith("data:image/")
    || /^(https?:)?\/\//iu.test(content)
    || contentType.toLowerCase().startsWith("image/");
}

function formatViewOptionLabel(view: DiagramView): string {
  const title = view.title && view.title !== view.key ? `: ${view.title}` : "";
  return `${formatViewType(view.type)}${title} (#${view.key})`;
}

function formatViewType(type: string): string {
  switch (type) {
    case "systemLandscape":
      return "System Landscape View";
    case "systemContext":
      return "System Context View";
    case "container":
      return "Container View";
    case "component":
      return "Component View";
    case "dynamic":
      return "Dynamic View";
    case "deployment":
      return "Deployment View";
    case "filtered":
      return "Filtered View";
    case "custom":
      return "Custom View";
    case "image":
      return "Image View";
    default:
      return `${type.replace(/([a-z])([A-Z])/gu, "$1 $2") || "Diagram"} View`;
  }
}

function buildAskAgentPrompt(error: string, targetFilePath?: string): string {
  const details = error.trim().length > 6000 ? `${error.trim().slice(0, 6000)}\n... [truncated]` : error.trim();
  return [
    "The Structurizr DSL preview has the following error:",
    "",
    details || "Unknown Structurizr DSL preview error.",
    "",
    targetFilePath ? `Target file: ${targetFilePath}` : "",
    "",
    "Please fix the Structurizr DSL syntax so it can be parsed by the official Structurizr DSL format.",
    "Important: model elements such as person/softwareSystem/container/component must be inside a model block, and views must be inside a views block.",
  ].filter(Boolean).join("\n");
}

function fileName(filePath: string): string {
  return filePath.split(/[\\/]/).pop() || filePath;
}
