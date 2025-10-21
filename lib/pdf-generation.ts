import puppeteer from 'puppeteer'
import type {
  Assignment,
  Process,
  VOCStatement,
  Recommendation,
  User,
  SIPOCEntry,
  VSMStep,
  FishboneCategory,
  FishboneCause,
  FMEAEntry,
  CTQRequirement
} from '@prisma/client'
import { calculatePareto, getParetoInsights } from './calculations/pareto'

type FullAssignment = Assignment & {
  createdBy: User
  processes: (Process & {
    sipocEntries: SIPOCEntry[]
    vsmSteps: VSMStep[]
    fishboneCategories: (FishboneCategory & {
      causes: FishboneCause[]
    })[]
    fmeaEntries: FMEAEntry[]
  })[]
  vocStatements: (VOCStatement & {
    ctqRequirements: CTQRequirement[]
  })[]
  recommendations: Recommendation[]
}

// Escape HTML to prevent XSS
function escapeHtml(unsafe: string | null | undefined): string {
  if (!unsafe) return ''
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Sanitize filename to prevent path traversal
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9_\- ]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 200)
}

export async function generatePDF(assignment: FullAssignment): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    timeout: 30000 // 30 second timeout
  })

  try {
    const page = await browser.newPage()

    // Generate enhanced HTML with charts placeholders
    const html = generateEnhancedHTML(assignment)

    // Set content with timeout
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000 // 30 second timeout
    })

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="width: 100%; font-size: 10px; padding: 5px 20px; text-align: center; color: #666;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `,
      margin: {
        top: '12.7mm',
        right: '12.7mm',
        bottom: '12.7mm',
        left: '12.7mm'
      }
    })

    return pdf
  } finally {
    await browser.close()
  }
}

function generateEnhancedHTML(assignment: FullAssignment): string {
  // Calculate metrics
  const totalVSMSteps = assignment.processes.reduce((sum, p) => sum + p.vsmSteps.length, 0)
  const totalFMEAEntries = assignment.processes.reduce((sum, p) => sum + p.fmeaEntries.length, 0)
  const highRiskFMEA = assignment.processes
    .flatMap(p => p.fmeaEntries)
    .filter(f => f.rpn >= 200).length

  const totalCycleTime = assignment.processes.reduce((sum, p) =>
    sum + p.vsmSteps.reduce((s, step) => s + step.durationMinutes + (step.waitTimeMinutes || 0), 0), 0
  )

  const valueAddedTime = assignment.processes.reduce((sum, p) =>
    sum + p.vsmSteps.filter(s => s.valueAdded).reduce((s, step) => s + step.durationMinutes, 0), 0
  )

  const efficiency = totalCycleTime > 0 ? ((valueAddedTime / totalCycleTime) * 100).toFixed(1) : '0'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(assignment.title)} - Six Sigma Analysis Report</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 12.7mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
    }

    /* Cover Page */
    .cover-page {
      page-break-after: always;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #000 0%, #333 100%);
      color: white;
      text-align: center;
      padding: 40px;
      margin: -20mm;
    }

    .cover-page h1 {
      font-size: 48px;
      font-family: 'Aptos Display', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-weight: bold;
      color: #2D7864;
      margin-bottom: 20px;
      border: none;
    }

    .cover-page .subtitle {
      font-size: 24px;
      margin-bottom: 40px;
      opacity: 0.9;
    }

    .cover-page .meta {
      font-size: 16px;
      opacity: 0.8;
    }

    /* Executive Summary */
    .executive-summary {
      page-break-after: always;
      padding: 20px 0;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin: 20px 0;
    }

    .metric-card {
      border: 2px solid #000;
      padding: 15px;
      border-radius: 8px;
    }

    .metric-card .value {
      font-size: 32px;
      font-weight: bold;
      color: #000;
    }

    .metric-card .label {
      font-size: 14px;
      color: #666;
      margin-top: 5px;
    }

    /* Headers */
    h1 {
      font-size: 32px;
      color: #000;
      border-bottom: 3px solid #000;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }

    h2 {
      font-size: 24px;
      color: #333;
      margin-top: 30px;
      margin-bottom: 15px;
      padding: 10px;
      background: #f5f5f5;
      border-left: 4px solid #000;
    }

    h3 {
      font-size: 18px;
      color: #555;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 14px;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }

    th {
      background-color: #f8f9fa;
      font-weight: bold;
      color: #000;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    /* Status Badges */
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }

    .badge-draft { background: #e3e3e3; color: #666; }
    .badge-completed { background: #d4edda; color: #155724; }
    .badge-reopened { background: #fff3cd; color: #856404; }

    /* RPN Colors */
    .rpn-critical { background-color: #ffebee; color: #c62828; font-weight: bold; }
    .rpn-high { background-color: #fff3e0; color: #e65100; }
    .rpn-medium { background-color: #fff8e1; color: #f57c00; }
    .rpn-low { background-color: #f1f8e9; color: #558b2f; }

    /* Value Added Colors */
    .value-added { background-color: #e8f5e9; }
    .non-value-added { background-color: #ffebee; }

    /* Info Boxes */
    .info-box {
      border: 1px solid #2196F3;
      background: #e3f2fd;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }

    .warning-box {
      border: 1px solid #ff9800;
      background: #fff3e0;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }

    .success-box {
      border: 1px solid #4caf50;
      background: #e8f5e9;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }

    /* Page Breaks */
    .page-break {
      page-break-after: always;
    }

    /* Footer */
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 12px;
    }

    /* Charts & Visualizations */
    .chart-placeholder {
      border: 2px dashed #ccc;
      padding: 40px;
      text-align: center;
      color: #999;
      margin: 20px 0;
      background: #fafafa;
    }

    /* Pareto Chart Styles */
    .pareto-chart {
      margin: 30px 0;
      padding: 20px;
      background: white;
      border: 1px solid #ddd;
    }

    .pareto-bars {
      display: flex;
      align-items: flex-end;
      height: 300px;
      gap: 4px;
      margin: 20px 0;
      padding: 10px;
      border-bottom: 2px solid #000;
      border-left: 2px solid #000;
    }

    .pareto-bar {
      flex: 1;
      background: #dc2626;
      position: relative;
      min-height: 5px;
    }

    .pareto-bar.trivial {
      background: #3b82f6;
    }

    .pareto-bar-label {
      position: absolute;
      bottom: -30px;
      left: 0;
      right: 0;
      font-size: 9px;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transform: rotate(-45deg);
      transform-origin: top left;
    }

    .pareto-bar-value {
      position: absolute;
      top: -20px;
      left: 0;
      right: 0;
      font-size: 10px;
      text-align: center;
      font-weight: bold;
    }

    /* Fishbone Diagram Styles */
    .fishbone-diagram {
      margin: 30px 0;
      padding: 20px;
      background: white;
      position: relative;
      min-height: 400px;
    }

    .fishbone-spine {
      position: absolute;
      top: 50%;
      left: 10%;
      right: 10%;
      height: 3px;
      background: #000;
      transform: translateY(-50%);
    }

    .fishbone-head {
      position: absolute;
      right: 8%;
      top: 50%;
      transform: translateY(-50%);
      width: 80px;
      height: 80px;
      border: 3px solid #000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      font-size: 12px;
      font-weight: bold;
      text-align: center;
      padding: 10px;
    }

    .fishbone-category {
      position: absolute;
      width: 200px;
    }

    .fishbone-category.top {
      top: 5%;
    }

    .fishbone-category.bottom {
      bottom: 5%;
    }

    .fishbone-category h4 {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 8px;
      color: #dc2626;
    }

    .fishbone-category ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .fishbone-category li {
      font-size: 11px;
      padding: 3px 0;
      border-left: 2px solid #666;
      padding-left: 8px;
      margin-bottom: 4px;
    }

    .fishbone-bone {
      position: absolute;
      background: #666;
      transform-origin: left center;
    }

    .fishbone-bone.top {
      height: 2px;
      transform: rotate(-45deg);
    }

    .fishbone-bone.bottom {
      height: 2px;
      transform: rotate(45deg);
    }

    /* Process Capability Chart Styles */
    .capability-chart {
      margin: 30px 0;
      padding: 20px;
      background: white;
      border: 1px solid #ddd;
      position: relative;
      height: 350px;
    }

    .bell-curve-container {
      position: relative;
      height: 250px;
      margin: 30px 0;
    }

    .bell-curve {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      height: 200px;
    }

    .bell-curve svg {
      width: 100%;
      height: 100%;
    }

    .spec-limit-line {
      position: absolute;
      width: 2px;
      height: 100%;
      background: #dc2626;
      bottom: 0;
    }

    .spec-limit-line.lsl {
      left: 20%;
    }

    .spec-limit-line.usl {
      right: 20%;
    }

    .spec-limit-line.target {
      left: 50%;
      background: #16a34a;
      transform: translateX(-50%);
    }

    .spec-limit-label {
      position: absolute;
      top: -25px;
      font-size: 11px;
      font-weight: bold;
      white-space: nowrap;
      transform: translateX(-50%);
    }

    .capability-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin: 20px 0;
    }

    .capability-metric {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: center;
      border-radius: 4px;
    }

    .capability-metric .value {
      font-size: 24px;
      font-weight: bold;
      color: #000;
    }

    .capability-metric .label {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }

    .capability-rating {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }

    .capability-rating.excellent {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }

    .capability-rating.adequate {
      background: #dbeafe;
      color: #1e40af;
      border: 1px solid #93c5fd;
    }

    .capability-rating.marginal {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fcd34d;
    }

    .capability-rating.poor {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover-page">
    <h1>${escapeHtml(assignment.title)}</h1>
    <div class="subtitle">Six Sigma Analysis Report</div>
    <div class="objective">${escapeHtml(assignment.objective)}</div>
    <div class="meta">
      <p>Prepared by: ${escapeHtml(assignment.createdBy.name)}</p>
      <p>Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p>Status: <span class="badge badge-${assignment.status.toLowerCase()}">${assignment.status}</span></p>
    </div>
  </div>

  <!-- Section 1: Executive Summary -->
  <div class="executive-summary">
    <h1>Section 1: Executive Summary</h1>

    <div class="summary-grid">
      <div class="metric-card">
        <div class="value">${assignment.vocStatements.length}</div>
        <div class="label">Voice of Customer Statements</div>
      </div>
      <div class="metric-card">
        <div class="value">${assignment.vocStatements.reduce((sum, v) => sum + v.ctqRequirements.length, 0)}</div>
        <div class="label">CTQ Requirements</div>
      </div>
      <div class="metric-card">
        <div class="value">${totalVSMSteps}</div>
        <div class="label">Process Steps Analyzed</div>
      </div>
      <div class="metric-card">
        <div class="value">${efficiency}%</div>
        <div class="label">Process Efficiency</div>
      </div>
    </div>

    <div class="info-box">
      <h3>Key Findings</h3>
      <ul>
        <li>Total Cycle Time: ${Math.round(totalCycleTime / 60)} hours</li>
        <li>Value-Added Time: ${Math.round(valueAddedTime / 60)} hours</li>
        <li>Number of Processes: ${assignment.processes.length}</li>
        <li>High Risk Failure Modes (RPN ≥ 200): ${highRiskFMEA}</li>
        <li>Total FMEA Entries: ${totalFMEAEntries}</li>
        <li>Recommendations: ${assignment.recommendations.length}</li>
      </ul>
    </div>
  </div>

  <!-- Section 2: Assignment Insights -->
  <h1>Section 2: Assignment Insights</h1>
  <div class="info-box">
    <h3>Assignment Overview</h3>
    <p><strong>Objective:</strong> ${escapeHtml(assignment.objective)}</p>
    <p><strong>Status:</strong> ${escapeHtml(assignment.status)}</p>
    <p><strong>Created:</strong> ${new Date(assignment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    ${assignment.completedAt ? `<p><strong>Completed:</strong> ${new Date(assignment.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
  </div>

  <div class="summary-grid">
    <div class="metric-card">
      <div class="value">${assignment.processes.length}</div>
      <div class="label">Processes Analyzed</div>
    </div>
    <div class="metric-card">
      <div class="value">${Math.round(totalCycleTime / 60)}</div>
      <div class="label">Total Cycle Time (hours)</div>
    </div>
    <div class="metric-card">
      <div class="value">${totalFMEAEntries}</div>
      <div class="label">FMEA Entries</div>
    </div>
    <div class="metric-card">
      <div class="value">${assignment.recommendations.length}</div>
      <div class="label">Recommendations</div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- Section 3: Voice of Customer (VOC) & Critical to Quality (CTQ) -->
  <h1>Section 3: Voice of Customer (VOC) & Critical to Quality (CTQ)</h1>
  ${assignment.vocStatements.map(voc => `
    <div style="margin-bottom: 30px;">
      <h3>${escapeHtml(voc.voiceStatement)}</h3>
      <p><strong>Customer Segment:</strong> ${escapeHtml(voc.customerSegment)}</p>

      ${voc.ctqRequirements.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>CTQ Description</th>
              <th>Measurement Criteria</th>
              <th>Target Value</th>
            </tr>
          </thead>
          <tbody>
            ${voc.ctqRequirements.map(ctq => `
              <tr>
                <td>${escapeHtml(ctq.ctqDescription)}</td>
                <td>${escapeHtml(ctq.measurementCriteria)}</td>
                <td>${escapeHtml(ctq.targetValue) || 'Not specified'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p style="color: #666;">No CTQ requirements defined for this VOC statement.</p>'}
    </div>
  `).join('')}

  <div class="page-break"></div>

  <!-- Section 4: Process Analysis with SIPOC and Associated Tools -->
  ${assignment.processes.map((process, index) => `
    <h1>Section 4.${index + 1}: ${escapeHtml(process.processName)}</h1>
    ${process.processOwner ? `<p><strong>Process Owner:</strong> ${escapeHtml(process.processOwner)}</p>` : ''}

    <!-- SIPOC Analysis -->
    ${process.sipocEntries.length > 0 ? `
      <h2>SIPOC Analysis</h2>
      <table>
        <thead>
          <tr>
            <th>Suppliers</th>
            <th>Inputs</th>
            <th>Process</th>
            <th>Outputs</th>
            <th>Customers</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            ${['SUPPLIER', 'INPUT', 'PROCESS', 'OUTPUT', 'CUSTOMER'].map(col => `
              <td style="vertical-align: top;">
                ${process.sipocEntries
                  .filter(e => e.column === col)
                  .map(e => `• ${escapeHtml(e.value)}`)
                  .join('<br>')}
              </td>
            `).join('')}
          </tr>
        </tbody>
      </table>
    ` : ''}

    <!-- Pareto Analysis -->
    ${process.vsmSteps.length > 0 ? `
      <h2>Pareto Analysis - Cycle Time Distribution</h2>
      ${(() => {
        const allSteps = process.vsmSteps.map((step: VSMStep) => {
          const processTime = step.processTime ?? step.durationMinutes ?? 0
          const waitingTime = step.waitingTime ?? step.waitTimeMinutes ?? 0
          const isValueAdded = step.valueMeasure === 'VALUE_ADDED' ||
                              step.valueMeasure === 'ESSENTIAL_NON_VALUE' ||
                              step.valueAdded === true

          return {
            id: step.id,
            name: escapeHtml(step.stepName),
            value: processTime + waitingTime,
            category: isValueAdded ? 'Value-Added' : 'Non-Value-Added'
          }
        })

        const paretoResult = calculatePareto(allSteps)
        const insights = getParetoInsights(paretoResult)
        const maxValue = paretoResult.items.length > 0 ? paretoResult.items[0].value : 1

        return `
          <div class="pareto-chart">
            <div class="pareto-bars">
              ${paretoResult.items.slice(0, 10).map(item => `
                <div class="pareto-bar ${item.isVitalFew ? '' : 'trivial'}"
                     style="height: ${(item.value / maxValue) * 100}%;">
                  <div class="pareto-bar-value">${Math.round(item.value)}</div>
                  <div class="pareto-bar-label">${item.name.substring(0, 15)}</div>
                </div>
              `).join('')}
            </div>
            <div style="text-align: center; margin-top: 50px;">
              <p style="font-size: 12px; color: #666;">
                <span style="color: #dc2626;">■</span> Vital Few (80%) &nbsp;&nbsp;&nbsp;
                <span style="color: #3b82f6;">■</span> Trivial Many (20%)
              </p>
            </div>
          </div>

          <div class="info-box">
            <h4 style="margin-bottom: 10px;">Key Insights:</h4>
            <ul>
              ${insights.map(insight => `<li>${insight}</li>`).join('')}
            </ul>
          </div>

          <table style="margin-top: 20px;">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Step Name</th>
                <th>Time (min)</th>
                <th>% of Total</th>
                <th>Cumulative %</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              ${paretoResult.items.map(item => `
                <tr class="${item.isVitalFew ? 'rpn-critical' : ''}">
                  <td style="text-align: center; font-weight: bold;">${item.rank}</td>
                  <td>${item.name}</td>
                  <td style="text-align: center;">${Math.round(item.value)}</td>
                  <td style="text-align: center;">${item.percentage.toFixed(1)}%</td>
                  <td style="text-align: center; font-weight: bold;">${item.cumulativePercentage.toFixed(1)}%</td>
                  <td>
                    ${item.isVitalFew
                      ? '<span style="background: #fee; padding: 2px 8px; border-radius: 4px; font-size: 11px;">Vital Few</span>'
                      : '<span style="background: #e3f2fd; padding: 2px 8px; border-radius: 4px; font-size: 11px;">Trivial Many</span>'
                    }
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `
      })()}
    ` : ''}

    <!-- Value Stream Map -->
    ${process.vsmSteps.length > 0 ? `
      <h2>Value Stream Mapping</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Step Name</th>
            <th>Duration (min)</th>
            <th>Wait Time (min)</th>
            <th>Total Time (min)</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          ${process.vsmSteps.map(step => {
            const totalTime = step.durationMinutes + (step.waitTimeMinutes || 0)
            return `
              <tr class="${step.valueAdded ? 'value-added' : 'non-value-added'}">
                <td>${step.stepNumber}</td>
                <td>${escapeHtml(step.stepName)}</td>
                <td>${step.durationMinutes}</td>
                <td>${step.waitTimeMinutes || 0}</td>
                <td><strong>${totalTime}</strong></td>
                <td>${step.valueAdded ? '✓ Value-Added' : '✗ Non-Value'}</td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>

      <div class="info-box">
        <strong>VSM Metrics:</strong>
        <ul>
          <li>Total Lead Time: ${process.vsmSteps.reduce((sum, s) => sum + s.durationMinutes + (s.waitTimeMinutes || 0), 0)} minutes</li>
          <li>Value-Added Time: ${process.vsmSteps.filter(s => s.valueAdded).reduce((sum, s) => sum + s.durationMinutes, 0)} minutes</li>
          <li>Process Efficiency: ${
            (() => {
              const total = process.vsmSteps.reduce((sum, s) => sum + s.durationMinutes + (s.waitTimeMinutes || 0), 0)
              const valueAdded = process.vsmSteps.filter(s => s.valueAdded).reduce((sum, s) => sum + s.durationMinutes, 0)
              return total > 0 ? ((valueAdded / total) * 100).toFixed(1) : '0'
            })()
          }%</li>
        </ul>
      </div>
    ` : ''}

    <!-- Fishbone Diagram -->
    ${process.fishboneCategories && process.fishboneCategories.length > 0 ? `
      <h2>Fishbone Diagram (Cause and Effect Analysis)</h2>
      <div class="fishbone-diagram">
        <!-- Spine -->
        <div class="fishbone-spine"></div>

        <!-- Head (Problem/Effect) -->
        <div class="fishbone-head">Problem Effect</div>

        <!-- Categories -->
        ${(() => {
          const categories = ['PEOPLE', 'PROCESS', 'EQUIPMENT', 'MATERIALS', 'ENVIRONMENT', 'MANAGEMENT']
          const positions = [
            { left: '15%', top: true },
            { left: '30%', top: false },
            { left: '45%', top: true },
            { left: '15%', top: false },
            { left: '30%', top: true },
            { left: '45%', top: false }
          ]

          return categories.map((cat, idx) => {
            const categoryData = process.fishboneCategories.find((c) => c.category === cat)
            const causes = categoryData?.causes || []
            const position = positions[idx]

            const categoryLabels: Record<string, string> = {
              PEOPLE: 'People',
              PROCESS: 'Process',
              EQUIPMENT: 'Equipment',
              MATERIALS: 'Materials',
              ENVIRONMENT: 'Environment',
              MANAGEMENT: 'Management'
            }

            return `
              <div class="fishbone-category ${position.top ? 'top' : 'bottom'}"
                   style="left: ${position.left};">
                <h4>${categoryLabels[cat] || cat}</h4>
                ${causes.length > 0 ? `
                  <ul>
                    ${causes.slice(0, 5).map((cause: FishboneCause) => `
                      <li>${escapeHtml(cause.causeDescription)}</li>
                    `).join('')}
                  </ul>
                ` : '<p style="font-size: 11px; color: #999;">No causes identified</p>'}
              </div>
              <!-- Bone line -->
              <div class="fishbone-bone ${position.top ? 'top' : 'bottom'}"
                   style="left: ${position.left}; width: 80px; top: ${position.top ? '40%' : '60%'};"></div>
            `
          }).join('')
        })()}
      </div>

      <!-- Fishbone Summary Table -->
      <table style="margin-top: 30px;">
        <thead>
          <tr>
            <th>Category</th>
            <th>Identified Causes</th>
          </tr>
        </thead>
        <tbody>
          ${['PEOPLE', 'PROCESS', 'EQUIPMENT', 'MATERIALS', 'ENVIRONMENT', 'MANAGEMENT'].map(cat => {
            const categoryData = process.fishboneCategories.find((c) => c.category === cat)
            const causes = categoryData?.causes || []
            const categoryLabels: Record<string, string> = {
              PEOPLE: 'People (Manpower)',
              PROCESS: 'Process (Method)',
              EQUIPMENT: 'Equipment (Machine)',
              MATERIALS: 'Materials',
              ENVIRONMENT: 'Environment',
              MANAGEMENT: 'Management (Measurement)'
            }

            return `
              <tr>
                <td style="font-weight: bold;">${categoryLabels[cat] || cat}</td>
                <td>
                  ${causes.length > 0
                    ? causes.map((c: FishboneCause) => `• ${escapeHtml(c.causeDescription)}`).join('<br>')
                    : '<em style="color: #999;">No causes identified</em>'
                  }
                </td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
    ` : ''}

    <!-- FMEA -->
    ${process.fmeaEntries.length > 0 ? `
      <h2>Failure Mode and Effects Analysis (FMEA)</h2>
      <table>
        <thead>
          <tr>
            <th>Failure Mode</th>
            <th>Effects</th>
            <th>Causes</th>
            <th>S</th>
            <th>O</th>
            <th>D</th>
            <th>RPN</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${process.fmeaEntries
            .sort((a, b) => b.rpn - a.rpn)
            .map(fmea => {
              let rpnClass = ''
              if (fmea.rpn >= 200) rpnClass = 'rpn-critical'
              else if (fmea.rpn >= 150) rpnClass = 'rpn-high'
              else if (fmea.rpn >= 100) rpnClass = 'rpn-medium'
              else rpnClass = 'rpn-low'

              return `
                <tr>
                  <td>${escapeHtml(fmea.failureMode)}</td>
                  <td>${escapeHtml(fmea.effectsOfFailure)}</td>
                  <td>${escapeHtml(fmea.potentialCauses)}</td>
                  <td style="text-align: center;">${fmea.severity}</td>
                  <td style="text-align: center;">${fmea.occurrence}</td>
                  <td style="text-align: center;">${fmea.detection}</td>
                  <td class="${rpnClass}" style="text-align: center; font-weight: bold;">${fmea.rpn}</td>
                  <td>${escapeHtml(fmea.recommendedActions) || 'TBD'}</td>
                </tr>
              `
            }).join('')}
        </tbody>
      </table>
    ` : ''}

    <!-- Process Capability -->
    ${(process.lowerSpecLimit !== null || process.upperSpecLimit !== null) ? `
      <h2>Process Capability Analysis</h2>
      ${(() => {
        const lsl = process.lowerSpecLimit
        const usl = process.upperSpecLimit
        const target = process.targetValue
        const mean = process.sampleMean
        const stdDev = process.sampleStdDev

        let cp = null
        let cpk = null
        let rating = 'Not Calculated'
        let ratingClass = 'poor'

        if (lsl !== null && usl !== null && stdDev !== null && stdDev > 0) {
          cp = (usl - lsl) / (6 * stdDev)
        }

        if (lsl !== null && usl !== null && mean !== null && stdDev !== null && stdDev > 0) {
          const cpkLower = (mean - lsl) / (3 * stdDev)
          const cpkUpper = (usl - mean) / (3 * stdDev)
          cpk = Math.min(cpkLower, cpkUpper)

          if (cpk >= 2.0) {
            rating = 'Excellent (6σ)'
            ratingClass = 'excellent'
          } else if (cpk >= 1.33) {
            rating = 'Adequate'
            ratingClass = 'adequate'
          } else if (cpk >= 1.0) {
            rating = 'Marginal'
            ratingClass = 'marginal'
          } else {
            rating = 'Poor'
            ratingClass = 'poor'
          }
        }

        return `
          <!-- Capability Metrics -->
          <div class="capability-metrics">
            <div class="capability-metric">
              <div class="value">${cp !== null ? cp.toFixed(3) : 'N/A'}</div>
              <div class="label">Cp (Process Capability)</div>
            </div>
            <div class="capability-metric">
              <div class="value">${cpk !== null ? cpk.toFixed(3) : 'N/A'}</div>
              <div class="label">Cpk (Process Performance)</div>
            </div>
            <div class="capability-metric">
              <div class="capability-rating ${ratingClass}">${rating}</div>
              <div class="label">Capability Rating</div>
            </div>
          </div>

          <!-- Bell Curve Visualization -->
          ${mean !== null && stdDev !== null ? `
            <div class="capability-chart">
              <h3 style="text-align: center; margin-bottom: 20px;">Process Distribution</h3>
              <div class="bell-curve-container">
                <!-- LSL Line -->
                ${lsl !== null ? `
                  <div class="spec-limit-line lsl">
                    <div class="spec-limit-label" style="left: 0; color: #dc2626;">LSL: ${lsl}</div>
                  </div>
                ` : ''}

                <!-- Target Line -->
                ${target !== null ? `
                  <div class="spec-limit-line target">
                    <div class="spec-limit-label" style="left: 0; color: #16a34a;">Target: ${target}</div>
                  </div>
                ` : ''}

                <!-- USL Line -->
                ${usl !== null ? `
                  <div class="spec-limit-line usl">
                    <div class="spec-limit-label" style="right: 0; left: auto; color: #dc2626;">USL: ${usl}</div>
                  </div>
                ` : ''}

                <!-- Bell Curve (approximation using CSS) -->
                <div class="bell-curve">
                  <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                    <!-- Draw bell curve using path -->
                    <path d="M 0,200 Q 0,150 50,100 T 100,60 T 150,40 T 200,30 T 250,40 T 300,60 T 350,100 T 400,150 L 400,200 Z"
                          fill="rgba(59, 130, 246, 0.3)"
                          stroke="rgb(59, 130, 246)"
                          stroke-width="2"/>
                    <!-- Mean line -->
                    <line x1="200" y1="30" x2="200" y2="200" stroke="#000" stroke-width="2" stroke-dasharray="5,5"/>
                    <text x="200" y="20" text-anchor="middle" font-size="12" font-weight="bold">μ = ${mean.toFixed(2)}</text>
                    <!-- Sigma indicators -->
                    <text x="200" y="190" text-anchor="middle" font-size="10" fill="#666">σ = ${stdDev.toFixed(2)}</text>
                  </svg>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Detailed Specification Table -->
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>LSL</strong></td><td>${lsl ?? 'Not defined'}</td><td>Lower Specification Limit</td></tr>
              <tr><td><strong>USL</strong></td><td>${usl ?? 'Not defined'}</td><td>Upper Specification Limit</td></tr>
              <tr><td><strong>Target</strong></td><td>${target ?? 'Not defined'}</td><td>Target Value</td></tr>
              <tr><td><strong>x̄ (Mean)</strong></td><td>${mean ?? 'Not measured'}</td><td>Sample Mean</td></tr>
              <tr><td><strong>σ (Std Dev)</strong></td><td>${stdDev ?? 'Not measured'}</td><td>Sample Standard Deviation</td></tr>
              <tr style="background: #f5f5f5;">
                <td><strong>Cp</strong></td>
                <td><strong>${cp !== null ? cp.toFixed(3) : 'N/A'}</strong></td>
                <td>Process Capability Index (potential)</td>
              </tr>
              <tr style="background: #f5f5f5;">
                <td><strong>Cpk</strong></td>
                <td><strong>${cpk !== null ? cpk.toFixed(3) : 'N/A'}</strong></td>
                <td>Process Performance Index (actual)</td>
              </tr>
            </tbody>
          </table>

          <!-- Interpretation Guide -->
          <div class="info-box" style="margin-top: 20px;">
            <h4>Capability Interpretation:</h4>
            <ul style="margin-top: 10px;">
              <li><strong>Cpk ≥ 2.0:</strong> Excellent (6 Sigma) - World-class performance</li>
              <li><strong>Cpk ≥ 1.33:</strong> Adequate - Process is capable</li>
              <li><strong>Cpk ≥ 1.0:</strong> Marginal - Process needs improvement</li>
              <li><strong>Cpk < 1.0:</strong> Poor - Process is not capable</li>
            </ul>
          </div>
        `
      })()}
    ` : ''}

    <div class="page-break"></div>
  `).join('')}

  <!-- Recommendations -->
  ${assignment.recommendations.length > 0 ? `
    <h1>Recommendations</h1>
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>Expected Impact</th>
          <th>Difficulty</th>
          <th>Cost Savings</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${assignment.recommendations.map(rec => `
          <tr>
            <td><strong>${escapeHtml(rec.recommendationTitle)}</strong></td>
            <td>${escapeHtml(rec.description)}</td>
            <td>${escapeHtml(rec.expectedImpact)}</td>
            <td>${escapeHtml(rec.implementationDifficulty)}</td>
            <td>${escapeHtml(rec.estimatedCostSavings) || 'TBD'}</td>
            <td><span class="badge badge-${rec.status.toLowerCase()}">${escapeHtml(rec.status)}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : ''}

  <!-- Footer -->
  <div class="footer">
    <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
    <p>BPI Assignment Platform - Six Sigma Analysis Report</p>
    <p>© ${new Date().getFullYear()} All rights reserved</p>
  </div>
</body>
</html>
  `
}