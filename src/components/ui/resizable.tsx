import * as React from "react"

const ResizablePanelGroup = ({ className, ...props }: any) => (
  <div className={className} {...props} />
)

const ResizablePanel = ({ className, ...props }: any) => (
  <div className={className} {...props} />
)

const ResizableHandle = ({ className, ...props }: any) => (
  <div className={className} {...props} />
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
