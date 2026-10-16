import { test, expect, Page } from '@playwright/test'

// 샘플 데이터는 Supabase memos 테이블의 목업 데이터를 사용한다
const UNEDITED_TITLE = '프로젝트 회의 준비' // createdAt === updatedAt
const EDITED_TITLE = 'React 18 새로운 기능 학습' // updatedAt !== createdAt

const getCard = (page: Page, title: string) =>
  page.getByTestId('memo-item').filter({ hasText: title })

const openDetail = async (page: Page, title: string) => {
  await getCard(page, title).click()
  await expect(page.getByTestId('memo-detail-modal')).toBeVisible()
}

test.describe('메모 상세 보기 팝업', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(getCard(page, UNEDITED_TITLE)).toBeVisible()
  })

  test('메모 카드를 클릭하면 상세 팝업이 열린다', async ({ page }) => {
    await expect(page.getByTestId('memo-detail-modal')).toHaveCount(0)

    await openDetail(page, UNEDITED_TITLE)

    const modal = page.getByTestId('memo-detail-modal')
    await expect(
      modal.getByRole('heading', { name: UNEDITED_TITLE })
    ).toBeVisible()
    await expect(modal.getByTestId('memo-detail-content')).toContainText(
      '프로젝트 범위 정의서 작성'
    )
    await expect(modal).toContainText('💼 업무')
    await expect(modal).toContainText('#회의')
    await expect(modal).toContainText('#프로젝트')
  })

  test('ESC 키를 누르면 팝업이 닫힌다', async ({ page }) => {
    await openDetail(page, UNEDITED_TITLE)

    await page.keyboard.press('Escape')

    await expect(page.getByTestId('memo-detail-modal')).toHaveCount(0)
  })

  test('닫기 버튼을 누르면 팝업이 닫힌다', async ({ page }) => {
    await openDetail(page, UNEDITED_TITLE)

    await page.getByTestId('memo-detail-close-btn').click()

    await expect(page.getByTestId('memo-detail-modal')).toHaveCount(0)
  })

  test('배경(오버레이)을 클릭하면 닫히고, 팝업 내부 클릭은 유지된다', async ({
    page,
  }) => {
    await openDetail(page, UNEDITED_TITLE)

    await page.getByTestId('memo-detail-content').click()
    await expect(page.getByTestId('memo-detail-modal')).toBeVisible()

    await page
      .getByTestId('memo-detail-overlay')
      .click({ position: { x: 5, y: 5 } })
    await expect(page.getByTestId('memo-detail-modal')).toHaveCount(0)
  })

  test('키보드(Enter)로 카드를 열 수 있다', async ({ page }) => {
    await getCard(page, UNEDITED_TITLE).focus()

    await page.keyboard.press('Enter')

    await expect(page.getByTestId('memo-detail-modal')).toBeVisible()
  })

  test('팝업이 열려 있는 동안 배경 스크롤이 잠기고 닫으면 복구된다', async ({
    page,
  }) => {
    await openDetail(page, UNEDITED_TITLE)
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')

    await page.keyboard.press('Escape')

    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  })

  test('수정된 메모에만 수정 시각이 표시된다', async ({ page }) => {
    await openDetail(page, UNEDITED_TITLE)
    await expect(page.getByTestId('memo-detail-modal')).toContainText('🗓️ 작성')
    await expect(page.getByTestId('memo-detail-modal')).not.toContainText(
      '✏️ 수정'
    )
    await page.keyboard.press('Escape')

    await openDetail(page, EDITED_TITLE)
    await expect(page.getByTestId('memo-detail-modal')).toContainText('✏️ 수정')
  })

  test('카드의 삭제 버튼은 상세 팝업을 열지 않는다', async ({ page }) => {
    page.once('dialog', dialog => dialog.dismiss())

    await getCard(page, UNEDITED_TITLE)
      .getByRole('button', { name: '삭제' })
      .click()

    await expect(page.getByTestId('memo-detail-modal')).toHaveCount(0)
    await expect(getCard(page, UNEDITED_TITLE)).toBeVisible()
  })

  test('카드의 편집 버튼은 상세 팝업 대신 편집 폼을 연다', async ({ page }) => {
    await getCard(page, UNEDITED_TITLE)
      .getByRole('button', { name: '편집' })
      .click()

    await expect(page.getByTestId('memo-detail-modal')).toHaveCount(0)
    await expect(page.getByText('메모 편집')).toBeVisible()
  })

  test('팝업에서 편집을 누르면 상세가 닫히고 편집 폼이 열린다', async ({
    page,
  }) => {
    await openDetail(page, UNEDITED_TITLE)

    await page.getByTestId('memo-detail-edit-btn').click()

    await expect(page.getByTestId('memo-detail-modal')).toHaveCount(0)
    await expect(page.getByText('메모 편집')).toBeVisible()
    await expect(page.getByLabel('제목 *')).toHaveValue(UNEDITED_TITLE)
  })

  test('팝업에서 삭제를 확인하면 메모가 삭제되고 팝업이 닫힌다', async ({
    page,
  }) => {
    page.once('dialog', dialog => dialog.accept())
    await openDetail(page, UNEDITED_TITLE)

    await page.getByTestId('memo-detail-delete-btn').click()

    await expect(page.getByTestId('memo-detail-modal')).toHaveCount(0)
    await expect(getCard(page, UNEDITED_TITLE)).toHaveCount(0)
  })

  test('팝업에서 삭제를 취소하면 팝업과 메모가 유지된다', async ({ page }) => {
    page.once('dialog', dialog => dialog.dismiss())
    await openDetail(page, UNEDITED_TITLE)

    await page.getByTestId('memo-detail-delete-btn').click()

    await expect(page.getByTestId('memo-detail-modal')).toBeVisible()
    await expect(getCard(page, UNEDITED_TITLE)).toBeVisible()
  })
})
