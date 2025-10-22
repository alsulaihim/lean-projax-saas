'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  RotateCcw,
  Eye,
  Clock,
  User,
  Filter
} from 'lucide-react'
import type { Prisma, AuditAction } from '@prisma/client'

type AuditLogWithUser = Prisma.AuditLogGetPayload<{
  include: { user: true }
}>

interface AuditLogSectionProps {
  assignmentId: string
  auditLogs: AuditLogWithUser[]
}

export function AuditLogSection({ assignmentId: _assignmentId, auditLogs }: AuditLogSectionProps) {
  const [filterAction, setFilterAction] = useState<string>('ALL')
  const [filterEntityType, setFilterEntityType] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  const actionIcons: Record<AuditAction, React.ReactElement> = {
    CREATED: <Plus className="h-4 w-4 text-green-600" />,
    UPDATED: <Edit className="h-4 w-4 text-blue-600" />,
    DELETED: <Trash2 className="h-4 w-4 text-red-600" />,
    COMPLETED: <CheckCircle className="h-4 w-4 text-green-600" />,
    REOPENED: <RotateCcw className="h-4 w-4 text-orange-600" />,
    ACCESSED: <Eye className="h-4 w-4 text-gray-600" />
  }

  const actionColors: Record<AuditAction, string> = {
    CREATED: 'bg-green-100 text-green-800 border-green-300',
    UPDATED: 'bg-blue-100 text-blue-800 border-blue-300',
    DELETED: 'bg-red-100 text-red-800 border-red-300',
    COMPLETED: 'bg-green-100 text-green-800 border-green-300',
    REOPENED: 'bg-orange-100 text-orange-800 border-orange-300',
    ACCESSED: 'bg-gray-100 text-gray-800 border-gray-300'
  }

  // Get unique entity types
  const entityTypes = Array.from(new Set(auditLogs.map(log => log.entityType))).sort()

  // Filter logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesAction = filterAction === 'ALL' || log.action === filterAction
    const matchesEntityType = filterEntityType === 'ALL' || log.entityType === filterEntityType
    const matchesSearch = searchTerm === '' ||
      log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesAction && matchesEntityType && matchesSearch
  })

  const formatTimestamp = (date: Date) => {
    const d = new Date(date)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(d)
  }

  const formatEntityType = (type: string) => {
    // Convert PascalCase to Title Case with spaces
    return type.replace(/([A-Z])/g, ' $1').trim()
  }

  const renderChangeDetails = (log: AuditLogWithUser) => {
    if (!log.changeDetails || typeof log.changeDetails !== 'object') {
      return '-'
    }

    const details = log.changeDetails as any

    if (log.action === 'UPDATED' && details.before && details.after) {
      // Show before/after for updates
      const changedFields = Object.keys(details.after)
      return (
        <div className="text-xs space-y-1">
          {changedFields.map(field => (
            <div key={field} className="font-mono">
              <span className="text-gray-500">{field}:</span>{' '}
              <span className="text-red-600 line-through">
                {JSON.stringify(details.before[field])}
              </span>{' '}
              → <span className="text-green-600">{JSON.stringify(details.after[field])}</span>
            </div>
          ))}
        </div>
      )
    } else {
      // Show simple details for create/delete
      return (
        <div className="text-xs font-mono">
          {Object.entries(details).map(([key, value]) => (
            <div key={key}>
              <span className="text-gray-500">{key}:</span> {JSON.stringify(value)}
            </div>
          ))}
        </div>
      )
    }
  }

  // Calculate statistics
  const stats = {
    total: auditLogs.length,
    created: auditLogs.filter(l => l.action === 'CREATED').length,
    updated: auditLogs.filter(l => l.action === 'UPDATED').length,
    deleted: auditLogs.filter(l => l.action === 'DELETED').length,
    uniqueUsers: new Set(auditLogs.map(l => l.userId)).size
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Audit Trail
          </CardTitle>
          <CardDescription>
            Complete history of all changes made to this assignment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-5 gap-4">
            <Card className="border border-gray-300">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Total Events</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-green-300 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-green-700 mb-1">Created</p>
                  <p className="text-2xl font-bold text-green-800">{stats.created}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-blue-300 bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-blue-700 mb-1">Updated</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.updated}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-red-300 bg-red-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-red-700 mb-1">Deleted</p>
                  <p className="text-2xl font-bold text-red-800">{stats.deleted}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-300">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Contributors</p>
                  <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border border-gray-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Action</label>
                  <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Actions</SelectItem>
                      <SelectItem value="CREATED">Created</SelectItem>
                      <SelectItem value="UPDATED">Updated</SelectItem>
                      <SelectItem value="DELETED">Deleted</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="REOPENED">Reopened</SelectItem>
                      <SelectItem value="ACCESSED">Accessed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Entity Type</label>
                  <Select value={filterEntityType} onValueChange={setFilterEntityType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      {entityTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {formatEntityType(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <Input
                    placeholder="Search user or entity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log Table */}
          {filteredLogs.length > 0 ? (
            <div className="border-2 border-black rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-[180px]">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Timestamp
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                    <TableHead className="w-[150px]">Entity Type</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        User
                      </div>
                    </TableHead>
                    <TableHead>Change Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm font-mono">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <span className={`flex items-center gap-1 px-2 py-1 text-xs border rounded ${actionColors[log.action]}`}>
                          {actionIcons[log.action]}
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatEntityType(log.entityType)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{log.user.name}</p>
                          <p className="text-xs text-gray-500">{log.user.email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">
                              {log.user.role.replace('_', ' ')}
                            </span>
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[400px]">
                        {renderChangeDetails(log)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">
                  {auditLogs.length === 0
                    ? 'No audit logs available'
                    : 'No logs match your filters'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Export Info */}
          <Card className="border border-gray-300">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-2">Audit Trail Information:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>All changes are automatically logged with timestamp, user, and action details</li>
                  <li>Audit logs are immutable and cannot be edited or deleted</li>
                  <li>Logs are retained for compliance and traceability purposes</li>
                  <li>Use filters to narrow down specific events or time periods</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}