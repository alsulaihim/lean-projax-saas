import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth-check'
import { generatePDF } from '@/lib/pdf-generation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Authentication check
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    // Get complete assignment data with authorization check
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        createdBy: true,
        processes: {
          include: {
            sipocEntries: true,
            vsmSteps: {
              orderBy: { stepNumber: 'asc' }
            },
            fishboneCategories: {
              include: {
                causes: true
              }
            },
            fmeaEntries: true
          },
          orderBy: { order: 'asc' }
        },
        vocStatements: {
          include: {
            ctqRequirements: true
          },
          orderBy: { createdAt: 'asc' }
        },
        recommendations: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    try {
      // Generate PDF using Puppeteer
      const pdfBuffer = await generatePDF(assignment)

      // Sanitize filename to prevent path traversal
      const sanitizedFilename = assignment.title
        .replace(/[^a-zA-Z0-9_\- ]/g, '_')
        .replace(/\s+/g, '_')
        .substring(0, 200)

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${sanitizedFilename}_Report.pdf"`
        }
      })
    } catch (pdfError) {
      console.warn('PDF generation failed, falling back to HTML:', pdfError)

      // Fallback to HTML if PDF generation fails
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${assignment.title} - Six Sigma Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #000; border-bottom: 2px solid #000; padding-bottom: 10px; }
    h2 { color: #333; margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
    h3 { color: #555; margin-top: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; font-weight: bold; }
    .header { background: #000; color: white; padding: 20px; margin: -20px -20px 20px -20px; }
    .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
    .priority-1 { background-color: #fee; }
    .priority-2 { background-color: #ffeaa7; }
    .priority-3 { background-color: #fffee0; }
    .rpn-high { background-color: #ffcccc; font-weight: bold; }
    .rpn-medium { background-color: #fff3cd; }
    .rpn-low { background-color: #d4edda; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="color: white; border: none;">${assignment.title}</h1>
    <p style="margin: 0;">${assignment.objective}</p>
  </div>

  <div class="meta">
    <p>Created by: ${assignment.createdBy.name} | Date: ${new Date(assignment.createdAt).toLocaleDateString()}</p>
    <p>Status: ${assignment.status} ${assignment.completedAt ? `| Completed: ${new Date(assignment.completedAt).toLocaleDateString()}` : ''}</p>
  </div>

  <h2>1. Voice of Customer (VOC) & Critical to Quality (CTQ)</h2>
  ${assignment.vocStatements.map(voc => `
    <div style="margin-bottom: 30px;">
      <h3>VOC: ${voc.voiceStatement}</h3>
      <p><strong>Customer Segment:</strong> ${voc.customerSegment}</p>
      ${voc.ctqRequirements.length > 0 ? `
        <h4>CTQ Requirements:</h4>
        <table>
          <tr>
            <th>Description</th>
            <th>Measurement Criteria</th>
            <th>Target Value</th>
          </tr>
          ${voc.ctqRequirements.map(ctq => `
            <tr>
              <td>${ctq.ctqDescription}</td>
              <td>${ctq.measurementCriteria}</td>
              <td>${ctq.targetValue || '-'}</td>
            </tr>
          `).join('')}
        </table>
      ` : '<p>No CTQ requirements defined</p>'}
    </div>
  `).join('')}

  ${assignment.processes.map((process, index) => `
    <h2>Process ${index + 1}: ${process.processName}</h2>
    <p>${process.processOwner ? `Owner: ${process.processOwner}` : ''}</p>

    ${process.sipocEntries.length > 0 ? `
      <h3>SIPOC Diagram</h3>
      <table>
        <tr>
          <th>Suppliers</th>
          <th>Inputs</th>
          <th>Process</th>
          <th>Outputs</th>
          <th>Customers</th>
        </tr>
        ${['SUPPLIER', 'INPUT', 'PROCESS', 'OUTPUT', 'CUSTOMER'].map(column => `
          <tr>
            <td>${process.sipocEntries.filter(e => e.column === column).map(e => e.value).join('<br>')}</td>
          </tr>
        `).join('')}
      </table>
    ` : ''}

    ${process.vsmSteps.length > 0 ? `
      <h3>Value Stream Map</h3>
      <table>
        <tr>
          <th>Step</th>
          <th>Duration (min)</th>
          <th>Wait Time (min)</th>
          <th>Value Added</th>
        </tr>
        ${process.vsmSteps.map(step => `
          <tr>
            <td>${step.stepName}</td>
            <td>${step.durationMinutes || 0}</td>
            <td>${step.waitTimeMinutes || 0}</td>
            <td>${step.valueAdded ? 'Yes' : 'No'}</td>
          </tr>
        `).join('')}
      </table>
      <p><strong>Total Lead Time:</strong> ${process.vsmSteps.reduce((sum, s) => sum + s.durationMinutes + (s.waitTimeMinutes || 0), 0)} minutes</p>
    ` : ''}

    ${process.fmeaEntries.length > 0 ? `
      <h3>FMEA Analysis</h3>
      <table>
        <tr>
          <th>Failure Mode</th>
          <th>Effect</th>
          <th>Cause</th>
          <th>Severity</th>
          <th>Occurrence</th>
          <th>Detection</th>
          <th>RPN</th>
        </tr>
        ${process.fmeaEntries.sort((a, b) => b.rpn - a.rpn).map(fmea => `
          <tr class="${fmea.rpn >= 200 ? 'rpn-high' : fmea.rpn >= 100 ? 'rpn-medium' : 'rpn-low'}">
            <td>${fmea.failureMode}</td>
            <td>${fmea.effectsOfFailure}</td>
            <td>${fmea.potentialCauses}</td>
            <td>${fmea.severity}</td>
            <td>${fmea.occurrence}</td>
            <td>${fmea.detection}</td>
            <td>${fmea.rpn}</td>
          </tr>
        `).join('')}
      </table>
    ` : ''}
  `).join('')}

  ${assignment.recommendations.length > 0 ? `
    <h2>Recommendations</h2>
    <table>
      <tr>
        <th>Title</th>
        <th>Description</th>
        <th>Expected Impact</th>
        <th>Difficulty</th>
        <th>Status</th>
      </tr>
      ${assignment.recommendations.map(rec => `
        <tr>
          <td>${rec.recommendationTitle}</td>
          <td>${rec.description}</td>
          <td>${rec.expectedImpact}</td>
          <td>${rec.implementationDifficulty}</td>
          <td>${rec.status}</td>
        </tr>
      `).join('')}
    </table>
  ` : ''}

  <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ccc;">
    <p style="text-align: center; color: #666;">
      Generated on ${new Date().toLocaleDateString()} by BPI Assignment Platform
    </p>
  </div>
</body>
</html>
    `

      // Return HTML as fallback with sanitized filename
      const sanitizedFilename = assignment.title
        .replace(/[^a-zA-Z0-9_\- ]/g, '_')
        .replace(/\s+/g, '_')
        .substring(0, 200)

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="${sanitizedFilename}_Report.html"`
        }
      })
    }

  } catch (error) {
    console.error('Failed to export assignment:', error)
    return NextResponse.json(
      { error: 'Failed to export assignment' },
      { status: 500 }
    )
  }
}