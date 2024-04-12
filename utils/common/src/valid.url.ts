export function isValidUrl(url: string | URL) {
  if (url instanceof URL) {
    return true
  }
  try {
    new URL(url)
    return true
  } catch (error) {
    return false
  }
}
