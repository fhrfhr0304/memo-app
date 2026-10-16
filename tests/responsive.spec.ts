import { test, expect } from '@playwright/test'

test.describe('반응형 레이아웃', () => {
  test.describe('모바일 (375px)', () => {
    test.use({ viewport: { width: 375, height: 740 } })

    test('가로 스크롤 없이 목록이 표시된다', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByTestId('memo-item').first()).toBeVisible()

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })

    test('카테고리 배지가 한 줄로 유지된다', async ({ page }) => {
      await page.goto('/')
      const badge = page
        .getByTestId('memo-item')
        .filter({ hasText: '프로젝트 회의 준비' })
        .getByText('업무', { exact: true })

      const box = await badge.boundingBox()
      expect(box).not.toBeNull()
      // 글자가 세로로 쪼개지면 높이가 한 줄(약 24px)을 크게 넘는다
      expect(box!.height).toBeLessThan(32)
    })

    test('편집기가 위아래로 분할되어 표시된다', async ({ page }) => {
      await page.goto('/')
      // 목록이 보이면 하이드레이션 완료 (이전 클릭은 핸들러가 없을 수 있음)
      await expect(page.getByTestId('memo-item').first()).toBeVisible()
      await page.getByRole('button', { name: '새 메모' }).click()

      const editor = page.getByTestId('memo-content-editor')
      await expect(editor.locator('.w-md-editor-preview')).toBeVisible()

      // 편집기 CSS가 동적 청크로 늦게 로드되므로 레이아웃이 안정될 때까지 재시도
      await expect(async () => {
        const input = await editor.locator('.w-md-editor-input').boundingBox()
        const preview = await editor
          .locator('.w-md-editor-preview')
          .boundingBox()
        expect(input).not.toBeNull()
        expect(preview).not.toBeNull()
        expect(preview!.y).toBeGreaterThan(input!.y + input!.height - 2)
        expect(Math.abs(preview!.width - input!.width)).toBeLessThan(2)
      }).toPass()
    })

    test('상세 팝업이 화면 안에 들어온다', async ({ page }) => {
      await page.goto('/')
      await page
        .getByTestId('memo-item')
        .filter({ hasText: '프로젝트 회의 준비' })
        .click()

      // pop-in 애니메이션이 끝날 때까지 재시도
      await expect(async () => {
        const box = await page.getByTestId('memo-detail-modal').boundingBox()
        expect(box).not.toBeNull()
        expect(box!.x).toBeGreaterThanOrEqual(0)
        expect(box!.x + box!.width).toBeLessThanOrEqual(375)
      }).toPass()
    })
  })

  test.describe('데스크톱 (1280px)', () => {
    test.use({ viewport: { width: 1280, height: 800 } })

    test('편집기가 좌우로 분할되어 표시된다', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByTestId('memo-item').first()).toBeVisible()
      await page.getByRole('button', { name: '새 메모' }).click()

      const editor = page.getByTestId('memo-content-editor')
      await expect(editor.locator('.w-md-editor-preview')).toBeVisible()

      await expect(async () => {
        const input = await editor.locator('.w-md-editor-input').boundingBox()
        const preview = await editor
          .locator('.w-md-editor-preview')
          .boundingBox()
        expect(input).not.toBeNull()
        expect(preview).not.toBeNull()
        expect(preview!.x).toBeGreaterThan(input!.x + input!.width - 2)
      }).toPass()
    })
  })
})
