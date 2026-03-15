import noShowWelcomeRaw from '../../../data/examples/no-show-welcome.json?raw'
import showBasicWellcomeRaw from '../../../data/examples/show-basic-wellcome.json?raw'
import showOriginalWelcomeRaw from '../../../data/examples/show-original-welcome.json?raw'

export type BundledDatasetFile = {
  id: string
  name: string
  rawContent: string
}

export const bundledDatasets: BundledDatasetFile[] = [
  {
    id: 'show-basic-wellcome',
    name: 'show-basic-wellcome.json',
    rawContent: showBasicWellcomeRaw,
  },
  {
    id: 'show-original-welcome',
    name: 'show-original-welcome.json',
    rawContent: showOriginalWelcomeRaw,
  },
  {
    id: 'no-show-welcome',
    name: 'no-show-welcome.json',
    rawContent: noShowWelcomeRaw,
  },
]
