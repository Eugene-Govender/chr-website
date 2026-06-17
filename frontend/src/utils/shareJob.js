export async function shareJob(job, onCopied) {
  const shareUrl = `${window.location.origin}/jobs/${job.id}`
  const shareData = {
    title: `${job.title} — CHR Consulting`,
    text: `Check out this role at CHR Consulting: ${job.title}`,
    url: shareUrl,
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
      return
    }
    await navigator.clipboard.writeText(shareUrl)
    onCopied?.('Link copied!')
  } catch (err) {
    if (err?.name === 'AbortError') return
    try {
      await navigator.clipboard.writeText(shareUrl)
      onCopied?.('Link copied!')
    } catch {
      // Clipboard blocked — nothing else we can do silently.
    }
  }
}
