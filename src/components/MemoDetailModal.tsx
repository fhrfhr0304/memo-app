'use client'

import { useEffect } from 'react'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'
import MarkdownViewer from './MarkdownViewer'
import MemoSummary from './MemoSummary'

interface MemoDetailModalProps {
  memo: Memo | null
  onClose: () => void
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
}

const CATEGORY_STYLES: Record<
  string,
  { emoji: string; badge: string; gradient: string }
> = {
  personal: {
    emoji: '🏡',
    badge: 'bg-blue-100 text-blue-800',
    gradient: 'from-blue-500 via-sky-500 to-cyan-400',
  },
  work: {
    emoji: '💼',
    badge: 'bg-green-100 text-green-800',
    gradient: 'from-emerald-500 via-green-500 to-teal-400',
  },
  study: {
    emoji: '📚',
    badge: 'bg-purple-100 text-purple-800',
    gradient: 'from-purple-500 via-violet-500 to-fuchsia-400',
  },
  idea: {
    emoji: '💡',
    badge: 'bg-yellow-100 text-yellow-800',
    gradient: 'from-amber-400 via-orange-400 to-yellow-300',
  },
  other: {
    emoji: '📌',
    badge: 'bg-gray-100 text-gray-800',
    gradient: 'from-slate-500 via-gray-500 to-zinc-400',
  },
}

const EDITED_THRESHOLD_MS = 1000

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function MemoDetailModal({
  memo,
  onClose,
  onEdit,
  onDelete,
}: MemoDetailModalProps) {
  const isOpen = memo !== null

  // ESC 키로 닫기 + 배경 스크롤 잠금
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prevOverflow = document.body.style.overflow
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, onClose])

  if (!memo) return null

  const style = CATEGORY_STYLES[memo.category] || CATEGORY_STYLES.other
  const categoryLabel =
    MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] ||
    memo.category
  // 생성 시 createdAt/updatedAt이 수 ms 어긋나므로 1초 이상 차이날 때만 수정됨으로 간주
  const isEdited =
    new Date(memo.updatedAt).getTime() - new Date(memo.createdAt).getTime() >
    EDITED_THRESHOLD_MS

  const handleDelete = () => {
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      onDelete(memo.id)
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      data-testid="memo-detail-overlay"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="memo-detail-title"
        onClick={e => e.stopPropagation()}
        className="flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-pop-in"
        data-testid="memo-detail-modal"
      >
        {/* 그라데이션 헤더 */}
        <div
          className={`relative bg-gradient-to-br ${style.gradient} px-6 pb-6 pt-8 text-white sm:px-8`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-6 select-none text-9xl opacity-20"
          >
            {style.emoji}
          </span>

          <button
            onClick={onClose}
            aria-label="닫기"
            title="닫기 (ESC)"
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
            data-testid="memo-detail-close-btn"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <span className="relative inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm">
            {style.emoji} {categoryLabel}
          </span>
          <h2
            id="memo-detail-title"
            className="relative mt-3 break-words pr-10 text-2xl font-bold leading-snug sm:text-3xl"
          >
            {memo.title}
          </h2>
          <div className="relative mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/90">
            <span>🗓️ 작성 {formatDate(memo.createdAt)}</span>
            {isEdited && <span>✏️ 수정 {formatDate(memo.updatedAt)}</span>}
          </div>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <MemoSummary
            key={memo.id}
            title={memo.title}
            content={memo.content}
          />
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            📖 내용
          </p>
          <div className="break-words" data-testid="memo-detail-content">
            <MarkdownViewer source={memo.content} />
          </div>

          {memo.tags.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                🏷️ 태그
              </p>
              <div className="flex flex-wrap gap-2">
                {memo.tags.map(tag => (
                  <span
                    key={tag}
                    className={`rounded-full px-3 py-1 text-sm font-medium ${style.badge}`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 푸터 액션 */}
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:px-8">
          <span className="hidden text-xs text-gray-400 sm:inline">
            ⌨️ ESC를 눌러 닫기
          </span>
          <div className="flex w-full gap-2 sm:w-auto">
            <button
              onClick={handleDelete}
              className="flex-1 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 sm:flex-none"
              data-testid="memo-detail-delete-btn"
            >
              🗑️ 삭제
            </button>
            <button
              onClick={() => onEdit(memo)}
              className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 sm:flex-none"
              data-testid="memo-detail-edit-btn"
            >
              ✏️ 편집
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
