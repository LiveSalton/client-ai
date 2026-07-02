import { type CSSProperties, type ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Banner,
  Card,
  CardBody,
  CardHeader,
  Grid,
  H2,
  H3,
  Row,
  Stack,
  Text,
  useCanvasAction,
  useCanvasState,
  useCanvasTargetFilePath,
  useHostTheme,
} from "qoder/canvas";

interface DesignMdTokenEntry {
  name: string;
  value: string;
}

interface DesignMdTokenGroup {
  group: string;
  count: number;
  source: string;
  entries: DesignMdTokenEntry[];
}

interface DesignMdSection {
  level: number;
  title: string;
  rawTitle: string;
  excerpt: string;
  wordCount: number;
  completeness: "empty" | "thin" | "ready";
}

interface DesignMdComponent {
  name: string;
  variants: string[];
  states: string[];
  rules: string[];
  source: string;
}

interface DesignMdState {
  name: string;
  components: string[];
  requirement: string;
  source: string;
}

interface DesignMdRule {
  kind: string;
  text: string;
  source: string;
}

interface DesignMdDecision {
  text: string;
  source: string;
}

interface DesignMdWarning {
  severity: "danger" | "warning" | "info";
  message: string;
}

interface DesignMdColorToken {
  name: string;
  value: string;
  role: string;
  family: string;
  luminance: number | null;
  contrastOnWhite: number | null;
  contrastOnBlack: number | null;
  isDisplayable: boolean;
}

interface DesignMdTypographyToken {
  name: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  properties: Array<{ property: string; value: string }>;
}

interface DesignMdScaleToken {
  name: string;
  value: string;
  kind: string;
  numericValue: number | null;
  unit: string;
}

interface DesignMdOptionToken {
  name: string;
  value: string;
  enabled: boolean | null;
}

interface DesignMdComponentToken {
  name: string;
  category: string;
  state: string;
  properties: Array<{
    property: string;
    value: string;
    reference: string;
    resolvedGroup: string;
  }>;
}

interface DesignMdReference {
  path: string;
  group: string;
  count: number;
}

interface DesignMdContrastPair {
  background: string;
  foreground: string;
  backgroundValue: string;
  foregroundValue: string;
  ratio: number;
  grade: "AAA" | "AA" | "Large" | "Fail";
}

interface DesignMdDesignSystem {
  schemaVersion: number;
  schemaKeys: string[];
  presentSchemaKeys: string[];
  extensionKeys: string[];
  unknownKeys: string[];
  name: string;
  description: string;
  version: string;
  colors: DesignMdColorToken[];
  typography: DesignMdTypographyToken[];
  rounded: DesignMdScaleToken[];
  spacing: DesignMdScaleToken[];
  layout: DesignMdScaleToken[];
  options: DesignMdOptionToken[];
  components: DesignMdComponentToken[];
  references: DesignMdReference[];
  contrastPairs: DesignMdContrastPair[];
  componentPropertyCounts: Array<{ property: string; count: number }>;
}

interface DesignFoundation {
  background: string;
  foreground: string;
  primary: string;
  onPrimary: string;
  secondary: string;
  link: string;
  border: string;
  surface: string;
  radius: string;
  spacing: string;
  contentWidth: string;
  headingFont: string;
  bodyFont: string;
  titleSize: string;
  baseSize: string;
  lineHeight: string;
  headingWeight: string;
}

interface DesignMdViewerData {
  schemaVersion: number;
  parserVersion?: number;
  sourcePath: string;
  updatedAt?: string;
  title: string;
  tokens: DesignMdTokenGroup[];
  sections: DesignMdSection[];
  components: DesignMdComponent[];
  states: DesignMdState[];
  rules: DesignMdRule[];
  openDecisions: DesignMdDecision[];
  designSystem: DesignMdDesignSystem;
  warnings: DesignMdWarning[];
  error?: string | null;
}

const DATA_KEY = "aicoding.formatViewer.designMd";
const VIEWER_PARSER_VERSION = 5;
const EMPTY_DATA: DesignMdViewerData = {
  schemaVersion: 1,
  parserVersion: VIEWER_PARSER_VERSION,
  sourcePath: "",
  title: "DESIGN.md",
  tokens: [],
  sections: [],
  components: [],
  states: [],
  rules: [],
  openDecisions: [],
  designSystem: emptyDesignSystem(),
  warnings: [],
  error: null,
};

export default function DesignMdFormatViewer() {
  const { tokens } = useHostTheme();
  const dispatch = useCanvasAction();
  const targetFilePath = useCanvasTargetFilePath();
  const [data] = useCanvasState<DesignMdViewerData>(DATA_KEY, EMPTY_DATA);
  const requestedTargetRef = useRef<string | undefined>(undefined);

  const runParser = useCallback((target: string) => {
    requestedTargetRef.current = target;
    dispatch({
      type: "aicoding.canvas.runScript",
      script: "scripts/index.mjs",
      args: { targetFilePath: target },
    });
  }, [dispatch]);

  useEffect(() => {
    if (!targetFilePath) {
      return;
    }
    if (requestedTargetRef.current === targetFilePath && data.parserVersion === VIEWER_PARSER_VERSION) return;
    if (data.sourcePath === targetFilePath && data.parserVersion === VIEWER_PARSER_VERSION) return;
    runParser(targetFilePath);
  }, [data.parserVersion, data.sourcePath, runParser, targetFilePath]);

  const isCurrentTarget = !!targetFilePath && data.sourcePath === targetFilePath;
  const designSystem = data.designSystem ?? emptyDesignSystem();
  const foundation = useMemo(() => buildFoundation(designSystem, tokens), [designSystem, tokens]);

  return (
    <Stack
      gap={0}
      style={{
        position: "fixed",
        inset: 0,
        overflow: "auto",
        background: tokens.bg.editor,
        color: tokens.text.primary,
        "--dmv-primary": foundation.primary,
      } as CSSProperties}
    >
      <DesignMdStyles />
      {data.error && isCurrentTarget ? (
        <Banner tone="danger">{data.error}</Banner>
      ) : null}

      {targetFilePath && !isCurrentTarget && !data.error ? (
        <Banner tone="info">Loading DESIGN.md...</Banner>
      ) : null}

      {isCurrentTarget ? (
        <Stack
          gap={0}
          style={{
            width: "100%",
            margin: 0,
            padding: 0,
            boxSizing: "border-box",
          }}
        >
          <DesignSystemSpecimen data={data} designSystem={designSystem} foundation={foundation} />

          <Stack
            gap={12}
            style={{
              width: "min(1440px, 100%)",
              margin: "0 auto",
              padding: "16px 24px 24px",
              boxSizing: "border-box",
            }}
          >
            <SupplementalSections data={data} />
          </Stack>
        </Stack>
      ) : !data.error && !targetFilePath ? (
        <Banner tone="info">Open a DESIGN.md file</Banner>
      ) : null}
    </Stack>
  );
}

const DMV_CSS = `
@keyframes dmv-fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes dmv-bar-grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
.dmv-fade { animation: dmv-fade-up 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; }
.dmv-d1 { animation-delay: 0.06s; }
.dmv-d2 { animation-delay: 0.14s; }
.dmv-d3 { animation-delay: 0.22s; }
.dmv-nav-link {
  position: relative;
  opacity: 0.74;
  transition: opacity 0.18s ease;
}
.dmv-nav-link::after {
  content: "";
  position: absolute;
  left: 0;
  right: 100%;
  bottom: -6px;
  height: 2px;
  border-radius: 2px;
  background: var(--dmv-primary);
  transition: right 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.dmv-nav-link:hover { opacity: 1; }
.dmv-nav-link:hover::after { right: 0; }
.dmv-cta {
  cursor: pointer;
  transition: transform 0.18s ease, filter 0.18s ease, box-shadow 0.18s ease;
}
.dmv-cta:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
  box-shadow: 0 6px 18px color-mix(in srgb, var(--dmv-primary) 35%, transparent);
}
.dmv-swatch {
  transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s ease;
}
.dmv-swatch:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
}
.dmv-bar {
  transform-origin: left center;
  animation: dmv-bar-grow 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.dmv-lift {
  transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s ease;
}
.dmv-lift:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.10);
}
@media (prefers-reduced-motion: reduce) {
  .dmv-fade, .dmv-bar { animation: none; }
  .dmv-nav-link, .dmv-nav-link::after, .dmv-cta, .dmv-swatch, .dmv-lift { transition: none; }
}
`;

function DesignMdStyles() {
  return <style>{DMV_CSS}</style>;
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  const { tokens } = useHostTheme();
  return (
    <Card>
      <CardHeader
        title={
          <Row gap={10} align="center">
            <span style={{ width: 4, height: 16, borderRadius: 2, background: tokens.accent.control, flexShrink: 0 }} />
            <H2>{title}</H2>
          </Row>
        }
      />
      <CardBody>{children}</CardBody>
    </Card>
  );
}

function SupplementalSections({
  data,
}: {
  data: DesignMdViewerData;
}) {
  const dos = data.rules.filter(rule => rule.kind === "Do");
  const donts = data.rules.filter(rule => rule.kind === "Don't");
  const others = data.rules.filter(rule => rule.kind !== "Do" && rule.kind !== "Don't");
  const showRules = data.rules.length > 0;
  const showDecisions = data.openDecisions.length > 0;
  const showWarnings = data.warnings.length > 0;
  if (!showRules && !showDecisions && !showWarnings) return null;
  return (
    <Stack gap={12}>
      {showRules ? (
        <SectionCard title="Implementation Rules">
          <Stack gap={16}>
            <Grid columns="repeat(auto-fit, minmax(min(320px, 100%), 1fr))" gap={20} style={{ alignItems: "start" }}>
              {dos.length > 0 ? <RuleColumn tone="success" title="Do" rules={dos} /> : null}
              {donts.length > 0 ? <RuleColumn tone="danger" title="Don't" rules={donts} /> : null}
            </Grid>
            {others.length > 0 ? <RuleColumn tone="neutral" title="Guidelines" rules={others} /> : null}
          </Stack>
        </SectionCard>
      ) : null}

      {showDecisions ? (
        <SectionCard title="Open Decisions">
          <Grid columns="repeat(auto-fit, minmax(min(380px, 100%), 1fr))" gap={10} style={{ alignItems: "start" }}>
            {data.openDecisions.map((decision, index) => (
              <OpenDecisionItem key={`${decision.text}-${index}`} text={decision.text} />
            ))}
          </Grid>
        </SectionCard>
      ) : null}

      {showWarnings ? (
        <SectionCard title="Diagnostics">
          <DiagnosticsList warnings={data.warnings} />
        </SectionCard>
      ) : null}
    </Stack>
  );
}

function RuleColumn({ tone, title, rules }: { tone: "success" | "danger" | "neutral"; title: string; rules: DesignMdRule[] }) {
  const { tokens } = useHostTheme();
  const color = tone === "success" ? tokens.status.success : tone === "danger" ? tokens.status.danger : tokens.text.tertiary;
  const bg = tone === "success" ? tokens.status.successBg : tone === "danger" ? tokens.status.dangerBg : tokens.fill.tertiary;
  const mark = tone === "success" ? "✓" : tone === "danger" ? "✕" : "•";
  return (
    <Stack gap={10}>
      <Row gap={8} align="center">
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 18,
            height: 18,
            borderRadius: 999,
            background: bg,
            color,
            fontSize: 11,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {mark}
        </span>
        <Text weight="semibold" style={{ color, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>{title}</Text>
      </Row>
      <Stack gap={8}>
        {rules.slice(0, 12).map((rule, index) => (
          <div
            key={`${rule.kind}-${rule.text}-${index}`}
            style={{
              borderLeft: `2px solid color-mix(in srgb, ${color} 45%, transparent)`,
              paddingLeft: 10,
            }}
          >
            <Text style={{ lineHeight: "1.5" }}>
              {tone === "neutral" && rule.kind !== "Rule" ? (
                <span style={{ color: tokens.text.tertiary, fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", marginRight: 6 }}>{rule.kind}</span>
              ) : null}
              {renderInlineCode(rule.text, tokens)}
            </Text>
          </div>
        ))}
      </Stack>
    </Stack>
  );
}

function OpenDecisionItem({ text }: { text: string }) {
  const { tokens } = useHostTheme();
  return (
    <Row gap={10} align="start">
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 18,
          height: 18,
          borderRadius: 999,
          background: tokens.status.warningBg,
          color: tokens.status.warning,
          fontSize: 11,
          fontWeight: 700,
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        ?
      </span>
      <Text style={{ lineHeight: "1.5" }}>{renderInlineCode(text, tokens)}</Text>
    </Row>
  );
}

function renderInlineCode(text: string, tokens: ReturnType<typeof useHostTheme>["tokens"]): ReactNode[] {
  return text.split(/(`[^`]+`)/u).map((part, index) =>
    part.length > 2 && part.startsWith("`") && part.endsWith("`") ? (
      <span
        key={index}
        style={{
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: "0.92em",
          background: tokens.fill.tertiary,
          borderRadius: 4,
          padding: "0 4px",
          whiteSpace: "nowrap",
        }}
      >
        {part.slice(1, -1)}
      </span>
    ) : (
      part
    ),
  );
}

function DiagnosticsList({ warnings }: { warnings: DesignMdWarning[] }) {
  const { tokens } = useHostTheme();
  const dotColor = (severity: DesignMdWarning["severity"]) =>
    severity === "danger" ? tokens.status.danger : severity === "warning" ? tokens.status.warning : tokens.status.info;
  return (
    <Stack gap={6}>
      {warnings.map((warning, index) => (
        <Row key={`${warning.message}-${index}`} gap={8} align="start">
          <span style={{ width: 8, height: 8, borderRadius: 999, background: dotColor(warning.severity), flexShrink: 0, marginTop: 5 }} />
          <Text size="small" tone="secondary" style={{ lineHeight: "1.5" }}>{warning.message}</Text>
        </Row>
      ))}
    </Stack>
  );
}

function DesignSystemSpecimen({
  data,
  designSystem,
  foundation,
}: {
  data: DesignMdViewerData;
  designSystem: DesignMdDesignSystem;
  foundation: DesignFoundation;
}) {
  const { tokens } = useHostTheme();
  return (
    <Stack gap={0}>
      <Stack
        gap={24}
        style={{
          overflow: "hidden",
          backgroundColor: foundation.background,
          backgroundImage: `radial-gradient(1100px 460px at 82% -12%, color-mix(in srgb, ${foundation.primary} 14%, transparent), transparent 70%)`,
          color: foundation.foreground,
          minHeight: "min(680px, 92vh)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <HeroNavigator foundation={foundation} />
        <Stack
          gap={18}
          style={{
            maxWidth: "min(calc(100% - 48px), 1280px)",
            width: "100%",
            margin: "0 auto",
            padding: "56px 0 64px",
            boxSizing: "border-box",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <Grid columns="repeat(auto-fit, minmax(min(420px, 100%), 1fr))" gap={32} align="center">
            <Stack gap={18} style={{ maxWidth: foundation.contentWidth, minWidth: 0 }}>
              <div className="dmv-fade">
                <Row align="center" justify="space-between" gap={16} wrap>
                  <span
                    style={{
                      border: `1px solid color-mix(in srgb, ${foundation.primary} 45%, transparent)`,
                      background: `color-mix(in srgb, ${foundation.primary} 10%, transparent)`,
                      borderRadius: 999,
                      padding: "4px 12px",
                      color: foundation.foreground,
                      fontFamily: foundation.bodyFont,
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {designSystem.version || "design system"}
                  </span>
                  <Row gap={8} wrap>
                    {designSystem.options.slice(0, 4).map(option => (
                      <span
                        key={option.name}
                        style={{
                          border: `1px solid ${foundation.border}`,
                          borderRadius: foundation.radius,
                          padding: "4px 8px",
                          color: option.enabled === false ? foundation.secondary : foundation.foreground,
                          fontFamily: foundation.bodyFont,
                          fontSize: 12,
                        }}
                      >
                        {option.name}
                      </span>
                    ))}
                  </Row>
                </Row>
              </div>
              <div className="dmv-fade dmv-d1">
                <Stack gap={10}>
                  <Text
                    weight="bold"
                    style={{
                      color: foundation.foreground,
                      fontFamily: foundation.headingFont,
                      fontSize: clampCssLength(foundation.titleSize, 36, 72),
                      lineHeight: "1.05",
                      letterSpacing: "-0.02em",
                      fontWeight: Number(foundation.headingWeight) || 700,
                    }}
                  >
                    {designSystem.name || data.title || "DESIGN.md"}
                  </Text>
                  <Text
                    style={{
                      color: foundation.secondary,
                      fontFamily: foundation.bodyFont,
                      fontSize: foundation.baseSize,
                      lineHeight: foundation.lineHeight,
                      maxWidth: 720,
                    }}
                  >
                    {designSystem.description || "Design language preview composed from local DESIGN.md tokens."}
                  </Text>
                </Stack>
              </div>
              <div className="dmv-fade dmv-d2">
                <Row gap={12} align="center" wrap>
                  <span className="dmv-cta" style={componentCss(pickComponent(designSystem.components, ["button-primary", "button", "cta"]), designSystem, foundation, "action")}>
                    {actionLabel(pickComponent(designSystem.components, ["button-primary", "button", "cta"]))}
                  </span>
                  <span
                    style={{
                      color: foundation.link,
                      fontFamily: foundation.bodyFont,
                      fontSize: foundation.baseSize,
                    }}
                  >
                    {pickComponent(designSystem.components, ["text-link", "link"])?.name || "Learn more"}
                  </span>
                </Row>
              </div>
            </Stack>
            <HeroProductPreview designSystem={designSystem} foundation={foundation} />
          </Grid>
        </Stack>
      </Stack>

      <Stack
        gap={12}
        style={{
          width: "min(1440px, 100%)",
          margin: "0 auto",
          padding: "16px 24px 0",
          boxSizing: "border-box",
        }}
      >
        <div id="design-md-colors" style={{ scrollMarginTop: 72 }}>
          <SectionCard title="Colors">
            <PaletteBoard colors={designSystem.colors} />
          </SectionCard>
        </div>

        <div id="design-md-typography" style={{ scrollMarginTop: 72 }}>
          <SectionCard title="Typography">
            <TypeSpecimen typography={designSystem.typography} foundation={foundation} />
          </SectionCard>
        </div>

        <div id="design-md-components" style={{ scrollMarginTop: 72 }}>
          <SectionCard title="Components">
            <ComponentGallery designSystem={designSystem} foundation={foundation} />
          </SectionCard>
        </div>

        <div id="design-md-responsive" style={{ scrollMarginTop: 72 }}>
          <SectionCard title="Responsive">
            <Stack gap={16}>
              <ScaleStrip title="Spacing" tokens={designSystem.spacing.length > 0 ? designSystem.spacing : designSystem.layout.filter(item => /spacing|gap|margin|padding/u.test(item.name.toLowerCase()))} />
              <ScaleStrip title="Rounded" variant="shape" tokens={designSystem.rounded.length > 0 ? designSystem.rounded : designSystem.layout.filter(item => /radius|round/u.test(item.name.toLowerCase()))} />
              <ScaleStrip title="Layout" tokens={designSystem.layout} />
            </Stack>
          </SectionCard>
        </div>

      </Stack>
    </Stack>
  );
}

function PaletteBoard({ colors }: { colors: DesignMdColorToken[] }) {
  if (colors.length === 0) return <EmptyText>No color tokens detected.</EmptyText>;
  const groups = groupBy(colors, color => color.role);
  return (
    <Stack gap={14}>
      {Object.entries(groups).map(([role, roleColors]) => (
        <Stack key={role} gap={8}>
          <Row align="end" gap={8}>
            <H3>{titleCase(role)}</H3>
            <Text size="small" tone="tertiary">{roleColors.length}</Text>
          </Row>
          <Grid columns="repeat(auto-fit, minmax(170px, 1fr))" gap={8}>
            {roleColors.map(color => (
              <ColorSwatch key={`${color.name}-${color.value}`} color={color} />
            ))}
          </Grid>
        </Stack>
      ))}
    </Stack>
  );
}

function TypeSpecimen({ typography, foundation }: { typography: DesignMdTypographyToken[]; foundation: DesignFoundation }) {
  if (typography.length === 0) return <EmptyText>No typography tokens detected.</EmptyText>;
  const display = typography.find(token => /display|hero|headline|title|h1/u.test(token.name.toLowerCase())) || typography[0];
  const body = typography.find(token => /body|paragraph|base/u.test(token.name.toLowerCase())) || typography[1] || typography[0];
  const label = typography.find(token => /caption|label|mono|nav|button/u.test(token.name.toLowerCase())) || typography[2] || body;
  const sampleLabelStyle: CSSProperties = {
    color: foundation.secondary,
    fontFamily: foundation.bodyFont,
    fontSize: 11,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  };
  return (
    <Stack gap={16}>
      <Stack
        gap={18}
        style={{
          background: foundation.background,
          border: `1px solid ${foundation.border}`,
          borderRadius: 10,
          padding: "22px 24px",
          boxSizing: "border-box",
        }}
      >
        <Stack gap={8}>
          <Text size="small" style={sampleLabelStyle}>{display.name}</Text>
          <Text style={typographyStyle(display, foundation, "display")}>
            Build interfaces from a consistent visual language.
          </Text>
        </Stack>
        <Stack gap={6}>
          <Text size="small" style={sampleLabelStyle}>{body.name}</Text>
          <Text style={typographyStyle(body, foundation, "body")}>
            Body text demonstrates the actual family, size, weight, and rhythm used for dense product copy.
          </Text>
        </Stack>
        <Stack gap={6}>
          <Text size="small" style={sampleLabelStyle}>{label.name}</Text>
          <Text style={typographyStyle(label, foundation, "label")}>
            SYSTEM LABEL / METADATA / UI CHROME
          </Text>
        </Stack>
      </Stack>
      <Stack gap={8}>
        {typography.map(type => (
          <TypographyRow key={type.name} token={type} />
        ))}
      </Stack>
    </Stack>
  );
}

function HeroNavigator({ foundation }: { foundation: DesignFoundation }) {
  const items = [
    { label: "Colors", target: "design-md-colors" },
    { label: "Typography", target: "design-md-typography" },
    { label: "Components", target: "design-md-components" },
    { label: "Responsive", target: "design-md-responsive" },
  ];
  return (
    <Row
      align="center"
      justify="center"
      gap={16}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 5,
        minHeight: 56,
        padding: "0 24px",
        borderBottom: `1px solid ${foundation.border}`,
        background: `color-mix(in srgb, ${foundation.background} 82%, transparent)`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: foundation.foreground,
        boxSizing: "border-box",
      }}
    >
      <Row align="center" justify="center" gap={28}>
        {items.map(item => (
          <button
            key={item.target}
            type="button"
            className="dmv-nav-link"
            onClick={() => scrollToSection(item.target)}
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              margin: 0,
              color: foundation.foreground,
              cursor: "pointer",
              fontFamily: foundation.bodyFont,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.04em",
              lineHeight: foundation.lineHeight,
            }}
          >
            {item.label}
          </button>
        ))}
      </Row>
    </Row>
  );
}

function HeroProductPreview({ designSystem, foundation }: { designSystem: DesignMdDesignSystem; foundation: DesignFoundation }) {
  const surface = pickComponent(designSystem.components, ["card", "product-tile-light", "product-tile", "hero", "surface"]);
  const surfaceStyle = componentCss(surface, designSystem, foundation, "surface");
  const background = String(surfaceStyle.background || foundation.surface);
  const foreground = String(surfaceStyle.color || foundation.foreground);
  const action = pickComponent(designSystem.components, ["button-primary", "button", "cta"]);
  const chips = designSystem.colors.filter(color => color.isDisplayable).slice(0, 6);
  const skeleton = (width: string) => ({
    display: "block" as const,
    width,
    height: 9,
    borderRadius: 999,
    background: `color-mix(in srgb, ${foreground} 14%, transparent)`,
  });
  return (
    <div className="dmv-fade dmv-d2" style={{ minWidth: 0 }}>
      <Stack
        gap={0}
        style={{
          borderRadius: scaleValue(designSystem, ["lg", "card", "md"], foundation.radius),
          border: `1px solid ${foundation.border}`,
          background,
          color: foreground,
          overflow: "hidden",
          boxShadow: `0 24px 60px color-mix(in srgb, ${foundation.foreground} 12%, transparent)`,
          boxSizing: "border-box",
        }}
      >
        <Row
          align="center"
          gap={8}
          style={{
            padding: "12px 18px",
            borderBottom: `1px solid ${foundation.border}`,
          }}
        >
          {[0, 1, 2].map(dot => (
            <span
              key={dot}
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: `color-mix(in srgb, ${foreground} ${dot === 0 ? 30 : 18}%, transparent)`,
              }}
            />
          ))}
          <Text size="small" style={{ color: foundation.secondary, fontFamily: foundation.bodyFont, marginLeft: 8 }} truncate>
            {designSystem.name || "Preview"}
          </Text>
        </Row>
        <Stack gap={16} style={{ padding: "26px 24px 24px", boxSizing: "border-box" }}>
          <Text
            size="small"
            style={{
              color: foundation.secondary,
              fontFamily: foundation.bodyFont,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Composed from tokens
          </Text>
          <Text
            weight="semibold"
            style={{
              color: foreground,
              fontFamily: foundation.headingFont,
              fontSize: 22,
              lineHeight: "1.2",
            }}
          >
            Every pixel below is resolved from DESIGN.md
          </Text>
          <Stack gap={8}>
            <span style={skeleton("94%")} />
            <span style={skeleton("78%")} />
            <span style={skeleton("60%")} />
          </Stack>
          <Row gap={12} align="center" wrap>
            <span style={{ ...componentCss(action, designSystem, foundation, "action"), minHeight: 32, fontSize: 13 }}>
              {actionLabel(action)}
            </span>
            <Text size="small" style={{ color: foundation.link, fontFamily: foundation.bodyFont }}>
              Learn more
            </Text>
          </Row>
          {chips.length > 0 ? (
            <Row gap={6} align="center" wrap style={{ paddingTop: 6, borderTop: `1px solid ${foundation.border}` }}>
              {chips.map(chip => (
                <span
                  key={`${chip.name}-${chip.value}`}
                  title={chip.name}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: scaleValue(designSystem, ["sm", "md"], "6px"),
                    background: chip.value,
                    border: `1px solid color-mix(in srgb, ${foreground} 16%, transparent)`,
                  }}
                />
              ))}
              <Text size="small" style={{ color: foundation.secondary, fontFamily: foundation.bodyFont, marginLeft: 4 }}>
                {designSystem.colors.length} colors
              </Text>
            </Row>
          ) : null}
        </Stack>
      </Stack>
    </div>
  );
}

function ComponentGallery({ designSystem, foundation }: { designSystem: DesignMdDesignSystem; foundation: DesignFoundation }) {
  if (designSystem.components.length === 0) return <EmptyText>No component tokens detected.</EmptyText>;
  const groups = groupBy(designSystem.components, component => component.category);
  const order = ["action", "navigation", "surface", "form", "layout", "data", "component"];
  const entries = Object.entries(groups).sort(([a], [b]) => orderIndex(order, a) - orderIndex(order, b));
  return (
    <Stack gap={18}>
      {entries.map(([category, components]) => (
        <Stack key={category} gap={10}>
          <Row align="end" gap={8}>
            <H3>{titleCase(category)}</H3>
            <Text size="small" tone="tertiary">{components.length}</Text>
          </Row>
          <Grid columns={`repeat(auto-fit, minmax(${category === "surface" || category === "layout" ? "280px" : "180px"}, 1fr))`} gap={10}>
            {components.map(component => (
              <RenderedComponent
                key={component.name}
                component={component}
                designSystem={designSystem}
                foundation={foundation}
              />
            ))}
          </Grid>
        </Stack>
      ))}
    </Stack>
  );
}

function SpecimenFrame({ label, category, minHeight, children }: { label: string; category?: string; minHeight: number; children: ReactNode }) {
  const { tokens } = useHostTheme();
  return (
    <div
      className="dmv-lift"
      style={{
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${tokens.stroke.tertiary}`,
        borderRadius: tokens.radius.sm,
        background: tokens.bg.elevated,
        overflow: "hidden",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 14,
          minHeight,
          minWidth: 0,
          boxSizing: "border-box",
          backgroundImage: `radial-gradient(color-mix(in srgb, ${tokens.text.tertiary} 28%, transparent) 1px, transparent 1.5px)`,
          backgroundSize: "12px 12px",
        }}
      >
        {children}
      </div>
      <Row
        align="center"
        justify="space-between"
        gap={8}
        style={{ borderTop: `1px solid ${tokens.stroke.tertiary}`, padding: "5px 10px" }}
      >
        <Text size="small" tone="secondary" truncate style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 11 }}>
          {label}
        </Text>
        {category ? (
          <Text size="small" tone="tertiary" style={{ fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            {category}
          </Text>
        ) : null}
      </Row>
    </div>
  );
}

function RenderedComponent({
  component,
  designSystem,
  foundation,
}: {
  component?: DesignMdComponentToken;
  designSystem: DesignMdDesignSystem;
  foundation: DesignFoundation;
}) {
  const mode = componentMode(component);
  const style = componentCss(component, designSystem, foundation, mode);
  const textColor = String(style.color || foundation.foreground);
  const label = component?.name || "component";
  if (mode === "action") {
    return (
      <SpecimenFrame label={label} category={component?.state || undefined} minHeight={104}>
        <span style={style}>{actionLabel(component)}</span>
      </SpecimenFrame>
    );
  }
  if (mode === "input") {
    return (
      <SpecimenFrame label={label} minHeight={104}>
        <Row align="center" justify="space-between" gap={8} style={{ ...style, minHeight: 42, width: "100%", justifyContent: "space-between" }}>
          <Text style={{ color: textColor, fontFamily: foundation.bodyFont }} truncate>{inputLabel(component)}</Text>
          <span style={{ width: 12, height: 12, borderRadius: 999, background: foundation.border, flexShrink: 0 }} />
        </Row>
      </SpecimenFrame>
    );
  }
  if (mode === "navigation") {
    return (
      <SpecimenFrame label={label} minHeight={104}>
        <Row align="center" justify="space-between" gap={10} style={{ ...style, minHeight: componentSize(component) || 44, width: "100%" }}>
          <Text style={{ color: textColor, fontFamily: foundation.bodyFont }} weight="semibold" truncate>{(designSystem.name || "Brand").split(/[\s-]/u)[0] || "Brand"}</Text>
          <Row gap={8}>
            <Text style={{ color: textColor, fontFamily: foundation.bodyFont }} size="small">Home</Text>
            <Text style={{ color: textColor, fontFamily: foundation.bodyFont }} size="small">Docs</Text>
            <Text style={{ color: textColor, fontFamily: foundation.bodyFont }} size="small">Buy</Text>
          </Row>
        </Row>
      </SpecimenFrame>
    );
  }
  return (
    <SpecimenFrame label={label} minHeight={176}>
      <Stack gap={10} style={{ ...style, minHeight: 132, width: "100%", padding: compactPadding(String(style.padding || "")) }}>
        <Text style={{ color: textColor, fontFamily: foundation.headingFont }} weight="semibold" truncate>
          {displayComponentTitle(component)}
        </Text>
        <Text style={{ color: textColor, fontFamily: foundation.bodyFont, lineHeight: foundation.lineHeight }} size="small">
          {componentDescription(component)}
        </Text>
        {mode === "surface" || mode === "layout" ? (
          <>
            <Row gap={8} align="center" wrap>
              <span style={miniActionCss(designSystem, foundation)}>Buy</span>
              <Text style={{ color: textColor, fontFamily: foundation.bodyFont }} size="small">Learn more</Text>
            </Row>
            <span style={productSilhouetteCss(component, foundation)} />
          </>
        ) : null}
      </Stack>
    </SpecimenFrame>
  );
}

function EmptyText({ children }: { children: ReactNode }) {
  return <Text tone="secondary">{children}</Text>;
}

function ColorSwatch({ color }: { color: DesignMdColorToken }) {
  const { tokens } = useHostTheme();
  const swatchText = color.isDisplayable ? contrastText(color.value, tokens.text.primary, tokens.text.onAccent) : tokens.text.primary;
  return (
    <div
      className="dmv-swatch"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        border: `1px solid ${tokens.stroke.tertiary}`,
        borderRadius: tokens.radius.sm,
        overflow: "hidden",
        background: tokens.bg.elevated,
        minWidth: 0,
      }}
    >
      <Stack
        gap={4}
        style={{
          minHeight: 88,
          padding: 12,
          background: color.isDisplayable ? color.value : tokens.fill.tertiary,
          color: swatchText,
          justifyContent: "end",
        }}
      >
        <Text weight="semibold" style={{ color: swatchText }}>{color.name}</Text>
        <Text size="small" style={{ color: swatchText, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", opacity: 0.9 }}>{color.value}</Text>
      </Stack>
      <Row gap={4} align="center" style={{ padding: "0 10px 10px", minWidth: 0 }}>
        {color.contrastOnWhite ? <ContrastChip label="W" ratio={color.contrastOnWhite} /> : null}
        {color.contrastOnBlack ? <ContrastChip label="B" ratio={color.contrastOnBlack} /> : null}
        <span style={{ flex: 1 }} />
        <Text size="small" tone="tertiary" truncate style={{ fontSize: 10, letterSpacing: "0.04em", textTransform: "uppercase" }}>{color.family}</Text>
      </Row>
    </div>
  );
}

function ContrastChip({ label, ratio }: { label: string; ratio: number }) {
  const { tokens } = useHostTheme();
  const pass = ratio >= 4.5;
  return (
    <span
      style={{
        fontSize: 10,
        lineHeight: "14px",
        fontFamily: "ui-monospace, Menlo, monospace",
        padding: "1px 5px",
        borderRadius: 4,
        background: pass ? tokens.status.successBg : tokens.fill.tertiary,
        color: pass ? tokens.status.success : tokens.text.tertiary,
        whiteSpace: "nowrap",
      }}
    >
      {label} {ratio.toFixed(1)}
    </span>
  );
}

function TypographyRow({ token }: { token: DesignMdTypographyToken }) {
  const { tokens } = useHostTheme();
  const sampleStyle = {
    fontFamily: token.fontFamily || undefined,
    fontSize: clampPreviewFontSize(token.fontSize),
    fontWeight: token.fontWeight ? Number(token.fontWeight) || undefined : undefined,
    lineHeight: "1.2",
    letterSpacing: previewLetterSpacing(token.letterSpacing, token.fontSize),
  };
  return (
    <Row
      gap={12}
      align="center"
      style={{
        border: `1px solid ${tokens.stroke.tertiary}`,
        borderRadius: tokens.radius.sm,
        padding: 10,
        background: tokens.bg.elevated,
      }}
    >
      <Stack gap={2} style={{ width: 140, minWidth: 0 }}>
        <Text weight="semibold" truncate>{token.name}</Text>
        <Text tone="secondary" size="small" truncate style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 11 }}>{[token.fontSize, token.fontWeight, token.lineHeight].filter(Boolean).join(" / ") || propertySummary(token.properties)}</Text>
      </Stack>
      <Text style={{ ...sampleStyle, minWidth: 0 }} truncate>
        The quick UI sample
      </Text>
    </Row>
  );
}

function ScaleStrip({ title, tokens: scaleTokens, variant = "bar" }: { title: string; tokens: DesignMdScaleToken[]; variant?: "bar" | "shape" }) {
  const { tokens } = useHostTheme();
  if (scaleTokens.length === 0) {
    return (
      <Stack gap={4}>
        <Text weight="semibold">{title}</Text>
        <EmptyText>Not defined.</EmptyText>
      </Stack>
    );
  }
  if (variant === "shape") {
    return (
      <Stack gap={8}>
        <Row align="center" justify="space-between" gap={8}>
          <Text weight="semibold">{title}</Text>
          <Text tone="secondary" size="small">{scaleTokens.length} tokens</Text>
        </Row>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
          {scaleTokens.map(token => (
            <div
              key={`${token.kind}-${token.name}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                width: 84,
                flex: "0 0 auto",
              }}
            >
              <span
                style={{
                  display: "block",
                  width: 56,
                  height: 56,
                  borderRadius: token.value,
                  background: tokens.fill.tertiary,
                  border: `1.5px solid ${tokens.accent.control}`,
                  boxSizing: "border-box",
                }}
              />
              <Text size="small" truncate style={{ maxWidth: 80 }}>{token.name}</Text>
              <Text tone="secondary" size="small" style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 11 }}>{token.value}</Text>
            </div>
          ))}
        </div>
      </Stack>
    );
  }
  const max = Math.max(...scaleTokens.map(token => token.numericValue || 0), 1);
  return (
    <Stack gap={6}>
      <Row align="center" justify="space-between" gap={8}>
        <Text weight="semibold">{title}</Text>
        <Text tone="secondary" size="small">{scaleTokens.length} tokens</Text>
      </Row>
      <Stack gap={6}>
        {scaleTokens.map((token, index) => (
          <Row key={`${token.kind}-${token.name}`} gap={8} align="center">
            <Text size="small" style={{ width: 80 }} truncate>{token.name}</Text>
            <Stack
              gap={0}
              style={{
                flex: 1,
                height: 8,
                borderRadius: tokens.radius.full,
                background: tokens.fill.tertiary,
                overflow: "hidden",
              }}
            >
              <div
                className="dmv-bar"
                style={{
                  width: `${Math.max(4, ((token.numericValue || 0) / max) * 100)}%`,
                  height: "100%",
                  borderRadius: tokens.radius.full,
                  background: `linear-gradient(90deg, ${tokens.accent.control}, ${tokens.accent.controlHover})`,
                  animationDelay: `${Math.min(index * 40, 400)}ms`,
                }}
              />
            </Stack>
            <Text tone="secondary" size="small" style={{ width: 70, textAlign: "right", fontFamily: "ui-monospace, Menlo, monospace" }}>{token.value}</Text>
          </Row>
        ))}
      </Stack>
    </Stack>
  );
}

function emptyDesignSystem(): DesignMdDesignSystem {
  return {
    schemaVersion: 1,
    schemaKeys: ["version", "name", "description", "colors", "typography", "rounded", "spacing", "components"],
    presentSchemaKeys: [],
    extensionKeys: [],
    unknownKeys: [],
    name: "",
    description: "",
    version: "",
    colors: [],
    typography: [],
    rounded: [],
    spacing: [],
    layout: [],
    options: [],
    components: [],
    references: [],
    contrastPairs: [],
    componentPropertyCounts: [],
  };
}

function buildFoundation(designSystem: DesignMdDesignSystem, hostTokens: ReturnType<typeof useHostTheme>["tokens"]): DesignFoundation {
  const background = colorValue(designSystem, ["background", "canvas", "surface", "paper", "neutral"], hostTokens.bg.elevated, "surface");
  const foreground = colorValue(designSystem, ["foreground", "ink", "text", "body", "on-surface"], hostTokens.text.primary, "text");
  const primary = colorValue(designSystem, ["primary", "brand", "accent", "link"], hostTokens.accent.control, "primary");
  const onPrimary = colorValue(designSystem, ["onPrimary", "on-primary", "onPrimary", "primary-on", "on-accent"], hostTokens.text.onAccent);
  const secondary = colorValue(designSystem, ["secondary", "body", "muted", "caption", "text-muted"], hostTokens.text.secondary);
  const link = colorValue(designSystem, ["link", "primary", "accent"], primary);
  const border = colorValue(designSystem, ["border", "hairline", "divider", "rule"], hostTokens.stroke.tertiary);
  const surface = colorValue(designSystem, ["surface", "canvas-card", "card", "canvas-soft", "background"], background);
  return {
    background,
    foreground,
    primary,
    onPrimary,
    secondary,
    link,
    border,
    surface,
    radius: scaleValue(designSystem, ["radius", "md", "sm", "base"], "8px"),
    spacing: scaleValue(designSystem, ["spacing", "md", "base", "lg"], "16px"),
    contentWidth: layoutValue(designSystem, ["contentWidth", "content-width", "container", "width"], "720px"),
    headingFont: typographyPrimitive(designSystem, ["headingFont", "displayFont"]) || typographyProperty(designSystem, ["display", "hero", "headline", "title"], "fontFamily") || "inherit",
    bodyFont: typographyPrimitive(designSystem, ["bodyFont", "fontFamily"]) || typographyProperty(designSystem, ["body", "base"], "fontFamily") || "inherit",
    titleSize: typographyPrimitive(designSystem, ["titleSize"]) || typographyProperty(designSystem, ["display", "hero", "headline", "title"], "fontSize") || "40px",
    baseSize: typographyPrimitive(designSystem, ["baseSize"]) || typographyProperty(designSystem, ["body", "base"], "fontSize") || "16px",
    lineHeight: typographyPrimitive(designSystem, ["lineHeight"]) || typographyProperty(designSystem, ["body", "base"], "lineHeight") || "1.5",
    headingWeight: typographyPrimitive(designSystem, ["headingWeight"]) || typographyProperty(designSystem, ["display", "hero", "headline", "title"], "fontWeight") || "600",
  };
}

function colorValue(designSystem: DesignMdDesignSystem, names: string[], fallback: string, role?: string) {
  const exact = findNamedColor(designSystem.colors, names);
  if (exact) return exact.value;
  const partial = designSystem.colors.find(color => names.some(name => normalizeTokenName(color.name).includes(normalizeTokenName(name))));
  if (partial) return partial.value;
  if (role) {
    const byRole = designSystem.colors.find(color => color.role === role && color.isDisplayable);
    if (byRole) return byRole.value;
  }
  return fallback;
}

function findNamedColor(colors: DesignMdColorToken[], names: string[]) {
  const normalized = names.map(normalizeTokenName);
  return colors.find(color => normalized.includes(normalizeTokenName(color.name)));
}

function scaleValue(designSystem: DesignMdDesignSystem, names: string[], fallback: string) {
  const scales = [...designSystem.rounded, ...designSystem.spacing, ...designSystem.layout];
  const normalized = names.map(normalizeTokenName);
  return scales.find(token => normalized.includes(normalizeTokenName(token.name)))?.value || fallback;
}

function layoutValue(designSystem: DesignMdDesignSystem, names: string[], fallback: string) {
  const normalized = names.map(normalizeTokenName);
  return designSystem.layout.find(token => normalized.includes(normalizeTokenName(token.name)))?.value || fallback;
}

function typographyPrimitive(designSystem: DesignMdDesignSystem, names: string[]) {
  const normalized = names.map(normalizeTokenName);
  const token = designSystem.typography.find(type => normalized.includes(normalizeTokenName(type.name)));
  if (!token) return "";
  return token.properties.find(property => property.property === "value")?.value || "";
}

function typographyProperty(designSystem: DesignMdDesignSystem, names: string[], property: string) {
  const token = designSystem.typography.find(type => names.some(name => normalizeTokenName(type.name).includes(normalizeTokenName(name))));
  if (!token) return "";
  if (property === "fontFamily") return token.fontFamily;
  if (property === "fontSize") return token.fontSize;
  if (property === "fontWeight") return token.fontWeight;
  if (property === "lineHeight") return token.lineHeight;
  if (property === "letterSpacing") return token.letterSpacing;
  return token.properties.find(item => item.property === property)?.value || "";
}

function typographyStyle(token: DesignMdTypographyToken, foundation: DesignFoundation, kind: "display" | "body" | "label"): CSSProperties {
  const fallbackSize = kind === "display" ? foundation.titleSize : kind === "body" ? foundation.baseSize : "12px";
  return {
    color: kind === "label" ? foundation.secondary : foundation.foreground,
    fontFamily: token.fontFamily || (kind === "display" ? foundation.headingFont : foundation.bodyFont),
    fontSize: clampCssLength(token.fontSize || primitiveValue(token) || fallbackSize, kind === "display" ? 28 : 12, kind === "display" ? 48 : 18),
    fontWeight: token.fontWeight ? Number(token.fontWeight) || undefined : kind === "display" ? Number(foundation.headingWeight) || 600 : undefined,
    lineHeight: token.lineHeight || foundation.lineHeight,
    letterSpacing: previewLetterSpacing(token.letterSpacing, token.fontSize),
  };
}

function primitiveValue(token: DesignMdTypographyToken) {
  return token.properties.find(property => property.property === "value")?.value || "";
}

function pickComponent(components: DesignMdComponentToken[], hints: string[]) {
  return components.find(component => hints.some(hint => normalizeTokenName(component.name).includes(normalizeTokenName(hint))));
}

type ComponentRenderMode = "action" | "surface" | "input" | "navigation" | "layout" | "data" | "component";

function componentCss(
  component: DesignMdComponentToken | undefined,
  designSystem: DesignMdDesignSystem,
  foundation: DesignFoundation,
  mode: ComponentRenderMode,
): CSSProperties {
  const prop = (name: string) => component?.properties.find(item => normalizeTokenName(item.property) === normalizeTokenName(name))?.value || "";
  const background = resolveTokenValue(prop("backgroundColor"), designSystem) || (mode === "action" ? foundation.primary : foundation.background);
  const color = resolveTokenValue(prop("textColor"), designSystem) || (mode === "action" ? foundation.onPrimary : foundation.foreground);
  const borderColor = resolveTokenValue(prop("borderColor"), designSystem) || foundation.border;
  const radius = resolveTokenValue(prop("rounded"), designSystem) || foundation.radius;
  const padding = resolveTokenValue(prop("padding"), designSystem) || (mode === "action" ? `0 ${foundation.spacing}` : foundation.spacing);
  const typography = componentTypography(component, designSystem);
  const size = componentSize(component);
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: mode === "surface" || mode === "layout" || mode === "data" || mode === "component" ? "start" : "center",
    flexDirection: mode === "surface" || mode === "layout" || mode === "data" || mode === "component" ? "column" : undefined,
    width: mode === "surface" ? "100%" : undefined,
    minHeight: mode === "action" ? 38 : undefined,
    height: mode === "action" && size ? size : undefined,
    padding,
    borderRadius: radius,
    background,
    color,
    border: `1px solid ${borderColor}`,
    fontFamily: typography.fontFamily || foundation.bodyFont,
    // Clamp the container font-size: specimen children set their own sizes, and an
    // inherited letter-spacing computes against this value (em resolves to a length).
    fontSize: clampCssLength(typography.fontSize || foundation.baseSize, 11, mode === "action" ? 22 : 16),
    fontWeight: typography.fontWeight ? Number(typography.fontWeight) || undefined : undefined,
    lineHeight: typography.lineHeight || undefined,
    letterSpacing: previewLetterSpacing(typography.letterSpacing, typography.fontSize),
    boxSizing: "border-box",
  };
}

function componentTypography(component: DesignMdComponentToken | undefined, designSystem: DesignMdDesignSystem) {
  const raw = component?.properties.find(item => normalizeTokenName(item.property) === "typography")?.value || "";
  const match = /^\{typography\.([A-Za-z0-9_.-]+)\}$/u.exec(raw.trim());
  const token = match ? designSystem.typography.find(type => type.name === match[1]) : undefined;
  return {
    fontFamily: token?.fontFamily || "",
    fontSize: token?.fontSize || "",
    fontWeight: token?.fontWeight || "",
    lineHeight: token?.lineHeight || "",
    letterSpacing: token?.letterSpacing || "",
  };
}

function componentMode(component: DesignMdComponentToken | undefined): ComponentRenderMode {
  if (!component) return "component";
  if (component.category === "action") return "action";
  if (component.category === "navigation") return "navigation";
  if (component.category === "form") return "input";
  if (component.category === "layout") return "layout";
  if (component.category === "data") return "data";
  if (component.category === "surface") return "surface";
  if (/input|field|form|search/u.test(component.name)) return "input";
  if (/button|link|cta|chip|tag/u.test(component.name)) return "action";
  if (/table|row|cell|list/u.test(component.name)) return "data";
  if (/nav|menu|tab\b|bar/u.test(component.name)) return "navigation";
  if (/hero|footer|header|section|band/u.test(component.name)) return "layout";
  if (/card|tile|panel|surface|modal|toast/u.test(component.name)) return "surface";
  return "component";
}

function miniActionCss(designSystem: DesignMdDesignSystem, foundation: DesignFoundation): CSSProperties {
  const action = pickComponent(designSystem.components, ["button-primary", "button-store", "button"]);
  return {
    ...componentCss(action, designSystem, foundation, "action"),
    minHeight: 24,
    padding: "4px 10px",
    fontSize: 12,
  };
}

function productSilhouetteCss(component: DesignMdComponentToken | undefined, foundation: DesignFoundation): CSSProperties {
  const isDark = /dark|black|quote|footer/u.test(component?.name || "");
  return {
    display: "block",
    width: "62%",
    height: 28,
    marginTop: "auto",
    borderRadius: foundation.radius,
    alignSelf: "center",
    background: isDark ? foundation.foreground : foundation.border,
    opacity: 0.32,
  };
}

function compactPadding(value: string) {
  const dimension = /^(\d+(?:\.\d+)?)(px|rem|em)$/u.exec(value.trim());
  if (!dimension) return value || undefined;
  const amount = Number(dimension[1]);
  const unit = dimension[2];
  if (unit === "px") return `${Math.min(amount, 28)}px`;
  return `${Math.min(amount, 1.75)}${unit}`;
}

function actionLabel(component: DesignMdComponentToken | undefined) {
  const name = component?.name || "";
  if (/buy|store|primary/u.test(name)) return "Buy";
  if (/delete|danger/u.test(name)) return "Delete";
  if (/link/u.test(name)) return "Read more";
  if (/search/u.test(name)) return "Search";
  if (/icon|circular/u.test(name)) return "×";
  return "Primary action";
}

function inputLabel(component: DesignMdComponentToken | undefined) {
  if (!component) return "Text input";
  if (/search/u.test(component.name)) return "Search";
  if (/email/u.test(component.name)) return "Email address";
  return titleCase(component.name.replace(/-/gu, " "));
}

function displayComponentTitle(component: DesignMdComponentToken | undefined) {
  if (!component) return "Component surface";
  return titleCase(component.name.replace(/-/gu, " "));
}

function componentDescription(component: DesignMdComponentToken | undefined) {
  const description = component?.properties.find(item => normalizeTokenName(item.property) === "description")?.value;
  if (description) return description;
  if (!component) return "Reusable interface primitive.";
  if (component.category === "surface") return "Surface, spacing, radius, and text color resolved from tokens.";
  if (component.category === "navigation") return "Navigation chrome with tokenized background and type.";
  if (component.category === "layout") return "Page-level region composed from layout tokens.";
  if (component.category === "data") return "Dense content row using table/list primitives.";
  return "Local component token rendered as a visual specimen.";
}

function componentSize(component: DesignMdComponentToken | undefined) {
  const raw = component?.properties.find(item => normalizeTokenName(item.property) === "size" || normalizeTokenName(item.property) === "height")?.value || "";
  return raw && !raw.startsWith("{") ? raw : "";
}

function orderIndex(order: string[], value: string) {
  const index = order.indexOf(value);
  return index === -1 ? order.length : index;
}

function scrollToSection(target: string) {
  document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resolveTokenValue(raw: string, designSystem: DesignMdDesignSystem): string {
  if (!raw) return "";
  const match = /^\{([A-Za-z0-9_.-]+)\}$/u.exec(raw.trim());
  if (!match) return raw;
  const [group, ...parts] = match[1].split(".");
  const name = parts.join(".");
  if (group === "colors") return designSystem.colors.find(color => color.name === name)?.value || "";
  if (group === "rounded") return designSystem.rounded.find(token => token.name === name)?.value || "";
  if (group === "spacing") return designSystem.spacing.find(token => token.name === name)?.value || "";
  if (group === "typography") return typographyProperty(designSystem, [name], "fontFamily") || "";
  return "";
}

function clampCssLength(value: string, minPx: number, maxPx: number) {
  const trimmed = String(value || "").trim();
  const match = /^(-?\d*\.?\d+)(px|rem|em)?$/u.exec(trimmed);
  if (!match) return trimmed || `${minPx}px`;
  const numeric = Number(match[1]);
  const unit = match[2] || "px";
  if (unit === "px") return `${Math.max(minPx, Math.min(numeric, maxPx))}px`;
  return `${Math.max(minPx / 16, Math.min(numeric, maxPx / 16))}${unit}`;
}

function groupBy<T>(values: T[], keyFn: (value: T) => string) {
  return values.reduce<Record<string, T[]>>((groups, value) => {
    const key = keyFn(value) || "other";
    groups[key] ??= [];
    groups[key].push(value);
    return groups;
  }, {});
}

function titleCase(value: string) {
  return value.replace(/\b[a-z]/gu, char => char.toUpperCase());
}

function normalizeTokenName(value: string) {
  return String(value || "").replace(/[_\s]/gu, "-").toLowerCase();
}

function propertySummary(properties: Array<{ property: string; value: string }>) {
  return properties.slice(0, 3).map(item => `${item.property}: ${item.value}`).join(" / ");
}

function previewLetterSpacing(raw: string, tokenFontSize: string): string | undefined {
  const trimmed = String(raw || "").trim();
  if (!trimmed || trimmed === "normal") return undefined;
  const match = /^(-?\d*\.?\d+)(px|em|rem)?$/u.exec(trimmed);
  if (!match) return trimmed;
  const value = Number(match[1]);
  const unit = match[2] || "px";
  const sizeMatch = /^(\d*\.?\d+)px$/u.exec(String(tokenFontSize || "").trim());
  const size = sizeMatch ? Math.max(Number(sizeMatch[1]), 1) : 16;
  const em = unit === "em" ? value : unit === "rem" ? (value * 16) / size : value / size;
  const clamped = Math.max(-0.04, Math.min(em, 0.3));
  return `${Math.round(clamped * 1000) / 1000}em`;
}

function clampPreviewFontSize(fontSize: string) {
  const match = /^(\d+(?:\.\d+)?)(px|rem|em)$/u.exec(fontSize.trim());
  if (!match) return undefined;
  const value = Number(match[1]);
  const unit = match[2];
  if (unit === "px") return `${Math.max(14, Math.min(value, 28))}px`;
  return `${Math.max(0.9, Math.min(value, 1.75))}${unit}`;
}

function contrastText(color: string, darkText: string, lightText: string) {
  const rgb = parseCssColor(color);
  if (!rgb) return darkText;
  return relativeLuminance(rgb) > 0.52 ? darkText : lightText;
}

function parseCssColor(value: string) {
  const raw = value.trim();
  let match = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/iu.exec(raw);
  if (match) {
    const hex = match[1];
    const expanded = hex.length === 3 || hex.length === 4
      ? hex.split("").map(char => `${char}${char}`).join("")
      : hex;
    return {
      r: parseInt(expanded.slice(0, 2), 16),
      g: parseInt(expanded.slice(2, 4), 16),
      b: parseInt(expanded.slice(4, 6), 16),
    };
  }
  match = /^rgba?\(\s*([0-9.]+)[,\s]+([0-9.]+)[,\s]+([0-9.]+)/iu.exec(raw);
  if (!match) return null;
  return {
    r: clampChannel(Number(match[1])),
    g: clampChannel(Number(match[2])),
    b: clampChannel(Number(match[3])),
  };
}

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function relativeLuminance(color: { r: number; g: number; b: number }) {
  const channels = [color.r, color.g, color.b].map(channel => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

