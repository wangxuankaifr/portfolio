import { publicAsset } from './publicAsset'

export default function BrandMark({ className = '' }) {
  return <img className={className} src={publicAsset('/sw-mark.svg?v=selected-20261101')} width="128" height="128" alt="" draggable="false" />
}
