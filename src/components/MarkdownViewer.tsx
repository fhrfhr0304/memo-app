'use client'

import dynamic from 'next/dynamic'

// 마크다운 렌더링 전용 컴포넌트 (편집기 UI 없이 프리뷰만 표시)
const Markdown = dynamic(
  () => import('@uiw/react-md-editor').then(mod => mod.default.Markdown),
  { ssr: false }
)

interface MarkdownViewerProps {
  source: string
}

export default function MarkdownViewer({ source }: MarkdownViewerProps) {
  return (
    <div data-color-mode="light">
      <Markdown
        source={source}
        className="!bg-transparent !text-base !leading-relaxed !text-gray-700"
      />
    </div>
  )
}
