import { SingleEmitter } from '../util/emitter.js'

export abstract class Job {
  abstract start(): Promise<void>
}

export type QueueOptions = {
  concurrency: number
  exceedStrategy: 'ignore' | 'wait'
}

export class Queue {
  listMap = new Map<string, Job[]>()
  private onFinished = new SingleEmitter<Job>()

  constructor(public options: QueueOptions) {}

  async run(key: string, job: Job): Promise<void> {
    const list = this.listMap.get(key) ?? []
    if (list.length >= this.options.concurrency) {
      switch (this.options.exceedStrategy) {
        case 'ignore':
          return
        case 'wait':
          await new Promise<void>((resolve) => {
            this.onFinished.on(() => resolve())
          })
          return await this.run(key, job)
      }
    }
    list.push(job)
    try {
      await job.start()
    } finally {
      const newList = list.filter((j) => j !== job)
      if (newList.length === 0) this.listMap.delete(key)
      else this.listMap.set(key, newList)
      this.onFinished.fire(job)
    }
  }
}

export const uniqueQueue = new Queue({
  concurrency: 1,
  exceedStrategy: 'ignore',
})
