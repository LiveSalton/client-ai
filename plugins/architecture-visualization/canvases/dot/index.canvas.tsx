import { useCallback, useEffect, useRef } from "react";
import {
	Banner,
	Stack,
	ZoomableViewport,
	useCanvasAction,
	useCanvasState,
	useCanvasTargetFilePath,
	useHostTheme,
} from "qoder/canvas";

interface DotViewerData {
  schemaVersion: number;
  sourcePath: string;
  updatedAt?: string;
  svg?: string;
  error?: string;
}

const DATA_KEY = "aicoding.formatViewer.dot";
const EMPTY_DATA: DotViewerData = {
  schemaVersion: 1,
  sourcePath: "",
};

export default function DotFormatViewer() {
  const { tokens } = useHostTheme();
  const dispatch = useCanvasAction();
  const targetFilePath = useCanvasTargetFilePath();
  const [data] = useCanvasState<DotViewerData>(DATA_KEY, EMPTY_DATA);
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
    if (!targetFilePath || requestedTargetRef.current === targetFilePath) {
      return;
    }
    runParser(targetFilePath);
  }, [runParser, targetFilePath]);

  const isCurrentTarget = !!targetFilePath && data.sourcePath === targetFilePath;

  return (
    <Stack
      gap={0}
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: tokens.bg.editor,
        color: tokens.text.primary,
      }}
    >
      {data.error && isCurrentTarget ? (
        <Banner tone="danger">{data.error}</Banner>
      ) : null}

      {targetFilePath && !isCurrentTarget && !data.error ? (
        <Banner tone="info">Rendering Graphviz DOT...</Banner>
      ) : null}

      {isCurrentTarget && data.svg ? (
        <ZoomableViewport
          resetKey={data.sourcePath}
          style={{
            color: tokens.text.primary,
          }}
          contentStyle={{
            minWidth: "100%",
            minHeight: "100%",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: 0,
            boxSizing: "border-box",
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: data.svg }} />
        </ZoomableViewport>
      ) : !data.error ? (
        <Banner tone="info">{targetFilePath ? "Rendering Graphviz DOT..." : "Open a .dot file"}</Banner>
      ) : null}
    </Stack>
  );
}
