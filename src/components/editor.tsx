'use client'

import type EditorJS from '@editorjs/editorjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { usePathname, useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import TextareaAutosize from 'react-textarea-autosize'
import { z } from 'zod'

import { uploadFiles } from '@/lib/uploadthing'
import { postSchema } from '@/validations/post'
import { toast } from './ui/use-toast'

type FormValues = z.infer<typeof postSchema>

interface EditorProps {
  subredditId: string
}

export function Editor({ subredditId }: EditorProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      subredditId,
      title: '',
      content: null,
    },
  })
  const ref = React.useRef<EditorJS>()
  const [isMounted, setIsMounted] = React.useState(false)
  const titleRef = React.useRef<HTMLTextAreaElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  const { ref: hookformTitleRef, ...titleRegister } = register('title')

  const initializeEditor = React.useCallback(async () => {
    const EditorJS = (await import('@editorjs/editorjs')).default
    const Header = (await import('@editorjs/header')).default
    const Embed = (await import('@editorjs/embed')).default
    const Table = (await import('@editorjs/table')).default
    const List = (await import('@editorjs/list')).default
    const Code = (await import('@editorjs/code')).default
    const LinkTool = (await import('@editorjs/link')).default
    const InlineCode = (await import('@editorjs/inline-code')).default
    const ImageTool = (await import('@editorjs/image')).default

    if (!ref.current) {
      const editor = new EditorJS({
        holder: 'editor',
        onReady() {
          ref.current = editor
        },
        placeholder: 'Type here to write your post...',
        inlineToolbar: true,
        data: {
          blocks: [],
        },
        tools: {
          header: Header,
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: '/api/link',
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const [response] = await uploadFiles({
                    files: [file],
                    endpoint: 'imageUploader',
                  })

                  return {
                    success: 1,
                    file: {
                      url: response.fileUrl,
                    },
                  }
                },
              },
            },
          },
          list: List,
          code: Code,
          inlineCode: InlineCode,
          table: Table,
          embed: Embed,
        },
      })
    }
  }, [])

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMounted(true)
    }
  }, [])

  React.useEffect(() => {
    const init = async () => {
      await initializeEditor()
    }

    setTimeout(() => {
      titleRef.current?.focus()
    }, 0)

    if (isMounted) {
      init()

      return () => {
        ref.current?.destroy()
        ref.current = undefined
      }
    }
  }, [isMounted, initializeEditor])

  React.useEffect(() => {
    if (Object.keys(errors).length) {
      for (const [, value] of Object.entries(errors)) {
        toast({
          title: 'Uh oh! Something went wrong.',
          description: value.message as string,
          variant: 'destructive',
        })
      }
    }
  }, [errors])

  const { mutate: createPostMutate } = useMutation({
    mutationFn: async (payload: FormValues) => {
      const response = await axios.post('/api/subreddits/posts', payload)

      const data = response.data

      return data
    },
    onError: () => {
      return toast({
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request.',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      const subredditPathname = pathname.split('/').slice(0, -1).join('/')

      router.push(subredditPathname)
      router.refresh()

      return toast({
        description: 'Your post has been published.',
      })
    },
  })

  async function onSubmit({ title }: FormValues) {
    const blocks = await ref.current?.save()

    const payload = {
      title,
      content: blocks,
      subredditId,
    }

    createPostMutate(payload)
  }

  return (
    <div className="w-full rounded-lg border p-4">
      <form
        id="subreddit-post-form"
        className="w-fit"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="prose prose-stone dark:prose-invert">
          <TextareaAutosize
            ref={(ref) => {
              hookformTitleRef(ref)

              // @ts-ignore
              titleRef.current = ref
            }}
            {...titleRegister}
            placeholder="Title"
            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
          />

          <div id="editor" className="min-h-[500px]" />
          <p className="text-sm text-gray-500">
            Use{' '}
            <kbd className="rounded-md border bg-muted px-1 text-xs uppercase">
              Tab
            </kbd>{' '}
            to open the command menu.
          </p>
        </div>
      </form>
    </div>
  )
}
