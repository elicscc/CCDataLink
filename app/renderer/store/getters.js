const getters = {
  avatar: state => '1',
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  name: state => state.user.name,
  // name: state => '测试1',
  menuAddresses: state => state.user.menuAddresses,
  permission_routes: state => state.permission.routes
}
export default getters
