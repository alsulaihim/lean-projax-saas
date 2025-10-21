'use client'

import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Users, Cpu, Package, Settings, TrendingUp } from 'lucide-react'

interface FishboneCategory {
  id: string
  categoryName: string
  causes: Array<{
    id: string
    causeName: string
    description?: string | null
  }>
}

interface FishboneDiagramProps {
  problemStatement: string
  categories: FishboneCategory[]
  height?: number
  className?: string
}

interface CategoryNodeData {
  categoryType?: string
  label: string
  causesCount: number
}

interface CauseNodeData {
  label: string
  description?: string
}

interface ProblemNodeData {
  label: string
}

// Custom node component for category
const CategoryNode = ({ data }: { data: CategoryNodeData }) => {
  const getIcon = () => {
    switch (data.categoryType) {
      case 'Man':
      case 'People':
        return <Users className="h-4 w-4" />
      case 'Machine':
      case 'Equipment':
        return <Cpu className="h-4 w-4" />
      case 'Material':
        return <Package className="h-4 w-4" />
      case 'Method':
      case 'Process':
        return <Settings className="h-4 w-4" />
      case 'Measurement':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="bg-white border-2 border-gray-800 rounded-lg p-3 min-w-[140px]">
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <div className="flex items-center gap-2 mb-1">
        {getIcon()}
        <div className="font-bold text-sm">{data.label}</div>
      </div>
      <Badge variant="outline" className="text-xs">
        {data.causesCount} cause{data.causesCount !== 1 ? 's' : ''}
      </Badge>
      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  )
}

// Custom node component for causes
const CauseNode = ({ data }: { data: CauseNodeData }) => {
  return (
    <div className="bg-gray-50 border border-gray-300 rounded-md p-2 max-w-[180px]">
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <div className="text-xs font-medium">{data.label}</div>
      {data.description && (
        <div className="text-xs text-gray-600 mt-1">{data.description}</div>
      )}
    </div>
  )
}

// Custom node component for problem statement (effect)
const ProblemNode = ({ data }: { data: ProblemNodeData }) => {
  return (
    <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 min-w-[200px]">
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <div className="font-bold text-red-900">{data.label}</div>
      </div>
    </div>
  )
}

const nodeTypes: NodeTypes = {
  category: CategoryNode,
  cause: CauseNode,
  problem: ProblemNode,
}

export function FishboneDiagram({
  problemStatement,
  categories,
  height = 600,
  className
}: FishboneDiagramProps) {
  // Generate nodes and edges for the fishbone diagram
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []

    // Add problem statement node (the "head" of the fish)
    nodes.push({
      id: 'problem',
      type: 'problem',
      position: { x: 800, y: 300 },
      data: { label: problemStatement || 'Problem Statement' },
    })

    // Add main spine
    nodes.push({
      id: 'spine-start',
      type: 'default',
      position: { x: 50, y: 300 },
      data: { label: '' },
      style: { opacity: 0, width: 1, height: 1 }
    })

    edges.push({
      id: 'main-spine',
      source: 'spine-start',
      target: 'problem',
      type: 'straight',
      style: { stroke: '#374151', strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#374151',
      },
    })

    // Distribute categories along the spine
    const categoriesPerSide = Math.ceil(categories.length / 2)
    const topCategories = categories.slice(0, categoriesPerSide)
    const bottomCategories = categories.slice(categoriesPerSide)

    // Add top categories
    topCategories.forEach((category, index) => {
      const categoryX = 150 + (index * 200)
      const categoryY = 100

      // Add category node
      nodes.push({
        id: `category-${category.id}`,
        type: 'category',
        position: { x: categoryX, y: categoryY },
        data: {
          label: category.categoryName,
          categoryType: category.categoryName,
          causesCount: category.causes.length
        },
      })

      // Add spine connection point
      nodes.push({
        id: `spine-top-${index}`,
        type: 'default',
        position: { x: categoryX + 70, y: 300 },
        data: { label: '' },
        style: { opacity: 0, width: 1, height: 1 }
      })

      // Connect category to spine
      edges.push({
        id: `edge-cat-${category.id}`,
        source: `category-${category.id}`,
        target: `spine-top-${index}`,
        type: 'straight',
        style: { stroke: '#6b7280', strokeWidth: 2 },
      })

      // Add causes for this category
      category.causes.forEach((cause, causeIndex) => {
        const causeX = categoryX - 50
        const causeY = categoryY - 60 - (causeIndex * 50)

        nodes.push({
          id: `cause-${cause.id}`,
          type: 'cause',
          position: { x: causeX, y: causeY },
          data: {
            label: cause.causeName,
            description: cause.description
          },
        })

        edges.push({
          id: `edge-cause-${cause.id}`,
          source: `cause-${cause.id}`,
          target: `category-${category.id}`,
          type: 'straight',
          style: { stroke: '#9ca3af', strokeWidth: 1 },
        })
      })
    })

    // Add bottom categories
    bottomCategories.forEach((category, index) => {
      const categoryX = 150 + (index * 200)
      const categoryY = 500

      // Add category node
      nodes.push({
        id: `category-${category.id}`,
        type: 'category',
        position: { x: categoryX, y: categoryY },
        data: {
          label: category.categoryName,
          categoryType: category.categoryName,
          causesCount: category.causes.length
        },
      })

      // Add spine connection point
      nodes.push({
        id: `spine-bottom-${index}`,
        type: 'default',
        position: { x: categoryX + 70, y: 300 },
        data: { label: '' },
        style: { opacity: 0, width: 1, height: 1 }
      })

      // Connect category to spine
      edges.push({
        id: `edge-cat-${category.id}`,
        source: `category-${category.id}`,
        target: `spine-bottom-${index}`,
        type: 'straight',
        style: { stroke: '#6b7280', strokeWidth: 2 },
      })

      // Add causes for this category
      category.causes.forEach((cause, causeIndex) => {
        const causeX = categoryX - 50
        const causeY = categoryY + 60 + (causeIndex * 50)

        nodes.push({
          id: `cause-${cause.id}`,
          type: 'cause',
          position: { x: causeX, y: causeY },
          data: {
            label: cause.causeName,
            description: cause.description
          },
        })

        edges.push({
          id: `edge-cause-${cause.id}`,
          source: `cause-${cause.id}`,
          target: `category-${category.id}`,
          type: 'straight',
          style: { stroke: '#9ca3af', strokeWidth: 1 },
        })
      })
    })

    return { nodes, edges }
  }, [categories, problemStatement])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Fishbone Diagram (Ishikawa)</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height }} className="border-2 border-gray-200 rounded-lg bg-gray-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
            defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
          >
            <Background variant="dots" gap={16} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                if (node.type === 'problem') return '#ef4444'
                if (node.type === 'category') return '#374151'
                return '#9ca3af'
              }}
              pannable
              zoomable
            />
          </ReactFlow>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span>Problem/Effect</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-800 rounded" />
            <span>Main Categories</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded" />
            <span>Root Causes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}