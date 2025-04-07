'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Project {
  id: string
  title: string
  slug: string
  yearCompleted?: number
  featured?: boolean
  image?:
    | {
        url?: string
        alt?: string
      }
    | number
}

interface ProjectGridProps {
  projects: Project[]
}

/**
 * Size types for grid items
 */
type ItemSize = 'small' | 'wide' | 'tall' | 'large'

/**
 * Grid item with size and position information
 */
interface GridItem {
  project: Project | null
  size: ItemSize
  isPlaceholder?: boolean
  position?: {
    row: number
    col: number
    rowSpan: number
    colSpan: number
  }
}

/**
 * Get CSS classes for a grid item size
 */
const getSizeClasses = (size: ItemSize): { width: string; height: string } => {
  switch (size) {
    case 'small':
      return { width: 'w-full', height: 'h-[350px]' }
    case 'wide':
      return { width: 'w-full', height: 'h-[350px]' }
    case 'tall':
      return { width: 'w-full', height: 'h-[700px]' }
    case 'large':
      return { width: 'w-full', height: 'h-[700px]' }
    default:
      return { width: 'w-full', height: 'h-[350px]' }
  }
}

/**
 * ProjectGrid component with responsive, gap-free grid layout
 * that adjusts the final row if not fully occupied
 */
const ProjectGrid = ({ projects }: ProjectGridProps) => {
  const [gridItems, setGridItems] = useState<GridItem[]>([])
  const [columns, setColumns] = useState(3)
  const [rows, setRows] = useState(0)
  const gridRef = useRef<HTMLDivElement>(null)

  // New helper: adjustLastRow
  const adjustLastRow = (items: GridItem[], cols: number): GridItem[] => {
    let adjusted = [...items]
    while (true) {
      const maxRow = Math.max(
        ...adjusted.map((item) => (item.position ? item.position.row + item.position.rowSpan : 0)),
      )
      // Build occupancy for last row (index maxRow - 1)
      const occupancy = Array(cols).fill(false)
      adjusted.forEach((item) => {
        if (item.position) {
          const startRow = item.position.row
          const endRow = item.position.row + item.position.rowSpan
          // If the item occupies the last row
          if (startRow <= maxRow - 1 && endRow > maxRow - 1) {
            for (let c = item.position.col; c < item.position.col + item.position.colSpan; c++) {
              if (c < cols) occupancy[c] = true
            }
          }
        }
      })
      // If last row is completely filled, break.
      if (occupancy.filter(Boolean).length === cols) break
      // Otherwise, shrink items that exactly reach the bottom
      let shrunk = false
      adjusted = adjusted.map((item) => {
        if (item.position) {
          const bottom = item.position.row + item.position.rowSpan
          if (bottom === maxRow && item.position.rowSpan > 1) {
            shrunk = true
            return {
              ...item,
              position: { ...item.position, rowSpan: item.position.rowSpan - 1 },
            }
          }
        }
        return item
      })
      if (!shrunk) break
    }
    return adjusted
  }

  // Detect screen width and set column count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setColumns(1)
      } else if (window.innerWidth < 768) {
        setColumns(2)
      } else {
        setColumns(3)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Calculate estimated number of rows based on item sizes and column count
  const calculateEstimatedRows = (items: GridItem[], cols: number): number => {
    let totalCells = 0
    items.forEach((item) => {
      const colSpan = item.size === 'wide' || item.size === 'large' ? 2 : 1
      const rowSpan = item.size === 'tall' || item.size === 'large' ? 2 : 1
      totalCells += colSpan * rowSpan
    })
    return Math.ceil(totalCells / cols)
  }

  // Assign positions to grid items
  const assignGridPositions = (items: GridItem[], cols: number): GridItem[] => {
    const estimatedRows = calculateEstimatedRows(items, cols)
    const gridMap: boolean[][] = Array(estimatedRows)
      .fill(false)
      .map(() => Array(cols).fill(false))

    return items.map((item) => {
      const colSpan = item.size === 'wide' || item.size === 'large' ? 2 : 1
      const rowSpan = item.size === 'tall' || item.size === 'large' ? 2 : 1

      for (let r = 0; r < gridMap.length; r++) {
        for (let c = 0; c <= cols - colSpan; c++) {
          let canFit = true
          for (let rOffset = 0; rOffset < rowSpan; rOffset++) {
            // Initialize the row if undefined
            gridMap[r + rOffset] = gridMap[r + rOffset] ?? Array(cols).fill(false)
            for (let cOffset = 0; cOffset < colSpan; cOffset++) {
              if (gridMap[r + rOffset]![c + cOffset]) {
                canFit = false
                break
              }
            }
            if (!canFit) break
          }
          if (canFit) {
            for (let rOffset = 0; rOffset < rowSpan; rOffset++) {
              gridMap[r + rOffset] = gridMap[r + rOffset] ?? Array(cols).fill(false)
              for (let cOffset = 0; cOffset < colSpan; cOffset++) {
                gridMap[r + rOffset]![c + cOffset] = true
              }
            }
            return {
              ...item,
              position: { row: r, col: c, rowSpan, colSpan },
            }
          }
        }
      }
      return item
    })
  }

  useEffect(() => {
    if (!projects.length) return

    const createGridItems = (): GridItem[] => {
      const projectsCopy = [...projects]
      const items: GridItem[] = []

      const featuredProjects = projectsCopy
        .filter((project) => project.featured)
        .map((project) => ({ project, size: 'large' as ItemSize }))

      const regularProjects = projectsCopy.filter((project) => !project.featured)
      const pattern: ItemSize[] = generateOptimalPattern(columns)
      const regularItems = regularProjects.map((project, idx) => ({
        project,
        size: pattern[idx % pattern.length] as ItemSize,
      }))

      const allItems = [...featuredProjects, ...regularItems]
      const itemsWithPositions = assignGridPositions(allItems, columns)
      const adjustedItems = adjustLastRow(itemsWithPositions, columns)
      const actualRows = Math.max(
        ...adjustedItems.map((item) =>
          item.position ? item.position.row + item.position.rowSpan : 0,
        ),
      )
      setRows(actualRows)
      return adjustedItems
    }
    setGridItems(createGridItems())
  }, [projects, columns])

  const generateOptimalPattern = (cols: number): ItemSize[] => {
    switch (cols) {
      case 1:
        return ['small', 'tall']
      case 2:
        return ['large', 'small', 'small', 'tall', 'wide']
      case 3:
      default:
        return ['large', 'small', 'tall', 'small', 'wide', 'small']
    }
  }

  const getSpanClasses = (size: ItemSize): string => {
    switch (columns) {
      case 1:
        return 'col-span-1'
      case 2:
        switch (size) {
          case 'small':
            return 'col-span-1'
          case 'wide':
            return 'col-span-2'
          case 'tall':
            return 'col-span-1'
          case 'large':
            return 'col-span-2'
          default:
            return 'col-span-1'
        }
      case 3:
      default:
        switch (size) {
          case 'small':
            return 'col-span-1'
          case 'wide':
            return 'col-span-2'
          case 'tall':
            return 'col-span-1'
          case 'large':
            return 'col-span-2'
          default:
            return 'col-span-1'
        }
    }
  }

  return (
    <div
      ref={gridRef}
      className={`grid grid-cols-${columns} gap-2 auto-rows-[350px] grid-auto-flow-dense`}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridAutoRows: '350px',
      }}
    >
      {gridItems.map((item, index) => {
        const spanClass = getSpanClasses(item.size)
        const rowSpanClass =
          item.size === 'tall' || item.size === 'large' ? 'row-span-2' : 'row-span-1'

        if (item.isPlaceholder) {
          return (
            <div
              key={`placeholder-${index}`}
              className="col-span-1 row-span-1 border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center p-4"
              style={{
                gridRow: item.position
                  ? `${item.position.row + 1} / span ${item.position.rowSpan}`
                  : undefined,
                gridColumn: item.position
                  ? `${item.position.col + 1} / span ${item.position.colSpan}`
                  : undefined,
              }}
            >
              <div className="text-center text-gray-400">
                <div className="text-sm font-medium">Available Space</div>
                <div className="text-xs mt-1">1×1</div>
              </div>
            </div>
          )
        }

        return (
          <div
            key={`project-${item.project?.id || index}-${index}`}
            className={`${spanClass} ${rowSpanClass} relative overflow-hidden`}
            style={{
              gridRow: item.position
                ? `${item.position.row + 1} / span ${item.position.rowSpan}`
                : undefined,
              gridColumn: item.position
                ? `${item.position.col + 1} / span ${item.position.colSpan}`
                : undefined,
            }}
          >
            <Link href={`/projects/${item.project?.slug}`} className="block h-full">
              <div className="relative h-full group">
                <Image
                  src={
                    typeof item.project?.image !== 'number' && item.project?.image?.url
                      ? item.project.image.url
                      : '/placeholder.jpg'
                  }
                  alt={
                    typeof item.project?.image !== 'number' && item.project?.image?.alt
                      ? item.project.image.alt
                      : item.project?.title || 'Project'
                  }
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-black/60 p-3 max-w-[80%] text-center">
                    <h3 className="text-white text-base sm:text-lg font-normal">
                      {item.project?.title}
                    </h3>
                    {item.project?.yearCompleted && (
                      <span className="text-white text-sm">{item.project.yearCompleted}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}

export default ProjectGrid
