'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { summarizeMemoAction } from '@/actions/memoActions'

interface MemoSummaryProps {
  title: string
  content: string
}

export default function MemoSummary({ title, content }: MemoSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  // 모달이 닫히거나 언마운트될 때 진행 중인 요청 결과 무시
  useEffect(
    () => () => {
      requestIdRef.current += 1
    },
    []
  )

  const handleSummarize = useCallback(async () => {
    const requestId = ++requestIdRef.current
    const isStale = () => requestId !== requestIdRef.current

    setLoading(true)
    setError(null)
    try {
      const data = await summarizeMemoAction(title, content)
      if (isStale()) return
      if (!data.summary) throw new Error(data.error || '요약에 실패했습니다.')
      setSummary(data.summary)
    } catch (e) {
      if (isStale()) return
      setError(e instanceof Error ? e.message : '요약에 실패했습니다.')
    } finally {
      if (!isStale()) setLoading(false)
    }
  }, [title, content])

  return (
    <div className="mb-6" data-testid="memo-summary">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          ✨ AI 요약
        </p>
        <button
          onClick={handleSummarize}
          disabled={loading}
          className="rounded-lg border border-purple-200 px-3 py-1 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="memo-summary-btn"
        >
          {loading ? '요약 중...' : summary ? '다시 요약' : '요약하기'}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
          data-testid="memo-summary-error"
        >
          {error}
        </p>
      )}
      {summary && !error && (
        <p
          className="whitespace-pre-wrap rounded-xl bg-purple-50 px-4 py-3 text-sm leading-relaxed text-gray-800"
          data-testid="memo-summary-result"
        >
          {summary}
        </p>
      )}
    </div>
  )
}
