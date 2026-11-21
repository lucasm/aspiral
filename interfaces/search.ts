export interface ISearchCategory {
  name: string
  name_translated?: string
  name_trends?: string
  name_stories?: string
  name_seo?: string
  description?: string
  active: boolean
  data: ISearch[]
}

export interface ISearch {
  id?: string
  domain?: string
  name: string
  action?: string
  query?: string | boolean
  color?: string
  siteUrl?: string
  rssUrl?: string
  videoYoutubeId?: string
  legacyFeed?: boolean
  child?: ISearchChild[]
  additional?: string
}

export type ISearchSource = ISearch & { action: string }

export interface ISearchChild {
  name: string
  action: string
  query?: string
  additional?: string
  videoYoutubeId?: string
}
