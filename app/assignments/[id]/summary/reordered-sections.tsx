              {/* 1. SIPOC Summary */}
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle>SIPOC Analysis</CardTitle>
                  <CardDescription>Suppliers, Inputs, Process, Outputs, Customers</CardDescription>
                </CardHeader>
                <CardContent>
                  {process.sipocEntries.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100">
                            <TableHead className="w-[120px]">Category</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {['SUPPLIER', 'INPUT', 'PROCESS', 'OUTPUT', 'CUSTOMER'].map(category => {
                            const entries = process.sipocEntries.filter(e => e.category === category)
                            return entries.map((entry, index) => (
                              <TableRow key={entry.id}>
                                {index === 0 && (
                                  <TableCell rowSpan={entries.length} className="font-medium align-top">
                                    <Badge variant="outline" className="w-full justify-center">
                                      {category}
                                    </Badge>
                                  </TableCell>
                                )}
                                <TableCell className="font-medium">{entry.item}</TableCell>
                                <TableCell>{entry.description || '-'}</TableCell>
                              </TableRow>
                            ))
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No SIPOC data available</p>
                  )}
                </CardContent>
              </Card>

              {/* 2. VSM Analysis */}
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle>Value Stream Mapping (VSM)</CardTitle>
                  <CardDescription>Process flow and time analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100">
                          <TableHead className="w-[50px]">#</TableHead>
                          <TableHead>Step Name</TableHead>
                          <TableHead className="text-center">Process Time</TableHead>
                          <TableHead className="text-center">Waiting Time</TableHead>
                          <TableHead className="text-center">Cycle Time</TableHead>
                          <TableHead>Value Measure</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {process.vsmSteps.map((step, index) => {
                          const processTime = step.processTime || step.durationMinutes || 0
                          const waitingTime = step.waitingTime || step.waitTimeMinutes || 0
                          const cycleTime = processTime + waitingTime

                          return (
                            <TableRow key={step.id}>
                              <TableCell className="text-center font-bold">{index + 1}</TableCell>
                              <TableCell className="font-medium">{step.stepName}</TableCell>
                              <TableCell className="text-center">{processTime} min</TableCell>
                              <TableCell className="text-center">{waitingTime} min</TableCell>
                              <TableCell className="text-center font-bold">{cycleTime} min</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getValueMeasureColor(step.valueMeasure)}>
                                  {step.valueMeasure.replace(/_/g, ' ')}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-500">Total Process Time</p>
                        <p className="text-lg font-bold">{metric.vsmMetrics.totalProcessTime} min</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Wait Time</p>
                        <p className="text-lg font-bold">{metric.vsmMetrics.totalWaitTime} min</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Value-Added Time</p>
                        <p className="text-lg font-bold text-green-600">{metric.vsmMetrics.valueAddedTime} min</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Non-Value-Added Time</p>
                        <p className="text-lg font-bold text-red-600">{metric.vsmMetrics.nonValueAddedTime} min</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Pareto Chart for this Process */}
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle>Pareto Analysis</CardTitle>
                  <CardDescription>80/20 analysis of process steps by cycle time</CardDescription>
                </CardHeader>
                <CardContent>
                  {metric.paretoData.items.length > 0 ? (
                    <ParetoChart
                      data={metric.paretoData.items.slice(0, 10).map(item => ({
                        name: item.name,
                        value: item.value,
                        cumulative: item.cumulativePercentage,
                        isVitalFew: item.isVitalFew
                      }))}
                      height={450}
                      showExport={false}
                    />
                  ) : (
                    <p className="text-center text-gray-500 py-8">No VSM data available for Pareto analysis</p>
                  )}
                </CardContent>
              </Card>

              {/* 4. Fishbone Summary */}
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle>Fishbone (Ishikawa) Analysis</CardTitle>
                  <CardDescription>Root cause analysis by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {process.fishboneCategories.map(category => (
                      <div key={category.id} className="border border-gray-300 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{category.categoryName}</h4>
                        <ul className="space-y-1">
                          {category.causes.map(cause => (
                            <li key={cause.id} className="text-sm flex items-start">
                              <ChevronRight className="h-4 w-4 text-gray-400 mt-0.5 mr-1 flex-shrink-0" />
                              <span>{cause.causeDescription}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {process.fishboneCategories.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No fishbone analysis data available</p>
                  )}
                </CardContent>
              </Card>

              {/* 5. FMEA Summary for this Process */}
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle>FMEA Risk Analysis</CardTitle>
                  <CardDescription>Failure modes and risk assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <Card className={`border ${metric.fmeaStats.high > 0 ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">High Risk</p>
                          <p className="text-2xl font-bold">{metric.fmeaStats.high}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className={`border ${metric.fmeaStats.medium > 0 ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'}`}>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Medium Risk</p>
                          <p className="text-2xl font-bold">{metric.fmeaStats.medium}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border border-green-500 bg-green-50">
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Low Risk</p>
                          <p className="text-2xl font-bold">{metric.fmeaStats.low}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {metric.fmeaStats.topRisks.length > 0 && (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100">
                            <TableHead>Failure Mode</TableHead>
                            <TableHead>Effects</TableHead>
                            <TableHead className="text-center">RPN</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {metric.fmeaStats.topRisks.map(fmea => (
                            <TableRow key={fmea.id}>
                              <TableCell className="font-medium">{fmea.failureMode}</TableCell>
                              <TableCell>{fmea.effectsOfFailure}</TableCell>
                              <TableCell className="text-center">
                                <Badge className={
                                  fmea.rpn >= 200 ? 'bg-red-600 text-white' :
                                  fmea.rpn >= 100 ? 'bg-yellow-600 text-white' :
                                  'bg-green-600 text-white'
                                }>
                                  {fmea.rpn}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 6. Process Capability */}
              {metric.capabilityData && (
                <Card className="border-2 border-black">
                  <CardHeader>
                    <CardTitle>Process Capability Analysis</CardTitle>
                    <CardDescription>Statistical process control metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <ProcessCapabilityChart
                          lowerSpec={process.lowerSpecLimit!}
                          upperSpec={process.upperSpecLimit!}
                          target={process.targetValue}
                          mean={process.sampleMean!}
                          stdDev={process.sampleStdDev!}
                          height={250}
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Cp (Potential)</p>
                            <p className="text-xl font-bold">{metric.capabilityData.cp?.toFixed(3) || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Cpk (Actual)</p>
                            <p className="text-xl font-bold">{metric.capabilityData.cpk?.toFixed(3) || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Sigma Level</p>
                            <p className="text-xl font-bold">{metric.capabilityData.sigmaLevel?.toFixed(1) || '-'}σ</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">PPM</p>
                            <p className="text-xl font-bold">{metric.capabilityData.ppm?.toFixed(0) || '-'}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                          <p className="text-sm font-medium mb-1">Process Status</p>
                          <Badge className={
                            metric.capabilityData.isCapable ? 'bg-green-600' : 'bg-red-600'
                          }>
                            {metric.capabilityData.isCapable ? 'CAPABLE' : 'NOT CAPABLE'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}