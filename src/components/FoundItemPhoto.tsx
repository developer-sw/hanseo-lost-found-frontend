import { useId, useRef, useState } from 'react'
import { Icon } from './Icon'

interface FoundItemPhotoProps {
  src?: string
  name: string
}

export function FoundItemPhoto({ src, name }: FoundItemPhotoProps) {
  const dialogTitleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const expandButtonRef = useRef<HTMLButtonElement>(null)
  const emptyRef = useRef<HTMLDivElement>(null)
  const [failedSource, setFailedSource] = useState<string>()
  const imageSource = src?.trim()
  const canShowPhoto = imageSource && imageSource !== failedSource

  function openDialog() {
    dialogRef.current?.showModal()
    closeButtonRef.current?.focus()
  }

  function handleImageError() {
    const shouldRestoreFocus = dialogRef.current?.open || document.activeElement === expandButtonRef.current
    dialogRef.current?.close()
    setFailedSource(imageSource)

    if (shouldRestoreFocus) requestAnimationFrame(() => emptyRef.current?.focus())
  }

  return (
    <div className="found-detail-photo">
      <div className="found-detail-photo__frame">
        {canShowPhoto ? (
          <img
            className="found-detail-photo__image"
            src={imageSource}
            alt={`${name} 대표 사진`}
            onError={handleImageError}
          />
        ) : (
          <div className="found-detail-photo__empty" ref={emptyRef} tabIndex={-1}>
            <Icon name="box" size={40} />
            <p>{imageSource ? '사진을 불러오지 못했습니다.' : '등록된 사진이 없습니다.'}</p>
          </div>
        )}
      </div>

      {canShowPhoto && (
        <>
          <button
            className="secondary-link found-detail-photo__expand"
            ref={expandButtonRef}
            type="button"
            aria-haspopup="dialog"
            onClick={openDialog}
          >
            <Icon name="search" size={18} /> 사진 확대
          </button>

          <dialog
            className="found-detail-photo__dialog"
            ref={dialogRef}
            aria-labelledby={dialogTitleId}
            onClose={() => expandButtonRef.current?.focus()}
          >
            <div className="found-detail-photo__dialog-header">
              <h2 id={dialogTitleId}>습득물 사진 확대</h2>
              <button
                className="found-detail-photo__dialog-close"
                ref={closeButtonRef}
                type="button"
                aria-label="확대 사진 닫기"
                onClick={() => dialogRef.current?.close()}
              >
                <Icon name="x" size={22} />
              </button>
            </div>
            <img
              className="found-detail-photo__dialog-image"
              src={imageSource}
              alt={`${name} 확대 사진`}
              loading="lazy"
              onError={handleImageError}
            />
          </dialog>
        </>
      )}
    </div>
  )
}
