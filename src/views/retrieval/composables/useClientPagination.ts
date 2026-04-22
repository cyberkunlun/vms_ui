import { computed, ref, watch, toValue, type MaybeRefOrGetter } from 'vue'

/** Client-side pagination for mock / in-memory lists (supports ref, computed, or getter) */
export function useClientPagination<T>(source: MaybeRefOrGetter<T[]>, initialPageSize = 10) {
  const page = ref(1)
  const pageSize = ref(initialPageSize)

  const list = () => toValue(source) ?? []

  const total = computed(() => list().length)

  const pagedItems = computed(() => {
    const arr = list()
    const start = (page.value - 1) * pageSize.value
    return arr.slice(start, start + pageSize.value)
  })

  function resetPage() {
    page.value = 1
  }

  watch(
    () => list().length,
    (len) => {
      const maxPage = Math.max(1, Math.ceil(len / pageSize.value) || 1)
      if (page.value > maxPage) page.value = maxPage
      if (len === 0) page.value = 1
    }
  )

  return { page, pageSize, total, pagedItems, resetPage }
}
