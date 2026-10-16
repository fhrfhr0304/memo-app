import { test, expect } from '@playwright/test'

const MARKDOWN = '# 큰 제목\n\n**굵게** 텍스트\n\n- 목록 1\n- 목록 2'

test.describe('마크다운 편집기 및 뷰어', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // 메모 목록이 보이면 하이드레이션이 끝난 것 (이전에 클릭하면 핸들러가 없을 수 있음)
    await expect(page.getByTestId('memo-item').first()).toBeVisible()
    await page.getByRole('button', { name: '새 메모' }).click()
  })

  test('작성 중 실시간 프리뷰가 기본으로 표시된다', async ({ page }) => {
    const editor = page.getByTestId('memo-content-editor')
    await expect(editor.locator('.w-md-editor-preview')).toBeVisible()

    await editor.locator('textarea').fill(MARKDOWN)

    const preview = editor.locator('.w-md-editor-preview')
    await expect(
      preview.getByRole('heading', { name: '큰 제목' })
    ).toBeVisible()
    await expect(preview.locator('strong')).toHaveText('굵게')
    await expect(preview.locator('li')).toHaveCount(2)
  })

  test('저장한 마크다운이 상세 팝업에서 렌더링된다', async ({ page }) => {
    await page.getByLabel('제목 *').fill('마크다운 메모')
    await page
      .getByTestId('memo-content-editor')
      .locator('textarea')
      .fill(MARKDOWN)
    await page.getByRole('button', { name: '저장하기' }).click()

    await page
      .getByTestId('memo-item')
      .filter({ hasText: '마크다운 메모' })
      .click()

    const content = page.getByTestId('memo-detail-content')
    await expect(
      content.getByRole('heading', { name: '큰 제목' })
    ).toBeVisible()
    await expect(content.locator('strong')).toHaveText('굵게')
    await expect(content.locator('li')).toHaveCount(2)
  })

  test('내용이 비어 있으면 저장되지 않는다', async ({ page }) => {
    page.once('dialog', dialog => dialog.dismiss())
    await page.getByLabel('제목 *').fill('빈 내용')

    await page.getByRole('button', { name: '저장하기' }).click()

    await expect(page.getByText('새 메모 작성')).toBeVisible()
  })
})
