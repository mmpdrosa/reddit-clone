'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'

const Output = dynamic(
  async () => (await import('editorjs-react-renderer')).default,
  {
    ssr: false,
  },
)

interface EditorOutputProps {
  content: any
}

const style = {
  paragraph: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
}

const renderers = {
  image: CustomImageRenderer,
  code: CustomCodeRenderer,
}

export function EditorOutput({ content }: EditorOutputProps) {
  return (
    <>
      <Output
        data={content}
        style={style}
        className="text-sm"
        renderers={renderers}
      />
    </>
  )
}

function CustomImageRenderer({ data }: any) {
  const src = data.file.url
  const caption = data.caption

  return (
    <div className="relative min-h-[15rem] w-full">
      <Image src={src} fill className="object-contain" alt={caption} />
    </div>
  )
}

function CustomCodeRenderer({ data }: any) {
  return (
    <pre className="rounded-md bg-secondary p-4">
      <code className="text-sm text-secondary">{data.code}</code>
    </pre>
  )
}
