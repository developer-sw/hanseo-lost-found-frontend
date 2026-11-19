import { useEffect, useRef, useState, type DragEvent, type RefObject } from 'react'
import {
  decodeFoundPhoto,
  FOUND_PHOTO_ACCEPT,
  FOUND_PHOTO_FORMATS,
  FOUND_PHOTO_MAX_SIZE_MIB,
  FOUND_PHOTO_READ_ERROR,
  validateFoundPhotoFile,
} from '../utils/foundPhotoValidation'
import { Icon } from './Icon'

export type FoundPhotoSelection =
  | { status: 'empty' }
  | { status: 'checking' }
  | { status: 'invalid'; message: string }
  | { status: 'ready'; file: File; previewUrl: string }

interface FoundPhotoFieldProps {
  selection: FoundPhotoSelection
  onSelectionChange: (next: FoundPhotoSelection) => void
  error?: string
  existingPhoto?: string
}

function revokePreview(activeUrl: RefObject<string | null>) {
  if (activeUrl.current) {
    URL.revokeObjectURL(activeUrl.current)
    activeUrl.current = null
  }
}

export function FoundPhotoField({ selection, onSelectionChange, error, existingPhoto }: FoundPhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const activeUrl = useRef<string | null>(null)
  const selectionVersion = useRef(0)
  const dragDepth = useRef(0)
  const [isDragging, setIsDragging] = useState(false)
  const [failedExistingPhoto, setFailedExistingPhoto] = useState<string>()
  const isReady = selection.status === 'ready'
  const isChecking = selection.status === 'checking'
  const keepsExistingPhoto = Boolean(existingPhoto) && selection.status === 'empty'
  const showsExistingPhoto = keepsExistingPhoto && existingPhoto !== failedExistingPhoto
  const errorMessage = error || (selection.status === 'invalid' ? selection.message : '')

  useEffect(() => () => {
    selectionVersion.current += 1
    revokePreview(activeUrl)
  }, [])

  async function selectPhoto(file: File) {
    const version = ++selectionVersion.current
    revokePreview(activeUrl)
    onSelectionChange({ status: 'checking' })

    try {
      const validationError = await validateFoundPhotoFile(file)
      if (version !== selectionVersion.current) return
      if (validationError) {
        onSelectionChange({ status: 'invalid', message: validationError })
        return
      }

      const previewUrl = URL.createObjectURL(file)
      activeUrl.current = previewUrl
      await decodeFoundPhoto(previewUrl)
      if (version !== selectionVersion.current) return

      onSelectionChange({ status: 'ready', file, previewUrl })
    } catch {
      if (version !== selectionVersion.current) return
      revokePreview(activeUrl)
      onSelectionChange({ status: 'invalid', message: FOUND_PHOTO_READ_ERROR })
    }
  }

  function removePhoto() {
    selectionVersion.current += 1
    revokePreview(activeUrl)
    onSelectionChange({ status: 'empty' })
    document.getElementById('found-photo-select')?.focus()
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    if (!event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    dragDepth.current += 1
    setIsDragging(true)
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    if (!event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  function handleDragLeave() {
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    if (dragDepth.current === 0) setIsDragging(false)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    dragDepth.current = 0
    setIsDragging(false)

    const files = event.dataTransfer.files
    if (files.length > 1) {
      selectionVersion.current += 1
      revokePreview(activeUrl)
      onSelectionChange({ status: 'invalid', message: '사진은 한 장만 선택해 주세요.' })
      return
    }

    const file = files.item(0)
    if (file) void selectPhoto(file)
  }

  return (
    <section className="found-photo" aria-labelledby="found-photo-label">
      <p className="found-photo__label" id="found-photo-label">습득물 사진 <span>필수</span></p>
      <input
        ref={inputRef}
        id="found-photo-input"
        type="file"
        aria-labelledby="found-photo-label"
        accept={FOUND_PHOTO_ACCEPT}
        hidden
        onChange={(event) => {
          const file = event.currentTarget.files?.item(0)
          event.currentTarget.value = ''
          if (file) void selectPhoto(file)
        }}
      />

      <div
        className="found-photo__zone"
        data-dragging={isDragging}
        data-invalid={Boolean(errorMessage)}
        data-ready={isReady || showsExistingPhoto}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isReady ? (
          <img className="found-photo__preview" src={selection.previewUrl} alt="선택한 습득물 사진 미리보기" />
        ) : showsExistingPhoto ? (
          <img className="found-photo__preview" src={existingPhoto} alt="등록된 습득물 사진" onError={() => setFailedExistingPhoto(existingPhoto)} />
        ) : (
          <div className="found-photo__icon"><Icon name="box" size={28} /></div>
        )}

        <div className="found-photo__details">
          <p className="found-photo__title">{isReady ? '선택한 사진' : keepsExistingPhoto ? '기존 습득물 사진' : '주운 물건의 사진을 등록해 주세요.'}</p>
          {isReady ? (
            <p className="found-photo__name" title={selection.file.name}>{selection.file.name}</p>
          ) : keepsExistingPhoto ? (
            <p className="found-photo__description">
              {showsExistingPhoto ? '변경할 사진을 선택하지 않으면 기존 사진을 유지합니다.' : '기존 사진을 불러오지 못했습니다. 필요하면 새 사진을 선택해 주세요.'}
            </p>
          ) : (
            <p className="found-photo__description">물품 전체가 잘 보이면 주인을 찾는 데 도움이 됩니다.</p>
          )}

          <div className="found-photo__actions">
            <button
              id="found-photo-select"
              className="secondary-link"
              type="button"
              aria-invalid={errorMessage ? true : undefined}
              aria-describedby={errorMessage ? 'found-photo-error found-photo-hint' : 'found-photo-hint'}
              onClick={() => inputRef.current?.click()}
            >
              {isReady || isChecking || existingPhoto ? '사진 변경' : '사진 선택'}
            </button>
            {(isReady || isChecking || (existingPhoto && selection.status === 'invalid')) && (
              <button className="found-photo__remove" type="button" onClick={removePhoto}>
                {existingPhoto ? '기존 사진 유지' : '사진 제거'}
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="found-photo__hint" id="found-photo-hint">
        데모에서는 {FOUND_PHOTO_FORMATS} 사진을 최대 {FOUND_PHOTO_MAX_SIZE_MIB}MB까지 선택할 수 있어요. 사진을 끌어다 놓을 수도 있어요.
      </p>
      <div role="status" aria-atomic="true">
        {isChecking && <p className="found-photo__hint">사진을 확인하고 있어요.</p>}
        {errorMessage && <p className="found-photo__error" id="found-photo-error">{errorMessage}</p>}
      </div>
    </section>
  )
}
