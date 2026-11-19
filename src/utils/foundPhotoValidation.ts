const photoFormats = [
  { mime: 'image/jpeg', name: 'JPEG', signatures: [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }] },
  { mime: 'image/png', name: 'PNG', signatures: [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }] },
  {
    mime: 'image/webp',
    name: 'WebP',
    signatures: [
      { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
      { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
    ],
  },
]

const mebibyte = 1024 * 1024

export const FOUND_PHOTO_MAX_SIZE_MIB = 5
export const FOUND_PHOTO_MAX_SIZE_BYTES = FOUND_PHOTO_MAX_SIZE_MIB * mebibyte
export const FOUND_PHOTO_ACCEPT = photoFormats.map(({ mime }) => mime).join(',')
export const FOUND_PHOTO_FORMATS = photoFormats.map(({ name }) => name).join(', ')
export const FOUND_PHOTO_READ_ERROR = '사진을 읽을 수 없습니다. 다른 사진을 선택해 주세요.'

export async function validateFoundPhotoFile(file: File): Promise<string | undefined> {
  if (file.size === 0) return '빈 파일입니다. 다른 사진을 선택해 주세요.'
  if (file.size > FOUND_PHOTO_MAX_SIZE_BYTES) return `사진은 최대 ${FOUND_PHOTO_MAX_SIZE_MIB}MB까지 선택할 수 있습니다.`

  const format = photoFormats.find(({ mime }) => mime === file.type)
  if (!format) return `지원하는 형식은 ${FOUND_PHOTO_FORMATS}입니다. 다른 사진을 선택해 주세요.`

  const headerSize = Math.max(...format.signatures.map(({ offset, bytes }) => offset + bytes.length))
  const header = new Uint8Array(await file.slice(0, headerSize).arrayBuffer())
  const hasImageSignature = format.signatures.every(({ offset, bytes }) =>
    bytes.every((byte, index) => header[offset + index] === byte),
  )

  if (!hasImageSignature) return FOUND_PHOTO_READ_ERROR
}

export async function decodeFoundPhoto(previewUrl: string): Promise<void> {
  const image = new Image()
  image.src = previewUrl
  await image.decode()
}
