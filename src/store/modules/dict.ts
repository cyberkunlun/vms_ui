interface DictValueType {
  value: any
  label: string
  colorType?: string
  cssClass?: string
}

const dictMap: Record<string, DictValueType[]> = {}

export const useDictStoreWithOut = () => ({
  getDictByType: (type: string) => dictMap[type] || [],
  setDictMap: async () => {},
  resetDict: async () => {}
})
