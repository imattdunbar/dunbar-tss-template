import serverEntry, { createServerEntry } from '@tanstack/react-start/server-entry'

export default createServerEntry({
  fetch(request) {
    return serverEntry.fetch(request)
  }
})
