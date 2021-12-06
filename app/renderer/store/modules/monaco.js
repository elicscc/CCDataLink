const state = {
  currentTabsName: null,
  theme: 'vs-dark',
  suggestionsInitial: false
}
const mutations = {
  SET_CURRENT_TABS_NAME: (state, currentTabsName) => {
    state.currentTabsName = currentTabsName
  },
  SET_MONACO_THEME: (state, theme) => {
    state.theme = theme
  },
  SET_SUGGESTIONS_INITIAL: (state, suggestionsInitial) => {
    state.suggestionsInitial = suggestionsInitial
  }
}

const actions = {
  setCurrentTabsName ({ commit }, currentTabsName) {
    commit('SET_CURRENT_TABS_NAME', currentTabsName)
  },
  setMonacoTheme ({ commit }, theme) {
    commit('SET_MONACO_THEME', theme)
  },
  setSuggestionsInitial ({ commit }, suggestionsInitial) {
    commit('SET_SUGGESTIONS_INITIAL', suggestionsInitial)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
