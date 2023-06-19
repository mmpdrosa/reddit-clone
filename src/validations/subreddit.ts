import { z } from 'zod'

export const subredditSchema = z.object({
  name: z.string().min(3).max(21),
})

export const subredditSubscriptionSchema = z.object({
  subredditId: z.string(),
})
