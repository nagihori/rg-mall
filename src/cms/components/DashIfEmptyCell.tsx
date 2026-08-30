'use client'

import type { DefaultCellComponentProps } from 'payload'

export const DashIfEmptyCell: React.FC<DefaultCellComponentProps> = ({ cellData }) => {
  return <span>{typeof cellData === 'string' && cellData ? cellData : '-'}</span>
}

export default DashIfEmptyCell
