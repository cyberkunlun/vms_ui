import { useDictStoreWithOut } from '@/store/modules/dict'

const dictStore = useDictStoreWithOut()

export interface DictDataType {
  dictType: string
  label: string
  value: string | number | boolean
  colorType: string
  cssClass: string
}

export interface NumberDictDataType extends DictDataType {
  value: number
}

interface DictValueItem {
  value: any
  label: string
  colorType?: string
  cssClass?: string
}

const toDictDataType = (items: DictValueItem[], dictType: string): DictDataType[] => {
  return items.map(item => ({
    dictType,
    label: item.label,
    value: item.value,
    colorType: item.colorType || '',
    cssClass: item.cssClass || ''
  }))
}

export const getDictOptions = (dictType: string) => {
  return toDictDataType(dictStore.getDictByType(dictType) || [], dictType)
}

export const getIntDictOptions = (dictType: string): NumberDictDataType[] => {
  const dictOptions: DictDataType[] = getDictOptions(dictType)
  return dictOptions.map(dict => ({
    ...dict,
    value: parseInt(dict.value + '')
  }))
}

export const getStrDictOptions = (dictType: string) => {
  const dictOptions: DictDataType[] = getDictOptions(dictType)
  return dictOptions.map(dict => ({
    ...dict,
    value: dict.value + ''
  }))
}

export const getBoolDictOptions = (dictType: string) => {
  const dictOptions: DictDataType[] = getDictOptions(dictType)
  return dictOptions.map(dict => ({
    ...dict,
    value: (dict.value + '') === 'true'
  }))
}

export const getDictObj = (dictType: string, value: any): DictDataType | undefined => {
  const dictOptions: DictDataType[] = getDictOptions(dictType)
  return dictOptions.find(dict => dict.value === value + '')
}

export const getDictLabel = (dictType: string, value: any): string => {
  const dictOptions: DictDataType[] = getDictOptions(dictType)
  const found = dictOptions.find(dict => dict.value === value + '')
  return found?.label || ''
}

export enum DICT_TYPE {
  COMMON_STATUS = 'common_status',
  CAMERA_USAGE = 'camera_usage',
  CAMERA_SCENE = 'camera_scene'
}
