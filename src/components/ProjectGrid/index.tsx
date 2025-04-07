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
 * that detects and fills empty spaces with placeholder content
 */
const ProjectGrid = ({ projects }: ProjectGridProps) => {
  const [gridItems, setGridItems] = useState<GridItem[]>([])
  const [columns, setColumns] = useState(3)
  const [rows, setRows] = useState(0)
  const gridRef = useRef<HTMLDivElement>(null)

  // Detect empty grid cells and fill them with placeholders
  const detectEmptySpaces = (
    items: GridItem[],
    cols: number,
    estimatedRows: number,
  ): GridItem[] => {
    // Create a grid map to track occupied cells
    const gridMap: boolean[][] = Array(estimatedRows)
      .fill(false)
      .map(() => Array(cols).fill(false))

    // Mark occupied cells based on item positions and sizes
    items.forEach((item) => {
      if (!item.position) return

      const { row, col, rowSpan, colSpan } = item.position

      // Mark all cells covered by this item as occupied
      for (let r = row; r < row + rowSpan; r++) {
        for (let c = col; c < col + colSpan; c++) {
          if (r < gridMap.length && c < cols) {
            gridMap[r][c] = true
          }
        }
      }
    })

    // Find empty cells and create placeholder items for them
    const placeholders: GridItem[] = []

    gridMap.forEach((rowCells, r) => {
      rowCells.forEach((isOccupied, c) => {
        if (!isOccupied) {
          // Create a placeholder for this empty cell
          placeholders.push({
            project: null,
            size: 'small', // Placeholders are always small (1x1)
            isPlaceholder: true,
            position: {
              row: r,
              col: c,
              rowSpan: 1,
              colSpan: 1,
            },
          })
        }
      })
    })

    return [...items, ...placeholders]
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

    // Initial call and add listener
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

    // Add some buffer rows to ensure we have enough space
    return Math.ceil(totalCells / cols) + 2
  }

  // Assign positions to grid items
  const assignGridPositions = (items: GridItem[], cols: number): GridItem[] => {
    // Create a grid map to track occupied cells
    const estimatedRows = calculateEstimatedRows(items, cols)
    const gridMap: boolean[][] = Array(estimatedRows)
      .fill(false)
      .map(() => Array(cols).fill(false))

    return items.map((item) => {
      // Determine spans based on item size
      const colSpan = item.size === 'wide' || item.size === 'large' ? 2 : 1
      const rowSpan = item.size === 'tall' || item.size === 'large' ? 2 : 1

      // Find next available position
      for (let r = 0; r < gridMap.length; r++) {
        for (let c = 0; c <= cols - colSpan; c++) {
          // Check if this position can fit the item
          let canFit = true

          for (let rOffset = 0; rOffset < rowSpan; rOffset++) {
            for (let cOffset = 0; cOffset < colSpan; cOffset++) {
              if (r + rOffset >= gridMap.length) {
                // Extend grid map if needed
                gridMap.push(Array(cols).fill(false))
              }

              if (gridMap[r + rOffset][c + cOffset]) {
                canFit = false
                break
              }
            }

            if (!canFit) break
          }

          if (canFit) {
            // Mark cells as occupied
            for (let rOffset = 0; rOffset < rowSpan; rOffset++) {
              for (let cOffset = 0; cOffset < colSpan; cOffset++) {
                gridMap[r + rOffset][c + cOffset] = true
              }
            }

            // Return item with position
            return {
              ...item,
              position: {
                row: r,
                col: c,
                rowSpan,
                colSpan,
              },
            }
          }
        }
      }

      // Shouldn't reach here if grid is properly sized
      return item
    })
  }

  // Create grid items with sizes whenever columns change
  useEffect(() => {
    if (!projects.length) return

    // Assign sizes based on feature status and pattern
    const createGridItems = (): GridItem[] => {
      // Copy projects to avoid mutating the original
      const projectsCopy = [...projects]
      const items: GridItem[] = []

      // Process featured projects first (they get 'large' size)
      const featuredProjects = projectsCopy
        .filter((project) => project.featured)
        .map((project) => ({ project, size: 'large' as ItemSize }))

      // Remove featured projects from the copy
      const regularProjects = projectsCopy.filter((project) => !project.featured)

      // Create a pattern that fits perfectly in the grid based on column count
      const pattern: ItemSize[] = generateOptimalPattern(columns)

      // Assign sizes to regular projects based on the pattern
      const regularItems = regularProjects.map((project, idx) => ({
        project,
        size: pattern[idx % pattern.length] as ItemSize,
      }))

      // Combine featured and regular projects
      const allItems = [...featuredProjects, ...regularItems]

      // Assign positions to all items
      const itemsWithPositions = assignGridPositions(allItems, columns)

      // Estimate the number of rows needed
      const estimatedRows = calculateEstimatedRows(itemsWithPositions, columns)
      setRows(estimatedRows)

      // Detect and fill empty spaces with placeholders
      return detectEmptySpaces(itemsWithPositions, columns, estimatedRows)
    }

    // Generate the grid items
    setGridItems(createGridItems())
  }, [projects, columns])

  /**
   * Generate an optimal pattern that guarantees no gaps based on column count
   */
  const generateOptimalPattern = (cols: number): ItemSize[] => {
    switch (cols) {
      case 1:
        // For single column, all items are the full width
        return ['small', 'tall']
      case 2:
        // For two columns, perfect pattern:
        return ['large', 'small', 'small', 'tall', 'wide']
      case 3:
      default:
        // For three columns, perfect pattern:
        return ['large', 'small', 'tall', 'small', 'wide', 'small']
    }
  }

  // Calculate the span classes based on size and column count
  const getSpanClasses = (size: ItemSize): string => {
    switch (columns) {
      case 1:
        return 'col-span-1' // All items span the full width in 1-column mode
      case 2:
        // 2-column grid spans
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
        // 3-column grid spans
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
        const { width, height } = getSizeClasses(item.size)
        const spanClass = getSpanClasses(item.size)
        const rowSpanClass =
          item.size === 'tall' || item.size === 'large' ? 'row-span-2' : 'row-span-1'

        // Render placeholder for empty spaces
        if (item.isPlaceholder) {
          return (
            <div
              key={`placeholder-${index}`}
              className={`col-span-1 row-span-1 border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center p-4`}
              style={{
                gridRow: item.position?.row
                  ? `${item.position.row + 1} / span ${item.position.rowSpan}`
                  : undefined,
                gridColumn: item.position?.col
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

        // Regular project item
        return (
          <div
            key={`project-${item.project?.id || index}-${index}`}
            className={`${spanClass} ${rowSpanClass} relative overflow-hidden`}
            style={{
              gridRow: item.position?.row
                ? `${item.position.row + 1} / span ${item.position.rowSpan}`
                : undefined,
              gridColumn: item.position?.col
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

                {/* White overlay on hover */}
                <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Project details - only visible on hover */}
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
