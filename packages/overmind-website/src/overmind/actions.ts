import { Action, pipe, debounce, Operator, mutate, filter } from 'overmind'
import { RouteContext, GuideParams, VideoParams, Page } from './types'

const route: <T>(action: Action<RouteContext<T>>) => Action<RouteContext<T>> = (
  action
) => (context, routeContext) => {
  const { state, effects } = context

  if (
    state.typescript !== JSON.parse(routeContext.query.typescript) ||
    state.theme !== routeContext.query.view
  ) {
    state.typescript = routeContext.query.typescript === 'true'
    state.theme = routeContext.query.view

    effects.storage.set('theme', state.theme)
    effects.storage.set('typescript', state.typescript)
    effects.css.changePrimary(state.theme)
  }

  action(context, routeContext)
}

export const openHome: Action<RouteContext> = route(
  async ({ state, effects }) => {
    state.page = Page.HOME
    if (!state.demos.length) {
      state.demos = await effects.request('/backend/demos')
    }
  }
)

export const openGuides: Action<RouteContext> = route(
  async ({ state, effects }) => {
    state.page = Page.GUIDES
    if (!state.guides.length) {
      state.isLoadingGuides = true
      state.guides = await effects.request('/backend/guides')
      state.isLoadingGuides = false
    }
  }
)

export const openVideos: Action<RouteContext> = route(
  async ({ state, effects }) => {
    state.page = Page.VIDEOS
    state.currentVideo = null
    if (!state.videos.length) {
      state.isLoadingVideos = true
      state.videos = await effects.request('/backend/videos')
      state.isLoadingVideos = false
    }
  }
)

export const openVideo: Action<RouteContext<VideoParams>> = (
  { state, actions },
  routeContext
) => {
  actions.openVideos(routeContext)
  state.currentVideo = routeContext.params.title
}

export const openGuide: Action<RouteContext<GuideParams>> = route(
  ({ state }, routeContext) => {
    state.page = Page.GUIDE
    state.currentGuide = routeContext.params
  }
)

export const openApi: Action<RouteContext<VideoParams>> = route(
  async ({ state, effects }, routeContext) => {
    state.page = Page.API
    state.currentApi = routeContext.params.title
    if (!state.apis.length) {
      state.isLoadingApis = true
      state.apis = await effects.request('/backend/apis')
      state.isLoadingApis = false
    }
  }
)

export const selectTheme: Action<string> = ({ effects }, selection) => {
  const selectionArray = selection.split('_')
  const view = selectionArray[0]
  const typescript = String(Boolean(selectionArray[1]))

  effects.router.redirectWithQuery(effects.router.getPath(), {
    view,
    typescript,
  })
}

export const closeSearch: Action = ({ state }) => {
  state.showSearchResult = false
  state.query = ''
}

export const changeQuery: Operator<string> = pipe(
  mutate(({ state }, query) => {
    state.query = query
    state.showSearchResult = query.length > 2
    state.isLoadingSearchResult = query.length > 2
  }),
  filter((_, query) => query.length >= 3),
  debounce(200),
  mutate(async ({ state, effects }, query) => {
    state.searchResult = await effects.request('/backend/search?query=' + query)
    state.isLoadingSearchResult = false
  })
)

export const viewHelpGotIt: Action = ({ state }) => {
  state.showViewHelp = false
}
