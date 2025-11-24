'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText, Calendar, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

export function ExportPanel() {
  const handleExport = (type) => {
    // Simulate export functionality
    const formats = {
      'Workshop Statistics': ['CSV', 'JSON', 'PDF'],
      'Communication Data': ['CSV', 'JSON'],
      'Schedule': ['ICS', 'CSV'],
      'Full Report': ['PDF', 'Excel'],
    }
    
    const format = formats[type]?.[0] || 'CSV'
    const filename = `${type.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`
    
    // Create a mock download
    const data = JSON.stringify({ type, exportedAt: new Date().toISOString(), data: 'Sample export data' }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(`${type} exported successfully!`, {
      description: `Downloaded as ${filename}`,
    })
  }

  return (
    <Card className="border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-card-foreground">Export Data</CardTitle>
        <CardDescription className="text-muted-foreground mt-1">
          Download your data in various formats
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-1.5 sm:grid-cols-2">
          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-1 p-2 hover:bg-accent/10"
            onClick={() => handleExport('Workshop Statistics')}
          >
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="font-semibold">Workshop Statistics</span>
            </div>
            <span className="text-xs text-muted-foreground">CSV, JSON, PDF</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-1 p-2 hover:bg-accent/10"
            onClick={() => handleExport('Communication Data')}
          >
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span className="font-semibold">Communication Data</span>
            </div>
            <span className="text-xs text-muted-foreground">CSV, JSON</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-1 p-2 hover:bg-accent/10"
            onClick={() => handleExport('Schedule')}
          >
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span className="font-semibold">Schedule</span>
            </div>
            <span className="text-xs text-muted-foreground">ICS, CSV</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-1 p-2 hover:bg-accent/10"
            onClick={() => handleExport('Full Report')}
          >
            <div className="flex items-center gap-1.5">
              <Download className="h-4 w-4" />
              <span className="font-semibold">Full Report</span>
            </div>
            <span className="text-xs text-muted-foreground">PDF, Excel</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

